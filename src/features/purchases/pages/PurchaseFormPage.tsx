import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import PageContainer from '@/components/layout/PageContainer';
import { Search, Plus, Trash2, ArrowLeft, Save, Send, PackagePlus, CheckCircle2 } from 'lucide-react';
import type { PurchaseOrderItem, PurchaseOrder } from '@/types/purchase';
import type { Product } from '@/types/product';

export default function PurchaseFormPage() {
  const navigate = useNavigate();
  const { suppliers, addPurchaseOrder, receivePurchaseOrder, payPurchaseOrder } = usePurchaseStore();
  const { products, updateProduct, fetchProducts } = useProductStore();
  const { bankAccounts, updateBankBalance } = useSettingsStore();
  
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentStatusOption, setPaymentStatusOption] = useState<'utang' | 'lunas'>('utang');
  const [paymentMethodOption, setPaymentMethodOption] = useState<'tunai' | 'transfer'>('tunai');
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id || '');
  const [items, setItems] = useState<Partial<PurchaseOrderItem>[]>([]);
  const [searchProduct, setSearchProduct] = useState('');

  const filteredProducts = searchProduct 
    ? products.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.sku.toLowerCase().includes(searchProduct.toLowerCase()))
    : [];

  const handleAddProduct = (product: Product) => {
    if (items.some(i => i.productId === product.id)) return;
    
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        buyPrice: product.purchasePrice || 0,
        subtotal: product.purchasePrice || 0,
        receivedQuantity: 0
      }
    ]);
    setSearchProduct('');
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'quantity') item.quantity = value;
    if (field === 'buyPrice') item.buyPrice = value;
    
    item.subtotal = (item.quantity || 0) * (item.buyPrice || 0);
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const isValid = supplierId && items.length > 0 && items.every(i => (i.quantity || 0) > 0 && (i.buyPrice || 0) >= 0);

  const handleSave = async (status: 'draft' | 'dikirim' | 'diterima') => {
    if (!isValid) return;

    const isPaid = paymentStatusOption === 'lunas';

    const preparedItems = items.map(item => ({
      ...item,
      receivedQuantity: status === 'diterima' ? (item.quantity || 0) : 0
    })) as PurchaseOrderItem[];

    const newPo: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'> = {
      supplierId,
      items: preparedItems,
      totalAmount,
      status: status === 'diterima' ? 'dikirim' : status, // We create it as dikirim first, then receive it
      paymentStatus: 'utang',
      paidAmount: 0,
      notes
    };

    try {
      // 1. Buat PO dasar
      const poId = await addPurchaseOrder(newPo);
      
      // 2. Jika langsung lunas, bayar PO
      if (isPaid) {
        await payPurchaseOrder(poId, totalAmount, paymentMethodOption, paymentMethodOption === 'transfer' ? selectedBankId : undefined);
      }

      // 3. Jika langsung diterima, proses penerimaan barang (akan tambah stok otomatis)
      if (status === 'diterima') {
        let updatedPriceCount = 0;
        
        const receiveItemsPayload = preparedItems.map(item => ({
          productId: item.productId,
          qtyReceived: item.quantity
        }));
        
        await receivePurchaseOrder(poId, receiveItemsPayload);

        // Update harga master produk jika lunas
        if (isPaid) {
          for (const item of preparedItems) {
            if (item.buyPrice > 0) {
              await updateProduct(item.productId, { purchasePrice: item.buyPrice });
              updatedPriceCount++;
            }
          }
        }
        
        // Refresh products
        await fetchProducts();

        if (isPaid && updatedPriceCount > 0) {
          alert(`✅ PO berhasil dibuat!\nBarang langsung diterima (stok bertambah) dan status LUNAS: Harga beli ${updatedPriceCount} master produk otomatis disinkronkan ke harga PO terbaru.`);
        } else {
          alert('✅ PO berhasil dibuat dan stok barang telah ditambahkan ke sistem!');
        }
      } else {
        alert('✅ PO berhasil dibuat!');
      }

      navigate('/purchases');
    } catch (err: any) {
      alert(`Gagal membuat PO: ${err.message}`);
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  return (
    <PageContainer 
      title="Buat Purchase Order Baru" 
      description="Pesan stok barang ke pemasok dan kelola daftar item pembelian."
      actions={
        <button 
          onClick={() => navigate('/purchases')} 
          className="h-10 px-4 rounded-xl bg-white text-[#0b1c30] border border-slate-200/80 shadow-sm hover:bg-[#eff4ff] text-[13px] font-semibold flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Batal & Kembali</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Supplier & PO Meta */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-[15px] font-bold text-[#0b1c30] mb-4">Informasi Pemasok</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Pemasok / Supplier *</label>
                <select 
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] bg-white shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
                >
                  <option value="">-- Pilih Pemasok --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Catatan Tambahan</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] placeholder-[#76777d] shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all resize-none"
                  placeholder="Instruksi pengiriman atau catatan nomor referensi..."
                />
              </div>

              {/* Pilihan Status Pembayaran */}
              <div className="pt-3 border-t border-[#eff4ff]">
                <label className="block text-[13px] font-semibold text-[#0b1c30] mb-2">Status Pembayaran Tagihan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatusOption('utang')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      paymentStatusOption === 'utang'
                        ? 'border-[#3755c3] bg-[#eff4ff] text-[#3755c3]'
                        : 'border-slate-200 bg-white text-[#76777d] hover:bg-slate-50'
                    }`}
                  >
                    Tempo / Hutang
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatusOption('lunas')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      paymentStatusOption === 'lunas'
                        ? 'border-[#137333] bg-[#e6f4ea] text-[#137333]'
                        : 'border-slate-200 bg-white text-[#76777d] hover:bg-slate-50'
                    }`}
                  >
                    Langsung Lunas
                  </button>
                </div>
                <p className="text-[11px] text-[#76777d] mt-2 leading-relaxed">
                  {paymentStatusOption === 'lunas' 
                    ? '💡 Status Lunas: Saat pesanan diterima, harga beli master produk akan langsung diperbarui ke harga PO baru ini.'
                    : '💡 Status Hutang: Harga beli master produk akan diperbarui saat hutang tagihan PO ini dilunasi nanti.'}
                </p>
              </div>

              {/* Pilihan Metode Pembayaran (Hanya jika Lunas) */}
              {paymentStatusOption === 'lunas' && (
                <div className="pt-3 border-t border-[#eff4ff] animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[13px] font-semibold text-[#0b1c30] mb-2">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethodOption('tunai')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        paymentMethodOption === 'tunai'
                          ? 'border-[#3755c3] bg-[#eff4ff] text-[#3755c3]'
                          : 'border-slate-200 bg-white text-[#76777d] hover:bg-slate-50'
                      }`}
                    >
                      Tunai (Kas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethodOption('transfer')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        paymentMethodOption === 'transfer'
                          ? 'border-[#3755c3] bg-[#eff4ff] text-[#3755c3]'
                          : 'border-slate-200 bg-white text-[#76777d] hover:bg-slate-50'
                      }`}
                    >
                      Transfer Bank / Debit
                    </button>
                  </div>
                  
                  {paymentMethodOption === 'transfer' && (
                    <div className="mt-2">
                      <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1.5">Pilih Rekening Sumber Dana</label>
                      <select
                        value={selectedBankId}
                        onChange={(e) => setSelectedBankId(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-[#0b1c30] focus:outline-none focus:border-[#3755c3]"
                      >
                        {bankAccounts.map(b => (
                          <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber} (Saldo: Rp {(b.balance || 0).toLocaleString('id-ID')})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Item Catalog & Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-[#eff4ff] bg-white flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0b1c30] flex items-center gap-2">
                <PackagePlus size={18} className="text-[#3755c3]" />
                <span>Daftar Item Pesanan</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#3755c3]">
                {items.length} Item
              </span>
            </div>
            
            {/* Search Input for Products */}
            <div className="p-4 border-b border-[#eff4ff] relative bg-white">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={18} />
                <input 
                  type="text" 
                  placeholder="Ketik nama atau SKU produk untuk ditambahkan..." 
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#eff4ff] text-[13px] text-[#0b1c30] placeholder-[#76777d] border border-transparent focus:outline-none focus:bg-white focus:border-[#3755c3]/30 focus:ring-2 focus:ring-[#3755c3]/15 transition-all"
                />
              </div>
              
              {/* Dropdown Results */}
              {searchProduct && (
                <div className="absolute z-20 left-4 right-4 top-[calc(100%-6px)] mt-1 bg-white border border-slate-200/80 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-[#eff4ff]">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#76777d]">Produk tidak ditemukan.</div>
                  ) : (
                    filteredProducts.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddProduct(p)}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#eff4ff]/60 flex justify-between items-center transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-xs text-[#0b1c30]">{p.name}</div>
                          <div className="text-[11px] text-[#76777d] font-mono">{p.sku} | Stok: {p.stock}</div>
                        </div>
                        <Plus size={16} className="text-[#3755c3]" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-4 w-28 text-center">Qty</th>
                    <th className="py-3 px-4 w-36 text-right">Harga Beli</th>
                    <th className="py-3 px-4 w-36 text-right">Subtotal</th>
                    <th className="py-3 px-4 w-12 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff4ff] text-[13px]">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#76777d]">
                        Belum ada item ditambahkan ke PO ini.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-[#eff4ff]/30 transition-colors">
                        <td className="py-3 px-4 text-center text-[#76777d] text-xs">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0b1c30]">{item.productName}</div>
                          <div className="text-[11px] font-mono text-[#76777d]">{item.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-20 h-8 text-center rounded-lg border border-slate-200 text-xs font-bold text-[#0b1c30] focus:outline-none focus:border-[#3755c3]"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input 
                            type="number" 
                            min="0"
                            value={item.buyPrice || ''}
                            onChange={(e) => updateItem(idx, 'buyPrice', parseInt(e.target.value) || 0)}
                            className="w-28 h-8 px-2 text-right rounded-lg border border-slate-200 text-xs font-bold text-[#0b1c30] focus:outline-none focus:border-[#3755c3]"
                          />
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#0b1c30]">
                          <span className="text-[11px] text-[#76777d] mr-1">Rp</span>
                          <span>{formatNumber(item.subtotal || 0)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => removeItem(idx)}
                            className="p-1.5 text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {items.length > 0 && (
                  <tfoot className="bg-[#eff4ff]/60 border-t border-[#eff4ff]">
                    <tr>
                      <td colSpan={4} className="py-3.5 px-4 text-right font-bold text-[#0b1c30]">Total Purchase Order:</td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#3755c3] text-base">
                        <span className="text-xs mr-1">Rp</span>{formatNumber(totalAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end pt-1">
            <button 
              type="button"
              onClick={() => handleSave('draft')}
              disabled={!isValid}
              className="h-10 px-4 bg-white border border-slate-200 text-[#0b1c30] font-semibold text-[13px] rounded-xl hover:bg-[#eff4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
            >
              <Save size={16} />
              <span>Simpan Draft</span>
            </button>
            <button 
              type="button"
              onClick={() => handleSave('dikirim')}
              disabled={!isValid}
              className="h-10 px-5 bg-white border border-[#3755c3]/30 text-[#3755c3] hover:bg-[#eff4ff] font-semibold text-[13px] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
            >
              <Send size={16} />
              <span>Kirim PO ke Pemasok</span>
            </button>
            <button 
              type="button"
              onClick={() => handleSave('diterima')}
              disabled={!isValid}
              className="h-10 px-5 bg-[#3755c3] hover:bg-[#2a429c] text-white font-semibold text-[13px] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Langsung Selesai & Diterima</span>
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
