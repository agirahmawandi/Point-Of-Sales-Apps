-- ============================================================
-- FREMA-POS: Expense RPCs
-- ============================================================

-- 1. RPC untuk Membuat Pengeluaran (dan memotong kas/bank) secara atomik
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
    v_attachment TEXT;
    v_created_by UUID;
BEGIN
    v_category_id := NULLIF(payload->>'category_id', '')::UUID;
    v_description := payload->>'description';
    v_amount := (payload->>'amount')::NUMERIC;
    v_date := (payload->>'date')::DATE;
    v_payment_method := payload->>'payment_method';
    v_bank_id := NULLIF(payload->>'bank_account_id', '')::UUID;
    v_attachment := payload->>'attachment';
    v_created_by := NULLIF(payload->>'created_by', '')::UUID;

    -- Insert Expense
    INSERT INTO expenses (
        category_id,
        description,
        amount,
        date,
        payment_method,
        bank_account_id,
        attachment,
        created_by
    ) VALUES (
        v_category_id,
        v_description,
        v_amount,
        v_date,
        v_payment_method,
        v_bank_id,
        v_attachment,
        v_created_by
    ) RETURNING id INTO v_expense_id;

    -- Potong saldo bank jika dibayar dari rekening bank
    IF v_bank_id IS NOT NULL AND v_payment_method IN ('Transfer Bank', 'Kartu Kredit') THEN
        UPDATE bank_accounts
        SET balance = balance - v_amount,
            updated_at = NOW()
        WHERE id = v_bank_id;
    END IF;
    
    -- Potong saldo kas jika dibayar tunai
    IF v_payment_method = 'Tunai' THEN
        -- Cek apakah tabel cash_balances ada record 'cash'
        IF EXISTS (SELECT 1 FROM cash_balances WHERE type = 'cash') THEN
            UPDATE cash_balances
            SET balance = balance - v_amount,
                updated_at = NOW()
            WHERE type = 'cash';
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'expense_id', v_expense_id);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Gagal membuat pengeluaran: %', SQLERRM;
END;
$$;
