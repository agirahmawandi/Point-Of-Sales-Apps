import React, { useState } from 'react';
import type { Transaction, TransactionItem, PaymentMethod } from '@/types';
import { useProductStore } from '@/stores/productStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { 
  X, 
  Save, 
  Store, 
  Globe, 
  Trash2, 
  Plus, 
  Minus, 
  Percent, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSaveSuccess: () => void;
}

const MARKETPLACE_OPTIONS = [
  'Shopee',
  'Tokopedia',
  'TikTok Shop',
  'Lazada',
  'Blibli',
  'Lainnya',
];

export default function EditTransactionModal({
  transaction,
  onClose,
  onSaveSuccess,
}: EditTransactionModalProps) {
  const { addStock, reduceStock } = useProductStore();
  const { bankAccounts, updateBankBalance } = useSettingsStore();

  // Basic transaction states
  const [transactionType, setTransactionType] = useState(transaction.transactionType || 'offline');
  const [items, setItems] = useState<TransactionItem[]>(() => 
    transaction.items.map(item => ({ ...item }))
  );

  // Online order details
  const [marketplace, setMarketplace] = useState(transaction.onlineDetails?.marketplace || 'Shopee');
  const [storeName, setStoreName] = useState(transaction.onlineDetails?.storeName || '');
  const [orderNumber, setOrderNumber] = useState(transaction.onlineDetails?.orderNumber || '');
  const [trackingNumber, setTrackingNumber] = useState(transaction.onlineDetails?.trackingNumber || '');
  const [customerName, setCustomerName] = useState(transaction.onlineDetails?.customerName || '');
  const [customerAddress, setCustomerAddress] = useState(transaction.onlineDetails?.customerAddress || '');

  // Marketplace fee & financial
  const [marketplaceFeeStr, setMarketplaceFeeStr] = useState(() => 
    transaction.marketplaceFee ? new Intl.NumberFormat('id-ID').format(transaction.marketplaceFee) : '0'
  );
  const [discountAmount, setDiscountAmount] = useState(transaction.discount || 0);
  const [taxAmount, setTaxAmount] = useState(transaction.tax || 0);

  // Payment states
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'tertunda'>(
    transaction.paymentStatus || (transaction.status === 'pending' ? 'tertunda' : 'lunas')
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction.paymentMethod || 'cash');
  const [bankAccountId, setBankAccountId] = useState(transaction.bankAccountId || bankAccounts[0]?.id || '');

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const marketplaceFee = parseInt(marketplaceFeeStr.replace(/\D/g, ''), 10) || 0;
  
  // Calculate % of marketplace fee relative to subtotal
  const marketplaceFeePercentage = subtotal > 0 && marketplaceFee > 0 
    ? ((marketplaceFee / subtotal) * 100).toFixed(1) 
    : '0.0';

  // Total
  const total = transactionType === 'online'
    ? Math.max(0, subtotal - discountAmount - marketplaceFee)
    : Math.max(0, subtotal - discountAmount + taxAmount);

  // Handle item price & qty changes
  const handleItemPriceChange = (id: string, newPriceStr: string) => {
    const val = parseInt(newPriceStr.replace(/\D/g, ''), 10) || 0;
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, price: val, subtotal: val * item.quantity };
      }
      return item;
    }));
  };

  const handleItemQtyChange = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: item.price * newQty };
      }
      return item;
    }));
  };

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setMarketplaceFeeStr('');
      return;
    }
    setMarketplaceFeeStr(formatNumber(parseInt(raw, 10)));
  };

  const handleSave = () => {
    if (transactionType === 'online' && !orderNumber.trim()) {
      alert('Nomor Pesanan Marketplace wajib diisi!');
      return;
    }

    // 1. Sync stock differences
    items.forEach(newItem => {
      const origItem = transaction.items.find(i => i.id === newItem.id || i.productId === newItem.productId);
      if (origItem) {
        const qtyDiff = newItem.quantity - origItem.quantity;
        if (qtyDiff > 0) {
          // Quantity increased: reduce additional stock
          reduceStock(newItem.productId, qtyDiff);
        } else if (qtyDiff < 0) {
          // Quantity decreased: restore stock
          addStock(newItem.productId, Math.abs(qtyDiff));
        }
      }
    });

    // 2. Adjust Bank Balances
    const isPending = paymentStatus === 'tertunda';
    const newAmountPaid = isPending ? 0 : total;

    const oldBankAmount = (transaction.paymentMethod === 'card' && transaction.bankAccountId) 
      ? (transaction.amountPaid || transaction.total) 
      : 0;
    
    const newBankAmount = (paymentMethod === 'card' && bankAccountId && !isPending) 
      ? newAmountPaid 
      : 0;

    // Deduct old amount from old bank
    if (transaction.paymentMethod === 'card' && transaction.bankAccountId) {
      updateBankBalance(transaction.bankAccountId, -oldBankAmount);
    }
    
    // Add new amount to new bank
    if (paymentMethod === 'card' && bankAccountId && !isPending) {
      updateBankBalance(bankAccountId, newBankAmount);
    }

    // 3. Recalculate HPP and Profit
    const newHpp = items.reduce((acc, item) => {
      const itemBuyPrice = item.buyPrice || 0;
      return acc + (itemBuyPrice * item.quantity);
    }, 0);
    const newProfit = total - newHpp;

    // 4. Prepare updated transaction object
    const updatedTransaction: Partial<Transaction> = {
      transactionType,
      items,
      subtotal,
      discount: discountAmount,
      tax: transactionType === 'offline' ? taxAmount : 0,
      marketplaceFee: transactionType === 'online' ? marketplaceFee : 0,
      total,
      hpp: newHpp,
      profit: newProfit,
      paymentMethod,
      bankAccountId: paymentMethod === 'card' ? bankAccountId : undefined,
      paymentStatus,
      paymentTiming: isPending ? 'tertunda' : 'sekarang',
      status: isPending ? 'pending' : 'success',
      amountPaid: newAmountPaid,
      onlineDetails: transactionType === 'online' ? {
        marketplace,
        storeName,
        orderNumber,
        trackingNumber,
        customerName,
        customerAddress,
      } : undefined,
    };

    // 5. Save to transaction store
    useTransactionStore.getState().updateTransaction(transaction.id, updatedTransaction);

    onSaveSuccess();
  };

  return (
    <div className="fixed inset-0 bg-[#254222]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#cae4c5]">
        {/* Header */}
        <div className="p-4 border-b border-[#cae4c5]/40 flex justify-between items-center bg-[#cae4c5]/25">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#254222]">Edit Transaksi</h2>
              <span className="font-mono text-xs font-bold text-[#254222] bg-[#cae4c5]/50 px-2 py-0.5 rounded border border-[#cae4c5]">
                {transaction.id}
              </span>
            </div>
            <p className="text-xs text-[#76777d] mt-0.5">
              Kasir: <strong className="text-[#254222]">{transaction.cashierName}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#76777d] hover:text-[#254222] rounded-full hover:bg-[#cae4c5]/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tipe Transaksi Switch */}
          <div>
            <label className="text-xs font-bold text-[#254222] uppercase tracking-wider block mb-2">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-2 p-1 bg-[#cae4c5]/30 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setTransactionType('offline')}
                className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  transactionType === 'offline'
                    ? 'bg-[#254222] text-[#ece2b1] shadow-sm'
                    : 'text-[#254222]/70 hover:text-[#254222]'
                }`}
              >
                <Store size={14} />
                <span>Offline Toko</span>
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('online')}
                className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  transactionType === 'online'
                    ? 'bg-[#254222] text-[#ece2b1] shadow-sm'
                    : 'text-[#254222]/70 hover:text-[#254222]'
                }`}
              >
                <Globe size={14} />
                <span>Online Marketplace</span>
              </button>
            </div>
          </div>

          {/* Form Detail Marketplace (Khusus Online) */}
          {transactionType === 'online' && (
            <div className="p-4 bg-[#cae4c5]/20 rounded-xl border border-[#cae4c5] space-y-3.5">
              <h3 className="text-xs font-bold text-[#254222] uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={14} className="text-[#254222]" />
                <span>Informasi Marketplace & Pengiriman</span>
              </h3>

              {/* Marketplace Selector Chips */}
              <div>
                <label className="text-[11px] font-semibold text-[#76777d] block mb-1.5">Nama Marketplace</label>
                <div className="flex flex-wrap gap-1.5">
                  {MARKETPLACE_OPTIONS.map((mp) => (
                    <button
                      key={mp}
                      type="button"
                      onClick={() => setMarketplace(mp)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        marketplace === mp
                          ? 'bg-[#254222] text-[#ece2b1] border-[#254222] shadow-sm'
                          : 'bg-white text-[#254222] border-[#cae4c5] hover:bg-[#cae4c5]/30'
                      }`}
                    >
                      {mp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 2 Cols: Toko & No Pesanan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#76777d] block mb-1">Nama Toko di Marketplace</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Contoh: Frema Mart Official"
                    className="w-full h-9 px-3 text-xs bg-white border border-[#cae4c5] rounded-lg focus:outline-none focus:border-[#99cc66]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#76777d] block mb-1">
                    Nomor Pesanan (Order ID) <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Contoh: 240906-897ABC"
                    className="w-full h-9 px-3 text-xs font-mono bg-white border border-[#cae4c5] rounded-lg focus:outline-none focus:border-[#99cc66]"
                  />
                </div>
              </div>

              {/* Grid 2 Cols: No Resi & Nama Pembeli */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#76777d] block mb-1">No. Resi Pengiriman (AWB)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Contoh: JNT123456789"
                    className="w-full h-9 px-3 text-xs font-mono bg-white border border-[#cae4c5] rounded-lg focus:outline-none focus:border-[#99cc66]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#76777d] block mb-1">Nama Pembeli</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full h-9 px-3 text-xs bg-white border border-[#cae4c5] rounded-lg focus:outline-none focus:border-[#99cc66]"
                  />
                </div>
              </div>

              {/* Alamat Pengiriman */}
              <div>
                <label className="text-[11px] font-semibold text-[#76777d] block mb-1">Alamat Pengiriman</label>
                <textarea
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Alamat lengkap penerima..."
                  className="w-full p-2 text-xs bg-white border border-[#cae4c5] rounded-lg focus:outline-none focus:border-[#99cc66] resize-none"
                />
              </div>
            </div>
          )}

          {/* Edit Item Pesanan */}
          <div>
            <h3 className="text-xs font-bold text-[#254222] uppercase tracking-wider mb-2.5">
              Item Produk ({items.length})
            </h3>
            <div className="space-y-2 border border-[#cae4c5]/60 rounded-xl p-3 bg-slate-50/50">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-100 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#254222] truncate">{item.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-[#76777d]">Harga: Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatNumber(item.price)}
                        onChange={(e) => handleItemPriceChange(item.id!, e.target.value)}
                        className="w-24 px-1.5 py-0.5 text-xs font-semibold text-[#254222] bg-[#cae4c5]/25 border border-[#cae4c5] rounded focus:bg-white focus:border-[#99cc66] outline-none"
                      />
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#cae4c5]/30 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(item.id!, -1)}
                        className="p-1 hover:bg-white rounded text-[#254222] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#254222]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(item.id!, 1)}
                        className="p-1 hover:bg-white rounded text-[#254222] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Subtotal Item */}
                    <div className="w-24 text-right font-bold text-xs text-[#254222]">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kalkulasi Potongan Marketplace & Finansial */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between text-[#76777d]">
              <span>Subtotal Item</span>
              <span className="font-bold text-[#254222]">{formatCurrency(subtotal)}</span>
            </div>

            {transactionType === 'online' && (
              <div className="flex justify-between items-center py-1 border-t border-slate-200/60 pt-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#ba1a1a]">Potongan Marketplace</span>
                  {subtotal > 0 && marketplaceFee > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-black bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]">
                      <Percent size={10} />
                      <span>{marketplaceFeePercentage}%</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#ba1a1a]">- Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={marketplaceFeeStr}
                    onChange={handleFeeChange}
                    className="w-28 px-2 py-1 text-right text-xs font-bold text-[#ba1a1a] bg-white border border-[#cae4c5] rounded-lg focus:border-[#99cc66] outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold">
              <span className="text-sm text-[#254222]">
                {transactionType === 'online' ? 'Total Bersih Pesanan' : 'Total Akhir'}
              </span>
              <span className="text-lg text-[#254222] font-black">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Status Pembayaran & Metode Bayar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#254222] uppercase tracking-wider block mb-1.5">
                Status Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('lunas')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    paymentStatus === 'lunas'
                      ? 'bg-[#cae4c5] text-[#254222] border-[#cae4c5] shadow-xs'
                      : 'bg-white text-[#76777d] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>Lunas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('tertunda')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    paymentStatus === 'tertunda'
                      ? 'bg-[#ece2b1] text-[#254222] border-[#ece2b1] shadow-xs'
                      : 'bg-white text-[#76777d] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Clock size={14} />
                  <span>Tertunda</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#254222] uppercase tracking-wider block mb-1.5">
                Metode Pembayaran
              </label>
              <div className="space-y-3">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-10 px-3 text-xs bg-white border border-[#cae4c5] rounded-xl focus:outline-none focus:border-[#99cc66] font-semibold text-[#254222]"
                >
                  <option value="cash">Tunai</option>
                  <option value="qris">QRIS</option>
                  <option value="card">Transfer Bank / EDC</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="piutang">Piutang</option>
                </select>

                {paymentMethod === 'card' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-[11px] font-semibold text-[#76777d] block mb-1">Rekening Penerima</label>
                    <select
                      value={bankAccountId}
                      onChange={(e) => setBankAccountId(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-white border border-[#cae4c5] rounded-lg focus:outline-none focus:border-[#99cc66] font-semibold text-[#254222]"
                    >
                      {bankAccounts.map(b => (
                        <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber} (Rp {(b.balance || 0).toLocaleString('id-ID')})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#cae4c5]/40 bg-white flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-[#76777d] font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#254222] hover:bg-[#1b3119] text-[#ece2b1] font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Save size={15} />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
