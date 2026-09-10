import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useFinanceStore } from '@/stores/financeStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  Users, Plus, Trash2, Banknote, Building2, X, ChevronDown, ChevronUp, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function InvestorPage() {
  const { investors, investorDeposits, addInvestor, deleteInvestor, addInvestorDeposit } = useFinanceStore();
  const { bankAccounts } = useSettingsStore();

  const [isAddInvestorOpen, setIsAddInvestorOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedInvestorId, setSelectedInvestorId] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add investor form
  const [invName, setInvName] = useState('');
  const [invPhone, setInvPhone] = useState('');
  const [invNotes, setInvNotes] = useState('');

  // Deposit form
  const [depAmount, setDepAmount] = useState('');
  const [depMethod, setDepMethod] = useState<'cash' | 'transfer'>('cash');
  const [depBankId, setDepBankId] = useState(bankAccounts[0]?.id || '');
  const [depNotes, setDepNotes] = useState('');

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

  const handleAddInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim()) return;
    try {
      await addInvestor({ name: invName.trim(), phone: invPhone, notes: invNotes });
      toast.success(`Investor "${invName}" berhasil ditambahkan!`);
      setInvName(''); setInvPhone(''); setInvNotes('');
      setIsAddInvestorOpen(false);
    } catch (err: any) {
      toast.error('Gagal menambahkan investor: ' + err.message);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(depAmount.replace(/\D/g, ''), 10) || 0;
    if (!selectedInvestorId || amount <= 0) return;

    const investor = investors.find((i) => i.id === selectedInvestorId);
    if (!investor) return;

    try {
      await addInvestorDeposit({
        investorId: selectedInvestorId,
        investorName: investor.name,
        amount,
        method: depMethod,
        bankAccountId: depMethod === 'transfer' ? depBankId : undefined,
        notes: depNotes,
      });

      toast.success(`Dana Rp ${new Intl.NumberFormat('id-ID').format(amount)} dari ${investor.name} berhasil dicatat!`);
      setDepAmount(''); setDepNotes('');
      setIsDepositOpen(false);
    } catch (err: any) {
      toast.error('Gagal mencatat dana investor: ' + err.message);
    }
  };

  const handleOpenDeposit = (investorId: string) => {
    setSelectedInvestorId(investorId);
    setIsDepositOpen(true);
  };

  const totalInvested = investors.reduce((s, i) => s + i.totalInvested, 0);
  const totalWithdrawn = investors.reduce((s, i) => s + i.totalWithdrawn, 0);
  const netFunds = totalInvested - totalWithdrawn;

  return (
    <PageContainer
      title="Daftar Investor"
      description="Kelola data investor, catat dana masuk, dan pantau kontribusi setiap investor."
      actions={
        <button
          onClick={() => setIsAddInvestorOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#99cc66] text-[#254222] text-[13px] font-black flex items-center gap-2 hover:bg-[#86b555] transition-all shadow-sm"
        >
          <Plus size={18} strokeWidth={3} />
          Tambah Investor
        </button>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Dana Masuk', value: totalInvested, color: 'text-[#137333]' },
          { label: 'Total Bagi Hasil', value: totalWithdrawn, color: 'text-[#ba1a1a]' },
          { label: 'Dana Bersih', value: netFunds, color: 'text-[#3755c3]' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#cae4c5]/60 shadow-sm p-5">
            <p className="text-xs font-semibold text-[#76777d] uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-2xl font-black ${c.color}`}>{formatCurrency(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Investor List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {investors.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-[#254222]">Belum ada investor</p>
            <p className="text-xs text-[#76777d] mt-1">Tambahkan investor pertama Anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#cae4c5]/30">
            {investors.map((inv) => {
              const deposits = investorDeposits.filter((d) => d.investorId === inv.id);
              const isExpanded = expandedId === inv.id;
              return (
                <div key={inv.id}>
                  <div className="px-5 py-4 flex items-center gap-4 hover:bg-[#cae4c5]/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#cae4c5] text-[#254222] flex items-center justify-center font-black text-sm shrink-0">
                      {inv.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#254222] text-sm">{inv.name}</p>
                      {inv.phone && <p className="text-xs text-[#76777d]">{inv.phone}</p>}
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-[#76777d]">Total Investasi</p>
                      <p className="font-bold text-[#137333] text-sm">{formatCurrency(inv.totalInvested)}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-[#76777d]">Bagi Hasil</p>
                      <p className="font-bold text-[#ba1a1a] text-sm">{formatCurrency(inv.totalWithdrawn)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenDeposit(inv.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#cae4c5] text-[#254222] text-xs font-bold hover:bg-[#99cc66] transition-all flex items-center gap-1"
                      >
                        <Banknote size={13} /> Dana Masuk
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                        className="p-1.5 rounded-lg text-[#76777d] hover:bg-[#cae4c5]/30 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Hapus investor ${inv.name}?`)) {
                            try {
                              await deleteInvestor(inv.id);
                              toast.success('Investor dihapus!');
                            } catch (err: any) {
                              toast.error('Gagal menghapus: ' + err.message);
                            }
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Deposit History (collapsed) */}
                  {isExpanded && (
                    <div className="bg-[#cae4c5]/10 border-t border-[#cae4c5]/30 px-5 py-3">
                      <p className="text-xs font-bold text-[#254222] uppercase tracking-wider mb-2">Riwayat Setoran Dana</p>
                      {deposits.length === 0 ? (
                        <p className="text-xs text-[#76777d]">Belum ada setoran.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {deposits.map((d) => (
                            <div key={d.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-[#cae4c5]/40">
                              <span className="text-[#76777d]">{format(new Date(d.date), 'dd MMM yyyy, HH:mm', { locale: localeId })}</span>
                              <span className="text-[#76777d]">{d.method === 'transfer' ? `Transfer Bank` : 'Tunai'}</span>
                              <span className="font-bold text-[#137333]">+{formatCurrency(d.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Investor Modal */}
      {isAddInvestorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#cae4c5]/40 bg-[#cae4c5]/10">
              <h2 className="text-lg font-bold text-[#254222]">Tambah Investor Baru</h2>
              <button onClick={() => setIsAddInvestorOpen(false)} className="text-[#76777d] hover:text-[#254222]"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddInvestor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Nama Investor *</label>
                <input type="text" value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="Nama lengkap investor"
                  className="w-full px-4 py-2.5 border border-[#cae4c5] rounded-xl text-sm focus:outline-none focus:border-[#99cc66]" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">No. Telepon</label>
                <input type="text" value={invPhone} onChange={(e) => setInvPhone(e.target.value)} placeholder="08xx-xxxx-xxxx"
                  className="w-full px-4 py-2.5 border border-[#cae4c5] rounded-xl text-sm focus:outline-none focus:border-[#99cc66]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Catatan</label>
                <input type="text" value={invNotes} onChange={(e) => setInvNotes(e.target.value)} placeholder="Keterangan tambahan..."
                  className="w-full px-4 py-2.5 border border-[#cae4c5] rounded-xl text-sm focus:outline-none focus:border-[#99cc66]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddInvestorOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[#76777d] font-semibold text-sm hover:bg-slate-50">Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#254222] text-[#ece2b1] font-bold text-sm hover:bg-[#1b3119] shadow-sm">Simpan Investor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#cae4c5]/40 bg-[#cae4c5]/10">
              <h2 className="text-lg font-bold text-[#254222]">Catat Dana Investor</h2>
              <button onClick={() => setIsDepositOpen(false)} className="text-[#76777d] hover:text-[#254222]"><X size={20} /></button>
            </div>
            <form onSubmit={handleDeposit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Investor</label>
                <select value={selectedInvestorId} onChange={(e) => setSelectedInvestorId(e.target.value)}
                  className="w-full h-10 px-3 border border-[#cae4c5] rounded-xl text-sm font-semibold text-[#254222] focus:outline-none focus:border-[#99cc66]">
                  {investors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Jumlah Dana (Rp) *</label>
                <input type="text" inputMode="numeric" value={depAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setDepAmount(raw ? new Intl.NumberFormat('id-ID').format(parseInt(raw)) : '');
                  }}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-[#cae4c5] rounded-xl text-sm font-bold text-[#254222] focus:outline-none focus:border-[#99cc66]" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-2">Metode Penyetoran</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ value: 'cash', label: 'Tunai / Kas', icon: Banknote }, { value: 'transfer', label: 'Transfer Bank', icon: Building2 }].map((m) => (
                    <button key={m.value} type="button" onClick={() => setDepMethod(m.value as any)}
                      className={`p-3 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all ${depMethod === m.value ? 'border-[#254222] bg-[#cae4c5]/30 text-[#254222]' : 'border-slate-200 text-[#76777d]'}`}>
                      <m.icon size={16} />{m.label}
                    </button>
                  ))}
                </div>
              </div>
              {depMethod === 'transfer' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-[#254222] mb-1.5">Rekening Penerima</label>
                  <select value={depBankId} onChange={(e) => setDepBankId(e.target.value)}
                    className="w-full h-10 px-3 border border-[#cae4c5] rounded-xl text-sm font-semibold text-[#254222] focus:outline-none focus:border-[#99cc66]">
                    {bankAccounts.map((b) => <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber} (Saldo: Rp {(b.balance || 0).toLocaleString('id-ID')})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Catatan</label>
                <input type="text" value={depNotes} onChange={(e) => setDepNotes(e.target.value)} placeholder="Keterangan setoran..."
                  className="w-full px-4 py-2.5 border border-[#cae4c5] rounded-xl text-sm focus:outline-none focus:border-[#99cc66]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsDepositOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[#76777d] font-semibold text-sm hover:bg-slate-50">Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#254222] text-[#ece2b1] font-bold text-sm hover:bg-[#1b3119] shadow-sm">Simpan Dana</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
