import { useMemo } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { DesignerProvider, useDesigner } from './context/DesignerContext';
import { LanguageProvider } from './context/LanguageContext';
import { createAppTheme } from './theme/theme';
import { AppLayout } from './components/layout/AppLayout';

function ThemedApp() {
  const { state } = useDesigner();
  const theme = useMemo(() => createAppTheme(state.darkMode), [state.darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DesignerProvider>
        <ThemedApp />
      </DesignerProvider>
    </LanguageProvider>
  );
}
