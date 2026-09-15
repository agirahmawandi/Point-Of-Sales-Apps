# ✅ Task List — Web Display Frema Mart
> Status: Siap untuk dikerjakan  
> Gunakan: `[ ]` belum | `[/]` sedang | `[x]` selesai

---

## 🔲 PHASE A — Arsitektur & Routing

- [ ] Update RLS Supabase: tambahkan policy untuk `anon` role
  ```sql
  -- Jalankan di SQL Editor Supabase
  CREATE POLICY "anon can read products" ON products FOR SELECT TO anon USING (is_active = true);
  CREATE POLICY "anon can read categories" ON categories FOR SELECT TO anon USING (true);
  CREATE POLICY "anon can read store_settings" ON store_settings FOR SELECT TO anon USING (true);
  ```
- [ ] Refactor `App.tsx` / routing utama:
  - [ ] Pindahkan semua route POS ke bawah prefix `/pos-d5jm0seouq6bwhqy28ff8g30`
  - [ ] Tambahkan route publik di root `/` untuk Web Display
- [ ] Buat folder `src/features/storefront/`
- [ ] Buat `StorefrontLayout.tsx` (layout mobile-first, max-width 430px, bottom nav)

---

## 🔲 PHASE B — State Management Keranjang Publik

- [ ] Buat `src/stores/storefrontCartStore.ts`
  - [ ] State: `items[]`, `total`, `itemCount`
  - [ ] Actions: `addItem`, `removeItem`, `updateQty`, `clearCart`
  - [ ] Persistensi via `zustand/middleware` → `localStorage`
- [ ] Buat type `StorefrontCartItem` (productId, name, price, qty, imageUrl)

---

## 🔲 PHASE C — Komponen UI Reusable

- [ ] Buat `src/features/storefront/components/ProductCard.tsx`
  - [ ] Gambar produk (jika `image_url` null → tampilkan placeholder)
  - [ ] Nama produk, harga (format Rupiah)
  - [ ] Badge "Stok Habis" merah jika `stock = 0`
  - [ ] Tombol `+ Tambah` (disable jika stok 0)
  - [ ] Counter qty (+/-) jika sudah di keranjang
- [ ] Buat `src/features/storefront/components/CategoryCard.tsx`
  - [ ] Ikon/warna + nama kategori
  - [ ] Klik → navigate ke `/kategori/:id`
- [ ] Buat `src/features/storefront/components/BottomNav.tsx`
  - [ ] Tab: Beranda (Home) | Keranjang | Tentang
  - [ ] Badge counter item di ikon Keranjang
- [ ] Buat `src/features/storefront/components/FloatingCartButton.tsx`
  - [ ] Muncul saat keranjang tidak kosong
  - [ ] Tampilkan jumlah item dan total harga
  - [ ] Klik → navigate ke `/keranjang`
- [ ] Buat `src/features/storefront/components/ProductSkeleton.tsx`
  - [ ] Loading skeleton untuk product card

---

## 🔲 PHASE D — Halaman Beranda (`/`)

- [ ] Buat `src/features/storefront/pages/StorefrontHomePage.tsx`
  - [ ] Fetch semua produk (`is_active = true`) dari Supabase dengan role `anon`
  - [ ] Fetch semua kategori dari Supabase
  - [ ] Fetch info toko dari `store_settings`
  - [ ] Header: Logo placeholder / nama toko + search icon
  - [ ] Search bar: filter produk real-time by nama
  - [ ] Section "Kategori": grid ikon 4 kolom (dari `CategoryCard`)
  - [ ] Section "Semua Produk": grid 2 kolom (dari `ProductCard`)
  - [ ] Skeleton loading saat data belum ready
  - [ ] Empty state jika tidak ada produk
  - [ ] `FloatingCartButton` jika keranjang tidak kosong

---

## 🔲 PHASE E — Halaman Kategori (`/kategori/:categoryId`)

- [ ] Buat `src/features/storefront/pages/StorefrontCategoryPage.tsx`
  - [ ] Fetch nama kategori berdasarkan `:categoryId`
  - [ ] Fetch produk filter by `category_id` + `is_active = true`
  - [ ] Header: nama kategori + back button
  - [ ] Grid produk 2 kolom
  - [ ] Produk stok 0 tampil dengan badge "Stok Habis"
  - [ ] Empty state jika tidak ada produk di kategori

---

## 🔲 PHASE F — Halaman Detail Produk (`/produk/:id`)

