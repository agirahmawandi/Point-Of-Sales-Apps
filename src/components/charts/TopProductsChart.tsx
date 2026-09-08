import React, { useMemo } from 'react';
import { ChevronDown, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactionStore } from '@/stores/transactionStore';
import { useDashboardStore, getDashboardDateRange } from '@/stores/dashboardStore';

export default function TopProductsChart() {
  const { transactions } = useTransactionStore();
  const dashboardState = useDashboardStore();

  const topProducts = useMemo(() => {
    const { startDate, endDate } = getDashboardDateRange(dashboardState);
    const productStats: Record<string, { id: string, name: string, qty: number, revenue: number }> = {};
    
    // Agregasi penjualan
    transactions.forEach(trx => {
      const trxDate = new Date(trx.date || trx.createdAt || Date.now());
      if (trxDate >= startDate && trxDate <= endDate && trx.status === 'success') {
        trx.items.forEach(item => {
          if (!productStats[item.productId]) {
            productStats[item.productId] = {
              id: item.productId,
              name: item.name || item.productName || 'Produk',
              qty: 0,
              revenue: 0
            };
          }
          productStats[item.productId].qty += item.quantity;
          productStats[item.productId].revenue += item.subtotal;
        });
      }
    });

    // Urutkan & Ambil Top 5
    let sorted = Object.values(productStats).sort((a, b) => b.qty - a.qty).slice(0, 5);
    
    // Hitung persentase max untuk chart bar
    const maxQty = sorted[0]?.qty || 1;

    // Tambahkan style
    const colors = [
      { color: 'bg-[#3755c3]', textColor: 'text-white', badgeBg: 'bg-[#3755c3]' },
      { color: 'bg-[#708cfd]', textColor: 'text-[#001453]', badgeBg: 'bg-[#dde1ff]' },
      { color: 'bg-[#b8c4ff]', textColor: 'text-[#0b1c30]', badgeBg: 'bg-[#d3e4fe]' },
      { color: 'bg-[#c6c6cd]', textColor: 'text-[#76777d]', badgeBg: 'bg-[#e5eeff]' },
      { color: 'bg-[#c6c6cd]/60', textColor: 'text-[#76777d]', badgeBg: 'bg-[#e5eeff]' }
    ];

    return sorted.map((prod, idx) => ({
      ...prod,
      percentage: Math.round((prod.qty / maxQty) * 100),
      ...colors[idx]
    }));
  }, [transactions, dashboardState]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-[16px] font-bold text-[#0b1c30]">Produk Terlaris</h2>
              <span className="text-[12px] text-[#76777d]">Peringkat penjualan periode ini</span>
            </div>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[12px] hover:bg-[#e5eeff] transition-colors">
            <span>Volume Terbanyak</span>
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="space-y-4">
          {topProducts.length === 0 ? (
            <div className="py-10 text-center text-[#76777d] flex flex-col items-center">
              <Package size={32} className="mb-2 text-slate-300" />
              <p>Belum ada data penjualan.</p>
            </div>
          ) : (
            topProducts.map((product, idx) => (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full ${product.badgeBg} ${product.textColor} flex items-center justify-center font-bold text-[12px] shrink-0`}>
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[#0b1c30] truncate">{product.name}</span>
                  </div>
                  <div className="text-right whitespace-nowrap pl-3">
                    <span className="font-bold text-[#0b1c30]">{product.qty} x</span>
                    <span className="text-[#76777d] mx-1.5">•</span>
                    <span className="text-[#76777d]">Rp {formatCurrency(product.revenue)}</span>
                  </div>
                </div>
                <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
                  <div className={`${product.color} h-full rounded-full transition-all duration-500`} style={{ width: `${product.percentage}%` }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-8 pt-4 flex justify-center">
        <Link to="/reports/sales" className="text-[12px] font-semibold text-[#3755c3] hover:text-[#173bab] inline-flex items-center gap-1 transition-colors">
          <span>Lihat Semua Laporan Penjualan Produk</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
