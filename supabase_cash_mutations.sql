-- ============================================================
-- FREMA-POS: Tabel Mutasi Kas (Cash Mutations) & Update RPC
-- ============================================================

-- 1. Buat Tabel cash_mutations
CREATE TABLE IF NOT EXISTS cash_mutations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL, -- 'sale', 'purchase', 'expense', 'transfer', 'investor', 'profit_share'
    reference_id UUID,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    direction TEXT NOT NULL, -- 'in', 'out'
    payment_method TEXT NOT NULL, -- 'cash', 'qris', 'card', 'transfer', dll
    bank_account_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hapus policy lama jika ada (untuk replace)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON cash_mutations;
ALTER TABLE cash_mutations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON cash_mutations FOR ALL USING (true) WITH CHECK (true);

-- Berikan izin akses
GRANT ALL ON TABLE public.cash_mutations TO anon;
GRANT ALL ON TABLE public.cash_mutations TO authenticated;
GRANT ALL ON TABLE public.cash_mutations TO service_role;

-- ============================================================
-- UPDATE RPC 1: pay_purchase_order
-- ============================================================
CREATE OR REPLACE FUNCTION pay_purchase_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_po_id UUID;
    v_supplier_id UUID;
    v_amount NUMERIC;
    v_bank_id UUID;
    v_method TEXT;
    v_po_number TEXT;
    v_total_amount NUMERIC;
    v_current_paid NUMERIC;
    v_new_paid NUMERIC;
    v_payment_status TEXT;
BEGIN
    v_po_id := (payload->>'po_id')::UUID;
    v_amount := (payload->>'amount')::NUMERIC;
    v_bank_id := NULLIF(payload->>'bank_account_id', '')::UUID;
    v_method := payload->>'payment_method';

    SELECT total_amount, paid_amount, supplier_id, po_number
    INTO v_total_amount, v_current_paid, v_supplier_id, v_po_number
    FROM purchase_orders WHERE id = v_po_id;

    v_new_paid := COALESCE(v_current_paid, 0) + v_amount;
    IF v_new_paid >= v_total_amount THEN v_payment_status := 'lunas';
    ELSIF v_new_paid > 0 THEN v_payment_status := 'sebagian';
    ELSE v_payment_status := 'utang'; END IF;

    UPDATE purchase_orders SET paid_amount = v_new_paid, payment_status = v_payment_status, payment_method = v_method, bank_account_id = v_bank_id, updated_at = NOW() WHERE id = v_po_id;

    IF v_bank_id IS NOT NULL AND v_method IN ('transfer', 'card', 'qris') THEN
        UPDATE bank_accounts SET balance = balance - v_amount, updated_at = NOW() WHERE id = v_bank_id;
    END IF;
    IF v_method = 'cash' THEN
        IF EXISTS (SELECT 1 FROM cash_balances WHERE type = 'cash') THEN
            UPDATE cash_balances SET balance = balance - v_amount, updated_at = NOW() WHERE type = 'cash';
        END IF;
    END IF;

    IF v_supplier_id IS NOT NULL THEN
        UPDATE suppliers SET total_debt = GREATEST(0, total_debt - v_amount), updated_at = NOW() WHERE id = v_supplier_id;
    END IF;

    -- [NEW] Catat ke tabel mutasi
    INSERT INTO cash_mutations (type, reference_id, description, amount, direction, payment_method, bank_account_id)
    VALUES ('purchase', v_po_id, 'Pembayaran PO #' || v_po_number, v_amount, 'out', v_method, v_bank_id);

    RETURN jsonb_build_object('success', true, 'payment_status', v_payment_status);
EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'Gagal memproses pembayaran PO: %', SQLERRM;
END;
$$;


