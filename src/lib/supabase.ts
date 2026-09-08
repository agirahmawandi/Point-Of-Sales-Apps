import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: ProfileInsert; Update: ProfileUpdate };
      store_settings: { Row: StoreSettingsRow; Insert: StoreSettingsInsert; Update: StoreSettingsUpdate };
      bank_accounts: { Row: BankAccountRow; Insert: BankAccountInsert; Update: BankAccountUpdate };
      categories: { Row: CategoryRow; Insert: CategoryInsert; Update: CategoryUpdate };
      products: { Row: ProductRow; Insert: ProductInsert; Update: ProductUpdate };
      customers: { Row: CustomerRow; Insert: CustomerInsert; Update: CustomerUpdate };
      transactions: { Row: TransactionRow; Insert: TransactionInsert; Update: TransactionUpdate };
      transaction_items: { Row: TransactionItemRow; Insert: TransactionItemInsert; Update: TransactionItemUpdate };
      suppliers: { Row: SupplierRow; Insert: SupplierInsert; Update: SupplierUpdate };
      purchase_orders: { Row: PurchaseOrderRow; Insert: PurchaseOrderInsert; Update: PurchaseOrderUpdate };
      purchase_order_items: { Row: PurchaseOrderItemRow; Insert: PurchaseOrderItemInsert; Update: PurchaseOrderItemUpdate };
      expense_categories: { Row: ExpenseCategoryRow; Insert: ExpenseCategoryInsert; Update: ExpenseCategoryUpdate };
      expenses: { Row: ExpenseRow; Insert: ExpenseInsert; Update: ExpenseUpdate };
      investors: { Row: InvestorRow; Insert: InvestorInsert; Update: InvestorUpdate };
      investor_deposits: { Row: InvestorDepositRow; Insert: InvestorDepositInsert; Update: InvestorDepositUpdate };
      profit_shares: { Row: ProfitShareRow; Insert: ProfitShareInsert; Update: ProfitShareUpdate };
      profit_share_distributions: { Row: ProfitShareDistributionRow; Insert: ProfitShareDistributionInsert; Update: ProfitShareDistributionUpdate };
      balance_transfers: { Row: BalanceTransferRow; Insert: BalanceTransferInsert; Update: BalanceTransferUpdate };
      cash_balances: { Row: CashBalanceRow; Insert: CashBalanceInsert; Update: CashBalanceUpdate };
    };
  };
};

// ── ROW TYPES ──────────────────────────────────────────────
export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'kasir';
  avatar: string | null;
  created_at: string;
  updated_at: string;
}
export type ProfileInsert = Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<ProfileInsert>;

export interface StoreSettingsRow {
  id: string;
  store_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  default_tax_percentage: number;
  updated_at: string;
}
export type StoreSettingsInsert = Omit<StoreSettingsRow, 'id' | 'updated_at'>;
export type StoreSettingsUpdate = Partial<StoreSettingsInsert>;

export interface BankAccountRow {
  id: string;
  bank: string;
  account_number: string;
  account_name: string;
  balance: number;
  created_at: string;
  updated_at: string;
}
export type BankAccountInsert = Omit<BankAccountRow, 'id' | 'created_at' | 'updated_at'>;
export type BankAccountUpdate = Partial<BankAccountInsert>;

export interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
export type CategoryInsert = Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

