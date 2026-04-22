import React, { createContext, useContext, useMemo } from "react";
import { defaultSiteContent } from "../data/content";
import { buildTimelineItemsFromSections, normalizeTimelineItems } from "../utils/timelineContent";

const ContentContext = createContext(null);

const deepClone = (value) => {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
};

const normalizeCodeContent = (sourceContent) => {
    const content = deepClone(sourceContent);
    const timelineItems = normalizeTimelineItems(content.timeline?.items);

    return {
        ...content,
        hackathons: {
            ...content.hackathons,
            enabled: false,
        },
        education: {
            ...content.education,
            enabled: false,
        },
        timeline: {
            ...content.timeline,
            enabled: content.timeline?.enabled ?? true,
            items: timelineItems.length > 0
                ? timelineItems
                : buildTimelineItemsFromSections({
                    hackathons: content.hackathons,
                    education: content.education,
                }),
        },
    };
};

export const ContentProvider = ({ children }) => {
    const content = useMemo(() => normalizeCodeContent(defaultSiteContent), []);
    const value = useMemo(() => ({ content }), [content]);

    return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => {
    const context = useContext(ContentContext);

    if (!context) {
        throw new Error("useContent must be used inside a ContentProvider.");
    }

    return context;
};
