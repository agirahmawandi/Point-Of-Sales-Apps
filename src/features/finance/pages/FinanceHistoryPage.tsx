import React, { useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { useSettingsStore } from '@/stores/settingsStore';
import PageContainer from '@/components/layout/PageContainer';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  ShoppingCart,
  TrendingDown,
  ArrowLeftRight,
  Banknote,
  QrCode,
  Building2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { Transaction } from '@/types';

type AnyTx = {
  id: string;
  date: string;
  type: 'sale' | 'purchase' | 'expense' | 'transfer' | 'investor';
  description: string;
  amount: number;
  direction: 'in' | 'out';
  method: string;
  status: string;
};

export default function TransactionHistoryPage() {
  const { cashMutations, fetchCashMutations } = useFinanceStore();
  const { bankAccounts } = useSettingsStore();

  React.useEffect(() => {
    fetchCashMutations();
  }, [fetchCashMutations]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(v));

  const getBankName = (id?: string) => {
    if (!id) return '-';
    const b = bankAccounts.find((b) => b.id === id);
    return b ? `${b.bank} ${b.accountNumber}` : id;
  };

  const allTx = useMemo(() => {
    return cashMutations;
  }, [cashMutations]);

  const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    sale: { label: 'Penjualan', icon: ShoppingCart, color: 'text-[#137333]', bg: 'bg-[#e6f4ea]' },
    purchase: { label: 'Pembelian', icon: TrendingDown, color: 'text-[#ba1a1a]', bg: 'bg-[#ffdad6]' },
    expense: { label: 'Pengeluaran', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    transfer: { label: 'Pindah Saldo', icon: ArrowLeftRight, color: 'text-[#3755c3]', bg: 'bg-[#eff4ff]' },
    investor: { label: 'Investor', icon: Banknote, color: 'text-[#254222]', bg: 'bg-[#cae4c5]' },
    profit_share: { label: 'Bagi Hasil', icon: Banknote, color: 'text-[#254222]', bg: 'bg-[#cae4c5]' },
  };

  return (
    <PageContainer
      title="Histori Transaksi"
      description="Semua transaksi keuangan yang tercatat: penjualan, pembelian, pengeluaran, pindah saldo, dan dana investor."
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#cae4c5]/20 text-[11px] font-bold text-[#254222] uppercase tracking-wider">
                <th className="py-3.5 px-5">Waktu</th>
                <th className="py-3.5 px-5">Tipe</th>
                <th className="py-3.5 px-5">Keterangan</th>
                <th className="py-3.5 px-5">Metode</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cae4c5]/30 text-[13px]">
              {allTx.length > 0 ? (
                allTx.map((tx) => {
                  const cfg = typeConfig[tx.type] || typeConfig.transfer;
                  const Icon = cfg.icon;
                  const isBank = ['card', 'transfer', 'transfer bank', 'kartu kredit'].includes(tx.paymentMethod.toLowerCase());
                  const displayMethod = isBank 
                    ? `Transfer Bank (${getBankName(tx.bankAccountId)})`
                    : tx.paymentMethod === 'cash' || tx.paymentMethod.toLowerCase() === 'tunai' ? 'Tunai'
                    : tx.paymentMethod === 'qris' || tx.paymentMethod.toLowerCase() === 'qris' ? 'QRIS'
                    : tx.paymentMethod;
                    
                  return (
                    <tr key={`${tx.type}-${tx.id}`} className="hover:bg-[#cae4c5]/10 transition-colors">
                      <td className="px-5 py-3.5 text-[#76777d] text-xs">
                        {format(new Date(tx.date), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>
                          <Icon size={12} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#254222] max-w-xs truncate">{tx.description}</td>
                      <td className="px-5 py-3.5 text-[#76777d] text-xs">{displayMethod}</td>
                      <td className="px-5 py-3.5 text-center">
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#cae4c5] text-[#254222] text-[11px] font-bold">
                            <CheckCircle2 size={10} /> Selesai
                         </span>
                      </td>
                      <td className={`px-5 py-3.5 text-right font-bold text-sm ${tx.direction === 'in' ? 'text-[#137333]' : 'text-[#ba1a1a]'}`}>
                        {tx.direction === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#76777d]">
                    <ArrowLeftRight size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-[#254222]">Belum ada transaksi</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
