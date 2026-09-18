import React, { useState, useEffect } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Search, Loader2 } from 'lucide-react';
import { useWriteOffStore } from '@/stores/writeOffStore';
import { useProductStore } from '@/stores/productStore';
import { showSuccess, showError } from '@/lib/toast';

const writeOffSchema = z.object({
  productId: z.string().min(1, 'Produk harus dipilih'),
  quantity: z.coerce.number().min(0.01, 'Kuantitas harus lebih dari 0'),
  reason: z.string().min(3, 'Keterangan terlalu singkat'),
});

type WriteOffFormValues = z.infer<typeof writeOffSchema>;

interface WriteOffFormModalProps {
  onClose: () => void;
}

export default function WriteOffFormModal({ onClose }: WriteOffFormModalProps) {
  const { createWriteOff, isLoading: isSaving } = useWriteOffStore();
  const { products, fetchProducts, isLoading: isProductsLoading } = useProductStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useHookForm<WriteOffFormValues>({
    resolver: zodResolver(writeOffSchema),
    defaultValues: {
      productId: '',
      quantity: 1,
      reason: '',
    }
  });

  const selectedProductId = watch('productId');
  const quantity = watch('quantity') || 0;
  
  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  // HPP / Purchase Price
  const purchasePrice = selectedProduct?.purchasePrice || selectedProduct?.buyPrice || 0;
  const lossAmount = quantity * purchasePrice;

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 5);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  const handleSelectProduct = (product: any) => {
    setValue('productId', product.id, { shouldValidate: true });
    setSearchTerm(product.name);
    setShowDropdown(false);
  };

  const onSubmit = async (data: WriteOffFormValues) => {
    try {
      if (!selectedProduct) throw new Error("Produk tidak valid");
      
      if (data.quantity > selectedProduct.stock) {
        showError(`Stok tidak cukup! Stok saat ini: ${selectedProduct.stock}`);
        return;
      }
      
      const calcLoss = data.quantity * purchasePrice;
      
      await createWriteOff(data.productId, data.quantity, data.reason, calcLoss);
      
      showSuccess('Data produk rusak berhasil dicatat!');
      onClose();
    } catch (error: any) {
      showError(error.message || 'Terjadi kesalahan saat menyimpan');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#0b1c30]">Catat Produk Rusak</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div>
            <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Pilih Produk *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ketik nama atau SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (selectedProductId) setValue('productId', '');
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20"
              />
              <input type="hidden" {...register('productId')} />
              
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 shadow-lg rounded-xl z-10 max-h-48 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(prod => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(prod)}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-[#eff4ff] border-b border-slate-50 last:border-0"
                      >
                        <div className="font-bold text-[#0b1c30]">{prod.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {prod.sku ? `SKU: ${prod.sku} | ` : ''} Stok: {prod.stock} | HPP: Rp {formatNumber(prod.purchasePrice || prod.buyPrice || 0)}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-500 text-center">
                      {isProductsLoading ? 'Mencari...' : 'Produk tidak ditemukan'}
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId.message}</p>}
          </div>

          {selectedProduct && (
            <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#3755c3]/20">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#76777d]">Stok Saat Ini:</span>
                <span className="font-bold text-[#0b1c30]">{selectedProduct.stock} {selectedProduct.unit}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#76777d]">Harga Beli (HPP):</span>
                <span className="font-bold text-[#0b1c30]">Rp {formatNumber(purchasePrice)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Jumlah Rusak / Hilang *</label>
              <input
                type="number"
                step="any"
                {...register('quantity')}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Alasan / Keterangan *</label>
            <textarea
              {...register('reason')}
              rows={3}
              placeholder="Contoh: Barang kadaluwarsa, kemasan rusak, hilang di gudang..."
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 resize-none"
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-[#76777d]">Total Kerugian:</span>
            <span className="text-lg font-bold text-[#ba1a1a]">Rp {formatNumber(lossAmount)}</span>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-[#76777d] font-bold text-[13px] hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || !selectedProduct}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-[13px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Catat Kerugian'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
