import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Badge } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ListIcon from '@mui/icons-material/List';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { toggleTheme } from '../app/store';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const selectedCount = useAppSelector(s => (s as any).ui.selectedAds.length);

  // global hotkeys: / focus search (we will emit custom event)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focus-search'));
      }
      // other global keys are handled inside AdDetailPage and AdsListPage
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 2, cursor: 'pointer' }} onClick={() => navigate('/list')}>
          Moderation — Avito
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <IconButton component={RouterLink} to="/list" color="inherit">
            <ListIcon />
          </IconButton>
          <IconButton component={RouterLink} to="/stats" color="inherit">
            <BarChartIcon />
          </IconButton>
        </Box>

        <IconButton color="inherit" onClick={() => dispatch(toggleTheme())}>
          <Brightness4Icon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}