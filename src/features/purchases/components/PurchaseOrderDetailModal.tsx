import React from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { X, ShoppingBag, Store, Building2, Package, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { PurchaseOrder } from '@/types/purchase';

interface PurchaseOrderDetailModalProps {
  po: PurchaseOrder;
  onClose: () => void;
}

export default function PurchaseOrderDetailModal({ po, onClose }: PurchaseOrderDetailModalProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#cae4c5] text-[#76777d] rounded-full text-[11px] font-bold uppercase border border-[#cae4c5]">Draft</span>;
      case 'dikirim':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#cae4c5] text-[#254222] rounded-full text-[11px] font-bold uppercase border border-[#254222]/20"><AlertCircle size={12}/> Dikirim</span>;
      case 'diterima_sebagian':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fef3c7] text-[#92400e] rounded-full text-[11px] font-bold uppercase border border-[#fde68a]">Parsial</span>;
      case 'diterima':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e6f4ea] text-[#137333] rounded-full text-[11px] font-bold uppercase border border-[#bcebd3]"><CheckCircle2 size={12}/> Selesai</span>;
      case 'batal':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ffdad6] text-[#ba1a1a] rounded-full text-[11px] font-bold uppercase border border-[#ffb4ab]">Batal</span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'lunas') return <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333] font-bold text-[11px] uppercase border border-[#bcebd3]">LUNAS</span>;
    if (status === 'sebagian') return <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#92400e] font-bold text-[11px] uppercase border border-[#fde68a]">SEBAGIAN</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-bold text-[11px] uppercase border border-[#ffb4ab]">UTANG</span>;
  };

  return (
    <div className="fixed inset-0 bg-[#0b1c30]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#254222] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <ShoppingBag size={20} className="text-[#cae4c5]" />
            </div>
            <div>
              <h2 className="text-base font-bold">Detail Purchase Order</h2>
              <p className="text-[11px] text-white/70">
                {format(new Date(po.createdAt), 'EEEE, dd MMMM yyyy HH:mm', { locale: localeId })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/80"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50">
          
          {/* Top Status & Info */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Informasi PO</div>
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex justify-between">
                  <span className="text-[13px] text-slate-500">No. PO</span>
                  <span className="text-[13px] font-bold text-[#254222]">{po.poNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-slate-500">Status Pesanan</span>
                  {getStatusBadge(po.status)}
                </div>
                {po.notes && (
                  <div className="mt-1">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Catatan PO:</span>
                    <span className="text-[12px] text-[#0b1c30] italic">{po.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Informasi Pemasok</div>
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                  <Building2 size={14} className="text-slate-400" />
                  <span>{po.supplier?.name || 'Pemasok Umum'}</span>
                </div>
                {po.supplier?.contactPerson && (
                  <div className="text-[12px] text-slate-500 ml-5">
                    CP: {po.supplier.contactPerson} {po.supplier.phone && `(${po.supplier.phone})`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
             <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Status Pembayaran</div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div>
                  <p className="text-[11px] text-slate-500 mb-1">Status</p>
                  <div>{getPaymentStatusBadge(po.paymentStatus)}</div>
               </div>
               <div>
                  <p className="text-[11px] text-slate-500 mb-1">Sudah Dibayar</p>
                  <p className="text-[13px] font-bold text-[#137333]">Rp {formatNumber(po.paidAmount)}</p>
               </div>
               <div>
                  <p className="text-[11px] text-slate-500 mb-1">Sisa Utang</p>
                  <p className="text-[13px] font-bold text-[#ba1a1a]">Rp {formatNumber(Math.max(0, po.totalAmount - po.paidAmount))}</p>
               </div>
             </div>
             {po.dueDate && (
               <div className="mt-3 text-[12px] text-slate-500 flex items-center gap-1.5">
                 <Clock size={14} className="text-[#92400e]"/> Jatuh Tempo: <strong className="text-[#92400e]">{format(new Date(po.dueDate), 'dd MMM yyyy', { locale: localeId })}</strong>
               </div>
             )}
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Pembelian</div>
              <div className="text-[11px] font-semibold text-[#254222]">{po.items.reduce((acc, item) => acc + item.quantity, 0)} Total Qty</div>
            </div>
            <div className="divide-y divide-slate-100">
              {po.items.map((item, index) => (
                <div key={index} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-[#0b1c30]">{item.productName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pesan: {item.quantity} pcs | Diterima: {item.receivedQuantity} pcs
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Harga Satuan: Rp {formatNumber(item.buyPrice)}
                    </p>
                  </div>
                  <div className="text-[13px] font-bold text-[#254222]">
                    Rp {formatNumber(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary / Total */}
          <div className="bg-[#254222] p-5 rounded-xl shadow-sm text-white flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold uppercase tracking-wider text-[#cae4c5]">Total Tagihan</span>
              <span className="text-2xl font-black text-white">Rp {formatNumber(po.totalAmount)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
