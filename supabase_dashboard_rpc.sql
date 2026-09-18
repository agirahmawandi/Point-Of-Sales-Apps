-- File: supabase_dashboard_rpc.sql
-- Kopi dan jalankan script ini di Supabase Studio > SQL Editor

-- 1. RPC untuk mengambil ringkasan dashboard (Omzet, HPP, Expense) dalam satu rentang tanggal
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_start_date TIMESTAMPTZ, p_end_date TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_omzet NUMERIC := 0;
    v_hpp NUMERIC := 0;
    v_expense NUMERIC := 0;
    v_total_transactions INT := 0;
    v_low_stock_count INT := 0;
    v_piutang NUMERIC := 0;
    v_hutang NUMERIC := 0;
    v_write_offs NUMERIC := 0;
BEGIN
    -- Hitung Omzet dan Total Transaksi
    SELECT COALESCE(SUM(total), 0), COUNT(id)
    INTO v_omzet, v_total_transactions
    FROM transactions
    WHERE (created_at >= p_start_date AND created_at <= p_end_date)
      AND status IN ('success', 'sukses');

    -- Hitung HPP (menggabungkan transaction_items dengan produk jika perlu, atau dari buy_price di items)
    -- Asumsikan transaction_items memiliki buy_price dan quantity
    SELECT COALESCE(SUM(ti.quantity * COALESCE(ti.buy_price, p.buy_price, 0)), 0)
    INTO v_hpp
    FROM transactions t
    JOIN transaction_items ti ON t.id = ti.transaction_id
    JOIN products p ON ti.product_id = p.id
    WHERE (t.created_at >= p_start_date AND t.created_at <= p_end_date)
      AND t.status IN ('success', 'sukses');

    -- Hitung Total Pengeluaran
    SELECT COALESCE(SUM(amount), 0)
    INTO v_expense
    FROM expenses
    WHERE date >= p_start_date::DATE AND date <= p_end_date::DATE;

    -- Hitung Produk Low Stock
    SELECT COUNT(*)
    INTO v_low_stock_count
    FROM products
    WHERE stock <= min_stock AND is_active = true;

    -- Hitung Total Piutang (Penjualan Belum Dibayar) Global
    SELECT COALESCE(SUM(total - COALESCE(amount_paid, 0)), 0)
    INTO v_piutang
    FROM transactions
    WHERE payment_status = 'tertunda' AND status != 'batal';

    -- Hitung Total Hutang (Pembelian Belum Dibayar) Global
    SELECT COALESCE(SUM(total_amount - COALESCE(paid_amount, 0)), 0)
    INTO v_hutang
    FROM purchase_orders
    WHERE payment_status IN ('utang', 'sebagian') AND status != 'batal';

    -- Hitung Kerugian Produk Rusak (Write-offs)
    SELECT COALESCE(SUM(loss_amount), 0)
    INTO v_write_offs
    FROM product_write_offs
    WHERE date >= p_start_date AND date <= p_end_date;

    RETURN jsonb_build_object(
        'omzet', v_omzet,
        'hpp', v_hpp,
        'expense', v_expense + v_write_offs,
        'laba', v_omzet - v_hpp - v_expense - v_write_offs,
        'totalTransactions', v_total_transactions,
        'lowStockCount', v_low_stock_count,
        'piutang', v_piutang,
        'hutang', v_hutang
    );
END;
$$;


-- 2. RPC untuk Tren Penjualan & Laba Rugi per Bulan (12 Bulan Terakhir)
CREATE OR REPLACE FUNCTION get_monthly_revenue(p_months INT DEFAULT 12)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    WITH months AS (
        SELECT generate_series(
            date_trunc('month', NOW()) - (p_months - 1 || ' months')::INTERVAL,
            date_trunc('month', NOW()),
            '1 month'::INTERVAL
        ) AS month_start
    ),
    monthly_sales AS (
        SELECT 
            date_trunc('month', t.created_at) AS month_start,
            SUM(t.total) AS omzet,
            SUM(ti.quantity * COALESCE(ti.buy_price, p.buy_price, 0)) AS hpp
        FROM transactions t
        LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
        LEFT JOIN products p ON ti.product_id = p.id
        WHERE t.status IN ('success', 'sukses')
          AND t.created_at >= date_trunc('month', NOW()) - (p_months || ' months')::INTERVAL
        GROUP BY 1
    ),
    monthly_expenses AS (
        SELECT 
            date_trunc('month', date) AS month_start,
            SUM(amount) AS expense
        FROM expenses
        WHERE date >= (date_trunc('month', NOW()) - (p_months || ' months')::INTERVAL)::DATE
        GROUP BY 1
    ),
    monthly_write_offs AS (
        SELECT 
            date_trunc('month', date) AS month_start,
            SUM(loss_amount) AS write_off
        FROM product_write_offs
        WHERE date >= (date_trunc('month', NOW()) - (p_months || ' months')::INTERVAL)
        GROUP BY 1
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'month', to_char(m.month_start, 'Mon YYYY'),
            'date', m.month_start,
            'omzet', COALESCE(s.omzet, 0),
            'hpp', COALESCE(s.hpp, 0),
            'expense', COALESCE(e.expense, 0) + COALESCE(w.write_off, 0),
            'laba', COALESCE(s.omzet, 0) - COALESCE(s.hpp, 0) - COALESCE(e.expense, 0) - COALESCE(w.write_off, 0)
        ) ORDER BY m.month_start ASC
    ) INTO v_result
    FROM months m
    LEFT JOIN monthly_sales s ON m.month_start = s.month_start
    LEFT JOIN monthly_expenses e ON m.month_start = e.month_start
    LEFT JOIN monthly_write_offs w ON m.month_start = w.month_start;

    RETURN v_result;
END;
$$;


-- 3. RPC untuk Top 5 Produk Terlaris
CREATE OR REPLACE FUNCTION get_top_products(p_start_date TIMESTAMPTZ, p_end_date TIMESTAMPTZ, p_limit INT DEFAULT 5)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(row_to_json(t))
    INTO v_result
    FROM (
        SELECT 
            p.id,
            p.name,
            p.sku,
            SUM(ti.quantity) AS total_quantity,
            SUM(ti.subtotal) AS total_revenue
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        WHERE (t.created_at >= p_start_date AND t.created_at <= p_end_date)
          AND t.status IN ('success', 'sukses')
        GROUP BY p.id, p.name, p.sku
        ORDER BY total_quantity DESC
        LIMIT p_limit
    ) t;

    RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;
