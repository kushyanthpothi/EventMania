'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'
    const [resolvedTheme, setResolvedTheme] = useState('dark');

    // Get system theme preference
    const getSystemTheme = () => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    };

    // Resolve the actual theme based on setting
    const resolveTheme = (themeSetting) => {
        if (themeSetting === 'system') {
            return getSystemTheme();
        }
        return themeSetting;
    };

    // Initialize theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('event-mania-theme') || 'system';
        setTheme(savedTheme);
        setResolvedTheme(resolveTheme(savedTheme));
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'system') {
                setResolvedTheme(getSystemTheme());
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Apply theme class to document
    useEffect(() => {
        const root = document.documentElement;

        if (resolvedTheme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
    }, [resolvedTheme]);

    // Update theme
    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        setResolvedTheme(resolveTheme(newTheme));
        localStorage.setItem('event-mania-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
