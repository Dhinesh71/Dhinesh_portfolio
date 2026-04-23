import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "../../context/ContentContext";
import {
    BRANCH,
    createTimelineSlide,
    ITEM_SIZE,
    NODE_TYPES,
} from "../../utils/timelineContent";

gsap.registerPlugin(ScrollTrigger);

const SVG_COLOR = "#9CA3AF";
const ANIMATION_COLOR = "#22D3EE";
const SEPARATION = 450;
const STROKE_WIDTH = 2;
const LEFT_BRANCH_X = 13;
const CURVE_LENGTH = 150;
const DOT_SIZE = 26;
const RESIZE_DEBOUNCE_MS = 120;

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const isCompactScreen = () => window.innerWidth < 767;

const addNodeRefsToItems = (timeline) =>
    timeline.map((node, index) => ({
        ...node,
        next: timeline[index + 1],
        prev: timeline[index - 1],
    }));

const addText = (timelineNode, y, isDiverged, svgWidth, rightBranchX) => {
    const offset = isDiverged ? rightBranchX : 10;
    const foreignObjectX = DOT_SIZE / 2 + 10 + offset;
    const foreignObjectY = y - DOT_SIZE / 2;
    const foreignObjectWidth = Math.max(svgWidth - (DOT_SIZE / 2 + 20 + offset), 200);
    const isCompact = svgWidth < 540;
    const titleFontSize = timelineNode.size === ITEM_SIZE.LARGE
        ? (isCompact ? 38 : 56)
        : (isCompact ? 24 : 30);
    const subtitleFontSize = isCompact ? 16 : 20;
    const logoString = timelineNode.image
        ? `<img src='${escapeHtml(timelineNode.image)}' style='height:32px;max-width:148px;object-fit:contain;margin-bottom:12px;' loading='lazy' alt='' />`
        : "";
    const subtitleString = timelineNode.subtitle
        ? `<p style='margin:12px 0 0;color:#D1D5DB;font-size:${subtitleFontSize}px;line-height:1.45;font-weight:500;letter-spacing:0.01em;'>${escapeHtml(timelineNode.subtitle)}</p>`
        : "";

    return `<foreignObject x='${foreignObjectX}' y='${foreignObjectY}' width='${foreignObjectWidth}' height='${SEPARATION}'>
        <div xmlns='http://www.w3.org/1999/xhtml' style='font-family:Space Grotesk, Inter, sans-serif;color:#F9FAFB;padding-right:12px;'>
            ${logoString}
            <p style='margin:0;font-size:${titleFontSize}px;line-height:1.08;font-weight:700;'>${escapeHtml(timelineNode.title)}</p>
            ${subtitleString}
        </div>
    </foreignObject>`;
};

const getDotString = (x, y) =>
    `<rect class='dot' width='${DOT_SIZE}' height='${DOT_SIZE}' fill='#111827' x='${x - DOT_SIZE / 2}' y='${y - DOT_SIZE / 2}'></rect><circle cx='${x}' cy='${y}' r='7' stroke='${SVG_COLOR}' class='dot'></circle>`;

const drawDot = (timelineNode, y, isDiverged, svgWidth, rightBranchX) => {
    const { next, alignment } = timelineNode;
    let dotY = y;

    if (next?.type === NODE_TYPES.DIVERGE) {
        dotY = dotY - CURVE_LENGTH + 6 * DOT_SIZE;
    }

    if (next?.type === NODE_TYPES.CONVERGE) {
        dotY = dotY + CURVE_LENGTH - 6 * DOT_SIZE;
    }

    const dotString = getDotString(
        alignment === BRANCH.LEFT ? LEFT_BRANCH_X : rightBranchX,
        dotY
    );

    return `${addText(timelineNode, dotY, isDiverged, svgWidth, rightBranchX)}${dotString}`;
};

const drawLine = (timelineNode, y, index, isDiverged, rightBranchX) => {
    const { alignment, prev, next } = timelineNode;
    const isPrevDiverge = prev?.type === NODE_TYPES.DIVERGE;
    const isNextConverge = next?.type === NODE_TYPES.CONVERGE;
    const lineY = Math.abs(y + SEPARATION);

    if (isPrevDiverge || isNextConverge) {
        return `<line class='str' x1='${LEFT_BRANCH_X}' y1='${y}' x2='${LEFT_BRANCH_X}' y2='${lineY}' stroke='${SVG_COLOR}' /><line class='str line-${index}' x1='${LEFT_BRANCH_X}' y1='${y}' x2='${LEFT_BRANCH_X}' y2='${lineY}' stroke='${ANIMATION_COLOR}' />`;
    }

    const lineX = alignment === BRANCH.LEFT ? LEFT_BRANCH_X : rightBranchX;
    let lineString = `<line class='str' x1='${lineX}' y1='${y}' x2='${lineX}' y2='${lineY}' stroke='${SVG_COLOR}' /><line class='str line-${index}' x1='${lineX}' y1='${y}' x2='${lineX}' y2='${lineY}' stroke='${ANIMATION_COLOR}' />`;

    if (isDiverged) {
        const divergedLineX = alignment === BRANCH.LEFT ? rightBranchX : LEFT_BRANCH_X;
        lineString += `<line class='str' x1='${divergedLineX}' y1='${y}' x2='${divergedLineX}' y2='${lineY}' stroke='${SVG_COLOR}' /><line class='str line-${index}' x1='${divergedLineX}' y1='${y}' x2='${divergedLineX}' y2='${lineY}' stroke='${ANIMATION_COLOR}' />`;
    }

    return lineString;
};

