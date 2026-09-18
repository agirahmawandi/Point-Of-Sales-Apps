import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showInfo } from '@/lib/toast';
import PageContainer from '@/components/layout/PageContainer';
import { Plus, Search, Edit2, Trash2, Shield, User, Mail, X, Save, Crown } from 'lucide-react';
import { useUserStore, type UserProfile } from '@/stores/userStore';
import { toast } from 'sonner';

export default function UserManagementPage() {
  const { users, isLoading, fetchUsers, addUser, updateUser, deleteUser } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'kasir' as 'admin_utama' | 'admin' | 'kasir' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setSelectedUser(null);
    setFormData({ name: '', email: '', role: 'kasir' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?`)) {
      const { success, error } = await deleteUser(id);
      if (success) {
        toast.success('Pengguna berhasil dihapus');
      } else {
        toast.error(error || 'Gagal menghapus pengguna');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (selectedUser) {
        const { success, error } = await updateUser(selectedUser.id, formData);
        if (success) {
          toast.success('Pengguna berhasil diperbarui');
          setIsModalOpen(false);
        } else {
          toast.error(error || 'Gagal memperbarui pengguna');
        }
      } else {
        const { success, error } = await addUser(formData);
        if (success) {
          toast.success('Pengguna berhasil ditambahkan');
          setIsModalOpen(false);
        } else {
          toast.error(error || 'Gagal menambahkan pengguna');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Manajemen Pengguna"
      description="Kelola akun akses kasir dan hak akses administrator sistem."
      actions={
        <button 
          onClick={openAddModal}
          className="h-10 px-4 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Tambah Pengguna</span>
        </button>
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#eff4ff] flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#eff4ff] text-[13px] text-[#0b1c30] placeholder-[#76777d] border border-transparent focus:outline-none focus:bg-white focus:border-[#3755c3]/30 focus:ring-2 focus:ring-[#3755c3]/15 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                <th className="py-3.5 px-5">Profil Pengguna</th>
                <th className="py-3.5 px-5 text-center">Peran (Role)</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff] text-[13px]">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[#76777d]">
                    <div className="animate-spin w-8 h-8 border-4 border-[#3755c3] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="font-semibold text-[#0b1c30]">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[#76777d]">
                    <User size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-[#0b1c30]">Tidak ada pengguna ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#3755c3] font-bold text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0b1c30]">{user.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <Mail size={12} />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                        user.role === 'admin_utama'
                          ? 'bg-amber-100 text-amber-700'
                          : user.role === 'admin' 
                            ? 'bg-[#e6f4ea] text-[#137333]' 
                            : 'bg-[#eff4ff] text-[#3755c3]'
                      }`}>
                        {user.role === 'admin_utama' ? <Crown size={12} /> : user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-slate-400 hover:text-[#137333] hover:bg-[#e6f4ea] rounded-lg transition-colors"
                          title="Edit Pengguna"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 text-slate-400 hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                          title="Hapus Pengguna"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#0b1c30]">
                {selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0b1c30] mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 focus:ring-[#3755c3]/20 focus:border-[#3755c3] focus:bg-white outline-none transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#0b1c30] mb-1.5">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 focus:ring-[#3755c3]/20 focus:border-[#3755c3] focus:bg-white outline-none transition-all"
                  placeholder="email@contoh.com"
                />
                {!selectedUser && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    * Catatan: Akun login (Supabase Auth) harus dibuat terpisah oleh Admin Server.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#0b1c30] mb-1.5">Peran (Role)</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as 'admin_utama' | 'admin' | 'kasir'})}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 focus:ring-[#3755c3]/20 focus:border-[#3755c3] focus:bg-white outline-none transition-all"
                >
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                  <option value="admin_utama">Admin Utama</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 rounded-xl font-bold text-[#76777d] bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl font-bold text-white bg-[#3755c3] hover:bg-[#2a429c] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
