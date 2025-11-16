import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, MenuItem, Table, TableBody, TableRow, TableCell, IconButton
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdById, approveAd, rejectAd, requestChanges } from '../../api/adsApi';
import Loader from '../../components/Loader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';
import type { Advertisement } from '../../types';
import styles from './ItemPage.module.css';

const REASONS = [
  'Запрещённый товар',
  'Неверная категория',
  'Некорректное описание',
  'Проблемы с фото',
  'Подозрение на мошенничество',
  'Другое',
];

export default function ItemPage(): React.ReactElement {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [imagesIndex, setImagesIndex] = useState(0);
  const adId = Number(id);

  const { data: ad, isLoading } = useQuery<Advertisement, Error>({
    queryKey: ['ad', adId],
    queryFn: ({ signal }) => getAdById(adId, signal),
    enabled: !Number.isNaN(adId),
  });

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

  const requestChangesMutation = useMutation<void, Error, { reason: string; comment?: string }>({
    mutationFn: (payload) => requestChanges(adId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', adId] });
    },
  });

  const navigateToOffset = (offset: number) => {
    if (!ad) return;
    const nextId = ad.id + offset;
    navigate(`/item/${nextId}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigateToOffset(1);
      else if (e.key === 'ArrowLeft') navigateToOffset(-1);
      else if (e.key.toLowerCase() === 'a') approveMutation.mutate();
      else if (e.key.toLowerCase() === 'd') setRejectOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ad]);

  if (isLoading || !ad) return <Loader />;

  const images = (ad.images?.length ? ad.images : ['/placeholder.png']).concat(
    Array.from({ length: Math.max(0, 3 - (ad.images?.length || 0)) }).map((_, i) => `/placeholder_${i}.png`)
  );

  return (
    <Box className={styles.container}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/list')}>
          Назад к списку
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 16, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Paper className={styles.galleryPaper} elevation={1}>
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <IconButton
                sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)' }}
                onClick={() => setImagesIndex((i) => (i - 1 + images.length) % images.length)}
              >
                <ChevronLeftIcon />
              </IconButton>

              <img src={images[imagesIndex]} alt={ad.title} className={styles.mainImg} />

              <IconButton
                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)' }}
                onClick={() => setImagesIndex((i) => (i + 1) % images.length)}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 8, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {images.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  className={`${styles.thumb} ${imagesIndex === idx ? styles.thumbSelected : ''}`}
                  onClick={() => setImagesIndex(idx)}
                />
              ))}
            </Box>
          </Paper>

          <Paper className={styles.fullDescPaper} elevation={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Полное описание</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{ad.description}</Typography>
          </Paper>

          <Paper className={styles.infoPaper} elevation={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Характеристики</Typography>
            <Table size="small">
              <TableBody>
                {Object.entries(ad.characteristics || {}).map(([k, v], idx, arr) => (
                  <TableRow key={k}>
                    <TableCell className={styles.labelCell} component="th" scope="row">{k}</TableCell>
                    <TableCell align="left" sx={{ borderBottom: idx === arr.length - 1 ? 'none' : undefined }}>{String(v)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Продавец</Typography>
            <Typography>{ad.seller.name}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography>Рейтинг: <strong>{ad.seller.rating}</strong></Typography>
              <Typography>Объявлений: <strong>{ad.seller.totalAds}</strong></Typography>
            </Box>
            <Typography sx={{ mt: 1 }}>Зарегистрирован: {dayjs(ad.seller.registeredAt).format('DD.MM.YYYY')}</Typography>
          </Paper>
        </Box>

        <Box sx={{ width: { xs: '100%', md: 360 }, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Paper className={styles.rightCard} elevation={1}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>История модерации</Typography>
            {ad.moderationHistory.length === 0 ? (
              <Typography variant="body2">Пока нет действий</Typography>
            ) : (
              ad.moderationHistory.map((h) => (
                <Box key={h.id} sx={{ pb: 1, mb: 1, borderBottom: '1px solid #eee' }}>
                  <Typography sx={{ fontWeight: 700 }}>{h.moderatorName}</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>{dayjs(h.timestamp).format('DD.MM.YYYY HH:mm')}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>Статус:</Typography>
                      <Typography>{h.action === 'approved' ? 'одобрено' : h.action === 'rejected' ? 'отклонено' : h.action === 'requestChanges' ? 'на доработке' : h.action}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Typography sx={{ fontWeight: 600 }}>Причина:</Typography>
                      <Typography>{h.reason ?? '-'}</Typography>
                    </Box>
                    {h.action === 'rejected' && h.comment && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Typography sx={{ fontWeight: 600 }}>Комментарий:</Typography>
                        <Typography>{h.comment}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Box>
      </Box>

      <Box className={styles.actionsBox}>
        <Button variant="contained" color="success" sx={{ flex: 1 }} onClick={() => approveMutation.mutate()}>✓ ОДОБРИТЬ</Button>
        <Button variant="contained" color="error" sx={{ flex: 1 }} onClick={() => setRejectOpen(true)}>✗ ОТКЛОНИТЬ</Button>
        <Button variant="contained" color="warning" sx={{ flex: 1 }} onClick={() => requestChangesMutation.mutate({ reason: 'Другое', comment: 'Пожалуйста, исправьте описание' })}>↺ ДОРАБОТКА</Button>
      </Box>

      <Box className={styles.bottomNavBox}>
        <Button sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#125ea8' } }} onClick={() => navigateToOffset(-1)}>← ПРЕДЫДУЩЕЕ</Button>
        <Button sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#125ea8' } }} onClick={() => navigateToOffset(1)}>СЛЕДУЮЩЕЕ →</Button>
      </Box>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Отклонить объявление</DialogTitle>
        <DialogContent>
          <TextField select label="Причина" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth sx={{ mb: 2 }}>
            {REASONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <TextField label="Комментарий" value={comment} onChange={(e) => setComment(e.target.value)} multiline minRows={3} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Отмена</Button>
          <Button color="error" variant="contained" onClick={() => { if (!reason) return; rejectMutation.mutate({ reason, comment }); }} disabled={!reason || rejectMutation.isPending}>Отклонить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
