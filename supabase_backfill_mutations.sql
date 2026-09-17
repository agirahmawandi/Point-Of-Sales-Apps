-- ============================================================
-- FREMA-POS: Script Perbaikan Migrasi Data Lama Mutasi Kas
-- ============================================================

-- A. HAPUS SEMUA DATA HISTORI LAMA YANG JAMNYA SALAH
DELETE FROM cash_mutations WHERE description LIKE '%(Histori Lama)%';

-- B. MASUKKAN ULANG DATA HISTORI DENGAN JAM YANG TEPAT (Menggunakan created_at)

-- 1. Penjualan
INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id, created_at)
SELECT 
    COALESCE(updated_at, created_at) as date,
    'sale' as type,
    id as reference_id,
    'Penjualan (Histori Lama) #' || invoice_number as description,
    amount_paid as amount,
    'in' as direction,
    payment_method,
    bank_account_id,
    created_at
FROM transactions
WHERE payment_status = 'lunas' AND amount_paid > 0;

-- 2. Pembelian
INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id, created_at)
SELECT 
    COALESCE(updated_at, created_at) as date,
    'purchase' as type,
    id as reference_id,
    'Pembelian (Histori Lama) PO #' || po_number as description,
    paid_amount as amount,
    'out' as direction,
    payment_method,
    bank_account_id,
    created_at
FROM purchase_orders
WHERE paid_amount > 0;

-- 3. Pengeluaran (Gunakan created_at agar jamnya tidak jam 07:00)
INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id, created_at)
SELECT 
    created_at as date,
    'expense' as type,
    id as reference_id,
    'Pengeluaran (Histori Lama): ' || description as description,
    amount,
    'out' as direction,
    payment_method,
    bank_account_id,
    created_at
FROM expenses;

-- 4. Dana Investor (Gunakan created_at agar jamnya tidak jam 07:00)
INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id, created_at)
SELECT 
    created_at as date,
    'investor' as type,
    id as reference_id,
    'Dana Investor (Histori Lama): ' || investor_name as description,
    amount,
    'in' as direction,
    method as payment_method,
    bank_account_id,
    created_at
FROM investor_deposits;

-- 5. Pindah Saldo Keluar (Gunakan created_at)
INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id, created_at)
SELECT 
    created_at as date,
    'transfer' as type,
    id as reference_id,
    'Pindah Saldo Keluar (Histori Lama)' as description,
    amount,
    'out' as direction,
    from_type as payment_method,
    from_bank_id as bank_account_id,
    created_at
FROM balance_transfers;

-- 6. Pindah Saldo Masuk (Gunakan created_at)
INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id, created_at)
SELECT 
    created_at as date,
    'transfer' as type,
    id as reference_id,
    'Pindah Saldo Masuk (Histori Lama)' as description,
    amount,
    'in' as direction,
    to_type as payment_method,
    to_bank_id as bank_account_id,
    created_at
FROM balance_transfers;
