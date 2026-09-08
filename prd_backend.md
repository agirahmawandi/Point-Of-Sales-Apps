# PRD Backend — Frema-pos Supabase Integration

## 🎯 Tujuan
Menghubungkan seluruh fitur frontend aplikasi POS **Frema Mart** yang sebelumnya menggunakan local state (Zustand + localStorage) ke database **Supabase** (PostgreSQL) secara penuh, sehingga data persisten, multi-user, dan production-ready.

---

## 📦 Tech Stack
| Layer | Teknologi |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| State Management | Zustand |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Client Library | `@supabase/supabase-js` |
| Deployment (rencana) | Vercel |

---

## 🗄️ Database Schema (19 Tabel)

```
profiles               → Data user & karyawan
store_settings         → Pengaturan toko
bank_accounts          → Rekening bank
categories             → Kategori produk
products               → Data produk & stok
customers              → Data pelanggan
transactions           → Transaksi penjualan
transaction_items      → Detail item per transaksi
suppliers              → Data supplier
purchase_orders        → Purchase Order pembelian
purchase_order_items   → Detail item per PO
expense_categories     → Kategori pengeluaran
expenses               → Data pengeluaran
investors              → Data investor
investor_deposits      → Setoran modal investor
profit_shares          → Data bagi hasil
profit_share_distributions → Distribusi bagi hasil
balance_transfers      → Transfer saldo antar kas
cash_balances          → Saldo kas & QRIS
```

---

## 🔐 Auth & Keamanan
- Supabase Auth sebagai identity provider
- Row Level Security (RLS) aktif di semua tabel
- GRANT permissions: `authenticated` role dapat SELECT, INSERT, UPDATE, DELETE
- Profile user disimpan di tabel `profiles` (id = auth.user.id)
- Role system: `admin` (akses penuh) | `kasir` (akses terbatas)

---

## 📋 Scope Integrasi Per Modul

### 1. Auth Module ✅ SELESAI
- Login dengan Supabase Auth (email + password)
- Logout & session persistence (initAuth)
- Profile fetch dari tabel `profiles`
- Role-based access (admin/kasir)
- RLS + GRANT permissions configured

---

### 2. Products Module
**Store:** `productStore.ts`
**Tabel:** `products`, `categories`

**Fitur:**
- CRUD Produk (create, read, update, soft-delete)
- CRUD Kategori produk
- Filter & search produk
- Update stok manual & otomatis via transaksi
- Stock opname

**Aturan Bisnis:**
- SKU harus unik
- Stok tidak boleh negatif
- Produk non-aktif tidak muncul di POS terminal
- `productCount` pada kategori dihitung dari query

---

### 3. Customer Module
**Store:** `customerStore.ts`
**Tabel:** `customers`

**Fitur:**
- CRUD Pelanggan
- Search by name/phone
- Auto-update `total_transactions` & `total_spent` saat transaksi
- Filter by platform (Offline, Shopee, Tokopedia, dll)

---

### 4. Transaction / POS Module
**Store:** `cartStore.ts`, `transactionStore.ts`
**Tabel:** `transactions`, `transaction_items`

**Fitur:**
- Simpan transaksi + items ke DB saat checkout
- Update stok produk otomatis (decrement)
- Update saldo kas/QRIS/bank otomatis
- Update stats customer
- Generate invoice number
- History transaksi dengan filter

**Aturan Bisnis:**
- Transaksi bersifat atomik
- Invoice format: `INV-YYYYMMDD-XXXX`
- Stok dipotong hanya saat status `sukses`

---

### 5. Purchase Order Module
**Store:** `purchaseStore.ts`
**Tabel:** `purchase_orders`, `purchase_order_items`, `suppliers`

**Fitur:**
- CRUD Supplier
- CRUD Purchase Order
- Penerimaan barang (update stok)
- Update status PO & payment tracking
- Update debt supplier

---

### 6. Expense Module
**Store:** `expenseStore.ts`
**Tabel:** `expenses`, `expense_categories`

**Fitur:**
- CRUD Kategori pengeluaran
- CRUD Pengeluaran
- Filter by kategori/tanggal/metode
- Update saldo kas/bank

---

### 7. Finance Module
**Store:** `financeStore.ts`
**Tabel:** `investors`, `investor_deposits`, `profit_shares`, `profit_share_distributions`, `balance_transfers`, `cash_balances`, `bank_accounts`

**Fitur:**
- CRUD Investor & setoran modal
- Bagi hasil & distribusi per investor
- Transfer saldo antar kas
- Manajemen rekening bank
- Real-time saldo kas & QRIS

---

### 8. Settings Module
**Store:** `settingsStore.ts`
**Tabel:** `store_settings`, `bank_accounts`

**Fitur:**
- Update profil toko & pajak default
- CRUD rekening bank
- User management (buat/edit/hapus user)

---

### 9. Dashboard & Reports Module
**Store:** `dashboardStore.ts`

**Fitur:**
- Omzet, HPP, Laba Bersih hari ini
- Tren penjualan (chart)
- Produk terlaris & peringatan stok
- Laporan Penjualan, Pembelian, Inventaris, Pengeluaran, Laba Rugi

---

## 🚫 Out of Scope (Fase Ini)
- Push notification
- Multi-branch / multi-outlet
- Barcode scanner hardware
- Loyalty point system
- Offline mode sync

---

## ✅ Definition of Done
Setiap modul dianggap selesai jika:
1. Data tersimpan & terbaca dari Supabase (bukan localStorage)
2. CRUD operations berjalan tanpa error
3. RLS tidak blocking operasi yang sah
4. Error handling ditampilkan ke user
5. Loading state ditampilkan saat fetch data
