import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoreProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface TaxSettings {
  defaultTaxPercentage: number;
}

export interface BankAccount {
  id: string;
  bank: string;
  accountNumber: string;
  accountName: string;
}

interface SettingsState {
  storeProfile: StoreProfile;
  taxSettings: TaxSettings;
  bankAccounts: BankAccount[];
  
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;
  updateTaxSettings: (settings: Partial<TaxSettings>) => void;
  
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      storeProfile: {
        name: 'Frema Mart',
        address: 'Jl. Merdeka No. 123, Jakarta',
        phone: '081234567890',
        email: 'info@fremamart.id',
      },
      taxSettings: {
        defaultTaxPercentage: 11,
      },
      bankAccounts: [
        { id: 'bca-1', bank: 'BCA', accountNumber: '123-456-7890', accountName: 'Frema Mart Store' },
        { id: 'mandiri-1', bank: 'Mandiri', accountNumber: '900-123-4567', accountName: 'Frema Mart Store' },
      ],
      
      updateStoreProfile: (profile) => set((state) => ({
        storeProfile: { ...state.storeProfile, ...profile }
      })),
      
      updateTaxSettings: (settings) => set((state) => ({
        taxSettings: { ...state.taxSettings, ...settings }
      })),
      
      addBankAccount: (account) => set((state) => ({
        bankAccounts: [
          ...state.bankAccounts,
          { ...account, id: `bank-${Date.now()}` }
        ]
      })),
      
      updateBankAccount: (id, account) => set((state) => ({
        bankAccounts: state.bankAccounts.map(a => 
          a.id === id ? { ...a, ...account } : a
        )
      })),
      
      deleteBankAccount: (id) => set((state) => ({
        bankAccounts: state.bankAccounts.filter(a => a.id !== id)
      })),
    }),
    {
      name: 'pos-settings-storage',
    }
  )
);
