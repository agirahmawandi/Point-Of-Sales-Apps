import type { PurchaseOrderStatus, PaymentStatus } from './common';
export type { PurchaseOrderStatus, PaymentStatus };

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  totalDebt: number;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  receivedQuantity: number;
  buyPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  dueDate?: string;
  notes?: string;
  paymentNotes?: string;
  createdAt: string;
  updatedAt: string;
}
