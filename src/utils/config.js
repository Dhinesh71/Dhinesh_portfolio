
export const animationConfig = {
    // 3D Background Settings
    background: {
        starCount: 5000,
        starSize: 0.002,
        radius: 1.5,
        rotationSpeedX: 10, // Divisor: higher is slower
        rotationSpeedY: 15, // Divisor: higher is slower
    },

    // Transition Settings
    transitions: {
        staggerChildren: 0.1,
        delayChildren: 0,
        springStiffness: 50,
        springDamping: 20,
    },

    // Viewport Triggers
    viewport: {
        once: true,
        amount: 0.25, // Amount of element visible before triggering
    }
};
