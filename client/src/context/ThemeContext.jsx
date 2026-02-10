import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [compact, setCompact] = useState(localStorage.getItem('compact') === 'true');
    const [realTime, setRealTime] = useState(localStorage.getItem('realTime') !== 'false'); // Default true

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('compact', compact);
    }, [compact]);

    useEffect(() => {
        localStorage.setItem('realTime', realTime);
    }, [realTime]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, compact, setCompact, realTime, setRealTime }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
