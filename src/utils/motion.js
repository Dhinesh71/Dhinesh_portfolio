/**
 * GSAP Animation Helpers
 * These functions return configuration objects or utility values for GSAP animations.
 */

export const fadeIn = (direction = "up", type = "power2.out", delay = 0, duration = 0.75) => {
    return {
        x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
        y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: type === "spring" ? "back.out(1.7)" : type,
    };
};

export const textVariant = (delay = 0) => {
    return {
        y: -50,
        opacity: 0,
        duration: 1.25,
        delay: delay,
        ease: "back.out(1.7)",
    };
};

export const zoomIn = (delay = 0, duration = 0.75) => {
    return {
        scale: 0,
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: "power2.out",
    };
};

export const slideIn = (direction, type, delay, duration) => {
    return {
        x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
        y: direction === "up" ? "100%" : direction === "down" ? "100%" : 0,
        duration: duration,
        delay: delay,
        ease: type === "spring" ? "back.out(1.7)" : "power2.out",
    };
};

// For GSAP, stagger is often passed directly to a tween
export const staggerConfig = (staggerChildren = 0.1) => {
    return {
        each: staggerChildren,
    };
};
