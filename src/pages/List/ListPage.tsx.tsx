// src/features/ads/AdsListPage.tsx
import React, { useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import queryString from 'query-string';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';

import { getAds } from '../../api/adsApi';
import AdsFilters from '../../components/AdsFilters';
import AdCard from '../../components/AdsCard';
import Pagination from '../../components/Pagination';
import BulkActionsBar from '../../components/BulkActionsBar';
import Loader from '../../components/Loader';
import { useAppDispatch } from '../../app/hooks';
import { setSelection } from '../../app/store';

const PAGE_LIMIT = 10;

export default function AdsListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const parsed = queryString.parse(location.search, { arrayFormat: 'bracket' });

  // 🔹 Приводим все фильтры к string | string[] | undefined
  const filters = {
    page: Number(parsed.page ?? 1),
    limit: PAGE_LIMIT,
    search: Array.isArray(parsed.search) ? parsed.search[0] ?? undefined : parsed.search ?? undefined,
    status: Array.isArray(parsed.status)
      ? parsed.status.filter((v): v is string => v != null)
      : parsed.status ?? undefined,
    categoryId: parsed.categoryId ? Number(parsed.categoryId) : undefined,
    priority: Array.isArray(parsed.priority)
      ? parsed.priority.filter((v): v is string => v != null)
      : parsed.priority ?? undefined,
    minPrice: parsed.minPrice ? Number(parsed.minPrice) : undefined,
    maxPrice: parsed.maxPrice ? Number(parsed.maxPrice) : undefined,
  };

  const updateUrl = (next: any) => {
    const qs = queryString.stringify(next, {
      skipNull: true,
      skipEmptyString: true,
      arrayFormat: 'bracket',
    });

    navigate({ pathname: '/list', search: `?${qs}` });
  };

  useEffect(() => {
    dispatch(setSelection([]));
  }, [location.search]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ads', filters],
    queryFn: ({ signal }) => getAds(filters, signal),
  });

  // 🔹 Клиентская фильтрация по priority
  const filteredAds = useMemo(() => {
    if (!filters.priority) return data?.ads ?? [];
    // filters.priority может быть string или string[]
    const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
    return data?.ads?.filter((ad: any) => priorities.includes(ad.priority)) ?? [];
  }, [data?.ads, filters.priority]);

  return (
    <Box sx={{ width: '100%', maxWidth: 1050, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <BulkActionsBar onRefresh={() => refetch()} />
      </Box>

      <AdsFilters
        filters={filters}
        onChange={(
          f: {
            search?: string;
            status?: string;
            priority?: string;
            categoryId?: string;
            minPrice?: string;
            maxPrice?: string;
          }
        ) => {
          const next = {
            ...filters,
            ...f,
            priority: f.priority === '' ? undefined : f.priority,
            page: 1,
          };
          updateUrl(next);
        }}
      />

      {isLoading && <Loader />}

      {!isLoading && (
        <>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filteredAds.map((ad: any) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3, mb: 4 }}>
            <Pagination
              current={data?.pagination?.currentPage ?? 1}
              totalPages={data?.pagination?.totalPages ?? 1}
              onChange={(p) => updateUrl({ ...filters, page: p })}
            />
            <Typography
              variant="body2"
              sx={{ mt: 1, display: 'block', fontWeight: 500 }}
            >
              Всего: {data?.pagination?.totalItems ?? 0}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
