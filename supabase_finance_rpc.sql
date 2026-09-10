-- ============================================================
-- FREMA-POS: Finance RPCs (Phase 7)
-- ============================================================

-- 1. RPC untuk Pindah Saldo (Balance Transfer)
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

    -- Insert record
    INSERT INTO balance_transfers (from_type, from_bank_id, to_type, to_bank_id, amount, notes, date)
    VALUES (v_from_type, v_from_bank_id, v_to_type, v_to_bank_id, v_amount, v_notes, v_date)
    RETURNING id INTO v_transfer_id;

    -- Deduct from source
    IF v_from_type = 'bank' AND v_from_bank_id IS NOT NULL THEN
        UPDATE bank_accounts SET balance = balance - v_amount, updated_at = NOW() WHERE id = v_from_bank_id;
    ELSIF v_from_type IN ('cash', 'qris') THEN
        UPDATE cash_balances SET balance = balance - v_amount, updated_at = NOW() WHERE type = v_from_type;
    END IF;

    -- Add to destination
    IF v_to_type = 'bank' AND v_to_bank_id IS NOT NULL THEN
        UPDATE bank_accounts SET balance = balance + v_amount, updated_at = NOW() WHERE id = v_to_bank_id;
    ELSIF v_to_type IN ('cash', 'qris') THEN
        UPDATE cash_balances SET balance = balance + v_amount, updated_at = NOW() WHERE type = v_to_type;
    END IF;

    RETURN jsonb_build_object('success', true, 'transfer_id', v_transfer_id);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Gagal memindah saldo: %', SQLERRM;
END;
$$;

-- 2. RPC untuk Setoran Investor (Investor Deposit)
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

    -- Insert record
    INSERT INTO investor_deposits (investor_id, investor_name, amount, method, bank_account_id, notes, date)
    VALUES (v_investor_id, v_investor_name, v_amount, v_method, v_bank_account_id, v_notes, v_date)
    RETURNING id INTO v_deposit_id;

    -- Update investor total_invested
    UPDATE investors SET total_invested = COALESCE(total_invested, 0) + v_amount WHERE id = v_investor_id;

    -- Add to cash/bank
    IF v_method = 'transfer' AND v_bank_account_id IS NOT NULL THEN
        UPDATE bank_accounts SET balance = balance + v_amount, updated_at = NOW() WHERE id = v_bank_account_id;
    ELSIF v_method = 'cash' THEN
        UPDATE cash_balances SET balance = balance + v_amount, updated_at = NOW() WHERE type = 'cash';
    END IF;

    RETURN jsonb_build_object('success', true, 'deposit_id', v_deposit_id);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Gagal menambah setoran investor: %', SQLERRM;
END;
$$;

-- 3. RPC untuk Bagi Hasil (Profit Share)
CREATE OR REPLACE FUNCTION create_profit_share(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_share_id UUID;
    v_period TEXT;
    v_total_revenue NUMERIC;
    v_total_expense NUMERIC;
    v_net_profit NUMERIC;
    v_share_percentage NUMERIC;
    v_share_amount NUMERIC;
    v_notes TEXT;
    
    dist JSONB;
    v_dist_investor_id UUID;
    v_dist_investor_name TEXT;
    v_dist_percentage NUMERIC;
    v_dist_amount NUMERIC;
    v_dist_method TEXT;
    v_dist_bank_id UUID;
BEGIN
    v_period := payload->>'period';
    v_total_revenue := (payload->>'totalRevenue')::NUMERIC;
    v_total_expense := (payload->>'totalExpense')::NUMERIC;
    v_net_profit := (payload->>'netProfit')::NUMERIC;
    v_share_percentage := (payload->>'sharePercentage')::NUMERIC;
    v_share_amount := (payload->>'shareAmount')::NUMERIC;
    v_notes := payload->>'notes';

    -- Insert Profit Share
    INSERT INTO profit_shares (period, total_revenue, total_expense, net_profit, share_percentage, share_amount, notes)
    VALUES (v_period, v_total_revenue, v_total_expense, v_net_profit, v_share_percentage, v_share_amount, v_notes)
    RETURNING id INTO v_share_id;

    -- Process distributions
    FOR dist IN SELECT * FROM jsonb_array_elements(payload->'distributions')
    LOOP
        v_dist_investor_id := (dist->>'investorId')::UUID;
        v_dist_investor_name := dist->>'investorName';
        v_dist_percentage := (dist->>'percentage')::NUMERIC;
        v_dist_amount := (dist->>'amount')::NUMERIC;
        v_dist_method := dist->>'method';
        v_dist_bank_id := NULLIF(dist->>'bankAccountId', '')::UUID;

        -- Insert distribution
        INSERT INTO profit_share_distributions (profit_share_id, investor_id, investor_name, percentage, amount, method, bank_account_id)
        VALUES (v_share_id, v_dist_investor_id, v_dist_investor_name, v_dist_percentage, v_dist_amount, v_dist_method, v_dist_bank_id);

        -- Update investor total_withdrawn
        UPDATE investors SET total_withdrawn = COALESCE(total_withdrawn, 0) + v_dist_amount WHERE id = v_dist_investor_id;

        -- Deduct from cash/bank
        IF v_dist_method = 'transfer' AND v_dist_bank_id IS NOT NULL THEN
            UPDATE bank_accounts SET balance = balance - v_dist_amount, updated_at = NOW() WHERE id = v_dist_bank_id;
        ELSIF v_dist_method = 'cash' THEN
            UPDATE cash_balances SET balance = balance - v_dist_amount, updated_at = NOW() WHERE type = 'cash';
        END IF;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'profit_share_id', v_share_id);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Gagal membagikan laba: %', SQLERRM;
END;
$$;
