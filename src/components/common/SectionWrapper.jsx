import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animationConfig } from "../../utils/config";

gsap.registerPlugin(ScrollTrigger);

const SectionWrapper = ({ id, children, className = "" }) => {
    const containerRef = useRef(null);

    useGSAP(() => {
        const elements = containerRef.current.children;

        gsap.from(elements, {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: animationConfig.transitions.staggerChildren,
            ease: "power2.out",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%", // Trigger when top of section is at 80% viewport height
                once: true,
            }
        });
    }, { scope: containerRef });

    return (
        <section id={id} className={`min-h-screen flex flex-col justify-center py-20 w-full overflow-hidden ${className}`}>
            <div
                ref={containerRef}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
            >
                {children}
            </div>
        </section>
    );
};

export default SectionWrapper;
