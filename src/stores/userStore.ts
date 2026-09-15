import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'kasir';
  avatar?: string;
  created_at?: string;
}

interface UserState {
  users: UserProfile[];
  isLoading: boolean;
  
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<UserProfile, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, user: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useUserStore = create<UserState>()((set, get) => ({
  users: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      set({ users: data as UserProfile[] });
    } catch (err) {
    } finally {
      set({ isLoading: false });
    }
  },

  addUser: async (user) => {
    try {
      // NOTE: Option B implementation.
      // This will only create a profile row. The user will NOT be able to log in
      // until an actual Supabase Auth account is manually created for them by an admin.
      const { error } = await supabase.from('profiles').insert({
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      });
      
      if (error) throw error;
      await get().fetchUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menambahkan pengguna' };
    }
  },

  updateUser: async (id, user) => {
    try {
      const payload: any = {};
      if (user.name !== undefined) payload.name = user.name;
      if (user.email !== undefined) payload.email = user.email;
      if (user.role !== undefined) payload.role = user.role;
      if (user.avatar !== undefined) payload.avatar = user.avatar;
      
      const { error } = await supabase.from('profiles').update(payload).eq('id', id);
      
      if (error) throw error;
      await get().fetchUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal mengubah pengguna' };
    }
  },

  deleteUser: async (id) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      
      if (error) throw error;
      await get().fetchUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menghapus pengguna' };
    }
  }
}));
