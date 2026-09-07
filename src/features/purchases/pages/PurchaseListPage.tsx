import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchaseStore } from '@/stores/purchaseStore';
import PageContainer from '@/components/layout/PageContainer';
import { Search, Plus, Eye, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { PurchaseOrderStatus } from '@/types/purchase';

export default function PurchaseListPage() {
  const navigate = useNavigate();
  const { purchaseOrders } = usePurchaseStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(search.toLowerCase()) || 
                          po.supplier?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'draft':
        return <span className="px-2.5 py-0.5 bg-[#eff4ff] text-[#76777d] rounded-lg text-[11px] font-bold uppercase tracking-wider border border-[#d3e4fe]">Draft</span>;
      case 'dikirim':
        return <span className="px-2.5 py-0.5 bg-[#d3e4fe] text-[#3755c3] rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><AlertCircle size={12}/> Dikirim</span>;
      case 'diterima_sebagian':
        return <span className="px-2.5 py-0.5 bg-[#fef3c7] text-[#92400e] rounded-lg text-[11px] font-bold uppercase tracking-wider w-max">Parsial</span>;
      case 'diterima':
        return <span className="px-2.5 py-0.5 bg-[#e6f4ea] text-[#137333] rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Selesai</span>;
      case 'batal':
        return <span className="px-2.5 py-0.5 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-[11px] font-bold uppercase tracking-wider w-max">Batal</span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'lunas') return <span className="px-2 py-0.5 rounded-md bg-[#e6f4ea] text-[#137333] font-bold text-[11px] uppercase">LUNAS</span>;
    if (status === 'sebagian') return <span className="px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] font-bold text-[11px] uppercase">SEBAGIAN</span>;
    return <span className="px-2 py-0.5 rounded-md bg-[#ffdad6] text-[#ba1a1a] font-bold text-[11px] uppercase">UTANG</span>;
  };

  return (
    <PageContainer 
      title="Daftar Purchase Order" 
      description="Kelola pengadaan stok barang dan pesanan pembelian ke pemasok."
      actions={
        <button 
          onClick={() => navigate('/purchases/new')}
          className="h-10 px-4 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Buat PO Baru</span>
        </button>
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#eff4ff] flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="flex w-full sm:w-auto gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={18} />
              <input 
                type="text" 
                placeholder="Cari No. PO atau nama pemasok..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#eff4ff] text-[13px] text-[#0b1c30] placeholder-[#76777d] border border-transparent focus:outline-none focus:bg-white focus:border-[#3755c3]/30 focus:ring-2 focus:ring-[#3755c3]/15 transition-all"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-slate-200/80 text-[13px] font-medium text-[#0b1c30] bg-white shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
            >
              <option value="all">Semua Status PO</option>
              <option value="draft">Draft</option>
              <option value="dikirim">Dikirim</option>
              <option value="diterima">Selesai</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                <th className="py-3.5 px-5">No. PO & Tanggal</th>
                <th className="py-3.5 px-5">Pemasok</th>
                <th className="py-3.5 px-5 text-center">Total Item</th>
                <th className="py-3.5 px-5 text-right">Total Nilai</th>
                <th className="py-3.5 px-5 text-center">Status PO</th>
                <th className="py-3.5 px-5 text-center">Hutang / Bayar</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff] text-[13px]">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#76777d]">
                    <ShoppingBag size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-[#0b1c30]">Tidak ada data Purchase Order</p>
                    <p className="text-xs text-[#76777d] mt-1">Buat pesanan pembelian baru untuk memasok stok toko.</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => (
                  <tr key={po.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-[#3755c3]">{po.poNumber}</div>
                      <div className="text-xs text-[#76777d] mt-0.5">
                        {format(new Date(po.createdAt), 'dd MMM yyyy', { locale: localeId })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#0b1c30]">{po.supplier?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center text-[#76777d]">
                      {po.items.reduce((acc, item) => acc + item.quantity, 0)} pcs
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#0b1c30]">
                      <span className="text-[11px] font-medium text-[#76777d] mr-1">Rp</span>
                      <span>{formatNumber(po.totalAmount)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex justify-center">{getStatusBadge(po.status)}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex justify-center">{getPaymentStatusBadge(po.paymentStatus)}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(po.status === 'dikirim' || po.status === 'diterima_sebagian') && (
                          <button 
                            onClick={() => navigate(`/purchases/${po.id}/receive`)}
                            className="h-8 px-3 rounded-lg bg-[#e6f4ea] hover:bg-[#cbf0d2] text-[#137333] text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 size={13} />
                            <span>Terima</span>
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/purchases/${po.id}`)}
                          className="p-1.5 text-[#76777d] hover:text-[#3755c3] hover:bg-[#eff4ff] rounded-lg transition-colors"
                          title="Lihat Detail PO"
                        >
                          <Eye size={17} />
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