const drawBranch = (timelineNode, y, index, rightBranchX) => {
    if (timelineNode.type === NODE_TYPES.DIVERGE) {
        return `<path class='str' d='M ${LEFT_BRANCH_X} ${y} C ${LEFT_BRANCH_X} ${y + CURVE_LENGTH / 2} ${rightBranchX} ${y + CURVE_LENGTH / 2} ${rightBranchX} ${y + CURVE_LENGTH}' stroke='${SVG_COLOR}' /><line class='str' x1='${rightBranchX}' y1='${y + CURVE_LENGTH}' x2='${rightBranchX}' y2='${y + SEPARATION}' stroke='${SVG_COLOR}' /><path class='str anim-branch branch-${index}' d='M ${LEFT_BRANCH_X} ${y} C ${LEFT_BRANCH_X} ${y + CURVE_LENGTH / 2} ${rightBranchX} ${y + CURVE_LENGTH / 2} ${rightBranchX} ${y + CURVE_LENGTH}' stroke='${ANIMATION_COLOR}' /><line class='str branch-line-${index}' x1='${rightBranchX}' y1='${y + CURVE_LENGTH}' x2='${rightBranchX}' y2='${y + SEPARATION}' stroke='${ANIMATION_COLOR}' />`;
    }

    return `<path class='str' d='M ${rightBranchX} ${y + SEPARATION - CURVE_LENGTH} C ${rightBranchX} ${y + SEPARATION - CURVE_LENGTH + CURVE_LENGTH / 2} ${LEFT_BRANCH_X} ${y + SEPARATION - CURVE_LENGTH + CURVE_LENGTH / 2} ${LEFT_BRANCH_X} ${y + SEPARATION}' stroke='${SVG_COLOR}' /><line class='str' x1='${rightBranchX}' y1='${y}' x2='${rightBranchX}' y2='${Math.abs(y + SEPARATION - CURVE_LENGTH)}' stroke='${SVG_COLOR}' /><path class='str anim-branch branch-${index}' d='M ${rightBranchX} ${y + SEPARATION - CURVE_LENGTH} C ${rightBranchX} ${y + SEPARATION - CURVE_LENGTH + CURVE_LENGTH / 2} ${LEFT_BRANCH_X} ${y + SEPARATION - CURVE_LENGTH + CURVE_LENGTH / 2} ${LEFT_BRANCH_X} ${y + SEPARATION}' stroke='${ANIMATION_COLOR}' /><line class='str branch-line-${index}' x1='${rightBranchX}' y1='${y}' x2='${rightBranchX}' y2='${Math.abs(y + SEPARATION - CURVE_LENGTH)}' stroke='${ANIMATION_COLOR}' />`;
};

const generateTimelineSvg = (timeline, svgWidth, rightBranchX) => {
    let index = 1;
    let y = DOT_SIZE / 2;
    let isDiverged = false;
    const timelineStyle = `<style>.str,.dot{stroke-width:${STROKE_WIDTH}px}.anim-branch{stroke-dasharray:186}</style>`;

    return addNodeRefsToItems(timeline).reduce((svg, node) => {
        const { type, next } = node;
        let lineY = y;
        let dotY = y + SEPARATION / 2;

        if (type === NODE_TYPES.CHECKPOINT) {
            if (!next) {
                lineY = y - SEPARATION / 2;
            }

            if (!node.shouldDrawLine) {
                dotY = y;
            }

            if (node.shouldDrawLine) {
                svg = `${drawLine(node, lineY, index, isDiverged, rightBranchX)}${svg}`;
                y += SEPARATION;
                index += 1;
            }

            svg += drawDot(node, dotY, isDiverged, svgWidth, rightBranchX);
            return svg;
        }

        if (type === NODE_TYPES.DIVERGE) {
            isDiverged = true;
            return `${drawBranch(node, y, index, rightBranchX)}${svg}`;
        }

        isDiverged = false;
        return `${drawBranch(node, y - SEPARATION, index - 1, rightBranchX)}${svg}`;
    }, timelineStyle);
};

