import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFinanceStore } from '@/stores/financeStore';
import { ArrowLeftRight, Banknote, QrCode, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

type BalanceType = 'cash' | 'qris' | 'bank';

export default function BalanceTransferPage() {
  const { bankAccounts, updateBankBalance } = useSettingsStore();
  const { cashBalance, qrisBalance, updateCashBalance, updateQrisBalance, addBalanceTransfer, balanceTransfers } = useFinanceStore();

  const [fromType, setFromType] = useState<BalanceType>('cash');
  const [fromBankId, setFromBankId] = useState(bankAccounts[0]?.id || '');
  const [toType, setToType] = useState<BalanceType>('bank');
  const [toBankId, setToBankId] = useState(bankAccounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

  const getBalance = (type: BalanceType, bankId?: string) => {
    if (type === 'cash') return cashBalance;
    if (type === 'qris') return qrisBalance;
    const bank = bankAccounts.find((b) => b.id === bankId);
    return bank?.balance || 0;
  };

  const getLabel = (type: BalanceType, bankId?: string) => {
    if (type === 'cash') return 'Kas / Tunai';
    if (type === 'qris') return 'QRIS / E-Wallet';
    const bank = bankAccounts.find((b) => b.id === bankId);
    return bank ? `${bank.bank} (${bank.accountNumber})` : 'Rekening Bank';
  };

  const amountNum = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const fromBalance = getBalance(fromType, fromBankId);
  const isValid = amountNum > 0 && amountNum <= fromBalance && fromType !== toType || (fromType === 'bank' && toType === 'bank' && fromBankId !== toBankId);

  const handleTransfer = () => {
    if (!isValid) return;

    // Deduct from source
    if (fromType === 'cash') updateCashBalance(-amountNum);
    else if (fromType === 'qris') updateQrisBalance(-amountNum);
    else updateBankBalance(fromBankId, -amountNum);

    // Add to destination
    if (toType === 'cash') updateCashBalance(amountNum);
    else if (toType === 'qris') updateQrisBalance(amountNum);
    else updateBankBalance(toBankId, amountNum);

    addBalanceTransfer({
      fromType,
      fromBankId: fromType === 'bank' ? fromBankId : undefined,
      toType,
      toBankId: toType === 'bank' ? toBankId : undefined,
      amount: amountNum,
      notes,
    });

    setAmount('');
    setNotes('');
    setIsSuccess(true);
    toast.success(`Saldo sebesar ${formatCurrency(amountNum)} berhasil dipindahkan!`);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const typeOptions: { value: BalanceType; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'cash', label: 'Kas / Tunai', icon: Banknote, color: '#254222' },
    { value: 'qris', label: 'QRIS', icon: QrCode, color: '#3755c3' },
    { value: 'bank', label: 'Rekening Bank', icon: Building2, color: '#137333' },
  ];

  return (
    <PageContainer
      title="Pindah Saldo"
      description="Pindahkan saldo antar metode pembayaran: kas, QRIS, atau rekening bank."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-[15px] font-bold text-[#254222] mb-5">Form Pemindahan Saldo</h3>

            {/* From */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#254222] uppercase tracking-wider mb-2">Dari (Sumber)</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFromType(opt.value)}
                    className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                      fromType === opt.value
                        ? 'border-[#254222] bg-[#cae4c5]/30 text-[#254222]'
                        : 'border-slate-200 text-[#76777d] hover:border-[#cae4c5]'
                    }`}
                  >
                    <opt.icon size={18} />
                    <span className="text-[10px] text-center leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
              {fromType === 'bank' && (
                <select
                  value={fromBankId}
                  onChange={(e) => setFromBankId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#cae4c5] text-sm font-semibold text-[#254222] focus:outline-none focus:border-[#99cc66]"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber}</option>
                  ))}
                </select>
              )}
              <div className="mt-2 p-2.5 bg-[#cae4c5]/20 rounded-lg text-xs">
                <span className="text-[#76777d]">Saldo tersedia: </span>
                <span className="font-bold text-[#254222]">{formatCurrency(fromBalance)}</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center my-3">
              <div className="w-10 h-10 rounded-full bg-[#99cc66] flex items-center justify-center">
                <ArrowRight size={20} className="text-[#254222]" />
              </div>
            </div>

            {/* To */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-[#254222] uppercase tracking-wider mb-2">Ke (Tujuan)</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setToType(opt.value)}
                    className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                      toType === opt.value
                        ? 'border-[#99cc66] bg-[#cae4c5]/30 text-[#254222]'
                        : 'border-slate-200 text-[#76777d] hover:border-[#cae4c5]'
                    }`}
                  >
                    <opt.icon size={18} />
                    <span className="text-[10px] text-center leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
              {toType === 'bank' && (
                <select
                  value={toBankId}
                  onChange={(e) => setToBankId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#cae4c5] text-sm font-semibold text-[#254222] focus:outline-none focus:border-[#99cc66]"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#254222] uppercase tracking-wider mb-1.5">Jumlah Pindah (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setAmount(raw ? new Intl.NumberFormat('id-ID').format(parseInt(raw)) : '');
                }}
                placeholder="0"
                className="w-full h-11 px-4 border border-[#cae4c5] rounded-xl font-bold text-[#254222] focus:outline-none focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 text-lg"
              />
              {amountNum > fromBalance && (
                <p className="text-xs text-red-500 font-semibold mt-1">⚠ Melebihi saldo yang tersedia</p>
              )}
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-[#254222] uppercase tracking-wider mb-1.5">Keterangan (opsional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Setor tunai ke rekening"
                className="w-full h-10 px-3 border border-[#cae4c5] rounded-xl text-sm text-[#254222] focus:outline-none focus:border-[#99cc66]"
              />
            </div>

            {/* Summary */}
            {amountNum > 0 && (
              <div className="mb-4 p-3 bg-[#eff4ff] rounded-xl text-xs border border-[#d3e4fe]">
                <p className="font-semibold text-[#254222] mb-1">Ringkasan Pemindahan:</p>
                <p className="text-[#45464d]">{getLabel(fromType, fromBankId)} <span className="font-bold text-[#ba1a1a]">-{formatCurrency(amountNum)}</span></p>
                <p className="text-[#45464d]">{getLabel(toType, toBankId)} <span className="font-bold text-[#137333]">+{formatCurrency(amountNum)}</span></p>
              </div>
            )}

            {isSuccess && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-[#cae4c5] rounded-xl text-[#254222] text-xs font-semibold">
                <CheckCircle2 size={16} /> Saldo berhasil dipindahkan!
              </div>
            )}

            <button
              onClick={handleTransfer}
              disabled={!isValid}
              className="w-full h-11 rounded-xl bg-[#254222] hover:bg-[#1b3119] disabled:bg-slate-200 disabled:text-slate-400 text-[#ece2b1] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <ArrowLeftRight size={18} />
              Pindahkan Saldo Sekarang
            </button>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-[#cae4c5]/40">
              <h3 className="font-bold text-[#254222]">Riwayat Pemindahan Saldo</h3>
            </div>
            {balanceTransfers.length === 0 ? (
              <div className="py-12 text-center text-[#76777d]">
                <ArrowLeftRight size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-[#254222]">Belum ada riwayat pemindahan saldo</p>
              </div>
            ) : (
              <div className="divide-y divide-[#cae4c5]/30">
                {balanceTransfers.map((t) => {
                  const fromB = t.fromType === 'bank' ? bankAccounts.find((b) => b.id === t.fromBankId) : null;
                  const toB = t.toType === 'bank' ? bankAccounts.find((b) => b.id === t.toBankId) : null;
                  const fromLabel = t.fromType === 'cash' ? 'Kas' : t.fromType === 'qris' ? 'QRIS' : fromB ? `${fromB.bank}` : 'Bank';
                  const toLabel = t.toType === 'cash' ? 'Kas' : t.toType === 'qris' ? 'QRIS' : toB ? `${toB.bank}` : 'Bank';
                  return (
                    <div key={t.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#cae4c5]/10 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#254222]">
                          <span>{fromLabel}</span>
                          <ArrowRight size={14} className="text-[#76777d]" />
                          <span>{toLabel}</span>
                        </div>
                        <div className="text-[11px] text-[#76777d] mt-0.5">
                          {format(new Date(t.date), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                          {t.notes && ` · ${t.notes}`}
                        </div>
                      </div>
                      <span className="font-bold text-[#3755c3] text-sm">{formatCurrency(t.amount)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
