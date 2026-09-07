import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PurchaseOrder, Supplier } from '@/types/purchase';

interface PurchaseState {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  
  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases' | 'totalDebt'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;
  
  // PO Actions
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>) => string;
  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  getPurchaseOrder: (id: string) => PurchaseOrder | undefined;
  resetPurchaseOrders: () => void;
}

// Dummy initial data
const DUMMY_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'PT Indofood CBP Sukses Makmur',
    contactPerson: 'Budi Santoso',
    phone: '08123456789',
    address: 'Jl. Sudirman No. 1, Jakarta',
    totalPurchases: 15000000,
    totalDebt: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sup-2',
    name: 'CV Makmur Jaya',
    contactPerson: 'Siti Aminah',
    phone: '08987654321',
    address: 'Jl. Merdeka No. 45, Bandung',
    totalPurchases: 5000000,
    totalDebt: 1200000,
    createdAt: new Date().toISOString(),
  }
];

const DUMMY_POS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-0001',
    supplierId: 'sup-1',
    supplier: DUMMY_SUPPLIERS[0],
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Indomie Goreng',
        sku: 'SKU-001',
        quantity: 100,
        receivedQuantity: 0,
        buyPrice: 2800,
        subtotal: 280000,
      }
    ],
    totalAmount: 280000,
    status: 'draft',
    paymentStatus: 'sebagian',
    paidAmount: 0,
    notes: 'Kirim pagi hari',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      suppliers: DUMMY_SUPPLIERS,
      purchaseOrders: DUMMY_POS,

      // Supplier Actions
      addSupplier: (supplier) => set((state) => ({
        suppliers: [
          ...state.suppliers,
          {
            ...supplier,
            id: `sup-${Date.now()}`,
            totalPurchases: 0,
            totalDebt: 0,
            createdAt: new Date().toISOString(),
          },
        ],
      })),
      
      updateSupplier: (id, data) => set((state) => ({
        suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...data } : s),
      })),
      
      deleteSupplier: (id) => set((state) => ({
        suppliers: state.suppliers.filter(s => s.id !== id),
      })),

      getSupplier: (id) => get().suppliers.find(s => s.id === id),

      // PO Actions
      addPurchaseOrder: (po) => {
        const id = `po-${Date.now()}`;
        const date = new Date();
        const poNumber = `PO-${date.getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        set((state) => ({
          purchaseOrders: [
            {
              ...po,
              id,
              poNumber,
              createdAt: date.toISOString(),
              updatedAt: date.toISOString(),
            },
            ...state.purchaseOrders,
          ],
        }));
        
        return id;
      },

      updatePurchaseOrder: (id, data) => set((state) => ({
        purchaseOrders: state.purchaseOrders.map(po => po.id === id ? { ...po, ...data, updatedAt: new Date().toISOString() } : po),
      })),

      deletePurchaseOrder: (id) => set((state) => ({
        purchaseOrders: state.purchaseOrders.filter(po => po.id !== id),
      })),

      getPurchaseOrder: (id) => get().purchaseOrders.find(po => po.id === id),

      resetPurchaseOrders: () => set((state) => ({
        purchaseOrders: [],
        suppliers: state.suppliers.map(s => ({
          ...s,
          totalPurchases: 0,
          totalDebt: 0,
        }))
      })),
    }),
    {
      name: 'pos-purchase-storage',
    }
  )
);
