import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { useUiStore } from '@/stores/uiStore';
import { useProductStore } from '@/stores/productStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

export default function MainLayout() {
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const fetchProducts = useProductStore(state => state.fetchProducts);
  const fetchCategories = useProductStore(state => state.fetchCategories);
  const fetchTransactions = useTransactionStore(state => state.fetchTransactions);
  const fetchSuppliers = usePurchaseStore(state => state.fetchSuppliers);
  const fetchPurchaseOrders = usePurchaseStore(state => state.fetchPurchaseOrders);
  const fetchBankAccounts = useSettingsStore(state => state.fetchBankAccounts);

  React.useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchTransactions();
    fetchSuppliers();
    fetchPurchaseOrders();
    fetchBankAccounts();
  }, [fetchProducts, fetchCategories, fetchTransactions, fetchSuppliers, fetchPurchaseOrders, fetchBankAccounts]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
