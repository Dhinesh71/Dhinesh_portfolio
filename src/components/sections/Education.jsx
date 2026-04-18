import React, { useRef } from "react";
import SectionWrapper from "../common/SectionWrapper";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FaGraduationCap, FaUniversity } from "react-icons/fa";
import { useContent } from "../../context/ContentContext";

const Education = () => {
    const { content } = useContent();
    const { education } = content;
    const containerRef = useRef(null);
    const pathRef = useRef(null);

    useGSAP(() => {
        const nodes = containerRef.current.querySelectorAll(".edu-node");
        const path = pathRef.current;

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                once: true,
            },
        });

        timeline.from(path, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.5,
            ease: "power2.inOut",
        });

        timeline.from(nodes, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.3,
            ease: "back.out(1.7)",
        }, "-=1");
    }, { scope: containerRef });

    return (
        <SectionWrapper id="education" className="bg-secondary/5 overflow-hidden">
            <div ref={containerRef} className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-main mb-16">
                    {education.titlePrefix} <span className="text-accent">{education.titleHighlight}</span>
                </h2>

                <div className="relative hidden md:block">
                    <div
                        ref={pathRef}
                        className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20 -translate-y-1/2 rounded-full"
                    />

                    <div className="flex justify-between items-center relative min-h-[550px] z-10">
                        {education.items.map((entry, index) => {
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={entry.id}
                                    className="edu-node relative flex flex-col items-center w-1/3 h-full"
                                >
                                    <div className={`w-0.5 h-40 bg-accent/20 absolute left-1/2 -translate-x-1/2 ${isEven ? "bottom-1/2" : "top-1/2"}`} />

                                    <div className={`w-full px-4 ${isEven ? "mb-80" : "mt-80"}`}>
                                        <div className="bg-secondary/50 p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:border-accent/40 transition-all duration-300 w-full hover:scale-105 backdrop-blur-sm">
                                            <div className="text-accent font-mono text-xs mb-2">{entry.year}</div>
                                            <h3 className="text-lg font-bold text-main mb-1">{entry.degree}</h3>
                                            <p className="text-slate-500 text-xs mb-3 font-medium">{entry.institution}</p>
                                            <p className="text-slate-400 text-sm leading-snug">{entry.description}</p>
                                        </div>
                                    </div>

                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-full bg-secondary border-4 border-accent shadow-[0_0_20px_rgba(56,189,248,0.4)] flex items-center justify-center z-20 hover:scale-125 transition-all duration-300">
                                            {index === 1 ? <FaGraduationCap className="text-accent text-2xl" /> : <FaUniversity className="text-accent text-2xl" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="md:hidden relative border-l-2 border-accent/20 ml-4 space-y-12 pb-8">
                    {education.items.map((entry, index) => (
                        <div key={entry.id} className="edu-node relative pl-10">
                            <div className="absolute top-0 left-0 -translate-x-1/2 w-10 h-10 rounded-full bg-secondary border-4 border-accent flex items-center justify-center z-10 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                                {index === 1 ? <FaGraduationCap className="text-accent text-lg" /> : <FaUniversity className="text-accent text-lg" />}
                            </div>

                            <div className="bg-secondary/50 p-6 rounded-2xl border border-slate-700/50">
                                <div className="text-accent font-mono text-xs mb-1">{entry.year}</div>
                                <h3 className="text-lg font-bold text-main mb-1">{entry.degree}</h3>
                                <div className="text-slate-500 text-xs mb-2 font-medium">{entry.institution}</div>
                                <p className="text-slate-400 text-sm">{entry.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
};

export default Education;