const addLineSvgAnimation = (timeline, svgContainer, duration, index) => {
    timeline.from(
        svgContainer.querySelectorAll(`.line-${index + 1}`),
        { scaleY: 0, duration },
        `start+=${duration * index}`
    );
};

const addDivergingBranchLineAnimation = (timeline, svgContainer, duration, index) => {
    timeline
        .from(
            svgContainer.querySelector(`.line-${index + 1}`),
            { scaleY: 0, duration },
            `start+=${duration * index}`
        )
        .from(
            svgContainer.querySelector(`.branch-${index + 1}`),
            { strokeDashoffset: 186, duration: Math.max(duration - 2, 0.3) },
            `start+=${duration * index}`
        )
        .from(
            svgContainer.querySelector(`.branch-line-${index + 1}`),
            { scaleY: 0, duration: Math.max(duration - 1, 0.35) },
            `start+=${duration * (index + 1) - 2}`
        );
};

const addConvergingBranchLineAnimation = (timeline, svgContainer, duration, index) => {
    timeline
        .from(
            svgContainer.querySelector(`.line-${index + 1}`),
            { scaleY: 0, duration },
            `start+=${duration * index}`
        )
        .from(
            svgContainer.querySelector(`.branch-line-${index + 1}`),
            { scaleY: 0, duration: Math.max(duration - 1, 0.35) },
            `start+=${duration * index}`
        )
        .from(
            svgContainer.querySelector(`.branch-${index + 1}`),
            { strokeDashoffset: 186, duration: Math.max(duration - 2, 0.3) },
            `start+=${duration * (index + 1) - 1}`
        );
};

const animateTimeline = (items, timeline, svgContainer, duration) => {
    let index = 0;

    addNodeRefsToItems(items).forEach((item) => {
        if (item.type !== NODE_TYPES.CHECKPOINT || !item.shouldDrawLine) {
            return;
        }

        if (item.prev?.type === NODE_TYPES.DIVERGE) {
            addDivergingBranchLineAnimation(timeline, svgContainer, duration, index);
        } else if (item.next?.type === NODE_TYPES.CONVERGE) {
            addConvergingBranchLineAnimation(timeline, svgContainer, duration, index);
        } else {
            addLineSvgAnimation(timeline, svgContainer, duration, index);
        }

        index += 1;
    });
};

const createFallbackSlide = (timelineContent, item) =>
    createTimelineSlide({
        eyebrow: timelineContent.eyebrow,
        title: item.title,
        subtitle: item.subtitle || "",
    });

const getTimelinePreviewLayouts = (timelineItems) =>
    addNodeRefsToItems(timelineItems)
        .filter((item) => item.type === NODE_TYPES.CHECKPOINT && item.shouldDrawLine)
        .map((item, previewIndex) => ({ item, previewIndex }));

const TimelinePreviewCard = ({ item, previewIndex, timelineContent, className = "", style }) => {
    const fallbackImage = createFallbackSlide(timelineContent, item);

    return (
        <article
            data-timeline-preview-card={previewIndex}
            className={`timeline-preview-card invisible w-full overflow-hidden rounded-2xl bg-slate-900/65 opacity-0 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 ${className}`}
            style={style}
        >
            <img
                src="/timeline/title-bar.svg"
                alt=""
                className="h-8 w-full"
                draggable={false}
            />
            <div className="relative aspect-[16/9] w-full bg-slate-950/80">
                <img
                    src={item.slideImage || fallbackImage}
                    alt={item.title}
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    onError={(event) => {
                        const image = event.currentTarget;

                        if (image.dataset.fallbackApplied) {
                            return;
                        }

                        image.dataset.fallbackApplied = "true";
                        image.src = fallbackImage;
                    }}
                    className="h-full w-full object-cover"
                />
            </div>
        </article>
    );
};

