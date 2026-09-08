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
          <h2 className="text-[16px] font-bold text-[#254222]">SALDO</h2>
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

      {/* Payment Method Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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

        {/* Bank Accounts */}
        {bankAccounts.map((acc) => (
          <div key={acc.id} className="rounded-xl border border-[#ece2b1] bg-[#ece2b1]/25 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#ece2b1] flex items-center justify-center">
                <Building2 size={14} className="text-[#254222]" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider">{acc.bank}</p>
              <p className="text-[13px] font-bold text-[#254222] leading-tight">{formatCurrency(acc.balance || 0)}</p>
            </div>
            <p className="text-[10px] text-[#76777d] truncate" title={acc.accountNumber}>{acc.accountNumber}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
