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
import { useExpenseStore } from '@/stores/expenseStore';
import { useFinanceStore } from '@/stores/financeStore';
import { cn } from '@/lib/utils';

export default function MainLayout() {
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const fetchProducts = useProductStore(state => state.fetchProducts);
  const fetchProductCategories = useProductStore(state => state.fetchCategories);
  const fetchTransactions = useTransactionStore(state => state.fetchTransactions);
  const fetchSuppliers = usePurchaseStore(state => state.fetchSuppliers);
  const fetchPurchaseOrders = usePurchaseStore(state => state.fetchPurchaseOrders);
  const fetchBankAccounts = useSettingsStore(state => state.fetchBankAccounts);
  const fetchExpenseCategories = useExpenseStore(state => state.fetchCategories);
  const fetchExpenses = useExpenseStore(state => state.fetchExpenses);
  const fetchInvestors = useFinanceStore(state => state.fetchInvestors);
  const fetchCashBalances = useFinanceStore(state => state.fetchCashBalances);
  const fetchBalanceTransfers = useFinanceStore(state => state.fetchBalanceTransfers);
  const fetchProfitShares = useFinanceStore(state => state.fetchProfitShares);

  React.useEffect(() => {
    fetchProducts();
    fetchProductCategories();
    fetchTransactions();
    fetchSuppliers();
    fetchPurchaseOrders();
    fetchBankAccounts();
    fetchExpenseCategories();
    fetchExpenses();
    fetchInvestors();
    fetchCashBalances();
    fetchBalanceTransfers();
    fetchProfitShares();
  }, [
    fetchProducts, 
    fetchProductCategories, 
    fetchTransactions, 
    fetchSuppliers, 
    fetchPurchaseOrders, 
    fetchBankAccounts, 
    fetchExpenseCategories, 
    fetchExpenses,
    fetchInvestors,
    fetchCashBalances,
    fetchBalanceTransfers,
    fetchProfitShares
  ]);

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
