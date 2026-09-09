-- file: supabase_checkout_rpc.sql
-- Kopi dan jalankan script ini di Supabase Studio > SQL Editor

CREATE OR REPLACE FUNCTION process_checkout(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Supaya fungsi bisa dijalankan dengan previlege yang cukup
AS $$
DECLARE
    v_transaction_id UUID;
    v_item JSONB;
    v_customer_id UUID;
    v_total NUMERIC;
BEGIN
    -- 1. Insert header transaksi
    INSERT INTO transactions (
        invoice_number,
        customer_id,
        customer_name,
        transaction_type,
        marketplace,
        store_name,
        order_number,
        tracking_number,
        customer_address,
        subtotal,
        discount_amount,
        tax_amount,
        marketplace_fee,
        total,
        hpp,
        profit,
        payment_method,
        bank_account_id,
        amount_paid,
        change_amount,
        cashier_id,
        cashier_name,
        status,
        payment_timing,
        payment_status
    ) VALUES (
        payload->>'invoice_number',
        NULLIF(payload->>'customer_id', '')::UUID,
        payload->>'customer_name',
        payload->>'transaction_type',
        payload->>'marketplace',
        payload->>'store_name',
        payload->>'order_number',
        payload->>'tracking_number',
        payload->>'customer_address',
        (payload->>'subtotal')::NUMERIC,
        (payload->>'discount_amount')::NUMERIC,
        (payload->>'tax_amount')::NUMERIC,
        (payload->>'marketplace_fee')::NUMERIC,
        (payload->>'total')::NUMERIC,
        (payload->>'hpp')::NUMERIC,
        (payload->>'profit')::NUMERIC,
        payload->>'payment_method',
        NULLIF(payload->>'bank_account_id', '')::UUID,
        (payload->>'amount_paid')::NUMERIC,
        (payload->>'change_amount')::NUMERIC,
        NULLIF(payload->>'cashier_id', '')::UUID,
        payload->>'cashier_name',
        payload->>'status',
        payload->>'payment_timing',
        payload->>'payment_status'
    ) RETURNING id INTO v_transaction_id;

    -- 2. Insert items dan kurangi stok
    FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        -- Insert ke transaction_items
        INSERT INTO transaction_items (
            transaction_id,
            product_id,
            product_name,
            sku,
            price,
            buy_price,
            quantity,
            subtotal
        ) VALUES (
            v_transaction_id,
            (v_item->>'product_id')::UUID,
            v_item->>'product_name',
            v_item->>'sku',
            (v_item->>'price')::NUMERIC,
            (v_item->>'buy_price')::NUMERIC,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'subtotal')::NUMERIC
        );

        -- Kurangi stok produk
        UPDATE products 
        SET stock = stock - (v_item->>'quantity')::INTEGER,
            updated_at = NOW()
        WHERE id = (v_item->>'product_id')::UUID;
    END LOOP;

    -- 3. Update statistik customer (jika ada)
    v_customer_id := NULLIF(payload->>'customer_id', '')::UUID;
    v_total := (payload->>'total')::NUMERIC;
    
    IF v_customer_id IS NOT NULL THEN
        UPDATE customers
        SET total_transactions = COALESCE(total_transactions, 0) + 1,
            total_spent = COALESCE(total_spent, 0) + v_total,
            updated_at = NOW()
        WHERE id = v_customer_id;
    END IF;

    -- (Opsional/Bisa ditambahkan kemudian jika tabel cash_balances & bank_accounts sudah siap)
    -- Jika menggunakan cash_balances, lakukan update di sini...

    RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Checkout failed: %', SQLERRM;
END;
$$;
