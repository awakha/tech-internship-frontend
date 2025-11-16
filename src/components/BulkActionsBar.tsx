import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import axiosClient from '../api/axiosClient';
import { clearSelection } from '../app/store';
import { saveAs } from 'file-saver';
import { exportAdsToCSV } from '../utils/export';

export default function BulkActionsBar({ onRefresh }: { onRefresh?: () => void }) {
  const selected = useAppSelector(s => (s as any).ui.selectedAds);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const doApprove = async () => {
    for (const id of selected) {
      await axiosClient.post(`/ads/${id}/approve`);
    }
    dispatch(clearSelection());
    onRefresh?.();
    handleClose();
  };

  const doReject = async () => {
    // for demo, reject with reason "Другое"
    for (const id of selected) {
      await axiosClient.post(`/ads/${id}/reject`, { reason: 'Другое', comment: 'Массовое отклонение' });
    }
    dispatch(clearSelection());
    onRefresh?.();
    handleClose();
  };

  const handleExport = () => {
    // request details for selected ads and export CSV
    exportAdsToCSV(selected).then((blob) => saveAs(blob, 'ads_export.csv'));
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Typography>{selected.length} выбрано</Typography>
      <Button variant="outlined" onClick={handleOpenMenu} disabled={selected.length === 0}>
        Действия
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={doApprove}>Массово одобрить</MenuItem>
        <MenuItem onClick={doReject}>Массово отклонить</MenuItem>
        <MenuItem onClick={handleExport}>Экспорт CSV</MenuItem>
      </Menu>
    </Box>
  );
}