import type { User } from '@/types';

export const users: User[] = [
  {
    id: 'u1',
    name: 'Ahmad Fauzi',
    email: 'admin@tokomakmur.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'u2',
    name: 'Siti Nurhaliza',
    email: 'siti@tokomakmur.com',
    role: 'kasir',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'u3',
    name: 'Budi Santoso',
    email: 'budi@tokomakmur.com',
    role: 'kasir',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2024-02-01T09:30:00Z',
  },
];

export const mockUsers = users;
