import React, { useState } from 'react';
import KPICards from '../components/KPICards';
import RecentTransactions from '../components/RecentTransactions';
import RevenueChart from '@/components/charts/RevenueChart';
import TopProductsChart from '@/components/charts/TopProductsChart';
import CashFlowChart from '@/components/charts/CashFlowChart';
import PaymentMethodSummary from '../components/PaymentMethodSummary';
import { useProductStore } from '@/stores/productStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShoppingBag, 
  Truck, 
  Receipt, 
  Boxes,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { products, resetAllProductStocks } = useProductStore();
  const { resetTransactions } = useTransactionStore();
  const { resetPurchaseOrders } = usePurchaseStore();
  const { resetExpenses } = useExpenseStore();
  const { clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const isAdmin = user?.role === 'admin';

  const handleExecuteReset = () => {
    // 1. Reset Penjualan (Sales)
    resetTransactions();

    // 2. Reset Pembelian (Purchase Orders & Hutang Supplier)
    resetPurchaseOrders();

    // 3. Reset Pengeluaran (Expenses)
    resetExpenses();

    // 4. Reset Kuantitas Stok Semua Produk ke 0
    resetAllProductStocks(0);

    // 5. Bersihkan keranjang kasir
    clearCart();

    setIsResetModalOpen(false);
    setIsResetSuccess(true);
    toast.success('Semua transaksi (Sales, Purchase, Expense) dan stok produk berhasil direset!');

    setTimeout(() => {
      setIsResetSuccess(false);
    }, 4500);
  };
  return (
    <div className="flex flex-col w-full space-y-6">

      {/* Operational Alerts Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#cae4c5]/30 border border-[#cae4c5]/60 px-4 py-3 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#cae4c5] text-[#254222] font-semibold">
            <span className="material-symbols-outlined text-[#254222] text-[18px]">badge</span>
            <span className="text-[12px] font-bold">Shift Aktif</span>
          </div>
          {lowStockCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ece2b1] text-[#254222] font-semibold">
              <span className="material-symbols-outlined text-[#254222] text-[18px]">warning</span>
              <span className="text-[12px] font-bold">{lowStockCount} produk mencapai batas minimum stok</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#76777d] font-medium">Sinkronisasi Cloud: 14:35:12 WIB</span>
          <span className="w-2 h-2 rounded-full bg-[#99cc66] animate-pulse"></span>
        </div>
      </div>

      {/* Page Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#254222] tracking-tight">Dashboard Overview</h1>
            {isAdmin && (
              <button
                onClick={() => setIsResetModalOpen(true)}
                title="Reset Seluruh Transaksi & Stok Produk (Admin Only)"
                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:shadow-red-200 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0"
              >
                <RotateCcw size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <p className="text-[14px] text-[#45464d] mt-1">Ringkasan performa penjualan, keuangan, dan status operasional hari ini.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector Dropdown */}
          <div className="relative">
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-[#254222] shadow-sm hover:bg-[#cae4c5]/30 transition-colors border border-[#cae4c5]/60">
              <span className="material-symbols-outlined text-[#76777d] text-[18px]">event</span>
              <span className="text-[12px] font-semibold">Hari Ini (4 Sep 2026)</span>
              <span className="material-symbols-outlined text-[#76777d] text-[16px]">arrow_drop_down</span>
            </button>
          </div>

          {/* Download Report */}
          <button className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#254222] text-[#ece2b1] text-[12px] font-bold hover:bg-[#1b3119] transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Unduh Laporan</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {isResetSuccess && (
        <div className="flex items-center justify-between p-4 bg-[#cae4c5] border border-[#99cc66] rounded-xl text-[#254222] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#254222] shrink-0" />
            <div>
              <p className="font-bold text-[14px]">Reset Data Berhasil Dilakukan!</p>
              <p className="text-[12px] opacity-90">Seluruh transaksi (Sales, Purchase, Expense) telah dikosongkan dan stok produk diatur ulang menjadi 0 unit.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsResetSuccess(false)}
            className="p-1 hover:bg-black/10 rounded-lg text-[#254222]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <KPICards />

      {/* Payment Methods Summary + Revenue Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <RevenueChart />
        </div>
        <div className="xl:col-span-4">
          <PaymentMethodSummary />
        </div>
      </div>

      {/* Bottom Section: Top Sellers / Cash Flow / Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <TopProductsChart />
        </div>
        <div className="xl:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <CashFlowChart />
        </div>
        <div className="xl:col-span-5 bg-white rounded-xl shadow-sm border border-slate-100 p-6 overflow-hidden">
          <RecentTransactions />
        </div>
      </div>

      {/* Modal Konfirmasi Reset Total Data */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-red-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Reset Total Data Sistem</h3>
                    <p className="text-xs text-red-100 mt-0.5">Konfirmasi penghapusan data operasional & stok</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#45464d] leading-relaxed">
                Tindakan ini akan mereset dan mengosongkan komponen data berikut secara permanen:
              </p>

              {/* Rincian Komponen yang direset */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-lg bg-[#cae4c5] text-[#254222] shrink-0 mt-0.5">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#254222]">Semua Transaksi Penjualan (Sales)</div>
                    <div className="text-[11px] text-slate-500">Riwayat transaksi kasir offline & online dihapus, omzet kembali ke Rp 0.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-lg bg-[#cae4c5] text-[#254222] shrink-0 mt-0.5">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#254222]">Semua Pembelian Barang (Purchase Orders)</div>
                    <div className="text-[11px] text-slate-500">Seluruh pesanan pembelian (PO) dan catatan saldo hutang supplier dikosongkan.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-lg bg-[#cae4c5] text-[#254222] shrink-0 mt-0.5">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#254222]">Semua Pengeluaran (Expenses)</div>
                    <div className="text-[11px] text-slate-500">Seluruh pencatatan beban operasional dan total per kategori dikosongkan ke Rp 0.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50/70 border border-red-100">
                  <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0 mt-0.5">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-800">Kuantitas Stok Semua Produk (Qty Stok = 0)</div>
                    <div className="text-[11px] text-red-600">Seluruh stok barang pada katalog produk akan diatur ulang menjadi 0 unit.</div>
                  </div>
                </div>
              </div>

              {/* Warning Notice Box */}
              <div className="p-3 bg-[#ece2b1]/40 border border-[#ece2b1] rounded-xl text-xs text-[#254222] flex items-center gap-2">
                <span className="font-bold text-amber-800">Catatan:</span>
                <span>Daftar master produk dan kategori tetap tersimpan, hanya stok dan transaksi yang dibersihkan.</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg hover:shadow-red-200 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Reset Semua Data Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
