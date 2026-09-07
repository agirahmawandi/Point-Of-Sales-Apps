import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => string;
  getTransaction: (id: string) => Transaction | undefined;
  updateTransaction: (id: string, updatedFields: Partial<Transaction>) => void;
  updateTransactionPaymentStatus: (id: string, paymentStatus: 'lunas' | 'tertunda', status?: 'success' | 'pending') => void;
  resetTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      
      addTransaction: (transactionData) => {
        const id = `TRX-${Date.now().toString().slice(-6)}`;
        const newTransaction: Transaction = {
          ...transactionData,
          id,
          date: new Date(),
        };
        
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
        
        return id;
      },
      
      getTransaction: (id) => {
        return get().transactions.find(t => t.id === id);
      },

      updateTransaction: (id, updatedFields) => {
        set((state) => ({
          transactions: state.transactions.map(t => {
            if (t.id === id) {
              return {
                ...t,
                ...updatedFields,
                updatedAt: new Date().toISOString()
              };
            }
            return t;
          })
        }));
      },

      updateTransactionPaymentStatus: (id, paymentStatus, status) => {
        set((state) => ({
          transactions: state.transactions.map(t => {
            if (t.id === id) {
              return {
                ...t,
                paymentStatus,
                paymentTiming: paymentStatus === 'lunas' ? 'sekarang' : 'tertunda',
                status: status || (paymentStatus === 'lunas' ? 'success' : 'pending'),
                amountPaid: paymentStatus === 'lunas' ? (t.amountPaid || t.total) : t.amountPaid
              };
            }
            return t;
          })
        }));
      },
      
      resetTransactions: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: 'pos-transaction-storage',
      // Need to handle Date serialization/deserialization for persist
      partialize: (state) => state,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.transactions = state.transactions.map(t => ({
            ...t,
            date: new Date(t.date || t.createdAt || Date.now())
          }));
        }
      }
    }
  )
);
