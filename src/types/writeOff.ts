export interface ProductWriteOff {
  id: string;
  productId: string;
  productName?: string; // We'll populate this locally or via JOIN
  date: string;
  quantity: number;
  reason: string;
  lossAmount: number;
  createdAt: string;
}
