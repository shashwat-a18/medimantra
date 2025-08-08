export const getThemeStyles = (isDark: boolean) => {
  return {
    // Background colors
    bg: {
      primary: isDark ? 'bg-gray-900' : 'bg-white',
      secondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
      tertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',
      accent: isDark ? 'bg-blue-900' : 'bg-blue-50',
    },
    
    // Text colors
    text: {
      primary: isDark ? 'text-gray-100' : 'text-gray-900',
      secondary: isDark ? 'text-gray-300' : 'text-gray-600',
      muted: isDark ? 'text-gray-400' : 'text-gray-500',
      accent: isDark ? 'text-blue-300' : 'text-blue-600',
    },
    
    // Border colors
    border: {
      primary: isDark ? 'border-gray-700' : 'border-gray-200',
      secondary: isDark ? 'border-gray-600' : 'border-gray-300',
      accent: isDark ? 'border-blue-700' : 'border-blue-200',
    },
    
    // Card styles
    card: {
      primary: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      secondary: isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200',
      hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    },
    
    // Button variants
    button: {
      primary: isDark 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: isDark 
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
      ghost: isDark 
        ? 'hover:bg-gray-800 text-gray-300' 
        : 'hover:bg-gray-100 text-gray-600',
    },
    
    // Input styles
    input: {
      primary: isDark 
        ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
      focus: isDark 
        ? 'focus:border-blue-500 focus:ring-blue-500' 
        : 'focus:border-blue-500 focus:ring-blue-500',
    },
    
    // Modal/Dialog styles
    modal: {
      backdrop: isDark ? 'bg-gray-900/80' : 'bg-gray-900/50',
      content: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    },
    
    // Health metric colors (maintain visibility in both themes)
    health: {
      excellent: isDark ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-50',
      good: isDark ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-50',
      warning: isDark ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50',
      danger: isDark ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50',
    },
    
    // Glassmorphism effects
    glass: {
      primary: isDark 
        ? 'bg-gray-800/70 backdrop-blur-lg border-gray-700/50' 
        : 'bg-white/70 backdrop-blur-lg border-white/20',
      secondary: isDark 
        ? 'bg-gray-900/50 backdrop-blur-md border-gray-700/30' 
        : 'bg-white/50 backdrop-blur-md border-gray-200/30',
    },
  };
};

export const themeColors = {
  light: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    accent: '#3b82f6',
    border: '#e2e8f0',
  },
  dark: {
    primary: '#0f172a',
    secondary: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    accent: '#60a5fa',
    border: '#334155',
  },
};
