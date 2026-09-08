import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export interface ProfitShare {
  id: string;
  period: string; // e.g. "September 2026"
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  sharePercentage: number;
  shareAmount: number;
  distributions: {
    investorId: string;
    investorName: string;
    percentage: number;
    amount: number;
    method: 'cash' | 'transfer';
    bankAccountId?: string;
  }[];
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

  // Investor actions
  addInvestor: (data: Omit<Investor, 'id' | 'createdAt' | 'totalInvested' | 'totalWithdrawn'>) => string;
  updateInvestor: (id: string, data: Partial<Investor>) => void;
  deleteInvestor: (id: string) => void;
  addInvestorDeposit: (data: Omit<InvestorDeposit, 'id' | 'date'>) => void;

  // Profit share actions
  addProfitShare: (data: Omit<ProfitShare, 'id' | 'createdAt'>) => void;

  // Balance transfer actions
  addBalanceTransfer: (data: Omit<BalanceTransfer, 'id' | 'date'>) => void;

  // Cash & QRIS balance management
  updateCashBalance: (amount: number) => void;
  updateQrisBalance: (amount: number) => void;
  resetFinanceBalances: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      investors: [],
      investorDeposits: [],
      profitShares: [],
      balanceTransfers: [],
      cashBalance: 0,
      qrisBalance: 0,

      addInvestor: (data) => {
        const id = `INV-${Date.now()}`;
        const newInvestor: Investor = {
          ...data,
          id,
          createdAt: new Date().toISOString(),
          totalInvested: 0,
          totalWithdrawn: 0,
        };
        set((state) => ({ investors: [...state.investors, newInvestor] }));
        return id;
      },

      updateInvestor: (id, data) =>
        set((state) => ({
          investors: state.investors.map((inv) =>
            inv.id === id ? { ...inv, ...data } : inv
          ),
        })),

      deleteInvestor: (id) =>
        set((state) => ({
          investors: state.investors.filter((inv) => inv.id !== id),
        })),

      addInvestorDeposit: (data) => {
        const newDeposit: InvestorDeposit = {
          ...data,
          id: `DEP-${Date.now()}`,
          date: new Date().toISOString(),
        };
        set((state) => ({
          investorDeposits: [newDeposit, ...state.investorDeposits],
          investors: state.investors.map((inv) =>
            inv.id === data.investorId
              ? { ...inv, totalInvested: inv.totalInvested + data.amount }
              : inv
          ),
        }));
      },

      addProfitShare: (data) => {
        const newShare: ProfitShare = {
          ...data,
          id: `PS-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          profitShares: [newShare, ...state.profitShares],
          investors: state.investors.map((inv) => {
            const dist = data.distributions.find((d) => d.investorId === inv.id);
            return dist
              ? { ...inv, totalWithdrawn: inv.totalWithdrawn + dist.amount }
              : inv;
          }),
        }));
      },

      addBalanceTransfer: (data) => {
        const newTransfer: BalanceTransfer = {
          ...data,
          id: `TRF-${Date.now()}`,
          date: new Date().toISOString(),
        };
        set((state) => ({ balanceTransfers: [newTransfer, ...state.balanceTransfers] }));
      },

      updateCashBalance: (amount) =>
        set((state) => ({ cashBalance: state.cashBalance + amount })),

      updateQrisBalance: (amount) =>
        set((state) => ({ qrisBalance: state.qrisBalance + amount })),

      resetFinanceBalances: () =>
        set({ cashBalance: 0, qrisBalance: 0 }),
    }),
    { name: 'pos-finance-storage' }
  )
);
