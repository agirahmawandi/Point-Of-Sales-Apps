import React, { useState, useMemo } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useExpenseStore } from '@/stores/expenseStore';
import PageContainer from '@/components/layout/PageContainer';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function ProfitLossReportPage() {
  const { transactions } = useTransactionStore();
  const { expenses } = useExpenseStore();
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('30days');

  // Date filters
  const dateFilter = (dateObj: Date | string | undefined, startDate: Date, endDate: Date) => {
    if (!dateObj) return false;
    const txDate = new Date(dateObj);
    return isWithinInterval(txDate, { start: startDate, end: endDate });
  };

  const { filteredSales, filteredExpenses } = useMemo(() => {
    const now = new Date();
    let startDate = now;

    if (dateRange === 'today') startDate = startOfDay(now);
    else if (dateRange === '7days') startDate = subDays(startOfDay(now), 7);
    else if (dateRange === '30days') startDate = subDays(startOfDay(now), 30);
    else startDate = new Date(0); // all time

    return {
      filteredSales: transactions.filter(t => 
        dateFilter(t.date || t.createdAt, startDate, endOfDay(now)) &&
        (t.status === 'success' || t.status === 'sukses') &&
        t.paymentStatus !== 'tertunda'
      ),
      filteredExpenses: expenses.filter(e => dateFilter(e.date, startDate, endOfDay(now)))
    };
  }, [transactions, expenses, dateRange]);

  // Calculations
  const revenue = filteredSales.reduce((acc, t) => acc + (t.total || 0), 0);
  
  // Calculate COGS: either using explicit hpp or falling back to sum of (buyPrice * quantity)
  const cogs = filteredSales.reduce((acc, t) => {
    if (t.hpp && t.hpp > 0) return acc + t.hpp;
    
    // Fallback: sum of items (buyPrice * qty)
    const itemCogs = t.items.reduce((itemAcc, item) => {
      const buyPrice = item.buyPrice || 0;
      return itemAcc + (buyPrice * item.quantity);
    }, 0);
    
    return acc + itemCogs;
  }, 0);

  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const operatingExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - operatingExpenses;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(value));
  };

  return (
    <PageContainer
      title="Laporan Laba Rugi"
      description="Ringkasan kinerja keuangan toko (Pendapatan vs Pengeluaran)."
      actions={
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-slate-200/80 text-[13px] font-medium text-[#0b1c30] bg-white shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
          >
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>
          <button className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#0b1c30] text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2">
            <Download size={16} />
            <span>Ekspor PDF</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Net Profit Summary Card */}
        <div className={`p-6 rounded-2xl shadow-sm border ${netProfit >= 0 ? 'bg-gradient-to-br from-[#e6f4ea] to-white border-[#99cc66]' : 'bg-gradient-to-br from-[#ffdad6] to-white border-red-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${netProfit >= 0 ? 'bg-[#cae4c5] text-[#254222]' : 'bg-red-200 text-red-800'}`}>
                <DollarSign size={20} />
              </div>
              <span className="font-bold text-slate-700">Laba Bersih</span>
            </div>
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${netProfit >= 0 ? 'bg-[#cae4c5] text-[#254222]' : 'bg-red-200 text-red-800'}`}>
              {netMargin.toFixed(1)}% Margin
            </div>
          </div>
          <h2 className={`text-3xl font-bold ${netProfit >= 0 ? 'text-[#137333]' : 'text-red-600'}`}>
            {netProfit < 0 && '-'}{formatCurrency(netProfit)}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-[#0b1c30]">Rincian Laba Rugi (Profit & Loss Statement)</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {/* Pendapatan */}
          <div className="p-5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#0b1c30]">Pendapatan (Penjualan Kotor)</span>
              <span className="font-bold text-[#0b1c30]">{formatCurrency(revenue)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 pl-4">
              <span>Pendapatan Operasional</span>
              <span>{formatCurrency(revenue)}</span>
            </div>
          </div>

          {/* HPP */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#0b1c30]">Harga Pokok Penjualan (HPP)</span>
              <span className="font-bold text-red-600">({formatCurrency(cogs)})</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 pl-4">
              <span>Biaya Barang Terjual</span>
              <span>{formatCurrency(cogs)}</span>
            </div>
          </div>

          {/* Laba Kotor */}
          <div className="p-5 bg-[#eff4ff]/30 border-y-2 border-y-[#eff4ff]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3755c3]">Laba Kotor (Gross Profit)</span>
              <div className="text-right">
                <span className="font-bold text-[#3755c3]">{formatCurrency(grossProfit)}</span>
                <div className="text-xs text-[#3755c3] mt-0.5">Margin: {grossMargin.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Pengeluaran Operasional */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#0b1c30]">Pengeluaran Operasional</span>
              <span className="font-bold text-red-600">({formatCurrency(operatingExpenses)})</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 pl-4">
              <span>Beban Usaha & Operasional</span>
              <span>{formatCurrency(operatingExpenses)}</span>
            </div>
          </div>

          {/* Laba Bersih */}
          <div className={`p-6 border-t-4 ${netProfit >= 0 ? 'border-t-[#99cc66] bg-[#e6f4ea]/30' : 'border-t-red-400 bg-red-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-black ${netProfit >= 0 ? 'text-[#137333]' : 'text-red-700'}`}>
                Laba Bersih (Net Profit)
              </span>
              <div className="text-right">
                <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-[#137333]' : 'text-red-700'}`}>
                  {netProfit < 0 && '-'}{formatCurrency(netProfit)}
                </span>
                <div className={`text-sm font-bold mt-1 ${netProfit >= 0 ? 'text-[#137333]' : 'text-red-700'}`}>
                  Margin Bersih: {netMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
