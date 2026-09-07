import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTransactionStore } from '@/stores/transactionStore';
import { useProductStore } from '@/stores/productStore';
import { useExpenseStore } from '@/stores/expenseStore';

export default function KPICards() {
  const { transactions } = useTransactionStore();
  const { products } = useProductStore();
  const { expenses } = useExpenseStore();

  const kpi = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let omzetToday = 0;
    let hppToday = 0;
    let expenseToday = 0;

    // Hitung Omzet & HPP (Hanya hari ini)
    transactions.forEach(trx => {
      const trxDate = new Date(trx.date || trx.createdAt || Date.now());
      if (trxDate >= today && trx.status === 'success') {
        omzetToday += trx.total;
        
        // Hitung HPP
        trx.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            hppToday += (product.purchasePrice || product.buyPrice || 0) * item.quantity;
          }
        });
      }
    });

    // Hitung Pengeluaran Operasional (Hanya hari ini)
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate >= today) {
        expenseToday += exp.amount;
      }
    });

    // Laba Bersih = Omzet - HPP - Expense
    const labaBersih = omzetToday - hppToday - expenseToday;
    
    // Low Stock Alert
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

    // Kalkulasi margin
    const margin = omzetToday > 0 ? ((labaBersih / omzetToday) * 100).toFixed(1) : '0.0';

    return {
      omzetToday,
      hppToday,
      expenseToday,
      labaBersih,
      margin,
      lowStockCount
    };
  }, [transactions, products, expenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Card 1: Omzet Hari Ini */}
      <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate">Omzet Hari Ini</span>
            <div className="w-10 h-10 rounded-xl bg-[#cae4c5]/30 text-[#254222] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-[16px] font-semibold text-[#76777d]">Rp</span>
            <span className="text-2xl font-bold text-[#254222]">{formatCurrency(kpi.omzetToday)}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#cae4c5] text-[#254222] text-xs font-bold shrink-0">
              Dari POS
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: HPP Hari Ini */}
      <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate">HPP Hari Ini</span>
            <div className="w-10 h-10 rounded-xl bg-[#cae4c5]/25 text-[#254222] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-[16px] font-semibold text-[#76777d]">Rp</span>
            <span className="text-2xl font-bold text-[#254222]">{formatCurrency(kpi.hppToday)}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-[#76777d] truncate">Harga Pokok Penjualan</span>
          </div>
        </div>
      </div>

      {/* Card 3: Laba Bersih */}
      <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate">Laba Bersih</span>
              <span className="px-1.5 py-0.5 rounded bg-[#ece2b1] text-[#254222] text-[11px] font-bold whitespace-nowrap shrink-0">{kpi.margin}% Net</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#cae4c5]/40 text-[#254222] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-[16px] font-semibold text-[#254222]">Rp</span>
            <span className="text-2xl font-bold text-[#254222]">{formatCurrency(kpi.labaBersih)}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-[#76777d] truncate">Beban Ops: Rp {formatCurrency(kpi.expenseToday)}</span>
          </div>
        </div>
      </div>

      {/* Card 4: Peringatan Stok */}
      <div className="p-4 rounded-xl bg-white shadow-sm border border-[#cae4c5]/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 h-10 mb-2">
            <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider truncate">Peringatan Stok</span>
            <div className="w-10 h-10 rounded-xl bg-[#ece2b1] text-[#254222] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">inventory</span>
            </div>
          </div>
          <div className="h-10 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-2xl font-bold text-[#254222]">{kpi.lowStockCount}</span>
            <span className="text-sm font-semibold text-[#254222] ml-1">Produk</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#cae4c5]/30 flex items-center justify-between gap-2">
          {kpi.lowStockCount > 0 ? (
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
