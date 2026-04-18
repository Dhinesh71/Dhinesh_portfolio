import React, { useRef } from "react";
import { TypeAnimation } from 'react-type-animation';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-scroll";
import { FaDownload } from "react-icons/fa6";
import { useContent } from "../../context/ContentContext";
import { socialHoverClassMap, socialIconMap } from "../../utils/socialLinks";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const { content } = useContent();
    const { hero } = content;
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const buttonsRef = useRef(null);

    useGSAP(() => {
        const timeline = gsap.timeline();

        timeline.from(contentRef.current.children, {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
        }).from(buttonsRef.current, {
            scale: 0.5,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
        }, "-=0.5");

        gsap.to(contentRef.current, {
            y: 150,
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
            },
        });

        gsap.to(buttonsRef.current, {
            y: 100,
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
            },
        });
    }, { scope: heroRef });

    return (
        <section ref={heroRef} id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 pt-20">
                <div ref={contentRef} className="space-y-10">
                    <h1 className="text-5xl md:text-7xl font-bold text-main tracking-tight">
                        {hero.name}
                    </h1>
                    <h2 className="text-3xl md:text-5xl font-bold text-main/70 min-h-[40px] md:min-h-[60px]">
                        <TypeAnimation
                            sequence={[
                                hero.role,
                                2000,
                                'Full Stack Developer',
                                2000,
                                'Creative Coder',
                                2000
                            ]}
                            wrapper="span"
                            speed={50}
                            repeat={Infinity}
                            className="inline-block"
                        />
                    </h2>
                    <p className="text-main/75 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        {hero.subheading}
                    </p>
                </div>

                <div
                    ref={buttonsRef}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16"
                >
                    <Link
                        to={hero.primaryCtaTarget || "projects"}
                        smooth
                        duration={500}
                        className="w-full sm:w-auto inline-block bg-accent text-onaccent font-bold px-10 py-4 rounded-full hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/50 cursor-pointer text-center"
                    >
                        {hero.primaryCtaText}
                    </Link>
                    <Link
                        to={hero.secondaryCtaTarget || "contact"}
                        smooth
                        duration={500}
                        className="w-full sm:w-auto inline-block bg-transparent border-2 border-accent text-accent font-bold px-10 py-4 rounded-full hover:bg-accent hover:text-onaccent transition-all shadow-lg cursor-pointer text-center"
                    >
                        {hero.secondaryCtaText}
                    </Link>
                    <a
                        href={hero.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-10 py-4 rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] cursor-pointer text-center scale-100 hover:-translate-y-1 duration-300"
                    >
                        <FaDownload className="text-xl animate-bounce" />
                        {hero.resumeCtaText}
                    </a>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-12 pb-10">
                    {hero.socialLinks.map((item, index) => {
                        const Icon = socialIconMap[item.icon] || socialIconMap.globe;
                        const hoverClass = socialHoverClassMap[item.icon] || "hover:text-accent";

                        return (
                            <a
                                key={`${item.label}-${index}`}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`relative group p-3 sm:p-4 rounded-full bg-secondary/70 text-main/75 transition-all duration-300 hover:-translate-y-2 hover:bg-secondary ${hoverClass} shadow-lg hover:shadow-[0_0_15px_currentColor] border border-main/15 hover:border-currentColor/50 flex items-center justify-center`}
                            >
                                <Icon className="text-xl sm:text-2xl" />
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-main text-xs font-semibold py-1.5 px-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-main/15">
                                    {item.label}
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45 border-b border-r border-main/15" />
                                </span>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Hero;
