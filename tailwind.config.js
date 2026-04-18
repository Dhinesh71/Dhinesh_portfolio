/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "rgb(var(--color-primary) / <alpha-value>)",
                secondary: "rgb(var(--color-secondary) / <alpha-value>)",
                main: "rgb(var(--color-text-main) / <alpha-value>)",
                accent: "rgb(var(--color-accent) / <alpha-value>)",
                onaccent: "rgb(var(--color-on-accent) / <alpha-value>)",
            },
            fontFamily: {
                sans: ["'Space Grotesk'", 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
