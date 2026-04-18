import React, {
    memo,
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { createPortal } from "react-dom";
import {
    FaArrowDown,
    FaArrowUp,
    FaCertificate,
    FaCheck,
    FaCloudUploadAlt,
    FaColumns,
    FaCompass,
    FaCopy,
    FaDownload,
    FaEnvelope,
    FaFileImport,
    FaGlobe,
    FaLock,
    FaPlus,
    FaRocket,
    FaProjectDiagram,
    FaTimes,
    FaTools,
    FaTrash,
    FaUndo,
    FaUnlockAlt,
    FaUser,
} from "react-icons/fa";
import { useContent } from "../../context/ContentContext";
import {
    ADMIN_PASSCODE,
    ADMIN_SESSION_KEY,
    ADMIN_SESSION_PASSCODE_KEY,
    humanizeKey,
    isPlainObject,
} from "../../utils/contentAdmin";
import {
    formatSyncTime,
    REMOTE_STATUS,
} from "../../utils/contentPersistence";

const editorSections = [
    {
        key: "site",
        label: "Site Settings",
        icon: FaGlobe,
        description: "Update global metadata, branding, and portfolio-wide settings.",
    },
    {
        key: "navigation",
        label: "Navigation",
        icon: FaCompass,
        description: "Control menu labels, section links, and navigation structure.",
    },
    {
        key: "hero",
        label: "Hero Section",
        icon: FaRocket,
        description: "Edit the landing headline, intro copy, and call-to-action details.",
    },
    {
        key: "about",
        label: "About Me",
        icon: FaUser,
        description: "Maintain your profile summary, highlights, and personal story.",
    },
    {
        key: "skills",
        label: "Skills & Tech",
        icon: FaTools,
        description: "Organize skill groups, technologies, and supporting labels.",
    },
    {
        key: "projects",
        label: "Projects",
        icon: FaProjectDiagram,
        description: "Manage featured work, project details, links, and media.",
    },
    {
        key: "timeline",
        label: "Timeline",
        icon: FaCompass,
        description: "Manage the folio-style milestone timeline, preview slides, and section copy.",
    },
    {
        key: "certificates",
        label: "Certificates",
        icon: FaCertificate,
        description: "Maintain certifications, issuers, and verification links.",
    },
    {
        key: "contact",
        label: "Contact Info",
        icon: FaEnvelope,
        description: "Edit contact channels, form copy, and reach-out details.",
    },
    {
        key: "footer",
        label: "Footer",
        icon: FaColumns,
        description: "Control footer messaging, links, and secondary content.",
    },
];

const longTextPattern = /(description|subheading|paragraph|message|text|insight|placeholder|credit|intro)/i;
const urlPattern = /(url|link|image|photo|screenshot|resume|github|demo|certificate)/i;

const shouldUseTextarea = (fieldKey, fieldValue) =>
    typeof fieldValue === "string" &&
    (fieldValue.length > 90 || fieldValue.includes("\n") || longTextPattern.test(fieldKey));

const getInputType = (fieldKey, fieldValue) => {
    if (typeof fieldValue === "number") return "number";
    if (typeof fieldValue === "string" && urlPattern.test(fieldKey)) return "url";
    return "text";
};

const pluralize = (count, singular, pluralWord = `${singular}s`) =>
    `${count} ${count === 1 ? singular : pluralWord}`;

const describeSectionValue = (value) => {
    if (Array.isArray(value)) {
        return pluralize(value.length, "record");
    }

    if (isPlainObject(value)) {
        return pluralize(Object.keys(value).length, "field");
    }

    if (typeof value === "boolean") {
        return value ? "Enabled" : "Disabled";
    }

    if (value === undefined || value === null || value === "") {
        return "Empty";
    }

    return "1 value";
};

const getPersistenceTone = (persistence) => {
    if (persistence.status === REMOTE_STATUS.SAVED) return "accent";
    if (persistence.status === REMOTE_STATUS.ERROR) return "warn";
    if (persistence.status === REMOTE_STATUS.SAVING) return "accent";
    return "neutral";
};

const getPersistenceLabel = (persistence) => {
    if (persistence.isHydrating) return "Checking Storage";
    if (persistence.status === REMOTE_STATUS.SAVING) return "Publishing";
    if (persistence.status === REMOTE_STATUS.SAVED) return "Published";
    if (persistence.status === REMOTE_STATUS.ERROR) return "Sync Error";
    if (persistence.status === REMOTE_STATUS.OFFLINE) return "Offline";
    if (persistence.status === REMOTE_STATUS.LOCAL_ONLY) return "Local Only";
    if (persistence.hasPendingSync) return "Pending Sync";
    return "Cloud Ready";
};

const getPersistenceMessage = (persistence) => {
    if (persistence.isHydrating) {
        return "Checking whether remote publishing is available.";
    }

    if (persistence.status === REMOTE_STATUS.SAVING) {
        return "Publishing the latest content changes now.";
    }

    if (persistence.status === REMOTE_STATUS.SAVED) {
        return `Published at ${formatSyncTime(persistence.lastRemoteSaveAt)}.`;
    }

    if (persistence.status === REMOTE_STATUS.ERROR) {
        return persistence.lastError || "Publishing failed. Your browser copy is still safe.";
    }

    if (persistence.status === REMOTE_STATUS.OFFLINE) {
        return "You are offline. Changes stay local and can sync when the connection returns.";
    }

    if (persistence.status === REMOTE_STATUS.LOCAL_ONLY) {
        return "Remote storage is not configured yet. Changes persist only in this browser for now.";
    }

    if (persistence.hasPendingSync) {
        return "There are local changes waiting to be published.";
    }

    return "Remote publishing is available for this portfolio.";
};

const fieldControlClassName = "w-full rounded-xl border border-main/10 bg-primary/60 px-5 py-3.5 text-sm text-main outline-none transition-all duration-200 placeholder:text-main/25 focus:border-accent/40 focus:bg-primary/80 focus:ring-4 focus:ring-accent/10";

const ToolbarButton = ({
    icon,
    label,
    onClick,
    title,
    tone = "neutral",
    active = false,
    disabled = false,
}) => {
    const IconComponent = icon;
    const toneClasses = {
        neutral: active
            ? "border-accent/30 bg-accent/10 text-accent shadow-lg shadow-accent/10"
            : "border-main/10 bg-secondary/20 text-main/70 hover:border-main/20 hover:bg-secondary/35 hover:text-main",
        accent: active
            ? "border-accent bg-accent text-onaccent shadow-lg shadow-accent/20"
            : "border-accent/20 bg-accent/10 text-accent hover:border-accent/40 hover:bg-accent hover:text-onaccent",
        warn: "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/15 hover:text-amber-300",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            title={title ?? label}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${toneClasses[tone]}`}
        >
            <IconComponent className="text-sm" />
            <span>{label}</span>
        </button>
    );
};

const SectionNavButton = memo(({
    section,
    isActive,
    onSelectSection,
}) => {
    const Icon = section.icon;

    return (
        <button
            type="button"
            onClick={() => onSelectSection(section.key)}
            className={`group w-full px-5 py-3.5 text-left transition-all duration-200 font-medium ${isActive
                ? "border-l-4 border-l-accent bg-accent/10 text-white"
                : "border-l-4 border-l-transparent text-main/80 hover:bg-white/[0.04] hover:text-white"
                }`}
        >
            <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold tracking-tight text-main">{section.label}</p>
                    </div>
                </div>
            </div>
        </button>
    );
});

const UnlockView = ({
    passcode,
    setPasscode,
    error,
    onSubmit,
}) => (
    <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-xl border border-main/10 bg-primary/90 p-8 shadow-md backdrop-blur-md sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <FaLock />
            </div>

            <h3 className="mt-6 text-3xl font-semibold tracking-tight text-main">Admin Panel</h3>
            <p className="mt-3 text-sm leading-relaxed text-main/55">
                Enter the passcode to edit your portfolio content.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
                <label htmlFor="admin-passcode" className="block space-y-3">
                    <span className="block text-[11px] font-semibold uppercase tracking-widest text-main/60">
                        Passcode
                    </span>
                    <div>
                        <input
                            id="admin-passcode"
                            type="password"
                            value={passcode}
                            onChange={(event) => setPasscode(event.target.value)}
                            placeholder="••••••••"
                            className={fieldControlClassName}
                            autoFocus
                        />
                    </div>
                </label>

                {error && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm font-medium text-red-400 animate-in fade-in slide-in-from-top-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-accent px-6 py-4 text-sm font-semibold text-onaccent transition-all duration-200  hover:shadow-md active:translate-y-0"
                >
                    <FaUnlockAlt className="text-base" />
                    Unlock
                </button>
            </form>
        </div>
    </div>
);

const PrimitiveField = memo(({
    label,
    fieldKey,
    value,
    path,
    updateValue,
}) => {
    if (typeof value === "boolean") {
        return (
            <button
                type="button"
                onClick={() => updateValue(path, !value)}
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-transparent bg-transparent px-5 py-4 text-left transition-all duration-200 hover:bg-white/[0.02]"
                aria-pressed={value}
            >
                <div>
                    <span className="block text-sm font-bold text-main">{label}</span>
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-widest text-main/50">
                        {value ? "Currently enabled" : "Currently disabled"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${value
                        ? "bg-accent/10 text-accent"
                        : "bg-secondary/30 text-main/60"
                        }`}>
                        {value ? "On" : "Off"}
                    </span>

                    <span className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${value
                        ? "bg-accent shadow-md"
                        : "bg-main/10"
                        }`}>
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-200 ${value ? "translate-x-7" : "translate-x-1"
                                }`}
                        />
                    </span>
                </div>
            </button>
        );
    }

    if (typeof value === "number") {
        return (
            <label className="block space-y-2.5">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-main/60">{label}</span>
                <input
                    type="number"
                    value={Number.isFinite(value) ? value : 0}
                    onChange={(event) => updateValue(path, Number(event.target.value) || 0)}
                    className={fieldControlClassName}
                />
            </label>
        );
    }

    const textValue = value ?? "";

    if (shouldUseTextarea(fieldKey, textValue)) {
        return (
            <label className="block space-y-2.5">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-main/60">{label}</span>
                <textarea
                    value={textValue}
                    rows={Math.min(Math.max(textValue.split("\n").length + 2, 4), 12)}
                    onChange={(event) => updateValue(path, event.target.value)}
                    className={`${fieldControlClassName} min-h-[132px] resize-y py-4 leading-relaxed`}
                />
            </label>
        );
    }

    return (
        <label className="block space-y-2.5">
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-main/60">{label}</span>
            <input
                type={getInputType(fieldKey, textValue)}
                value={textValue}
                onChange={(event) => updateValue(path, event.target.value)}
                className={fieldControlClassName}
            />
        </label>
    );
}, (prev, next) => prev.value === next.value && prev.label === next.label);

