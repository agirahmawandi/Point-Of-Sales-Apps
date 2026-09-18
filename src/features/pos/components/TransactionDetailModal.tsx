import React from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { X, ReceiptText, Store, Globe, MapPin, User, Package, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import type { Transaction } from '@/types';

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const isOnline = transaction.transactionType === 'online';
  const isPending = transaction.paymentTiming === 'tertunda' || transaction.paymentStatus === 'tertunda' || transaction.status === 'pending';

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-[#0b1c30]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#254222] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <ReceiptText size={20} className="text-[#ece2b1]" />
            </div>
            <div>
              <h2 className="text-base font-bold">Detail Transaksi</h2>
              <p className="text-[11px] text-white/70">
                {format(new Date(transaction.date || transaction.createdAt || Date.now()), 'EEEE, dd MMMM yyyy HH:mm', { locale: localeId })}
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
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Informasi Umum</div>
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex justify-between">
                  <span className="text-[13px] text-slate-500">No. Struk</span>
                  <span className="text-[13px] font-bold text-[#254222]">{transaction.invoiceNumber || transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-slate-500">Tipe Transaksi</span>
                  <span className="text-[13px] font-bold text-[#254222] flex items-center gap-1">
                    {isOnline ? (
                      <><Globe size={14} className="text-[#3755c3]" /> Online Marketplace</>
                    ) : (
                      <><Store size={14} className="text-[#254222]" /> Offline Toko</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-slate-500">Kasir</span>
                  <span className="text-[13px] font-medium text-[#254222]">{transaction.cashierName}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status & Pembayaran</div>
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-slate-500">Status Pembayaran</span>
                  {isPending ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ece2b1]/40 text-[#254222] text-[11px] font-bold border border-[#ece2b1]">
                      <Clock size={12} /> Tertunda
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#cae4c5]/40 text-[#254222] text-[11px] font-bold border border-[#cae4c5]">
                      <CheckCircle2 size={12} /> Lunas
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-slate-500">Metode Bayar</span>
                  <span className="text-[13px] font-bold text-[#254222] uppercase">{transaction.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Online Details if Applicable */}
          {isOnline && transaction.onlineDetails && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Package size={14} /> Detail Pengiriman (Online)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-500 mb-0.5">Marketplace</p>
                  <p className="text-[13px] font-bold text-[#0b1c30]">{transaction.onlineDetails.marketplace}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-0.5">Nomor Pesanan</p>
                  <p className="text-[13px] font-mono font-bold text-[#3755c3]">{transaction.onlineDetails.orderNumber}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-0.5 flex items-center gap-1"><User size={12}/> Nama Pembeli</p>
                  <p className="text-[13px] font-semibold text-[#0b1c30]">{transaction.onlineDetails.customerName || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-0.5 flex items-center gap-1"><MapPin size={12}/> Resi / AWB</p>
                  <p className="text-[13px] font-medium text-[#0b1c30]">{transaction.onlineDetails.trackingNumber || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Offline Customer if Applicable */}
          {!isOnline && transaction.customerName && transaction.customerName !== 'Pelanggan Umum' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <User size={14} /> Informasi Pelanggan
              </div>
              <p className="text-[13px] font-bold text-[#0b1c30]">{transaction.customerName}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Pembelian</div>
              <div className="text-[11px] font-semibold text-[#3755c3]">{transaction.items.reduce((acc, item) => acc + item.quantity, 0)} Total Qty</div>
            </div>
            <div className="divide-y divide-slate-100">
              {transaction.items.map((item, index) => (
                <div key={index} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-[#0b1c30]">{item.name || item.productName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.quantity} {item.unit || 'pcs'} × Rp {formatNumber(item.price)}
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
            <div className="flex justify-between text-[13px] text-white/70">
              <span>Subtotal Item</span>
              <span>Rp {formatNumber(transaction.subtotal)}</span>
            </div>
            
            {(transaction.discount || 0) > 0 && (
              <div className="flex justify-between text-[13px] text-white/70">
                <span>Diskon</span>
                <span>-Rp {formatNumber(transaction.discount || 0)}</span>
              </div>
            )}
            
            {(transaction.marketplaceFee || 0) > 0 ? (
              <div className="flex justify-between text-[13px] text-[#ffb4ab]">
                <span>Potongan Marketplace</span>
                <span>-Rp {formatNumber(transaction.marketplaceFee || 0)}</span>
              </div>
            ) : (transaction.tax || 0) > 0 ? (
              <div className="flex justify-between text-[13px] text-white/70">
                <span>Pajak PPN</span>
                <span>Rp {formatNumber(transaction.tax || 0)}</span>
              </div>
            ) : null}

            <div className="my-2 border-t border-white/20 border-dashed"></div>
            
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold uppercase tracking-wider text-[#ece2b1]">Total Bersih</span>
              <span className="text-2xl font-black text-white">Rp {formatNumber(transaction.total)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
