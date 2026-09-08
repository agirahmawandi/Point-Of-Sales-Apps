# Task Backend — Frema-pos Supabase Integration
> Update file ini setiap kali ada progress. Gunakan: `[ ]` belum | `[/]` sedang | `[x]` selesai

---

## ✅ PHASE 0 — Setup & Infrastruktur

- [x] Buat project di Supabase (Frema-pos)
- [x] Jalankan SQL migration (19 tabel)
- [x] Install `@supabase/supabase-js`
- [x] Buat file `.env.local` dengan API credentials
- [x] Buat `src/lib/supabase.ts` (client + TypeScript types)
- [x] Tambahkan `initAuth` di `App.tsx`
- [x] GRANT permissions untuk role `authenticated`
- [x] Fix RLS policy (menggunakan `auth.uid() IS NOT NULL`)

---

## ✅ PHASE 1 — Auth Module

- [x] Buat user admin di Supabase Auth
- [x] Sync user ke tabel `profiles`
- [x] Update `authStore.ts` → login async dengan Supabase Auth
- [x] Fetch profile dari tabel `profiles` saat login
- [x] Fallback ke `user_metadata` jika DB read gagal
- [x] Update `LoginPage.tsx` → async submit handler
- [x] Logout via `supabase.auth.signOut()`
- [x] Role-based menu (admin vs kasir) berfungsi

---

## 🔲 PHASE 2 — Products Module

### Kategori
- [ ] Fetch semua kategori dari tabel `categories`
- [ ] Tambah kategori baru → INSERT ke `categories`
- [ ] Edit kategori → UPDATE `categories`
- [ ] Hapus kategori → DELETE `categories`
- [ ] Hitung `productCount` dari query JOIN

### Produk
- [ ] Fetch semua produk dari tabel `products` (dengan join kategori)
- [ ] Tambah produk baru → INSERT ke `products`
- [ ] Edit produk → UPDATE `products`
- [ ] Soft-delete produk → UPDATE `is_active = false`
- [ ] Search & filter produk (by kategori, nama, SKU)
- [ ] Update stok manual (stock opname)
- [ ] Validasi SKU unik saat create/edit

### Refactor Store
- [ ] Hapus mock data dari `productStore.ts`
- [ ] Ganti semua state dengan Supabase queries
- [ ] Tambah loading & error state
- [ ] Pastikan `ProductListPage`, `ProductFormPage`, `CategoryPage` berfungsi

---

## 🔲 PHASE 3 — Customer Module

- [ ] Fetch semua pelanggan dari tabel `customers`
- [ ] Tambah pelanggan → INSERT ke `customers`
- [ ] Edit pelanggan → UPDATE `customers`
- [ ] Hapus pelanggan → DELETE `customers`
- [ ] Search by nama/telepon
- [ ] Filter by platform
- [ ] Refactor `customerStore.ts` → Supabase queries

---

## 🔲 PHASE 4 — Transaction / POS Module

### Checkout (cartStore)
- [ ] Saat checkout: INSERT ke `transactions`
- [ ] INSERT semua items ke `transaction_items`
- [ ] Decrement stok produk per item terjual
- [ ] Update `cash_balances` atau `bank_accounts` sesuai metode bayar
- [ ] Update stats customer (`total_transactions`, `total_spent`)
- [ ] Generate invoice number unik
- [ ] Handle error atomik (rollback jika gagal)

### Transaction History (transactionStore)
- [ ] Fetch list transaksi dari `transactions` + `transaction_items`
- [ ] Filter by tanggal, kasir, metode pembayaran, status
- [ ] Fetch detail transaksi by ID
- [ ] Refund/batal transaksi (update status + restore stok)

---

## 🔲 PHASE 5 — Purchase Order Module

### Supplier
- [ ] Fetch semua supplier dari `suppliers`
- [ ] CRUD supplier
- [ ] Update `total_purchases` & `total_debt`

### Purchase Order
- [ ] Fetch semua PO dari `purchase_orders` + `purchase_order_items`
- [ ] Buat PO baru → INSERT
- [ ] Edit PO → UPDATE
- [ ] Penerimaan barang → UPDATE `received_quantity` + stok produk
- [ ] Update status PO (draft → dikirim → diterima)
- [ ] Pembayaran PO → UPDATE `paid_amount` & `payment_status`
- [ ] Refactor `purchaseStore.ts` → Supabase queries

