import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlaceholderPage from '@/features/placeholder/PlaceholderPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
// Purchases (Phase 3)
import PurchaseListPage from '@/features/purchases/pages/PurchaseListPage';
import PurchaseFormPage from '@/features/purchases/pages/PurchaseFormPage';
import ReceiveGoodsPage from '@/features/purchases/pages/ReceiveGoodsPage';
import SupplierPage from '@/features/purchases/pages/SupplierPage';
import PurchaseDetailPage from '@/features/purchases/pages/PurchaseDetailPage';
// Expenses (Phase 3)
import ExpenseListPage from '@/features/expenses/pages/ExpenseListPage';
import ExpenseCategoryPage from '@/features/expenses/pages/ExpenseCategoryPage';
// Products
import ProductListPage from '@/features/products/pages/ProductListPage';
import ProductFormPage from '@/features/products/pages/ProductFormPage';
import CategoryPage from '@/features/products/pages/CategoryPage';
import StockOpnamePage from '@/features/products/pages/StockOpnamePage';
// POS
import POSTerminalPage from '@/features/pos/pages/POSTerminalPage';
import TransactionHistoryPage from '@/features/pos/pages/TransactionHistoryPage';
import SalesListPage from '@/features/pos/pages/SalesListPage';
import ReceiptPage from '@/features/pos/pages/ReceiptPage';
// Settings (Phase 4)
import StoreProfilePage from '@/features/settings/pages/StoreProfilePage';
import TaxSettingsPage from '@/features/settings/pages/TaxSettingsPage';
import PaymentMethodsPage from '@/features/settings/pages/PaymentMethodsPage';
import UserManagementPage from '@/features/settings/pages/UserManagementPage';
// Reports (Phase 4)
import SalesReportPage from '@/features/reports/pages/SalesReportPage';
import PurchaseReportPage from '@/features/reports/pages/PurchaseReportPage';
import InventoryReportPage from '@/features/reports/pages/InventoryReportPage';
import ExpenseReportPage from '@/features/reports/pages/ExpenseReportPage';
import ProfitLossReportPage from '@/features/reports/pages/ProfitLossReportPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  // POS Terminal — Full screen (no sidebar)
  {
    path: '/pos',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <POSTerminalPage />,
      },
      {
        path: 'receipt/:id',
        element: <ReceiptPage />,
      },
    ],
  },
  // Main Layout (Protected — sidebar)
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // Dashboard
          { index: true, element: <DashboardPage /> },

          // Products
          { path: 'products', element: <ProductListPage /> },
          { path: 'products/new', element: <ProductFormPage /> },
          { path: 'products/:id/edit', element: <ProductFormPage /> },
          { path: 'products/categories', element: <CategoryPage /> },
          { path: 'products/stock-opname', element: <StockOpnamePage /> },

          // Sales / List Penjualan (under Terminal POS)
          { path: 'sales', element: <SalesListPage /> },
          { path: 'pos/history', element: <SalesListPage /> },

          // Purchases (Phase 3)
          { path: 'purchases', element: <PurchaseListPage /> },
          { path: 'purchases/new', element: <PurchaseFormPage /> },
          { path: 'purchases/receive', element: <ReceiveGoodsPage /> },
          { path: 'purchases/:id/receive', element: <ReceiveGoodsPage /> },
          { path: 'purchases/suppliers', element: <SupplierPage /> },
          { path: 'purchases/:id', element: <PurchaseDetailPage /> },

          // Expenses (Phase 3)
          { path: 'expenses', element: <ExpenseListPage /> },
          { path: 'expenses/categories', element: <ExpenseCategoryPage /> },

          // Reports (Phase 4)
          { path: 'reports/sales', element: <SalesReportPage /> },
          { path: 'reports/purchases', element: <PurchaseReportPage /> },
          { path: 'reports/inventory', element: <InventoryReportPage /> },
          { path: 'reports/expenses', element: <ExpenseReportPage /> },
          { path: 'reports/profit-loss', element: <ProfitLossReportPage /> },

          // Settings (Phase 4)
          { path: 'settings/store', element: <StoreProfilePage /> },
          { path: 'settings/tax', element: <TaxSettingsPage /> },
          { path: 'settings/payments', element: <PaymentMethodsPage /> },
          { path: 'settings/users', element: <UserManagementPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