-- ============================================================
-- UPDATE RPC 2: process_checkout
-- ============================================================
CREATE OR REPLACE FUNCTION process_checkout(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
    v_transaction_id UUID;
    v_item JSONB;
    v_customer_id UUID;
    v_total NUMERIC;
BEGIN
    INSERT INTO transactions (invoice_number, customer_id, customer_name, transaction_type, marketplace, store_name, order_number, tracking_number, customer_address, subtotal, discount_amount, tax_amount, marketplace_fee, total, hpp, profit, payment_method, bank_account_id, amount_paid, change_amount, cashier_id, cashier_name, status, payment_timing, payment_status)
    VALUES (
        payload->>'invoice_number', NULLIF(payload->>'customer_id', '')::UUID, payload->>'customer_name', payload->>'transaction_type', payload->>'marketplace', payload->>'store_name', payload->>'order_number', payload->>'tracking_number', payload->>'customer_address', (payload->>'subtotal')::NUMERIC, (payload->>'discount_amount')::NUMERIC, (payload->>'tax_amount')::NUMERIC, (payload->>'marketplace_fee')::NUMERIC, (payload->>'total')::NUMERIC, (payload->>'hpp')::NUMERIC, (payload->>'profit')::NUMERIC, payload->>'payment_method', NULLIF(payload->>'bank_account_id', '')::UUID, (payload->>'amount_paid')::NUMERIC, (payload->>'change_amount')::NUMERIC, NULLIF(payload->>'cashier_id', '')::UUID, payload->>'cashier_name', payload->>'status', payload->>'payment_timing', payload->>'payment_status'
    ) RETURNING id INTO v_transaction_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        INSERT INTO transaction_items (transaction_id, product_id, product_name, sku, price, buy_price, quantity, subtotal)
        VALUES (v_transaction_id, (v_item->>'product_id')::UUID, v_item->>'product_name', v_item->>'sku', (v_item->>'price')::NUMERIC, (v_item->>'buy_price')::NUMERIC, (v_item->>'quantity')::NUMERIC, (v_item->>'subtotal')::NUMERIC);
        UPDATE products SET stock = stock - (v_item->>'quantity')::NUMERIC, updated_at = NOW() WHERE id = (v_item->>'product_id')::UUID;
    END LOOP;

    v_customer_id := NULLIF(payload->>'customer_id', '')::UUID;
    v_total := (payload->>'total')::NUMERIC;
    
    IF v_customer_id IS NOT NULL THEN
        UPDATE customers SET total_transactions = COALESCE(total_transactions, 0) + 1, total_spent = COALESCE(total_spent, 0) + v_total, updated_at = NOW() WHERE id = v_customer_id;
    END IF;

    IF payload->>'payment_timing' = 'sekarang' THEN
        IF payload->>'payment_method' = 'cash' THEN UPDATE cash_balances SET balance = COALESCE(balance, 0) + v_total, updated_at = NOW() WHERE type = 'cash';
        ELSIF payload->>'payment_method' = 'qris' THEN UPDATE cash_balances SET balance = COALESCE(balance, 0) + v_total, updated_at = NOW() WHERE type = 'qris';
        ELSIF payload->>'payment_method' = 'card' AND NULLIF(payload->>'bank_account_id', '') IS NOT NULL THEN UPDATE bank_accounts SET balance = COALESCE(balance, 0) + v_total WHERE id = (payload->>'bank_account_id')::UUID;
        END IF;

        -- [NEW] Catat ke tabel mutasi
        INSERT INTO cash_mutations (type, reference_id, description, amount, direction, payment_method, bank_account_id)
        VALUES ('sale', v_transaction_id, 'Penjualan #' || (payload->>'invoice_number'), v_total, 'in', payload->>'payment_method', NULLIF(payload->>'bank_account_id', '')::UUID);
    END IF;

    RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id);
EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'Checkout failed: %', SQLERRM;
END;
$$;

