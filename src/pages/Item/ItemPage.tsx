// src/features/ads/AdDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  MenuItem,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdById, approveAd, rejectAd, requestChanges } from '../../api/adsApi';
import Loader from '../../components/Loader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';

import type { Advertisement } from '../../types';

const REASONS = [
  'Запрещённый товар',
  'Неверная категория',
  'Некорректное описание',
  'Проблемы с фото',
  'Подозрение на мошенничество',
  'Другое',
];

/* ----------------------
   Стили (в одном файле)
   ---------------------- */

const Container = styled(Box)({
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

/* Галерея */
const GalleryPaper = styled(Paper)({
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
});

/* Главное изображение — фиксированная высота, центрирование как на макете */
const MainImg = styled('img')({
  width: '100%',
  maxWidth: 560,
  height: 300,
  objectFit: 'cover',
  borderRadius: 6,
  background: '#f3f3f3',
});

/* Миниатюры */
const Thumb = styled('img')<{ selected?: boolean }>(({ selected }) => ({
  width: 88,
  height: 64,
  objectFit: 'cover',
  borderRadius: 4,
  cursor: 'pointer',
  border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
}));

/* Описание/характеристики/блок продавца */
const InfoPaper = styled(Paper)({
  padding: 16,
  boxSizing: 'border-box',
});

const FullDescPaper = styled(Paper)({
  padding: 16,
  marginTop: 8,
});

/* Кнопки модерации — большие */
const ActionsBox = styled(Box)({
  display: 'flex',
  gap: 12,
  marginTop: 8,
});

const BottomNavBox = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 12,
  gap: 12,
});

/* Маленькая правая карточка (как на макете) */
const RightCard = styled(Paper)({
  padding: 12,
  boxSizing: 'border-box',
});

/* Helper to show divider row style in table */
const LabelCell = styled(TableCell)({
  fontWeight: 600,
  borderBottom: 'none',
  width: 180,
});

/* ----------------------
   Компонент
   ---------------------- */

