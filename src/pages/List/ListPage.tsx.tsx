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
import styles from './ListPage.module.css';

const PAGE_LIMIT = 10;

export default function AdsListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const parsed = queryString.parse(location.search, { arrayFormat: 'bracket' });

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

  const filteredAds = useMemo(() => {
    if (!filters.priority) return data?.ads ?? [];
    const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
    return data?.ads?.filter((ad: any) => priorities.includes(ad.priority)) ?? [];
  }, [data?.ads, filters.priority]);

  return (
    <Box className={styles.container}>
      <Box className={styles.bulkActionsWrapper}>
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
          <Box className={styles.adsList}>
            {filteredAds.map((ad: any) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </Box>

          <Box className={styles.paginationWrapper}>
            <Pagination
              current={data?.pagination?.currentPage ?? 1}
              totalPages={data?.pagination?.totalPages ?? 1}
              onChange={(p) => updateUrl({ ...filters, page: p })}
            />
            <Typography className={styles.totalItems}>
              Всего: {data?.pagination?.totalItems ?? 0}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
