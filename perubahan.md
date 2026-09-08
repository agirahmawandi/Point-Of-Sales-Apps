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

---

## 21. Sesi Perubahan — 7 September 2026

### 1. Sistem Saldo Rekening Bank (Dashboard & Semua Modul)
Melengkapi sistem bank account agar saldo bisa berubah secara otomatis dari setiap modul transaksi:

- **`settingsStore.ts`**:
  - Menambahkan field `balance?: number` pada interface `BankAccount`.
  - Menambahkan fungsi `updateBankBalance(id, amount)` untuk menambah/mengurangi saldo rekening secara inkremental.
  - Menambahkan fungsi `resetBankBalances()` untuk mengenolkan saldo semua rekening sekaligus.

- **`transaction.ts`, `purchase.ts`, `expense.ts`**:
  - Menambahkan field `bankAccountId?: string` pada masing-masing tipe data agar dapat melacak rekening mana yang terlibat dalam setiap transaksi.

- **`PaymentMethodSummary.tsx`** (Dashboard):
  - Merubah nama bagian dari *"Saldo per Metode Bayar"* menjadi **"SALDO"**.
  - Menggantikan tampilan generik Debit/Kredit dengan **kartu per rekening bank** yang menampilkan nama bank, nomor rekening, dan saldo real-time.

---

### 2. Integrasi Saldo di Terminal Kasir (POS)

**`PaymentModal.tsx`**:
- Menambahkan dropdown **"Pilih Rekening Penerima"** yang muncul ketika metode pembayaran adalah *Kartu/EDC/Transfer Bank*.
- Saat kasir menyelesaikan pembayaran, saldo rekening yang dipilih **otomatis bertambah** sebesar nominal transaksi.
- `bankAccountId` disimpan bersama data transaksi untuk keperluan audit.

---

### 3. Integrasi Saldo di Modul Pembelian (Purchase Orders)

**`PurchaseFormPage.tsx`**:
- Menambahkan opsi pilihan rekening pada form pembuatan PO baru saat metode bayar menggunakan Transfer Bank.
- Saldo rekening yang dipilih langsung berkurang saat PO disimpan.

**`PurchaseDetailPage.tsx`** (Modal Bayar Tagihan PO):
- Menambahkan dropdown **"Pilih Rekening Sumber Dana"** pada modal pembayaran hutang dagang PO saat metode "Transfer Bank" dipilih.
- Saldo rekening yang dipilih otomatis **berkurang** sebesar pembayaran yang dilakukan.
- Nama bank dicatat pada riwayat pembayaran PO.

---

### 4. Integrasi Saldo di Modul Pengeluaran (Expenses)

**`ExpenseListPage.tsx`**:
- Menambahkan pilihan rekening bank pada form pencatatan pengeluaran ketika metode bayar menggunakan "Transfer Bank".
- Saldo rekening yang dipilih langsung berkurang saat pengeluaran disimpan.

---

### 5. Perbaikan List Penjualan — Pelunasan Tertunda

**`SalesListPage.tsx`**:
- Pada modal konfirmasi **"Tandai Lunas"** untuk transaksi tertunda/piutang, ditambahkan:
  - Selector **"Terima Pembayaran Via"** (Tunai, Transfer Bank, QRIS).
  - Jika dipilih Transfer Bank, muncul dropdown **"Rekening Penerima"** beserta saldo terkini.
- Setelah dikonfirmasi lunas, metode bayar dan rekening terpilih disimpan ke data transaksi dan saldo rekening otomatis bertambah.

---

### 6. Perbaikan Modal "Bayar Tagihan PO" — Pilihan Rekening

**`PurchaseDetailPage.tsx`**:
- Melengkapi fitur yang sebelumnya belum ada: saat memilih "Transfer Bank" di modal Bayar Tagihan PO, kini ditampilkan dropdown rekening bank dengan saldo real-time.

---

### 7. Reset Saldo Rekening Masuk ke Tombol Reset Data

**`DashboardPage.tsx`**:
- Menambahkan pemanggilan `resetBankBalances()` di dalam fungsi `handleExecuteReset`.
- Sekarang ketika Admin melakukan **Reset Total Data Sistem**, seluruh saldo rekening bank juga ikut direset menjadi **Rp 0**, konsisten dengan data transaksi yang dikosongkan.
- Deskripsi di modal konfirmasi dan banner sukses belum diubah (dapat disesuaikan di kemudian hari).

---

### 8. Sinkronisasi Saldo & Stok Saat Edit Transaksi

