-- ==========================================
-- FUNGSI: reset_all_data
-- Tujuan: Menghapus seluruh data transaksi, pembelian, pengeluaran dan mereset stok ke 0
-- ==========================================
CREATE OR REPLACE FUNCTION reset_all_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Hapus isi items terlebih dahulu untuk menghindari Foreign Key Constraint error (jika ON DELETE CASCADE belum diset)
  DELETE FROM transaction_items WHERE true;
  DELETE FROM transactions WHERE true;
  
  -- 2. Hapus pesanan pembelian
  DELETE FROM purchase_order_items WHERE true;
  DELETE FROM purchase_orders WHERE true;
  
  -- 3. Hapus semua pengeluaran
  DELETE FROM expenses WHERE true;
  
  -- 4. Reset stok semua produk menjadi 0 dan hapus riwayat produk rusak
  DELETE FROM product_write_offs WHERE true;
  UPDATE products SET stock = 0 WHERE true;
  
  -- 5. Reset akumulasi belanja pelanggan
  UPDATE customers SET total_transactions = 0, total_spent = 0 WHERE true;
  
  -- 6. Reset akumulasi pembelian dan hutang pemasok (supplier)
  UPDATE suppliers SET total_purchases = 0, total_debt = 0 WHERE true;
  
  -- 7. Reset Data Keuangan (Kas, Pindah Saldo, Setoran Investor, Bagi Hasil)
  DELETE FROM balance_transfers WHERE true;
  DELETE FROM investor_deposits WHERE true;
  DELETE FROM profit_share_distributions WHERE true;
  DELETE FROM profit_shares WHERE true;
  DELETE FROM cash_mutations WHERE true;
  UPDATE investors SET total_invested = 0, total_withdrawn = 0 WHERE true;
  UPDATE cash_balances SET balance = 0 WHERE true;
  UPDATE bank_accounts SET balance = 0 WHERE true;
END;
$$;
