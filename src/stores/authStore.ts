import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasAccess: (requiredRole?: UserRole) => boolean;
  initAuth: () => Promise<void>;
}

// Helper: bangun User dari data Supabase auth + profile DB
function buildUser(
  authUser: { id: string; email?: string; user_metadata?: Record<string, any> },
  profile: { name?: string; role?: string; avatar?: string } | null
): User {
  // Prioritas: profiles DB → user_metadata → fallback
  return {
    id: authUser.id,
    name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    role: ((profile?.role || authUser.user_metadata?.role || 'kasir') as UserRole),
    avatar: profile?.avatar ?? authUser.user_metadata?.avatar_url,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Inisialisasi session dari Supabase (dipanggil saat app mount)
      initAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Coba ambil profil dari DB
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, role, avatar')
              .eq('id', session.user.id)
              .single();

            const user = buildUser(session.user, profile);
            set({ user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (err) {
          console.error('initAuth error:', err);
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      // Login menggunakan Supabase Auth
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error || !data.user) {
            return { success: false, error: 'Email atau password salah' };
          }

          // Coba ambil profil dari DB
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role, avatar')
            .eq('id', data.user.id)
            .single();

          // Log untuk debug
          console.log('[Auth] profile from DB:', profile);
          console.log('[Auth] user_metadata:', data.user.user_metadata);

          const user = buildUser(data.user, profile);
          console.log('[Auth] resolved user:', user);

          set({ user, isAuthenticated: true });

          // Sync profil ke DB jika belum ada
          if (!profile) {
            await supabase.from('profiles').insert({
              id: data.user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            }).select().single();
          }

          return { success: true };
        } catch (err: any) {
          console.error('Login error:', err);
          return { success: false, error: 'Terjadi kesalahan saat login' };
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout dari Supabase
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      // Cek akses berdasarkan role
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
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
