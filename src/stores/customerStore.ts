import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  platform: 'Offline' | 'Shopee' | 'Tokopedia' | 'TikTok' | 'GoFood' | 'GrabFood' | 'ShopeeFood' | 'Lainnya';
  createdAt: string;
  totalTransactions: number;
  totalSpent: number;
}

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'totalTransactions' | 'totalSpent'>) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  recordTransaction: (id: string, amount: number) => Promise<void>;
  findCustomerByPhoneOrName: (query: string) => Customer | undefined;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const customers: Customer[] = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone || undefined,
        address: row.address || undefined,
        platform: (row.platform as Customer['platform']) || 'Offline',
        createdAt: row.created_at,
        totalTransactions: row.total_transactions,
        totalSpent: Number(row.total_spent)
      }));

      set({ customers, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  addCustomer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: newRow, error } = await supabase
        .from('customers')
        .insert([{
          name: data.name,
          phone: data.phone || null,
          address: data.address || null,
          platform: data.platform || 'Offline'
        }])
        .select()
        .single();

      if (error) throw error;

      const newCustomer: Customer = {
        id: newRow.id,
        name: newRow.name,
        phone: newRow.phone || undefined,
        address: newRow.address || undefined,
        platform: (newRow.platform as Customer['platform']) || 'Offline',
        createdAt: newRow.created_at,
        totalTransactions: newRow.total_transactions,
        totalSpent: Number(newRow.total_spent)
      };

      set((state) => ({ 
        customers: [newCustomer, ...state.customers],
        isLoading: false 
      }));
      
      return newCustomer;
    } catch (error: any) {
      console.error('Error adding customer:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateCustomer: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.phone !== undefined) updates.phone = data.phone;
      if (data.address !== undefined) updates.address = data.address;
      if (data.platform !== undefined) updates.platform = data.platform;

      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error updating customer:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  recordTransaction: async (id, amount) => {
    // We update local state optimistically so UI is fast.
    // DB update is now handled atomically via Supabase RPC during checkout.
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id
          ? {
              ...c,
              totalTransactions: c.totalTransactions + 1,
              totalSpent: c.totalSpent + amount,
            }
          : c
      ),
    }));
  },

  findCustomerByPhoneOrName: (query) => {
    if (!query) return undefined;
    const q = query.toLowerCase().trim();
    return get().customers.find(
      (c) =>
        (c.name && c.name.toLowerCase() === q) ||
        (c.phone && c.phone === q)
    );
  },
}));
