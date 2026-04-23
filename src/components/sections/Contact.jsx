import React, { useRef, useState } from "react";
import SectionWrapper from "../common/SectionWrapper";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { useContent } from "../../context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
    const { content } = useContent();
    const { contact } = content;
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState({ submitting: false, succeeded: false, error: null });
    const formRef = useRef(null);

    useGSAP(() => {
        gsap.from(formRef.current, {
            opacity: 0,
            x: 50,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: formRef.current,
                start: "top 80%",
                once: true,
            },
        });
    }, { scope: formRef });

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ submitting: true, succeeded: false, error: null });

        try {
            await fetch(contact.googleScriptUrl, {
                method: "POST",
                mode: "no-cors", // Required for Google Apps Script
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            // Since mode is 'no-cors', we can't read the response body, 
            // but if the request finishes without erroring, it's usually successful.
            setStatus({ submitting: false, succeeded: true, error: null });
            setFormData({ name: "", email: "", message: "" });
            
            // Reset success message after 5 seconds
            setTimeout(() => {
                setStatus(prev => ({ ...prev, succeeded: false }));
            }, 5000);

        } catch (error) {
            console.error("Submission error:", error);
            setStatus({ submitting: false, succeeded: false, error: "Something went wrong. Please try again." });
        }
    };

    return (
        <SectionWrapper id="contact" className="bg-secondary/10">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-main mb-16">
                {contact.titlePrefix} <span className="text-accent">{contact.titleHighlight}</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                <div className="space-y-8">
                    <h3 className="text-2xl font-semibold text-main">{contact.introTitle}</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        {contact.introText}
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-accent">
                                <FaEnvelope />
                            </div>
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        </div>

                        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-accent">
                                <FaPhone />
                            </div>
                            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                        </div>

                        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-accent">
                                <FaMapMarkerAlt />
                            </div>
                            <span>{contact.address}</span>
                        </div>
                    </div>
                </div>

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="bg-secondary/30 p-8 rounded-2xl border border-slate-700 shadow-xl"
                >
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {contact.labels.name}
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-primary border border-slate-600 rounded-lg px-4 py-3 text-main focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                placeholder={contact.placeholders.name}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {contact.labels.email}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-primary border border-slate-600 rounded-lg px-4 py-3 text-main focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                placeholder={contact.placeholders.email}
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {contact.labels.message}
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full bg-primary border border-slate-600 rounded-lg px-4 py-3 text-main focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
                                placeholder={contact.placeholders.message}
                            />
                        </div>

                        {status.error && (
                            <p className="text-red-500 text-sm font-medium">{status.error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={status.submitting}
                            className={`w-full py-3 rounded-lg font-bold text-primary transition-all duration-300 ${status.succeeded
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-accent hover:bg-accent/90"
                            }`}
                        >
                            {status.submitting
                                ? contact.labels.submitLoading
                                : status.succeeded
                                    ? contact.labels.submitSuccess
                                    : contact.labels.submitIdle}
                        </button>
                    </div>
                </form>
            </div>
        </SectionWrapper>
    );
};

export default Contact;
