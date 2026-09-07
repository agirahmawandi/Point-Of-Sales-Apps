import React, { useState, useMemo } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import PageContainer from '@/components/layout/PageContainer';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Download, TrendingUp, ShoppingBag, CreditCard } from 'lucide-react';

export default function SalesReportPage() {
  const { transactions } = useTransactionStore();
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('30days');

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    if (dateRange === 'all') return transactions;

    const now = new Date();
    let startDate = now;

    if (dateRange === 'today') {
      startDate = startOfDay(now);
    } else if (dateRange === '7days') {
      startDate = subDays(startOfDay(now), 7);
    } else if (dateRange === '30days') {
      startDate = subDays(startOfDay(now), 30);
    }

    return transactions.filter(t => {
      const txDate = new Date(t.date || t.createdAt || new Date());
      return isWithinInterval(txDate, { start: startDate, end: endOfDay(now) });
    });
  }, [transactions, dateRange]);

  // Calculate KPIs
  const totalRevenue = filteredTransactions.reduce((acc, t) => acc + (t.total || 0), 0);
  const totalTransactions = filteredTransactions.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  const paymentMethodData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      counts[t.paymentMethod] = (counts[t.paymentMethod] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // Prepare chart data (Group by date)
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      const dateStr = format(new Date(t.date || t.createdAt || new Date()), 'dd MMM', { locale: localeId });
      grouped[dateStr] = (grouped[dateStr] || 0) + (t.total || 0);
    });
    
    return Object.entries(grouped)
      .map(([date, revenue]) => ({ date, revenue }))
      .reverse(); // Ensure chronological order if transactions are sorted newest first
  }, [filteredTransactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <PageContainer
      title="Laporan Penjualan"
      description="Analisis performa penjualan, tren pendapatan, dan metode pembayaran."
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
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#3755c3] flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#76777d] mb-1">Total Pendapatan</p>
            <h3 className="text-xl font-bold text-[#0b1c30]">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#76777d] mb-1">Total Transaksi</p>
            <h3 className="text-xl font-bold text-[#0b1c30]">{totalTransactions} <span className="text-sm font-normal text-slate-500">struk</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#fef3c7] text-[#92400e] flex items-center justify-center shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#76777d] mb-1">Rata-rata Transaksi</p>
            <h3 className="text-xl font-bold text-[#0b1c30]">{formatCurrency(averageOrderValue)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-[#0b1c30] mb-6">Tren Pendapatan</h3>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#76777d' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#76777d' }} 
                    tickFormatter={(value) => `Rp ${value / 1000}k`}
                  />
                  <RechartsTooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Pendapatan']}
                    labelStyle={{ color: '#0b1c30', fontWeight: 'bold', marginBottom: '4px' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3755c3" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3755c3', strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p>Tidak ada data untuk rentang waktu ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-[#0b1c30] mb-6">Metode Pembayaran</h3>
          <div className="space-y-4">
            {paymentMethodData.length > 0 ? paymentMethodData.map((pm, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm text-slate-500">
                    <CreditCard size={18} />
                  </div>
                  <span className="text-sm font-semibold text-[#0b1c30] capitalize">{pm.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#3755c3]">{pm.value}</div>
                  <div className="text-[11px] text-slate-500">transaksi</div>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-slate-400 py-8">Belum ada transaksi</p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