-- ============================================================
-- UPDATE RPC 3: settle_transaction
-- ============================================================
CREATE OR REPLACE FUNCTION settle_transaction(
    p_transaction_id UUID,
    p_payment_method TEXT,
    p_bank_account_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total NUMERIC;
    v_payment_status TEXT;
    v_invoice_number TEXT;
BEGIN
    SELECT total, payment_status, invoice_number INTO v_total, v_payment_status, v_invoice_number FROM transactions WHERE id = p_transaction_id;
    IF v_total IS NULL THEN RAISE EXCEPTION 'Transaction not found'; END IF;
    IF v_payment_status = 'lunas' THEN RAISE EXCEPTION 'Transaction is already paid'; END IF;

    UPDATE transactions SET payment_status = 'lunas', payment_timing = 'sekarang', status = 'success', payment_method = p_payment_method, bank_account_id = p_bank_account_id, amount_paid = v_total, updated_at = NOW() WHERE id = p_transaction_id;

    IF p_payment_method = 'cash' THEN UPDATE cash_balances SET balance = COALESCE(balance, 0) + v_total, updated_at = NOW() WHERE type = 'cash';
    ELSIF p_payment_method = 'qris' THEN UPDATE cash_balances SET balance = COALESCE(balance, 0) + v_total, updated_at = NOW() WHERE type = 'qris';
    ELSIF p_payment_method = 'card' AND p_bank_account_id IS NOT NULL THEN UPDATE bank_accounts SET balance = COALESCE(balance, 0) + v_total WHERE id = p_bank_account_id;
    END IF;

    -- [NEW] Catat ke mutasi
    INSERT INTO cash_mutations (type, reference_id, description, amount, direction, payment_method, bank_account_id)
    VALUES ('sale', p_transaction_id, 'Pelunasan Penjualan #' || v_invoice_number, v_total, 'in', p_payment_method, p_bank_account_id);

    RETURN jsonb_build_object('success', true, 'transaction_id', p_transaction_id);
EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'Settlement failed: %', SQLERRM;
END;
$$;

-- ============================================================
-- UPDATE RPC 4: create_expense
-- ============================================================
CREATE OR REPLACE FUNCTION create_expense(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_expense_id UUID;
    v_category_id UUID;
    v_description TEXT;
    v_amount NUMERIC;
    v_date DATE;
    v_payment_method TEXT;
    v_bank_id UUID;
BEGIN
    v_category_id := NULLIF(payload->>'category_id', '')::UUID;
    v_description := payload->>'description';
    v_amount := (payload->>'amount')::NUMERIC;
    v_date := (payload->>'date')::DATE;
    v_payment_method := payload->>'payment_method';
    v_bank_id := NULLIF(payload->>'bank_account_id', '')::UUID;

    INSERT INTO expenses (category_id, description, amount, date, payment_method, bank_account_id, attachment, created_by)
    VALUES (v_category_id, v_description, v_amount, v_date, v_payment_method, v_bank_id, payload->>'attachment', NULLIF(payload->>'created_by', '')::UUID) RETURNING id INTO v_expense_id;

    IF v_bank_id IS NOT NULL AND v_payment_method IN ('Transfer Bank', 'Kartu Kredit') THEN
        UPDATE bank_accounts SET balance = balance - v_amount, updated_at = NOW() WHERE id = v_bank_id;
    ELSIF v_payment_method = 'Tunai' THEN
        IF EXISTS (SELECT 1 FROM cash_balances WHERE type = 'cash') THEN UPDATE cash_balances SET balance = balance - v_amount, updated_at = NOW() WHERE type = 'cash'; END IF;
    END IF;

    -- [NEW] Catat ke mutasi
    INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id)
    VALUES (NOW(), 'expense', v_expense_id, 'Pengeluaran: ' || v_description, v_amount, 'out', v_payment_method, v_bank_id);

    RETURN jsonb_build_object('success', true, 'expense_id', v_expense_id);
END;
$$;

-- ============================================================
-- UPDATE RPC 5: create_balance_transfer
-- ============================================================
CREATE OR REPLACE FUNCTION create_balance_transfer(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transfer_id UUID;
    v_from_type TEXT;
    v_from_bank_id UUID;
    v_to_type TEXT;
    v_to_bank_id UUID;
    v_amount NUMERIC;
    v_notes TEXT;
    v_date DATE;
BEGIN
    v_from_type := payload->>'fromType';
    v_from_bank_id := NULLIF(payload->>'fromBankId', '')::UUID;
    v_to_type := payload->>'toType';
    v_to_bank_id := NULLIF(payload->>'toBankId', '')::UUID;
    v_amount := (payload->>'amount')::NUMERIC;
    v_notes := payload->>'notes';
    v_date := COALESCE(NULLIF(payload->>'date', ''), NOW()::TEXT)::DATE;

    INSERT INTO balance_transfers (from_type, from_bank_id, to_type, to_bank_id, amount, notes, date)
    VALUES (v_from_type, v_from_bank_id, v_to_type, v_to_bank_id, v_amount, v_notes, v_date) RETURNING id INTO v_transfer_id;

    IF v_from_type = 'bank' AND v_from_bank_id IS NOT NULL THEN UPDATE bank_accounts SET balance = balance - v_amount, updated_at = NOW() WHERE id = v_from_bank_id;
    ELSIF v_from_type IN ('cash', 'qris') THEN UPDATE cash_balances SET balance = balance - v_amount, updated_at = NOW() WHERE type = v_from_type; END IF;

    IF v_to_type = 'bank' AND v_to_bank_id IS NOT NULL THEN UPDATE bank_accounts SET balance = balance + v_amount, updated_at = NOW() WHERE id = v_to_bank_id;
    ELSIF v_to_type IN ('cash', 'qris') THEN UPDATE cash_balances SET balance = balance + v_amount, updated_at = NOW() WHERE type = v_to_type; END IF;

    -- [NEW] Mutasi Keluar
    INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id)
    VALUES (NOW(), 'transfer', v_transfer_id, 'Pindah Saldo Keluar: ' || v_notes, v_amount, 'out', v_from_type, v_from_bank_id);
    -- [NEW] Mutasi Masuk
    INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id)
    VALUES (NOW(), 'transfer', v_transfer_id, 'Pindah Saldo Masuk: ' || v_notes, v_amount, 'in', v_to_type, v_to_bank_id);

    RETURN jsonb_build_object('success', true, 'transfer_id', v_transfer_id);
