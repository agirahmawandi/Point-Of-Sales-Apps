import React, { useMemo, useState } from 'react';
import { useProductStore } from '@/stores/productStore';
import PageContainer from '@/components/layout/PageContainer';
import { Download, PackageOpen, AlertTriangle, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function InventoryReportPage() {
  const { products, categories } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalAssetValue = products.reduce((acc, p) => acc + (p.stock * (p.sellingPrice || 0)), 0);
  
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const totalLowStock = lowStockProducts.length;

  // Chart data: Asset value by category
  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    products.forEach(p => {
      const cat = categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized';
      grouped[cat] = (grouped[cat] || 0) + (p.stock * (p.sellingPrice || 0));
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .filter(item => item.value > 0); // Only categories with assets
  }, [products, categories]);

  const COLORS = ['#3755c3', '#99cc66', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.stock - b.stock); // Sort by lowest stock first

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
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[#76777d] mb-2">
            <Wallet size={18} />
            <span className="text-[13px] font-medium">Total Nilai Aset</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-[#0b1c30] mb-6">Nilai Aset per Kategori</h3>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                Data kategori kosong
              </div>
            )}
          </div>
        </div>

        {/* Snapshot Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
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
                  <th className="py-3 px-5 text-right">Harga Jual</th>
                  <th className="py-3 px-5 text-center">Stok</th>
                  <th className="py-3 px-5 text-center">Min. Stok</th>
                  <th className="py-3 px-5 text-right">Nilai Aset</th>
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
                        {formatCurrency(p.sellingPrice || 0)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${isLow ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e6f4ea] text-[#137333]'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-slate-500 font-medium">
                        {p.minStock}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-[#3755c3]">
                        {formatCurrency(p.stock * (p.sellingPrice || 0))}
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
            </table>
          </div>
          {filteredProducts.length > 15 && (
            <div className="p-4 border-t border-slate-100 text-center">
              <span className="text-[12px] text-slate-500">Menampilkan 15 item dengan stok terendah. Gunakan fitur Ekspor Excel untuk melihat seluruh data.</span>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
