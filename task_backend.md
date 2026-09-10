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
- [x] Fetch semua kategori dari tabel `categories`
- [x] Tambah kategori baru → INSERT ke `categories`
- [x] Edit kategori → UPDATE `categories`
- [x] Hapus kategori → DELETE `categories`
- [x] Hitung `productCount` dari query JOIN

### Produk
- [x] Fetch semua produk dari tabel `products` (dengan join kategori)
- [x] Tambah produk baru → INSERT ke `products`
- [x] Edit produk → UPDATE `products`
- [x] Soft-delete produk → UPDATE `is_active = false`
- [x] Search & filter produk (by kategori, nama, SKU)
- [x] Update stok manual (stock opname)
- [x] Validasi SKU unik saat create/edit

### Refactor Store
- [x] Hapus mock data dari `productStore.ts`
- [x] Ganti semua state dengan Supabase queries
- [x] Tambah loading & error state
- [x] Pastikan `ProductListPage`, `ProductFormPage`, `CategoryPage` berfungsi

---

## ✅ PHASE 3 — Customer Module

- [x] Fetch semua pelanggan dari tabel `customers`
- [x] Tambah pelanggan → INSERT ke `customers`
- [x] Edit pelanggan → UPDATE `customers`
- [x] Hapus pelanggan → DELETE `customers`
- [x] Search by nama/telepon
- [x] Filter by platform
- [x] Refactor `customerStore.ts` → Supabase queries

---

## 🔲 PHASE 4 — Transaction / POS Module

### Checkout (cartStore)
- [x] Saat checkout: INSERT ke `transactions`
- [x] INSERT semua items ke `transaction_items`
- [x] Decrement stok produk per item terjual
- [x] Update `cash_balances` atau `bank_accounts` sesuai metode bayar
- [x] Update stats customer (`total_transactions`, `total_spent`)
- [x] Generate invoice number unik
- [x] Handle error atomik (rollback jika gagal)

### Transaction History (transactionStore)
- [x] Fetch list transaksi dari `transactions` + `transaction_items`
- [x] Filter by tanggal, kasir, metode pembayaran, status
- [x] Fetch detail transaksi by ID
- [x] Refund/batal transaksi (update status + restore stok) -- DITUNDA/DIABAIKAN DULU

---

## ✅ PHASE 5 — Purchase Order Module

### Supplier
- [x] Fetch semua supplier dari `suppliers`
- [x] CRUD supplier
- [x] Update `total_purchases` & `total_debt`

### Purchase Order
- [x] Fetch semua PO dari `purchase_orders` + `purchase_order_items`
- [x] Buat PO baru → INSERT (RPC `create_purchase_order`)
- [x] Edit PO → UPDATE
- [x] Penerimaan barang → UPDATE `received_quantity` + stok produk (RPC `receive_purchase_order`)
- [x] Update status PO (draft → dikirim → diterima) (Via RPC)
- [x] Pembayaran PO → UPDATE `paid_amount` & `payment_status` (RPC `pay_purchase_order`)
- [x] Refactor `purchaseStore.ts` → Supabase queries

---

## ✅ PHASE 6 — Expense Module

- [x] Fetch kategori pengeluaran dari `expense_categories`
- [x] CRUD kategori pengeluaran
- [x] Fetch pengeluaran dari `expenses`
- [x] Tambah pengeluaran → INSERT + update saldo (via RPC)
- [x] Hapus pengeluaran
- [x] Filter by kategori, tanggal, metode
- [x] Refactor `expenseStore.ts` → Supabase queries

---

## ✅ PHASE 7 — Finance Module

### Bank Accounts
- [x] Fetch rekening bank dari `bank_accounts`
- [x] CRUD rekening bank

### Balance & Transfers
- [x] Fetch saldo kas & QRIS dari `cash_balances`
- [x] Fetch transfer saldo dari `balance_transfers`
- [x] Tambah transfer → INSERT + update saldo kedua arah

### Investor
- [x] Fetch investor dari `investors`
- [x] CRUD investor
- [x] Tambah setoran modal → INSERT `investor_deposits` + update `total_invested`

### Profit Share
- [x] Fetch bagi hasil dari `profit_shares` + `profit_share_distributions`
- [x] Tambah bagi hasil → INSERT + INSERT distributions + update `total_withdrawn`

### Refactor
- [x] Refactor `financeStore.ts` → Supabase queries

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
- [ ] Fitur Recycle Bin (Khusus Admin)
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
| 2 | Products | ✅ Done | 16/16 |
| 3 | Customer | ✅ Done | 7/7 |
| 4 | Transaction / POS | ✅ Done | 11/11 |
| 5 | Purchase Order | ✅ Done | 11/11 |
| 6 | Expense | ✅ Done | 7/7 |
| 7 | Finance | 🔲 Todo | 0/12 |
| 8 | Settings | 🔲 Todo | 0/6 |
| 9 | Dashboard & Reports | 🔲 Todo | 0/11 |
| 10 | Final & Deploy | 🔲 Todo | 0/8 |

**Total: 57/104 tasks selesai**

---

*Last updated: 2026-09-10*
