import React, { useEffect, useState } from 'react';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { WebBanner } from '@/stores/settingsStore';
import { Store, Image, CheckCircle, XCircle, Plus, Trash2, GripVertical, Info, Save, Loader2, Search } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import * as Tabs from '@radix-ui/react-tabs';
import * as Switch from '@radix-ui/react-switch';

export default function WebSettingsPage() {
  const { products, fetchProducts, toggleWebVisibility, isLoading: productsLoading } = useProductStore();
  const { webSettings, fetchStoreSettings, updateWebSettings, isLoading: settingsLoading } = useSettingsStore();
  
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Banner state
  const [description, setDescription] = useState('');
  const [banners, setBanners] = useState<WebBanner[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchStoreSettings();
  }, [fetchProducts, fetchStoreSettings]);

  useEffect(() => {
    if (webSettings) {
      setDescription(webSettings.description || '');
      setBanners(webSettings.banners || []);
    }
  }, [webSettings]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    await toggleWebVisibility(id, isVisible);
  };

  const handleAddBanner = () => {
    const newBanner: WebBanner = {
      id: Date.now().toString(),
      imageUrl: '',
      linkUrl: '',
      isActive: true
    };
    setBanners([...banners, newBanner]);
  };

  const handleUpdateBanner = (id: string, field: keyof WebBanner, value: any) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleRemoveBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSaveMessage('');
    try {
      await updateWebSettings({
        description,
        banners
      });
      setSaveMessage('Pengaturan web berhasil disimpan!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Gagal menyimpan pengaturan.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <PageContainer title="Pengaturan Toko Online">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex border-b border-slate-200 px-4 pt-2">
            <Tabs.Trigger 
              value="products" 
              className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'products' 
                  ? 'border-[#254222] text-[#254222]' 
                  : 'border-transparent text-slate-500 hover:text-[#254222] hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Store size={20} />
              Etalase Produk
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="banners"  
              className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'banners' 
                  ? 'border-[#254222] text-[#254222]' 
                  : 'border-transparent text-slate-500 hover:text-[#254222] hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Image size={20} />
              Banner & Tampilan
            </Tabs.Trigger>
          </Tabs.List>

          {/* TAB 1: ETALASE PRODUK */}
          <Tabs.Content value="products" className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#254222]">Manajemen Etalase</h2>
                <p className="text-sm text-slate-500 mt-1">Pilih produk mana saja yang ingin ditampilkan di katalog web.</p>
              </div>
              
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari nama atau SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#99cc66] focus:border-transparent outline-none text-sm transition-all"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Produk</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Kategori</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Harga Jual</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Stok</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Tampil di Web</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {productsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        <Loader2 className="animate-spin mx-auto mb-2 text-[#254222]" size={24} />
                        Memuat data produk...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Tidak ada produk yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#254222]">{product.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{product.category || '-'}</td>
                        <td className="py-3 px-4 text-sm font-medium text-[#254222] text-right">
                          Rp {product.sellingPrice?.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${
                            product.stock > 10 ? 'bg-[#cae4c5] text-[#254222]' : 
                            product.stock > 0 ? 'bg-orange-100 text-orange-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock} {product.unit || 'pcs'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Switch.Root
                            checked={product.showOnWeb}
                            onCheckedChange={(checked) => handleToggleVisibility(product.id, checked)}
                            className={`w-11 h-6 rounded-full relative transition-colors ${
                              product.showOnWeb ? 'bg-[#254222]' : 'bg-slate-300'
                            }`}
                          >
                            <Switch.Thumb
                              className={`block w-5 h-5 bg-white rounded-full transition-transform transform ${
                                product.showOnWeb ? 'translate-x-5' : 'translate-x-1'
                              } shadow-sm mt-0.5`}
                            />
                          </Switch.Root>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Tabs.Content>

          {/* TAB 2: BANNER & TAMPILAN */}
          <Tabs.Content value="banners" className="p-6">
            <div className="max-w-3xl">
              <h2 className="text-lg font-bold text-[#254222] mb-1">Pengaturan Tampilan Web</h2>
              <p className="text-sm text-slate-500 mb-6">Atur kalimat sambutan dan pasang banner promosi untuk pelanggan Anda.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Pesan Sambutan (Teks Banner Utama)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Selamat datang di Frema Mart! Dapatkan promo menarik setiap harinya..."
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#99cc66] focus:border-transparent outline-none text-sm min-h-[100px] resize-y"
                  />
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Info size={14} /> Teks ini akan muncul di bagian paling atas halaman Web Katalog.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-slate-700">
                      Banner Promosi (Gambar Slider)
                    </label>
                    <button
                      onClick={handleAddBanner}
                      className="text-xs font-bold bg-[#ece2b1] text-[#254222] px-3 py-1.5 rounded-lg hover:bg-[#e4d79a] transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Tambah Banner
                    </button>
                  </div>

                  {banners.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                      <Image className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-sm text-slate-600 font-medium">Belum ada banner</p>
                      <p className="text-xs text-slate-500 mt-1">Klik "Tambah Banner" untuk memasukkan URL gambar promosi Anda.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {banners.map((banner, index) => (
                        <div key={banner.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex gap-4 items-start">
                          <div className="mt-2 text-slate-400 cursor-move" title="Drag to reorder (Coming soon)">
                            <GripVertical size={20} />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">URL Gambar (Wajib)</label>
                              <input
                                type="url"
                                value={banner.imageUrl}
                                onChange={(e) => handleUpdateBanner(banner.id, 'imageUrl', e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#99cc66] focus:border-transparent outline-none text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch.Root
                                checked={banner.isActive}
                                onCheckedChange={(checked) => handleUpdateBanner(banner.id, 'isActive', checked)}
                                className={`w-9 h-5 rounded-full relative transition-colors ${
                                  banner.isActive ? 'bg-[#99cc66]' : 'bg-slate-300'
                                }`}
                              >
                                <Switch.Thumb
                                  className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                                    banner.isActive ? 'translate-x-4' : 'translate-x-0.5'
                                  } shadow-sm mt-0.5`}
                                />
                              </Switch.Root>
                              <span className="text-xs text-slate-600 font-medium">{banner.isActive ? 'Aktif' : 'Nonaktif'}</span>
                            </div>
                          </div>
                          <div className="w-24 h-16 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {banner.imageUrl ? (
                              <img src={banner.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                              }} />
                            ) : (
                              <Image size={24} className="text-slate-300" />
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveBanner(banner.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus banner"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-200 flex items-center gap-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="bg-[#254222] hover:bg-[#1b3119] text-[#ece2b1] px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-70"
                  >
                    {isSavingSettings ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Simpan Pengaturan
                  </button>
                  
                  {saveMessage && (
                    <span className={`text-sm font-medium flex items-center gap-1 ${
                      saveMessage.includes('berhasil') ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {saveMessage.includes('berhasil') ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {saveMessage}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </PageContainer>
  );
}
