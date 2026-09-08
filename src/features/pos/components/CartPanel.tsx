import React, { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { Trash2, Plus, Minus, ShoppingCart, Globe, Edit2, User } from 'lucide-react';
import PaymentModal from './PaymentModal';
import OfflineCustomerModal from './OfflineCustomerModal';

interface CartPanelProps {
  onOpenOnlineModal?: () => void;
}

export default function CartPanel({ onOpenOnlineModal }: CartPanelProps) {
  const { 
    items, 
    total, 
    subtotal, 
    taxAmount, 
    taxPercentage, 
    marketplaceFee,
    transactionType, 
    onlineDetails, 
    updateQuantity, 
    updateItemPrice,
    removeItem, 
    clearCart, 
    setTax,
    setMarketplaceFee,
    customerId,
    customerName,
    setCustomer
  } = useCartStore();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleCheckout = () => {
    if (transactionType === 'online' && !onlineDetails) {
      alert('Silakan lengkapi data pesanan online terlebih dahulu!');
      onOpenOnlineModal?.();
      return;
    }
    
    if (transactionType === 'offline' && !customerId && customerName !== 'Pelanggan Umum') {
      setIsCustomerModalOpen(true);
      return;
    }

    setIsPaymentModalOpen(true);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Cart Header */}
        <div className="p-4 border-b border-[#cae4c5]/40 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-[#254222]" size={20} />
            <h2 className="font-bold text-[#254222] text-base font-heading">
              {transactionType === 'online' ? 'Keranjang (Pesanan Online)' : 'Keranjang Belanja'}
            </h2>
            <span className="bg-[#cae4c5] text-[#254222] text-xs font-bold px-2 py-0.5 rounded-lg ml-1">
              {items.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {transactionType === 'offline' && (
              <button 
                onClick={() => setIsCustomerModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#cae4c5]/30 text-[#254222] hover:bg-[#cae4c5]/50 transition-colors text-xs font-bold border border-[#cae4c5]"
              >
                <User size={14} />
                <span className="max-w-[100px] truncate">{customerName || 'Pilih Pelanggan'}</span>
              </button>
            )}
            <button 
              onClick={clearCart}
              disabled={items.length === 0}
              className="text-xs text-[#ba1a1a] hover:bg-[#ffdad6] px-2 py-1 rounded-lg font-semibold disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              Kosongkan
            </button>
          </div>
        </div>

        {/* Online Order Information Banner (If Online Mode) */}
        {transactionType === 'online' && (
          <div className="bg-[#cae4c5]/30 border-b border-[#cae4c5]/60 p-3 flex items-start justify-between">
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 bg-[#254222] text-[#ece2b1] rounded-md font-bold text-[10px] uppercase">
                  {onlineDetails?.marketplace || 'Marketplace'}
                </span>
                <span className="font-bold text-[#254222]">{onlineDetails?.storeName || 'Toko'}</span>
              </div>
              {onlineDetails ? (
                <>
                  <p className="text-[#254222] font-mono text-[11px]">
                    No. Pesanan: <strong className="text-[#254222] font-bold">{onlineDetails.orderNumber}</strong>
                    {onlineDetails.trackingNumber && ` | Resi: ${onlineDetails.trackingNumber}`}
                  </p>
                  <p className="text-[#76777d] text-[11px]">
                    Pembeli: <strong className="text-[#254222]">{onlineDetails.customerName}</strong>
                  </p>
                </>
              ) : (
                <p className="text-[#ba1a1a] text-[11px] font-semibold">
                  ⚠️ Data pesanan belum diisi. Klik tombol di samping untuk mengisi.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onOpenOnlineModal}
              className="text-[11px] text-[#254222] hover:text-[#1b3119] font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#cae4c5] shadow-sm hover:bg-[#cae4c5]/40 transition-all"
            >
              <Edit2 size={12} />
              <span>{onlineDetails ? 'Ubah Data' : 'Isi Data'}</span>
            </button>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#76777d]">
              <ShoppingCart size={44} className="mb-3 opacity-20" />
              <p className="font-semibold text-sm text-[#254222]">Keranjang masih kosong</p>
              <p className="text-xs text-[#76777d] mt-1">Pilih produk dari katalog di sebelah kiri</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#254222] text-xs truncate">{item.name}</h4>
                    {transactionType === 'online' ? (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-[#76777d]">Rp</span>
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={new Intl.NumberFormat('id-ID').format(item.price)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                            updateItemPrice(item.id!, val);
                          }}
                          onFocus={(e) => e.target.select()}
                          title="Klik untuk edit harga satuan online"
                          className="w-24 px-1.5 py-0.5 text-[11px] font-bold text-[#254222] bg-[#cae4c5]/25 border border-[#cae4c5] rounded focus:bg-white focus:border-[#99cc66] outline-none"
                        />
                        <span className="text-[9px] text-[#254222] font-bold bg-[#cae4c5]/50 px-1.5 py-0.5 rounded border border-[#cae4c5]">
                          Edit Harga
                        </span>
                      </div>
                    ) : (
                      <p className="text-[#76777d] text-[11px] mt-0.5">{formatCurrency(item.price)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#cae4c5]/30 rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded text-[#254222] transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) updateQuantity(item.id!, val);
                        }}
                        className="w-9 text-center text-xs font-bold bg-white text-[#254222] border border-slate-200 rounded mx-0.5 hide-spin-button focus:outline-none focus:border-[#99cc66]"
                        style={{ MozAppearance: 'textfield' }}
                      />
                      <button 
                        onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded text-[#254222] transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="w-20 text-right font-bold text-[#254222] text-xs">
                      {formatCurrency(item.subtotal)}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id!)}
                      className="p-1 text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total & Checkout Section */}
        <div className="p-4 bg-white border-t border-[#cae4c5]/40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <div className="space-y-2 mb-4 text-xs">
            <div className="flex justify-between text-[#76777d]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#254222]">{formatCurrency(subtotal)}</span>
            </div>
            
            {transactionType === 'online' ? (
              <div className="flex justify-between text-[#76777d] items-center py-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#254222]">Potongan Marketplace</span>
                  <span className="text-[10px] text-[#76777d]">(Manual)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#ba1a1a]">- Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={marketplaceFee ? new Intl.NumberFormat('id-ID').format(marketplaceFee) : ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                      setMarketplaceFee(val);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-28 px-2 py-1 text-right text-xs font-bold text-[#ba1a1a] bg-[#cae4c5]/20 border border-[#cae4c5] rounded-lg focus:bg-white focus:border-[#99cc66] outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-between text-[#76777d] items-center">
                <div className="flex items-center gap-2">
                  <span>Pajak Transaksi</span>
                  <select 
                    className="bg-[#cae4c5]/30 border border-[#cae4c5]/50 text-xs rounded-lg px-2 py-0.5 text-[#254222] font-semibold focus:outline-none focus:border-[#99cc66] cursor-pointer"
                    value={taxPercentage}
                    onChange={(e) => setTax(Number(e.target.value))}
                  >
                    <option value="0">0%</option>
                    <option value="11">11% (PPN)</option>
                  </select>
                </div>
                <span className="font-semibold text-[#254222]">{formatCurrency(taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2.5 border-t border-[#cae4c5]/40">
              <span className="font-bold text-[#254222] text-sm">
                {transactionType === 'online' ? 'Total Bersih Pesanan' : 'Total Tagihan'}
              </span>
              <span className="font-bold text-[#254222] text-lg">{formatCurrency(total)}</span>
            </div>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full bg-[#254222] hover:bg-[#1b3119] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-[#ece2b1] font-bold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:shadow-[#254222]/20 active:scale-[0.99]"
          >
            {transactionType === 'online' 
              ? `Lanjut Pembayaran Pesanan Online (${items.length} Item)` 
              : `Bayar Sekarang (${items.length} Item)`}
          </button>
        </div>
      </div>

      {isPaymentModalOpen && (
        <PaymentModal onClose={() => setIsPaymentModalOpen(false)} />
      )}

      <OfflineCustomerModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
        onSuccess={() => setIsPaymentModalOpen(true)}
      />
    </>
  );
}
