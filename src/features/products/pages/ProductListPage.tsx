import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '@/stores/productStore';
import PageContainer from '@/components/layout/PageContainer';
import { Plus, Search, Edit, Trash2, Package, Loader2 } from 'lucide-react';

export default function ProductListPage() {
  const navigate = useNavigate();
  const { products, categories, isLoading, error, fetchProducts, fetchCategories, deleteProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Unknown';
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await deleteProduct(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus produk');
      }
    }
  };

  return (
    <PageContainer 
      title="Daftar Produk" 
      description="Kelola inventaris, harga jual, dan ketersediaan stok produk toko."
      actions={
        <button
          onClick={() => navigate('/products/new')}
          className="h-10 px-4 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Tambah Produk</span>
        </button>
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100">
            {error}
          </div>
        )}
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[#eff4ff] flex flex-col sm:flex-row gap-4 bg-white">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau SKU produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#eff4ff] text-[13px] text-[#0b1c30] placeholder-[#76777d] border border-transparent focus:outline-none focus:bg-white focus:border-[#3755c3]/30 focus:ring-2 focus:ring-[#3755c3]/15 transition-all"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-52 h-10 px-3.5 rounded-xl bg-white border border-slate-200/80 text-[13px] font-medium text-[#0b1c30] shadow-sm focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
               <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                <th className="py-3.5 px-5">Produk</th>
                <th className="py-3.5 px-5">SKU</th>
                <th className="py-3.5 px-5">Kategori</th>
                <th className="py-3.5 px-5 text-right">Harga Beli</th>
                <th className="py-3.5 px-5 text-right">Harga Jual</th>
                <th className="py-3.5 px-5 text-center">Stok</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff] text-[13px]">
              {isLoading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#76777d]">
                    <Loader2 size={32} className="animate-spin mx-auto mb-2 text-[#3755c3]" />
                    <p className="font-medium text-[#0b1c30]">Memuat produk...</p>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-[#3755c3]/40" />
                          )}
                        </div>
                        <span className="font-semibold text-[#0b1c30]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-[#76777d]">{product.sku}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-[#e5eeff] text-[#0b1c30] text-[11px] font-semibold">
                        {getCategoryName(product.categoryId)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[#76777d]">
                      <span className="text-[11px] mr-1">Rp</span>
                      <span>{formatNumber(product.purchasePrice || product.buyPrice || 0)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#0b1c30]">
                      <span className="text-[11px] font-medium text-[#76777d] mr-1">Rp</span>
                      <span>{formatNumber(product.sellingPrice || product.sellPrice || 0)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {product.stock <= 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold uppercase">
                          Habis (0)
                        </span>
                      ) : product.stock <= product.minStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ffdad6] text-[#93000a] text-[11px] font-bold uppercase">
                          Sisa {product.stock}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#e6f4ea] text-[#137333] text-[11px] font-bold uppercase">
                          {product.stock} unit
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                          disabled={isLoading}
                          className="p-1.5 text-[#76777d] hover:text-[#3755c3] hover:bg-[#eff4ff] rounded-lg transition-colors disabled:opacity-50"
                          title="Edit Produk"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          disabled={isLoading}
                          className="p-1.5 text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Produk"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#76777d]">
                    <Package size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-[#0b1c30]">Tidak ada produk yang ditemukan</p>
                    <p className="text-xs text-[#76777d] mt-1">Coba sesuaikan kata kunci pencarian atau kategori.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