**`EditTransactionModal.tsx`**:
- **Metode Pembayaran**: Ditambahkan opsi *"Transfer Bank / EDC"* yang memunculkan dropdown rekening bank beserta saldo.
- **Sinkronisasi Saldo Otomatis saat Edit**:
  - Sistem mendeteksi rekening lama yang terdampak dan **mengurangi** saldo dari rekening tersebut.
  - Sistem kemudian **menambahkan** saldo ke rekening baru (atau rekening yang sama jika tidak diubah) sesuai total baru.
  - Logika ini mencakup perubahan metode bayar (misal dari Tunai menjadi Transfer, atau sebaliknya).
- **Sinkronisasi Stok Sudah Ada Sebelumnya**: Perubahan kuantitas item saat edit sudah terhubung ke `productStore` (stok bertambah jika qty dikurangi, stok berkurang jika qty ditambah).

---

### 9. Sinkronisasi HPP ke Laporan Laba Rugi Saat Edit

**`EditTransactionModal.tsx`**:
- Menambahkan kalkulasi ulang **HPP (Harga Pokok Penjualan)** dan **Laba Bersih** setiap kali transaksi diedit.
- Formula: `HPP Baru = Σ (buyPrice × quantity)` untuk setiap item yang diedit.
- Field `hpp` dan `profit` pada data transaksi di-update bersama saat menekan "Simpan Perubahan".
- **`ProfitLossReportPage.tsx`** sudah membaca field `hpp` ini, sehingga laporan Laba Rugi kini **otomatis sinkron** dengan perubahan di List Penjualan tanpa perlu modifikasi tambahan.

---

## 22. Modul Keuangan Baru — 7 September 2026

### 1. Store Keuangan Baru (`financeStore.ts`)

File baru: `src/stores/financeStore.ts` (Zustand persist `pos-finance-storage`).

Mengelola seluruh data keuangan yang sebelumnya tidak memiliki wadah:

- **`investors[]`**: Data investor (nama, telepon, catatan, total investasi, total bagi hasil).
- **`investorDeposits[]`**: Riwayat setiap setoran dana dari investor.
- **`profitShares[]`**: Riwayat setiap pembagian hasil usaha beserta distribusinya per investor.
- **`balanceTransfers[]`**: Riwayat setiap pemindahan saldo antar kantong (kas ↔ QRIS ↔ rekening bank).
- **`cashBalance`** & **`qrisBalance`**: Saldo kas tunai dan QRIS yang dikelola terpisah dari bank.
- Fungsi: `addInvestor`, `addInvestorDeposit`, `addProfitShare`, `addBalanceTransfer`, `updateCashBalance`, `updateQrisBalance`, `resetFinanceBalances`.

---

### 2. Menu Sidebar Baru: Keuangan

**`Sidebar.tsx`**:
- Menambahkan grup menu **Keuangan** (ikon 🏦 `Landmark`) di bawah menu Pengeluaran.
- Berisi 5 submenu: Histori Transaksi, Pindah Saldo, Daftar Bank, Investor, Bagi Hasil.
- Menu hanya terlihat oleh user dengan role selain kasir (admin/owner).

---

### 3. Halaman Baru: Histori Transaksi (`FinanceHistoryPage.tsx`)

Rute: `/finance/history`

- Menampilkan **semua transaksi keuangan dari seluruh modul** dalam satu tabel terpadu.
- Sumber data yang digabung: Penjualan (Sales), Purchase Orders, Pengeluaran (Expenses), Pindah Saldo, Setoran Investor.
- Setiap baris menampilkan: waktu, tipe transaksi (badge warna), keterangan, metode, status, dan jumlah (hijau = masuk, merah = keluar).
- Diurutkan berdasarkan waktu terbaru di atas.

---

### 4. Halaman Baru: Pindah Saldo (`BalanceTransferPage.tsx`)

Rute: `/finance/transfer`

- Form interaktif untuk memindahkan saldo antar sumber: **Kas / Tunai**, **QRIS / E-Wallet**, dan **Rekening Bank** (pilih dari daftar).
- Menampilkan saldo tersedia dari masing-masing sumber secara real-time.
- Validasi: tidak bisa memindahkan lebih dari saldo yang tersedia.
- Saat dikonfirmasi, saldo sumber berkurang dan saldo tujuan bertambah secara otomatis.
- Riwayat semua pemindahan saldo ditampilkan di panel kanan halaman.

---

