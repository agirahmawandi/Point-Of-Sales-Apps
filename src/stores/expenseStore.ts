import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense, ExpenseCategory } from '@/types/expense';

interface ExpenseState {
  categories: ExpenseCategory[];
  expenses: Expense[];
  
  // Category Actions
  addCategory: (category: Omit<ExpenseCategory, 'id' | 'createdAt' | 'totalExpenses'>) => void;
  updateCategory: (id: string, data: Partial<ExpenseCategory>) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => ExpenseCategory | undefined;
  
  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'category'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpense: (id: string) => Expense | undefined;
  resetExpenses: () => void;
}

const DUMMY_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'cat-1',
    name: 'Operasional',
    icon: '⚡',
    description: 'Listrik, Air, Internet',
    totalExpenses: 1200000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Gaji Karyawan',
    icon: '👤',
    description: 'Gaji bulanan dan bonus',
    totalExpenses: 5000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Sewa Tempat',
    icon: '🏠',
    description: 'Sewa ruko',
    totalExpenses: 15000000,
    createdAt: new Date().toISOString(),
  }
];

const DUMMY_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    categoryId: 'cat-1',
    category: DUMMY_CATEGORIES[0],
    description: 'Bayar Listrik Bulan Agustus',
    amount: 1200000,
    date: new Date().toISOString(),
    paymentMethod: 'Transfer Bank',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
  }
];

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      categories: DUMMY_CATEGORIES,
      expenses: DUMMY_EXPENSES,

      addCategory: (category) => set((state) => ({
        categories: [
          ...state.categories,
          {
            ...category,
            id: `cat-${Date.now()}`,
            totalExpenses: 0,
            createdAt: new Date().toISOString(),
          },
        ],
      })),
      
      updateCategory: (id, data) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...data } : c),
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
      })),

      getCategory: (id) => get().categories.find(c => c.id === id),

      addExpense: (expense) => set((state) => {
        const category = state.categories.find(c => c.id === expense.categoryId);
        return {
          expenses: [
            {
              ...expense,
              id: `exp-${Date.now()}`,
              category,
              createdAt: new Date().toISOString(),
            },
            ...state.expenses,
          ],
        };
      }),

      updateExpense: (id, data) => set((state) => {
        return {
          expenses: state.expenses.map(exp => {
            if (exp.id === id) {
              const category = data.categoryId ? state.categories.find(c => c.id === data.categoryId) : exp.category;
              return { ...exp, ...data, category };
            }
            return exp;
          }),
        };
      }),

      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(exp => exp.id !== id),
      })),

      getExpense: (id) => get().expenses.find(exp => exp.id === id),

      resetExpenses: () => set((state) => ({
        expenses: [],
        categories: state.categories.map(c => ({
          ...c,
          totalExpenses: 0,
        }))
      })),
    }),
    {
      name: 'pos-expense-storage',
    }
  )
);
