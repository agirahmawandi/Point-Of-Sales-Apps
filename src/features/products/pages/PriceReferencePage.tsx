import React, { useEffect, useState, useMemo } from 'react';
import { useProductStore } from '@/stores/productStore';
import { Save, Calculator, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import type { Product } from '@/types';

// Utility for rounding up to nearest 500
const roundUp500 = (num: number) => Math.ceil(num / 500) * 500;

export default function PriceReferencePage() {
  const { products, fetchProducts, batchUpdateProducts, isLoading } = useProductStore();
  
  // Local state for table editing
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  
  // Global inputs
  const [globalMargin, setGlobalMargin] = useState<string>('');
  const [globalPacking, setGlobalPacking] = useState<string>('');
  const [globalMarketplaceFee, setGlobalMarketplaceFee] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setLocalProducts([...products]);
  }, [products]);

  // Handle local change in a row
  const handleChange = (id: string, field: string, value: string) => {
    setIsSaved(false);
    const numValue = value === '' ? 0 : Number(value);
    
    setLocalProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      
      const updated = { ...p, [field]: numValue };
      
      // Recalculate prices
      const hpp = updated.purchasePrice || 0;
      const marginPerc = updated.marginPercentage || 0;
      const packing = updated.packingCost || 0;
      const feePerc = updated.marketplaceFeePercentage || 0;

      // Harga Jual Toko = HPP + (HPP * Margin%) + Biaya Packing -> Dibulatkan
      const rawSelling = hpp + (hpp * (marginPerc / 100)) + packing;
      updated.sellingPrice = roundUp500(rawSelling);

      // Harga Jual Marketplace = Harga Jual Toko / (100% - Potongan Marketplace%) -> Dibulatkan
      if (feePerc < 100) {
        const rawMarketplace = updated.sellingPrice / (1 - (feePerc / 100));
        updated.marketplacePrice = roundUp500(rawMarketplace);
      } else {
        updated.marketplacePrice = updated.sellingPrice;
      }

      return updated;
    }));
  };

  // Apply global values to all rows
  const applyGlobalSettings = () => {
    setIsSaved(false);
    const mMargin = globalMargin === '' ? null : Number(globalMargin);
    const mPacking = globalPacking === '' ? null : Number(globalPacking);
    const mFee = globalMarketplaceFee === '' ? null : Number(globalMarketplaceFee);

    setLocalProducts(prev => prev.map(p => {
      const updated = { ...p };
      if (mMargin !== null) updated.marginPercentage = mMargin;
      if (mPacking !== null) updated.packingCost = mPacking;
      if (mFee !== null) updated.marketplaceFeePercentage = mFee;

      const hpp = updated.purchasePrice || 0;
      const marginPerc = updated.marginPercentage || 0;
      const packing = updated.packingCost || 0;
      const feePerc = updated.marketplaceFeePercentage || 0;

      const rawSelling = hpp + (hpp * (marginPerc / 100)) + packing;
      updated.sellingPrice = roundUp500(rawSelling);

      if (feePerc < 100) {
        const rawMarketplace = updated.sellingPrice / (1 - (feePerc / 100));
        updated.marketplacePrice = roundUp500(rawMarketplace);
      } else {
        updated.marketplacePrice = updated.sellingPrice;
      }

      return updated;
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await batchUpdateProducts(localProducts);
      setIsSaved(true);
      setIsEditing(false);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save prices:', error);
      alert('Gagal menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  if (isLoading && localProducts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3755c3]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] tracking-tight flex items-center gap-2">
            <Calculator className="text-[#3755c3]" size={28} />
            Acuan Harga Jual
          </h1>
          <p className="text-sm text-[#76777d] mt-1">
            Simulasikan dan tetapkan harga jual offline & online secara massal
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="h-10 px-6 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#0b1c30] text-[13px] font-bold shadow-sm flex items-center gap-2 transition-colors"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setLocalProducts([...products]); // Revert changes
                }}
                className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#76777d] text-[13px] font-bold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="h-10 px-6 rounded-xl bg-[#3755c3] hover:bg-[#1f3796] text-white text-[13px] font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Global Settings Card - Only show when editing */}
      {isEditing && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <h2 className="text-[13px] font-bold text-[#0b1c30] mb-4 uppercase tracking-wider">Terapkan Secara Massal</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#76777d] mb-1.5">Persentase Margin (%)</label>
              <input
                type="number"
                placeholder="Contoh: 30"
                value={globalMargin}
                onChange={e => setGlobalMargin(e.target.value)}
                className="w-40 h-9 px-3 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#3755c3]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#76777d] mb-1.5">Biaya Packing (Rp)</label>
              <input
                type="number"
                placeholder="Contoh: 1500"
                value={globalPacking}
                onChange={e => setGlobalPacking(e.target.value)}
                className="w-40 h-9 px-3 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#3755c3]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#76777d] mb-1.5">Potongan Marketplace (%)</label>
              <input
                type="number"
                placeholder="Contoh: 10"
                value={globalMarketplaceFee}
                onChange={e => setGlobalMarketplaceFee(e.target.value)}
                className="w-40 h-9 px-3 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#3755c3]"
              />
            </div>
            <button
              onClick={applyGlobalSettings}
              className="h-9 px-4 rounded-lg bg-[#eff4ff] text-[#3755c3] text-[12px] font-bold hover:bg-[#e5eeff] transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Terapkan ke Semua Tabel
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            * Menekan tombol "Terapkan" hanya merubah angka di tabel bawah. Anda tetap harus menekan tombol "Simpan Perubahan" di atas untuk memperbarui sistem kasir.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4 text-right">HPP (Modal)</th>
                <th className="py-3 px-4 text-center">Margin (%)</th>
                <th className="py-3 px-4 text-center">Biaya Packing (Rp)</th>
                <th className="py-3 px-4 text-right bg-[#e5eeff]/50">Harga Jual (Toko)</th>
                <th className="py-3 px-4 text-center">Pot. MP (%)</th>
                <th className="py-3 px-4 text-right bg-[#eefaf2]">Harga Jual (Online)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {localProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-[#0b1c30]">{product.name}</div>
                    <div className="text-[11px] text-[#76777d]">{product.sku}</div>
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-[#76777d]">
                    {formatCurrency(product.purchasePrice || 0)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={product.marginPercentage || ''}
                        onChange={e => handleChange(product.id, 'marginPercentage', e.target.value)}
                        className="w-16 h-8 px-2 border border-slate-200 rounded text-center text-[13px] focus:outline-none focus:border-[#3755c3]"
                      />
                    ) : (
                      <span className="font-medium text-[#0b1c30]">{product.marginPercentage || 0}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={product.packingCost || ''}
                        onChange={e => handleChange(product.id, 'packingCost', e.target.value)}
                        className="w-24 h-8 px-2 border border-slate-200 rounded text-right text-[13px] focus:outline-none focus:border-[#3755c3]"
                      />
                    ) : (
                      <span className="font-medium text-[#0b1c30]">{formatCurrency(product.packingCost || 0)}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-[#0b1c30] bg-[#e5eeff]/30">
                    {formatCurrency(product.sellingPrice || 0)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={product.marketplaceFeePercentage || ''}
                        onChange={e => handleChange(product.id, 'marketplaceFeePercentage', e.target.value)}
                        className="w-16 h-8 px-2 border border-slate-200 rounded text-center text-[13px] focus:outline-none focus:border-[#3755c3]"
                      />
                    ) : (
                      <span className="font-medium text-[#0b1c30]">{product.marketplaceFeePercentage || 0}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-[#1b4d2e] bg-[#eefaf2]/50">
                    {formatCurrency(product.marketplacePrice || 0)}
                  </td>
                </tr>
              ))}
              {localProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#76777d]">
                    Belum ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
