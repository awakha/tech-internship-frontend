import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdsListPage from '../pages/List/ListPage.tsx'
import AdDetailPage from '../pages/Item/ItemPage.js';
import StatsPage from '../pages/Stats/StatsPage.js';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/list" replace />} />
      <Route path="/list" element={<AdsListPage />} />
      <Route path="/item/:id" element={<AdDetailPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}