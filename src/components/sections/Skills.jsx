import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    HiCodeBracket,
    HiCommandLine,
    HiCpuChip,
    HiPuzzlePiece,
    HiServerStack,
    HiWrenchScrewdriver,
} from "react-icons/hi2";
import {
    SiC,
    SiCplusplus,
    SiExpress,
    SiFirebase,
    SiGit,
    SiGreensock,
    SiHtml5,
    SiJavascript,
    SiMongodb,
    SiNodedotjs,
    SiNpm,
    SiPostman,
    SiPostgresql,
    SiReact,
    SiSupabase,
    SiTailwindcss,
    SiThreedotjs,
    SiVite,
} from "react-icons/si";
import { TbApi } from "react-icons/tb";
import { useContent } from "../../context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

const categoryIcons = {
    "Frontend Development": <HiCodeBracket className="text-3xl text-sky-400" />,
    "Backend & Database": <HiServerStack className="text-3xl text-emerald-400" />,
    "Languages & Core": <HiCommandLine className="text-3xl text-purple-400" />,
    "Tools & Ecosystem": <HiWrenchScrewdriver className="text-3xl text-amber-400" />,
};

const skillIcons = {
    "React.js": <SiReact className="text-[#61DAFB]" />,
    "JavaScript (ES6+)": <SiJavascript className="text-[#F7DF1E]" />,
    "Tailwind CSS": <SiTailwindcss className="text-[#06B6D4]" />,
    "HTML5/CSS3": <SiHtml5 className="text-[#E34F26]" />,
    "GSAP Animations": <SiGreensock className="text-[#88CE02]" />,
    "Three.js": <SiThreedotjs className="text-white" />,
    "Node.js": <SiNodedotjs className="text-[#339933]" />,
    "Express.js": <SiExpress className="text-white bg-black rounded-sm p-0.5" />,
    MongoDB: <SiMongodb className="text-[#47A248]" />,
    Supabase: <SiSupabase className="text-[#3ECF8E]" />,
    PostgreSQL: <SiPostgresql className="text-[#4169E1]" />,
    Postgres: <SiPostgresql className="text-[#4169E1]" />,
    "RESTful APIs": <TbApi className="text-accent" />,
    Firebase: <SiFirebase className="text-[#FFCA28]" />,
    C: <SiC className="text-[#A8B9CC]" />,
    "C++": <SiCplusplus className="text-[#00599C]" />,
    "Data Structures": <HiCpuChip className="text-purple-400" />,
    Algorithms: <HiPuzzlePiece className="text-purple-300" />,
    "Git & GitHub": <SiGit className="text-[#F05032]" />,
    Postman: <SiPostman className="text-[#FF6C37]" />,
    Vite: <SiVite className="text-[#646CFF]" />,
    "NPM/Yarn": <SiNpm className="text-[#CB3837]" />,
};

const Skills = () => {
    const { content } = useContent();
    const { skills } = content;
    const containerRef = useRef(null);
    const cardsRef = useRef([]);

    useGSAP(() => {
        cardsRef.current.forEach((card, index) => {
            if (!card) return;

            gsap.to(card, {
                y: "random(-10, 10)",
                rotationZ: "random(-1, 1)",
                duration: "random(4, 6)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: index * 0.4,
            });
        });
    }, { scope: containerRef });

    return (
        <section id="skills" className="relative py-16 sm:py-20 lg:py-24 overflow-hidden min-h-screen flex flex-col justify-center">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 h-72 w-72 sm:h-[500px] sm:w-[500px] bg-accent/5 rounded-full blur-[120px] sm:blur-[150px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 h-80 w-80 sm:h-[600px] sm:w-[600px] bg-purple-500/5 rounded-full blur-[140px] sm:blur-[180px] animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={containerRef}>
                <div className="text-center mb-10 sm:mb-14 lg:mb-20">
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-main mb-5 sm:mb-6 tracking-tight">
                        {skills.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">{skills.titleHighlight}</span>
                    </h2>
                    <div className="h-1.5 sm:h-2 w-24 sm:w-32 bg-gradient-to-r from-accent to-purple-400 mx-auto rounded-full shadow-[0_4px_20px_rgba(var(--color-accent),0.4)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
                    {skills.categories.map((category, index) => (
                        <div
                            key={`${category.category}-${index}`}
                            ref={(element) => {
                                cardsRef.current[index] = element;
                            }}
                            className="group relative p-5 sm:p-7 lg:p-10 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] bg-secondary/80 dark:bg-secondary/30 backdrop-blur-3xl border-2 border-white/10 hover:border-accent/40 shadow-2xl transition-all duration-700 hover:shadow-accent/20 overflow-hidden"
                        >
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
                                    <div className="p-3 sm:p-5 rounded-2xl sm:rounded-[1.5rem] bg-primary/50 dark:bg-white/5 border border-white/10 group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-500 group-hover:-rotate-12 shadow-inner">
                                        {categoryIcons[category.category] || <HiCodeBracket className="text-4xl text-accent" />}
                                    </div>
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-main tracking-tight group-hover:text-accent transition-colors duration-300">
                                        {category.category}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    {category.skills.map((skill) => (
                                        <div
                                            key={skill}
                                            className="flex min-h-[6rem] flex-col items-center justify-center p-3 sm:p-4 bg-primary/40 dark:bg-white/[0.03] rounded-xl sm:rounded-2xl border border-white/5 group-hover:border-accent/10 hover:bg-accent/5 hover:scale-105 transition-all duration-300 group/item cursor-default"
                                        >
                                            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover/item:scale-125 transition-transform duration-500">
                                                {skillIcons[skill] || 
                                                 skillIcons[skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()] ||
                                                 skillIcons[skill.toUpperCase()] ||
                                                 skillIcons[skill.toLowerCase()] ||
                                                 <HiCommandLine className="text-accent/50" />}
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide sm:tracking-widest text-center break-words leading-tight group-hover/item:text-main transition-colors">
                                                {skill}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="absolute left-0 bottom-0 w-0 h-1.5 bg-gradient-to-r from-accent via-purple-400 to-transparent group-hover:w-full transition-all duration-1000 ease-in-out" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
