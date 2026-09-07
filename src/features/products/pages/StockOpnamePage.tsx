import React, { useState, useMemo } from 'react';
import { useProductStore } from '@/stores/productStore';
import PageContainer from '@/components/layout/PageContainer';
import { Save, RotateCcw, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StockOpnamePage() {
  const { products, updateProduct } = useProductStore();
  const [rows, setRows] = useState<Record<string, number | ''>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [saved, setSaved] = useState(false);

  const filteredProducts = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]);

  const handleChange = (id: string, value: string) => {
    setSaved(false);
    const num = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    setRows(prev => ({ ...prev, [id]: num }));
  };

  const getDiff = (productId: string, systemStock: number) => {
    const val = rows[productId];
    if (val === '' || val === undefined) return null;
    return (val as number) - systemStock;
  };

  const handleSave = () => {
    let updated = 0;
    Object.entries(rows).forEach(([id, physical]) => {
      if (physical !== '' && physical !== undefined) {
        updateProduct(id, { stock: physical as number });
        updated++;
      }
    });
    if (updated > 0) {
      setSaved(true);
      setRows({});
    }
  };

  const handleReset = () => {
    setRows({});
    setSaved(false);
  };

  const changedCount = Object.values(rows).filter(v => v !== '').length;

  return (
    <PageContainer 
      title="Stok Opname" 
      description="Sesuaikan stok sistem dengan jumlah fisik aktual barang di toko atau gudang."
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={changedCount === 0}
            className="h-10 px-4 rounded-xl bg-white text-[#0b1c30] border border-slate-200/80 shadow-sm hover:bg-[#eff4ff] text-[13px] font-semibold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={changedCount === 0}
            className="h-10 px-5 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            <span>Simpan ({changedCount})</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {saved && (
          <div className="flex items-center gap-3 p-4 bg-[#e6f4ea] border border-[#a8dab5] rounded-xl text-[#137333] font-semibold text-sm shadow-sm">
            <CheckCircle2 size={18} />
            <span>Stok berhasil diperbarui berdasarkan hasil opname fisik!</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-[#eff4ff] bg-white">
            <div className="relative max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={18} />
              <input
                type="text"
                placeholder="Cari nama atau SKU produk..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#eff4ff] text-[13px] text-[#0b1c30] placeholder-[#76777d] border border-transparent focus:outline-none focus:bg-white focus:border-[#3755c3]/30 focus:ring-2 focus:ring-[#3755c3]/15 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                  <th className="py-3.5 px-5">SKU</th>
                  <th className="py-3.5 px-5">Nama Produk</th>
                  <th className="py-3.5 px-5 text-center">Stok Sistem</th>
                  <th className="py-3.5 px-5 text-center">Stok Fisik</th>
                  <th className="py-3.5 px-5 text-center">Selisih</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff] text-[13px]">
                {filteredProducts.map(product => {
                  const diff = getDiff(product.id, product.stock);
                  const hasInput = rows[product.id] !== undefined && rows[product.id] !== '';

                  let statusEl = <span className="text-slate-300 text-xs">—</span>;
                  if (hasInput) {
                    if (diff === 0) {
                      statusEl = <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#137333] bg-[#e6f4ea] px-2.5 py-1 rounded-lg uppercase">Cocok</span>;
                    } else if (diff! > 0) {
                      statusEl = <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3755c3] bg-[#d3e4fe] px-2.5 py-1 rounded-lg uppercase">Lebih</span>;
                    } else {
                      statusEl = <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2.5 py-1 rounded-lg uppercase">Kurang</span>;
                    }
                  }

                  return (
                    <tr key={product.id} className={`hover:bg-[#eff4ff]/40 transition-colors ${hasInput ? 'bg-[#eff4ff]/20' : ''}`}>
                      <td className="px-5 py-3.5 text-[#76777d] font-mono text-xs">{product.sku}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#0b1c30]">{product.name}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-bold text-[#0b1c30]">{product.stock}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <input
                          type="number"
                          min={0}
                          value={rows[product.id] ?? ''}
                          onChange={e => handleChange(product.id, e.target.value)}
                          placeholder="—"
                          className="w-20 text-center h-8 px-2 rounded-lg border border-slate-200 text-sm font-bold text-[#0b1c30] bg-white focus:outline-none focus:border-[#3755c3] focus:ring-2 focus:ring-[#3755c3]/20 transition-all hide-spin-button"
                        />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {hasInput ? (
                          <span className={`font-bold text-sm ${diff === 0 ? 'text-[#76777d]' : diff! > 0 ? 'text-[#3755c3]' : 'text-[#ba1a1a]'}`}>
                            {diff! > 0 ? `+${diff}` : diff}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">{statusEl}</td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#76777d]">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredProducts.length > 0 && (
            <div className="px-5 py-3 border-t border-[#eff4ff] bg-[#eff4ff]/30 text-xs text-[#76777d]">
              Menampilkan {filteredProducts.length} produk • Isi kolom <span className="font-semibold text-[#0b1c30]">Stok Fisik</span> lalu klik <span className="font-semibold text-[#3755c3]">Simpan</span> untuk memperbarui stok.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
