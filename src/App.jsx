import React, { useState } from "react";
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

const PortfolioShell = () => {
    const { content } = useContent();
    const [loading, setLoading] = useState(true);

    return (
        <div className="bg-primary min-h-screen text-main font-sans selection:bg-accent selection:text-onaccent transition-colors duration-300 relative overflow-x-hidden">
            {loading ? (
                <Loader onFinished={() => setLoading(false)} />
            ) : (
                <div className="relative z-10 transition-opacity duration-300 opacity-100">
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
        </div>
    );
};

function App() {
    return (
        <ThemeProvider>
            <ContentProvider>
                <PortfolioShell />
            </ContentProvider>
        </ThemeProvider>
    );
}

export default App;
