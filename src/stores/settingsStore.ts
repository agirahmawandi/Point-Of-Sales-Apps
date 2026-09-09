import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

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
  balance?: number;
}

interface SettingsState {
  storeProfile: StoreProfile;
  taxSettings: TaxSettings;
  bankAccounts: BankAccount[];
  isLoading: boolean;
  
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;
  updateTaxSettings: (settings: Partial<TaxSettings>) => void;
  
  fetchBankAccounts: () => Promise<void>;
  addBankAccount: (account: Omit<BankAccount, 'id'>) => Promise<void>;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      storeProfile: {
        name: 'Frema Mart',
        address: 'Jl. Merdeka No. 123, Jakarta',
        phone: '081234567890',
        email: 'info@fremamart.id',
      },
      taxSettings: {
        defaultTaxPercentage: 11,
      },
      bankAccounts: [],
      isLoading: false,
      
      updateStoreProfile: (profile) => set((state) => ({
        storeProfile: { ...state.storeProfile, ...profile }
      })),
      
      updateTaxSettings: (settings) => set((state) => ({
        taxSettings: { ...state.taxSettings, ...settings }
      })),

      fetchBankAccounts: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.from('bank_accounts').select('*').order('bank');
          if (error) throw error;
          
          const accounts: BankAccount[] = data.map((d: any) => ({
            id: d.id,
            bank: d.bank,
            accountNumber: d.account_number,
            accountName: d.account_name,
            balance: d.balance
          }));
          
          set({ bankAccounts: accounts });
        } catch (err) {
          console.error('Failed to fetch bank accounts', err);
        } finally {
          set({ isLoading: false });
        }
      },
      
      addBankAccount: async (account) => {
        try {
          const { error } = await supabase.from('bank_accounts').insert({
            bank: account.bank,
            account_number: account.accountNumber,
            account_name: account.accountName,
            balance: account.balance || 0
          });
          if (error) throw error;
          await get().fetchBankAccounts();
        } catch (err) {
          console.error('Failed to add bank account', err);
        }
      },
      
      updateBankAccount: async (id, account) => {
        try {
          const payload: any = {};
          if (account.bank) payload.bank = account.bank;
          if (account.accountNumber) payload.account_number = account.accountNumber;
          if (account.accountName) payload.account_name = account.accountName;
          
          const { error } = await supabase.from('bank_accounts').update(payload).eq('id', id);
          if (error) throw error;
          await get().fetchBankAccounts();
        } catch (err) {
          console.error('Failed to update bank account', err);
        }
      },
      
      deleteBankAccount: async (id) => {
        try {
          const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
          if (error) throw error;
          await get().fetchBankAccounts();
        } catch (err) {
          console.error('Failed to delete bank account', err);
        }
      },
    }),
    {
      name: 'pos-settings-storage',
      partialize: (state) => ({
        storeProfile: state.storeProfile,
        taxSettings: state.taxSettings,
        // We do NOT persist bankAccounts anymore, since it comes from DB
      }),
    }
  )
);
