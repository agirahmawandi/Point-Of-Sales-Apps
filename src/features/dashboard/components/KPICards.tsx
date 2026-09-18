import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Loader2 } from 'lucide-react';

export default function KPICards({ isKasir = false }: { isKasir?: boolean }) {
  const { stats, isLoading, error } = useDashboardStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#3755c3]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <p className="font-semibold">Gagal memuat data ringkasan.</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const { omzet, hpp, expense, laba, lowStockCount, piutang = 0, hutang = 0 } = stats;
  const margin = omzet > 0 ? ((laba / omzet) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Card 1: Omzet Hari Ini */}
      <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate" title="Total Sales Yang Telah Dibayar">TOTAL SALES YANG TELAH DIBAYAR</span>
            <div className="w-10 h-10 rounded-xl bg-[#cae4c5]/30 text-[#254222] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-[16px] font-semibold text-[#76777d]">Rp</span>
            <span className="text-2xl font-bold text-[#254222]">{formatCurrency(omzet)}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-[#76777d] truncate">Penjualan Telah Dibayar</span>
          </div>
          <Link to="/sales?tab=lunas" className="text-sm font-bold text-[#254222] hover:underline inline-flex items-center gap-1 whitespace-nowrap">
            Lihat <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Card 2: HPP Hari Ini */}
      {!isKasir && (
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate">HPP</span>
            <div className="w-10 h-10 rounded-xl bg-[#cae4c5]/25 text-[#254222] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-[16px] font-semibold text-[#76777d]">Rp</span>
            <span className="text-2xl font-bold text-[#254222]">{formatCurrency(hpp)}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-[#76777d] truncate">Harga Pokok Penjualan</span>
          </div>
        </div>
      </div>
      )}

      {/* Card 3: Laba Bersih */}
      {!isKasir && (
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate">Laba Bersih</span>
              <span className="px-1.5 py-0.5 rounded bg-[#ece2b1] text-[#254222] text-[11px] font-bold whitespace-nowrap shrink-0">{margin}% Net</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#cae4c5]/40 text-[#254222] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-[16px] font-semibold text-[#254222]">Rp</span>
            <span className="text-2xl font-bold text-[#254222]">{formatCurrency(laba)}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-[#76777d] truncate">Beban Ops: Rp {formatCurrency(expense)}</span>
          </div>
        </div>
      </div>
      )}

      {/* Card 4: Total Piutang */}
      <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate">Piutang Pelanggan</span>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">pending_actions</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-[16px] font-semibold text-orange-600">Rp</span>
            <span className="text-2xl font-bold text-orange-600">{formatCurrency(piutang)}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-[#76777d] truncate">Penjualan Belum Dibayar</span>
          </div>
          <Link to="/sales?tab=pending" className="text-sm font-bold text-[#254222] hover:underline inline-flex items-center gap-1 whitespace-nowrap">
            Lihat <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Card 5: Total Hutang */}
      {!isKasir && (
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate">Hutang Supplier</span>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">money_off</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-[16px] font-semibold text-red-600">Rp</span>
            <span className="text-2xl font-bold text-red-600">{formatCurrency(hutang)}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-[#76777d] truncate">Pembelian Belum Lunas</span>
          </div>
          <Link to="/purchases?tab=utang" className="text-sm font-bold text-[#254222] hover:underline inline-flex items-center gap-1 whitespace-nowrap">
            Lihat <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
      )}

      {/* Card 6: Peringatan Stok */}
      <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate">Peringatan Stok</span>
            <div className="w-10 h-10 rounded-xl bg-[#ece2b1] text-[#254222] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">inventory</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-2xl font-bold text-[#254222]">{lowStockCount}</span>
            <span className="text-sm font-semibold text-[#254222] ml-1">Produk</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          {lowStockCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ece2b1] text-[#254222] text-[11px] font-bold uppercase whitespace-nowrap">
              Perlu Restock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#cae4c5] text-[#254222] text-[11px] font-bold uppercase whitespace-nowrap">
              Stok Aman
            </span>
          )}
          <Link to="/products" className="text-sm font-bold text-[#254222] hover:underline inline-flex items-center gap-1 whitespace-nowrap">
            Lihat Produk <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