- [ ] Buat `src/features/storefront/pages/StorefrontProductDetailPage.tsx`
  - [ ] Fetch produk by ID
  - [ ] Gambar besar (full width, aspect ratio 1:1, fallback placeholder)
  - [ ] Nama produk, harga, deskripsi, info stok tersedia
  - [ ] Tombol `+ Tambah ke Keranjang` (disabled jika stok 0)
  - [ ] Tombol `Pesan via WhatsApp` (langsung 1 item, tanpa keranjang)
  - [ ] Back button ke halaman sebelumnya

---

## 🔲 PHASE G — Halaman Keranjang (`/keranjang`)

- [ ] Buat `src/features/storefront/pages/StorefrontCartPage.tsx`
  - [ ] Tampilkan list item (nama, gambar kecil, qty, subtotal)
  - [ ] Tombol `+` / `-` untuk edit qty per item
  - [ ] Tombol hapus (🗑️) per item
  - [ ] Section total harga keseluruhan
  - [ ] Tombol **"Pesan via WhatsApp"**:
    - [ ] Ambil nomor WA dari `store_settings.phone`
    - [ ] Format nomor: strip `0` di depan, tambahkan `62`
    - [ ] Generate teks pesan terformat (lihat PRD section 5)
    - [ ] Encode pesan dengan `encodeURIComponent()`
    - [ ] Buka `https://wa.me/62xxx?text=...`
    - [ ] Setelah buka WA, tampilkan dialog konfirmasi & option clear cart
  - [ ] Empty state jika keranjang kosong + tombol "Mulai Belanja"

---

## 🔲 PHASE H — Halaman Tentang (`/tentang`)

- [ ] Buat `src/features/storefront/pages/StorefrontAboutPage.tsx`
  - [ ] Nama toko, alamat lengkap
  - [ ] Nomor WA (klik → buka chat WA langsung)
  - [ ] Email (jika ada)

---

## 🔲 PHASE I — Polish & QA

- [ ] Responsiveness: test di 375px (iPhone SE), 390px (iPhone 14), 430px (Plus)
  - [ ] Gunakan Chrome DevTools → Device Toolbar
- [ ] Pastikan bottom nav tidak menutupi konten terbawah (padding-bottom)
- [ ] Test checkout WA: pastikan format pesan benar di WA desktop & mobile
- [ ] Test empty state semua halaman
- [ ] Test produk stok 0 (badge muncul, tombol disabled)
- [ ] SEO: tambahkan `<title>` dan `<meta description>` per halaman publik
- [ ] Pastikan route POS lama masih bisa diakses via path baru

---

## 🔲 PHASE J — Deploy

- [ ] Update `App.tsx` dengan path secret POS baru: `pos-d5jm0seouq6bwhqy28ff8g30`
- [ ] Selesaikan Phase 10 POS (task_backend.md) sebelum deploy
- [ ] Deploy ke Vercel
- [ ] Verifikasi Web Display di `fremamart.vercel.app`
- [ ] Verifikasi POS di `pos.fremamart.vercel.app/pos-d5jm0seouq6bwhqy28ff8g30`
- [ ] Simpan URL secret POS di tempat yang aman

---

## 📊 Progress Summary

| Phase | Deskripsi | Status |
|-------|-----------|--------|
| A | Arsitektur & Routing | 🔲 Todo |
| B | Cart Store Publik | 🔲 Todo |
| C | Komponen UI | 🔲 Todo |
| D | Halaman Beranda | 🔲 Todo |
| E | Halaman Kategori | 🔲 Todo |
| F | Halaman Detail Produk | 🔲 Todo |
| G | Halaman Keranjang + WA | 🔲 Todo |
| H | Halaman Tentang | 🔲 Todo |
| I | Polish & QA | 🔲 Todo |
| J | Deploy | 🔲 Todo |

**Total: 0/~45 tasks selesai**

---

## 🔑 Catatan Penting

- **Secret Path POS:** `pos-d5jm0seouq6bwhqy28ff8g30` — SIMPAN DENGAN AMAN
- **Nomor WA Order:** Diambil dari kolom `phone` di `store_settings` (berlabel "Nomor Telepon / WhatsApp")
- **Gambar Produk:** Placeholder dulu, kolom `image_url` di tabel `products` akan terisi saat admin menginput gambar di masa depan
- **Stok 0:** Produk tetap tampil dengan badge "Stok Habis", tombol tambah di-disable

---

*Last updated: 15 September 2026 — v1.1*
