import { useContent } from "../../context/ContentContext";
import { socialIconMap } from "../../utils/socialLinks";

const Footer = () => {
    const { content } = useContent();
    const { contact, footer, hero } = content;

    return (
        <footer className="bg-primary pt-10 pb-8 border-t border-main/15 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <div className="flex justify-center gap-6">
                    {contact.socialLinks.map((link, index) => {
                        const Icon = socialIconMap[link.icon] || socialIconMap.globe;

                        return (
                            <a
                                key={`${link.label}-${index}`}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                                className="text-main/60 hover:text-accent text-2xl transition-colors"
                            >
                                <Icon />
                            </a>
                        );
                    })}
                </div>

                <p className="text-main/60 text-sm">
                    {footer.creditText} {hero.name}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
