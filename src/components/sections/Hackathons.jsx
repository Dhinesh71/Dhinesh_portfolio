import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SectionWrapper from "../common/SectionWrapper";
import {
    FaCalendarAlt,
    FaCertificate,
    FaExternalLinkAlt,
    FaGithub,
    FaImages,
    FaMapMarkerAlt,
    FaTimes,
    FaTrophy,
    FaUsers,
} from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useLoadMore } from "../../hooks/useLoadMore";
import { useContent } from "../../context/ContentContext";

const ImageLightbox = ({ src, onClose }) => createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#0b1a2b]/95 backdrop-blur-xl" onClick={onClose}>
        <button
            type="button"
            className="absolute top-6 right-6 text-slate-300 hover:text-white p-2 transition-transform hover:scale-110"
            onClick={onClose}
        >
            <FaTimes size={32} />
        </button>
        <Motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            src={src}
            alt="Zoomed Event Photo"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain border border-slate-700/50"
            onClick={(event) => event.stopPropagation()}
        />
    </div>,
    document.body
);

const HackathonModal = ({ hackathon, labels, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <Motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-primary border border-main/15 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col hide-scrollbar z-10"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors backdrop-blur-md"
                >
                    <FaTimes size={20} />
                </button>

                <div className="bg-secondary/40 p-6 sm:px-8 border-b border-main/15 relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 left-1/4 w-1/2 h-full bg-accent/5 blur-[50px] pointer-events-none" />
                    <div className="z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-2xl lg:text-3xl font-bold text-main">{hackathon.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-main/65 font-medium">
                                {hackathon.date && (
                                    <div className="flex items-center gap-1.5">
                                        <FaCalendarAlt className="text-accent/80" /> {hackathon.date}
                                    </div>
                                )}
                                {hackathon.location && (
                                    <div className="flex items-center gap-1.5">
                                        <FaMapMarkerAlt className="text-accent/80" /> {hackathon.location}
                                    </div>
                                )}
                                {hackathon.team && (
                                    <div className="flex items-center gap-1.5">
                                        <FaUsers className="text-accent/80" /> {hackathon.team.length} {labels.members}
                                    </div>
                                )}
                            </div>
                        </div>

                        {hackathon.achievement && (
                            <div className="inline-flex shrink-0 items-center gap-2.5 px-5 py-2.5 bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-full font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)] mt-2 sm:mt-0 text-sm tracking-wide">
                                <FaTrophy className="text-amber-500" /> {hackathon.achievement}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 flex-shrink-0">
                    {hackathon.projectScreenshot && (
                        <div className="flex items-start justify-center">
                            <div className="w-full rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.18)] border border-main/15 bg-black aspect-video lg:aspect-[4/3] max-h-[340px]">
                                <img
                                    src={hackathon.projectScreenshot}
                                    alt={hackathon.projectTitle}
                                    className="w-full h-full object-cover hover:opacity-100 transition-opacity duration-500"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col h-full gap-5">
                        <div>
                            <h4 className="text-3xl font-extrabold text-main tracking-tight leading-tight mb-3">
                                {hackathon.projectTitle}
                            </h4>
                            <p className="text-[16px] text-main/80 leading-relaxed font-light">
                                {hackathon.projectDescription}
                            </p>
                        </div>

                        {hackathon.keyLearnings && (
                            <div className="mt-2 p-5 rounded-xl bg-gradient-to-br from-secondary/80 to-primary/70 backdrop-blur-sm border border-main/15 flex items-start gap-4">
                                <div className="shrink-0 p-2 bg-accent/10 rounded-lg text-accent text-lg">Insight</div>
                                <div className="pt-0.5">
                                    <span className="font-bold text-main tracking-wide text-[13px] uppercase mb-1 block opacity-90">
                                        {labels.coreInsight}
                                    </span>
                                    <span className="leading-relaxed text-sm text-main/70">{hackathon.keyLearnings}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2.5 mt-2">
                            {hackathon.tech.map((tag) => (
                                <span key={tag} className="text-[13px] font-semibold px-3 py-1.5 bg-secondary/80 text-main/80 rounded-lg border border-main/20 shadow-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row flex-nowrap gap-3 mt-auto pt-4 w-full">
                            {hackathon.demo && (
                                <a href={hackathon.demo} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 px-3 py-3 rounded-lg bg-accent text-onaccent font-bold text-sm lg:text-base hover:bg-accent/90 transition-all shadow-md shadow-accent/20 active:scale-95 whitespace-nowrap">
                                    <FaExternalLinkAlt size={14} /> {labels.liveDemo}
                                </a>
                            )}
                            {hackathon.github && (
                                <a href={hackathon.github} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 px-3 py-3 rounded-lg border-2 border-main/30 font-bold text-main/80 text-sm lg:text-base hover:text-main hover:border-main/50 hover:bg-secondary transition-all active:scale-95 whitespace-nowrap">
                                    <FaGithub size={16} /> {labels.viewCode}
                                </a>
                            )}
                            {hackathon.certificate && (
                                <a href={hackathon.certificate} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 px-3 py-3 rounded-lg border-2 border-amber-500 bg-amber-500 text-onaccent font-bold text-sm lg:text-base hover:bg-amber-400 hover:border-amber-400 transition-all active:scale-95 whitespace-nowrap">
                                    <FaCertificate size={15} /> {labels.certificate}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {hackathon.eventPhotos && hackathon.eventPhotos.length > 0 && (
                    <div className="border-t border-main/20 p-6 sm:p-8 bg-secondary/20 flex-shrink-0">
                        <h4 className="text-xs font-bold text-main/60 uppercase tracking-[0.15em] flex items-center gap-2.5 mb-5 opacity-90">
                            <FaImages className="text-accent" size={15} /> {labels.gallery}
                        </h4>
                        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                            {hackathon.eventPhotos.map((photo, index) => (
                                <div
                                    key={`${hackathon.id}-photo-${index}`}
                                    onClick={() => setSelectedImage(photo)}
                                    className="relative rounded-xl overflow-hidden border border-main/15 aspect-[4/3] cursor-zoom-in group/gallery hover:border-accent/50 transition-all bg-primary"
                                >
                                    <img src={photo} alt={`Event Photo ${index + 1}`} className="relative z-10 w-full h-full object-cover filter-none group-hover/gallery:scale-[1.03] transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Motion.div>

            <AnimatePresence>
                {selectedImage && <ImageLightbox src={selectedImage} onClose={() => setSelectedImage(null)} />}
            </AnimatePresence>
        </div>,
        document.body
    );
};

const HackathonCard = ({ hackathon, labels, onClick }) => (
    <Motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={onClick}
        className="relative z-10 flex flex-col bg-secondary/30 rounded-2xl overflow-hidden border border-main/15 hover:border-accent/40 shadow-lg hover:shadow-[0_8px_25px_rgba(var(--accent-rgb),0.15)] transition-all cursor-pointer group"
    >
        <div className="relative aspect-video w-full overflow-hidden bg-black border-b border-main/15">
            <img
                src={hackathon.projectScreenshot}
                alt={hackathon.title}
                className="w-full h-full object-cover filter-none transform group-hover:scale-105 transition-transform duration-500"
            />

            {hackathon.achievement && (
                <div className="absolute top-3 right-3 z-20 px-3 py-1 bg-[#1e293b]/90 backdrop-blur-md text-amber-400 border border-amber-500/30 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5">
                    <FaTrophy className="text-amber-500" /> {hackathon.achievement}
                </div>
            )}
        </div>

        <div className="p-5 flex flex-col flex-1 gap-2.5">
            <h4 className="text-[18px] font-bold text-main group-hover:text-accent transition-colors leading-tight line-clamp-1">
                {hackathon.title}
            </h4>
            <p className="text-sm text-main/65 line-clamp-2 leading-relaxed">
                {hackathon.hackathonDescription}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
                {hackathon.demo && (
                    <a
                        href={hackathon.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-onaccent bg-accent hover:bg-accent/90 px-3 py-1.5 rounded-md transition-colors"
                    >
                        <FaExternalLinkAlt size={11} /> {labels.liveDemo}
                    </a>
                )}
                {hackathon.github && (
                    <a
                        href={hackathon.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-main/75 border border-main/25 hover:text-main hover:bg-secondary px-3 py-1.5 rounded-md transition-colors"
                    >
                        <FaGithub size={12} /> {labels.code}
                    </a>
                )}
                {hackathon.certificate && (
                    <a
                        href={hackathon.certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 rounded-md transition-colors"
                    >
                        <FaCertificate size={12} /> {labels.certificate}
                    </a>
                )}
            </div>

            <div className="mt-auto pt-3 flex items-center text-xs text-main/55 font-medium tracking-wide w-full justify-between">
                <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-accent/60" /> {hackathon.date}</span>
                <span className="text-accent font-semibold group-hover:translate-x-1 transition-transform">
                    {labels.details} {"->"}
                </span>
            </div>
        </div>
    </Motion.div>
);

const Hackathons = () => {
    const { content } = useContent();
    const { hackathons } = content;
    const { visibleCount, handleLoadMore, hasMore } = useLoadMore(
        hackathons.initialCount,
        hackathons.loadCount,
        hackathons.items.length
    );
    const visibleHackathons = hackathons.items.slice(0, visibleCount);
    const [selectedHackathon, setSelectedHackathon] = useState(null);

    useEffect(() => {
        const closeAllModals = () => setSelectedHackathon(null);
        window.addEventListener("closeModals", closeAllModals);
        return () => window.removeEventListener("closeModals", closeAllModals);
    }, []);

    return (
        <SectionWrapper id="hackathons" className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-main mb-14">
                {hackathons.titlePrefix} <span className="text-accent">{hackathons.titleHighlight}</span>
            </h2>

            <div className="max-w-7xl mx-auto flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <AnimatePresence mode="popLayout">
                        {visibleHackathons.map((hackathon) => (
                            <HackathonCard
                                key={hackathon.id}
                                hackathon={hackathon}
                                labels={hackathons.labels}
                                onClick={() => setSelectedHackathon(hackathon)}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                <div className="flex justify-center mt-12">
                    {hackathons.items.length > hackathons.initialCount && (
                        hasMore ? (
                            <Motion.button
                                type="button"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLoadMore}
                                className="px-10 py-3.5 rounded-full border-2 border-accent text-accent font-bold hover:bg-accent hover:text-onaccent transition-colors shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]"
                            >
                                {hackathons.loadMoreText}
                            </Motion.button>
                        ) : (
                            <div className="relative w-full max-w-sm flex items-center justify-center p-4">
                                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-main/25 to-transparent" />
                                <span className="bg-primary px-5 text-main/55 text-sm font-semibold tracking-wider uppercase z-10 opacity-80">
                                    {hackathons.endText}
                                </span>
                            </div>
                        )
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedHackathon && (
                    <HackathonModal
                        hackathon={selectedHackathon}
                        labels={hackathons.labels}
                        onClose={() => setSelectedHackathon(null)}
                    />
                )}
            </AnimatePresence>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </SectionWrapper>
    );
};

export default Hackathons;
