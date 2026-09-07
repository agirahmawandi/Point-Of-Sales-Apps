import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { CreditCard, Plus, Trash2, Building2 } from 'lucide-react';
import { useSettingsStore, type BankAccount } from '@/stores/settingsStore';
import { toast } from 'sonner';

export default function PaymentMethodsPage() {
  const { bankAccounts, addBankAccount, deleteBankAccount } = useSettingsStore();
  
  // State for Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<BankAccount, 'id'>>({
    bank: '',
    accountNumber: '',
    accountName: '',
  });

  const handleOpenModal = () => {
    setFormData({ bank: '', accountNumber: '', accountName: '' });
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bank || !formData.accountNumber || !formData.accountName) {
      toast.error('Semua kolom harus diisi');
      return;
    }
    
    addBankAccount(formData);
    toast.success('Rekening bank berhasil ditambahkan!');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, bank: string) => {
    if (window.confirm(`Hapus rekening bank ${bank} ini?`)) {
      deleteBankAccount(id);
      toast.success('Rekening bank berhasil dihapus!');
    }
  };

  return (
    <PageContainer 
      title="Metode Pembayaran" 
      description="Kelola daftar rekening bank yang digunakan untuk menerima pembayaran Transfer / EDC."
      actions={
        <button
          onClick={handleOpenModal}
          className="h-10 px-4 rounded-xl bg-[#99cc66] text-[#254222] text-[13px] font-black flex items-center gap-2 hover:bg-[#86b555] transition-all shadow-sm"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Tambah Rekening</span>
        </button>
      }
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {bankAccounts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#cae4c5]/30 text-[#254222] flex items-center justify-center mb-4">
              <CreditCard size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#254222] mb-1">Belum Ada Rekening</h3>
            <p className="text-[#76777d] text-sm max-w-sm mb-6">
              Tambahkan rekening bank untuk mempermudah pencatatan pembayaran via Kartu Debit atau Transfer.
            </p>
            <button
              onClick={handleOpenModal}
              className="px-6 py-2.5 rounded-xl bg-[#254222] text-[#ece2b1] font-bold text-sm shadow-sm hover:bg-[#1b3119] transition-all"
            >
              Tambah Rekening Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#cae4c5]/20 border-b border-slate-100 text-[11px] font-bold text-[#254222] uppercase tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">Bank</th>
                  <th className="px-6 py-4">Nomor Rekening</th>
                  <th className="px-6 py-4">Atas Nama</th>
                  <th className="px-6 py-4 text-right rounded-tr-2xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[13px]">
                {bankAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#254222] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#cae4c5]/30 flex items-center justify-center text-[#254222]">
                        <Building2 size={16} />
                      </div>
                      {acc.bank}
                    </td>
                    <td className="px-6 py-4 text-[#45464d] font-mono">{acc.accountNumber}</td>
                    <td className="px-6 py-4 text-[#45464d]">{acc.accountName}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(acc.id, acc.bank)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Rekening"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Rekening */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#cae4c5]/10">
              <h2 className="text-lg font-bold text-[#254222]">Tambah Rekening Bank</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Nama Bank</label>
                <input
                  type="text"
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  placeholder="Misal: BCA, Mandiri, BNI"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] outline-none focus:border-[#99cc66] focus:ring-1 focus:ring-[#99cc66] transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Nomor Rekening</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Masukkan nomor rekening"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] outline-none focus:border-[#99cc66] focus:ring-1 focus:ring-[#99cc66] transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#254222] mb-1.5">Atas Nama (Pemilik Rekening)</label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="Nama pemilik rekening"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] outline-none focus:border-[#99cc66] focus:ring-1 focus:ring-[#99cc66] transition-all"
                  required
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-[13px] hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#254222] text-[#ece2b1] font-bold text-[13px] hover:bg-[#1b3119] transition-colors shadow-sm"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
