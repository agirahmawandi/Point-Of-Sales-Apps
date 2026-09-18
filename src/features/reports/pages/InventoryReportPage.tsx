import React, { useMemo, useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types/product';
import { Download, PackageOpen, AlertTriangle, Wallet, Loader2 } from 'lucide-react';


export default function InventoryReportPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockReport, setStockReport] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes, stockRes] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('categories').select('*'),
          supabase.rpc('get_stock_report')
        ]);
        
        if (prodRes.error) throw prodRes.error;
        if (catRes.error) throw catRes.error;
        if (stockRes.error) console.error('Error fetching stock report:', stockRes.error);

        // Map snake_case to camelCase
        const mappedProducts = (prodRes.data as any[]).map(p => ({
          ...p,
          categoryId: p.category_id,
          sellingPrice: p.sell_price,
          buyPrice: p.buy_price,
          minStock: p.min_stock
        }));

        setProducts(mappedProducts as Product[] || []);
        setCategories(catRes.data as Category[] || []);
        setStockReport(stockRes.data || []);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalAssetValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.sellingPrice || 0)), 0);
  
  const lowStockProducts = products.filter(p => (p.stock || 0) <= (p.minStock || 0));
  const totalLowStock = lowStockProducts.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const filteredProducts = products.filter(p => {
    const nameMatch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const skuMatch = (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || skuMatch;
  }).sort((a, b) => (a.stock || 0) - (b.stock || 0)); // Sort by lowest stock first

  return (
    <PageContainer
      title="Laporan Inventaris"
      description="Analisis nilai aset barang dan pemantauan stok produk."
      actions={
        <button className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#0b1c30] text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2">
          <Download size={16} />
          <span>Ekspor Excel</span>
        </button>
      }
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl mt-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#3755c3]" />
        </div>
      )}
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[#76777d] mb-2">
            <Wallet size={18} />
            <span className="text-[13px] font-medium">Total Nilai Aset (Harga Jual)</span>
          </div>
          <h3 className="text-xl font-bold text-[#0b1c30]">{formatCurrency(totalAssetValue)}</h3>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[#76777d] mb-2">
            <PackageOpen size={18} />
            <span className="text-[13px] font-medium">Total Item Barang</span>
          </div>
          <h3 className="text-xl font-bold text-[#0b1c30]">{totalProducts} <span className="text-sm font-normal text-slate-500">SKU</span></h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[#76777d] mb-2">
            <PackageOpen size={18} />
            <span className="text-[13px] font-medium">Kuantitas Fisik</span>
          </div>
          <h3 className="text-xl font-bold text-[#0b1c30]">{totalStock} <span className="text-sm font-normal text-slate-500">Pcs</span></h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center bg-gradient-to-br from-white to-[#fff0f0]">
          <div className="flex items-center gap-2 text-[#ba1a1a] mb-2">
            <AlertTriangle size={18} />
            <span className="text-[13px] font-medium">Stok Rendah</span>
          </div>
          <h3 className="text-xl font-bold text-[#ba1a1a]">{totalLowStock} <span className="text-sm font-normal text-slate-500">Item kritis</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Snapshot Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h3 className="text-base font-bold text-[#0b1c30]">Snapshot Stok Saat Ini</h3>
            <input 
              type="text" 
              placeholder="Cari produk (Nama / SKU)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-[13px] focus:outline-none focus:border-[#3755c3] w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                  <th className="py-3 px-5">Produk</th>
                  <th className="py-3 px-5 text-right">Harga Beli</th>
                  <th className="py-3 px-5 text-right">Harga Jual</th>
                  <th className="py-3 px-5 text-center">Stok</th>
                  <th className="py-3 px-5 text-right">Nilai Aset (Harga Jual)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredProducts.slice(0, 15).map(p => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0b1c30]">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.sku}</div>
                      </td>
                      <td className="px-5 py-3 text-right text-[#0b1c30] font-medium">
                        {formatCurrency(p.buyPrice || 0)}
                      </td>
                      <td className="px-5 py-3 text-right text-[#0b1c30] font-medium">
                        {formatCurrency(p.sellingPrice || 0)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${isLow ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e6f4ea] text-[#137333]'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-[#3755c3]">
                        {formatCurrency((p.stock || 0) * (p.sellingPrice || 0))}
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                      Tidak ada data produk ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-100">
                <tr>
                  <td colSpan={4} className="px-5 py-4 text-right font-bold text-[#0b1c30]">
                    Total Nilai Keseluruhan Aset
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-[#3755c3]">
                    {formatCurrency(totalAssetValue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {filteredProducts.length > 15 && (
            <div className="p-4 border-t border-slate-100 text-center">
              <span className="text-[12px] text-slate-500">Menampilkan 15 item dengan stok terendah. Gunakan fitur Ekspor Excel untuk melihat seluruh data.</span>
            </div>
          )}
        </div>

        {/* Laporan Stok Barang Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h3 className="text-base font-bold text-[#0b1c30]">Laporan Stok Barang (Pembelian vs Penjualan)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                  <th className="py-3 px-5">Produk</th>
                  <th className="py-4 px-5 text-center text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Stok Pembelian</th>
                  <th className="py-4 px-5 text-center text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Stok Penjualan</th>
                  <th className="py-4 px-5 text-center text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Produk Rusak</th>
                  <th className="py-4 px-5 text-center text-[11px] font-bold text-[#76777d] uppercase tracking-wider">Sisa Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {stockReport.length > 0 ? (
                  stockReport.map(item => (
                    <tr key={item.product_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0b1c30]">{item.product_name}</div>
                        <div className="text-[11px] text-slate-500">{item.sku}</div>
                      </td>
                      <td className="px-5 py-3 text-center text-[#0b1c30] font-medium">
                        {item.total_purchased}
                      </td>
                      <td className="px-5 py-3 text-center text-[#ba1a1a] font-medium">
                        {item.total_sold}
                      </td>
                      <td className="px-5 py-3 text-center text-orange-600 font-medium">
                        {item.total_write_offs || 0}
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-[#3755c3]">
                        {item.current_stock}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                      Data stok belum tersedia. (Jalankan query get_stock_report di database)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
