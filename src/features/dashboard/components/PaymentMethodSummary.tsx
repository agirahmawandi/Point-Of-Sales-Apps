import React, { useMemo, useState } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { QrCode, Banknote, CreditCard, ChevronDown, ChevronUp, Building2, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentMethodSummary() {
  const { transactions } = useTransactionStore();
  const { bankAccounts } = useSettingsStore();
  const navigate = useNavigate();
  const [showAccounts, setShowAccounts] = useState(false);

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let qris = 0, tunai = 0, debit = 0, totalTrx = 0;

    transactions.forEach(trx => {
      const trxDate = new Date(trx.date || trx.createdAt || Date.now());
      if (trxDate >= today && trx.status === 'success') {
        totalTrx++;
        if (trx.paymentMethod === 'qris') qris += trx.total;
        else if (trx.paymentMethod === 'cash') tunai += trx.total;
        else if (trx.paymentMethod === 'card') debit += trx.total;
      }
    });

    const grandTotal = qris + tunai + debit || 1;
    return {
      qris, tunai, debit, totalTrx,
      qrisPerc: Math.round((qris / grandTotal) * 100),
      tunaiPerc: Math.round((tunai / grandTotal) * 100),
      debitPerc: Math.round((debit / grandTotal) * 100),
    };
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#cae4c5]/60 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[16px] font-bold text-[#254222]">Saldo per Metode Bayar</h2>
          <p className="text-[12px] text-[#76777d] mt-0.5">Penerimaan hari ini · {summary.totalTrx} transaksi</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#cae4c5]/30 flex items-center justify-center text-[#254222]">
          <CreditCard size={18} />
        </div>
      </div>

      {/* Progress Bar Total */}
      <div className="w-full h-2.5 rounded-full bg-[#cae4c5]/30 overflow-hidden flex mb-5">
        <div className="bg-[#254222] h-full rounded-l-full transition-all duration-700" style={{ width: `${summary.qrisPerc}%` }} title={`QRIS ${summary.qrisPerc}%`} />
        <div className="bg-[#99cc66] h-full transition-all duration-700" style={{ width: `${summary.tunaiPerc}%` }} title={`Tunai ${summary.tunaiPerc}%`} />
        <div className="bg-[#ece2b1] h-full rounded-r-full transition-all duration-700" style={{ width: `${summary.debitPerc}%` }} title={`Debit ${summary.debitPerc}%`} />
      </div>

      {/* 3 Payment Method Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* QRIS */}
        <div className="rounded-xl border border-[#cae4c5] bg-[#cae4c5]/25 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-[#254222] flex items-center justify-center">
              <QrCode size={14} className="text-[#ece2b1]" />
            </div>
            <span className="text-[10px] font-bold text-[#ece2b1] bg-[#254222] px-1.5 py-0.5 rounded">
              {summary.qrisPerc}%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider">QRIS</p>
            <p className="text-[13px] font-bold text-[#254222] leading-tight">{formatCurrency(summary.qris)}</p>
          </div>
          <p className="text-[10px] text-[#76777d]">Scan & Pay</p>
        </div>

        {/* Tunai */}
        <div className="rounded-xl border border-[#cae4c5] bg-[#cae4c5]/15 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-[#99cc66] flex items-center justify-center">
              <Banknote size={14} className="text-[#254222]" />
            </div>
            <span className="text-[10px] font-bold text-[#254222] bg-[#cae4c5] px-1.5 py-0.5 rounded">
              {summary.tunaiPerc}%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider">Tunai</p>
            <p className="text-[13px] font-bold text-[#254222] leading-tight">{formatCurrency(summary.tunai)}</p>
          </div>
          <p className="text-[10px] text-[#76777d]">Kas Fisik</p>
        </div>

        {/* Debit/Kartu */}
        <div className="rounded-xl border border-[#ece2b1] bg-[#ece2b1]/25 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-[#ece2b1] flex items-center justify-center">
              <CreditCard size={14} className="text-[#254222]" />
            </div>
            <span className="text-[10px] font-bold text-[#254222] bg-[#ece2b1] border border-[#ece2b1] px-1.5 py-0.5 rounded">
              {summary.debitPerc}%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider">Debit/Kredit</p>
            <p className="text-[13px] font-bold text-[#254222] leading-tight">{formatCurrency(summary.debit)}</p>
          </div>
          <p className="text-[10px] text-[#76777d]">Transfer/EDC</p>
        </div>
      </div>

      {/* Rekening Bank / Debit Info */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        <button
          onClick={() => setShowAccounts(!showAccounts)}
          className="w-full flex items-center justify-between text-left hover:bg-slate-50 rounded-lg px-1 py-1 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-[#76777d]" />
            <span className="text-[12px] font-semibold text-[#45464d]">Nomor Rekening Penerima Debit</span>
            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">
              {bankAccounts.length} Rekening
            </span>
          </div>
          {showAccounts
            ? <ChevronUp size={15} className="text-[#76777d]" />
            : <ChevronDown size={15} className="text-[#76777d]" />
          }
        </button>

        {showAccounts && (
          <div className="mt-3 space-y-2">
            {bankAccounts.map(acc => (
              <div key={acc.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Building2 size={15} className="text-amber-700" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#0b1c30]">{acc.bank}</p>
                    <p className="text-[11px] text-[#76777d] font-mono tracking-wider">{acc.accountNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#76777d]">a.n.</p>
                  <p className="text-[11px] font-semibold text-[#45464d]">{acc.accountName}</p>
                </div>
              </div>
            ))}

            {/* Tombol tambah rekening - Navigasi ke Pengaturan Metode Pembayaran */}
            <button
              onClick={() => navigate('/settings/payments')}
              title="Kelola Rekening Bank"
              className="w-full flex items-center justify-center gap-2 border border-dashed border-[#99cc66] text-[#254222] font-bold rounded-xl py-2 text-[12px] hover:bg-[#cae4c5]/20 transition-colors"
            >
              <Plus size={14} strokeWidth={3} />
              Tambah Rekening
            </button>

            <p className="text-[10px] text-[#76777d] text-center mt-1 flex items-center justify-center gap-1">
              <Settings size={10} />
              Kelola rekening di menu <span className="font-semibold">Pengaturan → Metode Pembayaran</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