END;
$$;

-- ============================================================
-- UPDATE RPC 6: create_investor_deposit
-- ============================================================
CREATE OR REPLACE FUNCTION create_investor_deposit(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deposit_id UUID;
    v_investor_id UUID;
    v_investor_name TEXT;
    v_amount NUMERIC;
    v_method TEXT;
    v_bank_account_id UUID;
    v_notes TEXT;
    v_date DATE;
BEGIN
    v_investor_id := (payload->>'investorId')::UUID;
    v_investor_name := payload->>'investorName';
    v_amount := (payload->>'amount')::NUMERIC;
    v_method := payload->>'method';
    v_bank_account_id := NULLIF(payload->>'bankAccountId', '')::UUID;
    v_notes := payload->>'notes';
    v_date := COALESCE(NULLIF(payload->>'date', ''), NOW()::TEXT)::DATE;

    INSERT INTO investor_deposits (investor_id, investor_name, amount, method, bank_account_id, notes, date)
    VALUES (v_investor_id, v_investor_name, v_amount, v_method, v_bank_account_id, v_notes, v_date) RETURNING id INTO v_deposit_id;

    UPDATE investors SET total_invested = COALESCE(total_invested, 0) + v_amount WHERE id = v_investor_id;

    IF v_method = 'transfer' AND v_bank_account_id IS NOT NULL THEN UPDATE bank_accounts SET balance = balance + v_amount, updated_at = NOW() WHERE id = v_bank_account_id;
    ELSIF v_method = 'cash' THEN UPDATE cash_balances SET balance = balance + v_amount, updated_at = NOW() WHERE type = 'cash'; END IF;

    -- [NEW] Catat ke mutasi
    INSERT INTO cash_mutations (date, type, reference_id, description, amount, direction, payment_method, bank_account_id)
    VALUES (NOW(), 'investor', v_deposit_id, 'Dana Investor: ' || v_investor_name, v_amount, 'in', v_method, v_bank_account_id);

    RETURN jsonb_build_object('success', true, 'deposit_id', v_deposit_id);
END;
$$;
