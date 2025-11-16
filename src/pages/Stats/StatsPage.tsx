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
} from 'recharts';
import dayjs from 'dayjs';
import styles from './StatsPage.module.css';

type StatsSummary = {
  totalReviewed?: number;
  totalReviewedToday?: number;
  totalReviewedThisWeek?: number;
  totalReviewedThisMonth?: number;
  approvedPercentage?: number;
  rejectedPercentage?: number;
  requestChangesPercentage?: number;
  averageReviewTime?: number;
};

type ActivityData = {
  date: string;
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

const fetchSummary = async (period: string) => {
  const { data } = await axios.get<StatsSummary>('/api/v1/stats/summary', { params: { period } });
  return data;
};
const fetchActivity = async (period: string) => {
  const { data } = await axios.get<ActivityData[]>('/api/v1/stats/chart/activity', { params: { period } });
  return data;
};
const fetchDecisions = async (period: string) => {
  const { data } = await axios.get<DecisionsData>('/api/v1/stats/chart/decisions', { params: { period } });
  return data;
};
const fetchCategories = async (period: string) => {
  const { data } = await axios.get<CategoriesResponse>('/api/v1/stats/chart/categories', { params: { period } });
  return data;
};

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

export default function StatsPage(): React.ReactElement {
  const theme = useTheme();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  const summaryQuery = useQuery<StatsSummary, Error>({ queryKey: ['stats-summary', period], queryFn: () => fetchSummary(period), staleTime: 120000 });
  const activityQuery = useQuery<ActivityData[], Error>({ queryKey: ['stats-activity', period], queryFn: () => fetchActivity(period), staleTime: 120000 });
  const decisionsQuery = useQuery<DecisionsData, Error>({ queryKey: ['stats-decisions', period], queryFn: () => fetchDecisions(period), staleTime: 120000 });
  const categoriesQuery = useQuery<CategoriesResponse, Error>({ queryKey: ['stats-categories', period], queryFn: () => fetchCategories(period), staleTime: 120000 });

  const loading = summaryQuery.isLoading || activityQuery.isLoading || decisionsQuery.isLoading || categoriesQuery.isLoading;

  const activityChartData = useMemo(() => {
    return (activityQuery.data ?? []).map((d) => ({
      dateLabel: dayjs(d.date).format('DD MMM'),
      approved: d.approved ?? 0,
      rejected: d.rejected ?? 0,
      requestChanges: d.requestChanges ?? 0,
      total: (d.approved ?? 0) + (d.rejected ?? 0) + (d.requestChanges ?? 0),
    }));
  }, [activityQuery.data]);

  const decisionsChartData = useMemo(() => {
    const d = decisionsQuery.data;
    if (!d) return [];
    return [
      { name: 'Одобрено', value: d.approved ?? 0, key: 'approved' },
      { name: 'Отклонено', value: d.rejected ?? 0, key: 'rejected' },
      { name: 'Доработка', value: d.requestChanges ?? 0, key: 'requestChanges' },
    ];
  }, [decisionsQuery.data]);

  const categoriesChartData = useMemo(() => {
    const obj = categoriesQuery.data ?? {};
    return Object.entries(obj).map(([category, count]) => ({ category, count }));
  }, [categoriesQuery.data]);

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>Статистика</Typography>

      <Paper variant="outlined" className={styles.periodPaper}>
        <Tabs value={period} onChange={(_, v) => setPeriod(v)} textColor="primary" indicatorColor="primary">
          <Tab value="today" label="Сегодня" />
          <Tab value="week" label="7д" />
          <Tab value="month" label="30д" />
        </Tabs>
      </Paper>

      <Grid container spacing={2} className={styles.gridSpacing}>
        {['totalReviewed', 'approvedPercentage', 'rejectedPercentage', 'averageReviewTime'].map((key, idx) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card className={styles.metricCard}>
              <Typography variant="subtitle2" color="text.secondary">
                {key === 'totalReviewed' ? 'Проверено' : key === 'approvedPercentage' ? 'Одобрено' : key === 'rejectedPercentage' ? 'Отклонено' : 'Ср. время'}
              </Typography>
              {summaryQuery.isLoading ? (
                <Skeleton width={90} height={36} />
              ) : summaryQuery.isError ? (
                <Typography color="error">—</Typography>
              ) : (
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {key === 'totalReviewed' ? summaryQuery.data?.totalReviewed ?? 0
                    : key === 'approvedPercentage' ? (typeof summaryQuery.data?.approvedPercentage === 'number' ? `${Math.round(summaryQuery.data.approvedPercentage)}%` : '-')
                    : key === 'rejectedPercentage' ? (typeof summaryQuery.data?.rejectedPercentage === 'number' ? `${Math.round(summaryQuery.data.rejectedPercentage)}%` : '-')
                    : formatTime(summaryQuery.data?.averageReviewTime)
                  }
                </Typography>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" className={styles.chartPaper}>
        <Typography className={styles.chartTitle}>
          График активности ({period === 'week' ? '7 дней' : period === 'month' ? '30 дней' : 'Сегодня'})
        </Typography>
        <Box className={styles.chartBox}>
          {activityQuery.isLoading ? <Skeleton variant="rectangular" width="100%" height={220} /> :
           activityQuery.isError ? <Typography color="error">Ошибка загрузки данных активности</Typography> :
           activityChartData.length > 0 ? (
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
          ) : <Typography color="text.secondary">Нет данных</Typography>}
        </Box>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className={styles.piePaper}>
            <Typography className={styles.chartTitle}>Распределение решений</Typography>
            <Box className={styles.pieChartBox}>
              <PieChart width={260} height={240}>
                <Pie data={decisionsChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false} isAnimationActive={false}>
                  {decisionsChartData.map((entry) => {
                    const color = entry.key === 'approved' ? COLORS.approved : entry.key === 'rejected' ? COLORS.rejected : COLORS.requestChanges;
                    return <Cell key={entry.name} fill={color} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" className={styles.barPaper}>
            <Typography className={styles.chartTitle}>Категории объявлений</Typography>
            <Box style={{ width: '100%', height: 240 }}>
              {categoriesQuery.isLoading ? <Skeleton variant="rectangular" width="100%" height={200} /> :
               categoriesQuery.isError ? <Typography color="error">Ошибка загрузки</Typography> :
               categoriesChartData.length === 0 ? <Typography color="text.secondary">Нет данных</Typography> :
               <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoriesChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={false} axisLine={false} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={theme.palette.primary.main} />
                </BarChart>
               </ResponsiveContainer>}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
