import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProductStore } from '@/stores/productStore';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  sku: z.string().min(3, 'SKU minimal 3 karakter'),
  categoryId: z.string().min(1, 'Kategori harus dipilih'),
  purchasePrice: z.coerce.number().min(0, 'Harga beli tidak boleh negatif'),
  sellingPrice: z.coerce.number().min(0, 'Harga jual tidak boleh negatif'),
  stock: z.coerce.number().min(0, 'Stok awal tidak boleh negatif'),
  minStock: z.coerce.number().min(0, 'Batas minimum stok tidak boleh negatif'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, isLoading, fetchCategories, addProduct, updateProduct } = useProductStore();
  
  const isEditMode = Boolean(id);
  const existingProduct = isEditMode ? products.find(p => p.id === id) : null;

  const [imageBase64, setImageBase64] = useState<string>(existingProduct?.imageUrl || '');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      categoryId: '',
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 10,
      description: '',
      imageUrl: '',
    }
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isEditMode && existingProduct) {
      reset({
        name: existingProduct.name,
        sku: existingProduct.sku,
        categoryId: existingProduct.categoryId,
        purchasePrice: existingProduct.purchasePrice || existingProduct.buyPrice || 0,
        sellingPrice: existingProduct.sellingPrice || existingProduct.sellPrice || 0,
        stock: existingProduct.stock,
        minStock: existingProduct.minStock,
        description: existingProduct.description || '',
        imageUrl: existingProduct.imageUrl || '',
      });
      setImageBase64(existingProduct.imageUrl || '');
    }
  }, [isEditMode, existingProduct, reset]);

  const purchasePrice = watch('purchasePrice') || 0;
  const sellingPrice = watch('sellingPrice') || 0;
  
  // Calculate margin
  const marginAmt = sellingPrice - purchasePrice;
  const marginPct = purchasePrice > 0 ? (marginAmt / purchasePrice) * 100 : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('Ukuran gambar maksimal 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
        setValue('imageUrl', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageBase64('');
    setValue('imageUrl', '');
  };

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitError(null);
    const finalData = { ...data, imageUrl: imageBase64 };
    
    try {
      if (isEditMode && id) {
        await updateProduct(id, finalData);
      } else {
        await addProduct(finalData);
      }
      navigate('/products');
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan saat menyimpan produk.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/products')}
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#0b1c30] hover:bg-[#eff4ff] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
            {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h1>
          <p className="text-[14px] text-[#45464d] mt-0.5">Lengkapi formulir detail inventaris dan harga produk</p>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-[16px] font-bold text-[#0b1c30] mb-4">Informasi Dasar Produk</h2>
          
          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-[13px] font-semibold text-[#0b1c30] mb-2">Foto Produk (Opsional)</label>
            <div className="flex items-start gap-4">
              {imageBase64 ? (
                <div className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden shrink-0 group">
                  <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button" 
                      onClick={removeImage}
                      className="p-1.5 bg-white text-red-500 rounded-full hover:scale-110 transition-transform"
                      title="Hapus foto"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon size={32} strokeWidth={1.5} />
                </div>
              )}
              
              <div className="flex-1">
                <p className="text-xs text-[#76777d] mb-2">
                  Pilih foto produk yang jelas. Format yang didukung: JPG, PNG. Ukuran maksimal 1MB.
                </p>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#cae4c5] bg-[#cae4c5]/20 text-[#254222] text-xs font-bold hover:bg-[#cae4c5]/40 transition-colors pointer-events-none">
                    <Upload size={14} />
                    <span>Upload Foto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Nama Produk *</label>
              <input
                {...register('name')}
                type="text"
                disabled={isLoading}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] shadow-sm placeholder-[#76777d] focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all disabled:bg-slate-50"
                placeholder="Contoh: Indomie Goreng Spesial"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
            </div>
            
            <div>
              <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">SKU / Kode Barang *</label>
              <input
                {...register('sku')}
                type="text"
                disabled={isLoading}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] shadow-sm placeholder-[#76777d] focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all font-mono disabled:bg-slate-50"
                placeholder="Contoh: SKU-001"
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1.5">{errors.sku.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Kategori *</label>
              <select
                {...register('categoryId')}
                disabled={isLoading}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] shadow-sm bg-white focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all disabled:bg-slate-50"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1.5">{errors.categoryId.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Deskripsi Produk</label>
              <textarea
                {...register('description')}
                rows={3}
                disabled={isLoading}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] shadow-sm placeholder-[#76777d] focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all resize-none disabled:bg-slate-50"
                placeholder="Deskripsi singkat atau catatan produk..."
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-[16px] font-bold text-[#0b1c30] mb-4">Pengaturan Harga & Stok</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Harga Beli / Modal (Rp) *</label>
              <input
                {...register('purchasePrice')}
                type="number"
                min="0"
                disabled={isLoading}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all disabled:bg-slate-50"
              />
              {errors.purchasePrice && <p className="text-red-500 text-xs mt-1.5">{errors.purchasePrice.message}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Harga Jual Konsumen (Rp) *</label>
              <input
                {...register('sellingPrice')}
                type="number"
                min="0"
                disabled={isLoading}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all font-semibold disabled:bg-slate-50"
              />
              {errors.sellingPrice && <p className="text-red-500 text-xs mt-1.5">{errors.sellingPrice.message}</p>}
            </div>

            {/* Margin Info Box */}
            <div className="col-span-2 p-4 bg-[#eff4ff]/60 rounded-xl border border-[#d3e4fe]/60 flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#45464d]">Estimasi Margin Keuntungan per Unit:</span>
              <span className={`text-[15px] font-bold ${marginPct > 0 ? 'text-[#3755c3]' : 'text-[#76777d]'}`}>
                Rp {new Intl.NumberFormat('id-ID').format(marginAmt)} ({marginPct.toFixed(1)}%)
              </span>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Stok Awal *</label>
              <input
                {...register('stock')}
                type="number"
                min="0"
                disabled={isLoading}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all disabled:bg-slate-50"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1.5">{errors.stock.message}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#0b1c30] mb-1.5">Batas Minimum Peringatan Stok *</label>
              <input
                {...register('minStock')}
                type="number"
                min="0"
                disabled={isLoading}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all disabled:bg-slate-50"
              />
              {errors.minStock && <p className="text-red-500 text-xs mt-1.5">{errors.minStock.message}</p>}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/products')}
            disabled={isLoading}
            className="h-10 px-5 rounded-xl bg-white text-[#0b1c30] border border-slate-200 shadow-sm hover:bg-[#eff4ff] font-semibold text-[13px] transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="h-10 px-6 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] disabled:bg-[#3755c3]/70 text-white font-semibold text-[13px] shadow-sm flex items-center gap-2 transition-all"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan Produk'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
