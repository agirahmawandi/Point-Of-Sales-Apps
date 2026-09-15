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
import { useDashboardStore } from '@/stores/dashboardStore';
import { Loader2 } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function RevenueChart() {
  const { monthlyRevenue, isLoading } = useDashboardStore();

  const data = useMemo(() => {
    return monthlyRevenue.map(m => ({
      name: m.month,
      revenue: m.omzet
    }));
  }, [monthlyRevenue]);

  const totalRevenueThisMonth = data.length > 0 ? data[data.length - 1].revenue : 0;
  const target = 100000000; // Misal target bulanan 100 Juta
  const isTargetMet = totalRevenueThisMonth >= target;
  const targetPercentage = totalRevenueThisMonth > 0 ? ((totalRevenueThisMonth / target) * 100).toFixed(1) : '0.0';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3755c3]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[16px] font-bold text-[#0b1c30]">Tren Pendapatan Bulanan</h2>
          <p className="text-[12px] text-[#76777d]">Performa omzet 12 bulan terakhir</p>
        </div>
        <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl">
          <button className="px-3 py-1 rounded-lg bg-white text-[12px] font-semibold text-[#0b1c30] shadow-sm">Grafik Omzet</button>
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
            <span className="text-[12px] text-[#0b1c30]">Omzet (Bulan Ini)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-[#76777d] inline-block"></span>
            <span className="text-[12px] text-[#76777d]">Target Bulanan (Rp {formatCurrency(target).replace('Rp', '').trim()})</span>
          </div>
        </div>
        <div className={`text-[12px] font-semibold ${isTargetMet ? 'text-[#3755c3]' : 'text-[#ba1a1a]'}`}>
          {targetPercentage}% {isTargetMet ? 'Melampaui' : 'Tercapai dari'} Target
        </div>
      </div>
    </div>
  );
}
