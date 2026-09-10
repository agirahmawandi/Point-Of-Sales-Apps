import React, { useState } from 'react';
import { useExpenseStore } from '@/stores/expenseStore';
import PageContainer from '@/components/layout/PageContainer';
import { Search, Plus, Edit2, Trash2, Tag, Layers, Loader2 } from 'lucide-react';
import type { ExpenseCategory } from '@/types/expense';
import { toast } from 'sonner';

export default function ExpenseCategoryPage() {
  const { categories, addCategory, updateCategory, deleteCategory, isLoading } = useExpenseStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
  });

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', icon: '📋', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category: ExpenseCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      icon: category.icon || '📋',
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await addCategory(formData);
        toast.success('Kategori baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin hapus kategori ini?')) {
      try {
        await deleteCategory(id);
        toast.success('Kategori berhasil dihapus');
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus kategori');
      }
    }
  };

  return (
    <PageContainer 
      title="Kategori Beban" 
      description="Kelola pos pengelompokan jenis pengeluaran operasional toko."
      actions={
        <button 
          onClick={openAddModal}
          className="h-10 px-4 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Tambah Kategori</span>
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
              placeholder="Cari kategori beban..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#eff4ff] text-[13px] text-[#0b1c30] placeholder-[#76777d] border border-transparent focus:outline-none focus:bg-white focus:border-[#3755c3]/30 focus:ring-2 focus:ring-[#3755c3]/15 transition-all"
            />
          </div>
          <div className="text-xs font-semibold text-[#76777d]">
            Total Kategori: <strong className="text-[#0b1c30]">{categories.length}</strong>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                <th className="py-3.5 px-5 w-20 text-center">Ikon</th>
                <th className="py-3.5 px-5">Nama Kategori</th>
                <th className="py-3.5 px-5">Deskripsi</th>
                <th className="py-3.5 px-5 text-right">Total Tercatat</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff] text-[13px]">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#76777d]">
                    <Layers size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-[#0b1c30]">Belum ada kategori beban</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="px-5 py-3.5 text-2xl text-center">{cat.icon}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#0b1c30]">{cat.name}</td>
                    <td className="px-5 py-3.5 text-[#76777d]">{cat.description || '-'}</td>
                    <td className="px-5 py-3.5 font-bold text-[#0b1c30] text-right">
                      <span className="text-[11px] text-[#76777d] mr-1">Rp</span>
                      <span>{formatNumber(cat.totalExpenses || 0)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-[#76777d] hover:text-[#3755c3] hover:bg-[#eff4ff] rounded-lg transition-colors"
                          title="Edit Kategori"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors"
                          title="Hapus Kategori"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-[#eff4ff] bg-[#eff4ff]/60">
              <h2 className="text-[16px] font-bold text-[#0b1c30]">
                {editingId ? 'Edit Kategori Beban' : 'Tambah Kategori Beban'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4 text-xs">
                <div className="flex gap-3">
                  <div className="w-20 shrink-0">
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Emoji</label>
                    <input 
                      type="text" 
                      value={formData.icon}
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      className="w-full h-10 px-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] text-center text-lg"
                      placeholder="⚡"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Nama Kategori *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] text-xs text-[#0b1c30]"
                      placeholder="Listrik, Gaji, dll."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Deskripsi / Penjelasan</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] text-xs text-[#0b1c30] resize-none"
                    placeholder="Keterangan singkat jenis beban ini..."
                    rows={2}
                  />
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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
