import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFinanceStore } from '@/stores/financeStore';
import PageContainer from '@/components/layout/PageContainer';
import { ArrowLeft, CheckCircle2, AlertTriangle, PackageCheck, Banknote, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function ReceiveGoodsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPurchaseOrder, receivePurchaseOrder, payPurchaseOrder, purchaseOrders } = usePurchaseStore();
  const { updateProduct, fetchProducts, products } = useProductStore();
  const { bankAccounts, updateBankBalance } = useSettingsStore();
  const { updateCashBalance } = useFinanceStore();

  const po = id ? getPurchaseOrder(id) : undefined;
  
  // Local state to track received quantities
  const [receivedItems, setReceivedItems] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (po) {
      po.items.forEach(item => {
        initial[item.id] = item.quantity;
      });
    }
    return initial;
  });
  
  const [receiveNotes, setReceiveNotes] = useState('');
  const [markPaidNow, setMarkPaidNow] = useState(false);
  const [payMethod, setPayMethod] = useState<'cash' | 'transfer'>('cash');
  const [payBankId, setPayBankId] = useState(() => bankAccounts[0]?.id || '');

  // JIKA DIAKSES TANPA ID (DARI SIDEBAR)
  if (!id) {
    const pendingPOs = purchaseOrders.filter(po => po.status === 'dikirim' || po.status === 'diterima_sebagian');

    return (
      <PageContainer 
        title="Penerimaan Barang" 
        description="Pilih Purchase Order yang barangnya telah tiba di toko untuk diverifikasi kuantitas fisiknya."
      >
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-[#eff4ff] bg-white flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#0b1c30]">Daftar PO Menunggu Penerimaan</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#eff4ff] text-[#3755c3]">
              {pendingPOs.length} Pengiriman
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                  <th className="py-3.5 px-5">No. PO</th>
                  <th className="py-3.5 px-5">Pemasok</th>
                  <th className="py-3.5 px-5">Tanggal PO</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff] text-[13px]">
                {pendingPOs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#76777d]">
                      <PackageCheck size={44} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-[#0b1c30]">Tidak ada barang yang sedang menunggu penerimaan</p>
                      <p className="text-xs text-[#76777d] mt-1">Buat dan kirim Purchase Order baru terlebih dahulu.</p>
                    </td>
                  </tr>
                ) : (
                  pendingPOs.map(po => (
                    <tr key={po.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-[#3755c3]">{po.poNumber}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#0b1c30]">{po.supplier?.name}</td>
                      <td className="px-5 py-3.5 text-[#76777d]">
                        {format(new Date(po.createdAt), 'dd MMM yyyy', { locale: localeId })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#d3e4fe] text-[#3755c3] rounded-lg text-[11px] font-bold uppercase">
                          {po.status === 'dikirim' ? 'Dikirim' : 'Parsial'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link 
                          to={`/purchases/${po.id}/receive`}
                          className="h-8 px-4 bg-[#3755c3] hover:bg-[#2a429c] text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 size={14} />
                          <span>Proses Penerimaan</span>
                        </Link>
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

  if (!po) {
    return (
      <PageContainer title="Penerimaan Barang">
        <div className="p-8 text-center text-[#76777d]">Purchase Order tidak ditemukan.</div>
      </PageContainer>
    );
  }

  const handleQtyChange = (itemId: string, qty: number) => {
    setReceivedItems(prev => ({
      ...prev,
      [itemId]: qty
    }));
  };

  const handleReceive = async () => {
    if (!window.confirm('Verifikasi penerimaan barang? Stok produk akan ditambahkan secara otomatis oleh database.')) return;

    let isPartial = false;
    let allZero = true;
    const isPaid = po.paymentStatus === 'lunas' || markPaidNow;
    let updatedPriceCount = 0;

    const payloadItems: { productId: string; qtyReceived: number }[] = [];

    // Calculate which items are received
    po.items.forEach(item => {
      const received = receivedItems[item.id] || 0;
      
      if (received < item.quantity) isPartial = true;
      if (received > 0) {
        allZero = false;
        payloadItems.push({ productId: item.productId, qtyReceived: received });
      }
    });

    if (allZero) {
      alert('Tidak ada barang yang diterima. Isi jumlah minimal 1.');
      return;
    }

    try {
      // 1. Eksekusi RPC Receive Goods
      await receivePurchaseOrder(po.id, payloadItems);

      // 2. Eksekusi RPC Payment jika user mencentang bayar sekarang
      if (markPaidNow) {
        const payAmount = po.totalAmount - (po.paidAmount || 0);
        await payPurchaseOrder(po.id, payAmount, payMethod, payMethod === 'transfer' ? payBankId : undefined);
      }

      // 3. Update harga master produk jika PO lunas
      if (isPaid) {
        for (const item of po.items) {
          const received = receivedItems[item.id] || 0;
          if (received > 0 && item.buyPrice > 0) {
            await updateProduct(item.productId, { purchasePrice: item.buyPrice });
            updatedPriceCount++;
          }
        }
      }

      // 4. Refresh products agar stok terbaru terlihat
      await fetchProducts();

      if (isPaid && updatedPriceCount > 0) {
        alert(`✅ Penerimaan barang berhasil diverifikasi!\nStok telah ditambahkan oleh database, dan harga beli ${updatedPriceCount} produk di master data stok otomatis diperbarui sesuai harga PO.`);
      } else if (!isPaid) {
        alert(`✅ Penerimaan barang berhasil diverifikasi!\nStok telah ditambahkan.\nCatatan: Tagihan PO belum lunas. Harga beli master produk akan otomatis diperbarui saat tagihan PO dilunasi.`);
      } else {
        alert('✅ Penerimaan barang berhasil diverifikasi!');
      }

      navigate('/purchases');
    } catch (err: any) {
      alert(`Gagal memproses penerimaan: ${err.message}`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  return (
    <PageContainer 
      title={`Penerimaan Barang — ${po.poNumber}`} 
      description="Verifikasi kuantitas fisik barang yang tiba sebelum menambahkan ke stok toko."
      actions={
        <button 
          onClick={() => navigate('/purchases')} 
          className="h-10 px-4 rounded-xl bg-white text-[#0b1c30] border border-slate-200/80 shadow-sm hover:bg-[#eff4ff] text-[13px] font-semibold flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar PO</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: PO Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-[15px] font-bold text-[#0b1c30] mb-3 border-b border-[#eff4ff] pb-2">Informasi PO</h3>
            
            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[#76777d] mb-0.5">Pemasok</p>
                <p className="font-semibold text-sm text-[#0b1c30]">{po.supplier?.name || '-'}</p>
              </div>
              <div>
                <p className="text-[#76777d] mb-0.5">Total Nilai PO</p>
                <p className="font-bold text-sm text-[#3755c3]">{formatCurrency(po.totalAmount)}</p>
              </div>
              <div>
                <p className="text-[#76777d] mb-0.5">Catatan Pesanan</p>
                <p className="text-[#45464d] whitespace-pre-wrap">{po.notes || '-'}</p>
              </div>
            </div>
          </div>

          {/* Kartu Status Pembayaran & Auto Sync Harga */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h3 className="text-[15px] font-bold text-[#0b1c30] border-b border-[#eff4ff] pb-2 flex items-center justify-between">
              <span>Status Pembayaran</span>
              {po.paymentStatus === 'lunas' || markPaidNow ? (
                <span className="text-[#137333] text-xs font-bold bg-[#e6f4ea] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 size={12} /> Lunas
                </span>
              ) : (
                <span className="text-[#ba1a1a] text-xs font-bold bg-[#ffdad6] px-2 py-0.5 rounded-md">
                  Belum Lunas
                </span>
              )}
            </h3>

            {po.paymentStatus === 'lunas' ? (
              <div className="p-3 bg-[#e6f4ea]/60 rounded-xl text-xs text-[#137333] border border-[#a8dab5]/50">
                <p className="font-semibold">Tagihan PO sudah Lunas.</p>
                <p className="text-[11px] mt-0.5 text-slate-600">
                  Saat penerimaan diverifikasi, harga beli master produk akan otomatis disinkronkan ke harga PO terbaru.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-[#45464d]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#76777d]">Total Tagihan:</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(po.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#76777d]">Sisa Hutang:</span>
                    <span className="font-bold text-[#ba1a1a]">{formatCurrency(po.totalAmount - (po.paidAmount || 0))}</span>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#cae4c5]/20 border border-[#cae4c5] cursor-pointer hover:bg-[#cae4c5]/30 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={markPaidNow} 
                    onChange={e => setMarkPaidNow(e.target.checked)}
                    className="mt-0.5 rounded text-[#254222] focus:ring-[#99cc66] w-4 h-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#254222]">Bayar Lunas Sekarang</span>
                    <p className="text-[11px] text-[#45464d] mt-1 leading-relaxed">
                      Centang untuk melunasi tagihan saat barang tiba. Harga beli master produk akan langsung diperbarui.
                    </p>
                  </div>
                </label>

                {/* Payment method selector — muncul jika markPaidNow */}
                {markPaidNow && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[11px] font-bold text-[#254222] uppercase tracking-wider">Metode Pembayaran</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayMethod('cash')}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                          payMethod === 'cash'
                            ? 'border-[#254222] bg-[#cae4c5]/30 text-[#254222]'
                            : 'border-slate-200 text-[#76777d] hover:border-[#cae4c5]'
                        }`}
                      >
                        <Banknote size={15} /> Tunai / Kas
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod('transfer')}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                          payMethod === 'transfer'
                            ? 'border-[#254222] bg-[#cae4c5]/30 text-[#254222]'
                            : 'border-slate-200 text-[#76777d] hover:border-[#cae4c5]'
                        }`}
                      >
                        <Building2 size={15} /> Transfer Bank
                      </button>
                    </div>

                    {payMethod === 'transfer' && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-[11px] font-semibold text-[#254222] mb-1">Rekening Sumber Dana</label>
                        <select
                          value={payBankId}
                          onChange={e => setPayBankId(e.target.value)}
                          className="w-full h-9 px-3 border border-[#cae4c5] rounded-lg text-xs font-semibold text-[#254222] focus:outline-none focus:border-[#99cc66] bg-white"
                        >
                          {bankAccounts.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.bank} — {b.accountNumber} (Saldo: Rp {(b.balance || 0).toLocaleString('id-ID')})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="p-2 bg-[#ece2b1]/40 border border-[#ece2b1] rounded-lg text-[11px] text-[#254222] font-semibold">
                      💳 Saldo akan berkurang: Rp {(po.totalAmount - (po.paidAmount || 0)).toLocaleString('id-ID')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-[15px] font-bold text-[#0b1c30] mb-3 border-b border-[#eff4ff] pb-2">Catatan Penerimaan</h3>
            <textarea 
              value={receiveNotes}
              onChange={e => setReceiveNotes(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#3755c3] resize-none"
              placeholder="Contoh: Barang tiba dalam kondisi baik, kardus utuh..."
            />
          </div>
        </div>

        {/* Right Column: Items Verification Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-[#eff4ff] bg-white flex justify-between items-center">
              <h3 className="text-[15px] font-bold text-[#0b1c30]">Verifikasi Kuantitas Fisik & Harga Beli</h3>
              <div className="flex items-center gap-1.5 text-xs text-[#76777d]">
                <AlertTriangle size={15} className="text-amber-500" />
                <span>Stok produk & harga beli master akan otomatis ter-update</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Produk</th>
                    <th className="py-3.5 px-4 text-right">Harga Beli PO</th>
                    <th className="py-3.5 px-4 text-center">Dipesan</th>
                    <th className="py-3.5 px-4 text-center w-36">Diterima Fisik</th>
                    <th className="py-3.5 px-4 text-center">Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff4ff] text-[13px]">
                  {po.items.map((item, idx) => {
                    const received = receivedItems[item.id] || 0;
                    const diff = received - item.quantity;
                    const curProd = products.find(p => p.id === item.productId);
                    const oldPrice = curProd?.purchasePrice || curProd?.buyPrice || 0;
                    const isPriceChanged = oldPrice > 0 && oldPrice !== item.buyPrice;
                    
                    return (
                      <tr key={item.id} className="hover:bg-[#eff4ff]/30 transition-colors">
                        <td className="py-3.5 px-4 text-center text-[#76777d] text-xs">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#0b1c30]">{item.productName}</div>
                          <div className="text-[11px] font-mono text-[#76777d]">{item.sku}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-[#0b1c30]">
                            {formatCurrency(item.buyPrice)}
                          </div>
                          {isPriceChanged ? (
                            <div className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                              Master lama: {formatCurrency(oldPrice)} ➔ Baru: {formatCurrency(item.buyPrice)}
                            </div>
                          ) : (
                            <div className="text-[10px] text-[#76777d] mt-0.5">
                              Sama dengan harga master
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#0b1c30]">
                          {item.quantity} pcs
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <input 
                            type="number" 
                            min="0"
                            max={item.quantity}
                            value={received.toString()}
                            onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-24 h-8 px-2 text-center rounded-lg border border-slate-200 text-xs font-bold text-[#0b1c30] focus:outline-none focus:border-[#3755c3]"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {diff < 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold">
                              {diff}
                            </span>
                          ) : diff > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#d3e4fe] text-[#3755c3] text-xs font-bold">
                              +{diff}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e6f4ea] text-[#137333] text-xs font-bold">
                              <CheckCircle2 size={13} /> Sesuai
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-[#eff4ff] bg-[#eff4ff]/20 flex justify-end">
              <button 
                onClick={handleReceive}
                className="h-10 px-6 bg-[#3755c3] hover:bg-[#2a429c] text-white font-semibold text-[13px] rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 size={18} />
                <span>Konfirmasi Penerimaan Barang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
