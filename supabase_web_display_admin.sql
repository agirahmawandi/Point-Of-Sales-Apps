-- Menambahkan kolom pengaturan Web Display ke tabel store_settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS web_banners JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS web_description TEXT DEFAULT 'Selamat datang di Frema Mart Online!';

-- Menambahkan kolom visibilitas web ke tabel products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS show_on_web BOOLEAN DEFAULT TRUE;

-- Update RLS (Jika dibutuhkan untuk akses anon nantinya)
-- Saat ini tidak diubah karena web display admin masih berjalan sebagai authenticated admin
