import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  BarChart3, 
  Settings, 
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LogOut,
  ClipboardCheck,
  Boxes,
  Tags,
  FileText,
  PackageCheck,
  Users,
  Receipt,
  Tag,
  TrendingUp,
  ShoppingBag,
  Archive,
  CreditCard,
  PieChart,
  Store,
  Terminal,
  Bell,
  Landmark,
  ArrowLeftRight,
  Building2,
  UserCheck,
  History,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import * as Collapsible from '@radix-ui/react-collapsible';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, sidebarCollapsed, toggleSidebarCollapse } = useUiStore();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const toggleMenu = (menu: string) => {
    if (sidebarCollapsed) {
      toggleSidebarCollapse();
    }
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isKasir = user?.role === 'kasir';

  const menuItems = [
    { title: 'Terminal POS', icon: Terminal, path: '/pos', badge: 'KASIR' },
    {
      title: 'Produk & Stok',
      icon: Boxes,
      submenu: [
        { title: 'Daftar Produk', icon: Boxes, path: '/products' },
        { title: 'Kategori', icon: Tags, path: '/products/categories' },
        { title: 'Stok Opname', icon: ClipboardCheck, path: '/products/stock-opname' },
      ]
    },
    {
      title: 'Sales',
      icon: Receipt,
      submenu: [
        { title: 'List Penjualan', icon: Receipt, path: '/sales' },
        { title: 'List Pelanggan', icon: Users, path: '/sales/customers' },
      ]
    },
    ...(!isKasir ? [{
      title: 'Pembelian',
      icon: ShoppingBag,
      badge: 'PO',
      badgeStyle: 'text',
      submenu: [
        { title: 'Purchase Order', icon: FileText, path: '/purchases' },
        { title: 'Penerimaan Barang', icon: PackageCheck, path: '/purchases/receive' },
        { title: 'Pemasok', icon: Users, path: '/purchases/suppliers' },
      ]
    }] : []),
    ...(!isKasir ? [{
      title: 'Pengeluaran',
      icon: Wallet,
      submenu: [
        { title: 'Daftar Pengeluaran', icon: Receipt, path: '/expenses' },
        { title: 'Kategori Beban', icon: Tag, path: '/expenses/categories' },
      ]
    }] : []),
    ...(!isKasir ? [{
      title: 'Keuangan',
      icon: Landmark,
      submenu: [
        { title: 'Histori Transaksi', icon: History, path: '/finance/history' },
        { title: 'Pindah Saldo', icon: ArrowLeftRight, path: '/finance/transfer' },
        { title: 'Daftar Bank', icon: Building2, path: '/finance/banks' },
        { title: 'Investor', icon: UserCheck, path: '/finance/investors' },
        { title: 'Bagi Hasil', icon: PieChart, path: '/finance/profit-share' },
      ]
    }] : []),
    {
      title: 'Laporan',
      icon: BarChart3,
      submenu: isKasir
        ? [{ title: 'Penjualan', icon: TrendingUp, path: '/reports/sales' }]
        : [
            { title: 'Penjualan', icon: TrendingUp, path: '/reports/sales' },
            { title: 'Pembelian', icon: ShoppingBag, path: '/reports/purchases' },
            { title: 'Inventaris', icon: Archive, path: '/reports/inventory' },
            { title: 'Pengeluaran', icon: CreditCard, path: '/reports/expenses' },
            { title: 'Laba Rugi', icon: PieChart, path: '/reports/profit-loss' },
          ]
    }
  ];

  const isSubmenuActive = (submenu: { path: string }[]) => {
    return submenu.some(sub => location.pathname === sub.path || location.pathname.startsWith(sub.path + '/'));
  };

  const rowClass = "flex items-center w-full py-3 rounded-xl hover:bg-white/10 transition-all duration-150 text-[#cae4c5]/80 text-[15px] font-medium outline-none";
  const activeClass = "bg-[#99cc66] text-[#254222] font-bold hover:bg-[#99cc66]";

  return (
    <aside
      className={cn(
        "bg-[#254222] h-screen shrink-0 z-50 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out",
        "fixed md:relative",
        sidebarCollapsed ? "md:w-[88px]" : "md:w-[280px]",
        isSidebarOpen ? "w-[280px] translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Header Logo */}
      <div className={cn("p-6 pb-4 flex items-center shrink-0", sidebarCollapsed ? "justify-center px-4" : "justify-between")}>
        <Link to="/" className={cn("flex items-center gap-4 group cursor-pointer hover:opacity-90 transition-opacity", sidebarCollapsed ? "justify-center" : "w-full")}>
          <div className="w-10 h-10 bg-[#99cc66] rounded-[10px] flex items-center justify-center text-[#254222] shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Store size={22} strokeWidth={2.5} />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-white text-[18px] tracking-tight truncate leading-none mb-1">Frema Mart</span>
              <span className="text-[12px] text-[#cae4c5]/70 truncate leading-none font-medium">Retail Management OS</span>
            </div>
          )}
        </Link>
        {!sidebarCollapsed && (
          <button 
            onClick={(e) => { e.preventDefault(); toggleSidebarCollapse(); }} 
            className="hidden md:block text-[#cae4c5]/70 hover:text-white transition-colors"
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>

      {/* Collapse Button when collapsed (shown below logo) */}
      {sidebarCollapsed && (
        <div className="flex justify-center mb-2">
          <button 
            onClick={(e) => { e.preventDefault(); toggleSidebarCollapse(); }} 
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-[#cae4c5]/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <PanelLeftOpen size={20} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className={cn("flex-1 overflow-y-auto py-4 scrollbar-hide space-y-1", sidebarCollapsed ? "px-2" : "px-4")}>
        {menuItems.map((item, idx) => (
          <div key={idx}>
            {item.submenu ? (
              <Collapsible.Root
                open={!sidebarCollapsed && !!openMenus[item.title]}
                onOpenChange={() => toggleMenu(item.title)}
              >
                <Collapsible.Trigger
                  className={cn(
                    rowClass, 
                    "group", 
                    sidebarCollapsed ? "justify-center px-0" : "justify-between px-4",
                    isSubmenuActive(item.submenu) && "text-[#ece2b1] font-semibold"
                  )}
                  title={sidebarCollapsed ? item.title : undefined}
                >
                  <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-4")}>
                    <item.icon size={22} className={cn("text-[#cae4c5]/80", isSubmenuActive(item.submenu) && "text-[#ece2b1]")} />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-3">
                      {item.badge && (
                        <span className={item.badgeStyle === 'text' ? "text-[#cae4c5] text-[12px] font-bold uppercase" : "px-2 py-0.5 rounded-md bg-[#ece2b1] text-[#254222] text-[11px] font-bold uppercase tracking-wide"}>
                          {item.badge}
                        </span>
                      )}
                      {openMenus[item.title]
                        ? <ChevronUp size={18} className="text-[#cae4c5]/70" />
                        : <ChevronDown size={18} className="text-[#cae4c5]/70" />}
                    </div>
                  )}
                </Collapsible.Trigger>

                {!sidebarCollapsed && (
                  <Collapsible.Content className="pt-1 pb-2 space-y-1">
                    {item.submenu.map((sub, sidx) => (
                      <NavLink
                        key={sidx}
                        to={sub.path}
                        className={({ isActive }) => cn(
                          "flex items-center gap-4 pl-[3.25rem] pr-4 py-2.5 rounded-xl text-[14px] transition-colors",
                          isActive
                            ? "text-[#254222] font-bold bg-[#99cc66]"
                            : "text-[#cae4c5]/80 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span>{sub.title}</span>
                      </NavLink>
                    ))}
                  </Collapsible.Content>
                )}
              </Collapsible.Root>
            ) : (
              <NavLink
                to={item.path!}
                end={item.path === '/'}
                className={({ isActive }) => cn(
                  rowClass, 
                  "group", 
                  sidebarCollapsed ? "justify-center px-0" : "justify-between px-4", 
                  isActive && activeClass
                )}
                title={sidebarCollapsed ? item.title : undefined}
              >
                {({ isActive }) => (
                  <>
                    <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-4")}>
                      <item.icon size={22} className={cn(isActive ? "text-[#254222]" : "text-[#cae4c5]/80")} />
                      {!sidebarCollapsed && <span>{item.title}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-3">
                        {item.badge && (
                          <span className={item.badgeStyle === 'text' ? "text-[#cae4c5] text-[12px] font-bold uppercase" : "px-2 py-0.5 rounded-md bg-[#ece2b1] text-[#254222] text-[11px] font-bold uppercase tracking-wide"}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight size={18} className="text-[#254222]" />}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            )}
          </div>
        ))}

        {/* Settings */}
        {!isKasir && (
          <>
            <div className="my-4 mx-2 border-t border-white/10" />
            <Collapsible.Root
              open={!sidebarCollapsed && !!openMenus['Pengaturan']}
              onOpenChange={() => toggleMenu('Pengaturan')}
            >
              <Collapsible.Trigger
                className={cn(
                  rowClass, 
                  "group", 
                  sidebarCollapsed ? "justify-center px-0" : "justify-between px-4",
                  isSubmenuActive([{path: '/settings'}]) && "text-[#ece2b1]"
                )}
                title={sidebarCollapsed ? "Pengaturan" : undefined}
              >
                <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-4")}>
                  <Settings size={22} className={cn("text-[#cae4c5]/80", isSubmenuActive([{path: '/settings'}]) && "text-[#ece2b1]")} />
                  {!sidebarCollapsed && <span>Pengaturan</span>}
                </div>
                {!sidebarCollapsed && (
                  <>
                    {openMenus['Pengaturan']
                      ? <ChevronUp size={18} className="text-[#cae4c5]/70" />
                      : <ChevronDown size={18} className="text-[#cae4c5]/70" />}
                  </>
                )}
              </Collapsible.Trigger>

              {!sidebarCollapsed && (
                <Collapsible.Content className="pt-1 pb-2 space-y-1">
                  <NavLink
                    to="/settings/store"
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 pl-[3.25rem] pr-4 py-2.5 rounded-xl text-[14px] transition-colors",
                      isActive
                        ? "text-[#254222] font-bold bg-[#99cc66]"
                        : "text-[#cae4c5]/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span>Profil Toko</span>
                  </NavLink>
                  <NavLink
                    to="/settings/tax"
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 pl-[3.25rem] pr-4 py-2.5 rounded-xl text-[14px] transition-colors",
                      isActive
                        ? "text-[#254222] font-bold bg-[#99cc66]"
                        : "text-[#cae4c5]/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span>Pajak & Biaya</span>
                  </NavLink>
                  <NavLink
                    to="/settings/payments"
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 pl-[3.25rem] pr-4 py-2.5 rounded-xl text-[14px] transition-colors",
                      isActive
                        ? "text-[#254222] font-bold bg-[#99cc66]"
                        : "text-[#cae4c5]/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span>Metode Pembayaran</span>
                  </NavLink>
                  <NavLink
                    to="/settings/users"
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 pl-[3.25rem] pr-4 py-2.5 rounded-xl text-[14px] transition-colors",
                      isActive
                        ? "text-[#254222] font-bold bg-[#99cc66]"
                        : "text-[#cae4c5]/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span>Manajemen Pengguna</span>
                  </NavLink>
                </Collapsible.Content>
              )}
            </Collapsible.Root>
          </>
        )}
      </nav>

      {/* Footer — User Info */}
      <div className={cn("p-4 bg-[#1b3119] rounded-2xl mx-4 mb-4 flex items-center border border-white/10 shadow-sm", sidebarCollapsed ? "justify-center mx-2 p-2 flex-col gap-3" : "justify-between")}>
        <div className={cn("flex items-center min-w-0", sidebarCollapsed ? "justify-center" : "gap-3")}>
          <div className="w-[40px] h-[40px] rounded-full bg-[#99cc66] text-[#254222] flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
            {user?.name?.charAt(0)?.toUpperCase() || 'F'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-[14px] font-bold text-white truncate leading-tight">{user?.name || 'Admin Frema'}</span>
              <span className="text-[11px] text-[#cae4c5]/70 uppercase font-bold tracking-wider mt-1">{user?.role || 'SUPER ADMIN'}</span>
            </div>
          )}
        </div>
        
        <div className={cn("flex items-center shrink-0", sidebarCollapsed ? "flex-col gap-4 mt-2" : "gap-3 ml-2")}>
          {!sidebarCollapsed && (
            <button className="text-[#cae4c5]/70 hover:text-white transition-colors relative" title="Notifications">
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#e11d48] rounded-full flex items-center justify-center border-2 border-[#1b3119] text-[9px] font-bold text-white">3</div>
              <Bell size={18} />
            </button>
          )}
          <button
            onClick={logout}
            className="text-[#cae4c5]/70 hover:text-[#99cc66] transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

