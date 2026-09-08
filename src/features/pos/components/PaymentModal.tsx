import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useProductStore } from '@/stores/productStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCustomerStore } from '@/stores/customerStore';
import { X, Banknote, CreditCard, QrCode, Zap, Clock, AlertCircle } from 'lucide-react';
import type { PaymentMethod } from '@/types';

interface PaymentModalProps {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    items, 
    subtotal, 
    discountAmount, 
    taxAmount, 
    marketplaceFee,
    total, 
    clearCart, 
    transactionType, 
    onlineDetails,
    customerId,
    customerName
  } = useCartStore();
  const { addTransaction } = useTransactionStore();
  const { reduceStock } = useProductStore();
  const { bankAccounts, updateBankBalance } = useSettingsStore();
  const { addCustomer, recordTransaction, findCustomerByPhoneOrName } = useCustomerStore();

  const [paymentTiming, setPaymentTiming] = useState<'sekarang' | 'tertunda'>('sekarang');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const [amountPaidStr, setAmountPaidStr] = useState(() => formatNumber(total));

  useEffect(() => {
    setAmountPaidStr(formatNumber(total));
  }, [method, total]);

  const amountPaid = parseInt(amountPaidStr.replace(/\D/g, ''), 10) || 0;
  const change = amountPaid >= total ? amountPaid - total : 0;
  const deficit = total > amountPaid ? total - amountPaid : 0;
  
  // If payment is tertunda, no upfront cash payment is required
  const isValid = paymentTiming === 'tertunda' || method !== 'cash' || amountPaid >= total;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setAmountPaidStr('');
      return;
    }
    const num = parseInt(rawDigits, 10);
    setAmountPaidStr(formatNumber(num));
  };

  const handleQuickAmount = (amount: number) => {
    setAmountPaidStr(formatNumber(amount));
  };

  const handleClearAmount = () => {
    setAmountPaidStr('');
  };

  const handleProcessPayment = async () => {
    if (!isValid || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate API/Printer delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const isPending = paymentTiming === 'tertunda';

      // Calculate HPP and Profit
      const hpp = items.reduce((acc, item) => {
        const itemBuyPrice = item.buyPrice || 0;
        return acc + (itemBuyPrice * item.quantity);
      }, 0);
      const profit = total - hpp;

      // Handle Customer Tracking
      let finalCustomerId = customerId;
      let finalCustomerName = customerName;

      if (transactionType === 'online' && onlineDetails) {
        const existingCustomer = findCustomerByPhoneOrName(onlineDetails.customerName);
        if (existingCustomer) {
          finalCustomerId = existingCustomer.id;
          finalCustomerName = existingCustomer.name;
          await recordTransaction(existingCustomer.id, total);
        } else {
          const newCust = await addCustomer({
            name: onlineDetails.customerName,
            address: onlineDetails.customerAddress,
            platform: (onlineDetails.marketplace as any) || 'Lainnya'
          });
          finalCustomerId = newCust.id;
          finalCustomerName = newCust.name;
          await recordTransaction(newCust.id, total);
        }
      } else if (transactionType === 'offline' && finalCustomerId) {
        await recordTransaction(finalCustomerId, total);
      }

      // 1. Create Transaction
      const trxId = addTransaction({
        items,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        marketplaceFee: transactionType === 'online' ? marketplaceFee : 0,
        total,
        hpp,
        profit,
        paymentMethod: isPending ? (transactionType === 'online' ? 'marketplace' : 'piutang') : method,
        bankAccountId: (method === 'card' && !isPending) ? selectedBankId : undefined,
        amountPaid: isPending ? 0 : (method === 'cash' ? amountPaid : total),
        change: isPending ? 0 : (method === 'cash' ? change : 0),
        cashierId: user?.id || 'unknown',
        cashierName: user?.name || 'Unknown',
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        status: isPending ? 'pending' : 'success',
        paymentTiming,
        paymentStatus: isPending ? 'tertunda' : 'lunas',
        transactionType,
        onlineDetails: transactionType === 'online' ? onlineDetails : undefined
      });

      // Update bank balance if applicable
      if (method === 'card' && !isPending && selectedBankId) {
        updateBankBalance(selectedBankId, total);
      }

      // 2. Reduce Stock
      items.forEach(item => {
        reduceStock(item.productId, item.quantity);
      });

      // 3. Clear Cart
      clearCart();

      // 4. Navigate to Receipt
      navigate(`/pos/receipt/${trxId}`);
      
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate realistic Indonesian banknote quick amounts
  const generateQuickAmounts = (tot: number) => {
    if (tot <= 0) return [0];
    const list: number[] = [tot]; // Uang pas

    const next5k = Math.ceil(tot / 5000) * 5000;
    if (next5k > tot) list.push(next5k);

    const next10k = Math.ceil(tot / 10000) * 10000;
    if (next10k > tot) list.push(next10k);

    const next20k = Math.ceil(tot / 20000) * 20000;
    if (next20k > tot) list.push(next20k);

    const next50k = Math.ceil(tot / 50000) * 50000;
    if (next50k > tot) list.push(next50k);

    const next100k = Math.ceil(tot / 100000) * 100000;
    if (next100k > tot) list.push(next100k);

    const nextNext100k = next100k + 100000;
    if (nextNext100k > tot && list.length < 5) list.push(nextNext100k);

    return Array.from(new Set(list)).sort((a, b) => a - b).slice(0, 5);
  };

  const quickAmounts = generateQuickAmounts(total);

  return (
    <div className="fixed inset-0 bg-[#254222]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-[#cae4c5]">
        <div className="p-4 border-b border-[#cae4c5]/40 flex justify-between items-center bg-[#cae4c5]/25">
          <h2 className="text-xl font-bold text-[#254222]">Pembayaran & Selesai</h2>
          <button onClick={onClose} className="p-2 text-[#76777d] hover:text-[#254222] rounded-full hover:bg-[#cae4c5]/40 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="text-center">
            <p className="text-[#76777d] text-xs font-semibold uppercase tracking-wider mb-1">
              {transactionType === 'online' ? 'Total Bersih Pesanan Online' : 'Total Tagihan'}
            </p>
            <h1 className="text-4xl font-black text-[#254222]">{formatCurrency(total)}</h1>

            {transactionType === 'online' && (
              <div className="mt-3 space-y-2">
                {onlineDetails && (
                  <div className="p-2.5 bg-[#cae4c5]/30 border border-[#cae4c5] rounded-xl flex items-center justify-between text-xs text-left">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#254222] text-[#ece2b1] rounded font-bold text-[10px] uppercase">
                        {onlineDetails.marketplace}
                      </span>
                      <span className="font-semibold text-[#254222]">
                        No. Pesanan: <span className="font-mono text-[#254222] font-bold">{onlineDetails.orderNumber}</span>
                      </span>
                    </div>
                    <span className="text-[#76777d]">Pembeli: <strong className="text-[#254222]">{onlineDetails.customerName}</strong></span>
                  </div>
                )}
                {marketplaceFee > 0 && (
                  <p className="text-xs text-[#ba1a1a] font-semibold">
                    *Termasuk Potongan Marketplace sebesar: <strong>-{formatCurrency(marketplaceFee)}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Timing Selector: Sekarang vs Tertunda */}
          <div>
            <label className="text-xs font-bold text-[#254222] uppercase tracking-wider block mb-2">
              Pilihan Pembayaran
            </label>
            <div className="grid grid-cols-2 p-1 bg-[#cae4c5]/30 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setPaymentTiming('sekarang')}
                className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  paymentTiming === 'sekarang'
                    ? 'bg-[#254222] text-[#ece2b1] shadow-sm'
                    : 'text-[#254222]/70 hover:text-[#254222] hover:bg-white/50'
                }`}
              >
                <Zap size={15} />
                <span>Bayar Sekarang (Lunas)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentTiming('tertunda')}
                className={`py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  paymentTiming === 'tertunda'
                    ? 'bg-[#ece2b1] text-[#254222] font-bold shadow-sm'
                    : 'text-[#254222]/70 hover:text-[#254222] hover:bg-white/50'
                }`}
              >
                <Clock size={15} />
                <span>Pembayaran Tertunda</span>
              </button>
            </div>
          </div>

          {paymentTiming === 'tertunda' ? (
            <div className="p-4 bg-[#ece2b1]/30 border border-[#ece2b1] rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
              <Clock className="text-[#254222] shrink-0 mt-0.5" size={20} />
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-[#254222]">Pesanan Dicatat Sebagai Pembayaran Tertunda</p>
                <p className="text-[#254222]/85 leading-relaxed">
                  {transactionType === 'online'
                    ? 'Dana penjualan marketplace masih ditahan sampai pesanan sampai atau dicairkan ke rekening toko. Stok produk tetap otomatis langsung dipotong.'
                    : 'Pembayaran belum diterima saat ini (piutang pelanggan). Stok produk tetap otomatis langsung dipotong.'}
                </p>
                <p className="text-[11px] text-[#254222] font-semibold">
                  Status transaksi akan tercatat sebagai <span className="underline decoration-[#254222] font-bold">Tertunda</span> di List Penjualan, dan dapat ditandai Lunas kapan saja.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-xs font-bold text-[#254222] mb-2.5 uppercase tracking-wider">Metode Pembayaran</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('cash')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      method === 'cash' ? 'border-[#254222] bg-[#cae4c5]/30 text-[#254222] shadow-sm' : 'border-slate-200 text-[#76777d] hover:border-[#cae4c5]'
                    }`}
                  >
                    <Banknote size={24} className="mb-1.5" />
                    <span className="font-bold text-xs">Tunai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('qris')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      method === 'qris' ? 'border-[#254222] bg-[#cae4c5]/30 text-[#254222] shadow-sm' : 'border-slate-200 text-[#76777d] hover:border-[#cae4c5]'
                    }`}
                  >
                    <QrCode size={24} className="mb-1.5" />
                    <span className="font-bold text-xs">QRIS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      method === 'card' ? 'border-[#254222] bg-[#cae4c5]/30 text-[#254222] shadow-sm' : 'border-slate-200 text-[#76777d] hover:border-[#cae4c5]'
                    }`}
                  >
                    <CreditCard size={24} className="mb-1.5" />
                    <span className="font-bold text-xs">Kartu</span>
                  </button>
                </div>
              </div>

              {method === 'cash' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#254222] uppercase tracking-wider">Uang Diterima</h3>
                    <span className="text-[11px] text-[#76777d]">Ketik manual atau klik pecahan</span>
                  </div>

                  {/* Quick Nominal Presets */}
                  <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {quickAmounts.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickAmount(amt)}
                        className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          amountPaid === amt 
                            ? 'bg-[#254222] text-[#ece2b1] border-[#254222] shadow-sm' 
                            : 'bg-[#cae4c5]/25 hover:bg-[#cae4c5]/50 text-[#254222] border-[#cae4c5]'
                        }`}
                      >
                        {amt === total ? `Uang Pas (${formatCurrency(amt)})` : formatCurrency(amt)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleClearAmount}
                      className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-white hover:bg-slate-100 text-[#ba1a1a] border border-slate-200"
                    >
                      Kosongkan
                    </button>
                  </div>
                  
                  {/* Manual Input with real-time dot formatting & auto-select */}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#76777d] font-bold text-lg">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoFocus
                      placeholder="0"
                      value={amountPaidStr}
                      onChange={handleAmountChange}
                      onFocus={(e) => e.target.select()}
                      className="w-full pl-14 pr-4 py-3 text-right font-black text-2xl text-[#254222] bg-[#cae4c5]/20 border-2 border-[#cae4c5]/60 rounded-xl focus:outline-none focus:bg-white focus:border-[#99cc66] focus:ring-4 focus:ring-[#99cc66]/20 transition-all"
                    />
                  </div>

                  {/* Kembalian / Notifikasi Kurang */}
                  {amountPaid >= total ? (
                    <div className="flex justify-between items-center p-4 rounded-xl bg-[#cae4c5]/40 border border-[#cae4c5]">
                      <span className="text-[#254222] font-semibold text-sm">Kembalian:</span>
                      <span className="text-2xl font-black text-[#254222]">
                        {formatCurrency(change)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-4 rounded-xl bg-[#ffdad6] border border-[#ffb4ab]">
                      <span className="text-[#ba1a1a] font-semibold text-sm">Uang Masih Kurang:</span>
                      <span className="text-xl font-black text-[#ba1a1a]">
                        {formatCurrency(deficit)}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {method === 'qris' && (
                <div className="p-6 bg-[#cae4c5]/20 rounded-xl border border-[#cae4c5] flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-4">
                    {/* Simulated QR Code */}
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMCAxMGgzMHYzMEgxMHptMTAgMTBoMTB2MTBIMjB6TTEwIDYwaDMwdjMwSDEwem0xMCAxMGgxMHYxMEgyMHpNNjAgMTBoMzB2MzBINjB6bTEwIDEwaDEwdjEwSDcwek01MCA1MGgxMHYxMEg1MHpNNjAgNjBoMTB2MTBINjB6TTgwIDgwaDEwdjEwSDgwek01MCA3MGgxMHYyMEg1MHpNODAgNjBoMTB2MTBMODAgNzB6TTcwIDUwaDEwdjIwSDcwem0yMCAwdjEwaDEwTTEwIDUwaDEwdjEwaDEwTTEwIDgwaDEwdjEwaDEwIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] bg-cover opacity-80" />
                  </div>
                  <p className="text-[#254222] font-semibold text-sm">Minta pelanggan scan QRIS untuk membayar</p>
                  <p className="text-xs text-[#76777d] mt-1">Status verifikasi pembayaran otomatis setelah QR discan</p>
                </div>
              )}
              
              {method === 'card' && (
                <div className="p-4 bg-[#cae4c5]/20 rounded-xl border border-[#cae4c5] flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2">
                  <CreditCard size={48} className="text-[#254222] mb-3" />
                  <p className="text-[#254222] font-semibold text-sm">Gesek atau tap kartu pada mesin EDC / Transfer Bank</p>
                  
                  <div className="w-full mt-4 text-left border-t border-[#cae4c5] pt-4">
                    <label className="block text-xs font-bold text-[#254222] mb-1.5 uppercase tracking-wider">Pilih Rekening Penerima</label>
                    <select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#cae4c5] bg-white text-sm font-semibold text-[#254222] focus:outline-none focus:ring-2 focus:ring-[#99cc66]"
                    >
                      {bankAccounts.map(b => (
                        <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-[#cae4c5]/40 bg-white">
          <button
            type="button"
            onClick={handleProcessPayment}
            disabled={!isValid || isProcessing}
            className={`w-full py-3.5 rounded-xl font-bold text-base disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 ${
              paymentTiming === 'tertunda'
                ? 'bg-[#ece2b1] hover:bg-[#ded4a3] text-[#254222]'
                : 'bg-[#254222] hover:bg-[#1b3119] text-[#ece2b1]'
            }`}
          >
            {isProcessing ? (
              <span className="animate-pulse">Memproses Transaksi...</span>
            ) : paymentTiming === 'tertunda' ? (
              <span>Simpan Pesanan (Pembayaran Tertunda)</span>
            ) : (
              <span>Selesaikan Pembayaran Sekarang</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