PrimitiveField.displayName = "PrimitiveField";

const RecursiveFieldEditor = memo(({
    label,
    value,
    path,
    depth = 0,
    updateValue,
    addArrayItem,
    removeArrayItem,
    moveArrayItem,
}) => {
    if (Array.isArray(value)) {
        const singularLabel = humanizeKey(label).replace(/s$/, "");

        return (
            <div className={`border-t border-main/10 border-dashed ${depth === 0 ? "pt-5 sm:pt-7" : "pt-5 sm:pt-6"}`}>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent">
                            <span className="h-2 w-2 rounded-full bg-accent" />
                            {pluralize(value.length, "record")}
                        </div>
                        <h3 className="mt-3 text-xl font-semibold tracking-tight text-main">{label}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-main/60">
                            Manage entries, change their order, and expand the list as needed.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => addArrayItem(path)}
                        className="inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-5 py-3 text-sm font-semibold text-accent transition-all duration-200  hover:bg-accent hover:text-onaccent"
                    >
                        <FaPlus className="text-sm" />
                        Add {singularLabel}
                    </button>
                </div>

                <div className="space-y-5">
                    {value.length === 0 && (
                        <div className="rounded-xl border border-dashed border-main/15 bg-primary/40 px-6 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-main/25">
                                <FaPlus />
                            </div>
                            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-main/60">
                                No records yet
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-main/50">
                                Add the first item to start building this collection.
                            </p>
                        </div>
                    )}

                    {value.map((item, index) => {
                        const itemPath = [...path, index];
                        const itemLabel = `${humanizeKey(label).replace(/s$/, "")} #${index + 1}`;

                        return (
                            <div
                                key={itemPath.join(".")}
                                className="border-b border-main/10 py-5 transition-all duration-200"
                            >
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-main/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-main/10 bg-white/[0.04] text-sm font-semibold text-main/50">
                                            {index + 1}
                                        </div>

                                        <div>
                                            <div className="text-sm font-semibold uppercase tracking-widest text-main">
                                                {itemLabel}
                                            </div>
                                            <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-main/50">
                                                {`Record ${index + 1} of ${value.length}`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => moveArrayItem(path, index, index - 1)}
                                            disabled={index === 0}
                                            title="Move Up"
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-main/10 bg-secondary/20 text-main/60 transition-all duration-200 hover:border-accent/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-25"
                                        >
                                            <FaArrowUp />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveArrayItem(path, index, index + 1)}
                                            disabled={index === value.length - 1}
                                            title="Move Down"
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-main/10 bg-secondary/20 text-main/60 transition-all duration-200 hover:border-accent/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-25"
                                        >
                                            <FaArrowDown />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem(path, index)}
                                            title="Delete Record"
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/15 bg-red-500/10 text-red-400 transition-all duration-200 hover:bg-red-500 hover:text-white"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <RecursiveFieldEditor
                                    label={itemLabel}
                                    value={item}
                                    path={itemPath}
                                    depth={depth + 1}
                                    updateValue={updateValue}
                                    addArrayItem={addArrayItem}
                                    removeArrayItem={removeArrayItem}
                                    moveArrayItem={moveArrayItem}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (isPlainObject(value)) {
        return (
            <div className={`space-y-5 ${depth === 0 ? "" : "border-t border-dashed border-main/10 pt-5 sm:pt-6"}`}>
                {depth > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-1 rounded-full bg-accent/40" />
                        <div>
                            <h4 className="text-base font-semibold tracking-tight text-main">{label}</h4>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-main/50">
                                Nested content group
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-6">
                    {Object.entries(value).map(([fieldKey, fieldValue]) => (
                        <div
                            key={[...path, fieldKey].join(".")}
                            className={Array.isArray(fieldValue) || isPlainObject(fieldValue) ? "md:col-span-2" : ""}
                        >
                            <RecursiveFieldEditor
                                label={humanizeKey(fieldKey)}
                                value={fieldValue}
                                path={[...path, fieldKey]}
                                depth={depth + 1}
                                updateValue={updateValue}
                                addArrayItem={addArrayItem}
                                removeArrayItem={removeArrayItem}
                                moveArrayItem={moveArrayItem}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <PrimitiveField
            label={label}
            fieldKey={path[path.length - 1]}
            value={value}
            path={path}
            updateValue={updateValue}
        />
    );
}, (prev, next) => {
    if (prev.label !== next.label) return false;
    if (typeof prev.value !== typeof next.value) return false;
    if (!isPlainObject(prev.value) && !Array.isArray(prev.value)) {
        return prev.value === next.value;
    }
    return JSON.stringify(prev.value) === JSON.stringify(next.value);
});

RecursiveFieldEditor.displayName = "RecursiveFieldEditor";

const AdminPanel = ({ isOpen, onClose }) => {
    const {
        content,
        addArrayItem,
        moveArrayItem,
        persistNow,
        persistence,
        removeArrayItem,
        replaceContent,
        resetContent,
        updateValue,
    } = useContent();
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    });
    const [activeSection, setActiveSection] = useState("hero");
    const [showImportPanel, setShowImportPanel] = useState(false);
    const [importValue, setImportValue] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const activeSectionConfig = useMemo(
        () => editorSections.find((section) => section.key === activeSection) || editorSections[0],
        [activeSection]
    );

    const activeSectionValue = content[activeSectionConfig.key];

    const handleSectionSelect = useCallback((sectionKey) => {
        startTransition(() => setActiveSection(sectionKey));
    }, []);

    const handleClose = useCallback(() => {
        setPasscode("");
        setError("");
        setShowImportPanel(false);
        setImportValue("");
        setStatusMessage("");
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                if (showImportPanel) {
                    setShowImportPanel(false);
                    return;
                }
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleClose, isOpen, showImportPanel]);

    useEffect(() => {
        if (!statusMessage) return undefined;
        const timeoutId = window.setTimeout(() => setStatusMessage(""), 2200);
        return () => window.clearTimeout(timeoutId);
    }, [statusMessage]);

    const handlePublishChanges = useCallback(async () => {
        const result = await persistNow();
        setStatusMessage(result.message);
    }, [persistNow]);

    if (!isOpen) return null;

    const handleUnlock = (event) => {
        event.preventDefault();
        if (passcode.trim() !== ADMIN_PASSCODE) {
            setError("Authentication failed. Invalid passcode provided.");
            return;
        }
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        window.sessionStorage.setItem(ADMIN_SESSION_PASSCODE_KEY, passcode.trim());
        setIsUnlocked(true);
        setPasscode("");
        setError("");
    };

    const handleLock = () => {
        window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
        window.sessionStorage.removeItem(ADMIN_SESSION_PASSCODE_KEY);
        setIsUnlocked(false);
        setPasscode("");
        setError("");
        setShowImportPanel(false);
        setImportValue("");
        setStatusMessage("");
    };

    const handleCopyJson = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(content, null, 2));
            setStatusMessage("JSON copied to clipboard");
        } catch (copyError) {
            console.error("Failed to copy site content.", copyError);
            setStatusMessage("Copy operation failed");
        }
    };

    const handleDownloadJson = () => {
        const jsonBlob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
        const downloadUrl = URL.createObjectURL(jsonBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `portfolio-backup-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(downloadUrl);
        setStatusMessage("Backup file generated");
    };

    const handleImportJson = () => {
        try {
            const parsedContent = JSON.parse(importValue);
            replaceContent(parsedContent);
            setShowImportPanel(false);
            setImportValue("");
            setStatusMessage("Configuration applied");
        } catch (importError) {
            setStatusMessage("Invalid JSON format");
            console.error("Failed to import site content.", importError);
        }
    };

    const handleResetContent = () => {
        if (!window.confirm("Are you sure? This will discard all unsaved local changes.")) return;
        resetContent();
        setStatusMessage("Data reset to defaults locally");
    };

    const ActiveSectionIcon = activeSectionConfig.icon;

    return createPortal(
        <div className="fixed inset-0 z-[120]">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={handleClose} />

            <div
                className="relative h-screen w-screen overflow-hidden bg-primary/95 text-main animate-in fade-in duration-300"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="relative flex h-full flex-col">
                    <header className="border-b border-main/10 bg-primary/85 backdrop-blur-2xl">
                        <div className="px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent shadow-md">
                                        <FaTools className="text-xl" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h1 className="text-2xl font-semibold tracking-tight text-main sm:text-3xl">
                                                Admin Panel
                                            </h1>

                                            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest ${getPersistenceTone(persistence) === "accent"
                                                ? "border border-accent/20 bg-accent/10 text-accent"
                                                : getPersistenceTone(persistence) === "warn"
                                                    ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                                                    : "border border-main/10 bg-secondary/20 text-main/60"
                                                }`}>
                                                <span className={`h-2 w-2 rounded-full ${persistence.status === REMOTE_STATUS.SAVING
                                                    ? "animate-pulse bg-accent"
                                                    : persistence.status === REMOTE_STATUS.ERROR
                                                        ? "bg-amber-400"
                                                        : persistence.status === REMOTE_STATUS.SAVED
                                                            ? "bg-accent"
                                                            : "bg-main/40"
                                                    }`} />
                                                {getPersistenceLabel(persistence)}
                                            </div>

                                            {statusMessage && (
                                                <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-accent animate-in slide-in-from-left-2">
                                                    <FaCheck className="text-[8px]" />
                                                    {statusMessage}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    {isUnlocked && (
                                        <>
                                            <ToolbarButton
                                                icon={FaCloudUploadAlt}
                                                label={persistence.isSaving ? "Publishing" : "Publish Changes"}
                                                onClick={handlePublishChanges}
                                                tone="accent"
                                                disabled={persistence.isSaving}
                                            />
                                            <ToolbarButton
                                                icon={FaCopy}
                                                label="Copy JSON"
                                                onClick={handleCopyJson}
                                            />
                                            <ToolbarButton
                                                icon={FaDownload}
                                                label="Backup JSON"
                                                onClick={handleDownloadJson}
                                            />
                                            <ToolbarButton
                                                icon={FaFileImport}
                                                label={showImportPanel ? "Hide Import" : "Import JSON"}
                                                onClick={() => setShowImportPanel((currentValue) => !currentValue)}
                                            />
                                            <ToolbarButton
                                                icon={FaUndo}
                                                label="Reset Content"
                                                onClick={handleResetContent}
                                                tone="warn"
                                            />

                                            <ToolbarButton
                                                icon={FaLock}
                                                label="Lock Panel"
                                                onClick={handleLock}
                                            />
                                        </>
                                    )}

                                    <ToolbarButton
                                        icon={FaTimes}
                                        label="Close Panel"
                                        onClick={handleClose}
                                    />
                                </div>
                            </div>

                        </div>
                    </header>

                    {!isUnlocked ? (
                        <UnlockView
                            passcode={passcode}
                            setPasscode={setPasscode}
                            error={error}
                            onSubmit={handleUnlock}
                        />
                    ) : (
                        <div className="grid flex-1 min-h-0 lg:grid-cols-[340px_minmax(0,1fr)]">
                            <aside className="min-h-0 border-b border-main/10 bg-secondary/[0.12] lg:border-b-0 lg:border-r">
                                <div className="flex h-full min-h-0 flex-col">
                                    <div className="border-b border-slate-800 p-5">
                                        <h2 className="text-lg font-semibold text-white">Sections</h2>
                                    </div>

                                    <div className="flex-1 overflow-y-auto py-3">
                                        <div className="flex flex-col gap-1">
                                            {editorSections.map((section) => (
                                                <SectionNavButton
                                                    key={section.key}
                                                    section={section}
                                                    isActive={activeSection === section.key}
                                                    onSelectSection={handleSectionSelect}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </aside>

                            <main className="min-h-0 overflow-hidden bg-primary/20">
                                <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                                    <div className="mx-auto flex max-w-[1360px] flex-col gap-6">
                                        <section className="rounded-xl border border-main/10 bg-white/[0.04] p-5 shadow-md sm:p-6">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-xl text-accent">
                                                        <ActiveSectionIcon />
                                                    </div>

                                                    <div>
                                                        <h2 className="text-2xl font-semibold tracking-tight text-main sm:text-3xl">
                                                            {activeSectionConfig.label}
                                                        </h2>
                                                        <p className="mt-1 text-sm text-main/60">
                                                            {describeSectionValue(activeSectionValue)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="rounded-full border border-main/10 bg-secondary/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-main/60">
                                                    {activeSectionConfig.key}
                                                </span>
                                            </div>
                                        </section>

                                        <section className="rounded-xl border border-main/10 bg-secondary/[0.12] p-5 shadow-md sm:p-6">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-main/55">
                                                        Persistence Status
                                                    </p>
                                                    <h3 className="mt-2 text-lg font-semibold text-main">
                                                        {getPersistenceLabel(persistence)}
                                                    </h3>
                                                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-main/65">
                                                        {getPersistenceMessage(persistence)}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 text-sm text-main/65 sm:grid-cols-2">
                                                    <div className="rounded-xl border border-main/10 bg-primary/40 px-4 py-3">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-main/45">
                                                            Last Local Save
                                                        </p>
                                                        <p className="mt-1 font-medium text-main/80">
                                                            {formatSyncTime(persistence.lastLocalSaveAt)}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-main/10 bg-primary/40 px-4 py-3">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-main/45">
                                                            Last Cloud Publish
                                                        </p>
                                                        <p className="mt-1 font-medium text-main/80">
                                                            {formatSyncTime(persistence.lastRemoteSaveAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {showImportPanel && (
                                            <section className="rounded-xl border border-accent/20 bg-accent/5 p-6 shadow-md sm:p-8">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-onaccent shadow-md">
                                                            <FaFileImport />
                                                        </div>

                                                        <div>
                                                            <h3 className="text-xl font-semibold tracking-tight text-main">
                                                                Import Configuration
                                                            </h3>
                                                            <p className="mt-2 text-sm leading-relaxed text-main/55">
                                                                Paste a JSON object to replace the current content workspace.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setShowImportPanel(false)}
                                                        className="inline-flex items-center justify-center rounded-xl border border-main/10 bg-secondary/20 px-4 py-3 text-sm font-bold text-main/60 transition-all duration-200 hover:border-main/20 hover:text-main"
                                                    >
                                                        Close Import
                                                    </button>
                                                </div>

                                                <textarea
                                                    value={importValue}
                                                    onChange={(event) => setImportValue(event.target.value)}
                                                    rows={14}
                                                    className="mt-6 w-full rounded-xl border border-main/10 bg-primary/80 px-6 py-5 font-mono text-sm text-main/80 outline-none transition-all duration-200 focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
                                                    placeholder='Paste your JSON object here...'
                                                />

                                                <div className="mt-6 flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleImportJson}
                                                        className="inline-flex items-center gap-3 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-onaccent transition-all duration-200  hover:shadow-md"
                                                    >
                                                        <FaCheck />
                                                        Apply Import
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setImportValue("")}
                                                        className="inline-flex items-center gap-3 rounded-xl border border-main/10 bg-secondary/20 px-6 py-3.5 text-sm font-bold text-main/60 transition-all duration-200 hover:border-main/20 hover:text-main"
                                                    >
                                                        <FaTrash className="text-xs" />
                                                        Clear Text
                                                    </button>
                                                </div>
                                            </section>
                                        )}

                                        <section className="rounded-xl border border-main/10 bg-secondary/[0.12] p-2 shadow-md sm:p-3">
                                            <div className="rounded-xl border border-main/10 bg-primary/55 p-4 sm:p-6 lg:p-8">

                                                <RecursiveFieldEditor
                                                    label={activeSectionConfig.label}
                                                    value={activeSectionValue}
                                                    path={[activeSectionConfig.key]}
                                                    updateValue={updateValue}
                                                    addArrayItem={addArrayItem}
                                                    removeArrayItem={removeArrayItem}
                                                    moveArrayItem={moveArrayItem}
                                                />
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </main>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AdminPanel;
