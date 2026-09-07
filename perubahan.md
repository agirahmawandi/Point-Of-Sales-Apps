# Log Perubahan di Luar Implementation Plan (Desktop Optimization)

File ini mencatat penyesuaian UI/UX dan alur kerja yang dilakukan di luar dari rancangan awal `implementation_plan.md`, dengan fokus utama pada **Optimasi Tampilan PC/Desktop**.

## 1. Optimasi Navigasi Sidebar (Desktop)
- **Penambahan Ikon Submenu**: Semua item submenu (seperti Daftar Produk, Kategori, Stok Opname, dll) kini memiliki ikon masing-masing yang spesifik. Hal ini bertujuan agar tata letak (alignment) ikon dari menu utama hingga submenu sejajar sempurna secara vertikal (pixel-perfect) pada mode Desktop.
- **Dropdown Menu pada Mode Collapsed**: Pada mode sidebar tertutup (collapsed), mengklik ikon menu utama yang memiliki submenu kini akan membuka **Dropdown Popover** (menggunakan Radix UI). Ini adalah standar aplikasi desktop modern, menggantikan perilaku sebelumnya yang memaksa navigasi langsung atau mengharuskan sidebar dibuka penuh.
- **State Aktif Pintar**: Ikon menu di mode collapsed akan tetap ter-highlight biru (aktif) meskipun user sedang berada di dalam halaman submenunya.
- **Redesain Footer Sidebar**: Jarak antara Avatar profil dan tombol Logout dirapatkan dan diberi separator tipis agar proporsional pada desktop. Tombol expand sidebar dipindahkan secara fungsional dengan memanfaatkan ikon logo Toko `🏪`.

## 2. Pembersihan Redundansi TopBar (Desktop)
- **Menyembunyikan Judul Ganda**: Judul halaman (breadcrumbs) di TopBar disembunyikan pada layar desktop karena setiap halaman sudah memiliki Header Page (`h1`) sendiri. (Hanya muncul di Mobile).
- **Menyembunyikan Pencarian Global Dummy**: Kotak pencarian "Cari... Ctrl+K" di TopBar disembunyikan pada PC agar tidak membingungkan atau bentrok dengan kotak pencarian spesifik (seperti pencarian produk) yang ada di dalam halaman.
- **Menyembunyikan Profil Ganda**: Menu dropdown profil user di pojok kanan atas disembunyikan pada layar desktop, karena fitur profil dan logout sudah tersedia paten di bagian bawah Sidebar (standar layout dashboard desktop modern).

## 3. Fitur Stok Opname (Fase 2)
- Disepakati menggunakan pendekatan **Stok Opname Sederhana** (Simple version) dibanding versi audit kompleks. Halaman ini langsung menampilkan seluruh produk beserta stok sistem, lalu kasir/admin tinggal memasukkan angka stok fisik secara *inline* pada tabel, menghitung selisih otomatis, dan menyimpannya secara langsung ke sistem.

## 4. Keputusan "Desktop First"
- Diputuskan untuk sementara waktu menunda (mengabaikan) penyesuaian tata letak responsif untuk HP (Smartphone) dan Tablet. Pengembangan kini difokuskan 100% untuk membuat layout desktop / PC (layar lebar) optimal, padat data, dan fungsional terlebih dahulu.

## 5. Pembaruan Desain Antarmuka (UI/UX Refactoring)
- **Halaman Login**: Mendesain ulang struktur dan tampilan halaman `LoginPage.tsx` menggunakan palet warna "Professional Navy" (`#131b2e` dan `#3755c3`), penambahan *badge* status terminal kasir, desain input *floating/active state* yang lebih interaktif, dan *footer* hak cipta, sesuai dengan referensi tata letak yang diinginkan pengguna. Logika fungsi React Hook Form dan Zustand Auth dipertahankan.
- **Dasbor Komprehensif (Dashboard Page)**: 
  - **Sidebar & TopBar**: Mengimplementasikan *dark theme* untuk `Sidebar.tsx` dan struktur *breadcrumbs* + informasi tanggal & *alerts* untuk `TopBar.tsx`.
  - **Grid Layout**: Merestrukturisasi `DashboardPage.tsx` menjadi sistem *grid* yang komprehensif, mencakup bagian `Ribbon` (peringatan operasional & *shift*), 4 KPI Cards (Omzet, HPP, Laba, Peringatan Stok), 7:5 rasio *grid* (Tren Penjualan & Produk Terlaris), dan 5:7 rasio *grid* (Ringkasan Arus Kas & Riwayat Transaksi).
  - **Custom Components**: Mengubah `TopProductsChart` dan `CashFlowChart` dari grafik bawaan *Recharts* menjadi *custom list/summary UI* HTML sesuai referensi spesifik pengguna, mempertahankan estetika tampilan modern.

## 6. Penyempurnaan Tampilan (UI/UX Polish) & Branding
- **Sidebar Desktop Statis**: Menghapus fitur *toggle/collapse* untuk navigasi Sidebar di mode Desktop. Kini Sidebar diatur statis dengan lebar absolut `280px`, tata letak presisi, ikon tanpa garis tepi, dan warna (Navi & Biru) yang persis meniru referensi gambar 1:1.
- **Pembaruan Sistem Tipografi (Design System)**: Mengubah dan menstandarisasi *font* seluruh web melalui `globals.css`. **Montserrat** digunakan untuk tajuk (Headings `h1` - `h6`), judul *brand*, dan *Key Stat Headers*. **Inter** digunakan untuk *Body Text*, label *form*, dan kontrol UI.
- **Pembaruan Merek (Re-branding)**: Mengubah penyebutan aplikasi dan nama toko menjadi **"Dreamfresh"** secara seragam di `Sidebar.tsx`, `LoginPage.tsx` (termasuk *footer* hak cipta), serta pada struk fisik cetak di komponen penerimaan kasir (`ReceiptPage.tsx`).

