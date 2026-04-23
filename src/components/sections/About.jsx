import React, { useRef } from "react";
import SectionWrapper from "../common/SectionWrapper";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useContent } from "../../context/ContentContext";

const About = () => {
    const { content } = useContent();
    const { about } = content;
    const imageRef = useRef(null);

    useGSAP(() => {
        const image = imageRef.current;
        if (!image) return undefined;

        const onEnter = () => gsap.to(image, { scale: 1.05, duration: 0.3, ease: "power2.out" });
        const onLeave = () => gsap.to(image, { scale: 1, duration: 0.3, ease: "power2.out" });

        image.addEventListener("mouseenter", onEnter);
        image.addEventListener("mouseleave", onLeave);

        return () => {
            image.removeEventListener("mouseenter", onEnter);
            image.removeEventListener("mouseleave", onLeave);
        };
    }, { scope: imageRef });

    return (
        <SectionWrapper id="about" className="bg-secondary/30">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
                <div className="space-y-5 sm:space-y-6 text-section-content text-center md:text-left">
                    <h2 className="text-3xl sm:text-4xl font-bold text-main">
                        {about.titlePrefix} <span className="text-accent">{about.titleHighlight}</span>
                    </h2>

                    {about.paragraphs.map((paragraph, index) => (
                        <p key={`${paragraph.slice(0, 20)}-${index}`} className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
                </div>

                <div className="flex justify-center">
                    <div
                        ref={imageRef}
                        className="relative h-60 w-60 sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-96 lg:w-96 group cursor-pointer"
                    >
                        <div 
                            className="absolute -inset-[12px] rounded-full border-t-[6px] border-l-[6px] border-accent/90 animate-spin" 
                            style={{ animationDuration: '4s' }} 
                        />

                        <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-800/50 shadow-2xl shadow-slate-500/30 border-2 border-slate-600/40">
                            <div className="absolute inset-0 bg-transparent group-hover:bg-accent/20 transition-colors duration-300 z-10" />
                            <img
                                src={about.profileImage}
                                alt={about.profileAlt}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default About;
