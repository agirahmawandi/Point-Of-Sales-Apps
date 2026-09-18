import React, { useState, useEffect } from 'react';
import { useWriteOffStore } from '@/stores/writeOffStore';
import PageContainer from '@/components/layout/PageContainer';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import WriteOffFormModal from '../components/WriteOffFormModal';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function WriteOffListPage() {
  const { writeOffs, isLoading, fetchWriteOffs } = useWriteOffStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWriteOffs();
  }, [fetchWriteOffs]);

  const filteredWriteOffs = writeOffs.filter((w) => {
    return w.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           w.reason.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <PageContainer 
      title="Produk Rusak (Write-off)" 
      description="Catat barang rusak, basi, atau hilang. Stok akan otomatis berkurang dan dicatat sebagai kerugian."
      actions={
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Catat Produk Rusak</span>
        </button>
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#eff4ff] flex flex-col sm:flex-row gap-4 bg-white">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={18} />
            <input
              type="text"
              placeholder="Cari nama produk atau keterangan..."
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
                <th className="py-3.5 px-5">Tanggal</th>
                <th className="py-3.5 px-5">Nama Produk</th>
                <th className="py-3.5 px-5 text-center">Qty Rusak</th>
                <th className="py-3.5 px-5">Keterangan</th>
                <th className="py-3.5 px-5 text-right">Nilai Kerugian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff] text-[13px]">
              {isLoading && writeOffs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#76777d]">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredWriteOffs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center text-[#76777d]">
                      <AlertTriangle size={32} className="mb-2 text-slate-300" />
                      <p>Tidak ada riwayat produk rusak.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWriteOffs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 text-[#45464d]">
                      {format(new Date(item.date), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#0b1c30]">
                      {item.productName}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#ffdad6] text-[#ba1a1a]">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#45464d] whitespace-normal min-w-[200px]">
                      {item.reason}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-[#ba1a1a]">
                      {formatCurrency(item.lossAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <WriteOffFormModal onClose={() => setIsModalOpen(false)} />
      )}
    </PageContainer>
  );
}