---

## 7. Fase 3 — Modul Pembelian (Purchase Orders)

### Store & Types
- **`purchaseStore.ts`** (baru): Zustand store dengan middleware `persist` (localStorage `pos-purchase-storage`). Mengelola data *Supplier* dan *Purchase Order* (PO) beserta semua aksi CRUD-nya. Dilengkapi data *dummy* awal untuk pemasok dan PO sampel.
- **`/src/types/purchase.ts`** (baru): Mendefinisikan interface `Supplier`, `PurchaseOrderItem`, dan `PurchaseOrder` termasuk field `paymentStatus`, `paidAmount`, dan `paymentNotes`.

### Halaman Pembelian
- **`SupplierPage.tsx`** (baru): Halaman manajemen pemasok dengan fitur pencarian, tambah, edit, dan hapus. Tabel mencatat total pembelian dan sisa hutang per pemasok.
- **`PurchaseListPage.tsx`** (baru): Daftar semua PO dengan filter status, *badge* warna-warni, dan tombol aksi (Lihat Detail, Terima Barang, Batalkan).
- **`PurchaseFormPage.tsx`** (baru): Formulir pembuatan PO baru. Pilih *supplier*, tambah item produk dari katalog secara dinamis, kalkulasi subtotal dan total otomatis. PO dapat disimpan sebagai "Draft" atau langsung dikirim.
- **`ReceiveGoodsPage.tsx`** (baru): Halaman penerimaan barang. Jika diakses dari menu Sidebar (tanpa ID), menampilkan daftar PO yang menunggu penerimaan. Jika diakses dengan ID PO spesifik, menampilkan form verifikasi kuantitas barang fisik yang diterima. **Integrasi Stok:** Saat dikonfirmasi, kuantitas produk di `productStore` akan bertambah secara otomatis.
- **`PurchaseDetailPage.tsx`** (baru): Halaman detail PO dengan ringkasan item, status pengiriman, dan panel **hutang dagang** (Accounts Payable). Dilengkapi fitur pembayaran cicilan/lunas dan log riwayat pembayaran.

### Perbaikan Logika Akuntansi (⚠️ Koreksi Penting)
- **Pembayaran PO tidak lagi masuk ke modul Pengeluaran Operasional.** Sebelumnya terdapat kesalahan di mana membayar tagihan PO otomatis mencatat pengeluaran baru, yang menyebabkan HPP dihitung ganda.
- **Alur yang benar:** Pembayaran PO → Update hutang dagang (AP) saja → Barang terjual → HPP dihitung otomatis → Laba berkurang.

---

## 8. Fase 3 — Modul Pengeluaran (Expenses)

- **`expenseStore.ts`** (baru): Zustand store dengan `persist` (`pos-expense-storage`). Mengelola kategori beban dan catatan pengeluaran operasional.
- **`ExpenseCategoryPage.tsx`** (baru): CRUD kategori beban (listrik, gaji, sewa, dll.) dengan *emoji icon* kustom.
- **`ExpenseListPage.tsx`** (baru): Tabel daftar pengeluaran dengan form pencatatan cepat. Mendukung pilihan metode bayar dan fitur simulasi *upload* bukti pembayaran (UI *dropzone*).

---

## 9. Sinkronisasi Dashboard dengan Data Aktual

Seluruh komponen Dashboard kini membaca dari Zustand stores secara *real-time*, menggantikan data statis sebelumnya:

- **`KPICards.tsx`**: Menghitung **Omzet**, **HPP** (harga beli × qty terjual), **Laba Bersih** (Omzet − HPP − Beban Operasional hari ini), dan **Peringatan Stok** (produk dengan stok ≤ minimum) langsung dari `transactionStore`, `productStore`, dan `expenseStore`.
- **`RecentTransactions.tsx`**: Menampilkan 5 transaksi POS terbaru dari `transactionStore`, lengkap dengan link ke struk cetak.
- **`CashFlowChart.tsx`**: Menghitung arus kas masuk (dari POS hari ini) dan keluar (dari pengeluaran operasional hari ini) secara otomatis, termasuk komposisi metode pembayaran (Tunai, QRIS, Kartu).
- **`TopProductsChart.tsx`**: Mengagregasi volume dan omzet produk terlaris langsung dari riwayat item transaksi.
- **`RevenueChart.tsx`**: Membangun grafik tren omzet 7 hari terakhir dari riwayat `transactionStore`.
- **`DashboardPage.tsx`**: Peringatan *low stock* di ribbon kini dinamis. **Tombol Reset Transaksi** (bulat merah 🔴) ditambahkan di samping judul "Dashboard Overview", hanya terlihat oleh akun dengan role `admin`. Saat diklik, seluruh data transaksi akan dikosongkan (berguna untuk pengujian).

---

## 10. Peningkatan Fungsionalitas Terminal POS

- **`CartPanel.tsx`**: Quantity barang di keranjang kini dapat diinput secara **manual** (text field angka), bukan hanya lewat tombol `+` / `−`. Pengiriman nilai akan tetap melewati validasi stok maksimum.
- **`CartPanel.tsx`**: Penambahan **dropdown pilihan pajak** (0% atau 11% PPN) di bagian ringkasan pembayaran keranjang. Total tagihan dihitung ulang secara langsung saat pilihan diubah.
- **`globals.css`**: Penambahan kelas `.hide-spin-button` untuk menyembunyikan *spin button* bawaan browser pada `<input type="number">`.