export interface ProductRow {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  category_id: string | null;
  description: string | null;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  unit: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type ProductInsert = Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;

export interface CustomerRow {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  platform: string;
  total_transactions: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}
export type CustomerInsert = Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'>;
export type CustomerUpdate = Partial<CustomerInsert>;

export interface TransactionRow {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  customer_name: string | null;
  transaction_type: 'offline' | 'online';
  marketplace: string | null;
  store_name: string | null;
  order_number: string | null;
  tracking_number: string | null;
  customer_address: string | null;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  total: number;
  hpp: number;
  profit: number;
  marketplace_fee: number;
  payment_method: string;
  bank_account_id: string | null;
  amount_paid: number;
  change_amount: number;
  payment_timing: string;
  payment_status: string;
  status: string;
  cashier_id: string | null;
  cashier_name: string;
  created_at: string;
  updated_at: string;
}
export type TransactionInsert = Omit<TransactionRow, 'id' | 'created_at' | 'updated_at'>;
export type TransactionUpdate = Partial<TransactionInsert>;

export interface TransactionItemRow {
  id: string;
  transaction_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  price: number;
  buy_price: number;
  quantity: number;
  subtotal: number;
}
export type TransactionItemInsert = Omit<TransactionItemRow, 'id'>;
export type TransactionItemUpdate = Partial<TransactionItemInsert>;

export interface SupplierRow {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  total_purchases: number;
  total_debt: number;
  created_at: string;
  updated_at: string;
}
export type SupplierInsert = Omit<SupplierRow, 'id' | 'created_at' | 'updated_at'>;
export type SupplierUpdate = Partial<SupplierInsert>;

export interface PurchaseOrderRow {
  id: string;
  po_number: string;
  supplier_id: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
  paid_amount: number;
  due_date: string | null;
  payment_method: string | null;
  bank_account_id: string | null;
  notes: string | null;
  payment_notes: string | null;
  created_at: string;
  updated_at: string;
}
export type PurchaseOrderInsert = Omit<PurchaseOrderRow, 'id' | 'created_at' | 'updated_at'>;
export type PurchaseOrderUpdate = Partial<PurchaseOrderInsert>;

export interface PurchaseOrderItemRow {
  id: string;
  purchase_order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  received_quantity: number;
  buy_price: number;
  subtotal: number;
}
export type PurchaseOrderItemInsert = Omit<PurchaseOrderItemRow, 'id'>;
export type PurchaseOrderItemUpdate = Partial<PurchaseOrderItemInsert>;

export interface ExpenseCategoryRow {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  created_at: string;
}
export type ExpenseCategoryInsert = Omit<ExpenseCategoryRow, 'id' | 'created_at'>;
export type ExpenseCategoryUpdate = Partial<ExpenseCategoryInsert>;

export interface ExpenseRow {
  id: string;
  category_id: string | null;
  description: string;
  amount: number;
  date: string;
  payment_method: string;
  bank_account_id: string | null;
  attachment: string | null;
  created_by: string | null;
  created_at: string;
}
export type ExpenseInsert = Omit<ExpenseRow, 'id' | 'created_at'>;
export type ExpenseUpdate = Partial<ExpenseInsert>;

export interface InvestorRow {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  total_invested: number;
  total_withdrawn: number;
  created_at: string;
  updated_at: string;
}
export type InvestorInsert = Omit<InvestorRow, 'id' | 'created_at' | 'updated_at'>;
export type InvestorUpdate = Partial<InvestorInsert>;

export interface InvestorDepositRow {
  id: string;
  investor_id: string;
  investor_name: string;
  amount: number;
  method: 'cash' | 'transfer';
  bank_account_id: string | null;
  notes: string | null;
  date: string;
  created_at: string;
}
export type InvestorDepositInsert = Omit<InvestorDepositRow, 'id' | 'created_at'>;
export type InvestorDepositUpdate = Partial<InvestorDepositInsert>;

export interface ProfitShareRow {
  id: string;
  period: string;
  total_revenue: number;
  total_expense: number;
  net_profit: number;
  share_percentage: number;
  share_amount: number;
  notes: string | null;
  created_at: string;
}
export type ProfitShareInsert = Omit<ProfitShareRow, 'id' | 'created_at'>;
export type ProfitShareUpdate = Partial<ProfitShareInsert>;

export interface ProfitShareDistributionRow {
  id: string;
  profit_share_id: string;
  investor_id: string | null;
  investor_name: string;
  percentage: number;
  amount: number;
  method: 'cash' | 'transfer';
  bank_account_id: string | null;
}
export type ProfitShareDistributionInsert = Omit<ProfitShareDistributionRow, 'id'>;
export type ProfitShareDistributionUpdate = Partial<ProfitShareDistributionInsert>;

export interface BalanceTransferRow {
  id: string;
  from_type: 'cash' | 'qris' | 'bank';
  from_bank_id: string | null;
  to_type: 'cash' | 'qris' | 'bank';
  to_bank_id: string | null;
  amount: number;
  notes: string | null;
  date: string;
  created_at: string;
}
export type BalanceTransferInsert = Omit<BalanceTransferRow, 'id' | 'created_at'>;
export type BalanceTransferUpdate = Partial<BalanceTransferInsert>;

export interface CashBalanceRow {
  id: string;
  type: 'cash' | 'qris';
  balance: number;
  updated_at: string;
}
export type CashBalanceInsert = Omit<CashBalanceRow, 'id' | 'updated_at'>;
export type CashBalanceUpdate = Partial<CashBalanceInsert>;
