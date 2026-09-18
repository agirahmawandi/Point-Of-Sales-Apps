import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { ProductWriteOff } from '@/types/writeOff';
import { useProductStore } from './productStore';

interface WriteOffState {
  writeOffs: ProductWriteOff[];
  isLoading: boolean;
  error: string | null;
  fetchWriteOffs: () => Promise<void>;
  createWriteOff: (
    productId: string,
    quantity: number,
    reason: string,
    lossAmount: number
  ) => Promise<void>;
  resetWriteOffs: () => void;
}

export const useWriteOffStore = create<WriteOffState>()((set, get) => ({
  writeOffs: [],
  isLoading: false,
  error: null,

  fetchWriteOffs: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('product_write_offs')
        .select(`
          id, product_id, date, quantity, reason, loss_amount, created_at,
          product:products(name)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const formatted = data.map((d: any) => ({
        id: d.id,
        productId: d.product_id,
        productName: d.product?.name || 'Produk Dihapus',
        date: d.date,
        quantity: Number(d.quantity),
        reason: d.reason,
        lossAmount: Number(d.loss_amount),
        createdAt: d.created_at,
      }));

      set({ writeOffs: formatted });
    } catch (err: any) {
      console.error('Error fetching write-offs:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createWriteOff: async (productId, quantity, reason, lossAmount) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.rpc('create_write_off', {
        p_product_id: productId,
        p_quantity: quantity,
        p_reason: reason,
        p_loss_amount: lossAmount
      });

      if (error) throw error;

      // Refresh data
      await get().fetchWriteOffs();
      
      // Update local product store stock so it's instantly reflected
      useProductStore.getState().reduceStock(productId, quantity);
      
    } catch (err: any) {
      console.error('Error creating write-off:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  resetWriteOffs: () => set({ writeOffs: [] }),
}));
