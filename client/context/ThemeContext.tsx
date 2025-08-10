'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme types
type Theme = 'light' | 'dark' | 'system';

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

// Default context value for SSR
const defaultThemeContext: ThemeContextType = {
  theme: 'system',
  resolvedTheme: 'light',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
};

// Create context
const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

// Storage key
const THEME_STORAGE_KEY = 'medimitra_theme';

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const initTheme = () => {
      try {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
        
        if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
          setThemeState(storedTheme);
        } else {
          setThemeState('system');
        }
      } catch (error) {
        console.error('Error initializing theme:', error);
        setThemeState('system');
      }
      
      setMounted(true);
    };

    initTheme();
  }, []);

  // Resolve theme based on system preference
  useEffect(() => {
    if (!mounted) return;

    const resolveTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    resolveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        resolveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, mounted]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Add the resolved theme class
    root.classList.add(resolvedTheme);
    
    // Set CSS custom properties
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#64748b');
    }
    
    // Set data attribute and color scheme
    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, mounted]);

  // Set theme function
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (mounted) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch (error) {
        console.error('Error saving theme to localStorage:', error);
      }
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If system, switch to opposite of current resolved theme
      setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    }
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggleTheme,
    mounted,
  };

  // Prevent flash of unstyled content during SSR
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  // Handle SSR case
  if (typeof window === 'undefined') {
    return defaultThemeContext;
  }
  
  return context;
};

export default ThemeContext;
