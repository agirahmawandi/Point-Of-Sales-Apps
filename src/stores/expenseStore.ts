import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Expense, ExpenseCategory } from '@/types/expense';

interface ExpenseState {
  categories: ExpenseCategory[];
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  
  // Category Actions
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<ExpenseCategory, 'id' | 'createdAt' | 'totalExpenses'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<ExpenseCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategory: (id: string) => ExpenseCategory | undefined;
  
  // Expense Actions
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'category'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpense: (id: string) => Expense | undefined;
  resetExpenses: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  categories: [],
  expenses: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      const categories: ExpenseCategory[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon || undefined,
        description: item.description || undefined,
        totalExpenses: 0, // In a real scenario, this might need an aggregate query or be calculated dynamically
        createdAt: item.created_at,
      }));
      
      set({ categories });
    } catch (err: any) {
      console.error('Error fetching expense categories:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert([{
          name: category.name,
          icon: category.icon || null,
          description: category.description || null,
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      const newCategory: ExpenseCategory = {
        id: data.id,
        name: data.name,
        icon: data.icon || undefined,
        description: data.description || undefined,
        totalExpenses: 0,
        createdAt: data.created_at,
      };
      
      set((state) => ({ categories: [...state.categories, newCategory] }));
    } catch (err: any) {
      console.error('Error adding expense category:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatePayload: any = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.icon !== undefined) updatePayload.icon = data.icon || null;
      if (data.description !== undefined) updatePayload.description = data.description || null;

      const { error } = await supabase
        .from('expense_categories')
        .update(updatePayload)
        .eq('id', id);
        
      if (error) throw error;
      
      await get().fetchCategories();
    } catch (err: any) {
      console.error('Error updating expense category:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
      }));
    } catch (err: any) {
      console.error('Error deleting expense category:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getCategory: (id) => get().categories.find(c => c.id === id),

  fetchExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_categories(id, name, icon, description)
        `)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      const expenses: Expense[] = (data || []).map(item => ({
        id: item.id,
        categoryId: item.category_id || '',
        category: item.expense_categories ? {
          id: (item.expense_categories as any).id,
          name: (item.expense_categories as any).name,
          icon: (item.expense_categories as any).icon || undefined,
          description: (item.expense_categories as any).description || undefined,
          totalExpenses: 0,
          createdAt: '',
        } : undefined,
        description: item.description,
        amount: item.amount,
        date: item.date,
        paymentMethod: item.payment_method,
        bankAccountId: item.bank_account_id || undefined,
        attachment: item.attachment || undefined,
        createdBy: item.created_by || '',
        createdAt: item.created_at,
      }));
      
      set({ expenses });
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addExpense: async (expense) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.rpc('create_expense', {
        payload: {
          category_id: expense.categoryId,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          payment_method: expense.paymentMethod,
          bank_account_id: expense.bankAccountId,
          attachment: expense.attachment,
          created_by: expense.createdBy,
        }
      });
        
      if (error) throw error;
      if (!data?.success) throw new Error('RPC returned failure');
      
      await get().fetchExpenses();
    } catch (err: any) {
      console.error('Error adding expense:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        expenses: state.expenses.filter(exp => exp.id !== id),
      }));
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getExpense: (id) => get().expenses.find(exp => exp.id === id),

  resetExpenses: () => {
    console.warn('resetExpenses is a dummy function now');
  },
}));

