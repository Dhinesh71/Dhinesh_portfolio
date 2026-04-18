import {
    ADMIN_SESSION_PASSCODE_KEY,
    CONTENT_META_STORAGE_KEY,
    CONTENT_STORAGE_KEY,
} from "./contentAdmin";

export const REMOTE_STATUS = {
    LOCAL_ONLY: "local_only",
    REMOTE_READY: "remote_ready",
    SAVING: "saving",
    SAVED: "saved",
    ERROR: "error",
    OFFLINE: "offline",
};

const safeJsonParse = (value, fallbackValue) => {
    try {
        return value ? JSON.parse(value) : fallbackValue;
    } catch {
        return fallbackValue;
    }
};

export const createPersistenceState = (storedMeta = {}) => ({
    status: storedMeta.status || REMOTE_STATUS.LOCAL_ONLY,
    remoteAvailable: Boolean(storedMeta.remoteAvailable),
    hasPendingSync: Boolean(storedMeta.hasPendingSync),
    isHydrating: true,
    isSaving: false,
    isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
    lastLocalSaveAt: storedMeta.lastLocalSaveAt || null,
    lastRemoteSaveAt: storedMeta.lastRemoteSaveAt || null,
    lastRemoteLoadAt: storedMeta.lastRemoteLoadAt || null,
    lastError: "",
});

export const loadPersistenceMeta = () => {
    if (typeof window === "undefined") {
        return {};
    }

    return safeJsonParse(window.localStorage.getItem(CONTENT_META_STORAGE_KEY), {});
};

export const savePersistenceMeta = (meta) => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(CONTENT_META_STORAGE_KEY, JSON.stringify(meta));
};

export const saveContentLocally = (content) => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
};

export const getAdminSessionPasscode = () => {
    if (typeof window === "undefined") {
        return "";
    }

    return window.sessionStorage.getItem(ADMIN_SESSION_PASSCODE_KEY) || "";
};

const parseApiResponse = async (response) => {
    const payload = await response.json().catch(() => ({}));
    return payload;
};

export const fetchRemoteSiteContent = async (signal) => {
    const response = await fetch("/api/site-content", {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
        signal,
    });

    const payload = await parseApiResponse(response);

    if (response.status === 404 || response.status === 503) {
        return {
            available: false,
            content: null,
            updatedAt: null,
            error: payload.error || "Remote persistence is not configured.",
        };
    }

    if (!response.ok) {
        throw new Error(payload.error || "Unable to load site content from the server.");
    }

    return {
        available: true,
        content: payload.content ?? null,
        updatedAt: payload.updatedAt ?? null,
    };
};

export const saveRemoteSiteContent = async ({ content, passcode }) => {
    if (!passcode) {
        return {
            saved: false,
            error: "Unlock the admin panel to publish changes.",
            code: "missing_passcode",
        };
    }

    const response = await fetch("/api/site-content", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            content,
            passcode,
        }),
    });

    const payload = await parseApiResponse(response);

    if (response.status === 404 || response.status === 503) {
        return {
            saved: false,
            error: payload.error || "Remote persistence is not configured on the server.",
            code: "remote_not_configured",
        };
    }

    if (!response.ok) {
        return {
            saved: false,
            error: payload.error || "Unable to publish changes.",
            code: payload.code || "save_failed",
        };
    }

    return {
        saved: true,
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
    };
};

export const formatSyncTime = (value) => {
    if (!value) {
        return "Never";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Never";
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};