### 5. Halaman Daftar Bank Dipindahkan

Rute lama `/settings/payments` tetap berfungsi, namun rute baru **`/finance/banks`** mengarah ke halaman yang sama (`PaymentMethodsPage.tsx`).

Menu "Metode Pembayaran" di Pengaturan sudah ada, kini juga dapat diakses dari **Keuangan → Daftar Bank** untuk kemudahan navigasi.

---

### 6. Halaman Baru: Investor (`InvestorPage.tsx`)

Rute: `/finance/investors`

- Kartu ringkasan: Total Dana Masuk, Total Bagi Hasil, Dana Bersih.
- **Daftar Investor**: Tambah, lihat detail, dan hapus investor.
- **Form Tambah Investor**: Nama (wajib), Nomor Telepon, Catatan.
- **Catat Dana Masuk** per investor:
  - Pilih jumlah dana.
  - Pilih metode penyetoran: **Tunai** (saldo kas bertambah) atau **Transfer Bank** (pilih rekening, saldo rekening bertambah otomatis).
  - Riwayat setoran per investor dapat dilihat dengan expand accordion.
- Total investasi dan total bagi hasil per investor diperbarui otomatis.

---

### 7. Halaman Baru: Bagi Hasil (`ProfitSharePage.tsx`)

Rute: `/finance/profit-share`

- Kartu ringkasan: Total Pendapatan, Total HPP+Biaya, Laba Bersih, Total Dibagikan.
- Membaca data keuangan real-time dari `transactionStore` dan `expenseStore`.
- **Form Catat Bagi Hasil**:
  - Input periode (misal: "September 2026").
  - Ringkasan laba bersih otomatis terisi.
  - Per investor: input persentase (%), estimasi jumlah rupiah tampil otomatis, pilih metode pembayaran (Tunai / Transfer Bank + pilih rekening).
  - Validasi: total persentase tidak boleh melebihi 100%.
  - Saat disimpan, saldo kas/rekening yang dipilih **otomatis berkurang** sebesar jumlah bagi hasil per investor.
  - Total bagi hasil per investor di data investor otomatis bertambah.
- Riwayat semua bagi hasil ditampilkan dengan detail distribusi per investor.

---

### 8. Perluasan Tombol Reset Dashboard — Modul Keuangan

**`DashboardPage.tsx`**:

Tombol reset merah 🔴 di Dashboard kini juga mereset **seluruh data modul Keuangan**:

- **Saldo Kas & QRIS → Rp 0** (via `resetFinanceBalances()`).
- **Riwayat Pindah Saldo** dikosongkan (`balanceTransfers: []`).
- **Riwayat Setoran Investor** dikosongkan (`investorDeposits: []`).
- **Riwayat Bagi Hasil** dikosongkan (`profitShares: []`).
- **Total Investasi & Total Bagi Hasil per Investor** direset ke 0, namun **data nama investor tetap tersimpan**.

