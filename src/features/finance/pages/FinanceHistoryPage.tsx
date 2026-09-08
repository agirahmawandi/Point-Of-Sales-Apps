import React, { useMemo } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { useExpenseStore } from '@/stores/expenseStore';
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
  const { transactions } = useTransactionStore();
  const { purchaseOrders } = usePurchaseStore();
  const { expenses } = useExpenseStore();
  const { balanceTransfers, investorDeposits } = useFinanceStore();
  const { bankAccounts } = useSettingsStore();

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(v));

  const getBankName = (id?: string) => {
    if (!id) return '-';
    const b = bankAccounts.find((b) => b.id === id);
    return b ? `${b.bank} ${b.accountNumber}` : id;
  };

  const allTx = useMemo<AnyTx[]>(() => {
    const list: AnyTx[] = [];

    // Sales
    transactions.forEach((t: Transaction) => {
      list.push({
        id: t.id,
        date: (t.date || t.createdAt || new Date()).toString(),
        type: 'sale',
        description: `Penjualan #${t.id} (${t.items.length} item)`,
        amount: t.total,
        direction: 'in',
        method: t.paymentMethod === 'card'
          ? `Transfer Bank (${getBankName(t.bankAccountId)})`
          : t.paymentMethod === 'qris' ? 'QRIS'
          : t.paymentMethod === 'cash' ? 'Tunai'
          : t.paymentMethod,
        status: t.paymentStatus === 'tertunda' ? 'Tertunda' : 'Lunas',
      });
    });

    // Purchase payments
    purchaseOrders.forEach((po) => {
      if ((po.paidAmount || 0) > 0) {
        list.push({
          id: po.id,
          date: po.createdAt,
          type: 'purchase',
          description: `Pembelian PO #${po.poNumber} - ${po.supplier?.name || '-'}`,
          amount: po.paidAmount || 0,
          direction: 'out',
          method: 'Transfer / Tunai',
          status: po.paymentStatus === 'lunas' ? 'Lunas' : 'Sebagian',
        });
      }
    });

    // Expenses
    expenses.forEach((e) => {
      list.push({
        id: e.id,
        date: e.date,
        type: 'expense',
        description: `${e.category} — ${e.description}`,
        amount: e.amount,
        direction: 'out',
        method: e.paymentMethod || 'Tunai',
        status: 'Selesai',
      });
    });

    // Balance transfers
    balanceTransfers.forEach((t) => {
      list.push({
        id: t.id,
        date: t.date,
        type: 'transfer',
        description: `Pindah Saldo: ${t.fromType === 'bank' ? getBankName(t.fromBankId) : t.fromType} → ${t.toType === 'bank' ? getBankName(t.toBankId) : t.toType}`,
        amount: t.amount,
        direction: 'out',
        method: 'Internal Transfer',
        status: 'Selesai',
      });
    });

    // Investor deposits
    investorDeposits.forEach((d) => {
      list.push({
        id: d.id,
        date: d.date,
        type: 'investor',
        description: `Dana Investor: ${d.investorName}`,
        amount: d.amount,
        direction: 'in',
        method: d.method === 'transfer' ? `Transfer Bank (${getBankName(d.bankAccountId)})` : 'Tunai',
        status: 'Diterima',
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, purchaseOrders, expenses, balanceTransfers, investorDeposits]);

  const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    sale: { label: 'Penjualan', icon: ShoppingCart, color: 'text-[#137333]', bg: 'bg-[#e6f4ea]' },
    purchase: { label: 'Pembelian', icon: TrendingDown, color: 'text-[#ba1a1a]', bg: 'bg-[#ffdad6]' },
    expense: { label: 'Pengeluaran', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    transfer: { label: 'Pindah Saldo', icon: ArrowLeftRight, color: 'text-[#3755c3]', bg: 'bg-[#eff4ff]' },
    investor: { label: 'Investor', icon: Banknote, color: 'text-[#254222]', bg: 'bg-[#cae4c5]' },
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
                  const cfg = typeConfig[tx.type];
                  const Icon = cfg.icon;
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
                      <td className="px-5 py-3.5 text-[#76777d] text-xs">{tx.method}</td>
                      <td className="px-5 py-3.5 text-center">
                        {tx.status === 'Tertunda' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ece2b1] text-[#254222] text-[11px] font-bold">
                            <Clock size={10} /> Tertunda
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#cae4c5] text-[#254222] text-[11px] font-bold">
                            <CheckCircle2 size={10} /> {tx.status}
                          </span>
                        )}
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
