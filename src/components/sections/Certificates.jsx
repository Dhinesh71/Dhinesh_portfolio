import React, { useMemo, useState } from "react";
import SectionWrapper from "../common/SectionWrapper";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { useLoadMore } from "../../hooks/useLoadMore";
import Modal from "../common/Modal";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useContent } from "../../context/ContentContext";

const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".avif"];

const getCertificateType = (link) => {
    const normalizedLink = (link || "").toLowerCase().split("?")[0].split("#")[0];

    if (normalizedLink.endsWith(".pdf")) return "pdf";
    if (imageExtensions.some((extension) => normalizedLink.endsWith(extension))) return "image";

    return "embed";
};

const getPriorityClassName = (priority = "") => {
    const normalizedPriority = priority.toLowerCase();

    if (normalizedPriority.includes("high")) {
        return "border-amber-400/40 bg-amber-400/10 text-amber-300";
    }

    if (normalizedPriority.includes("medium")) {
        return "border-sky-400/40 bg-sky-400/10 text-sky-300";
    }

    return "border-main/15 bg-main/5 text-main/65";
};

const Certificates = () => {
    const { content } = useContent();
    const { certificates } = content;
    const { visibleCount, handleLoadMore, hasMore } = useLoadMore(
        certificates.initialCount,
        certificates.loadCount,
        certificates.items.length
    );
    const visibleCertificates = certificates.items.slice(0, visibleCount);
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    const selectedType = useMemo(
        () => getCertificateType(selectedCertificate?.link),
        [selectedCertificate]
    );

    return (
        <SectionWrapper id="certificates" className="bg-secondary/30">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-main mb-10 sm:mb-16">
                {certificates.titlePrefix} <span className="text-accent">{certificates.titleHighlight}</span>
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 mb-10 sm:mb-12">
                <AnimatePresence mode="popLayout">
                    {visibleCertificates.map((certificate) => (
                        <Motion.div
                            key={certificate.id}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                            viewport={{ once: true, amount: 0.1 }}
                            className="cert-card group relative z-10 bg-secondary/50 p-5 sm:p-6 rounded-2xl border border-main/15 hover:border-accent/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)] hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden h-full"
                        >
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/5 rounded-full group-hover:bg-accent/10 transition-colors" />

                            <div className="mb-4 flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
                                <div className="text-3xl sm:text-4xl text-accent group-hover:scale-110 transition-transform duration-300">
                                    <HiOutlineBadgeCheck />
                                </div>

                                {certificate.priority && (
                                    <span className={`max-w-full rounded-full border px-3 py-1 text-center text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.12em] sm:tracking-[0.16em] ${getPriorityClassName(certificate.priority)}`}>
                                        {certificate.priority}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-main mb-2 tracking-tight">
                                {certificate.title}
                            </h3>

                            <p className="text-accent text-sm font-semibold mb-1">
                                {certificate.issuer}
                            </p>

                            <p className="text-main/60 text-xs">
                                {certificates.labels.issuedPrefix} {certificate.date}
                            </p>

                            {certificate.description && (
                                <p className="mt-4 text-sm leading-relaxed text-main/70 flex-grow">
                                    {certificate.description}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => setSelectedCertificate(certificate)}
                                className="mt-5 w-full rounded-full border border-accent/20 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition-all duration-300 hover:bg-accent hover:text-onaccent sm:w-auto sm:px-6 sm:py-2"
                            >
                                {certificates.labels.viewButton}
                            </button>
                        </Motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex justify-center mt-8">
                {hasMore ? (
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        className="w-full rounded-full border-2 border-accent px-6 py-3 font-bold text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:text-onaccent hover:shadow-[0_0_25px_rgba(var(--accent-rgb),0.4)] sm:w-auto sm:px-8"
                    >
                        {certificates.loadMoreText}
                    </button>
                ) : (
                    <p className="text-slate-500 italic text-sm">
                        {certificates.endText}
                    </p>
                )}
            </div>

            <Modal
                isOpen={Boolean(selectedCertificate)}
                onClose={() => setSelectedCertificate(null)}
                title={selectedCertificate ? `${selectedCertificate.title} - ${selectedCertificate.issuer}` : "Certificate Preview"}
                maxWidthClass="max-w-6xl"
            >
                {selectedCertificate && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-main/75">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent font-semibold">
                                <HiOutlineBadgeCheck className="text-base" />
                                {selectedCertificate.issuer}
                            </span>
                            <span className="text-main/60">{certificates.labels.issuedPrefix} {selectedCertificate.date}</span>
                            {selectedCertificate.priority && (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-[0.16em] ${getPriorityClassName(selectedCertificate.priority)}`}>
                                    {selectedCertificate.priority}
                                </span>
                            )}
                        </div>

                        {selectedCertificate.description && (
                            <p className="text-sm leading-relaxed text-main/70">
                                {selectedCertificate.description}
                            </p>
                        )}

                        <div className="rounded-xl border border-main/15 bg-black/20 overflow-hidden">
                            {selectedType === "image" && (
                                <div className="flex items-center justify-center bg-primary min-h-[35vh] sm:min-h-[60vh]">
                                    <img
                                        src={selectedCertificate.link}
                                        alt={selectedCertificate.title}
                                        className="w-full max-h-[70vh] object-contain sm:max-h-[75vh]"
                                    />
                                </div>
                            )}

                            {selectedType === "pdf" && (
                                <iframe
                                    title={selectedCertificate.title}
                                    src={selectedCertificate.link}
                                    className="w-full h-[75vh] bg-white"
                                />
                            )}

                            {selectedType === "embed" && (
                                <iframe
                                    title={selectedCertificate.title}
                                    src={selectedCertificate.link}
                                    className="w-full h-[75vh] bg-white"
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-start gap-4 flex-wrap">
                            <p className="text-xs sm:text-sm text-main/55">
                                {certificates.labels.closeHint}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </SectionWrapper>
    );
};

export default Certificates;
