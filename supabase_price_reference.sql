-- ============================================================
-- FREMA-POS: Penambahan Kolom Acuan Harga Jual (Produk)
-- ============================================================

ALTER TABLE products
ADD COLUMN IF NOT EXISTS margin_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS packing_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS marketplace_fee_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS marketplace_price numeric DEFAULT 0;

-- Catatan:
-- Saat user mengupdate Margin / Biaya Packing, frontend akan menghitung 'selling_price' (Harga Jual) 
-- dan mengirimkannya bersamaan dengan update ini, sehingga tidak perlu trigger DB.
