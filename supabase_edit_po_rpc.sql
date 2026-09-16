-- RPC untuk Mengedit Purchase Order dan Memperbarui Saldo + Stok secara Atomik
CREATE OR REPLACE FUNCTION edit_purchase_order(
    p_po_id UUID,
    payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_po RECORD;
    v_old_item RECORD;
    v_new_item JSONB;
    v_old_payment NUMERIC;
    v_new_payment NUMERIC;
    v_old_method TEXT;
    v_new_method TEXT;
    v_old_bank UUID;
    v_new_bank UUID;
    v_old_supplier UUID;
    v_new_supplier UUID;
    v_old_total NUMERIC;
    v_new_total NUMERIC;
    v_all_received BOOLEAN := TRUE;
    v_current_status TEXT;
BEGIN
    -- 1. Ambil data PO lama
    SELECT * INTO v_old_po FROM purchase_orders WHERE id = p_po_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase Order not found';
    END IF;

    v_old_supplier := v_old_po.supplier_id;
    v_old_total := COALESCE(v_old_po.total_amount, 0);
    v_old_payment := COALESCE(v_old_po.paid_amount, 0);
    v_old_method := v_old_po.payment_method;
    v_old_bank := v_old_po.bank_account_id;

    -- 2. Kembalikan saldo berdasarkan pembayaran lama (uang kembali)
    IF v_old_payment > 0 THEN
        IF v_old_method IN ('cash', 'qris') THEN
            UPDATE cash_balances SET balance = COALESCE(balance, 0) + v_old_payment, updated_at = NOW() WHERE type = 'cash'; -- Asumsikan cash
        ELSIF v_old_method IN ('transfer', 'card') AND v_old_bank IS NOT NULL THEN
            UPDATE bank_accounts SET balance = COALESCE(balance, 0) + v_old_payment, updated_at = NOW() WHERE id = v_old_bank;
        END IF;
    END IF;

    -- 3. Kembalikan data supplier lama
    IF v_old_supplier IS NOT NULL THEN
        UPDATE suppliers
        SET total_purchases = GREATEST(0, COALESCE(total_purchases, 0) - v_old_total),
            total_debt = GREATEST(0, COALESCE(total_debt, 0) - (v_old_total - v_old_payment)),
            updated_at = NOW()
        WHERE id = v_old_supplier;
    END IF;

    -- 4. Kembalikan stok dari item lama (jika barang sudah diterima)
    FOR v_old_item IN SELECT * FROM purchase_order_items WHERE purchase_order_id = p_po_id LOOP
        IF COALESCE(v_old_item.received_quantity, 0) > 0 THEN
            UPDATE products 
            SET stock = GREATEST(0, stock - v_old_item.received_quantity), 
                updated_at = NOW() 
            WHERE id = v_old_item.product_id;
        END IF;
    END LOOP;

    -- 5. Hapus item lama
    DELETE FROM purchase_order_items WHERE purchase_order_id = p_po_id;

    -- 6. Tentukan nilai baru dari payload
    v_new_total := (payload->>'total_amount')::NUMERIC;
    v_new_supplier := NULLIF(payload->>'supplier_id', '')::UUID;
    v_new_payment := COALESCE((payload->>'paid_amount')::NUMERIC, 0);
    v_new_method := payload->>'payment_method';
    v_new_bank := NULLIF(payload->>'bank_account_id', '')::UUID;

    -- 7. Update header PO dengan data baru
    UPDATE purchase_orders
    SET
        po_number = COALESCE(payload->>'po_number', po_number),
        supplier_id = v_new_supplier,
        total_amount = v_new_total,
        status = payload->>'status',
        payment_status = payload->>'payment_status',
        payment_method = v_new_method,
        bank_account_id = v_new_bank,
        paid_amount = v_new_payment,
        due_date = NULLIF(payload->>'due_date', '')::DATE,
        notes = payload->>'notes',
        updated_at = NOW()
    WHERE id = p_po_id;

    -- 8. Masukkan item baru & Tambah stok jika diterima
    FOR v_new_item IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
        INSERT INTO purchase_order_items (
            purchase_order_id,
            product_id,
            product_name,
            sku,
            buy_price,
            quantity,
            received_quantity,
            subtotal
        ) VALUES (
            p_po_id,
            (v_new_item->>'product_id')::UUID,
            v_new_item->>'product_name',
            v_new_item->>'sku',
            (v_new_item->>'buy_price')::NUMERIC,
            (v_new_item->>'quantity')::INTEGER,
            COALESCE((v_new_item->>'received_quantity')::INTEGER, 0),
            (v_new_item->>'subtotal')::NUMERIC
        );

        IF COALESCE((v_new_item->>'received_quantity')::INTEGER, 0) > 0 THEN
            UPDATE products 
            SET stock = stock + (v_new_item->>'received_quantity')::INTEGER, 
                buy_price = (v_new_item->>'buy_price')::NUMERIC,
                updated_at = NOW() 
            WHERE id = (v_new_item->>'product_id')::UUID;
        END IF;

        IF COALESCE((v_new_item->>'received_quantity')::INTEGER, 0) < (v_new_item->>'quantity')::INTEGER THEN
            v_all_received := FALSE;
        END IF;
    END LOOP;

    -- Perbaiki status PO berdasarkan qty received jika diperlukan
    IF payload->>'status' IN ('diterima', 'diterima_sebagian') THEN
        IF v_all_received THEN
            v_current_status := 'diterima';
        ELSE
            v_current_status := 'diterima_sebagian';
        END IF;
        
        UPDATE purchase_orders SET status = v_current_status WHERE id = p_po_id;
    END IF;

    -- 9. Terapkan saldo baru berdasarkan pembayaran baru (uang keluar)
    IF v_new_payment > 0 THEN
        IF v_new_method IN ('transfer', 'card', 'qris') AND v_new_bank IS NOT NULL THEN
            UPDATE bank_accounts SET balance = balance - v_new_payment, updated_at = NOW() WHERE id = v_new_bank;
        ELSIF v_new_method = 'cash' THEN
            UPDATE cash_balances SET balance = balance - v_new_payment, updated_at = NOW() WHERE type = 'cash';
        END IF;
    END IF;

    -- 10. Terapkan ke supplier baru
    IF v_new_supplier IS NOT NULL THEN
        UPDATE suppliers
        SET total_purchases = COALESCE(total_purchases, 0) + v_new_total,
            total_debt = COALESCE(total_debt, 0) + GREATEST(0, (v_new_total - v_new_payment)),
            updated_at = NOW()
        WHERE id = v_new_supplier;
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;
