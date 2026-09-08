import React, { useState, useEffect } from 'react';
import { useProductStore } from '@/stores/productStore';
import PageContainer from '@/components/layout/PageContainer';
import { Plus, Edit, Trash2, Tags, Check, X, Loader2 } from 'lucide-react';
import type { Category } from '@/types';

export default function CategoryPage() {
  const { categories, isLoading, error, fetchCategories, addCategory, updateCategory, deleteCategory } = useProductStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await addCategory({ name: newName.trim() });
      setNewName('');
    } catch (err: any) {
      alert(err.message || 'Gagal menambah kategori');
    }
  };

  const handleUpdate = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await updateCategory(id, { name: editName.trim() });
      setIsEditing(null);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah kategori');
    }
  };

  const startEdit = (category: Category) => {
    setIsEditing(category.id);
    setEditName(category.name);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      try {
        await deleteCategory(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus kategori');
      }
    }
  };

  return (
    <PageContainer 
      title="Kategori Produk" 
      description="Kelola pengelompokan jenis barang untuk mempermudah katalog dan kasir."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        {/* Quick Add Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-[15px] font-bold text-[#0b1c30] mb-3 flex items-center gap-2">
            <Tags size={18} className="text-[#3755c3]" />
            <span>Tambah Kategori Baru</span>
          </h2>
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              placeholder="Ketik nama kategori baru (contoh: Minuman Dingin)..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isLoading}
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] placeholder-[#76777d] shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all disabled:bg-slate-50 disabled:text-slate-500"
            />
            <button
              type="submit"
              disabled={!newName.trim() || isLoading}
              className="h-10 px-5 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              <span>Tambah</span>
            </button>
          </form>
        </div>

        {/* Category Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-[#eff4ff] bg-white flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#0b1c30]">Daftar Kategori Tersedia</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#3755c3]">
              Total: {categories.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                  <th className="py-3 px-5 w-full">Nama Kategori</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff] text-[13px]">
                {isLoading && categories.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-[#76777d]">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#3755c3]" />
                      Memuat kategori...
                    </td>
                  </tr>
                ) : categories.map((category) => (
                  <tr key={category.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="px-5 py-3.5">
                      {isEditing === category.id ? (
                        <form onSubmit={(e) => handleUpdate(e, category.id)} className="flex items-center gap-2">
                          <input
                            type="text"
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={isLoading}
                            className="h-9 w-full max-w-sm px-3 rounded-lg border border-[#3755c3] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#3755c3]/20 disabled:bg-slate-50"
                          />
                          <button 
                            type="submit" 
                            disabled={isLoading}
                            className="h-9 px-3 rounded-lg bg-[#3755c3] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#2a429c] disabled:opacity-50"
                          >
                            <Check size={14} /> Simpan
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsEditing(null)} 
                            disabled={isLoading}
                            className="h-9 px-3 rounded-lg bg-slate-100 text-[#45464d] text-xs font-semibold hover:bg-slate-200 disabled:opacity-50"
                          >
                            <X size={14} /> Batal
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2 font-semibold text-[#0b1c30]">
                          <span className="w-2 h-2 rounded-full bg-[#3755c3]"></span>
                          <span>{category.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => startEdit(category)}
                          disabled={isLoading}
                          className="p-1.5 text-[#76777d] hover:text-[#3755c3] hover:bg-[#eff4ff] rounded-lg transition-colors disabled:opacity-50"
                          title="Edit Kategori"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          disabled={isLoading}
                          className="p-1.5 text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Kategori"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && categories.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-[#76777d]">
                      Belum ada kategori yang ditambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
