import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Trash2, PackagePlus } from 'lucide-react';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase';
import { toast } from 'sonner';

interface EditPurchaseOrderModalProps {
  po: PurchaseOrder;
  onClose: () => void;
}

export function EditPurchaseOrderModal({ po, onClose }: EditPurchaseOrderModalProps) {
  const { updatePurchaseOrder, suppliers } = usePurchaseStore();
  const { products } = useProductStore();
  const { bankAccounts } = useSettingsStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States
  const [supplierId, setSupplierId] = useState(po.supplier?.id || '');
  const [notes, setNotes] = useState(po.notes || '');
  const [dueDate, setDueDate] = useState(po.dueDate || '');
  
  const [status, setStatus] = useState(po.status);
  const [paymentMethod, setPaymentMethod] = useState(po.paymentMethod || 'transfer');
  const [bankAccountId, setBankAccountId] = useState(po.bankAccountId || '');
  
  // We need to parse amountPaid to string for input
  const [amountPaidStr, setAmountPaidStr] = useState(() => 
    po.paidAmount ? new Intl.NumberFormat('id-ID').format(po.paidAmount) : '0'
  );

  const [items, setItems] = useState<PurchaseOrderItem[]>(
    po.items?.map(item => ({...item})) || []
  );
  
  // Product Search
  const [searchProduct, setSearchProduct] = useState('');
  
  const filteredProducts = useMemo(() => {
    if (!searchProduct.trim()) return [];
    const query = searchProduct.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.sku && p.sku.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [searchProduct, products]);

  const handleAddProduct = (product: any) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      toast.error('Produk sudah ada di daftar pesanan');
      setSearchProduct('');
      return;
    }
    
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        receivedQuantity: 0,
        buyPrice: product.buyPrice || 0,
        subtotal: product.buyPrice || 0
      }
    ]);
    setSearchProduct('');
  };
  
  const handleUpdateItem = (index: number, field: keyof PurchaseOrderItem, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].subtotal = newItems[index].quantity * newItems[index].buyPrice;
    
    // Safety check: received cannot exceed qty
    if (field === 'quantity' && newItems[index].receivedQuantity > newItems[index].quantity) {
      newItems[index].receivedQuantity = newItems[index].quantity;
    }
    
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const amountPaid = parseInt(amountPaidStr.replace(/\D/g, ''), 10) || 0;

  const handleSave = async () => {
    if (!supplierId) {
      toast.error('Pemasok (Supplier) harus diisi');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Pesanan harus memiliki minimal 1 item');
      return;
    }

    // Safety logic for status and payments
    let finalPaymentStatus = po.paymentStatus;
    if (amountPaid >= totalAmount && totalAmount > 0) {
      finalPaymentStatus = 'lunas';
    } else if (amountPaid > 0) {
      finalPaymentStatus = 'sebagian';
    } else {
      finalPaymentStatus = 'utang';
    }

    setIsSubmitting(true);
    try {
      await updatePurchaseOrder(po.id, {
        poNumber: po.poNumber,
        supplierId,
        notes,
        dueDate,
        status,
        paymentStatus: finalPaymentStatus,
        paymentMethod,
        bankAccountId: paymentMethod === 'transfer' ? bankAccountId : undefined,
        paidAmount: amountPaid,
        totalAmount,
        items
      });
      toast.success('Perubahan Purchase Order berhasil disimpan!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (val: number) => new Intl.NumberFormat('id-ID').format(val);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-[#254222]">Edit Purchase Order</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono bg-[#cae4c5]/40 text-[#254222] px-2 py-0.5 rounded-md">
                {po.poNumber}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(po.createdAt!).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#254222] uppercase tracking-wider">Informasi Pemasok</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pemasok *</label>
                <select 
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:border-[#99cc66] outline-none"
                >
                  <option value="">-- Pilih Pemasok --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan Tambahan</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:border-[#99cc66] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jatuh Tempo (Opsional)</label>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:border-[#99cc66] outline-none"
                />
              </div>
            </div>

            {/* Status & Payment */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#254222] uppercase tracking-wider">Status & Pembayaran</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Pengiriman Barang</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:border-[#99cc66] outline-none"
                >
                  <option value="draft">Draft (Disusun)</option>
                  <option value="dikirim">Dikirim Pemasok</option>
                  <option value="diterima_sebagian">Diterima Sebagian</option>
                  <option value="diterima">Diterima Penuh</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  ⚠️ Perhatian: Mengubah status menjadi Diterima akan langsung menambah stok produk.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Uang yang Sudah Dibayar</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-500">Rp</span>
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={amountPaidStr}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setAmountPaidStr(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '');
                    }}
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm font-semibold text-[#254222] focus:border-[#99cc66] outline-none"
                  />
                </div>
              </div>

              {amountPaid > 0 && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Metode Pembayaran</label>
                    <select 
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:border-[#99cc66] outline-none"
                    >
                      <option value="tunai">Tunai / Kas</option>
                      <option value="transfer">Transfer Bank / Debit</option>
                    </select>
                  </div>
                  {paymentMethod === 'transfer' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rekening Bank</label>
                      <select 
                        value={bankAccountId}
                        onChange={e => setBankAccountId(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:border-[#99cc66] outline-none"
                      >
                        <option value="">-- Pilih Rekening --</option>
                        {bankAccounts.map(b => (
                          <option key={b.id} value={b.id}>{b.bank} - {b.accountNumber}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#254222] uppercase tracking-wider flex items-center gap-2">
                <PackagePlus size={16} />
                Item Produk ({items.length})
              </h3>
            </div>

            <div className="p-3 mb-4 border border-slate-200 rounded-xl relative bg-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari nama produk untuk ditambahkan..." 
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:border-[#99cc66] outline-none bg-white"
                />
              </div>
              
              {searchProduct && (
                <div className="absolute z-20 left-3 right-3 top-[calc(100%-4px)] mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">Tidak ada produk ditemukan.</div>
                  ) : (
                    filteredProducts.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddProduct(p)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex justify-between items-center text-sm"
                      >
                        <div>
                          <div className="font-semibold text-slate-700">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>
                        </div>
                        <Plus size={16} className="text-[#99cc66]" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3">Produk</th>
                      <th className="py-2.5 px-3 text-center">Jml Pesan</th>
                      <th className="py-2.5 px-3 text-center">Jml Diterima</th>
                      <th className="py-2.5 px-3 text-right">Harga Beli</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">Belum ada item pesanan.</td>
                      </tr>
                    ) : items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-700">{item.productName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{item.sku}</div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input 
                            type="number"
                            min="1"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-16 h-7 px-1.5 rounded text-center border border-slate-200 text-xs focus:border-[#99cc66] outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input 
                            type="number"
                            min="0"
                            max={item.quantity}
                            step="0.01"
                            value={item.receivedQuantity}
                            onChange={(e) => handleUpdateItem(idx, 'receivedQuantity', parseFloat(e.target.value) || 0)}
                            className="w-16 h-7 px-1.5 rounded text-center border border-slate-200 text-xs focus:border-[#99cc66] outline-none bg-[#cae4c5]/20"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[10px] text-slate-400">Rp</span>
                            <input 
                              type="number"
                              min="0"
                              value={item.buyPrice}
                              onChange={(e) => handleUpdateItem(idx, 'buyPrice', parseInt(e.target.value) || 0)}
                              className="w-24 h-7 px-1.5 rounded border border-slate-200 text-xs font-semibold focus:border-[#99cc66] outline-none text-right"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#254222]">
                          {formatNumber(item.subtotal)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button 
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-[#cae4c5]/20 flex justify-end items-center gap-6 border-t border-slate-200">
                <span className="text-sm font-semibold text-slate-500">Total Pembelian</span>
                <span className="text-lg font-bold text-[#254222]">Rp {formatNumber(totalAmount)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#254222] hover:bg-[#1a2f18] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan PO'}
          </button>
        </div>

      </div>
    </div>
  );
}
