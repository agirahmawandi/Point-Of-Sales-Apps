import React from 'react';
import { History, Search, ArrowUpRight, ChevronRight, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactionStore } from '@/stores/transactionStore';
import { useDashboardStore, getDashboardDateRange } from '@/stores/dashboardStore';
import { format } from 'date-fns';

export default function RecentTransactions() {
  const { transactions } = useTransactionStore();
  const dashboardState = useDashboardStore();
  const { startDate, endDate } = getDashboardDateRange(dashboardState);
  
  // Ambil transaksi sesuai filter tanggal
  const filteredTransactions = transactions.filter(trx => {
    const trxDate = new Date(trx.date || trx.createdAt || Date.now());
    return trxDate >= startDate && trxDate <= endDate;
  });

  // Ambil 5 transaksi terbaru dari hasil filter
  const recentTransactions = filteredTransactions.slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <History className="text-[#254222]" size={22} />
            <div>
              <h2 className="text-[16px] font-bold text-[#254222]">Transaksi Kasir Terbaru</h2>
              <span className="text-[12px] text-[#76777d]">Pembaruan real-time dari terminal register</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-[#76777d]" size={16} />
            <input 
              type="text" 
              className="h-8 w-44 rounded-lg bg-[#cae4c5]/25 border border-[#cae4c5]/50 pl-8 pr-2 text-[12px] text-[#254222] focus:outline-none focus:bg-white focus:border-[#99cc66] transition-colors" 
              placeholder="Filter struk..." 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#cae4c5]/30 text-[11px] font-bold text-[#254222] uppercase tracking-wider">
                <th className="py-2 px-3 rounded-l-lg">No. Struk</th>
                <th className="py-2 px-3">Waktu</th>
                <th className="py-2 px-3">Kasir</th>
                <th className="py-2 px-3">Metode</th>
                <th className="py-2 px-3 text-right">Total</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-right rounded-r-lg">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cae4c5]/30 text-[12px]">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#76777d]">
                    <ReceiptText size={32} className="mx-auto mb-2 text-slate-300" />
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                recentTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#cae4c5]/15 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#254222]">{trx.id}</td>
                    <td className="py-3 px-3 text-[#76777d]">{format(new Date(trx.date || trx.createdAt || Date.now()), 'HH:mm')}</td>
                    <td className="py-3 px-3 font-semibold text-[#254222]">{trx.cashierName}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#cae4c5]/40 text-[#254222] font-semibold text-[11px] uppercase">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#254222] whitespace-nowrap">
                      <span className="inline-flex items-baseline justify-end gap-1">
                        <span className="text-[11px] font-medium text-[#76777d]">Rp</span>
                        <span>{formatCurrency(trx.total)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#cae4c5] text-[#254222] text-[11px] font-bold uppercase">
                        {trx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link to={`/pos/receipt/${trx.id}`} className="text-[#254222] hover:text-[#1b3119] text-[11px] font-bold uppercase inline-flex items-center">
                        Struk <ArrowUpRight size={14} className="ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 pt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12px] text-[#76777d]">
          Menampilkan <strong className="text-[#254222] font-semibold">{recentTransactions.length}</strong> dari <strong className="text-[#254222] font-semibold">{filteredTransactions.length}</strong> transaksi
        </span>
        <Link to="/reports/sales" className="text-[12px] font-bold text-[#254222] hover:underline inline-flex items-center gap-1">
          Buka Riwayat Lengkap <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
