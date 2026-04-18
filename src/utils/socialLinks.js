import {
    FaEnvelope,
    FaGithub,
    FaGlobe,
    FaInstagram,
    FaLinkedinIn,
    FaXTwitter,
    FaYoutube,
} from "react-icons/fa6";

export const socialIconMap = {
    github: FaGithub,
    linkedin: FaLinkedinIn,
    instagram: FaInstagram,
    twitter: FaXTwitter,
    x: FaXTwitter,
    website: FaGlobe,
    globe: FaGlobe,
    youtube: FaYoutube,
    email: FaEnvelope,
};

export const socialHoverClassMap = {
    github: "hover:text-white",
    linkedin: "hover:text-[#0a66c2]",
    instagram: "hover:text-[#e4405f]",
    twitter: "hover:text-slate-100",
    x: "hover:text-slate-100",
    website: "hover:text-cyan-300",
    globe: "hover:text-cyan-300",
    youtube: "hover:text-[#ff0000]",
    email: "hover:text-emerald-300",
};
