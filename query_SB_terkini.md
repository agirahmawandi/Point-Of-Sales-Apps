-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'kasir'::text CHECK (role = ANY (ARRAY['admin'::text, 'kasir'::text])),
  avatar text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  store_name text NOT NULL DEFAULT 'Frema Mart'::text,
  address text,
  phone text,
  email text,
  default_tax_percentage numeric DEFAULT 11,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bank_accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bank text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bank_accounts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sku text NOT NULL UNIQUE,
  barcode text,
  name text NOT NULL,
  category_id uuid,
  description text,
  buy_price numeric DEFAULT 0,
  sell_price numeric NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 5,
  unit text DEFAULT 'pcs'::text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  phone text,
  address text,
  platform text DEFAULT 'Offline'::text CHECK (platform = ANY (ARRAY['Offline'::text, 'Shopee'::text, 'Tokopedia'::text, 'TikTok'::text, 'GoFood'::text, 'GrabFood'::text, 'ShopeeFood'::text, 'Lainnya'::text])),
  total_transactions integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  invoice_number text NOT NULL UNIQUE,
  customer_id uuid,
  customer_name text,
  transaction_type text DEFAULT 'offline'::text CHECK (transaction_type = ANY (ARRAY['offline'::text, 'online'::text])),
  marketplace text,
  store_name text,
  order_number text,
  tracking_number text,
  customer_address text,
  subtotal numeric NOT NULL DEFAULT 0,
  discount_percent numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  tax_percent numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  hpp numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  marketplace_fee numeric DEFAULT 0,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['cash'::text, 'qris'::text, 'card'::text, 'tunai'::text, 'kartu'::text, 'piutang'::text, 'marketplace'::text])),
  bank_account_id uuid,
  amount_paid numeric DEFAULT 0,
  change_amount numeric DEFAULT 0,
  payment_timing text DEFAULT 'sekarang'::text CHECK (payment_timing = ANY (ARRAY['sekarang'::text, 'tertunda'::text])),
  payment_status text DEFAULT 'lunas'::text CHECK (payment_status = ANY (ARRAY['lunas'::text, 'tertunda'::text])),
  status text DEFAULT 'sukses'::text CHECK (status = ANY (ARRAY['sukses'::text, 'success'::text, 'pending'::text, 'batal'::text, 'refunded'::text])),
  cashier_id uuid,
  cashier_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  online_details jsonb,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT transactions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id),
  CONSTRAINT transactions_cashier_id_fkey FOREIGN KEY (cashier_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.transaction_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  transaction_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  sku text,
  price numeric NOT NULL,
  buy_price numeric DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  subtotal numeric NOT NULL,
  CONSTRAINT transaction_items_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  total_purchases numeric DEFAULT 0,
  total_debt numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.purchase_orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  po_number text NOT NULL UNIQUE,
  supplier_id uuid,
  total_amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'dikirim'::text, 'diterima_sebagian'::text, 'diterima'::text, 'batal'::text])),
  payment_status text DEFAULT 'utang'::text CHECK (payment_status = ANY (ARRAY['lunas'::text, 'utang'::text, 'sebagian'::text])),
  paid_amount numeric DEFAULT 0,
  due_date date,
  payment_method text,
  bank_account_id uuid,
  notes text,
  payment_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT purchase_orders_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT purchase_orders_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id)
);
CREATE TABLE public.purchase_order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  purchase_order_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  sku text,
  quantity integer NOT NULL DEFAULT 0,
  received_quantity integer NOT NULL DEFAULT 0,
  buy_price numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id),
  CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.expense_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  icon text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT expense_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL,
  bank_account_id uuid,
  attachment text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id),
  CONSTRAINT expenses_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id),
  CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.investors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  phone text,
  notes text,
  total_invested numeric DEFAULT 0,
  total_withdrawn numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT investors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.investor_deposits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  investor_id uuid NOT NULL,
  investor_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  method text DEFAULT 'cash'::text CHECK (method = ANY (ARRAY['cash'::text, 'transfer'::text])),
  bank_account_id uuid,
  notes text,
  date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT investor_deposits_pkey PRIMARY KEY (id),
  CONSTRAINT investor_deposits_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.investors(id),
  CONSTRAINT investor_deposits_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id)
);
CREATE TABLE public.profit_shares (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  period text NOT NULL,
  total_revenue numeric DEFAULT 0,
  total_expense numeric DEFAULT 0,
  net_profit numeric DEFAULT 0,
  share_percentage numeric DEFAULT 0,
  share_amount numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profit_shares_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profit_share_distributions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profit_share_id uuid NOT NULL,
  investor_id uuid,
  investor_name text NOT NULL,
  percentage numeric DEFAULT 0,
  amount numeric DEFAULT 0,
  method text DEFAULT 'cash'::text CHECK (method = ANY (ARRAY['cash'::text, 'transfer'::text])),
  bank_account_id uuid,
  CONSTRAINT profit_share_distributions_pkey PRIMARY KEY (id),
  CONSTRAINT profit_share_distributions_profit_share_id_fkey FOREIGN KEY (profit_share_id) REFERENCES public.profit_shares(id),
  CONSTRAINT profit_share_distributions_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.investors(id),
  CONSTRAINT profit_share_distributions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id)
);
CREATE TABLE public.balance_transfers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  from_type text NOT NULL CHECK (from_type = ANY (ARRAY['cash'::text, 'qris'::text, 'bank'::text])),
  from_bank_id uuid,
  to_type text NOT NULL CHECK (to_type = ANY (ARRAY['cash'::text, 'qris'::text, 'bank'::text])),
  to_bank_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT balance_transfers_pkey PRIMARY KEY (id),
  CONSTRAINT balance_transfers_from_bank_id_fkey FOREIGN KEY (from_bank_id) REFERENCES public.bank_accounts(id),
  CONSTRAINT balance_transfers_to_bank_id_fkey FOREIGN KEY (to_bank_id) REFERENCES public.bank_accounts(id)
);
CREATE TABLE public.cash_balances (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type text NOT NULL UNIQUE CHECK (type = ANY (ARRAY['cash'::text, 'qris'::text])),
  balance numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cash_balances_pkey PRIMARY KEY (id)
);