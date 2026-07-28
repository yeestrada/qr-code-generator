import { createTheme, type ThemeOptions } from '@mui/material/styles';

const shared: ThemeOptions = {
  typography: {
    fontFamily: '"Sora", "Segoe UI", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 650, letterSpacing: '-0.02em' },
    h4: { fontWeight: 650 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: '#0d9488' },
      },
    },
  },
};

export function createAppTheme(darkMode: boolean) {
  return createTheme({
    ...shared,
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#0d9488',
        light: '#2dd4bf',
        dark: '#0f766e',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#f97316',
        light: '#fb923c',
        dark: '#c2410c',
      },
      success: { main: '#16a34a' },
      error: { main: '#dc2626' },
      background: darkMode
        ? {
            default: '#0b1220',
            paper: '#121a2b',
          }
        : {
            default: '#f3f6f9',
            paper: '#ffffff',
          },
      text: darkMode
        ? {
            primary: '#e8eef7',
            secondary: '#9db0c9',
          }
        : {
            primary: '#0f172a',
            secondary: '#64748b',
          },
      divider: darkMode ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.08)',
    },
  });
}
