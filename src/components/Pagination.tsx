import React from 'react';
import { Pagination as MuiPagination, Box } from '@mui/material';

interface Props {
  current: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ current, totalPages, onChange }: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <MuiPagination
        count={totalPages}
        page={current}
        onChange={(_, p) => onChange(p)}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}