export default function AdDetailPage(): JSX.Element {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [imagesIndex, setImagesIndex] = useState<number>(0);

  const adId = Number(id);

  // Fetch ad
  const { data: ad, isLoading } = useQuery<Advertisement, Error>({
    queryKey: ['ad', adId],
    queryFn: ({ signal }) => getAdById(adId, signal),
    enabled: !Number.isNaN(adId),
  });

  // Mutations
  const approveMutation = useMutation<void, Error, void>({
    mutationFn: () => approveAd(adId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', adId] });
    },
  });

  const rejectMutation = useMutation<void, Error, { reason: string; comment?: string }>({
    mutationFn: (payload) => rejectAd(adId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', adId] });
      setRejectOpen(false);
    },
  });

  const requestChangesMutation = useMutation<void, Error, { reason: string; comment?: string }>(
    {
      mutationFn: (payload) => requestChanges(adId, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ads'] });
        queryClient.invalidateQueries({ queryKey: ['ad', adId] });
      },
    }
  );

  // navigation between ads (previous/next)
  const navigateToOffset = (offset: number) => {
    if (!ad) return;
    const nextId = ad.id + offset;
    navigate(`/item/${nextId}`);
  };

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        navigateToOffset(1);
        return;
      }
      if (e.key === 'ArrowLeft') {
        navigateToOffset(-1);
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'a') {
        approveMutation.mutate();
      } else if (k === 'd') {
        setRejectOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ad]);

  if (isLoading || !ad) return <Loader />;

  // ensure at least 3 images for layout (per requirements) — fallback to placeholders
  const images = (ad.images && ad.images.length > 0 ? ad.images : ['/placeholder.png']).concat(
    Array.from({ length: Math.max(0, 3 - (ad.images?.length || 0)) }).map((_, i) => `/placeholder_${i}.png`)
  );

  return (
    <Container>
      {/* Вертикальная навигация сверху */}
      <Box sx={{ display: 'flex', gap: 1 }}>


        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/list')}
        >
          Назад к списку
        </Button>


      </Box>

      {/* Основная область: две колонки (лево: галерея + описание + характеристики, право: модерация/история/нотиф) */}
      <Box sx={{ display: 'flex', gap: 16, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* ЛЕВАЯ КОЛОНКА: основное */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Галерея карточка (как на макете) */}
          <GalleryPaper elevation={1}>
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
              {/* Левые/правые стрелки поверх изображения */}
              <IconButton
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.7)'
                }}
                onClick={() => setImagesIndex((i) => (i - 1 + images.length) % images.length)}
              >
                <ChevronLeftIcon />
              </IconButton>

              <MainImg src={images[imagesIndex]} alt={ad.title} />

              <IconButton
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.7)'
                }}
                onClick={() => setImagesIndex((i) => (i + 1) % images.length)}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Миниатюры */}
            <Box sx={{ display: 'flex', gap: 8, mt: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {images.map((src, idx) => (
                <Thumb
                  key={String(src) + idx}
                  src={src}
                  selected={imagesIndex === idx}
                  onClick={() => setImagesIndex(idx)}
                />
              ))}
            </Box>
          </GalleryPaper>

          {/* Полное описание — отдельная белая карточка под галереей */}
          <FullDescPaper elevation={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Полное описание
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {ad.description}
            </Typography>
          </FullDescPaper>

          {/* Характеристики — в виде таблицы с разделителями */}
          <InfoPaper elevation={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Характеристики
            </Typography>

            <Table size="small" aria-label="характеристики">
              <TableBody>
                {Object.entries(ad.characteristics || {}).map(([k, v], idx, arr) => (
                  <TableRow key={k}>
                    <LabelCell component="th" scope="row">
                      {k}
                    </LabelCell>
                    <TableCell align="left" sx={{ borderBottom: idx === arr.length - 1 ? 'none' : undefined }}>
                      {String(v)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </InfoPaper>

          {/* Блок продавца (как на макете — под характеристиками, занимает ширину колонки) */}
          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Продавец
            </Typography>

            <Typography sx={{ fontWeight: 400 }}>{ad.seller.name}</Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
              <Typography variant="body2">Рейтинг: <strong>{ad.seller.rating}</strong></Typography>
              <Typography variant="body2">Объявлений: <strong>{ad.seller.totalAds}</strong></Typography>
            </Box>

            <Typography variant="body2" sx={{ mt: 1 }}>
              Зарегистрирован: {dayjs(ad.seller.registeredAt).format('DD.MM.YYYY')}
            </Typography>
          </Paper>
        </Box>

        {/* ПРАВАЯ КОЛОНКА: модерация, история — узкая колонка как на макете */}
        <Box sx={{ width: { xs: '100%', md: 360 }, display: 'flex', flexDirection: 'column', gap: 12 }}>


          {/* История модерации (список) */}
          <RightCard elevation={1}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              История модерации
            </Typography>

            {ad.moderationHistory.length === 0 ? (
              <Typography variant="body2">Пока нет действий</Typography>
            ) : (
              ad.moderationHistory.map((h) => (
                <Box key={h.id} sx={{ pb: 1, mb: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {h.moderatorName}
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {dayjs(h.timestamp).format('DD.MM.YYYY HH:mm')}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    {/* Статус */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Статус:
                      </Typography>
                      <Typography variant="body2">
                  {h.action === 'approved'
                    ? 'одобрено'
                    : h.action === 'rejected'
                    ? 'отклонено'
                    : h.action === 'requestChanges'
                    ? 'на доработке'
                    : h.action}
                      </Typography>
                    </Box>

  {/* Причина */}
  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      Причина:
    </Typography>
    <Typography variant="body2">{h.reason ?? '-'}</Typography>
  </Box>

  {/* Комментарий — показываем ТОЛЬКО если отклонено */}
  {h.action === 'rejected' && h.comment && (
    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Комментарий:
      </Typography>
      <Typography variant="body2">{h.comment}</Typography>
    </Box>
  )}
</Box>

                </Box>
              ))
            )}
          </RightCard>
        </Box>
      </Box>

      {/* Широкая панель действий внизу (как в макете: зелёная, красная, оранжевая — большие) */}
      <ActionsBox>
        <Button
          variant="contained"
          color="success"
          sx={{ flex: 1, height: 44 }}
          onClick={() => approveMutation.mutate()}
        >
          ✓ ОДОБРИТЬ
        </Button>

        <Button
          variant="contained"
          color="error"
          sx={{ flex: 1, height: 44 }}
          onClick={() => setRejectOpen(true)}
        >
          ✗ ОТКЛОНИТЬ
        </Button>

        <Button
          variant="contained"
          color="warning"
          sx={{ flex: 1, height: 44 }}
          onClick={() => requestChangesMutation.mutate({ reason: 'Другое', comment: 'Пожалуйста, исправьте описание' })}
        >
          ↺ ДОРАБОТКА
        </Button>
      </ActionsBox>

      {/* Нижняя навигация: синие кнопки "предыдущее / следующее" по краям (как на скриншоте) */}
      <BottomNavBox>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#125ea8' } }}
          onClick={() => navigateToOffset(-1)}
        >
          ← ПРЕДЫДУЩЕЕ
        </Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#125ea8' } }}
          onClick={() => navigateToOffset(1)}
        >
          СЛЕДУЮЩЕЕ →
        </Button>
      </BottomNavBox>

      {/* Диалог отклонения — с обязательной причиной и шаблонами */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Отклонить объявление</DialogTitle>

        <DialogContent>
          <TextField
            select
            label="Причина"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {REASONS.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>

          {/* Если выбрано "Другое", пользователь может писать комментарий. Но у нас всегда есть поле комментария. */}
          <TextField
            label="Комментарий"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!reason) return;
              rejectMutation.mutate({ reason, comment });
            }}
            disabled={!reason || rejectMutation.isLoading}
          >
            Отклонить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
