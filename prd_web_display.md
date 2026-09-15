# 📄 PRD — Frema Mart Web Display (Katalog Produk Publik)

**Versi:** 1.1 (Final - Semua Open Questions Terjawab)  
**Tanggal:** 15 September 2026  
**Status:** ✅ Disetujui — Siap untuk Implementasi  

---

## 1. Latar Belakang & Tujuan

Frema Mart membutuhkan sebuah "etalase digital" yang bisa diakses langsung oleh pelanggan dari smartphone mereka, tanpa perlu mengunduh aplikasi. Konsepnya mirip dengan Astronauts.id — sebuah mobile-first web marketplace yang menampilkan katalog produk yang sinkron otomatis dari sistem POS.

Pelanggan dapat menelusuri produk, memilih item, dan mengajukan pesanan via **WhatsApp** dengan format pesan otomatis berisi daftar item dan total harga.

---

## 2. Arsitektur: Dua Web Dalam Satu Project

Kedua web ini adalah **satu codebase React** di repo yang sama, namun diakses dari **dua URL/path yang berbeda** di Vercel:

| Web | URL | Akses |
|-----|-----|-------|
| **POS Backoffice** | `pos.fremamart.vercel.app/pos-d5jm0seouq6bwhqy28ff8g30` | Hanya tim internal (URL rahasia — JANGAN DIBAGIKAN) |
| **Web Display** | `fremamart.vercel.app` | Publik, pelanggan |

> ⚠️ **RAHASIA — Secret Path POS:** `pos-d5jm0seouq6bwhqy28ff8g30`  
> Simpan path ini dengan aman. Siapapun yang tahu URL ini bisa mengakses sistem POS.

**Cara Kerjanya (Path-based Routing):**
- Dalam satu project Vite/React, kita menggunakan React Router.
- Path yang diawali `/pos-d5jm0seouq6bwhqy28ff8g30/*` akan me-render seluruh aplikasi POS.
- Path root `/` dan sub-path publik lainnya akan me-render Web Display.
- Di Vercel, cukup deploy **satu project** dengan dua domain yang mengarah ke deployment yang sama.

---

## 3. Keputusan Final (Open Questions)

| # | Pertanyaan | Keputusan |
|---|-----------|-----------|
| 1 | Nomor WA | Gunakan kolom `phone` dari `store_settings` (sudah ada, berlabel "Nomor Telepon / WhatsApp") |
| 2 | Gambar produk | **Placeholder dulu**, otomatis terisi saat produk di-upload dari POS |
| 3 | Produk stok 0 | **Tetap ditampilkan** dengan badge "Stok Habis" |
| 4 | Path secret POS | **`pos-d5jm0seouq6bwhqy28ff8g30`** (baru, lebih aman) |
| 5 | Domain | **`fremamart.vercel.app`** untuk sekarang, custom domain nanti |
| 6 | Minimum order | **Tidak ada** minimum pesanan |

---

## 4. Halaman yang Akan Dibangun

### Halaman Utama (`/`)
- Header: Logo + nama toko (dari `store_settings.name`)
- Search bar produk (filter real-time)
- Section "Semua Kategori" (grid ikon kategori, klik → filter produk)
- Section "Semua Produk" (grid 2 kolom)
- Bottom navigation sticky: Beranda | Keranjang | Tentang

### Halaman Katalog per Kategori (`/kategori/:categoryId`)
- Header kategori + breadcrumb
- Grid produk yang difilter berdasarkan kategori
- Produk dengan `stock = 0` tampil dengan badge **"Stok Habis"** (tidak bisa ditambah ke keranjang)

### Halaman Detail Produk (`/produk/:id`)
- Gambar produk (fallback ke placeholder generik jika `image_url` kosong)
- Nama, harga jual, deskripsi, info stok
- Tombol `+ Tambah ke Keranjang`
- Tombol `Pesan Langsung via WhatsApp` (langsung checkout 1 item)

### Halaman Keranjang (`/keranjang`)
- Daftar item: nama, qty (+ / -), subtotal
- Tombol hapus per item
- Total harga keseluruhan
- Tombol **"Pesan via WhatsApp"** → buka WA dengan pesan terformat

### Halaman Tentang (`/tentang`)
- Nama toko, alamat, nomor WA (klik → buka WA langsung)
- Diambil dari `store_settings`

---

## 5. Mekanisme Checkout via WhatsApp

Alur checkout **tidak memerlukan backend baru**. Semua proses terjadi di browser:

1. Pelanggan pilih produk → tambah ke keranjang (Zustand + localStorage)
2. Klik "Pesan via WhatsApp" di halaman keranjang
3. Aplikasi generate URL: `https://wa.me/62{phone}?text={encoded_message}`
4. Nomor WA: ambil dari `store_settings.phone` (strip leading 0, tambah 62)

**Format pesan:**
```
Halo Frema Mart 👋

Saya ingin memesan:

1. Nama Produk A x2 = Rp 20.000
2. Nama Produk B x1 = Rp 15.000

*Total: Rp 35.000*

Mohon konfirmasi ketersediaan dan metode pembayaran. Terima kasih 🙏
```

---

## 6. Sumber Data

| Data | Sumber Supabase | Filter |
|------|----------------|--------|
| Produk | Tabel `products` | `is_active = true` |
| Kategori | Tabel `categories` | — |
| Info toko & WA | Tabel `store_settings` | — |
| Gambar produk | Kolom `image_url` di `products` | Fallback ke placeholder jika null |

> **Penting:** Web Display hanya READ data. Update RLS Supabase agar role `anon` bisa SELECT tabel `products`, `categories`, `store_settings`.

---

## 7. Desain & UX

- **Target perangkat:** Mobile-first, max-width 430px (mirip Astronauts.id)
- **Desktop:** Content di-center, sisi kiri-kanan kosong / abu-abu
- **Font:** Poppins (Google Fonts)
- **Warna primer:** Hijau Frema Mart (`#2D7A4F` atau sesuai branding)
- **Warna background:** Putih (#FFFFFF), abu muda (#F5F5F5)
- **Komponen utama:**
  - Product card (gambar, nama, harga, tombol tambah)
  - Bottom navigation bar sticky
  - Badge "Stok Habis" merah
  - Floating cart button dengan counter item
  - Skeleton loading saat fetch data

---

## 8. Di Luar Scope (Tidak Dibuat)

- ❌ Payment gateway (Midtrans, dll) — pembayaran via WA saja
- ❌ Akun / login pelanggan
- ❌ Riwayat pesanan online yang tersimpan di database
- ❌ Notifikasi push, review/rating, promo otomatis
- ❌ Upload gambar produk (placeholder dulu)

---

## 9. Referensi

- UI Referensi: [Astronauts.id](https://www.astronauts.id/) — mobile-first marketplace
- WhatsApp URL API: `https://wa.me/{nomor}?text={pesan_encoded}`
- Supabase RLS docs: allow `anon` role SELECT

---

*Dokumen Final — v1.1 — 15 September 2026*
