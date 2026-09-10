import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Investor {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  totalInvested: number;
  totalWithdrawn: number;
}

export interface InvestorDeposit {
  id: string;
  investorId: string;
  investorName: string;
  amount: number;
  method: 'cash' | 'transfer';
  bankAccountId?: string;
  notes?: string;
  date: string;
}

export interface ProfitShareDistribution {
  investorId: string;
  investorName: string;
  percentage: number;
  amount: number;
  method: 'cash' | 'transfer';
  bankAccountId?: string;
}

export interface ProfitShare {
  id: string;
  period: string; // e.g. "September 2026"
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  sharePercentage: number;
  shareAmount: number;
  distributions: ProfitShareDistribution[];
  notes?: string;
  createdAt: string;
}

export interface BalanceTransfer {
  id: string;
  fromType: 'cash' | 'qris' | 'bank';
  fromBankId?: string;
  toType: 'cash' | 'qris' | 'bank';
  toBankId?: string;
  amount: number;
  notes?: string;
  date: string;
}

interface FinanceState {
  investors: Investor[];
  investorDeposits: InvestorDeposit[];
  profitShares: ProfitShare[];
  balanceTransfers: BalanceTransfer[];
  cashBalance: number;
  qrisBalance: number;
  isLoading: boolean;

  fetchInvestors: () => Promise<void>;
  fetchCashBalances: () => Promise<void>;
  fetchBalanceTransfers: () => Promise<void>;
  fetchProfitShares: () => Promise<void>;

  addInvestor: (data: Omit<Investor, 'id' | 'createdAt' | 'totalInvested' | 'totalWithdrawn'>) => Promise<string>;
  updateInvestor: (id: string, data: Partial<Investor>) => Promise<void>;
  deleteInvestor: (id: string) => Promise<void>;
  addInvestorDeposit: (data: Omit<InvestorDeposit, 'id' | 'date'>) => Promise<void>;

  addProfitShare: (data: Omit<ProfitShare, 'id' | 'createdAt'>) => Promise<void>;
  addBalanceTransfer: (data: Omit<BalanceTransfer, 'id' | 'date'>) => Promise<void>;

  // Dummy functions to support any remaining unmigrated code that tries to use them
  updateCashBalance: (amount: number) => void;
  updateQrisBalance: (amount: number) => void;
  resetFinanceBalances: () => void;
}

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  investors: [],
  investorDeposits: [],
  profitShares: [],
  balanceTransfers: [],
  cashBalance: 0,
  qrisBalance: 0,
  isLoading: false,

  fetchInvestors: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('investors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      set({ investors: data.map((d: any) => ({
        id: d.id, name: d.name, phone: d.phone, notes: d.notes,
        createdAt: d.created_at, totalInvested: d.total_invested || 0, totalWithdrawn: d.total_withdrawn || 0
      })) });

      const depRes = await supabase.from('investor_deposits').select('*, investor:investors(name)').order('date', { ascending: false });
      if (!depRes.error && depRes.data) {
        set({ investorDeposits: depRes.data.map((d: any) => ({
          id: d.id, investorId: d.investor_id, investorName: d.investor?.name,
          amount: d.amount, method: d.method, bankAccountId: d.bank_account_id,
          notes: d.notes, date: d.date
        })) });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCashBalances: async () => {
    try {
      const { data, error } = await supabase.from('cash_balances').select('*');
      if (error) throw error;
      let cash = 0;
      let qris = 0;
      data.forEach((d: any) => {
        if (d.type === 'cash') cash = d.balance || 0;
        if (d.type === 'qris') qris = d.balance || 0;
      });
      set({ cashBalance: cash, qrisBalance: qris });
    } catch (e) {
      console.error(e);
    }
  },

  fetchBalanceTransfers: async () => {
    try {
      const { data, error } = await supabase.from('balance_transfers').select('*').order('date', { ascending: false });
      if (error) throw error;
      set({ balanceTransfers: data.map((d: any) => ({
        id: d.id, fromType: d.from_type, fromBankId: d.from_bank_id,
        toType: d.to_type, toBankId: d.to_bank_id, amount: d.amount, notes: d.notes, date: d.date
      })) });
    } catch (e) { console.error(e); }
  },

  fetchProfitShares: async () => {
    try {
      const { data, error } = await supabase.from('profit_shares').select('*, distributions:profit_share_distributions(*, investor:investors(name))').order('created_at', { ascending: false });
      if (error) throw error;
      set({ profitShares: data.map((d: any) => ({
        id: d.id, period: d.period, totalRevenue: d.total_revenue, totalExpense: d.total_expense,
        netProfit: d.net_profit, sharePercentage: d.share_percentage, shareAmount: d.share_amount,
        notes: d.notes, createdAt: d.created_at,
        distributions: d.distributions.map((dist: any) => ({
          investorId: dist.investor_id, investorName: dist.investor?.name,
          percentage: dist.percentage, amount: dist.amount,
          method: dist.method, bankAccountId: dist.bank_account_id
        }))
      })) });
    } catch (e) { console.error(e); }
  },

  addInvestor: async (data) => {
    const { data: res, error } = await supabase.from('investors').insert({
      name: data.name, phone: data.phone, notes: data.notes
    }).select().single();
    if (error) throw error;
    await get().fetchInvestors();
    return res.id;
  },

  updateInvestor: async (id, data) => {
    const { error } = await supabase.from('investors').update({
      name: data.name, phone: data.phone, notes: data.notes
    }).eq('id', id);
    if (error) throw error;
    await get().fetchInvestors();
  },

  deleteInvestor: async (id) => {
    const { error } = await supabase.from('investors').delete().eq('id', id);
    if (error) throw error;
    await get().fetchInvestors();
  },

  addInvestorDeposit: async (data) => {
    const payload = {
      investorId: data.investorId,
      investorName: data.investorName,
      amount: data.amount,
      method: data.method,
      bankAccountId: data.bankAccountId,
      notes: data.notes
    };
    const { error } = await supabase.rpc('create_investor_deposit', { payload });
    if (error) throw error;
    await get().fetchInvestors();
    await get().fetchCashBalances();
  },

  addProfitShare: async (data) => {
    const payload = {
      period: data.period,
      totalRevenue: data.totalRevenue,
      totalExpense: data.totalExpense,
      netProfit: data.netProfit,
      sharePercentage: data.sharePercentage,
      shareAmount: data.shareAmount,
      notes: data.notes,
      distributions: data.distributions.map(d => ({
        investorId: d.investorId,
        investorName: d.investorName,
        percentage: d.percentage,
        amount: d.amount,
        method: d.method,
        bankAccountId: d.bankAccountId
      }))
    };
    const { error } = await supabase.rpc('create_profit_share', { payload });
    if (error) throw error;
    await get().fetchProfitShares();
    await get().fetchCashBalances();
    await get().fetchInvestors();
  },

  addBalanceTransfer: async (data) => {
    const payload = {
      fromType: data.fromType,
      fromBankId: data.fromBankId,
      toType: data.toType,
      toBankId: data.toBankId,
      amount: data.amount,
      notes: data.notes
    };
    const { error } = await supabase.rpc('create_balance_transfer', { payload });
    if (error) throw error;
    await get().fetchBalanceTransfers();
    await get().fetchCashBalances();
  },

  updateCashBalance: () => {},
  updateQrisBalance: () => {},
  resetFinanceBalances: () => {}
}));
