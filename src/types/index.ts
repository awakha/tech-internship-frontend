export type AdStatus = 'pending' | 'approved' | 'rejected' | 'draft';
export type AdPriority = 'normal' | 'urgent';

export interface Seller {
  id: number;
  name: string;
  rating: string;
  totalAds: number;
  registeredAt: string;
}

export interface ModerationHistory {
  id: number;
  moderatorId: number;
  moderatorName: string;
  action: 'approved' | 'rejected' | 'requestChanges';
  reason?: string | null;
  comment?: string;
  timestamp: string;
}

export interface Advertisement {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  status: AdStatus;
  priority: AdPriority;
  createdAt: string;
  updatedAt: string;
  images: string[];
  seller: Seller;
  characteristics: Record<string, string>;
  moderationHistory: ModerationHistory[];
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
