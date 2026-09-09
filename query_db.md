# Query SQL Awal - Setup Database Supabase

Berikut adalah query SQL awal (migration) yang digunakan untuk membangun skema tabel database di Supabase pada saat awal proyek (Phase 0).

```sql
-- ============================================================
-- FREMA-POS: Supabase Database Migration
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (Users / Karyawan)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'kasir' CHECK (role IN ('admin', 'kasir')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. STORE SETTINGS (Pengaturan Toko)
-- ============================================================
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL DEFAULT 'Frema Mart',
  address TEXT,
  phone TEXT,
  email TEXT,
  default_tax_percentage NUMERIC(5,2) DEFAULT 11,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO store_settings (store_name, address, phone, email)
VALUES ('Frema Mart', 'Jl. Merdeka No. 123, Jakarta', '081234567890', 'info@fremamart.id')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. BANK ACCOUNTS (Rekening Bank)
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  balance NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. CATEGORIES (Kategori Produk)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PRODUCTS (Produk)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  buy_price NUMERIC(15,2) DEFAULT 0,
  sell_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  unit TEXT DEFAULT 'pcs',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. CUSTOMERS (Pelanggan)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  platform TEXT DEFAULT 'Offline' CHECK (platform IN (
    'Offline','Shopee','Tokopedia','TikTok','GoFood','GrabFood','ShopeeFood','Lainnya'
  )),
  total_transactions INTEGER DEFAULT 0,
  total_spent NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TRANSACTIONS (Transaksi Penjualan)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  transaction_type TEXT DEFAULT 'offline' CHECK (transaction_type IN ('offline', 'online')),
  -- Online order details
  marketplace TEXT,
  store_name TEXT,
  order_number TEXT,
  tracking_number TEXT,
  customer_address TEXT,
  -- Amounts
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  tax_percent NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  total NUMERIC(15,2) NOT NULL DEFAULT 0,
  hpp NUMERIC(15,2) DEFAULT 0,
  profit NUMERIC(15,2) DEFAULT 0,
  marketplace_fee NUMERIC(15,2) DEFAULT 0,
  -- Payment
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','qris','card','tunai','kartu','piutang','marketplace')),
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  change_amount NUMERIC(15,2) DEFAULT 0,
  payment_timing TEXT DEFAULT 'sekarang' CHECK (payment_timing IN ('sekarang','tertunda')),
  payment_status TEXT DEFAULT 'lunas' CHECK (payment_status IN ('lunas','tertunda')),
  -- Status & Meta
  status TEXT DEFAULT 'sukses' CHECK (status IN ('sukses','success','pending','batal','refunded')),
  cashier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cashier_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. TRANSACTION ITEMS (Item per Transaksi)
-- ============================================================
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  price NUMERIC(15,2) NOT NULL,
  buy_price NUMERIC(15,2) DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC(15,2) NOT NULL
);

-- ============================================================
-- 9. SUPPLIERS (Supplier / Pemasok)
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  total_purchases NUMERIC(15,2) DEFAULT 0,
  total_debt NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. PURCHASE ORDERS (Pembelian / PO)
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','dikirim','diterima_sebagian','diterima','batal')),
  payment_status TEXT DEFAULT 'utang' CHECK (payment_status IN ('lunas','utang','sebagian')),
  paid_amount NUMERIC(15,2) DEFAULT 0,
  due_date DATE,
  payment_method TEXT,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  notes TEXT,
  payment_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. PURCHASE ORDER ITEMS (Item per PO)
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  received_quantity INTEGER NOT NULL DEFAULT 0,
  buy_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0
);

-- ============================================================
-- 12. EXPENSE CATEGORIES (Kategori Pengeluaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. EXPENSES (Pengeluaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  attachment TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. INVESTORS (Investor)
-- ============================================================
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  total_invested NUMERIC(15,2) DEFAULT 0,
  total_withdrawn NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. INVESTOR DEPOSITS (Setoran Modal Investor)
-- ============================================================
CREATE TABLE IF NOT EXISTS investor_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  method TEXT DEFAULT 'cash' CHECK (method IN ('cash','transfer')),
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  notes TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. PROFIT SHARES (Bagi Hasil)
-- ============================================================
CREATE TABLE IF NOT EXISTS profit_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period TEXT NOT NULL,
  total_revenue NUMERIC(15,2) DEFAULT 0,
  total_expense NUMERIC(15,2) DEFAULT 0,
  net_profit NUMERIC(15,2) DEFAULT 0,
  share_percentage NUMERIC(5,2) DEFAULT 0,
  share_amount NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 17. PROFIT SHARE DISTRIBUTIONS (Distribusi Bagi Hasil)
-- ============================================================
CREATE TABLE IF NOT EXISTS profit_share_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profit_share_id UUID NOT NULL REFERENCES profit_shares(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
  investor_name TEXT NOT NULL,
  percentage NUMERIC(5,2) DEFAULT 0,
  amount NUMERIC(15,2) DEFAULT 0,
  method TEXT DEFAULT 'cash' CHECK (method IN ('cash','transfer')),
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL
);

-- ============================================================
-- 18. BALANCE TRANSFERS (Transfer Saldo Antar Kas)
-- ============================================================
CREATE TABLE IF NOT EXISTS balance_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_type TEXT NOT NULL CHECK (from_type IN ('cash','qris','bank')),
  from_bank_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  to_type TEXT NOT NULL CHECK (to_type IN ('cash','qris','bank')),
  to_bank_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 19. CASH BALANCES (Saldo Kas & QRIS)
-- ============================================================
CREATE TABLE IF NOT EXISTS cash_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT UNIQUE NOT NULL CHECK (type IN ('cash','qris')),
  balance NUMERIC(15,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default balances
INSERT INTO cash_balances (type, balance) VALUES ('cash', 0), ('qris', 0)
ON CONFLICT (type) DO NOTHING;

-- ============================================================
-- INDEXES (Untuk Performa Query)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cashier ON transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_investor_deposits_investor ON investor_deposits(investor_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_share_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Hanya user yang terautentikasi yang bisa akses data
CREATE POLICY "Authenticated users can read all" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage store_settings" ON store_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage bank_accounts" ON bank_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage categories" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage customers" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage transactions" ON transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage transaction_items" ON transaction_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage suppliers" ON suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchase_orders" ON purchase_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchase_order_items" ON purchase_order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage expense_categories" ON expense_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage expenses" ON expenses FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage investors" ON investors FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage investor_deposits" ON investor_deposits FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage profit_shares" ON profit_shares FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage profit_share_distributions" ON profit_share_distributions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage balance_transfers" ON balance_transfers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage cash_balances" ON cash_balances FOR ALL TO authenticated USING (true);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SELESAI! Database schema Frema-pos siap digunakan.
-- ============================================================
```
