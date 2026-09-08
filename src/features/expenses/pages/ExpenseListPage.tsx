import React, { useState } from 'react';
import { useExpenseStore } from '@/stores/expenseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import PageContainer from '@/components/layout/PageContainer';
import { Search, Plus, Paperclip, FileText, CheckCircle2, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function ExpenseListPage() {
  const { expenses, categories, addExpense } = useExpenseStore();
  const { bankAccounts, updateBankBalance } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id || '');
  
  const [formData, setFormData] = useState({
    categoryId: '',
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'Tunai',
    hasAttachment: false
  });

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(search.toLowerCase()) || 
    e.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  const openAddModal = () => {
    setFormData({
      categoryId: categories[0]?.id || '',
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'Tunai',
      hasAttachment: false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount) return;

    addExpense({
      categoryId: formData.categoryId,
      description: formData.description,
      amount: parseInt(formData.amount),
      date: new Date(formData.date).toISOString(),
      paymentMethod: formData.paymentMethod,
      bankAccountId: (formData.paymentMethod === 'Transfer Bank' || formData.paymentMethod === 'Kartu Kredit') ? selectedBankId : undefined,
      attachment: formData.hasAttachment ? 'dummy-file.jpg' : undefined,
      createdBy: 'admin'
    });
    
    // Potong saldo jika bayar pakai bank
    if ((formData.paymentMethod === 'Transfer Bank' || formData.paymentMethod === 'Kartu Kredit') && selectedBankId) {
      updateBankBalance(selectedBankId, -parseInt(formData.amount));
    }
    
    setIsModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, hasAttachment: true });
    }
  };

  return (
    <PageContainer 
      title="Pengeluaran Operasional" 
      description="Catat dan pantau seluruh beban biaya operasional harian toko (listrik, gaji, sewa, dll)."
      actions={
        <button 
          onClick={openAddModal}
          className="h-10 px-4 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Catat Pengeluaran</span>
        </button>
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#eff4ff] flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={18} />
            <input 
              type="text" 
              placeholder="Cari deskripsi atau kategori..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#eff4ff] text-[13px] text-[#0b1c30] placeholder-[#76777d] border border-transparent focus:outline-none focus:bg-white focus:border-[#3755c3]/30 focus:ring-2 focus:ring-[#3755c3]/15 transition-all"
            />
          </div>
          <div className="text-xs font-semibold text-[#76777d]">
            Total Catatan: <strong className="text-[#0b1c30]">{expenses.length}</strong>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                <th className="py-3.5 px-5">Tanggal</th>
                <th className="py-3.5 px-5">Kategori</th>
                <th className="py-3.5 px-5">Deskripsi / Keterangan</th>
                <th className="py-3.5 px-5">Metode Bayar</th>
                <th className="py-3.5 px-5 text-right">Jumlah (Rp)</th>
                <th className="py-3.5 px-5 text-center w-20">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff] text-[13px]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#76777d]">
                    <Receipt size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-[#0b1c30]">Belum ada catatan pengeluaran</p>
                    <p className="text-xs text-[#76777d] mt-1">Klik tombol di atas untuk mencatat pengeluaran operasional toko.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="px-5 py-3.5 text-[#76777d]">
                      {format(new Date(exp.date), 'dd MMM yyyy', { locale: localeId })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#e5eeff] text-[#0b1c30] text-xs font-semibold">
                        <span>{exp.category?.icon || '📋'}</span>
                        <span>{exp.category?.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#0b1c30]">
                      {exp.description}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[#45464d] text-[11px] font-semibold uppercase">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#ba1a1a] text-right">
                      <span className="text-[11px] text-[#76777d] mr-1">Rp</span>
                      <span>{formatNumber(exp.amount)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {exp.attachment ? (
                        <button className="text-[#3755c3] hover:bg-[#eff4ff] p-1.5 rounded-lg inline-flex transition-colors" title="Lihat Bukti Lampiran">
                          <FileText size={17} />
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Pengeluaran */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-auto border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-[#eff4ff] bg-[#eff4ff]/60">
              <h2 className="text-[16px] font-bold text-[#0b1c30]">Catat Pengeluaran Baru</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Tanggal Transaksi *</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] text-xs text-[#0b1c30]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Kategori Beban *</label>
                    <select 
                      required
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] text-xs text-[#0b1c30] bg-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Deskripsi / Keterangan *</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] text-xs text-[#0b1c30] resize-none"
                    placeholder="Contoh: Tagihan listrik toko bulan September..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Jumlah Biaya (Rp) *</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] font-bold text-[#0b1c30]"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Metode Bayar</label>
                    <select 
                      value={formData.paymentMethod}
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] text-xs text-[#0b1c30] bg-white"
                    >
                      <option value="Tunai">Tunai / Kas</option>
                      <option value="Transfer Bank">Transfer Bank</option>
                      <option value="Kartu Kredit">Kartu Kredit</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                {(formData.paymentMethod === 'Transfer Bank' || formData.paymentMethod === 'Kartu Kredit') && (
                  <div className="mt-1 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Sumber Rekening Bank</label>
                    <select
                      value={selectedBankId}
                      onChange={e => setSelectedBankId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#3755c3]/30 bg-[#eff4ff]/30 text-sm font-semibold text-[#0b1c30] focus:outline-none focus:border-[#3755c3]"
                    >
                      {bankAccounts.map(b => (
                        <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber} (Saldo: Rp {(b.balance || 0).toLocaleString('id-ID')})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="border border-dashed border-[#d3e4fe] rounded-xl p-4 mt-2 bg-[#eff4ff]/40 relative">
                  <label className="block text-xs font-semibold text-[#0b1c30] text-center mb-1 cursor-pointer">
                    <Paperclip size={18} className="mx-auto mb-1 text-[#3755c3]" />
                    Upload Foto Struk / Bukti Bayar
                  </label>
                  <p className="text-[11px] text-[#76777d] text-center mb-2">Format JPG, PNG, atau PDF (Max 2MB)</p>
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,.pdf"
                  />
                  {formData.hasAttachment && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[#137333] font-semibold">
                      <CheckCircle2 size={15} /> File bukti pembayaran terpilih
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-[#eff4ff] bg-[#eff4ff]/20 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 text-[#0b1c30] font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="h-9 px-5 bg-[#3755c3] hover:bg-[#2a429c] text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