---

## 🔲 PHASE 6 — Expense Module

- [ ] Fetch kategori pengeluaran dari `expense_categories`
- [ ] CRUD kategori pengeluaran
- [ ] Fetch pengeluaran dari `expenses`
- [ ] Tambah pengeluaran → INSERT + update saldo
- [ ] Edit & hapus pengeluaran
- [ ] Filter by kategori, tanggal, metode
- [ ] Refactor `expenseStore.ts` → Supabase queries

---

## 🔲 PHASE 7 — Finance Module

### Bank Accounts
- [ ] Fetch rekening bank dari `bank_accounts`
- [ ] CRUD rekening bank

### Balance & Transfers
- [ ] Fetch saldo kas & QRIS dari `cash_balances`
- [ ] Fetch transfer saldo dari `balance_transfers`
- [ ] Tambah transfer → INSERT + update saldo kedua arah

### Investor
- [ ] Fetch investor dari `investors`
- [ ] CRUD investor
- [ ] Tambah setoran modal → INSERT `investor_deposits` + update `total_invested`

### Profit Share
- [ ] Fetch bagi hasil dari `profit_shares` + `profit_share_distributions`
- [ ] Tambah bagi hasil → INSERT + INSERT distributions + update `total_withdrawn`

### Refactor
- [ ] Refactor `financeStore.ts` → Supabase queries

---

## 🔲 PHASE 8 — Settings Module

- [ ] Fetch pengaturan toko dari `store_settings`
- [ ] Update profil toko → UPDATE `store_settings`
- [ ] Update pajak default → UPDATE `store_settings`
- [ ] CRUD rekening bank (sudah di Finance, share logic)
- [ ] User management: fetch, buat, edit, hapus user
- [ ] Refactor `settingsStore.ts` → Supabase queries

---

## 🔲 PHASE 9 — Dashboard & Reports

- [ ] Dashboard: omzet, HPP, laba hari ini dari `transactions`
- [ ] Dashboard: tren penjualan 30 hari terakhir
- [ ] Dashboard: top 5 produk terlaris
- [ ] Dashboard: peringatan stok minimum
- [ ] Dashboard: saldo kas & bank real-time
- [ ] Laporan Penjualan → query `transactions` + filter
- [ ] Laporan Pembelian → query `purchase_orders` + filter
- [ ] Laporan Inventaris → query `products` dengan stok info
- [ ] Laporan Pengeluaran → query `expenses` + filter
- [ ] Laporan Laba Rugi → kalkulasi dari semua modul
- [ ] Refactor `dashboardStore.ts` → Supabase queries

---

## 🔲 PHASE 10 — Final & Deploy

- [ ] Hapus semua `console.log` debug
- [ ] Tambah error handling global (toast notifications)
- [ ] Testing semua CRUD di setiap modul
- [ ] Buat user kasir untuk testing role kasir
- [ ] Deploy ke Vercel
- [ ] Set environment variables di Vercel
- [ ] Testing di production URL
- [ ] Commit & push final

---

## 📊 Progress Summary

| Phase | Modul | Status | Selesai |
|-------|-------|--------|---------|
| 0 | Setup & Infrastruktur | ✅ Done | 8/8 |
| 1 | Auth | ✅ Done | 8/8 |
| 2 | Products | 🔲 Todo | 0/16 |
| 3 | Customer | 🔲 Todo | 0/6 |
| 4 | Transaction / POS | 🔲 Todo | 0/11 |
| 5 | Purchase Order | 🔲 Todo | 0/11 |
| 6 | Expense | 🔲 Todo | 0/7 |
| 7 | Finance | 🔲 Todo | 0/12 |
| 8 | Settings | 🔲 Todo | 0/6 |
| 9 | Dashboard & Reports | 🔲 Todo | 0/11 |
| 10 | Final & Deploy | 🔲 Todo | 0/8 |

**Total: 16/104 tasks selesai**

---

*Last updated: 2026-09-08*
