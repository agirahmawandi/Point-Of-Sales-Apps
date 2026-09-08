import React, { useState, useEffect } from 'react';
import { useCustomerStore } from '@/stores/customerStore';
import { useCartStore } from '@/stores/cartStore';
import { X, Search, User, Phone, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OfflineCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OfflineCustomerModal({ isOpen, onClose, onSuccess }: OfflineCustomerModalProps) {
  const { customers, addCustomer, findCustomerByPhoneOrName, isLoading, fetchCustomers } = useCustomerStore();
  const { setCustomer } = useCartStore();

  const [mode, setMode] = useState<'search' | 'new'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Customer State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (isOpen && customers.length === 0) {
      fetchCustomers();
    }
  }, [isOpen, customers.length, fetchCustomers]);

  if (!isOpen) return null;

  const handleSearchSelect = (customer: any) => {
    setCustomer(customer.id, customer.name);
    toast.success(`Pelanggan terpilih: ${customer.name}`);
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Cek apakah pelanggan sudah ada (berdasarkan nama atau nomor HP)
    const existingByName = findCustomerByPhoneOrName(name);
    const existingByPhone = phone ? findCustomerByPhoneOrName(phone) : undefined;

    if (existingByName || existingByPhone) {
      toast.error('Pelanggan dengan nama atau nomor HP ini sudah ada di database. Silakan cari dari daftar.');
      setMode('search');
      setSearchQuery(existingByName?.name || existingByPhone?.phone || '');
      return;
    }

    try {
      const newCustomer = await addCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        platform: 'Offline'
      });

      setCustomer(newCustomer.id, newCustomer.name);
      toast.success('Pelanggan baru berhasil ditambahkan dan dipilih!');
      
      // Reset
      setName('');
      setPhone('');
      setAddress('');
      
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Gagal menambahkan pelanggan');
    }
  };

  const handleSkip = () => {
    setCustomer(undefined, 'Pelanggan Umum');
    onClose();
    if (onSuccess) onSuccess();
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#cae4c5]/40 bg-[#cae4c5]/10">
          <div>
            <h2 className="text-lg font-bold text-[#254222]">Informasi Pelanggan</h2>
            <p className="text-xs text-[#76777d] mt-0.5">Pilih atau tambah pelanggan untuk transaksi ini</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#76777d] hover:bg-white hover:text-[#254222] transition-colors shadow-sm border border-transparent hover:border-[#cae4c5]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setMode('search')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === 'search' ? 'bg-[#254222] text-[#ece2b1] shadow-md' : 'bg-white text-[#76777d] border border-slate-200 hover:border-[#cae4c5]'
            }`}
          >
            Cari Data Pelanggan
          </button>
          <button
            onClick={() => setMode('new')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === 'new' ? 'bg-[#99cc66] text-[#254222] shadow-md' : 'bg-white text-[#76777d] border border-slate-200 hover:border-[#cae4c5]'
            }`}
          >
            + Pelanggan Baru
          </button>
        </div>

        <div className="p-6">
          {mode === 'search' ? (
            <div className="space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" />
                <input
                  type="text"
                  placeholder="Ketik nama atau nomor HP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#cae4c5] text-sm text-[#254222] focus:outline-none focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all bg-white"
                  autoFocus
                />
              </div>

              <div className="h-64 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50 p-2 space-y-1.5">
                {searchQuery && filteredCustomers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#76777d] text-sm p-4 text-center">
                    <User size={32} className="mb-2 opacity-20" />
                    <p>Pelanggan tidak ditemukan.</p>
                    <button 
                      onClick={() => { setMode('new'); setName(searchQuery); }}
                      className="mt-2 text-[#3755c3] font-semibold hover:underline"
                    >
                      Daftarkan sebagai pelanggan baru
                    </button>
                  </div>
                ) : filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSearchSelect(c)}
                    className="w-full text-left p-3 rounded-lg hover:bg-[#cae4c5]/20 border border-transparent hover:border-[#cae4c5]/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-[#254222] text-sm">{c.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#76777d]">
                        {c.phone && <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                        {c.address && <span className="flex items-center gap-1"><MapPin size={10} /> {c.address}</span>}
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#cae4c5] text-[#254222] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 size={14} />
                    </div>
                  </button>
                ))}
                {!searchQuery && customers.length > 0 && (
                  <div className="p-4 text-center text-xs text-[#76777d]">
                    Ketik untuk mencari dari {customers.length} pelanggan terdaftar.
                  </div>
                )}
                {customers.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-[#76777d]">
                    Belum ada database pelanggan.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddNew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#254222] uppercase tracking-wider mb-1.5">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full h-11 px-4 rounded-xl border border-[#cae4c5] text-sm text-[#254222] focus:outline-none focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all bg-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#254222] uppercase tracking-wider mb-1.5">Nomor Telepon (Opsional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full h-11 px-4 rounded-xl border border-[#cae4c5] text-sm text-[#254222] focus:outline-none focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#254222] uppercase tracking-wider mb-1.5">Alamat (Opsional)</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat lengkap..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-[#cae4c5] text-sm text-[#254222] focus:outline-none focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all bg-white resize-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={!name.trim() || isLoading}
                className="w-full h-11 bg-[#254222] hover:bg-[#1b3119] disabled:bg-slate-300 disabled:text-slate-500 text-[#ece2b1] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Simpan & Gunakan
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <p className="text-xs text-[#76777d]">Bisa dilewati jika pelanggan tidak ingin dicatat.</p>
          <button 
            onClick={handleSkip}
            className="px-4 py-2 text-xs font-bold text-[#76777d] hover:text-[#254222] hover:bg-slate-200 rounded-lg transition-colors"
          >
            Lewati (Pelanggan Umum)
          </button>
        </div>

      </div>
    </div>
  );
}