Modal konfirmasi reset diperluas dengan 2 item baru:
- 🏦 *Saldo Keuangan (Rekening, Kas, QRIS = 0)*
- 💵 *Data Keuangan (Pindah Saldo, Setoran Investor, Bagi Hasil)*
 
 # #   1 8 .   M o d u l   M a n a j e m e n   P e l a n g g a n   ( C u s t o m e r )   &   M e n u   S a l e s  
 -   * * S t r u k t u r   M e n u   B a r u : * *   M e n g u b a h   m e n u   \  
 L i s t  
 P e n j u a l a n \   m e n j a d i   g r u p   \ S a l e s \   y a n g   t e r d i r i   d a r i   \ L i s t  
 P e n j u a l a n \   d a n   \ L i s t  
 P e l a n g g a n \ .  
 -   * * P e n y i m p a n a n   D a t a   ( Z u s t a n d ) : * *   M e m b u a t   \ c u s t o m e r S t o r e . t s \   u n t u k   m e n y i m p a n   d a t a   p r o f i l   p e l a n g g a n   ( N a m a ,   T e l e p o n ,   A l a m a t ,   P l a t f o r m )   s e r t a   m e n g a k u m u l a s i k a n   \ 	 o t a l T r a n s a c t i o n s \   d a n   \ 	 o t a l S p e n t \ .  
 -   * * H a l a m a n   D a f t a r   P e l a n g g a n : * *   M e n a m b a h k a n   r u t e   \ / s a l e s / c u s t o m e r s \   u n t u k   m e n a m p i l k a n   t a b e l   d a f t a r   p e l a n g g a n .  
 -   * * I n t e g r a s i   K a s i r   O f f l i n e : * *   M e n a m b a h k a n   f i t u r   P o p u p   I n p u t   P e l a n g g a n   ( \ O f f l i n e C u s t o m e r M o d a l \ )   s a a t   a k a n   m e n y e l e s a i k a n   p e m b a y a r a n   o f f l i n e .   M e n c a k u p   p e n c a r i a n   n a m a / n o   h p   ( a n t i   d u p l i k a t )   a t a u   o p s i   * L e w a t i *   ( P e l a n g g a n   U m u m ) .  
 -   * * I n t e g r a s i   K a s i r   O n l i n e : * *   O t o m a t i s   m e n y i m p a n   n a m a ,   a l a m a t ,   d a n   p l a t f o r m   ( S h o p e e ,   T o k o p e d i a ,   d l l )   p e m b e l i   o n l i n e   k e   d a l a m   M a s t e r   D a t a   P e l a n g g a n .  
 -   * * T a b e l   L i s t   P e n j u a l a n : * *   K i n i   k o l o m   \  
 N o .  
 S t r u k \   j u g a   m e n a m p i l k a n   n a m a   P e l a n g g a n   y a n g   b e r t r a n s a k s i .  
  
 # #   1 9 .   F i t u r   U p l o a d   F o t o   P r o d u k  
 -   M e n a m b a h k a n   f i t u r   u p l o a d   f o t o   ( o p s i o n a l ,   m a k s   1 M B )   p a d a   h a l a m a n   T a m b a h / E d i t   P r o d u k   ( \ P r o d u c t F o r m P a g e . t s x \ ) .  
 -   F o t o   p r o d u k   o t o m a t i s   d i k o n v e r s i   k e   f o r m a t   b a s e 6 4   d a n   d i s i m p a n   d i   d a t a b a s e   l o k a l .  
 -   M e n a m p i l k a n   t h u m b n a i l   f o t o   p r o d u k   p a d a   t a b e l   D a f t a r   P r o d u k   ( \ P r o d u c t L i s t P a g e . t s x \ ) .  
 -   M e n a m p i l k a n   f o t o   p r o d u k   ( a t a u   i c o n   d e f a u l t   j i k a   k o s o n g )   p a d a   g r i d   p r o d u k   d i   h a l a m a n   P O S   T e r m i n a l   ( \ P r o d u c t G r i d . t s x \ ) .  
  
 # #   2 0 .   F i l t e r   R e n t a n g   W a k t u   D a s h b o a r d  
 -   M e n g a k t i f k a n   t o m b o l   f i l t e r   t a n g g a l   p a d a   h a l a m a n   D a s h b o a r d   ( \ D a s h b o a r d P a g e . t s x \ ) .  
 -   M e m b u a t   S t a t e   G l o b a l   b a r u   ( \ d a s h b o a r d S t o r e . t s \ )   u n t u k   m e n y i m p a n   f i l t e r   t a n g g a l   ( H a r i   I n i ,   K e m a r i n ,   M i n g g u   I n i ,   B u l a n   I n i ) .  
 -   F i l t e r   w a k t u   i n i   s e k a r a n g   m e m e n g a r u h i   k o m p o n e n - k o m p o n e n   b e r i k u t :  
     -   R i n g k a s a n   K a r t u   K P I   ( O m z e t ,   H P P ,   L a b a   B e r s i h ) .  
     -   G r a f i k   O m z e t   &   K u n j u n g a n   K a s i r   ( \ R e v e n u e C h a r t \ ) .  
     -   G r a f i k   P r o d u k   T e r l a r i s   ( \ T o p P r o d u c t s C h a r t \ ) .  
     -   R i n g k a s a n   A r u s   K a s   M a s u k   &   K e l u a r   ( \ C a s h F l o w C h a r t \ ) .  
     -   D a f t a r   T r a n s a k s i   K a s i r   T e r b a r u   ( \ R e c e n t T r a n s a c t i o n s \ ) .  
 -   K o m p o n e n   * * S a l d o   G a b u n g a n   &   M e t o d e   P e m b a y a r a n * *   ( \ P a y m e n t M e t h o d S u m m a r y \ )   s e n g a j a   t i d a k   d i p e n g a r u h i   f i l t e r   s e s u a i   i n s t r u k s i ,   u n t u k   t e t a p   m e n a m p i l k a n   s a l d o   a k t u a l   s a a t   i n i .  
 