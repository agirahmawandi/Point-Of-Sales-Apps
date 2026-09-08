import React, { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useFinanceStore } from '@/stores/financeStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { PieChart, Plus, X, Building2, Banknote, CheckCircle2, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function ProfitSharePage() {
  const { investors, profitShares, addProfitShare } = useFinanceStore();
  const { bankAccounts, updateBankBalance } = useSettingsStore();
  const { updateCashBalance } = useFinanceStore();
  const { transactions } = useTransactionStore();
  const { expenses } = useExpenseStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.toLocaleString('id-ID', { month: 'long' })} ${now.getFullYear()}`;
  });

  // Per-investor distribution settings
  const [distributions, setDistributions] = useState(
    investors.map((inv) => ({
      investorId: inv.id,
      investorName: inv.name,
      percentage: 0,
      method: 'cash' as 'cash' | 'transfer',
      bankAccountId: bankAccounts[0]?.id || '',
    }))
  );

  const [notes, setNotes] = useState('');

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(v));

  // Calculate current financial summary
  const summary = useMemo(() => {
    const paidSales = transactions.filter(
      (t) => t.paymentStatus !== 'tertunda' && t.status !== 'pending'
    );
    const totalRevenue = paidSales.reduce((s, t) => s + t.total, 0);
    const totalCogs = paidSales.reduce((s, t) => s + (t.hpp || 0), 0);
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalRevenue - totalCogs - totalExpense;
    return { totalRevenue, totalCogs, totalExpense, netProfit };
  }, [transactions, expenses]);

  const totalPercentage = distributions.reduce((s, d) => s + d.percentage, 0);
  const totalShareAmount = distributions.reduce((s, d) => s + (summary.netProfit * d.percentage) / 100, 0);

  const handleSetPercentage = (investorId: string, pct: number) => {
    setDistributions((prev) =>
      prev.map((d) => (d.investorId === investorId ? { ...d, percentage: Math.min(100, Math.max(0, pct)) } : d))
    );
  };

  const handleOpenModal = () => {
    setDistributions(
      investors.map((inv) => ({
        investorId: inv.id,
        investorName: inv.name,
        percentage: investors.length > 0 ? Math.floor(100 / investors.length) : 0,
        method: 'cash' as 'cash' | 'transfer',
        bankAccountId: bankAccounts[0]?.id || '',
      }))
    );
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPercentage > 100) {
      toast.error('Total persentase bagi hasil tidak boleh melebihi 100%!');
      return;
    }

    const finalDistributions = distributions
      .filter((d) => d.percentage > 0)
      .map((d) => ({
        ...d,
        amount: Math.round((summary.netProfit * d.percentage) / 100),
      }));

    addProfitShare({
      period,
      totalRevenue: summary.totalRevenue,
      totalExpense: summary.totalExpense + summary.totalCogs,
      netProfit: summary.netProfit,
      sharePercentage: totalPercentage,
      shareAmount: totalShareAmount,
      distributions: finalDistributions,
      notes,
    });

    // Deduct each distribution from the corresponding balance
    finalDistributions.forEach((d) => {
      if (d.method === 'cash') {
        updateCashBalance(-d.amount);
      } else if (d.bankAccountId) {
        updateBankBalance(d.bankAccountId, -d.amount);
      }
    });

    toast.success(`Bagi hasil periode ${period} berhasil dicatat!`);
    setIsModalOpen(false);
    setNotes('');
  };

  return (
    <PageContainer
      title="Bagi Hasil"
      description="Hitung dan catat distribusi bagi hasil usaha kepada investor."
      actions={
        investors.length > 0 ? (
          <button
            onClick={handleOpenModal}
            className="h-10 px-4 rounded-xl bg-[#99cc66] text-[#254222] text-[13px] font-black flex items-center gap-2 hover:bg-[#86b555] transition-all shadow-sm"
          >
            <Plus size={18} strokeWidth={3} />
            Catat Bagi Hasil
          </button>
        ) : undefined
      }
    >
      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Pendapatan', value: summary.totalRevenue, color: 'text-[#137333]' },
          { label: 'Total HPP + Biaya', value: summary.totalCogs + summary.totalExpense, color: 'text-[#ba1a1a]' },
          { label: 'Laba Bersih', value: summary.netProfit, color: summary.netProfit >= 0 ? 'text-[#3755c3]' : 'text-red-600' },
          { label: 'Total Dibagikan', value: profitShares.reduce((s, p) => s + p.shareAmount, 0), color: 'text-[#254222]' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#cae4c5]/60 shadow-sm p-5">
            <p className="text-xs font-semibold text-[#76777d] uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-xl font-black ${c.color}`}>{formatCurrency(c.value)}</p>
          </div>
        ))}
      </div>

      {/* No investors warning */}
      {investors.length === 0 && (
        <div className="mb-4 p-4 bg-[#ece2b1]/40 border border-[#ece2b1] rounded-xl text-sm text-[#254222] flex items-center gap-3">
          <PieChart size={20} />
          <span>Belum ada investor terdaftar. Tambahkan investor di menu <strong>Investor</strong> terlebih dahulu.</span>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-[#cae4c5]/40">
          <h3 className="font-bold text-[#254222]">Riwayat Bagi Hasil</h3>
        </div>
        {profitShares.length === 0 ? (
          <div className="py-16 text-center">
            <PieChart size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-[#254222]">Belum ada riwayat bagi hasil</p>
            <p className="text-xs text-[#76777d] mt-1">Klik "Catat Bagi Hasil" untuk mulai membagi keuntungan.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#cae4c5]/30">
            {profitShares.map((ps) => (
              <div key={ps.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-[#254222]">Periode: {ps.period}</h4>
                    <p className="text-xs text-[#76777d] mt-0.5">{format(new Date(ps.createdAt), 'dd MMM yyyy, HH:mm', { locale: localeId })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#76777d]">Total Dibagikan</p>
                    <p className="font-bold text-[#254222] text-sm">{formatCurrency(ps.shareAmount)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                  <div className="p-2.5 bg-[#e6f4ea] rounded-lg">
                    <p className="text-[#76777d]">Pendapatan</p>
                    <p className="font-bold text-[#137333]">{formatCurrency(ps.totalRevenue)}</p>
                  </div>
                  <div className="p-2.5 bg-[#ffdad6] rounded-lg">
                    <p className="text-[#76777d]">Total Biaya</p>
                    <p className="font-bold text-[#ba1a1a]">{formatCurrency(ps.totalExpense)}</p>
                  </div>
                  <div className="p-2.5 bg-[#eff4ff] rounded-lg">
                    <p className="text-[#76777d]">Laba Bersih</p>
                    <p className="font-bold text-[#3755c3]">{formatCurrency(ps.netProfit)}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {ps.distributions.map((d) => (
                    <div key={d.investorId} className="flex items-center justify-between bg-[#cae4c5]/20 rounded-lg px-3 py-2 text-xs">
                      <span className="font-semibold text-[#254222]">{d.investorName}</span>
                      <span className="text-[#76777d]">{d.percentage}% ({d.method === 'transfer' ? 'Transfer' : 'Tunai'})</span>
                      <span className="font-bold text-[#254222]">{formatCurrency(d.amount)}</span>
                    </div>
                  ))}
                </div>
                {ps.notes && <p className="text-xs text-[#76777d] mt-2 italic">{ps.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Bagi Hasil */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#cae4c5]/40 bg-[#cae4c5]/10 sticky top-0">
              <h2 className="text-lg font-bold text-[#254222]">Catat Bagi Hasil</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#76777d] hover:text-[#254222]"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Period */}
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Periode</label>
                <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#cae4c5] rounded-xl text-sm focus:outline-none focus:border-[#99cc66]" required />
              </div>

              {/* Financial summary */}
              <div className="p-4 bg-[#eff4ff]/60 rounded-xl border border-[#d3e4fe] space-y-2 text-sm">
                <p className="font-bold text-[#254222] text-xs uppercase tracking-wider mb-2">Ringkasan Keuangan</p>
                <div className="flex justify-between"><span className="text-[#76777d]">Laba Bersih:</span><span className="font-bold text-[#3755c3]">{formatCurrency(summary.netProfit)}</span></div>
              </div>

              {/* Per investor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[#254222] uppercase tracking-wider">Distribusi Bagi Hasil</label>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${totalPercentage > 100 ? 'bg-red-100 text-red-600' : 'bg-[#cae4c5] text-[#254222]'}`}>
                    Total: {totalPercentage}%
                  </span>
                </div>
                <div className="space-y-3">
                  {distributions.map((d) => (
                    <div key={d.investorId} className="p-4 border border-[#cae4c5]/40 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#254222] text-sm">{d.investorName}</span>
                        <span className="text-xs text-[#137333] font-bold">
                          ≈ {formatCurrency(Math.round((summary.netProfit * d.percentage) / 100))}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <input type="number" min="0" max="100" value={d.percentage}
                            onChange={(e) => handleSetPercentage(d.investorId, parseFloat(e.target.value) || 0)}
                            className="w-full h-9 px-3 pr-8 border border-[#cae4c5] rounded-lg text-sm font-bold text-[#254222] focus:outline-none focus:border-[#99cc66]" />
                          <Percent size={13} className="absolute right-2.5 top-2.5 text-[#76777d]" />
                        </div>
                        <select value={d.method}
                          onChange={(e) => setDistributions((prev) => prev.map((x) => x.investorId === d.investorId ? { ...x, method: e.target.value as any } : x))}
                          className="h-9 px-2 border border-[#cae4c5] rounded-lg text-xs font-semibold text-[#254222] focus:outline-none focus:border-[#99cc66]">
                          <option value="cash">Tunai</option>
                          <option value="transfer">Transfer</option>
                        </select>
                      </div>
                      {d.method === 'transfer' && (
                        <select value={d.bankAccountId}
                          onChange={(e) => setDistributions((prev) => prev.map((x) => x.investorId === d.investorId ? { ...x, bankAccountId: e.target.value } : x))}
                          className="w-full h-9 px-3 border border-[#cae4c5] rounded-lg text-xs font-semibold text-[#254222] focus:outline-none focus:border-[#99cc66]">
                          {bankAccounts.map((b) => <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Catatan</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Keterangan bagi hasil..."
                  className="w-full px-4 py-2.5 border border-[#cae4c5] rounded-xl text-sm focus:outline-none focus:border-[#99cc66]" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[#76777d] font-semibold text-sm hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={totalPercentage > 100} className="flex-1 py-2.5 rounded-xl bg-[#254222] disabled:bg-slate-300 text-[#ece2b1] font-bold text-sm hover:bg-[#1b3119] shadow-sm">
                  Simpan Bagi Hasil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
