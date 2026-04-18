import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { defaultSiteContent } from "../data/content";
import {
    CONTENT_STORAGE_KEY,
    LEGACY_CONTENT_STORAGE_KEYS,
    createArrayItem,
    deepClone,
    getByPath,
    mergeWithTemplate,
    moveItem,
    setByPath,
} from "../utils/contentAdmin";
import {
    buildTimelineItemsFromSections,
    normalizeTimelineItems,
} from "../utils/timelineContent";
import {
    createPersistenceState,
    fetchRemoteSiteContent,
    getAdminSessionPasscode,
    loadPersistenceMeta,
    REMOTE_STATUS,
    saveContentLocally,
    savePersistenceMeta,
    saveRemoteSiteContent,
} from "../utils/contentPersistence";

const ContentContext = createContext(null);
const REMOTE_SYNC_DELAY_MS = 700;

const getStoredContent = () => {
    const storageKeys = [CONTENT_STORAGE_KEY, ...LEGACY_CONTENT_STORAGE_KEYS];

    for (const storageKey of storageKeys) {
        const storedValue = window.localStorage.getItem(storageKey);

        if (!storedValue) {
            continue;
        }

        return JSON.parse(storedValue);
    }

    return null;
};

const normalizeContentShape = (incomingContent) => {
    const mergedContent = mergeWithTemplate(defaultSiteContent, incomingContent);
    const timelineTemplateLink = defaultSiteContent.navigation.links.find((link) => link.to === "timeline");

    const cleanedNavigationLinks = (mergedContent.navigation?.links || [])
        .filter((link) => link?.to !== "hackathons" && link?.to !== "education")
        .map((link) => (link?.to === "timeline" ? { ...timelineTemplateLink, ...link } : link));

    const hasTimelineLink = cleanedNavigationLinks.some((link) => link?.to === "timeline");
    const timelineInsertIndex = cleanedNavigationLinks.findIndex((link) => link?.to === "projects");
    const safeTimelineInsertIndex =
        timelineInsertIndex === -1 ? cleanedNavigationLinks.length : timelineInsertIndex + 1;
    const navigationLinks = hasTimelineLink
        ? cleanedNavigationLinks
        : [
            ...cleanedNavigationLinks.slice(0, safeTimelineInsertIndex),
            timelineTemplateLink,
            ...cleanedNavigationLinks.slice(safeTimelineInsertIndex),
        ];

    const currentTimelineItems = normalizeTimelineItems(mergedContent.timeline?.items);
    const generatedTimelineItems = buildTimelineItemsFromSections({
        hackathons: mergedContent.hackathons,
        education: mergedContent.education,
    });

    return {
        ...mergedContent,
        navigation: {
            ...mergedContent.navigation,
            links: navigationLinks,
        },
        hackathons: {
            ...mergedContent.hackathons,
            enabled: false,
        },
        education: {
            ...mergedContent.education,
            enabled: false,
        },
        timeline: {
            ...mergedContent.timeline,
            enabled: mergedContent.timeline?.enabled ?? true,
            items: currentTimelineItems.length > 0 ? currentTimelineItems : generatedTimelineItems,
        },
    };
};

const derivePersistenceState = (state) => {
    if (state.isOffline) {
        return {
            ...state,
            status: REMOTE_STATUS.OFFLINE,
        };
    }

    if (state.isSaving) {
        return {
            ...state,
            status: REMOTE_STATUS.SAVING,
        };
    }

    if (state.lastError) {
        return {
            ...state,
            status: REMOTE_STATUS.ERROR,
        };
    }

    if (!state.remoteAvailable) {
        return {
            ...state,
            status: REMOTE_STATUS.LOCAL_ONLY,
        };
    }

    if (!state.hasPendingSync && state.lastRemoteSaveAt) {
        return {
            ...state,
            status: REMOTE_STATUS.SAVED,
        };
    }

    return {
        ...state,
        status: REMOTE_STATUS.REMOTE_READY,
    };
};

const getInitialContent = () => {
    if (typeof window === "undefined") {
        return deepClone(defaultSiteContent);
    }

    try {
        const storedContent = getStoredContent();

        if (!storedContent) {
            return normalizeContentShape(defaultSiteContent);
        }

        return normalizeContentShape(storedContent);
    } catch (error) {
        console.warn("Failed to restore site content. Falling back to defaults.", error);
        return normalizeContentShape(defaultSiteContent);
    }
};

