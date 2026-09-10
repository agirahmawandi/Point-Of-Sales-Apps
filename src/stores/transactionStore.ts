import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Transaction, TransactionItem } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<string>;
  getTransaction: (id: string) => Promise<Transaction | undefined>;
  updateTransactionPaymentStatus: (id: string, paymentStatus: 'lunas' | 'tertunda', status?: 'success' | 'pending') => Promise<void>;
  
  // Dummy functions to fix compilation for UI components that haven't been updated yet
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  resetTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  
  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const transactions: Transaction[] = (data || []).map(row => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        customerId: row.customer_id,
        customerName: row.customer_name,
        date: new Date(row.created_at),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        transactionType: row.transaction_type,
        onlineDetails: row.transaction_type === 'online' ? {
          marketplace: row.marketplace || '',
          storeName: row.store_name || '',
          orderNumber: row.order_number || '',
          trackingNumber: row.tracking_number,
          customerName: row.customer_name || '',
          customerAddress: row.customer_address
        } : undefined,
        subtotal: row.subtotal,
        discount: row.discount_amount,
        tax: row.tax_amount,
        marketplaceFee: row.marketplace_fee,
        total: row.total,
        hpp: row.hpp,
        profit: row.profit,
        paymentMethod: row.payment_method,
        bankAccountId: row.bank_account_id,
        amountPaid: row.amount_paid,
        change: row.change_amount,
        cashierId: row.cashier_id,
        cashierName: row.cashier_name,
        status: row.status,
        paymentTiming: row.payment_timing,
        paymentStatus: row.payment_status,
        items: (row.transaction_items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          name: item.product_name,
          sku: item.sku,
          price: item.price,
          buyPrice: item.buy_price,
          quantity: item.quantity,
          subtotal: item.subtotal
        }))
      }));
      
      set({ transactions });
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addTransaction: async (transactionData) => {
    set({ isLoading: true, error: null });
    try {
      // Create invoice number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
      const invoiceNumber = `INV-${dateStr}-${randomStr}`;

      const payload = {
        invoice_number: invoiceNumber,
        customer_id: transactionData.customerId || null,
        customer_name: transactionData.customerName || null,
        transaction_type: transactionData.transactionType || 'offline',
        marketplace: transactionData.onlineDetails?.marketplace || null,
        store_name: transactionData.onlineDetails?.storeName || null,
        order_number: transactionData.onlineDetails?.orderNumber || null,
        tracking_number: transactionData.onlineDetails?.trackingNumber || null,
        customer_address: transactionData.onlineDetails?.customerAddress || null,
        subtotal: transactionData.subtotal,
        discount_amount: transactionData.discount || 0,
        tax_amount: transactionData.tax || 0,
        marketplace_fee: transactionData.marketplaceFee || 0,
        total: transactionData.total,
        hpp: transactionData.hpp || 0,
        profit: transactionData.profit || 0,
        payment_method: transactionData.paymentMethod,
        bank_account_id: transactionData.bankAccountId || null,
        amount_paid: transactionData.amountPaid || 0,
        change_amount: transactionData.change || 0,
        cashier_id: transactionData.cashierId || null,
        cashier_name: transactionData.cashierName || 'Unknown',
        status: transactionData.status || 'success',
        payment_timing: transactionData.paymentTiming || 'sekarang',
        payment_status: transactionData.paymentStatus || 'lunas',
        items: transactionData.items.map((item: any) => ({
          product_id: item.productId,
          product_name: item.name || item.productName || 'Unknown',
          sku: item.sku || null,
          price: item.price,
          buy_price: item.buyPrice || 0,
          quantity: item.quantity,
          subtotal: item.subtotal
        }))
      };

      // Call Supabase RPC
      const { data, error } = await supabase.rpc('process_checkout', { payload });

      if (error) throw error;

      if (!data || !data.success) {
        throw new Error('Gagal memproses checkout di database');
      }

      const transactionId = data.transaction_id;

      // Refresh list
      await get().fetchTransactions();

      return transactionId;
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  
  getTransaction: async (id: string) => {
    const existing = get().transactions.find(t => t.id === id);
    if (existing) return existing;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      const transaction: Transaction = {
        id: data.id,
        invoiceNumber: data.invoice_number,
        customerId: data.customer_id,
        customerName: data.customer_name,
        date: new Date(data.created_at),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        transactionType: data.transaction_type,
        onlineDetails: data.transaction_type === 'online' ? {
          marketplace: data.marketplace || '',
          storeName: data.store_name || '',
          orderNumber: data.order_number || '',
          trackingNumber: data.tracking_number,
          customerName: data.customer_name || '',
          customerAddress: data.customer_address
        } : undefined,
        subtotal: data.subtotal,
        discount: data.discount_amount,
        tax: data.tax_amount,
        marketplaceFee: data.marketplace_fee,
        total: data.total,
        hpp: data.hpp,
        profit: data.profit,
        paymentMethod: data.payment_method,
        bankAccountId: data.bank_account_id,
        amountPaid: data.amount_paid,
        change: data.change_amount,
        cashierId: data.cashier_id,
        cashierName: data.cashier_name,
        status: data.status,
        paymentTiming: data.payment_timing,
        paymentStatus: data.payment_status,
        items: (data.transaction_items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          name: item.product_name,
          sku: item.sku,
          price: item.price,
          buyPrice: item.buy_price,
          quantity: item.quantity,
          subtotal: item.subtotal
        }))
      };
      
      return transaction;
    } catch (err) {
      console.error('Error getting transaction:', err);
      return undefined;
    }
  },

  updateTransactionPaymentStatus: async (id, paymentStatus, status) => {
    set({ isLoading: true, error: null });
    try {
      const updatePayload: any = {
        payment_status: paymentStatus,
        payment_timing: paymentStatus === 'lunas' ? 'sekarang' : 'tertunda',
        status: status || (paymentStatus === 'lunas' ? 'success' : 'pending'),
        updated_at: new Date().toISOString()
      };

      // if paid, maybe update amount_paid to total (handled implicitly or explicitly)
      const existing = get().transactions.find(t => t.id === id);
      if (existing && paymentStatus === 'lunas') {
        updatePayload.amount_paid = existing.total;
      }

      const { error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      await get().fetchTransactions();
    } catch (err: any) {
      console.error('Error updating transaction status:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: (id, data) => {
    console.warn('updateTransaction is a dummy function now');
  },

  resetTransactions: () => {
    console.warn('resetTransactions is a dummy function now');
  }
}));
