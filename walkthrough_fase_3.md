# Walkthrough Fase 3: Pembelian (Purchases) & Pengeluaran (Expenses)

Pada Fase 3 ini, kita telah menyelesaikan implementasi modul back-office krusial untuk melacak arus kas keluar, mulai dari kulakan barang ke *supplier* hingga bayar beban operasional harian.

## 🚚 Modul Pembelian (Purchases)

Modul pembelian telah dilengkapi dengan alur kerja terstruktur untuk menangani pesanan barang:

### 1. Manajemen Pemasok (Supplier)
- **Komponen:** `SupplierPage.tsx`
- **Fitur:** Pencarian, penambahan, edit, dan penghapusan pemasok. Tabel secara otomatis melacak total akumulasi pembelian dan sisa hutang ke masing-masing pemasok.

### 2. Purchase Orders (Daftar & Form)
- **Komponen:** `PurchaseListPage.tsx` dan `PurchaseFormPage.tsx`
- **Fitur:** 
  - Anda dapat membuat PO baru, memilih *supplier*, dan menambahkan item produk secara dinamis. Subtotal dan total akan terkalkulasi otomatis.
  - PO dapat disimpan sebagai "Draft" atau langsung dikirim ("Dikirim").
  - Status pesanan terbagi menjadi: Draft, Dikirim, Parsial, Selesai, atau Batal, dilengkapi *badge* warna-warni untuk identifikasi cepat.

### 3. Penerimaan Barang (Receiving Goods)
- **Komponen:** `ReceiveGoodsPage.tsx`
- **Fitur:** 
  - Saat barang tiba (PO berstatus "Dikirim"), Anda dapat menginput jumlah fisik yang diterima menggunakan tabel verifikasi kuantitas.
  - Tabel secara visual membedakan *item* yang jumlah terimanya kurang/berlebih dengan indikator warna.
  - **Integrasi Stok:** Saat barang diterima, stok produk di menu "Produk & Stok" akan bertambah secara otomatis!

---

## 💰 Modul Pengeluaran (Expenses)

Modul ini mencatat beban operasional harian selain HPP (Harga Pokok Penjualan).

### 1. Kategori Beban
- **Komponen:** `ExpenseCategoryPage.tsx`
- **Fitur:** Menambah dan mengedit kategori pengeluaran (misal: Listrik, Gaji, Sewa, dsb.) lengkap dengan ikon *emoji* kustom untuk mempermanis antarmuka.

### 2. Catat Pengeluaran Operasional
- **Komponen:** `ExpenseListPage.tsx`
- **Fitur:** 
  - Tabel daftar pengeluaran, lengkap dengan filter (visual) dan indikator metode bayar.
  - Form pencatatan cepat dengan pilihan metode bayar (Tunai, Transfer, dll) dan fitur simulasi unggah (*upload*) bukti transfer/nota dalam bentuk interaksi UI *dropzone*.

## 🔧 Integrasi Route
Rute placeholder yang sebelumnya kosong (`/purchases`, `/expenses`, dll) kini sudah terhubung penuh ke halaman-halaman yang dibuat. Anda dapat langsung menavigasikannya lewat Sidebar di sebelah kiri.

> [!TIP]
> **Cara Menguji:**
> Coba buat satu PO baru di menu Pembelian, lalu simpan & kirim. Setelah itu, buka kembali PO tersebut dan klik **"Terima Barang"**. Konfirmasi barang datang, dan periksa di menu **Produk** -> **Daftar Produk** bahwa stok produk tersebut sudah otomatis bertambah!
