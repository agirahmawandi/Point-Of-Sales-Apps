import React, { useState } from 'react';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
import { Search, Package } from 'lucide-react';
import type { Product } from '@/types';

export default function ProductGrid() {
  const { products, categories } = useProductStore();
  const { addItem } = useCartStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleProductClick = (product: Product) => {
    if (product.stock > 0) {
      addItem(product.id, product.name, product.sellingPrice || product.sellPrice || 0);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Search & Category Filter */}
      <div className="p-4 bg-white border-b border-[#cae4c5]/40">
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={18} />
          <input
            type="text"
            placeholder="Cari nama produk atau SKU barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#cae4c5]/25 text-[13px] text-[#254222] placeholder-[#76777d] border border-[#cae4c5]/50 focus:outline-none focus:bg-white focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all"
          />
        </div>
        
        <div className="flex overflow-x-auto pb-1 gap-2 snap-x hide-scrollbar">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all ${
              selectedCategory === '' 
                ? 'bg-[#254222] text-[#ece2b1] shadow-sm' 
                : 'bg-[#cae4c5]/35 text-[#254222] hover:bg-[#cae4c5]/60'
            }`}
          >
            Semua Produk
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all ${
                selectedCategory === c.id 
                  ? 'bg-[#254222] text-[#ece2b1] shadow-sm' 
                  : 'bg-[#cae4c5]/35 text-[#254222] hover:bg-[#cae4c5]/60'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Products */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => handleProductClick(product)}
              className={`bg-white rounded-xl shadow-sm border border-slate-100 p-3.5 flex flex-col justify-between transition-all ${
                product.stock > 0 
                  ? 'cursor-pointer hover:shadow-md hover:border-[#99cc66] hover:-translate-y-0.5 active:scale-95' 
                  : 'opacity-50 cursor-not-allowed bg-slate-50'
              }`}
            >
              <div>
                <div className="aspect-square bg-[#cae4c5]/20 rounded-lg mb-2.5 flex items-center justify-center text-[#76777d]">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full rounded-lg" />
                  ) : (
                    <Package size={28} className="text-[#254222]/40" />
                  )}
                </div>
                <h3 className="font-semibold text-[#254222] text-xs line-clamp-2 min-h-[32px] leading-snug">
                  {product.name}
                </h3>
                <p className="text-[10px] font-mono text-[#76777d] mt-0.5">{product.sku}</p>
              </div>
              
              <div className="flex justify-between items-end mt-2 pt-2 border-t border-[#cae4c5]/30">
                <span className="font-bold text-[#254222] text-xs">
                  {formatCurrency(product.sellingPrice || product.sellPrice || 0)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  product.stock > product.minStock ? 'bg-[#cae4c5] text-[#254222]' : 
                  product.stock > 0 ? 'bg-[#ece2b1] text-[#254222]' : 'bg-slate-200 text-slate-600'
                }`}>
                  {product.stock > 0 ? `${product.stock}` : 'Habis'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#76777d]">
            <Package size={44} className="mb-2 text-slate-300" />
            <p className="font-semibold text-[#254222]">Tidak ada produk yang ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
