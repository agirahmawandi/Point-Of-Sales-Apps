import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';

interface ProductState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Local state modifiers for sync operations (used in checkout/cart)
  reduceStock: (id: string, quantity: number) => void;
  addStock: (id: string, quantity: number) => void;
  updatePurchasePrice: (id: string, newPrice: number) => void;
  resetAllProductStocks: (toQuantity?: number) => void;
  updateStock: (id: string, newStock: number, reason?: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, products(count)')
        .order('name');
        
      if (error) throw error;
      
      const categories: Category[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        productCount: item.products?.[0]?.count || 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      
      set({ categories });
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          description: categoryData.description || null,
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      
      set((state) => ({ categories: [...state.categories, newCategory] }));
    } catch (err: any) {
      console.error('Error adding category:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const updatePayload: any = {};
      if (categoryData.name !== undefined) updatePayload.name = categoryData.name;
      if (categoryData.description !== undefined) updatePayload.description = categoryData.description;
      updatePayload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('categories')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      set((state) => ({
        categories: state.categories.map(c => 
          c.id === id ? { ...c, name: data.name, description: data.description || undefined, updatedAt: data.updated_at } : c
        )
      }));
    } catch (err: any) {
      console.error('Error updating category:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      }));
    } catch (err: any) {
      console.error('Error deleting category:', err);
      set({ error: err.message });
      throw err; // Re-throw to allow component to handle if needed
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get all active products with category name
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('is_active', true)
        .order('name');
        
      if (error) throw error;
      
      const products: Product[] = (data || []).map(item => ({
        id: item.id,
        sku: item.sku,
        barcode: item.barcode || undefined,
        name: item.name,
        categoryId: item.category_id || '',
        category: (item.categories as any)?.name,
        description: item.description || undefined,
        purchasePrice: item.buy_price,
        buyPrice: item.buy_price,
        costPrice: item.buy_price,
        sellingPrice: item.sell_price,
        sellPrice: item.sell_price,
        stock: item.stock,
        minStock: item.min_stock,
        unit: item.unit || undefined,
        imageUrl: item.image_url || undefined,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      
      set({ products });
    } catch (err: any) {
      console.error('Error fetching products:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Check if SKU exists
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('sku', productData.sku)
        .eq('is_active', true);
        
      if (countError) throw countError;
      if (count && count > 0) {
        throw new Error(`SKU ${productData.sku} sudah digunakan.`);
      }

      // 2. Insert product
      const { data, error } = await supabase
        .from('products')
        .insert([{
          sku: productData.sku,
          barcode: productData.barcode || null,
          name: productData.name,
          category_id: productData.categoryId,
          description: productData.description || null,
          buy_price: productData.purchasePrice || 0,
          sell_price: productData.sellingPrice || 0,
          stock: productData.stock || 0,
          min_stock: productData.minStock || 0,
          unit: productData.unit || null,
          image_url: productData.imageUrl || null,
          is_active: true,
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      await get().fetchProducts();
      
    } catch (err: any) {
      console.error('Error adding product:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      // 1. If SKU is being updated, check if it's unique
      if (productData.sku) {
        const { count, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('sku', productData.sku)
          .neq('id', id)
          .eq('is_active', true);
          
        if (countError) throw countError;
        if (count && count > 0) {
          throw new Error(`SKU ${productData.sku} sudah digunakan.`);
        }
      }

      // 2. Map payload
      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (productData.sku !== undefined) updatePayload.sku = productData.sku;
      if (productData.barcode !== undefined) updatePayload.barcode = productData.barcode || null;
      if (productData.name !== undefined) updatePayload.name = productData.name;
      if (productData.categoryId !== undefined) updatePayload.category_id = productData.categoryId;
      if (productData.description !== undefined) updatePayload.description = productData.description || null;
      if (productData.purchasePrice !== undefined) updatePayload.buy_price = productData.purchasePrice;
      if (productData.sellingPrice !== undefined) updatePayload.sell_price = productData.sellingPrice;
      if (productData.stock !== undefined) updatePayload.stock = productData.stock;
      if (productData.minStock !== undefined) updatePayload.min_stock = productData.minStock;
      if (productData.unit !== undefined) updatePayload.unit = productData.unit || null;
      if (productData.imageUrl !== undefined) updatePayload.image_url = productData.imageUrl || null;

      const { error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id);
        
      if (error) throw error;
      
      await get().fetchProducts();
      
    } catch (err: any) {
      console.error('Error updating product:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Soft delete
      const { error } = await supabase
        .from('products')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } catch (err: any) {
      console.error('Error deleting product:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStock: async (id: string, newStock: number, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock: newStock, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, stock: newStock, updatedAt: new Date().toISOString() } : p
        )
      }));
    } catch (err: any) {
      console.error('Error updating stock:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Legacy local mutations (keep for UI optimism or other stores like POS/cart)
  reduceStock: (id, quantity) => set((state) => ({
    products: state.products.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
    )
  })),

  addStock: (id, quantity) => set((state) => ({
    products: state.products.map(p => 
      p.id === id ? { ...p, stock: p.stock + quantity } : p
    )
  })),

  updatePurchasePrice: (id, newPrice) => set((state) => ({
    products: state.products.map(p => 
      p.id === id ? { 
        ...p, 
        purchasePrice: newPrice, 
        buyPrice: newPrice, 
        costPrice: newPrice,
        updatedAt: new Date().toISOString() 
      } : p
    )
  })),

  resetAllProductStocks: (toQuantity = 0) => set((state) => ({
    products: state.products.map(p => ({
      ...p,
      stock: toQuantity
    }))
  })),
}));
