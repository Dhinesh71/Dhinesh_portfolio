import React, { useEffect, useRef } from "react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import VanillaTilt from "vanilla-tilt";
import { useContent } from "../../context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

const PROJECT_GRADIENTS = [
    ["#0f172a", "#164e63"],
    ["#172554", "#1d4ed8"],
    ["#1f2937", "#0f766e"],
    ["#312e81", "#7c3aed"],
    ["#0f172a", "#9333ea"],
    ["#111827", "#ea580c"],
];

const DEFAULT_PROJECT_DESCRIPTION =
    "A selection of full-stack products, frontend builds, and motion-rich interfaces designed with clean structure and strong usability.";

const ProjectCard = ({ project, index, labels, registerCard }) => {
    const [startColor, endColor] = PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length];
    const visibleTech = project.tech.slice(0, 8);

    return (
        <article
            ref={registerCard(index)}
            className="project-card group perspective-1000 relative h-[21rem] w-[min(32rem,calc(100vw-2rem))] shrink-0 snap-start sm:w-[28rem] lg:w-[32rem]"
        >
            <div 
                className="relative h-full w-full transition-transform duration-700 preserve-3d group-hover:rotate-y-180"
            >
                {/* Front Side: ONLY Image */}
                <div className="absolute inset-0 backface-hidden rounded-[1.75rem] overflow-hidden border border-white/10 shadow-xl bg-slate-900">
                    <img
                        key={`${project.id}-${project.image}`}
                        src={project.image}
                        alt={project.title}
                        draggable={false}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    
                    {/* Subtle Title Overlay on Front */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    </div>
                </div>

                {/* Back Side: Details & Links */}
                <div 
                    className="absolute inset-0 backface-hidden rotate-y-180 rounded-[1.75rem] border border-white/15 p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl"
                    style={{ background: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)` }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_40%)] opacity-50" />
                    
                    <div className="relative z-10">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-white/60">
                            Project {String(index + 1).padStart(2, "0")}
                        </p>
                        
                        <h3 className="mt-3 text-2xl font-bold leading-tight text-white line-clamp-1">
                            {project.title}
                        </h3>

                        <p
                            className="mt-3 text-xs leading-relaxed text-white/85 sm:text-sm line-clamp-4"
                        >
                            {project.description}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {visibleTech.map((tag) => (
                                <span
                                    key={`${project.id}-${tag}-chip`}
                                    className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-3 pt-6">
                        {project.github && (
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all hover:border-white hover:bg-white hover:text-slate-950"
                            >
                                <FaGithub size={14} />
                                {labels.github}
                            </a>
                        )}

                        {project.demo && (
                            <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-white transition-all hover:border-cyan-400 hover:bg-cyan-400 hover:text-slate-950"
                            >
                                <FaExternalLinkAlt size={12} />
                                {labels.demo}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

const Projects = () => {
    const sectionRef = useRef(null);
    const railViewportRef = useRef(null);
    const railTrackRef = useRef(null);
    const cardRefs = useRef([]);
    const { content } = useContent();
    const { projects } = content;

    const registerCard = (index) => (node) => {
        if (node) {
            cardRefs.current[index] = node;
            return;
        }

        delete cardRefs.current[index];
    };

    useEffect(() => {
        const cards = cardRefs.current.filter(Boolean);

        if (!cards.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return undefined;
        }

        VanillaTilt.init(cards, {
            max: 4,
            speed: 400,
            glare: true,
            "max-glare": 0.18,
            gyroscope: false,
        });

        return () => {
            cards.forEach((card) => card.vanillaTilt?.destroy());
        };
    }, [projects.items]);

    useGSAP(() => {
        const section = sectionRef.current;
        const viewport = railViewportRef.current;
        const track = railTrackRef.current;

        if (!section || !viewport || !track) {
            return undefined;
        }

        const mm = gsap.matchMedia();

        mm.add(
            {
                desktop: "(min-width: 1024px)",
                motionAllowed: "(prefers-reduced-motion: no-preference)",
            },
            (context) => {
                const { desktop, motionAllowed } = context.conditions;
                let horizontalTween;
                let horizontalTrigger;

                const revealTween = gsap.from(section.querySelectorAll(".projects-copy, .project-card"), {
                    y: 44,
                    opacity: 0,
                    duration: 0.85,
                    stagger: 0.08,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 72%",
                        once: true,
                    },
                });

                const resetRail = () => {
                    gsap.set(track, { clearProps: "transform" });
                    viewport.style.removeProperty("overflow-x");
                    viewport.style.removeProperty("overflow-y");
                };

                resetRail();

                if (desktop && motionAllowed) {
                    const getHorizontalDistance = () =>
                        Math.max(track.scrollWidth - viewport.clientWidth, 0);

                    if (getHorizontalDistance() > 0) {
                        viewport.style.overflowX = "hidden";
                        viewport.style.overflowY = "visible";

                        horizontalTween = gsap.to(track, {
                            x: () => -getHorizontalDistance(),
                            ease: "none",
                        });

                        horizontalTrigger = ScrollTrigger.create({
                            trigger: section,
                            start: "top top",
                            end: () => `+=${getHorizontalDistance()}`,
                            scrub: 1,
                            pin: true,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                            animation: horizontalTween,
                        });
                    }
                } else {
                    viewport.style.overflowX = "auto";
                    viewport.style.overflowY = "hidden";
                }

                return () => {
                    horizontalTrigger?.kill();
                    horizontalTween?.kill();
                    revealTween.scrollTrigger?.kill();
                    revealTween.kill();
                    resetRail();
                };
            }
        );

        return () => mm.revert();
    }, { scope: sectionRef, dependencies: [projects.items] });

    return (
        <section
            id="projects"
            ref={sectionRef}
            className="relative scroll-mt-0 overflow-hidden py-24 sm:py-28 lg:min-h-screen lg:py-20"
        >
            <div id="projects-anchor" className="absolute -top-16 left-0 w-px h-px pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.14),transparent_32%)]" />

            <div className="relative z-10 flex w-full flex-col px-4 sm:px-6 lg:px-8">
                <div className="projects-copy max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent/80">
                        {projects.titlePrefix}
                    </p>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        <span className="text-accent">{projects.titleHighlight}</span>
                    </h2>


                </div>

                <div
                    ref={railViewportRef}
                    className="project-rail mt-12 overflow-x-auto snap-x snap-mandatory pb-4"
                >
                    <div
                        ref={railTrackRef}
                        className="flex w-max gap-6 pr-4 sm:gap-7 sm:pr-6 lg:gap-8 lg:pr-8"
                    >
                        {projects.items.map((project, index) => (
                            <ProjectCard
                                key={`${project.id}-${project.title}-${project.image}`}
                                project={project}
                                index={index}
                                labels={projects.labels}
                                registerCard={registerCard}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
