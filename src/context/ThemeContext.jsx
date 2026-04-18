import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();
const THEMES = ['light', 'dark-blue', 'black'];

const normalizeTheme = (value) => {
    if (value === 'dark') {
        return 'dark-blue';
    }

    return THEMES.includes(value) ? value : 'black';
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => normalizeTheme(localStorage.getItem('theme')));

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('dark', 'theme-light', 'theme-dark-blue', 'theme-black');

        if (theme === 'light') {
            root.classList.add('theme-light');
        }

        if (theme === 'dark-blue') {
            root.classList.add('dark', 'theme-dark-blue');
        }

        if (theme === 'black') {
            root.classList.add('dark', 'theme-black');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        setTheme((prev) => {
            const currentIndex = THEMES.indexOf(prev);
            const nextIndex = (currentIndex + 1) % THEMES.length;
            return THEMES[nextIndex];
        });
    };

    // Preserve compatibility for components already using toggleTheme.
    const toggleTheme = cycleTheme;

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, cycleTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
