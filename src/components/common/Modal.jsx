import React, { useEffect } from "react";
import { createPortal } from "react-dom";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const Modal = ({ isOpen, onClose, title, children, maxWidthClass = "max-w-5xl" }) => {
    useEffect(() => {
        if (!isOpen) return undefined;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 18 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ type: "spring", stiffness: 280, damping: 26 }}
                        className={`relative w-full ${maxWidthClass} max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700/60 bg-primary shadow-2xl`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            aria-label="Close modal"
                        >
                            <FaTimes size={18} />
                        </button>

                        {title && (
                            <div className="px-6 sm:px-8 py-5 border-b border-slate-700/50 bg-secondary/40">
                                <h3 className="text-lg sm:text-xl font-bold text-main pr-12">{title}</h3>
                            </div>
                        )}

                        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Modal;