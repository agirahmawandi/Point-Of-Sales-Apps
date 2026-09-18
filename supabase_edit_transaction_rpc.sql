-- RPC untuk Mengedit Transaksi dan Memperbarui Saldo + Stok secara Atomik
CREATE OR REPLACE FUNCTION edit_transaction(
    p_transaction_id UUID,
    payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_transaction RECORD;
    v_old_item RECORD;
    v_new_item JSONB;
    v_old_payment NUMERIC;
    v_new_payment NUMERIC;
    v_old_method TEXT;
    v_new_method TEXT;
    v_old_bank UUID;
    v_new_bank UUID;
BEGIN
    -- 1. Ambil data transaksi lama
    SELECT * INTO v_old_transaction FROM transactions WHERE id = p_transaction_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found';
    END IF;

    -- [NEW] Hapus mutasi kas lama jika ada (untuk transaksi ini)
    DELETE FROM cash_mutations WHERE reference_id = p_transaction_id;

    -- 2. Kembalikan saldo berdasarkan pembayaran lama
    IF v_old_transaction.payment_status != 'tertunda' THEN
        v_old_payment := COALESCE(v_old_transaction.amount_paid, v_old_transaction.total, 0);
        v_old_method := v_old_transaction.payment_method;
        v_old_bank := v_old_transaction.bank_account_id;

        IF v_old_method IN ('cash', 'qris') THEN
            UPDATE cash_balances SET balance = balance - v_old_payment, updated_at = NOW() WHERE type = v_old_method;
        ELSIF v_old_method = 'card' AND v_old_bank IS NOT NULL THEN
            UPDATE bank_accounts SET balance = balance - v_old_payment, updated_at = NOW() WHERE id = v_old_bank;
        END IF;
    END IF;

    -- 3. Kembalikan stok dari item lama (kembalikan ke inventory)
    FOR v_old_item IN SELECT * FROM transaction_items WHERE transaction_id = p_transaction_id LOOP
        UPDATE products SET stock = stock + v_old_item.quantity, updated_at = NOW() WHERE id = v_old_item.product_id;
    END LOOP;

    -- Hapus item lama
    DELETE FROM transaction_items WHERE transaction_id = p_transaction_id;

    -- 4. Update transaksi dengan data baru
    UPDATE transactions
    SET
        transaction_type = COALESCE(payload->>'transactionType', transaction_type),
        marketplace = payload->'onlineDetails'->>'marketplace',
        store_name = payload->'onlineDetails'->>'storeName',
        order_number = payload->'onlineDetails'->>'orderNumber',
        tracking_number = payload->'onlineDetails'->>'trackingNumber',
        customer_name = payload->'onlineDetails'->>'customerName',
        customer_address = payload->'onlineDetails'->>'customerAddress',
        subtotal = (payload->>'subtotal')::NUMERIC,
        discount_amount = (payload->>'discount')::NUMERIC,
        tax_amount = (payload->>'tax')::NUMERIC,
        marketplace_fee = (payload->>'marketplaceFee')::NUMERIC,
        total = (payload->>'total')::NUMERIC,
        hpp = (payload->>'hpp')::NUMERIC,
        profit = (payload->>'profit')::NUMERIC,
        payment_method = payload->>'paymentMethod',
        bank_account_id = NULLIF(payload->>'bankAccountId', '')::UUID,
        payment_status = payload->>'paymentStatus',
        payment_timing = payload->>'paymentTiming',
        status = payload->>'status',
        amount_paid = (payload->>'amountPaid')::NUMERIC,
        updated_at = NOW()
    WHERE id = p_transaction_id;

    -- 5. Masukkan item baru & Kurangi stok baru
    FOR v_new_item IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
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
            p_transaction_id,
            (v_new_item->>'productId')::UUID,
            v_new_item->>'name',
            v_new_item->>'sku',
            (v_new_item->>'price')::NUMERIC,
            (v_new_item->>'buyPrice')::NUMERIC,
            (v_new_item->>'quantity')::NUMERIC,
            (v_new_item->>'subtotal')::NUMERIC
        );

        UPDATE products SET stock = stock - (v_new_item->>'quantity')::NUMERIC, updated_at = NOW() WHERE id = (v_new_item->>'productId')::UUID;
    END LOOP;

    -- 6. Tambahkan saldo berdasarkan pembayaran baru
    IF payload->>'paymentStatus' != 'tertunda' THEN
        v_new_payment := COALESCE((payload->>'amountPaid')::NUMERIC, (payload->>'total')::NUMERIC, 0);
        v_new_method := payload->>'paymentMethod';
        v_new_bank := NULLIF(payload->>'bankAccountId', '')::UUID;

        IF v_new_method IN ('cash', 'qris') THEN
            UPDATE cash_balances SET balance = COALESCE(balance, 0) + v_new_payment, updated_at = NOW() WHERE type = v_new_method;
        ELSIF v_new_method = 'card' AND v_new_bank IS NOT NULL THEN
            UPDATE bank_accounts SET balance = COALESCE(balance, 0) + v_new_payment, updated_at = NOW() WHERE id = v_new_bank;
        END IF;

        -- [NEW] Insert mutasi kas baru
        INSERT INTO cash_mutations (type, reference_id, description, amount, direction, payment_method, bank_account_id)
        VALUES ('sale', p_transaction_id, 'Penjualan (Edit) #' || COALESCE(v_old_transaction.invoice_number, 'INV-EDIT'), v_new_payment, 'in', v_new_method, v_new_bank);
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;