---

## 11. Widget Saldo Metode Pembayaran di Dashboard

### Komponen Baru
- **`PaymentMethodSummary.tsx`** (baru — `src/features/dashboard/components/`): Widget informasi penerimaan harian berdasarkan metode pembayaran. Membaca data langsung dari `transactionStore` (hanya transaksi hari ini).

### Fitur Widget
- **3 Kartu Metode Bayar**: Menampilkan total penerimaan dan persentase untuk **QRIS** (biru), **Tunai/Kas** (hijau), dan **Debit/Kartu** (amber) secara terpisah dan visual.
- **Progress Bar Proporsi**: Bar horizontal tiga warna di atas kartu memvisualisasikan perbandingan ketiga metode secara sekilas.
- **Info Rekening Bank (Debit)**: Panel *accordion* (klik untuk expand) menampilkan daftar nomor rekening penerima transfer/EDC. Saat ini menggunakan data mock (BCA & Mandiri). Setiap rekening menampilkan nama bank, nomor rekening, dan nama pemilik.
- **Tombol "Tambah Rekening"** (dinonaktifkan): Placeholder interaktif yang menandakan fitur pengelolaan rekening akan tersedia di Fase 4 (Pengaturan → Metode Pembayaran). Tombol diberi label *"Segera Hadir"* dan tidak dapat diklik.
- **Catatan Pengembangan**: Teks petunjuk kecil di bawah panel rekening mengarahkan admin ke menu Pengaturan untuk mengelola rekening (roadmap Fase 4).

### Restrukturisasi Layout Dashboard
Penambahan widget ini mengubah susunan grid `DashboardPage.tsx` menjadi:
- **Baris 2** (sebelumnya: RevenueChart 7:5 + TopProductsChart): Kini menjadi **RevenueChart (8 kolom) + PaymentMethodSummary (4 kolom)**.
- **Baris 3** (sebelumnya: CashFlowChart 5:7 + RecentTransactions): Kini menjadi **TopProductsChart (4) + CashFlowChart (3) + RecentTransactions (5)** dalam satu baris.

### Catatan Arsitektur (untuk Fase 4)
Data rekening bank saat ini disimpan sebagai konstanta lokal (`MOCK_BANK_ACCOUNTS`) di dalam komponen. Pada Fase 4, data ini akan dipindahkan ke `settingsStore.ts` agar dapat dikelola secara dinamis melalui halaman *Pengaturan → Metode Pembayaran*.

---

## 12. Penyelarasan Tema Visual Antar-Halaman (Dashboard-Aligned Theme)

Penyelarasan desain secara menyeluruh dilakukan agar seluruh halaman aplikasi memiliki bahasa desain, palet warna, dan tipografi yang konsisten dengan halaman **Dashboard**:

### Desain & Palet Warna Standar Dashboard:
- **Teks Utama & Judul**: `#0b1c30` (Navy Pekat) dengan tipografi tegas Montserrat / Inter.
- **Teks Pendukung**: `#45464d` (Abu netral gelap) untuk deskripsi dan subtitle.
- **Header Tabel & Toolbar**: `#eff4ff` (Soft Blue) dengan label kolom `text-[11px] font-bold text-[#76777d] uppercase tracking-wider`.
- **Aksen & Tombol Utama**: `#3755c3` (Royal Navy Blue) dengan hover `#2a429c`, shadow halus, dan `rounded-xl`.
- **Badge & Chip Kategori**: `#e5eeff` / `#d3e4fe` dengan teks `#0b1c30`, badge status stok warna adaptif (`#ffdad6` untuk habis, `#e6f4ea` untuk aman).
- **Kontainer Kartu**: `bg-white rounded-xl shadow-sm border border-slate-100 p-6` (atau `p-5`).

### Modul dan Halaman yang Diperbarui:
1. **`PageContainer.tsx`**: Standarisasi header judul (`#0b1c30`), deskripsi (`#45464d`), serta penataan tombol aksi fleksibel.
2. **`DashboardPage.tsx`**: Menghapus padding ganda `p-4 md:p-6` agar sejajar presisi dengan halaman lain di dalam `MainLayout`.
3. **`TopBar.tsx`**: Perluasan breadcrumb dinamis otomatis untuk seluruh rute (`products`, `purchases`, `expenses`, `reports`, `settings`).
4. **Modul Produk (`ProductListPage.tsx`, `ProductFormPage.tsx`, `CategoryPage.tsx`, `StockOpnamePage.tsx`)**: Mengadopsi `PageContainer`, header tabel `#eff4ff`, chip kategori lembut `#e5eeff`, input focus ring `#3755c3`, dan tombol aksi `#3755c3`.
5. **Modul POS (`POSTerminalPage.tsx`, `ProductGrid.tsx`, `CartPanel.tsx`, `TransactionHistoryPage.tsx`, `ReceiptPage.tsx`)**: Header kasir `#131b2e`, search `#eff4ff`, chip filter `#3755c3`, dan tabel riwayat transaksi diselaraskan dengan `RecentTransactions` Dashboard.
6. **Modul Pembelian & Pengeluaran (`PurchaseListPage.tsx`, `PurchaseFormPage.tsx`, `ReceiveGoodsPage.tsx`, `SupplierPage.tsx`, `PurchaseDetailPage.tsx`, `ExpenseListPage.tsx`, `ExpenseCategoryPage.tsx`)**: Tabel berlatar `#eff4ff`, status pills modern, dan modal form seragam.
7. **Modul Laporan & Pengaturan (`PlaceholderPage.tsx`)**: Halaman placeholder seragam dengan ikon sparkle `#eff4ff` dan badge fitur `#3755c3`.

