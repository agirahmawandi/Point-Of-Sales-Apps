-- ==========================================
-- TABEL: product_write_offs
-- Tujuan: Menyimpan riwayat barang rusak/hilang
-- ==========================================
CREATE TABLE IF NOT EXISTS product_write_offs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    loss_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan RLS (Row Level Security) agar aman (opsional, sesuaikan dengan setting Supabase Anda)
ALTER TABLE product_write_offs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write for all users" ON product_write_offs FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- FUNGSI: create_write_off
-- Tujuan: Mencatat barang rusak dan memotong stok fisik secara atomik
-- ==========================================
CREATE OR REPLACE FUNCTION create_write_off(
    p_product_id UUID,
    p_quantity NUMERIC,
    p_reason TEXT,
    p_loss_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_stock NUMERIC;
    v_new_write_off_id UUID;
BEGIN
    -- 1. Ambil stok saat ini dan lock baris produk
    SELECT stock INTO v_current_stock FROM products WHERE id = p_product_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produk tidak ditemukan';
    END IF;

    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'Stok tidak mencukupi untuk memotong % item. Stok saat ini: %', p_quantity, v_current_stock;
    END IF;

    -- 2. Kurangi stok produk
    UPDATE products 
    SET stock = stock - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- 3. Catat ke tabel product_write_offs
    INSERT INTO product_write_offs (
        product_id, quantity, reason, loss_amount
    ) VALUES (
        p_product_id, p_quantity, p_reason, p_loss_amount
    ) RETURNING id INTO v_new_write_off_id;

    -- Kembalikan ID yang baru dibuat (sukses)
    RETURN jsonb_build_object('success', true, 'write_off_id', v_new_write_off_id);
END;
$$;
