import React from 'react';
import { Menu, Search, Bell, Plus, Calendar, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function TopBar() {
  const { toggleSidebar } = useUiStore();
  const { user } = useAuthStore();
  const location = useLocation();

  // Comprehensive breadcrumb mapping
  const getBreadcrumb = (path: string) => {
    const staticMap: Record<string, { parent: string, current: string }> = {
      '/': { parent: 'Dashboard', current: 'Overview' },
      '/products': { parent: 'Produk & Stok', current: 'Daftar Produk' },
      '/products/new': { parent: 'Produk & Stok', current: 'Tambah Produk' },
      '/products/categories': { parent: 'Produk & Stok', current: 'Kategori' },
      '/products/stock-opname': { parent: 'Produk & Stok', current: 'Stok Opname' },
      '/pos': { parent: 'Terminal POS', current: 'Kasir' },
      '/pos/history': { parent: 'Terminal POS', current: 'Riwayat Transaksi' },
      '/purchases': { parent: 'Pembelian', current: 'Purchase Order' },
      '/purchases/new': { parent: 'Pembelian', current: 'Buat PO Baru' },
      '/purchases/receive': { parent: 'Pembelian', current: 'Penerimaan Barang' },
      '/purchases/suppliers': { parent: 'Pembelian', current: 'Pemasok' },
      '/expenses': { parent: 'Keuangan', current: 'Pengeluaran Operasional' },
      '/expenses/categories': { parent: 'Keuangan', current: 'Kategori Beban' },
      '/reports/sales': { parent: 'Laporan', current: 'Laporan Penjualan' },
      '/reports/purchases': { parent: 'Laporan', current: 'Laporan Pembelian' },
      '/reports/inventory': { parent: 'Laporan', current: 'Laporan Inventaris' },
      '/reports/expenses': { parent: 'Laporan', current: 'Laporan Pengeluaran' },
      '/reports/profit-loss': { parent: 'Laporan', current: 'Laporan Laba Rugi' },
      '/settings/store': { parent: 'Pengaturan', current: 'Profil Toko' },
      '/settings/tax': { parent: 'Pengaturan', current: 'Pengaturan Pajak' },
      '/settings/payments': { parent: 'Pengaturan', current: 'Metode Pembayaran' },
      '/settings/users': { parent: 'Pengaturan', current: 'Manajemen Pengguna' },
    };

    if (staticMap[path]) return staticMap[path];
    if (path === '/pos/sales') return { parent: 'Terminal POS', current: 'List Penjualan' };
    if (path.startsWith('/products/') && path.endsWith('/edit')) return { parent: 'Produk & Stok', current: 'Edit Produk' };
    if (path.startsWith('/purchases/') && path.endsWith('/receive')) return { parent: 'Pembelian', current: 'Penerimaan Barang' };
    if (path.startsWith('/purchases/')) return { parent: 'Pembelian', current: 'Detail PO' };
    if (path.startsWith('/pos/receipt/')) return { parent: 'Terminal POS', current: 'Struk Transaksi' };

    return { parent: 'Frema Mart', current: 'Overview' };
  };
  
  const currentPath = getBreadcrumb(location.pathname);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-[#cae4c5]/40 shadow-[0_1px_8px_rgba(37,66,34,0.04)] z-40 flex items-center justify-between px-4 lg:px-6 sticky top-0">
      <div className="flex items-center gap-4 lg:gap-6">
        <button onClick={toggleSidebar} className="md:hidden text-[#254222] hover:text-[#1b3119]">
          <Menu size={24} />
        </button>
        
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-2 text-sm text-[#45464d]">
          <span className="font-medium">{currentPath.parent}</span>
          <ChevronRight size={14} className="text-[#c6c6cd]" />
          <span className="font-semibold text-[#254222]">{currentPath.current}</span>
        </nav>

        {/* Global Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 text-[#76777d]" size={18} />
          <input 
            type="text" 
            className="h-10 w-64 lg:w-80 rounded-xl bg-[#cae4c5]/25 pl-9 pr-14 text-sm text-[#254222] placeholder:text-[#76777d] border border-[#cae4c5]/50 focus:outline-none focus:ring-1 focus:ring-[#99cc66] focus:border-[#99cc66] transition-all"
            placeholder="Cari pesanan, SKU, atau pelanggan..." 
          />
          <div className="absolute right-2 flex items-center gap-1 rounded bg-[#cae4c5]/50 px-1.5 py-0.5 text-[#254222] text-[11px] font-bold uppercase">
            Ctrl+K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#cae4c5]/30 border border-[#cae4c5]/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#99cc66] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#99cc66]"></span>
          </span>
          <span className="text-sm font-semibold text-[#254222]">Toko Buka (Kasir Aktif)</span>
        </div>

        {/* Date */}
        <div className="hidden md:flex items-center gap-1.5 text-[#45464d] text-sm">
          <Calendar size={18} />
          <span>Jumat, 4 Sep 2026</span>
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 rounded-xl text-[#254222] hover:bg-[#cae4c5]/30 transition-colors">
          <Bell size={22} />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold">3</span>
        </button>

        {/* Add Transaction Button */}
        <Link to="/pos" className="hidden sm:flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#99cc66] hover:bg-[#88bb55] text-[#254222] font-bold text-sm transition-colors shadow-sm">
          <Plus size={20} />
          <span>Transaksi</span>
        </Link>

        {/* Profile Avatar (Mobile fallback menu via avatar) */}
        <div className="flex items-center">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_QnUe87L64m95KO7T6h2_0J2cIyrb2zN-nuyY2vKZRE1GcFIVRnsF4MwlH1T278p_YfSfw9SbOQz-vfWxSI3i-9yUrdUyzoLJz5FVz1P2VPaQ6JZS82qfBHZ6aBV0NKQB2OcWurNJp8XyPmGHgkEjCoEuBkwH1HWf8Ar7UHpuTQVIFvqQFsIpLPvCc90-Z_k_53yUjZRgvOqWS8hV9tDP1sd07u_ylrPfjAjVh-hxecSFoqfipt3-" 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover shadow-sm cursor-pointer border border-[#cae4c5]"
            onError={(e) => {
              // Fallback to text avatar if image fails
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-8 h-8 rounded-full bg-[#99cc66] flex items-center justify-center text-[#254222] font-bold text-xs cursor-pointer shadow-inner">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
