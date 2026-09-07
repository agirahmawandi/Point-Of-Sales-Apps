import React, { useState, useMemo } from 'react';
import { usePurchaseStore } from '@/stores/purchaseStore';
import PageContainer from '@/components/layout/PageContainer';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Download, ShoppingCart, TrendingDown, Clock } from 'lucide-react';

export default function PurchaseReportPage() {
  const { purchaseOrders } = usePurchaseStore();
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('30days');

  // Filter purchase orders based on date range
  const filteredPOs = useMemo(() => {
    if (dateRange === 'all') return purchaseOrders;

    const now = new Date();
    let startDate = now;

    if (dateRange === 'today') {
      startDate = startOfDay(now);
    } else if (dateRange === '7days') {
      startDate = subDays(startOfDay(now), 7);
    } else if (dateRange === '30days') {
      startDate = subDays(startOfDay(now), 30);
    }

    return purchaseOrders.filter(po => {
      const txDate = new Date(po.createdAt || new Date());
      return isWithinInterval(txDate, { start: startDate, end: endOfDay(now) });
    });
  }, [purchaseOrders, dateRange]);

  // Calculate KPIs
  const totalPurchases = filteredPOs.reduce((acc, po) => acc + (po.totalAmount || 0), 0);
  const totalPaid = filteredPOs.reduce((acc, po) => acc + (po.paidAmount || 0), 0);
  const totalDebt = totalPurchases - totalPaid;
  const totalPO = filteredPOs.length;
  
  // Prepare chart data (Group by date)
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredPOs.forEach(po => {
      const dateStr = format(new Date(po.createdAt || new Date()), 'dd MMM', { locale: localeId });
      grouped[dateStr] = (grouped[dateStr] || 0) + (po.totalAmount || 0);
    });
    
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .reverse();
  }, [filteredPOs]);

  const supplierData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredPOs.forEach(po => {
      const name = po.supplier?.name || 'Unknown';
      counts[name] = (counts[name] || 0) + (po.totalAmount || 0);
    });
    return Object.entries(counts)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // top 5
  }, [filteredPOs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <PageContainer
      title="Laporan Pembelian"
      description="Analisis pengeluaran untuk belanja stok dan utang ke pemasok."
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
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#76777d] mb-1">Total Pembelian</p>
            <h3 className="text-xl font-bold text-[#0b1c30]">{formatCurrency(totalPurchases)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#76777d] mb-1">Total Hutang</p>
            <h3 className="text-xl font-bold text-[#ba1a1a]">{formatCurrency(totalDebt)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center shrink-0">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#76777d] mb-1">Total Pesanan (PO)</p>
            <h3 className="text-xl font-bold text-[#0b1c30]">{totalPO} <span className="text-sm font-normal text-slate-500">PO</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-[#0b1c30] mb-6">Tren Pembelian</h3>
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
                    formatter={(value: any) => [formatCurrency(value), 'Pembelian']}
                    labelStyle={{ color: '#0b1c30', fontWeight: 'bold', marginBottom: '4px' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    cursor={{ fill: '#eff4ff' }}
                  />
                  <Bar dataKey="amount" fill="#3755c3" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <TrendingDown size={48} className="mb-4 opacity-20" />
                <p>Tidak ada data untuk rentang waktu ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-[#0b1c30] mb-6">Top Pemasok</h3>
          <div className="space-y-4">
            {supplierData.length > 0 ? supplierData.map((sup, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#3755c3] font-bold flex items-center justify-center text-xs shrink-0">
                    {sup.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#0b1c30] line-clamp-1" title={sup.name}>{sup.name}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="text-sm font-bold text-[#3755c3]">{formatCurrency(sup.amount)}</div>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-slate-400 py-8">Belum ada pembelian</p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
