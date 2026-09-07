import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasAccess: (requiredRole?: UserRole) => boolean;
}

const mockUsers: Record<string, User & { password: string }> = {
  'admin@tokomakmur.com': {
    id: '1',
    name: 'Admin Utama',
    email: 'admin@tokomakmur.com',
    password: 'admin123',
    role: 'admin',
  },
  'siti@tokomakmur.com': {
    id: '2',
    name: 'Siti Kasir',
    email: 'siti@tokomakmur.com',
    password: 'kasir123',
    role: 'kasir',
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email, password) => {
        const user = mockUsers[email];
        if (user && user.password === password) {
          const { password: _, ...userData } = user;
          set({ user: userData, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      hasAccess: (requiredRole) => {
        const { user, isAuthenticated } = get();
        if (!isAuthenticated || !user) return false;
        if (!requiredRole) return true;
        if (user.role === 'admin') return true;
        return user.role === requiredRole;
      },
    }),
    {
      name: 'pos-auth-storage',
    }
  )
);
