# Log Catatan Perbaikan Query Database

Berikut adalah kumpulan log query SQL yang telah diedit dan dieksekusi selama proses perbaikan fitur Backend & Kasir:

```sql
-- INSERT INTO profiles (id, name, email, role)
-- SELECT 
--   id,
--   COALESCE(raw_user_meta_data->>'name', 'Admin Utama'),
--   email,
--   'admin'
-- FROM auth.users
-- WHERE email = 'admin@fremamart.id'
-- ON CONFLICT (id) DO UPDATE SET
--   name = EXCLUDED.name,
--   role = EXCLUDED.role;


-- SELECT u.email, p.name, p.role
-- FROM auth.users u
-- JOIN profiles p ON u.id = p.id
-- WHERE u.email = 'admin@fremamart.id';

-- UPDATE profiles 
-- SET name = 'Admin Utama', role = 'admin'
-- WHERE email = 'admin@fremamart.id';

-- -- Verifikasi
-- SELECT * FROM profiles WHERE email = 'admin@fremamart.id';

-- Set role & name di user metadata (bypass RLS)
-- -- Set role & name di user metadata (bypass RLS)
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_build_object('name', 'Admin Utama', 'role', 'admin')
-- WHERE email = 'admin@fremamart.id';



-- Drop policies profiles yang lama
-- DROP POLICY IF EXISTS "Authenticated users can read all" ON profiles;

-- -- Ganti dengan policy yang kompatibel dengan publishable key baru
-- CREATE POLICY "Enable read for users with session" ON profiles
-- FOR SELECT USING (auth.uid() IS NOT NULL);

-- CREATE POLICY "Enable insert for users with session" ON profiles
-- FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- CREATE POLICY "Enable update own profile" ON profiles
-- FOR UPDATE USING (auth.uid() = id);

-- -- Verifikasi policies
-- SELECT tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'profiles';


-- -- Berikan permission akses ke semua tabel untuk authenticated users
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- -- Verifikasi (cek privileges tabel profiles)
-- SELECT grantee, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_name = 'profiles';


-- file: supabase_checkout_rpc.sql
-- Kopi dan jalankan script ini di Supabase Studio > SQL Editor

-- CREATE OR REPLACE FUNCTION process_checkout(payload JSONB)
-- RETURNS JSONB
-- LANGUAGE plpgsql
-- SECURITY DEFINER -- Supaya fungsi bisa dijalankan dengan previlege yang cukup
-- AS $$
-- DECLARE
--     v_transaction_id UUID;
--     v_item JSONB;
--     v_customer_id UUID;
--     v_total NUMERIC;
-- BEGIN
--     -- 1. Insert header transaksi
--     INSERT INTO transactions (
--         invoice_number,
--         customer_id,
--         customer_name,
--         date,
--         transaction_type,
--         online_details,
--         subtotal,
--         discount,
--         tax,
--         marketplace_fee,
--         total,
--         hpp,
--         profit,
--         payment_method,
--         bank_account_id,
--         amount_paid,
--         change,
--         cashier_id,
--         cashier_name,
--         status,
--         payment_timing,
--         payment_status
--     ) VALUES (
--         payload->>'invoice_number',
--         NULLIF(payload->>'customer_id', '')::UUID,
--         payload->>'customer_name',
--         COALESCE((payload->>'date')::TIMESTAMP, NOW()),
--         payload->>'transaction_type',
--         payload->'online_details',
--         (payload->>'subtotal')::NUMERIC,
--         (payload->>'discount')::NUMERIC,
--         (payload->>'tax')::NUMERIC,
--         (payload->>'marketplace_fee')::NUMERIC,
--         (payload->>'total')::NUMERIC,
--         (payload->>'hpp')::NUMERIC,
--         (payload->>'profit')::NUMERIC,
--         payload->>'payment_method',
--         NULLIF(payload->>'bank_account_id', '')::UUID,
--         (payload->>'amount_paid')::NUMERIC,
--         (payload->>'change')::NUMERIC,
--         NULLIF(payload->>'cashier_id', '')::UUID,
--         payload->>'cashier_name',
--         payload->>'status',
--         payload->>'payment_timing',
--         payload->>'payment_status'
--     ) RETURNING id INTO v_transaction_id;

--     -- 2. Insert items dan kurangi stok
--     FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
--     LOOP
--         -- Insert ke transaction_items
--         INSERT INTO transaction_items (
--             transaction_id,
--             product_id,
--             product_name,
--             sku,
--             price,
--             buy_price,
--             quantity,
--             subtotal
--         ) VALUES (
--             v_transaction_id,
--             (v_item->>'productId')::UUID,
--             v_item->>'name',
--             v_item->>'sku',
--             (v_item->>'price')::NUMERIC,
--             (v_item->>'buyPrice')::NUMERIC,
--             (v_item->>'quantity')::INTEGER,
--             (v_item->>'subtotal')::NUMERIC
--         );

--         -- Kurangi stok produk
--         UPDATE products 
--         SET stock = stock - (v_item->>'quantity')::INTEGER,
--             updated_at = NOW()
--         WHERE id = (v_item->>'productId')::UUID;
--     END LOOP;

--     -- 3. Update statistik customer (jika ada)
--     v_customer_id := NULLIF(payload->>'customer_id', '')::UUID;
--     v_total := (payload->>'total')::NUMERIC;
    
--     IF v_customer_id IS NOT NULL THEN
--         UPDATE customers
--         SET total_transactions = COALESCE(total_transactions, 0) + 1,
--             total_spent = COALESCE(total_spent, 0) + v_total,
--             updated_at = NOW()
--         WHERE id = v_customer_id;
--     END IF;

--     -- (Opsional/Bisa ditambahkan kemudian jika tabel cash_balances & bank_accounts sudah siap)
--     -- Jika menggunakan cash_balances, lakukan update di sini...

--     RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id);
-- EXCEPTION
--     WHEN OTHERS THEN
--         RAISE EXCEPTION 'Checkout failed: %', SQLERRM;
-- END;
-- $$;


-- file: supabase_checkout_rpc.sql
-- Kopi dan jalankan script ini di Supabase Studio > SQL Editor

-- file: supabase_checkout_rpc.sql
-- Kopi dan jalankan script ini di Supabase Studio > SQL Editor

-- CREATE OR REPLACE FUNCTION process_checkout(payload JSONB)
-- RETURNS JSONB
-- LANGUAGE plpgsql
-- SECURITY DEFINER -- Supaya fungsi bisa dijalankan dengan previlege yang cukup
-- AS $$
-- DECLARE
--     v_transaction_id UUID;
--     v_item JSONB;
--     v_customer_id UUID;
--     v_total NUMERIC;
-- BEGIN
--     -- 1. Insert header transaksi
--     INSERT INTO transactions (
--         invoice_number,
--         customer_id,
--         customer_name,
--         transaction_type,
--         online_details,
--         subtotal,
--         discount,
--         tax,
--         marketplace_fee,
--         total,
--         hpp,
--         profit,
--         payment_method,
--         bank_account_id,
--         amount_paid,
--         change,
--         cashier_id,
--         cashier_name,
--         status,
--         payment_timing,
--         payment_status
--     ) VALUES (
--         payload->>'invoice_number',
--         NULLIF(payload->>'customer_id', '')::UUID,
--         payload->>'customer_name',
--         payload->>'transaction_type',
--         payload->'online_details',
--         (payload->>'subtotal')::NUMERIC,
--         (payload->>'discount')::NUMERIC,
--         (payload->>'tax')::NUMERIC,
--         (payload->>'marketplace_fee')::NUMERIC,
--         (payload->>'total')::NUMERIC,
--         (payload->>'hpp')::NUMERIC,
--         (payload->>'profit')::NUMERIC,
--         payload->>'payment_method',
--         NULLIF(payload->>'bank_account_id', '')::UUID,
--         (payload->>'amount_paid')::NUMERIC,
--         (payload->>'change')::NUMERIC,
--         NULLIF(payload->>'cashier_id', '')::UUID,
--         payload->>'cashier_name',
--         payload->>'status',
--         payload->>'payment_timing',
--         payload->>'payment_status'
--     ) RETURNING id INTO v_transaction_id;

--     -- 2. Insert items dan kurangi stok
--     FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
--     LOOP
--         -- Insert ke transaction_items
--         INSERT INTO transaction_items (
--             transaction_id,
--             product_id,
--             product_name,
--             sku,
--             price,
--             buy_price,
--             quantity,
--             subtotal
--         ) VALUES (
--             v_transaction_id,
--             (v_item->>'productId')::UUID,
--             v_item->>'name',
--             v_item->>'sku',
--             (v_item->>'price')::NUMERIC,
--             (v_item->>'buyPrice')::NUMERIC,
--             (v_item->>'quantity')::INTEGER,
--             (v_item->>'subtotal')::NUMERIC
--         );

--         -- Kurangi stok produk
--         UPDATE products 
--         SET stock = stock - (v_item->>'quantity')::INTEGER,
--             updated_at = NOW()
--         WHERE id = (v_item->>'productId')::UUID;
--     END LOOP;

--     -- 3. Update statistik customer (jika ada)
--     v_customer_id := NULLIF(payload->>'customer_id', '')::UUID;
--     v_total := (payload->>'total')::NUMERIC;
    
--     IF v_customer_id IS NOT NULL THEN
--         UPDATE customers
--         SET total_transactions = COALESCE(total_transactions, 0) + 1,
--             total_spent = COALESCE(total_spent, 0) + v_total,
--             updated_at = NOW()
--         WHERE id = v_customer_id;
--     END IF;

--     -- (Opsional/Bisa ditambahkan kemudian jika tabel cash_balances & bank_accounts sudah siap)
--     -- Jika menggunakan cash_balances, lakukan update di sini...

--     RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id);
-- EXCEPTION
--     WHEN OTHERS THEN
--         RAISE EXCEPTION 'Checkout failed: %', SQLERRM;
-- END;
-- $$;


-- file: update_transactions_table.sql
-- Kopi dan jalankan script ini di Supabase Studio > SQL Editor untuk memastikan semua kolom tersedia

-- ALTER TABLE transactions 
-- ADD COLUMN IF NOT EXISTS online_details JSONB,
-- ADD COLUMN IF NOT EXISTS marketplace_fee NUMERIC DEFAULT 0,
-- ADD COLUMN IF NOT EXISTS hpp NUMERIC DEFAULT 0,
-- ADD COLUMN IF NOT EXISTS profit NUMERIC DEFAULT 0,
-- ADD COLUMN IF NOT EXISTS payment_timing VARCHAR(50) DEFAULT 'sekarang',
-- ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'lunas',
-- ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100),
-- ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'offline';

-- ============================================================
-- KOREKSI FINAL: supabase_checkout_rpc.sql (Versi Foolproof snake_case)
-- ============================================================

-- CREATE OR REPLACE FUNCTION process_checkout(payload JSONB)
-- RETURNS JSONB
-- LANGUAGE plpgsql
-- SECURITY DEFINER 
-- AS $$
-- DECLARE
--     v_transaction_id UUID;
--     v_item JSONB;
--     v_customer_id UUID;
--     v_total NUMERIC;
-- BEGIN
--     -- 1. Insert header transaksi
--     INSERT INTO transactions (
--         invoice_number,
--         customer_id,
--         customer_name,
--         transaction_type,
--         marketplace,
--         store_name,
--         order_number,
--         tracking_number,
--         customer_address,
--         subtotal,
--         discount_amount,
--         tax_amount,
--         marketplace_fee,
--         total,
--         hpp,
--         profit,
--         payment_method,
--         bank_account_id,
--         amount_paid,
--         change_amount,
--         cashier_id,
--         cashier_name,
--         status,
--         payment_timing,
--         payment_status
--     ) VALUES (
--         payload->>'invoice_number',
--         NULLIF(payload->>'customer_id', '')::UUID,
--         payload->>'customer_name',
--         payload->>'transaction_type',
--         payload->>'marketplace',
--         payload->>'store_name',
--         payload->>'order_number',
--         payload->>'tracking_number',
--         payload->>'customer_address',
--         (payload->>'subtotal')::NUMERIC,
--         (payload->>'discount_amount')::NUMERIC,
--         (payload->>'tax_amount')::NUMERIC,
--         (payload->>'marketplace_fee')::NUMERIC,
--         (payload->>'total')::NUMERIC,
--         (payload->>'hpp')::NUMERIC,
--         (payload->>'profit')::NUMERIC,
--         payload->>'payment_method',
--         NULLIF(payload->>'bank_account_id', '')::UUID,
--         (payload->>'amount_paid')::NUMERIC,
--         (payload->>'change_amount')::NUMERIC,
--         NULLIF(payload->>'cashier_id', '')::UUID,
--         payload->>'cashier_name',
--         payload->>'status',
--         payload->>'payment_timing',
--         payload->>'payment_status'
--     ) RETURNING id INTO v_transaction_id;

--     -- 2. Insert items dan kurangi stok
--     FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
--     LOOP
--         -- Insert ke transaction_items
--         INSERT INTO transaction_items (
--             transaction_id,
--             product_id,
--             product_name,
--             sku,
--             price,
--             buy_price,
--             quantity,
--             subtotal
--         ) VALUES (
--             v_transaction_id,
--             (v_item->>'product_id')::UUID,
--             v_item->>'product_name',
--             v_item->>'sku',
--             (v_item->>'price')::NUMERIC,
--             (v_item->>'buy_price')::NUMERIC,
--             (v_item->>'quantity')::INTEGER,
--             (v_item->>'subtotal')::NUMERIC
--         );

--         -- Kurangi stok produk
--         UPDATE products 
--         SET stock = stock - (v_item->>'quantity')::INTEGER,
--             updated_at = NOW()
--         WHERE id = (v_item->>'product_id')::UUID;
--     END LOOP;

--     -- 3. Update statistik customer (jika ada)
--     v_customer_id := NULLIF(payload->>'customer_id', '')::UUID;
--     v_total := (payload->>'total')::NUMERIC;
    
--     IF v_customer_id IS NOT NULL THEN
--         UPDATE customers
--         SET total_transactions = COALESCE(total_transactions, 0) + 1,
--             total_spent = COALESCE(total_spent, 0) + v_total,
--             updated_at = NOW()
--         WHERE id = v_customer_id;
--     END IF;

--     RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id);
-- EXCEPTION
--     WHEN OTHERS THEN
--         RAISE EXCEPTION 'Checkout failed: %', SQLERRM;
-- END;
-- $$;
```