const getInitialPersistence = () =>
    derivePersistenceState(createPersistenceState(loadPersistenceMeta()));

export const ContentProvider = ({ children }) => {
    const [content, setContent] = useState(getInitialContent);
    const [persistence, setPersistence] = useState(getInitialPersistence);
    const skipPendingSyncRef = useRef(true);

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        const syncOnlineState = () => {
            setPersistence((previousState) =>
                derivePersistenceState({
                    ...previousState,
                    isOffline: !navigator.onLine,
                })
            );
        };

        syncOnlineState();
        window.addEventListener("online", syncOnlineState);
        window.addEventListener("offline", syncOnlineState);

        return () => {
            window.removeEventListener("online", syncOnlineState);
            window.removeEventListener("offline", syncOnlineState);
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        const metaToPersist = {
            status: persistence.status,
            remoteAvailable: persistence.remoteAvailable,
            hasPendingSync: persistence.hasPendingSync,
            lastLocalSaveAt: persistence.lastLocalSaveAt,
            lastRemoteSaveAt: persistence.lastRemoteSaveAt,
            lastRemoteLoadAt: persistence.lastRemoteLoadAt,
        };

        savePersistenceMeta(metaToPersist);
        return undefined;
    }, [
        persistence.hasPendingSync,
        persistence.lastLocalSaveAt,
        persistence.lastRemoteLoadAt,
        persistence.lastRemoteSaveAt,
        persistence.remoteAvailable,
        persistence.status,
    ]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        saveContentLocally(content);

        setPersistence((previousState) => {
            const now = new Date().toISOString();
            const shouldKeepPendingState = skipPendingSyncRef.current;
            skipPendingSyncRef.current = false;

            return derivePersistenceState({
                ...previousState,
                lastLocalSaveAt: now,
                hasPendingSync: shouldKeepPendingState ? previousState.hasPendingSync : true,
                lastError: shouldKeepPendingState ? previousState.lastError : "",
            });
        });

        return undefined;
    }, [content]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        const controller = new AbortController();

        const hydrateFromRemote = async () => {
            try {
                const remoteResult = await fetchRemoteSiteContent(controller.signal);

                if (!remoteResult.available) {
                    setPersistence((previousState) =>
                        derivePersistenceState({
                            ...previousState,
                            remoteAvailable: false,
                            isHydrating: false,
                        })
                    );
                    return;
                }

                const storedMeta = loadPersistenceMeta();
                const hasPendingLocalChanges = Boolean(storedMeta.hasPendingSync);
                const remoteTimestamp = remoteResult.updatedAt || new Date().toISOString();

                setPersistence((previousState) =>
                    derivePersistenceState({
                        ...previousState,
                        remoteAvailable: true,
                        isHydrating: false,
                        lastRemoteLoadAt: remoteTimestamp,
                        lastError: "",
                    })
                );

                if (!hasPendingLocalChanges && remoteResult.content) {
                    skipPendingSyncRef.current = true;
                    setContent(normalizeContentShape(remoteResult.content));
                    setPersistence((previousState) =>
                        derivePersistenceState({
                            ...previousState,
                            remoteAvailable: true,
                            isHydrating: false,
                            hasPendingSync: false,
                            lastRemoteLoadAt: remoteTimestamp,
                            lastRemoteSaveAt: remoteTimestamp,
                            lastError: "",
                        })
                    );
                }
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setPersistence((previousState) =>
                    derivePersistenceState({
                        ...previousState,
                        remoteAvailable: false,
                        isHydrating: false,
                        lastError: error.message || "Unable to connect to remote storage.",
                    })
                );
            }
        };

        hydrateFromRemote();

        return () => controller.abort();
    }, []);

    const persistNow = useCallback(async () => {
        const passcode = getAdminSessionPasscode();

        if (!passcode) {
            const message = "Unlock the admin panel before publishing changes.";
            setPersistence((previousState) =>
                derivePersistenceState({
                    ...previousState,
                    lastError: message,
                })
            );
            return { ok: false, message };
        }

        if (typeof navigator !== "undefined" && !navigator.onLine) {
            const message = "You are offline. Changes were kept locally and will sync later.";
            setPersistence((previousState) =>
                derivePersistenceState({
                    ...previousState,
                    isOffline: true,
                    lastError: message,
                })
            );
            return { ok: false, message };
        }

        setPersistence((previousState) =>
            derivePersistenceState({
                ...previousState,
                isSaving: true,
                lastError: "",
            })
        );

        try {
            const result = await saveRemoteSiteContent({ content, passcode });

            if (!result.saved) {
                const remoteNotConfigured = result.code === "remote_not_configured";
                setPersistence((previousState) =>
                    derivePersistenceState({
                        ...previousState,
                        isSaving: false,
                        remoteAvailable: remoteNotConfigured
                            ? false
                            : previousState.remoteAvailable,
                        lastError: remoteNotConfigured
                            ? ""
                            : (result.error || "Unable to publish changes."),
                    })
                );
                return { ok: false, message: result.error || "Unable to publish changes." };
            }

            setPersistence((previousState) =>
                derivePersistenceState({
                    ...previousState,
                    remoteAvailable: true,
                    hasPendingSync: false,
                    isSaving: false,
                    lastRemoteSaveAt: result.updatedAt,
                    lastError: "",
                })
            );

            return { ok: true, message: "Changes published successfully." };
        } catch (error) {
            const message = error.message || "Unable to publish changes.";
            setPersistence((previousState) =>
                derivePersistenceState({
                    ...previousState,
                    isSaving: false,
                    lastError: message,
                })
            );
            return { ok: false, message };
        }
    }, [content]);

    useEffect(() => {
        if (
            !persistence.hasPendingSync ||
            persistence.isSaving ||
            persistence.isHydrating ||
            persistence.isOffline ||
            !persistence.remoteAvailable ||
            !getAdminSessionPasscode()
        ) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            persistNow();
        }, REMOTE_SYNC_DELAY_MS);

        return () => window.clearTimeout(timeoutId);
    }, [
        content,
        persistNow,
        persistence.hasPendingSync,
        persistence.isHydrating,
        persistence.isOffline,
        persistence.isSaving,
        persistence.remoteAvailable,
    ]);

    const updateValue = useCallback((path, nextValue) => {
        setContent((previousContent) => setByPath(previousContent, path, nextValue));
    }, []);

    const addArrayItem = useCallback((path) => {
        setContent((previousContent) => {
            const currentArray = getByPath(previousContent, path);
            if (!Array.isArray(currentArray)) {
                return previousContent;
            }

            const nextItem = createArrayItem(defaultSiteContent, previousContent, path);
            return setByPath(previousContent, path, [...currentArray, nextItem]);
        });
    }, []);

    const removeArrayItem = useCallback((path, index) => {
        setContent((previousContent) => {
            const currentArray = getByPath(previousContent, path);
            if (!Array.isArray(currentArray)) {
                return previousContent;
            }

            return setByPath(
                previousContent,
                path,
                currentArray.filter((_, currentIndex) => currentIndex !== index)
            );
        });
    }, []);

    const moveArrayItem = useCallback((path, fromIndex, toIndex) => {
        setContent((previousContent) => {
            const currentArray = getByPath(previousContent, path);
            if (!Array.isArray(currentArray)) {
                return previousContent;
            }

            return setByPath(previousContent, path, moveItem(currentArray, fromIndex, toIndex));
        });
    }, []);

    const replaceContent = useCallback((nextContent) => {
        setContent(normalizeContentShape(nextContent));
    }, []);

    const resetContent = useCallback(() => {
        setContent(normalizeContentShape(defaultSiteContent));
    }, []);

    const value = useMemo(() => ({
        content,
        persistence,
        updateValue,
        addArrayItem,
        removeArrayItem,
        moveArrayItem,
        replaceContent,
        resetContent,
        persistNow,
    }), [
        addArrayItem,
        content,
        moveArrayItem,
        persistence,
        persistNow,
        removeArrayItem,
        replaceContent,
        resetContent,
        updateValue,
    ]);

    return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => {
    const context = useContext(ContentContext);

    if (!context) {
        throw new Error("useContent must be used inside a ContentProvider.");
    }

    return context;
};
