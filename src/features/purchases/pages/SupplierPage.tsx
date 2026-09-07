import React, { useState } from 'react';
import { usePurchaseStore } from '@/stores/purchaseStore';
import PageContainer from '@/components/layout/PageContainer';
import { Search, Plus, Edit2, Trash2, Users, Building2, Phone, MapPin } from 'lucide-react';
import type { Supplier } from '@/types/purchase';

export default function SupplierPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = usePurchaseStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSupplier(editingId, formData);
    } else {
      addSupplier(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus pemasok ini? Data PO terkait mungkin akan terpengaruh.')) {
      deleteSupplier(id);
    }
  };

  return (
    <PageContainer 
      title="Manajemen Pemasok" 
      description="Kelola direktori vendor pemasok barang dan pantau status hutang dagang."
      actions={
        <button 
          onClick={openAddModal}
          className="h-10 px-4 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Tambah Pemasok</span>
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
              placeholder="Cari nama toko atau kontak person..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#eff4ff] text-[13px] text-[#0b1c30] placeholder-[#76777d] border border-transparent focus:outline-none focus:bg-white focus:border-[#3755c3]/30 focus:ring-2 focus:ring-[#3755c3]/15 transition-all"
            />
          </div>
          <div className="text-xs font-semibold text-[#76777d]">
            Total Pemasok: <strong className="text-[#0b1c30]">{suppliers.length}</strong>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                <th className="py-3.5 px-5">Nama Pemasok</th>
                <th className="py-3.5 px-5">Kontak Person</th>
                <th className="py-3.5 px-5 text-right">Total Pembelian</th>
                <th className="py-3.5 px-5 text-right">Sisa Hutang (AP)</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff] text-[13px]">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#76777d]">
                    <Users size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-[#0b1c30]">Tidak ada data pemasok</p>
                    <p className="text-xs text-[#76777d] mt-1">Tambahkan data vendor pemasok baru untuk memulai PO.</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#0b1c30] flex items-center gap-2">
                        <Building2 size={16} className="text-[#3755c3]" />
                        <span>{supplier.name}</span>
                      </div>
                      <div className="text-xs text-[#76777d] mt-0.5 truncate max-w-[260px]">{supplier.address || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#0b1c30]">{supplier.contactPerson || '-'}</div>
                      <div className="text-xs text-[#76777d] mt-0.5">{supplier.phone || supplier.email || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-[#0b1c30]">
                      <span className="text-[11px] text-[#76777d] mr-1">Rp</span>
                      <span>{formatNumber(supplier.totalPurchases)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold">
                      {supplier.totalDebt > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-xs">
                          Rp {formatNumber(supplier.totalDebt)}
                        </span>
                      ) : (
                        <span className="text-[#137333] text-xs font-semibold">Lunas (Rp 0)</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(supplier)}
                          className="p-1.5 text-[#76777d] hover:text-[#3755c3] hover:bg-[#eff4ff] rounded-lg transition-colors"
                          title="Edit Pemasok"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(supplier.id)}
                          className="p-1.5 text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors"
                          title="Hapus Pemasok"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#eff4ff] bg-[#eff4ff]/60">
              <h2 className="text-[16px] font-bold text-[#0b1c30]">
                {editingId ? 'Edit Data Pemasok' : 'Tambah Pemasok Baru'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto text-xs">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Nama Perusahaan / Toko *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
                    placeholder="Contoh: PT Sumber Pangan Makmur"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Kontak Person (PIC)</label>
                  <input 
                    type="text" 
                    value={formData.contactPerson}
                    onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
                    placeholder="Contoh: Pak Budi"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">No. HP / WhatsApp</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
                      placeholder="0812..."
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
                      placeholder="sales@vendor.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Alamat Lengkap</label>
                  <textarea 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all resize-none"
                    placeholder="Jl. Pergudangan Indah No..."
                  />
                </div>
              </div>
              
              <div className="p-4 border-t border-[#eff4ff] bg-[#eff4ff]/20 flex justify-end gap-2.5 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-white text-[#0b1c30] border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="h-10 px-5 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Simpan Pemasok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
