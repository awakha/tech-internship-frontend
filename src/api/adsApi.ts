import axiosClient from './axiosClient';
import type { Advertisement } from '../types';

export interface GetAdsParams {
  page?: number;
  limit?: number;
  status?: string | string[];
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'createdAt' | 'price' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export const getAds = (params: GetAdsParams, signal?: AbortSignal) => {
  return axiosClient.get('/ads', { params, signal }).then(r => r.data);
};

export const getAdById = (id: number, signal?: AbortSignal) =>
  axiosClient.get<Advertisement>(`/ads/${id}`, { signal }).then(r => r.data);

export const approveAd = (id: number) =>
  axiosClient.post(`/ads/${id}/approve`).then(r => r.data);

export const rejectAd = (id: number, payload: { reason: string; comment?: string }) =>
  axiosClient.post(`/ads/${id}/reject`, payload).then(r => r.data);

export const requestChanges = (id: number, payload: { reason: string; comment?: string }) =>
  axiosClient.post(`/ads/${id}/request-changes`, payload).then(r => r.data);