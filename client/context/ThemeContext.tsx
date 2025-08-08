import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getThemeStyles } from '../styles/theme';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: any;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('medimitra-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      setIsDark(systemPrefersDark);
    }
    
    setMounted(true);
  }, []);

  // Save theme preference and apply to document
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('medimitra-theme', isDark ? 'dark' : 'light');
      
      // Apply theme to document root
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.style.setProperty('--bg-primary', '#0f172a');
        root.style.setProperty('--bg-secondary', '#1e293b');
        root.style.setProperty('--text-primary', '#f1f5f9');
        root.style.setProperty('--text-secondary', '#cbd5e1');
      } else {
        root.classList.remove('dark');
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8fafc');
        root.style.setProperty('--text-primary', '#1e293b');
        root.style.setProperty('--text-secondary', '#64748b');
      }
    }
  }, [isDark, mounted]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = getThemeStyles(isDark);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      theme,
      mounted
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
