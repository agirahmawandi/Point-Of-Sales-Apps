import React, { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactionStore } from '@/stores/transactionStore';
import { useExpenseStore } from '@/stores/expenseStore';

export default function CashFlowChart() {
  const { transactions } = useTransactionStore();
  const { expenses } = useExpenseStore();

  const cashFlow = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let inflow = 0;
    let outflow = 0;
    let paymentMethods = { cash: 0, qris: 0, card: 0 };
    let methodAmounts = { cash: 0, qris: 0, card: 0 };
    let trxCount = 0;

    transactions.forEach(trx => {
      const trxDate = new Date(trx.date || trx.createdAt || Date.now());
      if (trxDate >= today && trx.status === 'success') {
        inflow += trx.total;
        trxCount++;
        
        if (trx.paymentMethod === 'cash') {
          paymentMethods.cash++;
          methodAmounts.cash += trx.total;
        } else if (trx.paymentMethod === 'qris') {
          paymentMethods.qris++;
          methodAmounts.qris += trx.total;
        } else {
          paymentMethods.card++;
          methodAmounts.card += trx.total;
        }
      }
    });

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate >= today) {
        outflow += exp.amount;
      }
    });

    const net = inflow - outflow;
    
    // Percentages
    const calcPerc = (val: number) => trxCount === 0 ? 0 : Math.round((val / trxCount) * 100);

    return {
      inflow,
      outflow,
      net,
      trxCount,
      percentages: {
        cash: calcPerc(paymentMethods.cash),
        qris: calcPerc(paymentMethods.qris),
        card: calcPerc(paymentMethods.card)
      },
      amounts: methodAmounts
    };
  }, [transactions, expenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[16px] font-bold text-[#0b1c30]">Ringkasan Arus Kas</h2>
            <p className="text-[12px] text-[#76777d]">Cash flow laci kasir per shift berjalan</p>
          </div>
          <div className="p-1.5 rounded-full bg-[#e5eeff] text-[#3755c3]">
            <span className="material-symbols-outlined text-[22px]">price_check</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Kas Masuk */}
          <div className="p-3 rounded-xl bg-[#eff4ff] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#dde1ff] flex items-center justify-center text-[#3755c3] font-bold">
                <ArrowDownLeft size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Kas Masuk (Inflow)</span>
                <p className="text-[12px] text-[#45464d]">Tunai, QRIS BCA, Debit</p>
              </div>
            </div>
            <div className="text-[14px] font-bold text-[#3755c3] whitespace-nowrap flex items-baseline gap-1">
              <span>+Rp</span><span>{formatCurrency(cashFlow.inflow)}</span>
            </div>
          </div>

          {/* Kas Keluar */}
          <div className="p-3 rounded-xl bg-[#eff4ff] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] font-bold">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Kas Keluar (Outflow)</span>
                <p className="text-[12px] text-[#45464d]">Belanja supplier + Op kas kecil</p>
              </div>
            </div>
            <div className="text-[14px] font-bold text-[#ba1a1a] whitespace-nowrap flex items-baseline gap-1">
              <span>-Rp</span><span>{formatCurrency(cashFlow.outflow)}</span>
            </div>
          </div>

          {/* Saldo Bersih */}
          <div className="p-4 rounded-xl bg-[#e5eeff] flex items-center justify-between mt-2">
            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider">Saldo Bersih Laci Kasir</span>
              <p className="text-[12px] text-[#76777d]">Uang fisik tunai wajib verifikasi fisik</p>
            </div>
            <div className="text-2xl font-bold text-[#0b1c30] flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-[16px] font-semibold text-[#76777d]">Rp</span><span>{formatCurrency(cashFlow.net)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Komposisi Metode Pembayaran</span>
            <span className="text-[12px] font-medium text-[#45464d]">{cashFlow.trxCount} Transaksi</span>
          </div>

          <div className="w-full h-3 rounded-full bg-[#e5eeff] overflow-hidden flex">
            <div className="bg-[#3755c3]" style={{ width: `${cashFlow.percentages.qris}%` }} title={`QRIS (${cashFlow.percentages.qris}%)`}></div>
            <div className="bg-[#708cfd]" style={{ width: `${cashFlow.percentages.cash}%` }} title={`Tunai (${cashFlow.percentages.cash}%)`}></div>
            <div className="bg-[#b8c4ff]" style={{ width: `${cashFlow.percentages.card}%` }} title={`Kartu Debit (${cashFlow.percentages.card}%)`}></div>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 text-center">
            <div className="p-1.5 rounded-lg bg-[#eff4ff]">
              <span className="text-[11px] font-bold text-[#76777d] block">QRIS</span>
              <div className="text-[12px] font-bold text-[#3755c3]">{cashFlow.percentages.qris}%</div>
              <span className="text-[10px] text-[#76777d] whitespace-nowrap block">Rp {formatCurrency(cashFlow.amounts.qris)}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#eff4ff]">
              <span className="text-[11px] font-bold text-[#76777d] block">Tunai</span>
              <div className="text-[12px] font-bold text-[#0b1c30]">{cashFlow.percentages.cash}%</div>
              <span className="text-[10px] text-[#76777d] whitespace-nowrap block">Rp {formatCurrency(cashFlow.amounts.cash)}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#eff4ff]">
              <span className="text-[11px] font-bold text-[#76777d] block">Debit/Kredit</span>
              <div className="text-[12px] font-bold text-[#45464d]">{cashFlow.percentages.card}%</div>
              <span className="text-[10px] text-[#76777d] whitespace-nowrap block">Rp {formatCurrency(cashFlow.amounts.card)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#eff4ff]">
        <Link to="/expenses" className="text-[12px] text-[#3755c3] hover:underline font-semibold flex items-center gap-1">
          Buku Kas Pengeluaran <ArrowRight size={14} />
        </Link>
        <button className="px-3 py-1.5 rounded-lg bg-[#131b2e] text-white text-[12px] font-medium hover:bg-[#213145] transition-colors">
          Rekonsiliasi Kasir
        </button>
      </div>
    </div>
  );
}
