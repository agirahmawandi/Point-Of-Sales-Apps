export type PaymentMethod = 'cash' | 'qris' | 'card' | 'tunai' | 'kartu' | 'piutang' | 'marketplace';
export type TransactionType = 'offline' | 'online';

export interface OnlineOrderDetails {
  marketplace: string;
  storeName: string;
  orderNumber: string;
  trackingNumber?: string;
  customerName: string;
  customerAddress?: string;
}

export interface TransactionItem {
  id?: string;
  productId: string;
  name?: string;
  productName?: string;
  sku?: string;
  price: number;
  buyPrice?: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  date?: Date | string;
  createdAt?: string;
  updatedAt?: string;
  transactionType?: TransactionType;
  onlineDetails?: OnlineOrderDetails;
  items: TransactionItem[];
  subtotal: number;
  discount?: number;
  discountPercent?: number;
  discountAmount?: number;
  tax?: number;
  taxPercent?: number;
  taxAmount?: number;
  total: number;
  hpp?: number;
  profit?: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  amountPaid?: number;
  paid?: number;
  change?: number;
  cashierId?: string;
  cashierName: string;
  marketplaceFee?: number;
  paymentTiming?: 'sekarang' | 'tertunda';
  paymentStatus?: 'lunas' | 'tertunda';
  status: 'success' | 'refunded' | 'sukses' | 'pending' | 'batal';
}
