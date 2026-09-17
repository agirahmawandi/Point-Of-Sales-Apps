-- ============================================================
-- FREMA-POS: Laporan Stok Barang (Pembelian vs Penjualan)
-- ============================================================

DROP FUNCTION IF EXISTS get_stock_report();

CREATE OR REPLACE FUNCTION get_stock_report()
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    sku TEXT,
    total_purchased INTEGER,
    total_sold INTEGER,
    current_stock INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH purchased AS (
        SELECT poi.product_id, SUM(poi.received_quantity) as qty
        FROM purchase_order_items poi
        GROUP BY poi.product_id
    ),
    sold AS (
        SELECT ti.product_id, SUM(ti.quantity) as qty
        FROM transaction_items ti
        JOIN transactions t ON t.id = ti.transaction_id
        WHERE t.status IN ('success', 'sukses')
        GROUP BY ti.product_id
    )
    SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.sku,
        COALESCE(purchased.qty, 0)::INTEGER AS total_purchased,
        COALESCE(sold.qty, 0)::INTEGER AS total_sold,
        p.stock::INTEGER AS current_stock
    FROM products p
    LEFT JOIN purchased ON purchased.product_id = p.id
    LEFT JOIN sold ON sold.product_id = p.id
    ORDER BY p.name ASC;
END;
$$;
