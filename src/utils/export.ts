import axiosClient from '../api/axiosClient';
import Papa from 'papaparse';

export async function exportAdsToCSV(ids: number[]) {
  const rows = [];
  for (const id of ids) {
    const { data } = await axiosClient.get(`/ads/${id}`);
    rows.push({
      id: data.id,
      title: data.title,
      price: data.price,
      category: data.category,
      status: data.status,
      priority: data.priority,
      createdAt: data.createdAt
    });
  }
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  return blob;
}