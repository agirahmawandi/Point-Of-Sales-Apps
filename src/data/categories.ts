import type { ProductCategory } from '@/types';

export const categories: ProductCategory[] = [
  {
    id: 'cat-1',
    name: 'Sembako',
    description: 'Bahan kebutuhan pokok sehari-hari seperti beras, gula, minyak, dan telur',
    productCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Makanan & Minuman',
    description: 'Produk mi instan, bumbu dapur, dan aneka bahan makanan olahan',
    productCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Snack & Camilan',
    description: 'Makanan ringan, keripik, wafer, biskuit, dan camilan santai',
    productCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Minuman Kemasan',
    description: 'Air mineral, teh siap minum, susu kotak UHT, dan minuman isotonik',
    productCount: 4,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Perlengkapan Mandi',
    description: 'Sabun mandi, pasta gigi, sikat gigi, sampo, dan perawatan tubuh',
    productCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-6',
    name: 'Peralatan Rumah Tangga',
    description: 'Deterjen cuci, sabun cuci piring, tisu, dan alat kebersihan rumah',
    productCount: 4,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockCategories = categories;
