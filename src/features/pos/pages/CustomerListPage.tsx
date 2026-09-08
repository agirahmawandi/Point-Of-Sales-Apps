import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useCustomerStore } from '@/stores/customerStore';
import { Users, Search, ShoppingBag, MapPin, Phone, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function CustomerListPage() {
  const { customers } = useCustomerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.phone && c.phone.includes(searchQuery));
    const matchesPlatform = platformFilter === 'all' || c.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const platformColors: Record<string, string> = {
    'Offline': 'bg-[#cae4c5] text-[#254222]',
    'Shopee': 'bg-[#ffdad6] text-[#ba1a1a]',
    'Tokopedia': 'bg-[#d3e4fe] text-[#3755c3]',
    'TikTok': 'bg-slate-200 text-slate-800',
    'GoFood': 'bg-red-100 text-red-800',
    'GrabFood': 'bg-emerald-100 text-emerald-800',
    'ShopeeFood': 'bg-orange-100 text-orange-800',
    'Lainnya': 'bg-slate-100 text-slate-600',
  };

  return (
    <PageContainer
      title="Daftar Pelanggan"
      description="Kelola data pelanggan dari transaksi offline (toko) maupun online (marketplace)."
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#cae4c5]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
            <input
              type="text"
              placeholder="Cari nama atau nomor telepon..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#cae4c5] text-sm text-[#254222] focus:outline-none focus:border-[#99cc66]"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#cae4c5] text-sm font-semibold text-[#254222] focus:outline-none focus:border-[#99cc66] bg-white w-full sm:w-auto"
            >
              <option value="all">Semua Platform</option>
              <option value="Offline">Toko Fisik (Offline)</option>
              <option value="Shopee">Shopee</option>
              <option value="Tokopedia">Tokopedia</option>
              <option value="TikTok">TikTok Shop</option>
              <option value="GoFood">GoFood</option>
              <option value="GrabFood">GrabFood</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#cae4c5]/20 text-[11px] font-bold text-[#254222] uppercase tracking-wider border-b border-[#cae4c5]/40">
                <th className="py-3.5 px-5">Pelanggan</th>
                <th className="py-3.5 px-5">Kontak & Alamat</th>
                <th className="py-3.5 px-5 text-center">Asal Platform</th>
                <th className="py-3.5 px-5 text-center">Total Transaksi</th>
                <th className="py-3.5 px-5 text-right">Total Belanja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cae4c5]/30 text-[13px]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#76777d]">
                    <Users size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-[#254222]">Belum ada data pelanggan</p>
                    <p className="text-xs text-[#76777d] mt-1">Data pelanggan akan tersimpan otomatis dari kasir.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-[#cae4c5]/10 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#cae4c5] text-[#254222] flex items-center justify-center font-bold shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#254222]">{customer.name}</p>
                          <p className="text-[11px] text-[#76777d]">Bergabung {format(new Date(customer.createdAt), 'MMM yyyy', { locale: localeId })}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-[#45464d]">
                            <Phone size={12} className="text-[#76777d]" /> {customer.phone}
                          </div>
                        )}
                        {customer.address ? (
                          <div className="flex items-start gap-1.5 text-xs text-[#45464d] max-w-[200px] truncate">
                            <MapPin size={12} className="text-[#76777d] shrink-0 mt-0.5" /> 
                            <span className="truncate" title={customer.address}>{customer.address}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#76777d] italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${platformColors[customer.platform] || platformColors['Lainnya']}`}>
                        {customer.platform}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#eff4ff] text-[#3755c3] font-bold text-xs">
                        <ShoppingBag size={12} /> {customer.totalTransactions}x
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#254222]">
                      {formatCurrency(customer.totalSpent)}
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
