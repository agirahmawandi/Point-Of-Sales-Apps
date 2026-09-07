import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransactionStore } from '@/stores/transactionStore';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CheckCircle, Printer, ArrowLeft, ShoppingCart, Clock } from 'lucide-react';

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTransaction } = useTransactionStore();

  const trx = id ? getTransaction(id) : undefined;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const methodLabel: Record<string, string> = {
    cash: 'Tunai',
    tunai: 'Tunai',
    qris: 'QRIS',
    card: 'Kartu',
    kartu: 'Kartu',
    piutang: 'Piutang',
    marketplace: 'Marketplace',
  };

  const handlePrint = () => {
    window.print();
  };

  if (!trx) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm w-full">
          <p className="text-[#ba1a1a] font-bold text-lg mb-2">Struk Tidak Ditemukan</p>
          <p className="text-[#76777d] text-xs mb-6">Transaksi ID {id} tidak terdaftar di sistem.</p>
          <button
            onClick={() => navigate('/pos')}
            className="w-full py-2.5 bg-[#254222] text-[#ece2b1] font-bold rounded-xl text-xs hover:bg-[#1b3119] transition-colors"
          >
            Kembali ke Kasir
          </button>
        </div>
      </div>
    );
  }

  const isPending = trx.paymentTiming === 'tertunda' || trx.paymentStatus === 'tertunda' || trx.status === 'pending';

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center justify-start print:bg-white print:p-0">
      {/* Top Action Toolbar */}
      <div className="w-full max-w-md mb-6 flex gap-3 print:hidden">
        <button
          onClick={() => navigate('/pos')}
          className="h-10 px-4 rounded-xl bg-white text-[#254222] border border-[#cae4c5] shadow-sm hover:bg-[#cae4c5]/30 text-[13px] font-bold flex items-center gap-2 transition-all"
        >
          <ShoppingCart size={17} /> Transaksi Baru
        </button>
        <button
          onClick={() => navigate('/sales')}
          className="h-10 px-4 rounded-xl bg-white text-[#254222] border border-[#cae4c5] shadow-sm hover:bg-[#cae4c5]/30 text-[13px] font-bold flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={17} /> List Penjualan
        </button>
        <button
          onClick={handlePrint}
          className="ml-auto h-10 px-5 rounded-xl bg-[#254222] hover:bg-[#1b3119] text-[#ece2b1] text-[13px] font-bold shadow-sm flex items-center gap-2 transition-all"
        >
          <Printer size={17} /> Cetak
        </button>
      </div>

      {/* Receipt Card */}
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl border border-[#cae4c5]/60 overflow-hidden print:shadow-none print:rounded-none print:border-none">
        {/* Status Header */}
        <div className="bg-[#254222] text-white py-8 px-6 flex flex-col items-center text-center print:hidden transition-colors border-b border-[#cae4c5]/20">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
            isPending ? 'bg-[#ece2b1] text-[#254222]' : 'bg-[#99cc66] text-[#254222]'
          }`}>
            {isPending ? <Clock size={32} /> : <CheckCircle size={32} />}
          </div>
          <h1 className="text-xl font-bold font-heading text-[#ece2b1]">
            {isPending ? 'Pesanan Dicatat (Tertunda)' : 'Pembayaran Berhasil!'}
          </h1>
          <p className="mt-1 text-xs text-[#cae4c5]">
            {isPending 
              ? 'Menunggu pelunasan / pencairan dana dari marketplace' 
              : 'Terima kasih atas kunjungan dan pembelian Anda'}
          </p>
        </div>

        {/* Store Info */}
        <div className="px-6 pt-6 pb-4 border-b border-dashed border-slate-200 text-center">
          <h2 className="text-xl font-black text-[#254222] tracking-tight">🏪 Frema Mart</h2>
          <p className="text-[#76777d] text-xs mt-1">Supermarket & Retail Groceries</p>
          <p className="text-[#76777d] text-xs">Customer Service: (021) 7890-1234</p>
        </div>

        {/* Transaction Info */}
        <div className="px-6 py-4 border-b border-dashed border-slate-200 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-[#76777d]">No. Struk</span>
            <span className="font-mono font-bold text-[#254222]">{trx.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#76777d]">Tipe Pesanan</span>
            <span className="font-bold text-xs uppercase">
              {trx.transactionType === 'online' ? (
                <span className="px-2 py-0.5 rounded-md bg-[#cae4c5] text-[#254222]">
                  🌐 Online ({trx.onlineDetails?.marketplace || 'Marketplace'})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-[#cae4c5]/40 text-[#254222]">
                  🏪 Offline (Toko)
                </span>
              )}
            </span>
          </div>
          {trx.transactionType === 'online' && trx.onlineDetails && (
            <>
              <div className="flex justify-between">
                <span className="text-[#76777d]">Toko Online</span>
                <span className="font-semibold text-[#254222]">{trx.onlineDetails.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#76777d]">No. Pesanan</span>
                <span className="font-mono font-bold text-[#254222]">{trx.onlineDetails.orderNumber}</span>
              </div>
              {trx.onlineDetails.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-[#76777d]">No. Resi</span>
                  <span className="font-mono font-bold text-[#254222]">{trx.onlineDetails.trackingNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#76777d]">Nama Pembeli</span>
                <span className="font-semibold text-[#254222]">{trx.onlineDetails.customerName}</span>
              </div>
              {trx.onlineDetails.customerAddress && (
                <div className="text-xs pt-1 border-t border-dashed border-slate-100">
                  <span className="text-[#76777d] block mb-0.5">Alamat Pengiriman:</span>
                  <span className="text-[#45464d]">{trx.onlineDetails.customerAddress}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between">
            <span className="text-[#76777d]">Waktu</span>
            <span className="font-medium text-[#254222]">
              {format(new Date(trx.date || trx.createdAt || Date.now()), 'dd MMM yyyy, HH:mm', { locale: localeId })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#76777d]">Kasir</span>
            <span className="font-medium text-[#254222]">{trx.cashierName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#76777d]">Metode Bayar</span>
            <span className="font-semibold text-[#254222] uppercase">
              {methodLabel[trx.paymentMethod] || trx.paymentMethod}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 py-4 border-b border-dashed border-slate-200">
          <h3 className="text-[11px] font-bold uppercase text-[#76777d] tracking-wider mb-3">Item Pembelian</h3>
          <div className="space-y-3">
            {trx.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-semibold text-[#254222]">{item.name}</p>
                  <p className="text-[#76777d] text-xs">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="font-bold text-[#254222]">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-b border-dashed border-slate-200 space-y-2 text-sm">
          <div className="flex justify-between text-[#76777d]">
            <span>Subtotal</span>
            <span>{formatCurrency(trx.subtotal)}</span>
          </div>
          {(trx.discount || 0) > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Diskon</span>
              <span>-{formatCurrency(trx.discount || 0)}</span>
            </div>
          )}
          {trx.transactionType === 'online' && (trx.marketplaceFee || 0) > 0 && (
            <div className="flex justify-between text-[#ba1a1a] font-medium">
              <span>Potongan Marketplace</span>
              <span>-{formatCurrency(trx.marketplaceFee || 0)}</span>
            </div>
          )}
          {trx.transactionType !== 'online' && (trx.tax || 0) > 0 && (
            <div className="flex justify-between text-[#76777d]">
              <span>PPN (11%)</span>
              <span>{formatCurrency(trx.tax || 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-[#254222] pt-2 border-t border-slate-100">
            <span>{trx.transactionType === 'online' ? 'Total Bersih' : 'Total Akhir'}</span>
            <span className="text-[#254222] font-black">{formatCurrency(trx.total)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-6 py-4 border-b border-dashed border-slate-200 space-y-1.5 text-sm bg-slate-50/50">
          <div className="flex justify-between items-center text-[#76777d]">
            <span>Status Pembayaran</span>
            <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase ${
              isPending ? 'bg-[#ece2b1] text-[#254222] border border-[#ece2b1]' : 'bg-[#cae4c5] text-[#254222] border border-[#cae4c5]'
            }`}>
              {isPending ? '⏳ Tertunda' : '✓ Lunas'}
            </span>
          </div>
          {!isPending && (
            <>
              <div className="flex justify-between text-[#76777d]">
                <span>Nominal Diterima</span>
                <span className="font-semibold text-[#254222]">{formatCurrency(trx.amountPaid ?? trx.paid ?? trx.total)}</span>
              </div>
              <div className="flex justify-between text-[#76777d]">
                <span>Kembalian</span>
                <span className="font-semibold text-[#254222]">{formatCurrency(trx.change || 0)}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-6 text-center text-xs text-[#76777d] space-y-1">
          <p className="font-semibold text-[#254222]">Barang yang dibeli tidak dapat ditukar/dikembalikan</p>
          <p>Kecuali dengan perjanjian tertulis & struk resmi</p>
          <p className="pt-2 text-[10px] text-slate-400 font-mono">Powered by Frema Mart POS</p>
        </div>
      </div>
    </div>
  );
}
