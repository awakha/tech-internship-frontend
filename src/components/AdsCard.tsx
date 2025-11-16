// src/features/ads/AdCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Advertisement } from '../types';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setSelection } from '../app/store';


const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  gap: 28,
  padding: 28,
  alignItems: 'center',
  borderRadius: 16,
  cursor: 'pointer',
  width: '100%',
  maxWidth: 1100, 
  margin: '0 auto',
  backgroundColor: theme.palette.background.paper,
  transition: 'transform .2s ease, box-shadow .2s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  minWidth: 140,
  fontWeight: 400, // не жирный
  fontSize: '0.85rem',
  boxShadow: theme.shadows[1],
}));

const PriorityChip = styled(Chip)(({ theme }) => ({
  minWidth: 110,
  fontWeight: 400, // не жирный
  fontSize: '0.85rem',
  border: '1px solid #ccc',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
}));

export default function AdCard({ ad }: { ad: Advertisement }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.ui.selectedAds as number[]);

  const isSelected = selected.includes(ad.id);

  const toggle = () => {
    dispatch(
      setSelection(
        isSelected
          ? selected.filter((id) => id !== ad.id)
          : [...selected, ad.id]
      )
    );
  };

  return (
    <StyledCard>
      <Checkbox checked={isSelected} onChange={toggle} sx={{ transform: 'scale(1.3)' }} />
      <Box
        sx={{
          width: 200,
          height: 150,
          borderRadius: 3,
          overflow: 'hidden',
          flexShrink: 0,
          bgcolor: 'background.default',
          border: '1px solid #4444',
        }}
        onClick={() => navigate(`/item/${ad.id}`)}
      >
        <img
          src={ad.images?.[0] ?? ''}
          alt={ad.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) =>
            ((e.currentTarget as HTMLImageElement).src =
              'https://placehold.co/200x150?text=No+image')
          }
        />
      </Box>

      <CardContent sx={{ p: 0, flex: 1 }}>

        <Typography variant="h6" sx={{ cursor: 'pointer', mb: 1, fontWeight: 500, fontSize: '1.3rem' }}>
          {ad.title}
        </Typography>


        <Typography variant="h6" sx={{ fontWeight: 550, mb: 1, fontSize: '1.2rem' }}>
          {ad.price.toLocaleString()} ₽
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2, fontSize: '1rem', fontWeight: 500 }}
        >
          {ad.category} • {dayjs(ad.createdAt).format('DD.MM.YYYY')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <StatusChip
            size="small"
            label={
              ad.status === 'approved'
                ? 'Одобрено'
                : ad.status === 'rejected'
                ? 'Отклонено'
                : 'На модерации'
            }
            color={
              ad.status === 'approved'
                ? 'success'
                : ad.status === 'rejected'
                ? 'error'
                : 'warning'
            }
            sx={{
              fontSize: '0.95rem',  
              minWidth: 160,        
              py: 2.5,                
            }}
          />

          <PriorityChip
            size="small"
            label={ad.priority === 'urgent' ? 'Срочный' : 'Обычный'}
            sx={{
              fontSize: '0.95rem',   
              minWidth: 140,         
              py: 2.5,               
              borderColor: ad.priority === 'urgent' ? 'red' : undefined,
              color: ad.priority === 'urgent' ? 'red' : undefined,
            }}
          />
        </Box>
      </CardContent>


      <Button
        variant="contained"
        size="large"
        sx={{ minWidth: 120, py: 1.5 }}
        onClick={() => navigate(`/item/${ad.id}`)}
      >
        Открыть →
      </Button>
    </StyledCard>
  );
}
