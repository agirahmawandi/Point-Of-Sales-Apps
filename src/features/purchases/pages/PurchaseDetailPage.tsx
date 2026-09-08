import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import PageContainer from '@/components/layout/PageContainer';
import { ArrowLeft, CheckCircle2, AlertCircle, CreditCard, Receipt, FileText, History } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { PurchaseOrderStatus } from '@/types/purchase';

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPurchaseOrder, updatePurchaseOrder } = usePurchaseStore();
  const { updatePurchasePrice, products } = useProductStore();
  const { bankAccounts, updateBankBalance } = useSettingsStore();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id || '');

  const po = id ? getPurchaseOrder(id) : undefined;

  if (!po) {
    return (
      <PageContainer title="Detail Purchase Order">
        <div className="p-8 text-center text-[#76777d]">Purchase Order tidak ditemukan.</div>
      </PageContainer>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'draft': return <span className="px-2.5 py-0.5 bg-[#eff4ff] text-[#76777d] rounded-lg text-[11px] font-bold uppercase border border-[#d3e4fe]">Draft</span>;
      case 'dikirim': return <span className="px-2.5 py-0.5 bg-[#d3e4fe] text-[#3755c3] rounded-lg text-[11px] font-bold uppercase border border-[#708cfd]/30">Dikirim</span>;
      case 'diterima_sebagian': return <span className="px-2.5 py-0.5 bg-[#fef3c7] text-[#92400e] rounded-lg text-[11px] font-bold uppercase border border-amber-200">Parsial</span>;
      case 'diterima': return <span className="px-2.5 py-0.5 bg-[#e6f4ea] text-[#137333] rounded-lg text-[11px] font-bold uppercase border border-[#a8dab5]/40">Selesai</span>;
      case 'batal': return <span className="px-2.5 py-0.5 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-[11px] font-bold uppercase border border-red-200">Batal</span>;
      default: return null;
    }
  };

  const remainingDebt = po.totalAmount - (po.paidAmount || 0);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountToPay = parseInt(paymentAmount) || 0;
    if (amountToPay <= 0 || amountToPay > remainingDebt) return;

    const newPaidAmount = (po.paidAmount || 0) + amountToPay;
    const newPaymentStatus = newPaidAmount >= po.totalAmount ? 'lunas' : 'sebagian';

    const bankInfo = (paymentMethod === 'Transfer Bank' && selectedBankId)
      ? ` (${bankAccounts.find(b => b.id === selectedBankId)?.bank || ''})`
      : '';

    updatePurchaseOrder(po.id, {
      paidAmount: newPaidAmount,
      paymentStatus: newPaymentStatus,
      paymentNotes: `${po.paymentNotes ? po.paymentNotes + ' | ' : ''}${format(new Date(), 'dd/MM/yyyy HH:mm')}: ${formatCurrency(amountToPay)} via ${paymentMethod}${bankInfo}`,
    });

    if (paymentMethod === 'Transfer Bank' && selectedBankId) {
      updateBankBalance(selectedBankId, -amountToPay);
    }

    // Jika pelunasan mencapai LUNAS dan barang sudah diterima (atau sebagian),
    // otomatis sinkronkan harga beli master produk ke harga item PO
    let updatedPriceCount = 0;
    const isGoodsReceived = po.status === 'diterima' || po.items.some(i => (i.receivedQuantity || 0) > 0);

    if (newPaymentStatus === 'lunas' && isGoodsReceived) {
      po.items.forEach(item => {
        if ((item.receivedQuantity > 0 || po.status === 'diterima') && item.buyPrice > 0) {
          updatePurchasePrice(item.productId, item.buyPrice);
          updatedPriceCount++;
        }
      });
    }

    setIsPaymentModalOpen(false);
    setPaymentAmount('');

    if (newPaymentStatus === 'lunas' && updatedPriceCount > 0) {
      alert(`✅ Pembayaran sebesar ${formatCurrency(amountToPay)} berhasil dicatat!\nTagihan PO telah LUNAS dan barang sudah diterima: Harga beli ${updatedPriceCount} master produk otomatis diperbarui ke harga PO terbaru.`);
    } else {
      alert(`✅ Pembayaran sebesar ${formatCurrency(amountToPay)} berhasil dicatat ke hutang dagang PO!`);
    }
  };

  return (
    <PageContainer 
      title={`Detail PO: ${po.poNumber}`}
      description="Rincian pesanan pembelian barang, verifikasi penerimaan, dan status hutang dagang."
      actions={
        <button 
          onClick={() => navigate('/purchases')} 
          className="h-10 px-4 rounded-xl bg-white text-[#0b1c30] border border-slate-200/80 shadow-sm hover:bg-[#eff4ff] text-[13px] font-semibold flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Info & Payment */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-[15px] font-bold text-[#0b1c30] mb-3 border-b border-[#eff4ff] pb-2">Informasi Umum</h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[#76777d] mb-0.5">Tanggal Dibuat</p>
                <p className="font-semibold text-sm text-[#0b1c30]">{format(new Date(po.createdAt), 'dd MMM yyyy, HH:mm', { locale: localeId })}</p>
              </div>
              <div>
                <p className="text-[#76777d] mb-0.5">Pemasok</p>
                <p className="font-semibold text-sm text-[#0b1c30]">{po.supplier?.name || '-'}</p>
                <p className="text-[#76777d] mt-0.5">{po.supplier?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-[#76777d] mb-1">Status Pengiriman</p>
                <div>{getStatusBadge(po.status)}</div>
              </div>
              <div>
                <p className="text-[#76777d] mb-0.5">Catatan Pembelian</p>
                <p className="text-[#45464d] whitespace-pre-wrap">{po.notes || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-[15px] font-bold text-[#0b1c30] mb-4 border-b border-[#eff4ff] pb-2 flex items-center justify-between">
              <span>Status Pembayaran</span>
              {po.paymentStatus === 'lunas' ? (
                <span className="text-[#137333] flex items-center gap-1 text-xs bg-[#e6f4ea] px-2.5 py-1 rounded-lg font-bold uppercase"><CheckCircle2 size={13}/> Lunas</span>
              ) : (
                <span className="text-[#ba1a1a] flex items-center gap-1 text-xs bg-[#ffdad6] px-2.5 py-1 rounded-lg font-bold uppercase"><AlertCircle size={13}/> Belum Lunas</span>
              )}
            </h3>
            
            <div className="space-y-2.5 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-[#76777d]">Total Tagihan</span>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(po.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#76777d]">Sudah Dibayar</span>
                <span className="font-bold text-[#137333]">{formatCurrency(po.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-sm">
                <span className="font-semibold text-[#0b1c30]">Sisa Hutang (AP)</span>
                <span className="font-bold text-[#ba1a1a]">{formatCurrency(remainingDebt)}</span>
              </div>
            </div>

            {remainingDebt > 0 && (
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full h-10 flex items-center justify-center gap-2 bg-[#3755c3] hover:bg-[#2a429c] text-white rounded-xl font-semibold text-xs transition-all shadow-sm"
              >
                <CreditCard size={16} />
                <span>Bayar Hutang Tagihan PO</span>
              </button>
            )}

            {/* Payment History */}
            {po.paymentNotes && (
              <div className="mt-4 pt-4 border-t border-[#eff4ff]">
                <div className="flex items-center gap-1.5 mb-2">
                  <History size={14} className="text-[#76777d]" />
                  <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wide">Riwayat Pembayaran</span>
                </div>
                <div className="space-y-1.5">
                  {po.paymentNotes.split(' | ').map((note, i) => (
                    <p key={i} className="text-xs text-[#0b1c30] bg-[#eff4ff]/60 px-2.5 py-1.5 rounded-lg border border-[#d3e4fe]/50">
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Items Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-[#eff4ff] bg-white flex items-center gap-2">
              <FileText size={18} className="text-[#3755c3]" />
              <h3 className="text-[15px] font-bold text-[#0b1c30]">Daftar Item Pesanan</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Produk</th>
                    <th className="py-3.5 px-4 text-right">Harga Beli</th>
                    <th className="py-3.5 px-4 text-center">Dipesan</th>
                    <th className="py-3.5 px-4 text-center">Diterima</th>
                    <th className="py-3.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff4ff] text-[13px]">
                  {po.items.map((item, idx) => {
                    const curProd = products.find(p => p.id === item.productId);
                    const masterCost = curProd?.purchasePrice || curProd?.buyPrice || 0;
                    const isDiff = masterCost > 0 && masterCost !== item.buyPrice;

                    return (
                      <tr key={item.id} className="hover:bg-[#eff4ff]/30 transition-colors">
                        <td className="py-3.5 px-4 text-center text-[#76777d] text-xs">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#0b1c30]">{item.productName}</div>
                          <div className="text-[11px] font-mono text-[#76777d]">{item.sku}</div>
                          {isDiff && (
                            <div className="text-[10px] font-medium text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-0.5 inline-block border border-amber-200">
                              Master saat ini: {formatCurrency(masterCost)}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-[#0b1c30]">{formatCurrency(item.buyPrice)}</div>
                          {isDiff && (
                            <div className="text-[10px] text-[#3755c3] font-medium">➔ PO Baru</div>
                          )}
                        </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-[#0b1c30]">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                          item.receivedQuantity < item.quantity ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#e6f4ea] text-[#137333]'
                        }`}>
                          {item.receivedQuantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#0b1c30]">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  );
                })}
                </tbody>
                <tfoot className="bg-[#eff4ff]/60 border-t border-[#eff4ff]">
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-right font-bold text-[#0b1c30] text-xs uppercase tracking-wide">Total Pembelian PO:</td>
                    <td className="py-4 px-4 text-right font-bold text-[#3755c3] text-base">{formatCurrency(po.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Pembayaran */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-[#eff4ff] bg-[#eff4ff]/60">
              <h2 className="text-[16px] font-bold text-[#0b1c30] flex items-center gap-2">
                <Receipt size={18} className="text-[#3755c3]" />
                <span>Bayar Tagihan PO</span>
              </h2>
            </div>
            
            <form onSubmit={handlePayment}>
              <div className="p-5 space-y-4">
                <div className="bg-[#eff4ff] text-[#0b1c30] px-4 py-3 rounded-xl flex justify-between items-center text-xs font-semibold border border-[#d3e4fe]">
                  <span>Sisa Hutang:</span>
                  <span className="text-sm font-bold text-[#ba1a1a]">{formatCurrency(remainingDebt)}</span>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Jumlah Bayar (Rp) *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max={remainingDebt}
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] font-bold text-[#0b1c30]"
                    placeholder="Contoh: 1500000"
                  />
                  <button 
                    type="button" 
                    onClick={() => setPaymentAmount(remainingDebt.toString())}
                    className="text-xs text-[#3755c3] font-semibold hover:underline mt-1.5"
                  >
                    Bayar Lunas Penuh (Rp {new Intl.NumberFormat('id-ID').format(remainingDebt)})
                  </button>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Metode Pembayaran</label>
                  <select 
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] text-sm text-[#0b1c30] bg-white"
                  >
                    <option value="Tunai">Tunai / Kas</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Giro / Cek">Giro / Cek</option>
                  </select>
                </div>

                {paymentMethod === 'Transfer Bank' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Pilih Rekening Sumber Dana</label>
                    <select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#3755c3]/30 bg-[#eff4ff]/30 text-sm font-semibold text-[#0b1c30] focus:outline-none focus:border-[#3755c3]"
                    >
                      {bankAccounts.map(b => (
                        <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber} (Saldo: Rp {(b.balance || 0).toLocaleString('id-ID')})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-[#eff4ff] bg-[#eff4ff]/20 flex justify-end gap-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="h-9 px-4 text-[#0b1c30] text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="h-9 px-5 bg-[#3755c3] text-white text-xs font-semibold hover:bg-[#2a429c] rounded-xl transition-all shadow-sm"
                >
                  Proses Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
