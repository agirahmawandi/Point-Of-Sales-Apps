# 📄 PRD Front End — Frema POS Web

## 1. 🎯 Tujuan Dokumen
Dokumen ini merangkum arsitektur, teknologi, struktur folder, dan standar pengembangan Front End untuk aplikasi Point of Sales (POS) Frema Mart. Tujuannya adalah menjadi panduan utama untuk pemeliharaan (*maintenance*) dan pengembangan fitur di masa mendatang.

---

## 2. 📦 Tech Stack Utama

| Kategori | Teknologi | Deskripsi |
|----------|-----------|-----------|
| **Core Framework** | React 18 + TypeScript | Menggunakan standar fungsional komponen dan React Hooks. |
| **Build Tool** | Vite | Cepat, efisien, dengan dukungan Hot Module Replacement (HMR). |
| **Styling** | Tailwind CSS v3 | Utility-first CSS framework untuk styling yang cepat dan responsif. |
| **State Management** | Zustand | Menyimpan state global (Cart, Auth, Data Cache) secara reaktif. |
| **Routing** | React Router DOM v6 | Mengatur navigasi SPA (*Single Page Application*). |
| **Data Fetching** | Supabase JS Client | Akses data langsung ke database PostgreSQL melalui REST API & RPC. |
| **Iconography** | Lucide React | Library ikon konsisten dan modern. |
| **Grafik/Chart** | Recharts | Untuk memvisualisasikan data pada Dashboard. |
| **Notifikasi** | Sonner | Toast notifications untuk *global error handling* & *success messages*. |

---

## 3. 📂 Struktur Folder (Feature-Based Architecture)

Aplikasi ini menggunakan pola **Feature-Based Architecture**. Artinya, kode tidak dikelompokkan berdasarkan tipe (semua komponen di satu folder, semua halaman di satu folder), melainkan **berdasarkan modul/fitur**.

```text
src/
├── app/                  # Titik masuk aplikasi (App.tsx) dan konfigurasi Router utama
├── components/           # Komponen UI global (reusable)
│   ├── layout/           # Sidebar, PageContainer, ErrorBoundary
│   ├── ui/               # Button, Input, Modal, dll
│   └── charts/           # Komponen visualisasi data (Recharts)
├── features/             # LOGIKA & UI SPESIFIK FITUR (Modul POS)
│   ├── auth/             # Modul Login
│   ├── dashboard/        # Halaman depan & statistik
│   ├── expense/          # Pengeluaran operasional
│   ├── finance/          # Investor, Bagi Hasil, Transfer Kas
│   ├── pos/              # Layar Kasir Utama (Terminal POS)
│   ├── products/         # Master Barang & Kategori
│   ├── purchases/        # Purchase Order, Terima Barang, Pemasok
│   ├── reports/          # Laporan Penjualan, Laba Rugi, dll
│   ├── sales/            # Riwayat Transaksi & Struk
│   └── settings/         # Profil Toko, Pajak, Rekening Bank, Manajemen User
├── lib/                  # Utilities global (Supabase client, formatters, toast, dll)
├── stores/               # Zustand state managers (Logic API ke Supabase)
└── types/                # TypeScript Interfaces & Types
```

---

## 4. 🧠 State Management (Zustand)

Aplikasi memisahkan **Logika Data** dari **Komponen UI**. Komponen UI hanya bertugas me-render tampilan, sedangkan *fetching*, *mutating*, dan penyimpanan data dilakukan di dalam `stores`.

Daftar Store Utama:
- `authStore.ts`: Manajemen session pengguna login.
- `productStore.ts`: CRUD data produk, kategori, dan update stok.
- `transactionStore.ts`: Pencatatan penjualan kasir (online/offline).
- `purchaseStore.ts`: PO, Pemasok, dan penerimaan stok.
- `dashboardStore.ts`: Rekapan metrik bisnis, mengeksekusi RPC dari Supabase.
- `settingsStore.ts`: Mengatur profil toko, pajak, dan rekening bank.
- `financeStore.ts`: Manajemen pergerakan kas dan bagi hasil investor.

---

## 5. 🎨 Standar UI & UX

### Warna Tema Utama
- **Primary:** Hijau Frema (`#2D7A4F`, `bg-emerald-700`) — merepresentasikan kesegaran dan identitas toko.
- **Background:** Abu-abu terang (`#F9FAFB` / `bg-gray-50`) — untuk mengurangi ketegangan mata kasir.
- **Teks:** Slate (`text-slate-800` untuk judul, `text-slate-500` untuk subteks).
- **Aksen:** Biru untuk info (`bg-blue-50`), Merah untuk batal/hapus (`bg-red-50`), Kuning untuk peringatan/parsial (`bg-amber-50`).

### Komponen Kunci (Core UI)
1. **Sidebar Navigation:** Menu di kiri, hanya menampilkan menu yang sesuai dengan peran (Admin vs Kasir). Kasir tidak bisa melihat modul Laporan, Keuangan, dan Pengaturan.
2. **PageContainer:** Komponen *wrapper* standar untuk setiap halaman admin yang berisi Judul (H1) dan Sub-judul.
3. **Data Table:** Tabel data standar dengan fitur pencarian (search bar di kanan atas) dan tombol aksi (Edit/Hapus) menggunakan icon di kolom paling kanan.

### Global Error Handling (Sonner)
Aplikasi tidak menggunakan fungsi `alert()` bawaan browser. Setiap interaksi sukses atau gagal ditangani secara global menggunakan **Toast Notifications** (`@/lib/toast.ts`).
- `showSuccess('Pesan berhasil')`
- `showError('Pesan error')`

---

## 6. 🔒 Alur Autentikasi & Keamanan (Client-Side)

1. **Inisialisasi:** Saat aplikasi dimuat (`App.tsx`), `useAuthStore.initAuth()` dipanggil.
2. **Session Sync:** Zustand mengecek local storage session Supabase. Jika valid, user langsung masuk ke Dashboard. Jika tidak, masuk ke halaman `/login`.
3. **Role-Based Access Control (RBAC):** Sidebar me-render menu secara dinamis dengan mengecek `user.role === 'admin'`. Komponen tombol *Delete* di beberapa halaman disembunyikan jika user = `kasir`.

---

## 7. 🚀 Panduan Build & Deployment

- Proses build menggunakan **Vite** (`npm run build`).
- Output folder adalah `/dist`.
- Build telah dikonfigurasi untuk memecah *chunks* aplikasi (*code-splitting*) agar loading lebih cepat.
- **Environment Variables:** Wajib mengatur `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di server production (misal: Vercel).
- Aplikasi di-deploy di Vercel menggunakan integrasi GitHub otomatis. Semua push ke *branch* `main` akan di-build dan di-deploy menjadi production URL.

---
*Dokumen ini bersifat "living document" dan harus terus diperbarui seiring berjalannya pengembangan aplikasi.*
