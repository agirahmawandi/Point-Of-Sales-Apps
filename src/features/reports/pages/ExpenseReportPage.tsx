import React, { useState, useMemo, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { supabase } from '@/lib/supabase';
import type { Expense } from '@/types/expense';
import { useExpenseStore } from '@/stores/expenseStore'; // we keep this to map category names if needed
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Download, Receipt, Wallet, TrendingUp, Loader2 } from 'lucide-react';

export default function ExpenseReportPage() {
  const { categories } = useExpenseStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('30days');

  // Filter expenses based on date range
  // Fetch expenses from Supabase
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('expenses').select('*');

        if (dateRange !== 'all') {
          const now = new Date();
          let startDate = startOfDay(now);

          if (dateRange === '7days') startDate = subDays(startOfDay(now), 7);
          if (dateRange === '30days') startDate = subDays(startOfDay(now), 30);

          query = query.gte('date', startDate.toISOString())
                       .lte('date', endOfDay(now).toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;
        
        const mappedData = (data || []).map((row: any) => ({
          ...row,
          categoryId: row.category_id,
          createdAt: row.created_at
        }));
        
        setExpenses(mappedData as Expense[]);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, [dateRange]);

  // Calculate KPIs
  const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalTransactions = expenses.length;
  
  // Prepare chart data (Group by date)
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach(exp => {
      const dateStr = format(new Date(exp.date), 'dd MMM', { locale: localeId });
      grouped[dateStr] = (grouped[dateStr] || 0) + exp.amount;
    });
    
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date + ' ' + new Date().getFullYear()).getTime() - new Date(b.date + ' ' + new Date().getFullYear()).getTime());
  }, [expenses]);

  // Group by category
  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach(exp => {
      const catName = exp.category?.name || categories.find(c => c.id === exp.categoryId)?.name || 'Lainnya';
      grouped[catName] = (grouped[catName] || 0) + exp.amount;
    });
    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, categories]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <PageContainer
      title="Laporan Pengeluaran"
      description="Analisis beban operasional dan biaya lainnya."
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
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl mt-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#ba1a1a]" />
        </div>
      )}
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#76777d] mb-1">Total Pengeluaran</p>
            <h3 className="text-xl font-bold text-[#ba1a1a]">{formatCurrency(totalExpense)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#3755c3] flex items-center justify-center shrink-0">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#76777d] mb-1">Total Pencatatan</p>
            <h3 className="text-xl font-bold text-[#0b1c30]">{totalTransactions} <span className="text-sm font-normal text-slate-500">transaksi</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-[#0b1c30] mb-6">Tren Pengeluaran</h3>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#76777d' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#76777d' }} 
                    tickFormatter={(value) => `Rp ${value / 1000}k`}
                  />
                  <RechartsTooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Pengeluaran']}
                    labelStyle={{ color: '#0b1c30', fontWeight: 'bold', marginBottom: '4px' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    cursor={{ fill: '#ffdad6', opacity: 0.4 }}
                  />
                  <Bar dataKey="amount" fill="#ba1a1a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p>Tidak ada data untuk rentang waktu ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-[#0b1c30] mb-6">Berdasarkan Kategori</h3>
          <div className="space-y-4">
            {categoryData.length > 0 ? categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm text-[#ba1a1a]">
                    <Wallet size={18} />
                  </div>
                  <span className="text-sm font-semibold text-[#0b1c30] capitalize">{cat.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#0b1c30]">{formatCurrency(cat.amount)}</div>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-slate-400 py-8">Belum ada pengeluaran</p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
