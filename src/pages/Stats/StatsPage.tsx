// src/features/stats/StatsPage.tsx
import React, { useMemo, useState } from 'react';

import {
  Box,
  Card,
  Typography,
  Skeleton,
  Tabs,
  Tab,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';

/* -------------------
   Типы (согласно OpenAPI)
   ------------------- */

type StatsSummary = {
  totalReviewed?: number;
  totalReviewedToday?: number;
  totalReviewedThisWeek?: number;
  totalReviewedThisMonth?: number;
  approvedPercentage?: number;
  rejectedPercentage?: number;
  requestChangesPercentage?: number;
  averageReviewTime?: number; // seconds (integer)
};

type ActivityData = {
  date: string; // YYYY-MM-DD
  approved: number;
  rejected: number;
  requestChanges: number;
};

type DecisionsData = {
  approved?: number;
  rejected?: number;
  requestChanges?: number;
};

type CategoriesResponse = Record<string, number>;

/* -------------------
   API helpers
   ------------------- */

const fetchSummary = async (period: string) => {
  const { data } = await axios.get<StatsSummary>('/api/v1/stats/summary', {
    params: { period },
  });
  return data;
};

const fetchActivity = async (period: string) => {
  const { data } = await axios.get<ActivityData[]>('/api/v1/stats/chart/activity', {
    params: { period },
  });
  return data;
};

const fetchDecisions = async (period: string) => {
  const { data } = await axios.get<DecisionsData>('/api/v1/stats/chart/decisions', {
    params: { period },
  });
  return data;
};

const fetchCategories = async (period: string) => {
  const { data } = await axios.get<CategoriesResponse>('/api/v1/stats/chart/categories', {
    params: { period },
  });
  return data;
};

/* -------------------
   Вспомогательные
   ------------------- */

const formatTime = (seconds?: number) => {
  if (seconds == null) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}.${Math.round((secs / 60) * 10)} мин`;
  return `${secs} сек`;
};

const COLORS = {
  approved: '#4caf50',
  rejected: '#f44336',
  requestChanges: '#ffb300',
  muted: '#e0e0e0',
};

/* -------------------
   Компонент
   ------------------- */

export default function StatsPage(): React.ReactElement {
  const theme = useTheme();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  // Queries
  const summaryQuery = useQuery<StatsSummary, Error>({
    queryKey: ['stats-summary', period],
    queryFn: () => fetchSummary(period),
    staleTime: 1000 * 60 * 2,
  });

  const activityQuery = useQuery<ActivityData[], Error>({
    queryKey: ['stats-activity', period],
    queryFn: () => fetchActivity(period),
    staleTime: 1000 * 60 * 2,
  });

  const decisionsQuery = useQuery<DecisionsData, Error>({
    queryKey: ['stats-decisions', period],
    queryFn: () => fetchDecisions(period),
    staleTime: 1000 * 60 * 2,
  });

  const categoriesQuery = useQuery<CategoriesResponse, Error>({
    queryKey: ['stats-categories', period],
    queryFn: () => fetchCategories(period),
    staleTime: 1000 * 60 * 2,
  });

  const loading =
    summaryQuery.isLoading ||
    activityQuery.isLoading ||
    decisionsQuery.isLoading ||
    categoriesQuery.isLoading;

  // Prepare activity data for bar chart (group count)
  const activityChartData = useMemo(() => {
    const arr = activityQuery.data ?? [];
    // map to { dateLabel, total } or keep approved/rejected/requestChanges for stacked bars
    return arr.map((d) => ({
      dateLabel: dayjs(d.date).format('DD MMM'),
      approved: d.approved ?? 0,
      rejected: d.rejected ?? 0,
      requestChanges: d.requestChanges ?? 0,
      total: (d.approved ?? 0) + (d.rejected ?? 0) + (d.requestChanges ?? 0),
    }));
  }, [activityQuery.data]);

  // Prepare decisions pie data
  const decisionsChartData = useMemo(() => {
    const d = decisionsQuery.data;
    if (!d) return [];
    return [
      { name: 'Одобрено', value: d.approved ?? 0, key: 'approved' },
      { name: 'Отклонено', value: d.rejected ?? 0, key: 'rejected' },
      { name: 'Доработка', value: d.requestChanges ?? 0, key: 'requestChanges' },
    ];
  }, [decisionsQuery.data]);

  // Prepare categories bar data
  const categoriesChartData = useMemo(() => {
    const obj = categoriesQuery.data ?? {};
    return Object.entries(obj).map(([category, count]) => ({ category, count }));
  }, [categoriesQuery.data]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Статистика
      </Typography>

      {/* Period selector */}
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              mb: 3,
              backgroundColor: 'transparent', // прозрачный фон
            }}
          >
        <Tabs
          value={period}
          onChange={(_, v) => setPeriod(v)}
          textColor="primary"
          indicatorColor="primary"
          aria-label="period tabs"
        >
          <Tab value="today" label="Сегодня" />
          <Tab value="week" label="7д" />
          <Tab value="month" label="30д" />
        </Tabs>
      </Paper>

      {/* Metric cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, minHeight: 94 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Проверено
            </Typography>
            {summaryQuery.isLoading ? (
              <Skeleton width={90} height={36} />
            ) : summaryQuery.isError ? (
              <Typography color="error">—</Typography>
            ) : (
              <Typography variant="h5" sx={{ mt: 1 }}>
                {summaryQuery.data?.totalReviewed ?? 0}
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, minHeight: 94 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Одобрено
            </Typography>
            {summaryQuery.isLoading ? (
              <Skeleton width={90} height={36} />
            ) : summaryQuery.isError ? (
              <Typography color="error">—</Typography>
            ) : (
              <Typography variant="h5" sx={{ mt: 1 }}>
                {typeof summaryQuery.data?.approvedPercentage === 'number'
                  ? `${Math.round(summaryQuery.data!.approvedPercentage)}%`
                  : '-'}
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, minHeight: 94 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Отклонено
            </Typography>
            {summaryQuery.isLoading ? (
              <Skeleton width={90} height={36} />
            ) : summaryQuery.isError ? (
              <Typography color="error">—</Typography>
            ) : (
              <Typography variant="h5" sx={{ mt: 1 }}>
                {typeof summaryQuery.data?.rejectedPercentage === 'number'
                  ? `${Math.round(summaryQuery.data!.rejectedPercentage)}%`
                  : '-'}
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, minHeight: 94 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Ср. время
            </Typography>
            {summaryQuery.isLoading ? (
              <Skeleton width={90} height={36} />
            ) : summaryQuery.isError ? (
              <Typography color="error">—</Typography>
            ) : (
              <Typography variant="h5" sx={{ mt: 1 }}>
                {formatTime(summaryQuery.data?.averageReviewTime)}
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Activity chart */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          График активности ({period === 'week' ? '7 дней' : period === 'month' ? '30 дней' : 'Сегодня'})
        </Typography>

        <Box sx={{ width: '100%', height: 220 }}>
          {activityQuery.isLoading ? (
            <Skeleton variant="rectangular" width="100%" height={220} />
          ) : activityQuery.isError ? (
            <Typography color="error">Ошибка загрузки данных активности</Typography>
          ) : Array.isArray(activityChartData) && activityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" stackId="a" fill={COLORS.approved} />
                <Bar dataKey="requestChanges" stackId="a" fill={COLORS.requestChanges} />
                <Bar dataKey="rejected" stackId="a" fill={COLORS.rejected} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary">Нет данных</Typography>
          )}
        </Box>
      </Paper>

      {/* Decisions pie + categories bar */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2, 
                fontWeight: 600 
              }}
            >
              Распределение решений
            </Typography>

            <Box
              sx={{
                width: '100%',
                height: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pt: 1,   // чуть опустить сверху
                pb: 2,   // чуть поднять снизу
              }}
            >
              <PieChart width={260} height={240}>
                <Pie
                  data={decisionsChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={false}        // отключаем подписи
                  isAnimationActive={false}
                >
                  {decisionsChartData.map((entry) => {
                    if (entry.key === 'approved')
                      return <Cell key={entry.name} fill={COLORS.approved} />;

                    if (entry.key === 'rejected')
                      return <Cell key={entry.name} fill={COLORS.rejected} />;

                    return <Cell key={entry.name} fill={COLORS.requestChanges} />;
                  })}
                </Pie>

                <Tooltip />
              </PieChart>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Категории объявлений
            </Typography>

            <Box sx={{ width: '100%', height: 240 }}>
              {categoriesQuery.isLoading ? (
                <Skeleton variant="rectangular" width="100%" height={200} />
              ) : categoriesQuery.isError ? (
                <Typography color="error">Ошибка загрузки</Typography>
              ) : categoriesChartData.length === 0 ? (
                <Typography color="text.secondary">Нет данных</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoriesChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={false} axisLine={false} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
