import { create } from 'zustand';
import { startOfDay, endOfDay, startOfWeek, endOfMonth, startOfMonth, subDays } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/types/transaction';

export type DateFilterType = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export interface DashboardStats {
  omzet: number;
  hpp: number;
  expense: number;
  laba: number;
  totalTransactions: number;
  lowStockCount: number;
  piutang: number;
  hutang: number;
}

export interface MonthlyRevenue {
  month: string;
  date: string;
  omzet: number;
  hpp: number;
  expense: number;
  laba: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  total_quantity: number;
  total_revenue: number;
}

interface DashboardState {
  dateFilter: DateFilterType;
  customStartDate: Date | null;
  customEndDate: Date | null;
  
  // Data
  stats: DashboardStats | null;
  monthlyRevenue: MonthlyRevenue[];
  topProducts: TopProduct[];
  transactions: Transaction[]; // Tambahan untuk CashFlow, PaymentMethod, & RecentTransactions
  isLoading: boolean;
  error: string | null;

  // Actions
  setDateFilter: (filter: DateFilterType) => void;
  setCustomDateRange: (start: Date, end: Date) => void;
  fetchDashboardData: () => Promise<void>;
}

export const getDashboardDateRange = (filter: DateFilterType, customStart: Date | null, customEnd: Date | null) => {
  const now = new Date();
  
  switch (filter) {
    case 'today':
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
    case 'yesterday': {
      const yesterday = subDays(now, 1);
      return { startDate: startOfDay(yesterday), endDate: endOfDay(yesterday) };
    }
    case 'this_week':
      return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfDay(now) };
    case 'this_month':
      return { startDate: startOfMonth(now), endDate: endOfDay(now) };
    case 'custom':
      if (customStart && customEnd) {
        return { startDate: startOfDay(customStart), endDate: endOfDay(customEnd) };
      }
      return { startDate: startOfDay(now), endDate: endOfDay(now) }; // fallback
    default:
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
  }
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dateFilter: 'this_month',
  customStartDate: null,
  customEndDate: null,
  
  stats: null,
  monthlyRevenue: [],
  topProducts: [],
  transactions: [],
  isLoading: false,
  error: null,

  setDateFilter: (filter) => {
    set({ dateFilter: filter });
    get().fetchDashboardData();
  },

  setCustomDateRange: (start, end) => {
    set({ customStartDate: start, customEndDate: end, dateFilter: 'custom' });
    get().fetchDashboardData();
  },

  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { dateFilter, customStartDate, customEndDate } = get();
      const { startDate, endDate } = getDashboardDateRange(dateFilter, customStartDate, customEndDate);

      // 1. Fetch Stats (RPC)
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_dashboard_stats', { 
          p_start_date: startDate.toISOString(), 
          p_end_date: endDate.toISOString() 
        });
        
      if (statsError) throw statsError;

      // 2. Fetch Monthly Revenue (RPC)
      const { data: monthlyData, error: monthlyError } = await supabase
        .rpc('get_monthly_revenue', { p_months: 12 });
        
      if (monthlyError) throw monthlyError;

      // 3. Fetch Top Products (RPC)
      const { data: topProductsData, error: topProductsError } = await supabase
        .rpc('get_top_products', { 
          p_start_date: startDate.toISOString(), 
          p_end_date: endDate.toISOString(),
          p_limit: 5
        });

      if (topProductsError) throw topProductsError;

      // 4. Fetch Transactions for the period (limit to prevent overloading)
      const { data: trxData, error: trxError } = await supabase
        .from('transactions')
        .select(`
          *,
          items:transaction_items(*)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (trxError) throw trxError;

      // Map transactions to match Transaction interface
      const mappedTransactions: Transaction[] = (trxData || []).map((data: any) => ({
        id: data.id,
        invoiceNumber: data.invoice_number,
        customerId: data.customer_id,
        customerName: data.customer_name,
        date: data.created_at,
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
        items: (data.items || []).map((item: any) => ({
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

      set({ 
        stats: statsData as DashboardStats,
        monthlyRevenue: (monthlyData as MonthlyRevenue[]) || [],
        topProducts: (topProductsData as TopProduct[]) || [],
        transactions: mappedTransactions,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  }
}));
