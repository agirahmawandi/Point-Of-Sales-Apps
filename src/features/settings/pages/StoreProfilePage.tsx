import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Store, Save, Phone, MapPin, Mail } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

export default function StoreProfilePage() {
  const { storeProfile, updateStoreProfile } = useSettingsStore();
  const [formData, setFormData] = useState(storeProfile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateStoreProfile(formData);
    toast.success('Profil toko berhasil diperbarui!');
  };

  return (
    <PageContainer 
      title="Profil Toko" 
      description="Kelola informasi utama dan identitas toko Anda."
      actions={
        <button
          onClick={handleSave}
          className="h-10 px-5 rounded-xl bg-[#254222] text-[#ece2b1] text-[13px] font-bold flex items-center gap-2 hover:bg-[#1b3119] transition-all shadow-sm"
        >
          <Save size={16} />
          <span>Simpan Perubahan</span>
        </button>
      }
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-3xl">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#cae4c5]/40 text-[#254222] flex items-center justify-center shrink-0">
              <Store size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#254222]">Informasi Dasar</h3>
              <p className="text-sm text-[#76777d]">Data ini akan ditampilkan pada struk belanja kasir.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#254222] mb-1.5">Nama Toko</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#76777d]">
                  <Store size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-[#0b1c30] focus:ring-2 focus:ring-[#99cc66] focus:border-[#99cc66] focus:bg-white outline-none transition-all"
                  placeholder="Masukkan nama toko"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#254222] mb-1.5">Nomor Telepon / WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#76777d]">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-[#0b1c30] focus:ring-2 focus:ring-[#99cc66] focus:border-[#99cc66] focus:bg-white outline-none transition-all"
                  placeholder="0812-xxxx-xxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#254222] mb-1.5">Email (Opsional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#76777d]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-[#0b1c30] focus:ring-2 focus:ring-[#99cc66] focus:border-[#99cc66] focus:bg-white outline-none transition-all"
                  placeholder="email@toko.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#254222] mb-1.5">Alamat Lengkap</label>
              <div className="relative">
                <div className="absolute top-3 left-3 text-[#76777d]">
                  <MapPin size={18} />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full py-3 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-[#0b1c30] focus:ring-2 focus:ring-[#99cc66] focus:border-[#99cc66] focus:bg-white outline-none transition-all resize-none"
                  placeholder="Masukkan alamat lengkap toko"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
