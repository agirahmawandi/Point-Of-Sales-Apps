import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'totalTransactions' | 'totalSpent'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  recordTransaction: (id: string, amount: number) => void;
  findCustomerByPhoneOrName: (query: string) => Customer | undefined;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],

      addCustomer: (data) => {
        const newCustomer: Customer = {
          ...data,
          id: `CUST-${Date.now()}`,
          createdAt: new Date().toISOString(),
          totalTransactions: 0,
          totalSpent: 0,
        };
        set((state) => ({ customers: [newCustomer, ...state.customers] }));
        return newCustomer;
      },

      updateCustomer: (id, data) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),

      recordTransaction: (id, amount) =>
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
        })),

      findCustomerByPhoneOrName: (query) => {
        const q = query.toLowerCase().trim();
        return get().customers.find(
          (c) =>
            (c.name && c.name.toLowerCase() === q) ||
            (c.phone && c.phone === q)
        );
      },
    }),
    { name: 'pos-customer-storage' }
  )
);
