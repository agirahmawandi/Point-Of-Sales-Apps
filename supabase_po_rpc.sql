-- ============================================================
-- FREMA-POS: Purchase Order RPCs
-- ============================================================

-- 1. RPC untuk Membuat PO Baru (beserta itemnya) secara atomik
CREATE OR REPLACE FUNCTION create_purchase_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_po_id UUID;
    v_po_number TEXT;
    v_item JSONB;
    v_total NUMERIC;
BEGIN
    v_total := (payload->>'total_amount')::NUMERIC;
    
    -- Insert header PO
    INSERT INTO purchase_orders (
        po_number,
        supplier_id,
        total_amount,
        status,
        payment_status,
        due_date,
        notes
    ) VALUES (
        payload->>'po_number',
        NULLIF(payload->>'supplier_id', '')::UUID,
        v_total,
        payload->>'status',
        'utang',
        NULLIF(payload->>'due_date', '')::DATE,
        payload->>'notes'
    ) RETURNING id, po_number INTO v_po_id, v_po_number;

    -- Insert Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        INSERT INTO purchase_order_items (
            purchase_order_id,
            product_id,
            product_name,
            sku,
            quantity,
            received_quantity,
            buy_price,
            subtotal
        ) VALUES (
            v_po_id,
            (v_item->>'product_id')::UUID,
            v_item->>'product_name',
            v_item->>'sku',
            (v_item->>'quantity')::INTEGER,
            0,
            (v_item->>'buy_price')::NUMERIC,
            (v_item->>'subtotal')::NUMERIC
        );
    END LOOP;

    -- Update supplier total purchases (dan total debt karena belum dibayar)
    IF payload->>'supplier_id' IS NOT NULL AND payload->>'supplier_id' != '' THEN
        UPDATE suppliers
        SET total_purchases = COALESCE(total_purchases, 0) + v_total,
            total_debt = COALESCE(total_debt, 0) + v_total,
            updated_at = NOW()
        WHERE id = (payload->>'supplier_id')::UUID;
    END IF;

    RETURN jsonb_build_object('success', true, 'po_id', v_po_id, 'po_number', v_po_number);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Gagal membuat PO: %', SQLERRM;
END;
$$;


-- 2. RPC untuk Menerima Barang (Goods Receipt) & Tambah Stok
CREATE OR REPLACE FUNCTION receive_purchase_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_po_id UUID;
    v_item JSONB;
    v_qty_received INTEGER;
    v_product_id UUID;
    v_all_received BOOLEAN := TRUE;
    v_current_status TEXT;
BEGIN
    v_po_id := (payload->>'po_id')::UUID;

    FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_qty_received := (v_item->>'qty_received')::INTEGER;

        IF v_qty_received > 0 THEN
            -- Update received_quantity di item
            UPDATE purchase_order_items
            SET received_quantity = received_quantity + v_qty_received
            WHERE purchase_order_id = v_po_id AND product_id = v_product_id;

            -- Tambah stok di inventaris
            UPDATE products
            SET stock = stock + v_qty_received,
                updated_at = NOW()
            WHERE id = v_product_id;
        END IF;
    END LOOP;

    -- Cek apakah semua barang sudah diterima penuh
    IF EXISTS (
        SELECT 1 FROM purchase_order_items 
        WHERE purchase_order_id = v_po_id 
        AND received_quantity < quantity
    ) THEN
        v_all_received := FALSE;
    END IF;

    -- Update status PO
    IF v_all_received THEN
        v_current_status := 'diterima';
    ELSE
        v_current_status := 'diterima_sebagian';
    END IF;

    UPDATE purchase_orders
    SET status = v_current_status,
        updated_at = NOW()
    WHERE id = v_po_id;

    RETURN jsonb_build_object('success', true, 'status', v_current_status);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Gagal memproses penerimaan barang: %', SQLERRM;
END;
$$;


-- 3. RPC untuk Melakukan Pembayaran PO & Potong Saldo Bank
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
    
    v_total_amount NUMERIC;
    v_current_paid NUMERIC;
    v_new_paid NUMERIC;
    v_payment_status TEXT;
BEGIN
    v_po_id := (payload->>'po_id')::UUID;
    v_amount := (payload->>'amount')::NUMERIC;
    v_bank_id := NULLIF(payload->>'bank_account_id', '')::UUID;
    v_method := payload->>'payment_method';

    -- Ambil data PO saat ini
    SELECT total_amount, paid_amount, supplier_id 
    INTO v_total_amount, v_current_paid, v_supplier_id
    FROM purchase_orders 
    WHERE id = v_po_id;

    v_new_paid := COALESCE(v_current_paid, 0) + v_amount;

    -- Tentukan status pembayaran
    IF v_new_paid >= v_total_amount THEN
        v_payment_status := 'lunas';
    ELSIF v_new_paid > 0 THEN
        v_payment_status := 'sebagian';
    ELSE
        v_payment_status := 'utang';
    END IF;

    -- Update PO
    UPDATE purchase_orders
    SET paid_amount = v_new_paid,
        payment_status = v_payment_status,
        payment_method = v_method,
        bank_account_id = v_bank_id,
        updated_at = NOW()
    WHERE id = v_po_id;

    -- Potong saldo bank jika dibayar dari rekening bank
    IF v_bank_id IS NOT NULL AND v_method IN ('transfer', 'card', 'qris') THEN
        UPDATE bank_accounts
        SET balance = balance - v_amount,
            updated_at = NOW()
        WHERE id = v_bank_id;
    END IF;
    
    -- Kasus pembayaran tunai (jika ada tabel kas, potong kas, jika belum, skip atau asumsikan kas di cash_balances)
    IF v_method = 'cash' THEN
        -- Cek apakah tabel cash_balances ada record 'cash'
        IF EXISTS (SELECT 1 FROM cash_balances WHERE type = 'cash') THEN
            UPDATE cash_balances
            SET balance = balance - v_amount,
                updated_at = NOW()
            WHERE type = 'cash';
        END IF;
    END IF;

    -- Kurangi hutang supplier
    IF v_supplier_id IS NOT NULL THEN
        UPDATE suppliers
        SET total_debt = GREATEST(0, total_debt - v_amount),
            updated_at = NOW()
        WHERE id = v_supplier_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'payment_status', v_payment_status);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Gagal memproses pembayaran PO: %', SQLERRM;
END;
$$;
