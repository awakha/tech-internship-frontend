import type { SxProps, Theme } from '@mui/material';
import { styled } from '@mui/material';

export const adsListStyles: Record<string, SxProps<Theme>> = {
  layout: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    width: '100%'
  },
  leftFilters: {
    width: 300
  },
  rightContent: {
    flexGrow: 1
  },
  searchField: {
    width: 420
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16
  }
};

export const adDetailStyles: Record<string, SxProps<Theme>> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 16
  },
  actionsRow: {
    display: 'flex',
    gap: 8,
    mt: 2
  },
  sellerCard: {
    p: 2
  }
};

export const MainImage = styled('img')(({ theme }) => ({
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  objectFit: 'cover'
}));

export const ThumbImage = styled('img')(({ theme }) => ({
  width: 80,
  height: 60,
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  border: `1px solid ${theme.palette.divider}`
}));
