import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/types/transaction';
import type { Expense } from '@/types/expense';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Download, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';

export default function ProfitLossReportPage() {
  const [filteredSales, setFilteredSales] = useState<Transaction[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filteredWriteOffs, setFilteredWriteOffs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch Data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

        // Fetch sales
        let salesQuery = supabase
          .from('transactions')
          .select(`*, items:transaction_items(*)`)
          .in('status', ['success', 'sukses'])
          .not('payment_status', 'eq', 'tertunda')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        // Fetch expenses
        let expensesQuery = supabase
          .from('expenses')
          .select('*')
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString());

        // Fetch write-offs
        let writeOffsQuery = supabase
          .from('product_write_offs')
          .select('*')
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString());

        const [salesRes, expensesRes, writeOffsRes] = await Promise.all([salesQuery, expensesQuery, writeOffsQuery]);
        
        if (salesRes.error) throw salesRes.error;
        if (expensesRes.error) throw expensesRes.error;
        if (writeOffsRes.error) throw writeOffsRes.error;

        setFilteredSales(salesRes.data as Transaction[] || []);
        setFilteredExpenses(expensesRes.data as Expense[] || []);
        setFilteredWriteOffs(writeOffsRes.data || []);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear]);

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
  const totalWriteOffs = filteredWriteOffs.reduce((acc, w) => acc + Number(w.loss_amount), 0);
  
  const netProfit = grossProfit - operatingExpenses - totalWriteOffs;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(value));
  };

  return (
    <PageContainer
      title="Laporan Laba Rugi"
      description="Ringkasan kinerja keuangan toko (Pendapatan vs Pengeluaran)."
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="h-10 px-3 rounded-xl border border-slate-200/80 text-[13px] font-medium text-[#0b1c30] bg-white shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {format(new Date(2000, i, 1), 'MMMM', { locale: localeId })}
              </option>
            ))}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-10 px-3 rounded-xl border border-slate-200/80 text-[13px] font-medium text-[#0b1c30] bg-white shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <button className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#0b1c30] text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2">
            <Download size={16} />
            <span>Ekspor PDF</span>
          </button>
        </div>
      }
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl mt-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#3755c3]" />
        </div>
      )}
      
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
              <span className="font-bold text-[#0b1c30]">Pengeluaran Operasional & Kerugian</span>
              <span className="font-bold text-red-600">({formatCurrency(operatingExpenses + totalWriteOffs)})</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 pl-4 mb-1">
              <span>Beban Usaha & Operasional</span>
              <span>{formatCurrency(operatingExpenses)}</span>
            </div>
            {totalWriteOffs > 0 && (
              <div className="flex items-center justify-between text-sm text-slate-500 pl-4 border-t border-slate-100 pt-1 mt-1">
                <span>Kerugian Barang Rusak (Write-offs)</span>
                <span>{formatCurrency(totalWriteOffs)}</span>
              </div>
            )}
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
