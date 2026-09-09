import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { PurchaseOrder, Supplier, PurchaseOrderItem } from '@/types/purchase';

interface PurchaseState {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;
  
  // Suppliers
  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases' | 'totalDebt'>) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplier: (id: string) => Supplier | undefined;
  
  // Purchase Orders
  fetchPurchaseOrders: () => Promise<void>;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrder>) => Promise<void>;
  receivePurchaseOrder: (id: string, items: { productId: string; qtyReceived: number }[]) => Promise<void>;
  payPurchaseOrder: (id: string, amount: number, method: string, bankAccountId?: string) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  getPurchaseOrder: (id: string) => PurchaseOrder | undefined;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  suppliers: [],
  purchaseOrders: [],
  isLoading: false,
  error: null,

  // --- SUPPLIERS ---
  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      const suppliers: Supplier[] = data.map(s => ({
        id: s.id,
        name: s.name,
        contactPerson: s.contact_person,
        phone: s.phone,
        email: s.email,
        address: s.address,
        totalPurchases: s.total_purchases,
        totalDebt: s.total_debt,
        createdAt: s.created_at
      }));
      
      set({ suppliers });
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addSupplier: async (supplier) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('suppliers').insert({
        name: supplier.name,
        contact_person: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address
      });
      if (error) throw error;
      await get().fetchSuppliers();
    } catch (err: any) {
      console.error('Error adding supplier:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateSupplier: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('suppliers').update({
        name: data.name,
        contact_person: data.contactPerson,
        phone: data.phone,
        email: data.email,
        address: data.address
      }).eq('id', id);
      if (error) throw error;
      await get().fetchSuppliers();
    } catch (err: any) {
      console.error('Error updating supplier:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSupplier: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      await get().fetchSuppliers();
    } catch (err: any) {
      console.error('Error deleting supplier:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getSupplier: (id) => get().suppliers.find(s => s.id === id),

  // --- PURCHASE ORDERS ---
  fetchPurchaseOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*),
          items:purchase_order_items(*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const purchaseOrders: PurchaseOrder[] = data.map(po => ({
        id: po.id,
        poNumber: po.po_number,
        supplierId: po.supplier_id,
        totalAmount: po.total_amount,
        status: po.status,
        paymentStatus: po.payment_status,
        paidAmount: po.paid_amount,
        dueDate: po.due_date,
        paymentMethod: po.payment_method,
        bankAccountId: po.bank_account_id,
        notes: po.notes,
        paymentNotes: po.payment_notes,
        createdAt: po.created_at,
        updatedAt: po.updated_at,
        supplier: po.supplier ? {
          id: po.supplier.id,
          name: po.supplier.name,
          contactPerson: po.supplier.contact_person,
          phone: po.supplier.phone,
          email: po.supplier.email,
          address: po.supplier.address,
          totalPurchases: po.supplier.total_purchases,
          totalDebt: po.supplier.total_debt,
          createdAt: po.supplier.created_at
        } : undefined,
        items: (po.items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          sku: item.sku,
          quantity: item.quantity,
          receivedQuantity: item.received_quantity,
          buyPrice: item.buy_price,
          subtotal: item.subtotal
        }))
      }));
      
      set({ purchaseOrders });
    } catch (err: any) {
      console.error('Error fetching purchase orders:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addPurchaseOrder: async (po) => {
    set({ isLoading: true, error: null });
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
      const poNumber = `PO-${dateStr}-${randomStr}`;

      const payload = {
        po_number: poNumber,
        supplier_id: po.supplierId,
        total_amount: po.totalAmount,
        status: po.status || 'draft',
        due_date: po.dueDate,
        notes: po.notes,
        items: po.items.map(item => ({
          product_id: item.productId,
          product_name: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          buy_price: item.buyPrice,
          subtotal: item.subtotal
        }))
      };

      const { data, error } = await supabase.rpc('create_purchase_order', { payload });
      if (error) throw error;
      if (!data || !data.success) throw new Error('Gagal memproses PO di database');

      await get().fetchPurchaseOrders();
      await get().fetchSuppliers();
      
      return data.po_id;
    } catch (err: any) {
      console.error('Error adding purchase order:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePurchaseOrder: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('purchase_orders').update({
        status: data.status,
        due_date: data.dueDate,
        notes: data.notes,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      
      if (error) throw error;
      await get().fetchPurchaseOrders();
    } catch (err: any) {
      console.error('Error updating purchase order:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  receivePurchaseOrder: async (id, items) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        po_id: id,
        items: items.map(i => ({
          product_id: i.productId,
          qty_received: i.qtyReceived
        }))
      };
      
      const { error } = await supabase.rpc('receive_purchase_order', { payload });
      if (error) throw error;
      
      await get().fetchPurchaseOrders();
    } catch (err: any) {
      console.error('Error receiving purchase order:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  payPurchaseOrder: async (id, amount, method, bankAccountId) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        po_id: id,
        amount: amount,
        payment_method: method,
        bank_account_id: bankAccountId || null
      };
      
      const { error } = await supabase.rpc('pay_purchase_order', { payload });
      if (error) throw error;
      
      await get().fetchPurchaseOrders();
      await get().fetchSuppliers();
    } catch (err: any) {
      console.error('Error paying purchase order:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deletePurchaseOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
      if (error) throw error;
      await get().fetchPurchaseOrders();
    } catch (err: any) {
      console.error('Error deleting purchase order:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getPurchaseOrder: (id) => get().purchaseOrders.find(po => po.id === id),

}));
