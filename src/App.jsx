import React, { useEffect, useState } from "react";
import { ContentProvider, useContent } from "./context/ContentContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Projects from "./components/sections/Projects";
import Timeline from "./components/sections/Timeline";
import Certificates from "./components/sections/Certificates";
import Contact from "./components/sections/Contact";
import Footer from "./components/layout/Footer";
import Loader from "./components/common/Loader";
import BackToTop from "./components/common/BackToTop";
import Background3D from "./components/common/Background3D";
import AdminPanel from "./components/admin/AdminPanel";

const PortfolioShell = ({ isAdminOpen, onCloseAdmin }) => {
    const { content } = useContent();
    const [loading, setLoading] = useState(true);

    return (
        <div className="bg-primary min-h-screen text-main font-sans selection:bg-accent selection:text-onaccent transition-colors duration-300 relative overflow-x-hidden">
            {loading ? (
                <Loader onFinished={() => setLoading(false)} />
            ) : (
                <div
                    aria-hidden={isAdminOpen}
                    className={`relative z-10 transition-opacity duration-300 ${isAdminOpen ? "opacity-0 pointer-events-none select-none" : "opacity-100"}`}
                >
                    <Background3D />
                    <Navbar />
                    <main className="relative z-10">
                        {content.hero.enabled && <Hero />}
                        {content.about.enabled && <About />}
                        {content.skills.enabled && <Skills />}
                        {content.projects.enabled && <Projects />}
                        {content.timeline?.enabled && <Timeline />}
                        {content.certificates.enabled && <Certificates />}
                        {content.contact.enabled && <Contact />}
                    </main>
                    {content.footer.enabled && <Footer />}
                    <BackToTop />
                </div>
            )}

            <AdminPanel isOpen={isAdminOpen} onClose={onCloseAdmin} />
        </div>
    );
};

function App() {
    const [isAdminOpen, setIsAdminOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const isAdminShortcut = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "a";

            if (!isAdminShortcut) {
                return;
            }

            event.preventDefault();
            setIsAdminOpen(true);
        };

        const handleOpenAdmin = () => setIsAdminOpen(true);

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("openAdminPanel", handleOpenAdmin);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("openAdminPanel", handleOpenAdmin);
        };
    }, []);

    return (
        <ThemeProvider>
            <ContentProvider>
                <PortfolioShell
                    isAdminOpen={isAdminOpen}
                    onCloseAdmin={() => setIsAdminOpen(false)}
                />
            </ContentProvider>
        </ThemeProvider>
    );
}

export default App;
