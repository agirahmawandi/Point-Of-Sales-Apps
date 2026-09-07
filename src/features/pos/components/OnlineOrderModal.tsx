import React, { useState } from 'react';
import { X, Globe, Store, ShoppingBag, Truck, User, MapPin } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import type { OnlineOrderDetails } from '@/types';

interface OnlineOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MARKETPLACE_OPTIONS = [
  'Shopee',
  'Tokopedia',
  'TikTok Shop',
  'Lazada',
  'Blibli',
  'WhatsApp / Manual',
  'Lainnya'
];

export default function OnlineOrderModal({ isOpen, onClose }: OnlineOrderModalProps) {
  const { onlineDetails, setOnlineDetails, setTransactionType } = useCartStore();

  const [marketplace, setMarketplace] = useState(onlineDetails?.marketplace || 'Shopee');
  const [customMarketplace, setCustomMarketplace] = useState('');
  const [storeName, setStoreName] = useState(onlineDetails?.storeName || 'Frema Mart Official');
  const [orderNumber, setOrderNumber] = useState(onlineDetails?.orderNumber || '');
  const [trackingNumber, setTrackingNumber] = useState(onlineDetails?.trackingNumber || '');
  const [customerName, setCustomerName] = useState(onlineDetails?.customerName || '');
  const [customerAddress, setCustomerAddress] = useState(onlineDetails?.customerAddress || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const finalMarketplace = marketplace === 'Lainnya' ? customMarketplace.trim() || 'Lainnya' : marketplace;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!orderNumber.trim()) {
      newErrors.orderNumber = 'Nomor pesanan wajib diisi';
    }
    if (!customerName.trim()) {
      newErrors.customerName = 'Nama pembeli wajib diisi';
    }
    if (marketplace === 'Lainnya' && !customMarketplace.trim()) {
      newErrors.marketplace = 'Nama marketplace wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data: OnlineOrderDetails = {
      marketplace: finalMarketplace,
      storeName: storeName.trim() || 'Frema Mart Official',
      orderNumber: orderNumber.trim(),
      trackingNumber: trackingNumber.trim() || undefined,
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim() || undefined,
    };

    setOnlineDetails(data);
    setTransactionType('online');
    onClose();
  };

  const handleCancel = () => {
    // Jika belum ada onlineDetails sebelumnya, batalkan dan tetap offline
    if (!onlineDetails) {
      setTransactionType('offline');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#254222]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-[#cae4c5]">
        {/* Header */}
        <div className="p-4 border-b border-[#cae4c5]/40 flex justify-between items-center bg-[#cae4c5]/25">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#254222] text-[#ece2b1] flex items-center justify-center shadow-sm">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#254222]">Data Pesanan Online (Marketplace)</h2>
              <p className="text-[11px] text-[#76777d]">Input rincian pesanan e-commerce sebelum memasukkan barang</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleCancel} 
            className="p-1.5 text-[#76777d] hover:text-[#254222] rounded-full hover:bg-[#cae4c5]/40 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Marketplace Selection */}
          <div>
            <label className="block text-xs font-bold text-[#254222] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-[#254222]" />
              <span>Platform / Marketplace *</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {MARKETPLACE_OPTIONS.map((mp) => (
                <button
                  type="button"
                  key={mp}
                  onClick={() => setMarketplace(mp)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    marketplace === mp
                      ? 'border-[#254222] bg-[#cae4c5]/30 text-[#254222] shadow-sm font-bold'
                      : 'border-slate-200 bg-white text-[#76777d] hover:bg-slate-50'
                  }`}
                >
                  {mp}
                </button>
              ))}
            </div>
            {marketplace === 'Lainnya' && (
              <input
                type="text"
                placeholder="Masukkan nama marketplace / platform..."
                value={customMarketplace}
                onChange={(e) => setCustomMarketplace(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-[#254222] focus:outline-none focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all mt-1"
              />
            )}
            {errors.marketplace && <p className="text-[#ba1a1a] text-[11px] mt-1">{errors.marketplace}</p>}
          </div>

          {/* Store Name & Order Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#254222] mb-1.5 flex items-center gap-1">
                <Store size={13} className="text-[#76777d]" />
                <span>Nama Toko di Marketplace</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Frema Mart Official"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-[#254222] focus:outline-none focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#254222] mb-1.5 flex items-center gap-1">
                <span>Nomor Pesanan (Order ID) *</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 260906ABCD99"
                value={orderNumber}
                onChange={(e) => {
                  setOrderNumber(e.target.value);
                  if (errors.orderNumber) setErrors(prev => ({ ...prev, orderNumber: '' }));
                }}
                className={`w-full h-10 px-3.5 rounded-xl border text-xs text-[#254222] font-mono font-medium focus:outline-none focus:ring-2 transition-all ${
                  errors.orderNumber ? 'border-[#ba1a1a] focus:ring-red-100' : 'border-slate-200 focus:border-[#99cc66] focus:ring-[#99cc66]/20'
                }`}
              />
              {errors.orderNumber && <p className="text-[#ba1a1a] text-[11px] mt-1">{errors.orderNumber}</p>}
            </div>
          </div>

          {/* Tracking Number & Customer Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#254222] mb-1.5 flex items-center gap-1">
                <Truck size={13} className="text-[#76777d]" />
                <span>Nomor Resi Pengiriman</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: SPXID0192837482"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-[#254222] font-mono focus:outline-none focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#254222] mb-1.5 flex items-center gap-1">
                <User size={13} className="text-[#76777d]" />
                <span>Nama Pembeli / Penerima *</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) setErrors(prev => ({ ...prev, customerName: '' }));
                }}
                className={`w-full h-10 px-3.5 rounded-xl border text-xs text-[#254222] font-medium focus:outline-none focus:ring-2 transition-all ${
                  errors.customerName ? 'border-[#ba1a1a] focus:ring-red-100' : 'border-slate-200 focus:border-[#99cc66] focus:ring-[#99cc66]/20'
                }`}
              />
              {errors.customerName && <p className="text-[#ba1a1a] text-[11px] mt-1">{errors.customerName}</p>}
            </div>
          </div>

          {/* Customer Address */}
          <div>
            <label className="block text-xs font-semibold text-[#254222] mb-1.5 flex items-center gap-1">
              <MapPin size={13} className="text-[#76777d]" />
              <span>Alamat Pengiriman Pembeli</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Jl. Merdeka No. 45, Menteng, Jakarta Pusat, DKI Jakarta 10310"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-[#254222] placeholder-[#76777d] focus:outline-none focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 justify-end pt-3 border-t border-[#cae4c5]/40">
            <button
              type="button"
              onClick={handleCancel}
              className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-[#254222] hover:bg-[#cae4c5]/25 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#254222] hover:bg-[#1b3119] text-[#ece2b1] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Globe size={15} />
              <span>Simpan & Lanjut ke Input Barang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
