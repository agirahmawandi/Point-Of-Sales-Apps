import { create } from 'zustand';
import type { TransactionItem, TransactionType, OnlineOrderDetails } from '@/types';
import { useProductStore } from './productStore';

interface CartState {
  items: TransactionItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  marketplaceFee: number;
  total: number;
  
  transactionType: TransactionType;
  onlineDetails?: OnlineOrderDetails;
  customerId?: string;
  customerName?: string;
  
  setTransactionType: (type: TransactionType) => void;
  setOnlineDetails: (details?: OnlineOrderDetails) => void;
  setMarketplaceFee: (fee: number) => void;
  setCustomer: (id?: string, name?: string) => void;
  
  addItem: (productId: string, name: string, price: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemPrice: (id: string, price: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  
  setDiscount: (percentage: number) => void;
  setTax: (percentage: number) => void;
}

const calculateTotals = (
  items: TransactionItem[], 
  discountPercentage: number, 
  taxPercentage: number,
  transactionType: TransactionType = 'offline',
  marketplaceFee: number = 0
) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const afterDiscount = subtotal - discountAmount;
  
  if (transactionType === 'online') {
    // For online transactions: tax is replaced by marketplace deduction (potongan marketplace)
    const taxAmount = 0;
    const total = Math.max(0, afterDiscount - marketplaceFee);
    return { subtotal, discountAmount, taxAmount, total };
  } else {
    // For offline transactions: standard tax percentage (e.g. 11% PPN)
    const taxAmount = afterDiscount * (taxPercentage / 100);
    const total = afterDiscount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  }
};

export const useCartStore = create<CartState>()(
  (set, get) => ({
    items: [],
    subtotal: 0,
    discountPercentage: 0,
    discountAmount: 0,
    taxPercentage: 11, // Default 11% PPN
    taxAmount: 0,
    marketplaceFee: 0,
    total: 0,

    transactionType: 'offline',
    onlineDetails: undefined,
    customerId: undefined,
    customerName: undefined,

    setTransactionType: (type) => set((state) => ({ 
      transactionType: type,
      ...calculateTotals(state.items, state.discountPercentage, state.taxPercentage, type, state.marketplaceFee)
    })),
    setOnlineDetails: (details) => set({ onlineDetails: details }),
    setMarketplaceFee: (fee) => set((state) => {
      const safeFee = Math.max(0, fee || 0);
      return {
        marketplaceFee: safeFee,
        ...calculateTotals(state.items, state.discountPercentage, state.taxPercentage, state.transactionType, safeFee)
      };
    }),
    setCustomer: (id, name) => set({ customerId: id, customerName: name }),

    addItem: (productId, name, price) => set((state) => {
      const existingItem = state.items.find(item => item.productId === productId);
      let newItems;
      
      // Get current stock
      const product = useProductStore.getState().products.find(p => p.id === productId);
      const stock = product ? product.stock : 0;
      
      if (existingItem) {
        if (existingItem.quantity >= stock) return state; // Prevent adding more than stock
        
        newItems = state.items.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        if (stock <= 0) return state; // Prevent adding out of stock
        
        newItems = [...state.items, {
          id: `item-${Date.now()}`,
          productId,
          name,
          price,
          buyPrice: product?.buyPrice || 0,
          quantity: 1,
          subtotal: price
        }];
      }
      
      return {
        items: newItems,
        ...calculateTotals(newItems, state.discountPercentage, state.taxPercentage, state.transactionType, state.marketplaceFee)
      };
    }),

    updateQuantity: (id, quantity) => set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.id !== id);
        return {
          items: newItems,
          ...calculateTotals(newItems, state.discountPercentage, state.taxPercentage, state.transactionType, state.marketplaceFee)
        };
      }
      
      const itemToUpdate = state.items.find(i => i.id === id);
      if (!itemToUpdate) return state;
      
      // check stock
      const product = useProductStore.getState().products.find(p => p.id === itemToUpdate.productId);
      const stock = product ? product.stock : 0;
      const safeQuantity = Math.min(quantity, stock);
      
      const newItems = state.items.map(item => 
        item.id === id 
          ? { ...item, quantity: safeQuantity, subtotal: safeQuantity * item.price }
          : item
      );
      
      return {
        items: newItems,
        ...calculateTotals(newItems, state.discountPercentage, state.taxPercentage, state.transactionType, state.marketplaceFee)
      };
    }),

    updateItemPrice: (id, price) => set((state) => {
      const safePrice = Math.max(0, price || 0);
      const newItems = state.items.map(item => 
        item.id === id 
          ? { ...item, price: safePrice, subtotal: item.quantity * safePrice }
          : item
      );
      return {
        items: newItems,
        ...calculateTotals(newItems, state.discountPercentage, state.taxPercentage, state.transactionType, state.marketplaceFee)
      };
    }),

    removeItem: (id) => set((state) => {
      const newItems = state.items.filter(item => item.id !== id);
      return {
        items: newItems,
        ...calculateTotals(newItems, state.discountPercentage, state.taxPercentage, state.transactionType, state.marketplaceFee)
      };
    }),

    clearCart: () => set(() => ({
      items: [],
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      marketplaceFee: 0,
      total: 0,
      onlineDetails: undefined,
      customerId: undefined,
      customerName: undefined,
      transactionType: 'offline',
    })),
    
    setDiscount: (percentage) => set((state) => ({
      discountPercentage: percentage,
      ...calculateTotals(state.items, percentage, state.taxPercentage, state.transactionType, state.marketplaceFee)
    })),
    
    setTax: (percentage) => set((state) => ({
      taxPercentage: percentage,
      ...calculateTotals(state.items, state.discountPercentage, percentage, state.transactionType, state.marketplaceFee)
    }))
  })
);
