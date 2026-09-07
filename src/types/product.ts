export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductCategory = Category;

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  category?: Category | string;
  description?: string;
  purchasePrice?: number;
  costPrice?: number;
  buyPrice?: number;
  sellingPrice?: number;
  sellPrice?: number;
  stock: number;
  minStock: number;
  imageUrl?: string;
  unit?: string;
  isActive?: boolean;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
}
