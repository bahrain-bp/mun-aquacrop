import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Load saved theme preference
        const loadTheme = async () => {
            const savedTheme = await storage.getItem('isDarkMode');
            setIsDarkMode(savedTheme === 'false' ? false : true);
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        await storage.setItem('isDarkMode', String(newTheme));
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const themes = {
    dark: {
        background: '#202124',
        card: '#2D2F31',
        text: '#FFFFFF',
        subText: '#B4B8C0',
        border: '#404144',
        shadow: '#000000',
        accent: '#4CAF50',
        error: '#FF4B4B',
        cardShadow: 'rgba(0, 0, 0, 0.3)',
        switchTrackActive: '#81b0ff',
        switchTrackInactive: '#767577',
        switchThumbActive: '#4CAF50',
        switchThumbInactive: '#f4f3f4',
    },
    light: {
        background: '#F5F5F5',
        card: '#FFFFFF',
        text: '#000000',
        subText: '#666666',
        border: '#E0E0E0',
        shadow: '#666666',
        accent: '#4CAF50',
        error: '#FF4B4B',
        cardShadow: 'rgba(0, 0, 0, 0.1)',
        switchTrackActive: '#4CAF50',
        switchTrackInactive: '#E0E0E0',
        switchThumbActive: '#FFFFFF',
        switchThumbInactive: '#FFFFFF',
    },
};

