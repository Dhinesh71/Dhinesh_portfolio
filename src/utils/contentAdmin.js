export const CONTENT_STORAGE_KEY = "portfolio-site-content-v2";
export const LEGACY_CONTENT_STORAGE_KEYS = ["portfolio-site-content-v1"];
export const CONTENT_META_STORAGE_KEY = "portfolio-site-content-meta-v1";
export const ADMIN_SESSION_KEY = "portfolio-admin-session-v1";
export const ADMIN_SESSION_PASSCODE_KEY = "portfolio-admin-passcode-v1";
export const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || "portfolio-admin";

const objectTag = "[object Object]";

export const isPlainObject = (value) => Object.prototype.toString.call(value) === objectTag;

export const deepClone = (value) => {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
};

export const mergeWithTemplate = (template, incoming) => {
    if (Array.isArray(template)) {
        if (!Array.isArray(incoming)) {
            return deepClone(template);
        }

        if (template.length === 0) {
            return deepClone(incoming);
        }

        return incoming.map((item) => mergeWithTemplate(template[0], item));
    }

    if (isPlainObject(template)) {
        const source = isPlainObject(incoming) ? incoming : {};
        const keys = Array.from(new Set([...Object.keys(template), ...Object.keys(source)]));

        return keys.reduce((accumulator, key) => {
            if (key in template) {
                accumulator[key] = mergeWithTemplate(template[key], source[key]);
                return accumulator;
            }

            accumulator[key] = deepClone(source[key]);
            return accumulator;
        }, {});
    }

    return incoming === undefined ? deepClone(template) : incoming;
};

export const getByPath = (source, path) =>
    path.reduce((currentValue, key) => currentValue?.[key], source);

export const setByPath = (source, path, nextValue) => {
    if (path.length === 0) {
        return nextValue;
    }

    const [head, ...tail] = path;
    const baseValue = source ?? (typeof head === "number" ? [] : {});
    const clone = Array.isArray(baseValue) ? [...baseValue] : { ...baseValue };

    if (tail.length === 0) {
        clone[head] = nextValue;
        return clone;
    }

    const nestedValue = clone[head] ?? (typeof tail[0] === "number" ? [] : {});
    clone[head] = setByPath(nestedValue, tail, nextValue);
    return clone;
};

export const moveItem = (items, fromIndex, toIndex) => {
    if (
        !Array.isArray(items) ||
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= items.length ||
        toIndex >= items.length
    ) {
        return items;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    return nextItems;
};

export const normalizeTemplatePath = (path) =>
    path.map((segment) => (typeof segment === "number" ? 0 : segment));

export const createArrayItem = (templateRoot, currentRoot, path) => {
    const normalizedPath = normalizeTemplatePath(path);
    const templateArray = getByPath(templateRoot, normalizedPath);
    const currentArray = getByPath(currentRoot, path);
    const templateItem = Array.isArray(templateArray) ? templateArray[0] : undefined;

    if (templateItem === undefined) {
        return "";
    }

    if (typeof templateItem === "string") {
        return "";
    }

    if (typeof templateItem === "number") {
        return 0;
    }

    if (typeof templateItem === "boolean") {
        return false;
    }

    const nextItem = deepClone(templateItem);

    if (isPlainObject(nextItem) && "id" in nextItem && Array.isArray(currentArray)) {
        const numericIds = currentArray
            .map((item) => Number(item?.id))
            .filter((itemId) => Number.isFinite(itemId));

        nextItem.id = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    }

    return nextItem;
};

export const humanizeKey = (value) =>
    String(value)
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
