export type UserRole = 'admin' | 'kasir';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

export type TransactionStatus = 'sukses' | 'pending' | 'batal';
export type PurchaseOrderStatus = 'draft' | 'dikirim' | 'diterima_sebagian' | 'diterima' | 'batal';
export type PaymentStatus = 'lunas' | 'utang' | 'sebagian';
