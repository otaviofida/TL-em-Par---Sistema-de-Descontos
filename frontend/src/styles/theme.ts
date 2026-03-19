export const theme = {
  colors: {
    primary: '#feb621',       // Amarelo — cor principal
    primaryDark: '#e5a41e',
    primaryLight: '#ffd166',
    secondary: '#bc7f59',     // Marrom
    secondaryLight: '#d6c5a4', // Bege
    dark: '#000000',          // Preto
    white: '#ffffff',
    background: '#faf8f5',
    surface: '#ffffff',
    surfaceAlt: '#f5f0eb',
    text: '#1a1a1a',
    textSecondary: '#666666',
    textLight: '#999999',
    border: '#e5ddd4',
    borderLight: '#f0ebe5',
    success: '#22c55e',
    successBg: '#f0fdf4',
    error: '#ef4444',
    errorBg: '#fef2f2',
    warning: '#f59e0b',
    warningBg: '#fffbeb',
    info: '#3b82f6',
    infoBg: '#eff6ff',
  },
  fonts: {
    body: "'futura-pt', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'futura-pt', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  radii: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
} as const;

export type Theme = typeof theme;
