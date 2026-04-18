import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaBars, FaCircle, FaMoon, FaPalette, FaSun, FaTimes } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useContent } from "../../context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

const getThemeLabel = (theme) => {
    if (theme === "dark-blue") return "Dark Blue";
    if (theme === "black") return "Black";
    return "Light";
};

const getThemeIcon = (theme, className = "") => {
    if (theme === "dark-blue") return <FaMoon className={className || "text-cyan-300"} />;
    if (theme === "black") return <FaCircle className={className || "text-slate-100"} />;
    return <FaSun className={className || "text-amber-500"} />;
};

const getThemeSwatchClass = (theme) => {
    if (theme === "dark-blue") return "bg-gradient-to-br from-slate-700 to-blue-900";
    if (theme === "black") return "bg-gradient-to-br from-black to-slate-950";
    return "bg-gradient-to-br from-slate-100 to-sky-200";
};

const Navbar = () => {
    const { content } = useContent();
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
    const navRef = useRef(null);
    const secretTapRef = useRef({ count: 0, timeoutId: null });

    const enabledLinks = content.navigation.links.filter((link) => {
        if (link.enabled === false) {
            return false;
        }

        const targetSection = content[link.to];
        if (targetSection && targetSection.enabled === false) {
            return false;
        }

        return true;
    });
    const brandTarget = enabledLinks[0]?.to || "hero";

    const handleThemeSelect = (nextTheme) => {
        setTheme(nextTheme);
        setIsThemePickerOpen(false);
    };

    const handleBrandTap = () => {
        window.dispatchEvent(new Event("closeModals"));

        if (secretTapRef.current.timeoutId) {
            window.clearTimeout(secretTapRef.current.timeoutId);
        }

        secretTapRef.current.count += 1;

        if (secretTapRef.current.count >= 5) {
            secretTapRef.current.count = 0;
            secretTapRef.current.timeoutId = null;
            window.dispatchEvent(new Event("openAdminPanel"));
            return;
        }

        secretTapRef.current.timeoutId = window.setTimeout(() => {
            secretTapRef.current.count = 0;
            secretTapRef.current.timeoutId = null;
        }, 1500);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280 && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    useEffect(() => {
        const secretTapState = secretTapRef.current;

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsThemePickerOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            if (secretTapState.timeoutId) {
                window.clearTimeout(secretTapState.timeoutId);
            }
        };
    }, []);

    return (
        <>
            <nav
                ref={navRef}
                className="fixed top-0 w-full z-40 transition-colors duration-300 bg-primary/80 backdrop-blur-md shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0 cursor-pointer text-2xl font-bold text-accent">
                            <Link
                                to={brandTarget}
                                smooth
                                duration={500}
                                onClick={handleBrandTap}
                            >
                                {content.site.brandName}
                            </Link>
                        </div>

                        <div className="hidden xl:block">
                            <div className="ml-8 flex items-center space-x-2 2xl:space-x-4">
                                {enabledLinks.map((link) => (
                                    <Link
                                        key={`${link.to}-${link.name}`}
                                        to={link.to}
                                        smooth
                                        duration={500}
                                        onClick={() => window.dispatchEvent(new Event("closeModals"))}
                                        className="cursor-pointer hover:text-accent px-2 py-2 rounded-md text-sm 2xl:text-base font-medium transition-colors whitespace-nowrap"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setIsThemePickerOpen(true)}
                                    className="group inline-flex items-center gap-2 rounded-full border border-main/15 bg-secondary/60 px-3.5 py-2 text-sm font-medium text-main transition-all hover:border-accent/50 hover:bg-secondary"
                                    aria-label={`Change theme (current: ${getThemeLabel(theme)})`}
                                    title={`Theme: ${getThemeLabel(theme)}`}
                                >
                                    <span className={`h-2.5 w-2.5 rounded-full ring-2 ring-white/20 ${getThemeSwatchClass(theme)}`} />
                                    <span className="hidden 2xl:inline">Theme</span>
                                    {getThemeIcon(theme, "text-accent")}
                                    <FaPalette className="text-main/60 group-hover:text-accent transition-colors" />
                                </button>
                            </div>
                        </div>

                        <div className="-mr-2 flex xl:hidden gap-3 sm:gap-4">
                            <button
                                type="button"
                                onClick={() => setIsThemePickerOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-main/15 bg-secondary/60 px-3 py-2 text-main transition-all hover:border-accent/50 hover:bg-secondary"
                                aria-label={`Change theme (current: ${getThemeLabel(theme)})`}
                                title={`Theme: ${getThemeLabel(theme)}`}
                            >
                                <span className={`h-2.5 w-2.5 rounded-full ring-2 ring-white/20 ${getThemeSwatchClass(theme)}`} />
                                {getThemeIcon(theme, "text-accent")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(true)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                                aria-label="Open main menu"
                            >
                                <FaBars size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div
                className={`fixed inset-0 z-50 w-full h-screen bg-[#0b1a2b]/95 backdrop-blur-md transition-transform duration-300 xl:hidden flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex justify-between items-center p-6 w-full">
                    <div className="text-2xl font-bold text-accent">
                        <Link to={brandTarget} smooth duration={500} onClick={handleBrandTap}>
                            {content.site.brandName}
                        </Link>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-white focus:outline-none transition-colors"
                        aria-label="Close menu"
                    >
                        <FaTimes size={28} />
                    </button>
                </div>

                <div className="flex flex-1 flex-col items-center justify-start gap-5 px-6 pt-4 pb-10 text-xl sm:text-2xl overflow-y-auto">
                    {enabledLinks.map((link) => (
                        <Link
                            key={`${link.to}-${link.name}-mobile`}
                            to={link.to}
                            smooth
                            duration={500}
                            onClick={() => {
                                setIsOpen(false);
                                window.dispatchEvent(new Event("closeModals"));
                            }}
                            className="block cursor-pointer text-slate-200 hover:text-accent hover:scale-110 transition-all duration-300 font-semibold tracking-wide"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>

            {isThemePickerOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-main/25 backdrop-blur-sm flex items-start sm:items-center justify-center px-4 pt-24 sm:pt-0"
                    onClick={() => setIsThemePickerOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Select Theme"
                >
                    <div
                        className="w-full max-w-sm rounded-2xl border border-main/15 bg-primary/95 shadow-2xl p-5 text-main"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Choose Theme</h3>
                            <button
                                type="button"
                                onClick={() => setIsThemePickerOpen(false)}
                                className="p-2 rounded-full text-main/60 hover:text-main hover:bg-secondary transition-colors"
                                aria-label="Close theme chooser"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {themes.map((themeOption) => {
                                const selected = themeOption === theme;

                                return (
                                    <button
                                        key={themeOption}
                                        type="button"
                                        onClick={() => handleThemeSelect(themeOption)}
                                        className={`w-full flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${selected
                                            ? "border-accent bg-accent/15"
                                            : "border-main/15 bg-secondary/35 hover:bg-secondary hover:border-main/25"
                                        }`}
                                    >
                                        <span className="flex items-center gap-3 font-medium">
                                            <span className={`h-3 w-3 rounded-full ring-2 ring-white/20 ${getThemeSwatchClass(themeOption)}`} />
                                            {getThemeIcon(themeOption, selected ? "text-accent" : "text-main/80")}
                                            {getThemeLabel(themeOption)}
                                        </span>
                                        <span className={`text-xs font-semibold ${selected ? "text-accent" : "text-main/50"}`}>
                                            {selected ? "Selected" : "Select"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
