import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTransactionStore } from '@/stores/transactionStore';
import { useDashboardStore, getDashboardDateRange } from '@/stores/dashboardStore';
import { format, subDays, eachDayOfInterval, differenceInDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function RevenueChart() {
  const { transactions } = useTransactionStore();
  const dashboardState = useDashboardStore();

  const data = useMemo(() => {
    const { startDate, endDate } = getDashboardDateRange(dashboardState);
    
    // Determine the interval of days
    const diff = differenceInDays(endDate, startDate);
    let intervalDays = diff >= 1 ? eachDayOfInterval({ start: startDate, end: endDate }) : [startDate];

    // If it's just today/one day, maybe we still show a 7-day trend ending today?
    // Let's show the exact interval. If it's 1 day, it will be a single point.
    const chartData = intervalDays.map(d => ({
        date: format(d, 'yyyy-MM-dd'),
        name: format(d, 'dd MMM', { locale: localeId }),
        revenue: 0
    }));

    transactions.forEach(trx => {
      if (trx.status === 'success') {
        const trxDate = new Date(trx.date || trx.createdAt || Date.now());
        if (trxDate >= startDate && trxDate <= endDate) {
          const trxDateStr = format(trxDate, 'yyyy-MM-dd');
          const dayMatch = chartData.find(d => d.date === trxDateStr);
          if (dayMatch) {
            dayMatch.revenue += trx.total;
          }
        }
      }
    });

    return chartData;
  }, [transactions, dashboardState]);

  const totalRevenueToday = data[data.length - 1]?.revenue || 0;
  const target = 4000000;
  const isTargetMet = totalRevenueToday >= target;
  const targetPercentage = totalRevenueToday > 0 ? ((totalRevenueToday / target) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[16px] font-bold text-[#0b1c30]">Tren Penjualan & Kunjungan Kasir</h2>
          <p className="text-[12px] text-[#76777d]">Performa transaksi ritel konsolidasi 30 hari kalender</p>
        </div>
        <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl">
          <button className="px-3 py-1 rounded-lg bg-white text-[12px] font-semibold text-[#0b1c30] shadow-sm">Grafik Omzet</button>
          <button className="px-3 py-1 rounded-lg text-[12px] text-[#45464d] hover:text-[#0b1c30]">Volume Transaksi</button>
        </div>
      </div>
      
      <div className="flex-1 w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3755c3" stopOpacity={0.32}></stop>
                <stop offset="100%" stopColor="#3755c3" stopOpacity={0.0}></stop>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#eff4ff" strokeWidth={1.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#76777d', fontSize: 12, fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              hide
            />
            <Tooltip 
              formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Omzet']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#131b2e', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3755c3" 
              strokeWidth={3.5}
              fill="url(#chartGradient)"
              activeDot={{ r: 6, fill: '#3755c3', stroke: '#fff', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-3 bg-[#eff4ff]/50 px-4 py-2 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#3755c3] inline-block"></span>
            <span className="text-[12px] text-[#0b1c30]">Penjualan Bersih (Rp)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-[#76777d] inline-block"></span>
            <span className="text-[12px] text-[#76777d]">Target Harian (Rp {formatCurrency(target).replace('Rp', '').trim()})</span>
          </div>
        </div>
        <div className={`text-[12px] font-semibold ${isTargetMet ? 'text-[#3755c3]' : 'text-[#ba1a1a]'}`}>
          {targetPercentage}% {isTargetMet ? 'Melampaui' : 'Tercapai dari'} Target
        </div>
      </div>
    </div>
  );
}
