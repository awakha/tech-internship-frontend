import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAppSelector } from './app/hooks';
import { lightTheme, darkTheme } from './styles/theme';
import Layout from './components/Layout';
import AppRoutes from './routes/AppRoutes';


export default function App() {
  const themeMode = useAppSelector(s => (s as any).ui.theme as 'light' | 'dark');

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <Layout>
        <AppRoutes />
      </Layout>
    </ThemeProvider>
  );
}