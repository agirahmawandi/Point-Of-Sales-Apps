export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  totalExpenses: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  category?: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  bankAccountId?: string;
  attachment?: string;
  createdBy: string;
  createdAt: string;
}