---

## 13. Otomatisasi Pembaruan Harga Beli Master Produk Saat PO Dibayarkan & Diterima

Fitur sinkronisasi otomatis harga beli master produk (`purchasePrice`, `buyPrice`, `costPrice`) saat Purchase Order berstatus **Lunas** dan barang **Diterima Fisik** (contoh: stok awal mie goreng harga beli Rp 2.800, dibuat PO baru dengan harga beli Rp 2.900, setelah PO dibayar dan barang diterima, harga beli di master produk otomatis menjadi Rp 2.900).

### Logika & Aturan Bisnis:
- Pembaruan harga beli master produk hanya terjadi apabila **kedua syarat terpenuhi**:
  1. Barang diterima secara fisik (`po.status === 'diterima'` atau terdapat item yang diverifikasi tiba `receivedQuantity > 0`).
  2. Tagihan PO telah berstatus lunas (`paymentStatus === 'lunas'`).

### Rincian Perubahan Kode:
1. **`productStore.ts`**:
   - Menambahkan method `updatePurchasePrice(id: string, newPrice: number)`.
   - Mengupdate properti `purchasePrice`, `buyPrice`, `costPrice`, dan `updatedAt` pada item produk di `products` array serta otomatis tersimpan ke `localStorage` (`pos-product-storage`).

2. **`ReceiveGoodsPage.tsx`**:
   - **Tabel Verifikasi**: Menampilkan komparasi harga beli jika harga PO berbeda dengan harga master saat ini (`Master lama: Rp 2.800 ➔ Baru: Rp 2.900`).
   - **Opsi Bayar Lunas di Tempat (COD/Tunai)**: Menambahkan checkbox `[x] Bayar Lunas Sekarang (COD/Tunai)` di panel kiri.
   - **Eksekusi Sinkronisasi**: Jika PO berstatus lunas (baik sudah lunas sebelumnya maupun dicentang lunas saat terima barang), sistem langsung mengeksekusi `updatePurchasePrice(item.productId, item.buyPrice)` untuk setiap item yang diterima dan memberikan pesan notifikasi konfirmasi.
   - Jika PO belum lunas, kuantitas stok tetap bertambah dan sistem memberikan catatan bahwa harga beli master akan diperbarui otomatis saat sisa tagihan dilunasi.

3. **`PurchaseDetailPage.tsx`**:
   - **Pelunasan Hutang Dagang**: Pada modal pembayaran hutang PO, ketika pelunasan mencapai 100% (`newPaymentStatus === 'lunas'`), sistem memeriksa apakah barang sudah pernah diterima (`po.status === 'diterima'` atau terdapat `receivedQuantity > 0`).
   - Jika barang sudah diterima, sistem langsung menyinkronkan seluruh harga beli item PO ke master data produk secara otomatis.
   - **Indikator Transparansi**: Pada tabel item pesanan, jika harga master saat ini berbeda dari harga PO, ditampilkan badge `Master saat ini: Rp ... ➔ PO Baru`.

4. **`PurchaseFormPage.tsx`**:
   - **Pilihan Status Pembayaran**: Menambahkan selector `Status Pembayaran Tagihan` (`Tempo / Hutang` vs `Langsung Lunas`).
   - **Tombol Aksi Tambahan**: Menambahkan tombol aksi `Langsung Selesai & Diterima` di samping `Simpan Draft` dan `Kirim PO ke Pemasok` untuk pengadaan barang langsung (belanja tunai/pasar). Jika dipilih bersamaan dengan `Langsung Lunas`, kuantitas stok bertambah dan harga beli master produk langsung diperbarui seketika.

---

## 14. Peningkatan Input Manual Pembayaran Tunai di Terminal POS

