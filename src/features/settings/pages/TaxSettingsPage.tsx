import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Receipt, Save, Percent } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

export default function TaxSettingsPage() {
  const { taxSettings, updateTaxSettings } = useSettingsStore();
  const [formData, setFormData] = useState(taxSettings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    updateTaxSettings(formData);
    toast.success('Pengaturan pajak berhasil diperbarui!');
  };

  return (
    <PageContainer 
      title="Pajak & Biaya" 
      description="Kelola pengaturan PPN bawaan dan biaya lainnya untuk transaksi toko."
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
              <Receipt size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#254222]">Pajak Pertambahan Nilai (PPN)</h3>
              <p className="text-sm text-[#76777d]">Pengaturan PPN default yang akan diterapkan pada transaksi offline.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#254222] mb-1.5">Persentase PPN Default (%)</label>
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#76777d]">
                  <Percent size={18} />
                </div>
                <input
                  type="number"
                  name="defaultTaxPercentage"
                  value={formData.defaultTaxPercentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-[#0b1c30] focus:ring-2 focus:ring-[#99cc66] focus:border-[#99cc66] focus:bg-white outline-none transition-all hide-spin-button"
                  placeholder="Misal: 11"
                />
              </div>
              <p className="text-xs text-[#76777d] mt-2">
                Pajak ini secara otomatis dihitung dari subtotal transaksi di Terminal POS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
