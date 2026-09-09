-- file: update_transactions_table.sql
-- Kopi dan jalankan script ini di Supabase Studio > SQL Editor untuk memastikan semua kolom tersedia

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS online_details JSONB,
ADD COLUMN IF NOT EXISTS marketplace_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS hpp NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_timing VARCHAR(50) DEFAULT 'sekarang',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'lunas',
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'offline';
