export const BRANCH = {
    LEFT: "leftSide",
    RIGHT: "rightSide",
};

export const NODE_TYPES = {
    CONVERGE: "converge",
    DIVERGE: "diverge",
    CHECKPOINT: "checkpoint",
};

export const ITEM_SIZE = {
    SMALL: "small",
    LARGE: "large",
};

const escapeSvgValue = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export const createTimelineSlide = ({
    eyebrow = "Milestone",
    title = "",
    subtitle = "",
    accent = "#38bdf8",
    accentSoft = "rgba(56, 189, 248, 0.18)",
    backgroundStart = "#0f172a",
    backgroundEnd = "#1e293b",
}) => {
    const svg = `
        <svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="timeline-bg" x1="120" y1="60" x2="1160" y2="660" gradientUnits="userSpaceOnUse">
                    <stop stop-color="${escapeSvgValue(backgroundStart)}" />
                    <stop offset="1" stop-color="${escapeSvgValue(backgroundEnd)}" />
                </linearGradient>
                <linearGradient id="timeline-accent" x1="232" y1="194" x2="936" y2="522" gradientUnits="userSpaceOnUse">
                    <stop stop-color="${escapeSvgValue(accent)}" />
                    <stop offset="1" stop-color="#f8fafc" stop-opacity="0.35" />
                </linearGradient>
                <filter id="timeline-blur" x="0" y="0" width="1280" height="720" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feGaussianBlur stdDeviation="50" />
                </filter>
            </defs>
            <rect width="1280" height="720" rx="32" fill="url(#timeline-bg)" />
            <g opacity="0.9" filter="url(#timeline-blur)">
                <circle cx="1068" cy="136" r="118" fill="${escapeSvgValue(accentSoft)}" />
                <circle cx="232" cy="604" r="144" fill="${escapeSvgValue(accentSoft)}" />
            </g>
            <rect x="92" y="82" width="1096" height="556" rx="30" fill="rgba(15, 23, 42, 0.48)" stroke="rgba(148, 163, 184, 0.18)" stroke-width="2"/>
            <rect x="124" y="118" width="184" height="42" rx="21" fill="rgba(248, 250, 252, 0.08)" />
            <text x="216" y="145" text-anchor="middle" fill="${escapeSvgValue(accent)}" font-size="20" font-family="Space Grotesk, Inter, sans-serif" font-weight="700" letter-spacing="4">
                ${escapeSvgValue(eyebrow).toUpperCase()}
            </text>
            <foreignObject x="124" y="206" width="968" height="154">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Space Grotesk, Inter, sans-serif; color: white; font-size: 64px; line-height: 1.08; font-weight: 700; letter-spacing: 0.01em; overflow-wrap: break-word;">
                    ${escapeSvgValue(title)}
                </div>
            </foreignObject>
            <rect x="124" y="376" width="812" height="4" rx="2" fill="url(#timeline-accent)" />
            <foreignObject x="124" y="416" width="968" height="150">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Space Grotesk, Inter, sans-serif; color: rgba(226, 232, 240, 0.88); font-size: 30px; line-height: 1.45; font-weight: 500; letter-spacing: 0.01em;">
                    ${escapeSvgValue(subtitle)}
                </div>
            </foreignObject>
        </svg>
    `.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const createTimelineBadge = ({
    label = "MILESTONE",
    accent = "#38bdf8",
    background = "#0f172a",
}) => {
    const svg = `
        <svg width="144" height="40" viewBox="0 0 144 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="142" height="38" rx="19" fill="${escapeSvgValue(background)}" fill-opacity="0.82" stroke="${escapeSvgValue(accent)}" stroke-opacity="0.45" stroke-width="2"/>
            <text x="72" y="25" text-anchor="middle" fill="${escapeSvgValue(accent)}" font-size="14" font-family="Space Grotesk, Inter, sans-serif" font-weight="700" letter-spacing="2">
                ${escapeSvgValue(label).toUpperCase()}
            </text>
        </svg>
    `.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const parseYearValue = (value = "") => {
    const matches = String(value).match(/\b(19|20)\d{2}\b/g);

    if (!matches || matches.length === 0) {
        return null;
    }

    return Number(matches[matches.length - 1]);
};

const pickHackathonSlide = (hackathon) =>
    hackathon?.eventPhotos?.find(Boolean) ||
    hackathon?.projectScreenshot ||
    createTimelineSlide({
        eyebrow: "Hackathon",
        title: hackathon?.title || "Hackathon Milestone",
        subtitle: [hackathon?.projectTitle, hackathon?.location].filter(Boolean).join(" - "),
        accent: "#f59e0b",
        accentSoft: "rgba(245, 158, 11, 0.18)",
        backgroundStart: "#111827",
        backgroundEnd: "#1f2937",
    });

const buildHackathonCheckpoint = (hackathon, alignment) => ({
    type: NODE_TYPES.CHECKPOINT,
    title: hackathon.title,
    subtitle: [hackathon.projectTitle, hackathon.location].filter(Boolean).join(" - "),
    size: ITEM_SIZE.SMALL,
    image: createTimelineBadge({
        label: "Hackathon",
        accent: "#f59e0b",
        background: "#111827",
    }),
    slideImage: pickHackathonSlide(hackathon),
    shouldDrawLine: true,
    alignment,
});

const buildEducationCheckpoint = (entry, alignment) => ({
    type: NODE_TYPES.CHECKPOINT,
    title: entry.degree,
    subtitle: [entry.institution, entry.description].filter(Boolean).join(" - "),
    size: ITEM_SIZE.SMALL,
    image: createTimelineBadge({
        label: "Education",
        accent: "#38bdf8",
        background: "#0f172a",
    }),
    slideImage: createTimelineSlide({
        eyebrow: "Education",
        title: entry.degree,
        subtitle: `${entry.institution}${entry.description ? ` - ${entry.description}` : ""}`,
        accent: "#38bdf8",
        accentSoft: "rgba(56, 189, 248, 0.18)",
        backgroundStart: "#0f172a",
        backgroundEnd: "#1e293b",
    }),
    shouldDrawLine: true,
    alignment,
});

export const buildTimelineItemsFromSections = ({
    hackathons = { items: [] },
    education = { items: [] },
} = {}) => {
    const hackathonEvents = (hackathons.items || [])
        .map((hackathon) => ({
            year: parseYearValue(hackathon.date),
            node: buildHackathonCheckpoint(hackathon, BRANCH.LEFT),
        }))
        .filter((item) => Number.isFinite(item.year));

    const educationEvents = [...(education.items || [])]
        .reverse()
        .map((entry) => ({
            year: parseYearValue(entry.year),
            node: buildEducationCheckpoint(entry, BRANCH.LEFT),
        }))
        .filter((item) => Number.isFinite(item.year));

    const groupedEvents = [...hackathonEvents, ...educationEvents].reduce((groups, item) => {
        if (!groups.has(item.year)) {
            groups.set(item.year, []);
        }

        groups.get(item.year).push(item.node);
        return groups;
    }, new Map());

    const years = [...groupedEvents.keys()].sort((first, second) => second - first);

    if (years.length === 0) {
        return [
            {
                type: NODE_TYPES.CHECKPOINT,
                title: "Timeline",
                subtitle: "Add milestones in the admin panel to populate this section.",
                size: ITEM_SIZE.SMALL,
                image: createTimelineBadge({
                    label: "Milestone",
                    accent: "#38bdf8",
                    background: "#0f172a",
                }),
                slideImage: createTimelineSlide({
                    eyebrow: "Timeline",
                    title: "No milestones yet",
                    subtitle: "Add records to your portfolio timeline from the content editor.",
                }),
                shouldDrawLine: true,
                alignment: BRANCH.LEFT,
            },
        ];
    }

    return years.flatMap((year) => {
        const yearNodes = groupedEvents.get(year) || [];
        const timelineNodes = [
            {
                type: NODE_TYPES.CHECKPOINT,
                title: String(year),
                size: ITEM_SIZE.LARGE,
                shouldDrawLine: false,
                alignment: BRANCH.LEFT,
            },
        ];

        if (yearNodes.length === 1) {
            timelineNodes.push(yearNodes[0]);
            return timelineNodes;
        }

        if (yearNodes.length >= 2) {
            timelineNodes.push(
                { type: NODE_TYPES.DIVERGE },
                { ...yearNodes[0], alignment: BRANCH.RIGHT },
                { ...yearNodes[1], alignment: BRANCH.LEFT },
                { type: NODE_TYPES.CONVERGE }
            );
        }

        if (yearNodes.length > 2) {
            timelineNodes.push(...yearNodes.slice(2));
        }

        return timelineNodes;
    });
};

export const normalizeTimelineItems = (items = []) =>
    (Array.isArray(items) ? items : []).filter((item) => {
        if (!item || typeof item !== "object" || !item.type) {
            return false;
        }

        if (item.type === NODE_TYPES.CHECKPOINT) {
            return Boolean(item.title || item.shouldDrawLine);
        }

        return item.type === NODE_TYPES.DIVERGE || item.type === NODE_TYPES.CONVERGE;
    });
