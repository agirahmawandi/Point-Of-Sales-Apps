import { create } from 'zustand';
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
  
  fetchStoreSettings: () => Promise<void>;
  updateStoreProfile: (profile: Partial<StoreProfile>) => Promise<void>;
  updateTaxSettings: (settings: Partial<TaxSettings>) => Promise<void>;
  
  fetchBankAccounts: () => Promise<void>;
  addBankAccount: (account: Omit<BankAccount, 'id'>) => Promise<void>;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  
  updateBankBalance: (id: string, amount: number) => void;
  resetBankBalances: () => void;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  storeProfile: {
    name: 'Frema Mart',
    address: '',
    phone: '',
    email: '',
  },
  taxSettings: {
    defaultTaxPercentage: 11,
  },
  bankAccounts: [],
  isLoading: false,

  fetchStoreSettings: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('store_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      
      if (data) {
        set({
          storeProfile: {
            name: data.store_name || 'Frema Mart',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
          },
          taxSettings: {
            defaultTaxPercentage: Number(data.default_tax_percentage) || 0,
          }
        });
      } else {
        // Create initial settings if empty
        const { data: newData, error: insertError } = await supabase.from('store_settings').insert({
          store_name: 'Frema Mart',
          default_tax_percentage: 11
        }).select().single();
        
        if (!insertError && newData) {
          set({
            storeProfile: {
              name: newData.store_name,
              address: newData.address || '',
              phone: newData.phone || '',
              email: newData.email || '',
            },
            taxSettings: {
              defaultTaxPercentage: Number(newData.default_tax_percentage),
            }
          });
        }
      }
    } catch (err) {
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateStoreProfile: async (profile) => {
    try {
      // Get the existing row ID
      const { data: existingData } = await supabase.from('store_settings').select('id').limit(1).maybeSingle();
      
      const payload: any = {};
      if (profile.name !== undefined) payload.store_name = profile.name;
      if (profile.address !== undefined) payload.address = profile.address;
      if (profile.phone !== undefined) payload.phone = profile.phone;
      if (profile.email !== undefined) payload.email = profile.email;

      if (existingData) {
        const { error } = await supabase.from('store_settings').update(payload).eq('id', existingData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('store_settings').insert(payload);
        if (error) throw error;
      }
      
      // Optimistic update
      set((state) => ({
        storeProfile: { ...state.storeProfile, ...profile }
      }));
    } catch (err) {
      throw err;
    }
  },
  
  updateTaxSettings: async (settings) => {
    try {
      const { data: existingData } = await supabase.from('store_settings').select('id').limit(1).maybeSingle();
      
      const payload: any = {};
      if (settings.defaultTaxPercentage !== undefined) payload.default_tax_percentage = settings.defaultTaxPercentage;

      if (existingData) {
        const { error } = await supabase.from('store_settings').update(payload).eq('id', existingData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('store_settings').insert(payload);
        if (error) throw error;
      }
      
      // Optimistic update
      set((state) => ({
        taxSettings: { ...state.taxSettings, ...settings }
      }));
    } catch (err) {
      throw err;
    }
  },

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
    }
  },
  
  deleteBankAccount: async (id) => {
    try {
      const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
      if (error) throw error;
      await get().fetchBankAccounts();
    } catch (err) {
    }
  },
  
  updateBankBalance: (id, amount) => {
  },
  
  resetBankBalances: () => {
    set((state) => ({
      bankAccounts: state.bankAccounts.map((acc) => ({ ...acc, balance: 0 })),
    }));
  }
}));
