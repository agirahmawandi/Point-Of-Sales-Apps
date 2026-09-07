import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Plus, Search, Edit2, Trash2, Shield, User, Lock, Mail } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'kasir';
  status: 'active' | 'inactive';
}

const DUMMY_USERS: UserItem[] = [
  { id: '1', name: 'Admin Utama', email: 'admin@tokomakmur.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Siti Kasir', email: 'siti@tokomakmur.com', role: 'kasir', status: 'active' },
  { id: '3', name: 'Budi (Shift Malam)', email: 'budi@tokomakmur.com', role: 'kasir', status: 'inactive' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>(DUMMY_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer
      title="Manajemen Pengguna"
      description="Kelola akun akses kasir dan hak akses administrator sistem."
      actions={
        <button className="h-10 px-4 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2">
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
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff] text-[13px]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#76777d]">
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
                        user.role === 'admin' 
                          ? 'bg-[#e6f4ea] text-[#137333]' 
                          : 'bg-[#eff4ff] text-[#3755c3]'
                      }`}>
                        {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        user.status === 'active'
                          ? 'bg-[#e6f4ea] text-[#137333]'
                          : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}>
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-[#3755c3] hover:bg-[#eff4ff] rounded-lg transition-colors"
                          title="Ubah Password"
                        >
                          <Lock size={16} />
                        </button>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-[#137333] hover:bg-[#e6f4ea] rounded-lg transition-colors"
                          title="Edit Pengguna"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
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
    </PageContainer>
  );
}
