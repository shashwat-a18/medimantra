// Modern Design System for MediMitra
// Color palette: Blue, Green with Light/Dark mode support

export const colors = {
  // Primary Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary Colors (Green)
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Accent Colors
  accent: {
    blue: '#3b82f6',
    green: '#10b981',
    cyan: '#06b6d4',
    teal: '#14b8a6',
  },
  
  // Status Colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutral Colors (Light Mode)
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      muted: '#94a3b8',
    },
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Dark Mode Colors
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',
    border: '#475569',
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
    },
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const animations = {
  fadeIn: 'fadeIn 0.3s ease-in-out',
  slideIn: 'slideIn 0.3s ease-out',
  scale: 'scale 0.2s ease-in-out',
  bounce: 'bounce 0.3s ease-in-out',
};

// CSS-in-JS helper for consistent theming
export const getThemeStyles = (isDark = false) => {
  const theme = isDark ? colors.dark : colors.light;
  
  return {
    background: theme.background,
    surface: theme.surface,
    card: theme.card,
    border: theme.border,
    text: theme.text,
    shadow: theme.shadow,
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  };
};