Peningkatan fleksibilitas dan kenyamanan kasir pada modal pembayaran tunai di terminal kasir ([PaymentModal.tsx](file:///e:/Project/POS-DEV/src/features/pos/components/PaymentModal.tsx)):

### Fitur & Penyempurnaan:
1. **Input Manual Interaktif & Format Titik Otomatis**:
   - Nilai uang yang diterima diformat secara *real-time* menggunakan pemisah ribuan titik (misal mengetik `350000` langsung tampil rapi sebagai `350.000`).
   - Penambahan `inputMode="numeric"` untuk kenyamanan perangkat layar sentuh / tablet.
   - Penambahan `onFocus={(e) => e.target.select()}`: saat kolom diklik atau di-fokus, seluruh angka otomatis ter-blok sehingga kasir bisa langsung mengetikkan nominal baru tanpa harus menekan *backspace* berkali-kali.
2. **Pecahan Uang Kertas Realistis (Indonesian Banknotes)**:
   - Tombol preset nominal dibuat dinamis mengikuti pecahan umum rupiah di atas total tagihan (misal total Rp 330.000 ➔ menampilkan `Uang Pas (Rp 330.000)`, `Rp 350.000`, `Rp 400.000`, `Rp 500.000`).
   - Tombol **Kosongkan** untuk menghapus input jika kasir ingin mengetik nominal kustom dari awal.
3. **Validasi & Informasi Kembalian Real-Time**:
   - Jika uang diterima $\ge$ total tagihan: box hijau tebal menampilkan nominal kembalian.
   - Jika uang diterima $<$ total tagihan: box merah menampilkan *"Uang Masih Kurang: Rp ..."* dan tombol *"Selesaikan Pembayaran"* dinonaktifkan untuk mencegah kesalahan transaksi.
4. **Penyelarasan Tema Desain Dashboard**:
   - Modal diselaraskan dengan palet warna Navy `#0b1c30`, tombol primer `#3755c3`, dan soft background `#eff4ff`.

---

## 15. Fitur Pilihan Transaksi Offline & Online Marketplace di Terminal POS

Menambahkan opsi pemilihan jenis transaksi kasir langsung pada terminal POS: **Transaksi Offline** (toko fisik) dan **Transaksi Online** (pesanan marketplace e-commerce seperti Shopee, Tokopedia, TikTok Shop, Lazada, Blibli, dll.):

### 1. Model & Data Store ([transaction.ts](file:///e:/Project/POS-DEV/src/types/transaction.ts), [cartStore.ts](file:///e:/Project/POS-DEV/src/stores/cartStore.ts)):
- **Tipe Transaksi**: Menambahkan tipe data `TransactionType = 'offline' | 'online'` dan antarmuka `OnlineOrderDetails`:
  - `marketplace`: Nama marketplace pilihan (Shopee, Tokopedia, TikTok Shop, Lazada, Blibli, atau input kustom).
  - `shopName`: Nama toko penjual di marketplace.
  - `orderNumber`: Nomor pesanan / Order ID dari marketplace.
  - `trackingNumber`: Nomor resi pengiriman / AWB kurir.
  - `customerName`: Nama pembeli / penerima pesanan.
  - `shippingAddress`: Alamat tujuan pengiriman.
- **State Keranjang Terintegrasi**:
  - `cartStore` menyimpan `transactionType` (default `'offline'`) dan `onlineDetails`.
  - State otomatis di-reset bersih ke `'offline'` saat kasir mengosongkan keranjang atau menyelesaikan transaksi (`clearCart()`).

### 2. Modal Form Pesanan Online ([OnlineOrderModal.tsx](file:///e:/Project/POS-DEV/src/features/pos/components/OnlineOrderModal.tsx)):
- Dibuat komponen modal formulir baru dengan desain elegan konsisten tema Dashboard Navy (`#0b1c30`, `#3755c3`, `#eff4ff`):
  - **Quick Select Marketplace**: Tombol chip cepat untuk Shopee, Tokopedia, TikTok Shop, Lazada, Blibli, dan opsi Marketplace Lainnya.
  - **Input Lengkap 6 Field**: Nama Toko, Nomor Pesanan, Nomor Resi, Nama Pembeli, dan Alamat Lengkap.
  - **Validasi Cerdas**: Tombol simpan memastikan field wajib (Marketplace, No. Pesanan, Nama Pembeli) terisi dengan benar sebelum melanjutkan.

### 3. Header Terminal POS Interaktif ([POSTerminalPage.tsx](file:///e:/Project/POS-DEV/src/features/pos/pages/POSTerminalPage.tsx)):
- Menambahkan *Segmented Toggle Switch* di header terminal:
  - **[ 🏪 Offline Toko ]**: Mode transaksi reguler pengunjung toko fisik.
  - **[ 🌐 Pesanan Online ]**: Membuka modal input form data marketplace dan mengaktifkan mode pesanan online.
- Indikator visual jelas saat mode Online aktif dengan ringkasan nama marketplace & nomor pesanan di header.

### 4. Banner Pesanan di Panel Keranjang ([CartPanel.tsx](file:///e:/Project/POS-DEV/src/features/pos/components/CartPanel.tsx)):
- Menampilkan kartu info status pesanan online di bagian atas daftar keranjang kasir.
- Menampilkan badge marketplace, nomor pesanan, nama pembeli, dan nomor resi.
- Tombol **"Ubah Data"** agar kasir dapat memperbarui informasi pesanan sewaktu-waktu sebelum pembayaran.
- Validasi saat menekan tombol checkout: jika kasir berada di mode online namun belum melengkapi data pesanan, modal form otomatis dimunculkan terlebih dahulu.

### 5. Pencatatan Transaksi & Struk Cetak ([PaymentModal.tsx](file:///e:/Project/POS-DEV/src/features/pos/components/PaymentModal.tsx), [ReceiptPage.tsx](file:///e:/Project/POS-DEV/src/features/pos/pages/ReceiptPage.tsx)):
- `PaymentModal` menyimpan field `transactionType` dan rincian `onlineDetails` secara utuh ke riwayat transaksi.
- Pada halaman struk cetak kasir, ditampilkan blok informasi khusus pesanan online:
  - Marketplace & Nama Toko.
  - No. Pesanan / Order ID & No. Resi Pengiriman.
  - Nama Pembeli & Alamat Pengiriman.

### 6. Riwayat Transaksi Kasir ([TransactionHistoryPage.tsx](file:///e:/Project/POS-DEV/src/features/pos/pages/TransactionHistoryPage.tsx)):
- Tabel riwayat transaksi menampilkan badge identitas transaksi: `🌐 Online (Marketplace) #NoPesanan` atau `🏪 Offline Toko`.
- Kolom pencarian riwayat mendukung pencarian cepat berdasarkan Nama Marketplace, No. Pesanan, maupun Nama Pembeli selain ID struk dan nama kasir.

---

## 16. Kustomisasi Transaksi Online (Edit Harga & Potongan Marketplace), Pembayaran Tertunda, dan Menu List Penjualan (Sales)

Penyempurnaan alur transaksi online marketplace dan penambahan modul List Penjualan (Sales) lengkap:

### 1. Edit Harga Satuan Produk pada Transaksi Online:
- **`cartStore.ts`**: Menambahkan action `updateItemPrice(id, newPrice)` yang memperbarui harga item dan menghitung ulang subtotal serta total tagihan secara otomatis.
- **`CartPanel.tsx`**: Ketika mode transaksi online aktif (`transactionType === 'online'`), setiap baris produk di keranjang memiliki input edit harga langsung (*inline price edit*) berformat ribuan rupiah dan badge *"Edit Harga"*, sehingga kasir dapat menyesuaikan harga khusus marketplace sewaktu-waktu.

### 2. Penggantian Pajak Menjadi Potongan Marketplace (Input Manual):
- **`cartStore.ts`**: Menambahkan state `marketplaceFee` dan action `setMarketplaceFee(fee)`.
  - Pada mode online, persentase pajak PPN dinonaktifkan (0).
  - Nilai Potongan Marketplace mengurangi subtotal tagihan: `Total = Math.max(0, subtotal - discount - marketplaceFee)`.
- **`CartPanel.tsx`**: Baris pajak berganti menjadi **Potongan Marketplace (Manual)** dengan field input nominal rupiah (misal `Rp 15.000`) berformat pemisah ribuan titik. Total tagihan otomatis ter-update menjadi **Total Bersih Pesanan**.

### 3. Pilihan Pembayaran: Sekarang vs Tertunda:
- **`transaction.ts` & `PaymentModal.tsx`**:
  - Menambahkan selector segmented pilihan waktu pembayaran:
    1. **`⚡ Bayar Sekarang (Lunas)`**: Uang diterima saat ini via Tunai, QRIS, atau Kartu EDC. Status tersimpan sebagai `success` / `lunas`.
    2. **`⏳ Pembayaran Tertunda`**: Untuk pesanan online di mana pembayaran masih ditahan oleh sistem marketplace atau piutang pembeli. Kasir tidak diwajibkan menginput uang tunai di muka. Stok barang tetap langsung terpotong dari master data. Status transaksi tersimpan sebagai `pending` / `tertunda`.
- **`ReceiptPage.tsx`**:
  - Menampilkan badge status pembayaran: `✓ Lunas` (hijau) atau `⏳ Tertunda` (banner kuning/amber).
  - Menampilkan baris `Potongan Marketplace: -Rp ...` menggantikan pajak PPN jika transaksi online.

### 4. Menu Baru di Sidebar: "List Penjualan" ([Sidebar.tsx](file:///e:/Project/POS-DEV/src/components/layout/Sidebar.tsx)):
- Menambahkan menu **List Penjualan** dengan ikon `Receipt` tepat di bawah menu **Terminal POS**.
- Dapat diakses langsung oleh kasir maupun pemilik toko / admin.

### 5. Halaman Baru "List Penjualan (Sales)" ([SalesListPage.tsx](file:///e:/Project/POS-DEV/src/features/pos/pages/SalesListPage.tsx)):
- Didaftarkan pada rute `/sales` (dan `/pos/history` dialihkan ke halaman ini).
- **Statistik Penjualan Interaktif**:
  - *Total Penjualan*: Akumulasi seluruh omzet transaksi.
  - *Offline Toko*: Jumlah transaksi dan nominal penjualan toko fisik.
  - *Online Marketplace*: Jumlah pesanan dan omzet marketplace.
  - *Pembayaran Tertunda*: Jumlah transaksi pending dan nominal dana yang belum cair.
- **Filter Tabs**: Tab cepat `Semua`, `🏪 Offline Toko`, `🌐 Online Marketplace`, `⏳ Tertunda`, dan `✓ Lunas`.
- **Pencarian Multifungsi**: Mencari berdasarkan No. Struk, Nama Kasir, Nama Marketplace, No. Pesanan, No. Resi, maupun Nama Pembeli.
- **Aksi Cepat Pelunasan**: Pada transaksi berstatus *Tertunda*, kasir/admin dapat menekan tombol **"Tandai Lunas"** untuk mengubah status transaksi menjadi lunas secara seketika setelah dana marketplace cair atau piutang dilunasi.

---

## 17. Penambahan Kolom % Potongan Marketplace & Fitur Edit Transaksi di List Penjualan

Peningkatan fungsionalitas pada modul List Penjualan ([SalesListPage.tsx](file:///e:/Project/POS-DEV/src/features/pos/pages/SalesListPage.tsx)):

### 1. Kolom Persentase Potongan Marketplace (`% Potongan`):
- **Kalkulasi Matematis Otomatis**: Menghitung secara dinamis rasio potongan marketplace terhadap subtotal pesanan dengan rumus:
  $$\% \text{ Potongan} = \frac{\text{Potongan Marketplace}}{\text{Subtotal}} \times 100\%$$
- **Indikator Visual**:
  - Transaksi online yang dikenakan potongan menampilkan badge persentase berwarna merah lembut (misal: `10.0%`, `7.5%`).
  - Transaksi toko offline atau tanpa potongan marketplace menampilkan `-`.

### 2. Fitur & Modal Edit Transaksi ([EditTransactionModal.tsx](file:///e:/Project/POS-DEV/src/features/pos/components/EditTransactionModal.tsx)):
- **Tombol Aksi Edit**: Menambahkan tombol aksi `Edit` pada setiap baris transaksi di tabel penjualan.
- **Pengeditan Informasi Marketplace & Pengiriman**:
  - Kasir dapat memilih/mengubah nama marketplace (*Shopee, Tokopedia, TikTok Shop, Lazada, Blibli, Lainnya*).
  - Mengubah Nama Toko, Nomor Pesanan (Order ID), Nomor Resi Pengiriman (AWB), Nama Pembeli, dan Alamat Pengiriman.
- **Pengeditan Item & Harga Satuan**:
  - Harga satuan item dapat disesuaikan pada saat edit.
  - Kuantitas item dapat ditambah atau dikurangi dengan tombol `+` / `-`.
- **Sinkronisasi Stok Otomatis**:
  - Jika kuantitas item ditambah saat edit, stok master produk di `productStore` langsung berkurang secara proporsional.
  - Jika kuantitas item dikurangi, selisih stok langsung dikembalikan ke inventaris produk secara otomatis.
- **Penyesuaian Biaya & Total Bersih Real-Time**:
  - Kolom input manual nominal Potongan Marketplace (Rp) dengan pemformatan titik ribuan.
  - Indikator persentase `%` dan Total Bersih Pesanan otomatis terhitung ulang secara *live*.
- **Pengubahan Status & Metode Pembayaran**:
  - Kasir/admin dapat mengubah status pembayaran (`Lunas` vs `Tertunda`).
  - Mengubah metode pembayaran (`Tunai`, `QRIS`, `Kartu`, `Marketplace`, `Piutang`).
- **Penyimpanan Terpusat**:
  - `transactionStore.ts`: Ditambahkan fungsi `updateTransaction(id, updatedFields)` untuk memperbarui data transaksi di state dan `localStorage`.
  ---

## 18. Rebranding "Frema Mart" & Implementasi Desain 4 Palet Warna

Pembaruan identitas merek dan perombakan skema warna di seluruh aplikasi POS:

### 1. Rebranding Nama Toko: **Frema Mart**
Menggantikan seluruh identitas "Dreamfresh" menjadi **"Frema Mart"**:
- **`index.html`**: Judul tab browser diubah menjadi `Frema Mart - POS & Retail System`.
- **`Sidebar.tsx`**: Logo header toko diubah menjadi **Frema Mart** dengan ikon belanja bertema baru.
- **`TopBar.tsx`**: Breadcrumb root default diubah ke `Frema Mart`.
- **`POSTerminalPage.tsx`**: Header kasir diubah menjadi `FREMA MART POS`.
- **`ReceiptPage.tsx`**: Header struk resmi bertuliskan `🏪 Frema Mart` dan footer cetak bertuliskan `Powered by Frema Mart POS`.
- **`OnlineOrderModal.tsx` & `EditTransactionModal.tsx`**: Nama default toko online marketplace diubah menjadi `Frema Mart Official`.
- **`LoginPage.tsx`**: Brand header, placeholder email (`kasir@fremamart.id`), ID terminal (`884-FMM-JKT`), dan copyright footer diubah menjadi `Frema Mart`.
- **`PaymentMethodSummary.tsx`**: Akun rekening bank debit diubah atas nama `Frema Mart Store`.

### 2. Implementasi 4 Palet Warna Kustom
Mengadopsi kombinasi 4 warna utama:
- **`#254222` (Deep Forest Green)**:
  - Background navigasi utama Sidebar Desktop.
  - Header Terminal POS Kasir dan header struk pembayaran.
  - Warna tipografi heading judul halaman utama (`h1`, `h2`, `h3`).
  - Tombol checkout utama dan tombol simpan perubahan.
- **`#99cc66` (Fresh Apple / Olive Green)**:
  - Navigasi aktif di sidebar dan tombol aksi utama.
  - Indikator status terminal aktif (pulsing dot).
  - Status lunas pada tab penjualan dan tombol cepat.
- **`#ece2b1` (Warm Cream / Soft Khaki)**:
  - Indikator badge dan status pesanan bertipe **Pembayaran Tertunda**.
  - Peringatan restock stok produk menipis.
  - Teks kontras tinggi pada background deep forest green.
- **`#cae4c5` (Soft Pastel Sage)**:
  - Background kontainer lembut (`bg-[#cae4c5]/20` s/d `/40`).
  - Garis batas halus (border) pada tabel penjualan, kartu produk, dan modal popup.
  - Chip filter kategori inaktif dan badge status pesanan selesai/lunas.

### 3. Pembaruan Tailwind CSS v4 (`globals.css`)
- Mendefinisikan variabel CSS `@theme` baru untuk warna brand:
  - `--color-brand-dark: #254222`
  - `--color-brand-primary: #99cc66`
  - `--color-brand-cream: #ece2b1`
  - `--color-brand-sage: #cae4c5`
  - Menyelaraskan seluruh utility token warna tema.

---

## 19. Pembaruan Fitur Tombol Reset Total Data Sistem (Sales, Purchases, Expenses, dan Stok Produk)

Pembaruan komprehensif pada tombol reset merah (ikon `RotateCcw`) di samping judul *Dashboard Overview* (`DashboardPage.tsx`):

### 1. Perluasan Ruang Lingkup Reset Data
Sebelumnya, tombol reset hanya mengosongkan riwayat transaksi penjualan kasir. Kini tombol reset mengintegrasikan 4 pilar operasional utama secara menyeluruh:
1. **Semua Transaksi Penjualan (Sales)**:
   - Mengosongkan seluruh riwayat transaksi kasir offline maupun pesanan online marketplace (`transactions: []`).
   - Mereset total omzet, HPP, grafik omzet harian/bulanan, dan ringkasan penerimaan metode bayar ke Rp 0.
2. **Semua Transaksi Pembelian Barang (Purchase Orders)**:
   - Mengosongkan seluruh pesanan pembelian ke pemasok (`purchaseOrders: []`).
   - Mereset total pembelian (`totalPurchases: 0`) dan saldo hutang supplier (`totalDebt: 0`) pada setiap data vendor/supplier.
3. **Semua Beban & Pengeluaran Operasional (Expenses)**:
   - Mengosongkan seluruh riwayat catatan biaya operasional toko (`expenses: []`).
   - Mereset akumulasi pengeluaran pada setiap kategori beban operasional (`totalExpenses: 0`).
4. **Kuantitas Stok Seluruh Produk (Qty Stok = 0)**:
   - Mengatur ulang kuantitas stok (`stock`) pada semua produk di inventaris/katalog menjadi **0 unit**.
   - Master data produk (nama, SKU, kategori, harga beli, harga jual) tetap terjaga dengan aman.
5. **Pembersihan Keranjang Kasir (Cart)**:
   - Mengosongkan antrean keranjang aktif kasir via `clearCart()`.

### 2. Penambahan Metode State di Zustand Store
- **`src/stores/productStore.ts`**:
  - Ditambahkan interface & fungsi `resetAllProductStocks(toQuantity = 0)`.
- **`src/stores/purchaseStore.ts`**:
  - Ditambahkan interface & fungsi `resetPurchaseOrders()` yang juga membersihkan hutang supplier.
- **`src/stores/expenseStore.ts`**:
  - Ditambahkan interface & fungsi `resetExpenses()` yang juga mereset total beban kategori.
- **`src/stores/transactionStore.ts`**:
  - Penggunaan `resetTransactions()` untuk mengosongkan seluruh riwayat penjualan.

### 3. Modal Dialog Konfirmasi Interaktif & Notifikasi Sukses
- Menggantikan dialog konfirmasi sederhana browser (`window.confirm`) dengan modal pop-up konfirmasi interaktif bertema **Frema Mart** dengan palet `#254222`, `#cae4c5`, `#ece2b1` dan aksen merah peringatan.
- Menampilkan visual breakdown 4 komponen yang akan direset dengan ikon representatif:
  - 🛍️ **Penjualan (Sales)**
  - 🚚 **Pembelian Barang (Purchase Orders)**
  - 🧾 **Beban Pengeluaran (Expenses)**
  - 📦 **Kuantitas Stok Produk (Qty Stok = 0)**
- Dilengkapi kotak peringatan keamanan serta tombol konfirmasi merah tegas *"Ya, Reset Semua Data Sekarang"*.
- Menampilkan toast notifikasi dari Sonner dan banner notifikasi visual hijau sukses langsung di dashboard setelah pembersihan data selesai.

---

## 20. Implementasi Fase 4 Tahap 1: Modul Pengaturan Toko & Manajemen Rekening

Melakukan realisasi modul Pengaturan (Settings) yang sebelumnya hanya berupa placeholder, sebagai bagian dari *roadmap* Fase 4. Pengerjaan tahap ini berfokus pada manajemen data fundamental toko dan integrasi metode pembayaran dinamis.

### 1. Global State Management (`settingsStore.ts`)
- Memisahkan dan membuat penyimpan status terpusat (Zustand persist) untuk pengaturan sistem aplikasi yang mencakup:
  - **Profil Toko**: Penyimpanan data nama toko, alamat lengkap, telepon/WhatsApp, dan surel (email) toko.
  - **Pengaturan Pajak**: Penyimpanan persentase default Pajak Pertambahan Nilai (PPN).
  - **Manajemen Rekening Bank**: Pengelolaan data rekening bank (`id`, `bank`, `accountNumber`, `accountName`) secara dinamis dengan dukungan Create, Update, dan Delete (CRUD).

### 2. Antarmuka Halaman Pengaturan
Membuat tiga halaman utama dalam sub-menu Pengaturan yang mematuhi standar palet 4 warna "Frema Mart" (`#254222`, `#99cc66`, `#cae4c5`, `#ece2b1`):
1. **Profil Toko (`StoreProfilePage.tsx`)**: Formulir interaktif dengan validasi dasar untuk mengatur identitas toko yang akan terhubung dengan pencetakan struk dan laporan.
2. **Pajak & Biaya (`TaxSettingsPage.tsx`)**: Konfigurasi pajak global untuk menyederhanakan perhitungan PPN pada transaksi offline di terminal kasir.
3. **Metode Pembayaran (`PaymentMethodsPage.tsx`)**: Pengganti data *mock* (statis) menjadi antarmuka tabel pengelolaan multi-rekening bank dengan fitur tambah rekening dan hapus rekening yang responsif.

### 3. Integrasi & Sinkronisasi Komponen
- **Dashboard Widget (`PaymentMethodSummary.tsx`)**:
  - Menghapus konstanta statis `MOCK_BANK_ACCOUNTS`.
  - Sinkronisasi langsung dengan *state* `bankAccounts` di `settingsStore`.
  - Membuka akses penuh pada tombol "Tambah Rekening" di dalam *accordion* Debit/Kartu yang langsung menavigasikan admin ke `/settings/payments`.
- **Navigasi Sidebar (`Sidebar.tsx`)**:
  - Memperbarui menu "Pengaturan" menjadi submenu terkelompok (*collapsible*) yang mencakup: Profil Toko, Pajak & Biaya, dan Metode Pembayaran.
- **Routing Sistem (`routes.tsx`)**:
  - Menggantikan rute statis `PlaceholderPage` dengan tautan pemanggilan komponen *Settings* yang sesungguhnya.