const Timeline = () => {
    const { content } = useContent();
    const timelineContent = content.timeline;
    const items = useMemo(() => timelineContent?.items || [], [timelineContent?.items]);
    const sectionRef = useRef(null);
    const svgContainerRef = useRef(null);
    const svgRef = useRef(null);
    const [resizeTick, setResizeTick] = useState(0);

    const checkpointItems = useMemo(
        () => items.filter((item) => item.type === NODE_TYPES.CHECKPOINT && item.shouldDrawLine),
        [items]
    );
    const timelineVisualHeight = useMemo(
        () => Math.max(checkpointItems.length * SEPARATION, SEPARATION),
        [checkpointItems.length]
    );
    const previewLayouts = useMemo(
        () => getTimelinePreviewLayouts(items),
        [items]
    );
    const compactLayout = typeof window !== "undefined" && isCompactScreen();

    useEffect(() => {
        let timeoutId;

        const handleResize = () => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                setResizeTick((currentValue) => currentValue + 1);
            }, RESIZE_DEBOUNCE_MS);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (!sectionRef.current || !svgContainerRef.current || !svgRef.current || checkpointItems.length === 0) {
            return undefined;
        }

        gsap.config({ nullTargetWarn: false });

        const svgWidth = Math.max(svgContainerRef.current.clientWidth || 0, 320);
        const svgLength = timelineVisualHeight;
        const rightBranchX = isCompactScreen() ? 70 : 109;

        svgRef.current.setAttribute("width", String(svgWidth));
        svgRef.current.setAttribute("height", String(svgLength));
        svgRef.current.setAttribute("viewBox", `0 0 ${svgWidth} ${svgLength}`);
        svgRef.current.innerHTML = generateTimelineSvg(items, svgWidth, rightBranchX);

        const timeline = gsap.timeline({
            defaults: {
                ease: "none",
                duration: 0.44,
            },
        }).addLabel("start");

        const duration = 3;
        const scrollTriggerInstance = ScrollTrigger.create({
            trigger: svgContainerRef.current,
            start: "top center",
            end: `+=${svgLength}`,
            scrub: 0,
            animation: timeline,
        });
        const previewCards = Array.from(sectionRef.current.querySelectorAll(".timeline-preview-card"));
        const previewTriggers = previewCards.map((card) => {
            gsap.set(card, {
                autoAlpha: 0,
                y: 24,
                scale: 0.985,
                filter: "brightness(1)",
            });

            const showCard = () => {
                gsap.to(card, {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    filter: "brightness(1.18)",
                    duration: 0.24,
                    ease: "power2.out",
                    overwrite: "auto",
                    onComplete: () => {
                        gsap.to(card, {
                            filter: "brightness(1)",
                            duration: 0.18,
                            ease: "power1.out",
                            overwrite: "auto",
                        });
                    },
                });
            };

            const hideCard = () => {
                gsap.to(card, {
                    autoAlpha: 0,
                    y: 18,
                    scale: 0.985,
                    filter: "brightness(1)",
                    duration: 0.22,
                    ease: "power2.inOut",
                    overwrite: "auto",
                });
            };

            return ScrollTrigger.create({
                trigger: card,
                start: "top 76%",
                end: "bottom 24%",
                onEnter: showCard,
                onEnterBack: showCard,
                onLeave: hideCard,
                onLeaveBack: hideCard,
            });
        });

        animateTimeline(items, timeline, svgContainerRef.current, duration);
        ScrollTrigger.refresh();

        return () => {
            scrollTriggerInstance?.kill();
            previewTriggers.forEach((trigger) => trigger.kill());
            timeline.kill();
            gsap.killTweensOf(previewCards);
            gsap.set(previewCards, {
                autoAlpha: 0,
                y: 24,
                scale: 0.985,
                filter: "brightness(1)",
            });
        };
    }, [checkpointItems, items, resizeTick, timelineVisualHeight, previewLayouts]);

    if (!timelineContent?.enabled) {
        return null;
    }

    return (
        <section
            id="timeline"
            ref={sectionRef}
            className="relative min-h-screen overflow-hidden py-24 text-white"
        >
            <div className="pointer-events-none absolute inset-0 opacity-90">
                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
                <div className="absolute left-[-12%] top-10 h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
                <div className="absolute right-[-10%] top-1/3 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.08),transparent_28%)]" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
                <div className="flex max-w-3xl flex-col">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                        {timelineContent.eyebrow}
                    </p>
                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        {timelineContent.title}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-slate-300 sm:text-2xl">
                        {timelineContent.subtitle}
                    </p>
                </div>

                <div className="mt-20 grid grid-cols-12 gap-6 xl:gap-10">
                    <div
                        ref={svgContainerRef}
                        style={{ gridColumn: compactLayout ? "1 / -1" : "span 6 / span 6" }}
                    >
                        <svg
                            ref={svgRef}
                            fill="none"
                            className="w-full"
                            aria-label="Timeline milestones"
                        />
                    </div>

                    <div
                        className="hidden md:block"
                        style={{
                            gridColumn: "span 6 / span 6",
                            minHeight: `${timelineVisualHeight}px`,
                        }}
                    >
                        {previewLayouts.map(({ item, previewIndex }, index) => (
                            <div
                                key={`${item.title}-${item.slideImage || "generated"}-${index}`}
                                className="timeline-preview-slot flex items-center"
                                style={{ height: `${SEPARATION}px` }}
                            >
                                <TimelinePreviewCard
                                    item={item}
                                    previewIndex={previewIndex}
                                    timelineContent={timelineContent}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Timeline;
