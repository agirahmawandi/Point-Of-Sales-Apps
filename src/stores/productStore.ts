import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Category } from '@/types';

interface ProductState {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reduceStock: (id: string, quantity: number) => void;
  addStock: (id: string, quantity: number) => void;
  updatePurchasePrice: (id: string, newPrice: number) => void;
  resetAllProductStocks: (toQuantity?: number) => void;
}

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Makanan' },
  { id: 'cat-2', name: 'Minuman' },
  { id: 'cat-3', name: 'Sembako' },
  { id: 'cat-4', name: 'Kebutuhan Rumah' },
];

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'SKU-001',
    name: 'Indomie Goreng',
    categoryId: 'cat-1',
    purchasePrice: 2800,
    sellingPrice: 3500,
    stock: 45,
    minStock: 10,
  },
  {
    id: 'prod-2',
    sku: 'SKU-002',
    name: 'Beras Premium 5kg',
    categoryId: 'cat-3',
    purchasePrice: 55000,
    sellingPrice: 65000,
    stock: 3,
    minStock: 10,
  },
  {
    id: 'prod-3',
    sku: 'SKU-003',
    name: 'Sabun Cuci Piring',
    categoryId: 'cat-4',
    purchasePrice: 6000,
    sellingPrice: 8500,
    stock: 0,
    minStock: 10,
  },
  {
    id: 'prod-4',
    sku: 'SKU-004',
    name: 'Es Teh Manis',
    categoryId: 'cat-2',
    purchasePrice: 2000,
    sellingPrice: 5000,
    stock: 60,
    minStock: 20,
  },
  {
    id: 'prod-5',
    sku: 'SKU-005',
    name: 'Roti Bakar',
    categoryId: 'cat-1',
    purchasePrice: 8000,
    sellingPrice: 12000,
    stock: 15,
    minStock: 10,
  },
];

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: mockProducts,
      categories: mockCategories,
      
      addProduct: (productData) => set((state) => ({
        products: [...state.products, { ...productData, id: `prod-${Date.now()}` }]
      })),
      
      updateProduct: (id, productData) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...productData } : p)
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      
      addCategory: (categoryData) => set((state) => ({
        categories: [...state.categories, { ...categoryData, id: `cat-${Date.now()}` }]
      })),
      
      updateCategory: (id, categoryData) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...categoryData } : c)
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),
      
      reduceStock: (id, quantity) => set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
        )
      })),

      addStock: (id, quantity) => set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, stock: p.stock + quantity } : p
        )
      })),

      updatePurchasePrice: (id, newPrice) => set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { 
            ...p, 
            purchasePrice: newPrice, 
            buyPrice: newPrice, 
            costPrice: newPrice,
            updatedAt: new Date().toISOString() 
          } : p
        )
      })),

      resetAllProductStocks: (toQuantity = 0) => set((state) => ({
        products: state.products.map(p => ({
          ...p,
          stock: toQuantity
        }))
      })),
    }),
    {
      name: 'pos-product-storage',
    }
  )
);
