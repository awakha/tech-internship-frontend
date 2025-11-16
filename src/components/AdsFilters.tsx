// src/features/ads/AdsFilters.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  OutlinedInput,
  Button,
} from '@mui/material';

const categories = [
  { id: '', label: 'Все категории' },
  { id: 0, label: 'Электроника' },
  { id: 1, label: 'Недвижимость' },
  { id: 2, label: 'Транспорт' },
  { id: 3, label: 'Работа' },
  { id: 4, label: 'Услуги' },
  { id: 5, label: 'Животные' },
  { id: 6, label: 'Мода' },
  { id: 7, label: 'Детское' },
];

const statuses = [
  { value: '', label: 'Все' },
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
];

const priorities = [
  { value: '', label: 'Все' },
  { value: 'normal', label: 'Обычный' },
  { value: 'urgent', label: 'Срочный' },
];

export default function AdsFilters({ filters, onChange }: any) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [priority, setPriority] = useState(filters.priority ?? '');
  const [categoryId, setCategoryId] = useState(filters.categoryId ?? '');
  const [minPrice, setMinPrice] = useState(filters.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? '');

  const searchRef = useRef<HTMLInputElement>(null);
  const timer = useRef<any>(null);

  // авто применение фильтров
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    console.log('applyFilters ->', {
  search: search || undefined,
  status: status || undefined,
  priority: priority || undefined,
  categoryId: categoryId === '' ? undefined : Number(categoryId),
  minPrice: minPrice === '' ? undefined : Number(minPrice),
  maxPrice: maxPrice === '' ? undefined : Number(maxPrice),
});

    timer.current = setTimeout(() => {
      onChange({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        categoryId: categoryId === '' ? undefined : Number(categoryId),
        minPrice: minPrice === '' ? undefined : Number(minPrice),
        maxPrice: maxPrice === '' ? undefined : Number(maxPrice),
      });
    }, 300);

    return () => clearTimeout(timer.current);
  }, [search, status, priority, categoryId, minPrice, maxPrice]);

  // Горячая клавиша "/"
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '/' && searchRef.current) {
      e.preventDefault();
      searchRef.current.focus();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const clearAll = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');

    onChange({
      search: undefined,
      status: undefined,
      priority: undefined,
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const fieldHeight = { height: 54, display: 'flex', alignItems: 'center' };
  const menuProps = { PaperProps: { sx: { mt: 1.5 } } };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1100,
        mx: 'auto',
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: (t) => t.palette.background.paper,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
        Поиск и фильтрация
      </Typography>


      <TextField
        fullWidth
        placeholder={search ? '' : 'Поиск по названию'} 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        inputRef={searchRef}
        sx={{ mb: 3 }}
      />


      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Статус</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            input={<OutlinedInput label="Статус" />}
            MenuProps={menuProps}
            sx={fieldHeight}
          >
            {statuses.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Приоритет</InputLabel>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            input={<OutlinedInput label="Приоритет" />}
            MenuProps={menuProps}
            sx={fieldHeight}
          >
            {priorities.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>


      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Категория</InputLabel>
        <Select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          input={<OutlinedInput label="Категория" />}
          MenuProps={menuProps}
          sx={fieldHeight}
        >
          {categories.map((c) => (
            <MenuItem key={String(c.id)} value={c.id}>
              {c.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography sx={{ mb: 1, fontWeight: 500 }}>Цена</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="От"
          value={minPrice}
          type="number"
          onChange={(e) => setMinPrice(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={fieldHeight}
        />
        <TextField
          fullWidth
          label="До"
          value={maxPrice}
          type="number"
          onChange={(e) => setMaxPrice(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={fieldHeight}
        />
      </Box>

      <Button fullWidth variant="contained" onClick={clearAll} sx={{ py: 1.3 }}>
        Сбросить фильтры
      </Button>
    </Box>
  );
}
