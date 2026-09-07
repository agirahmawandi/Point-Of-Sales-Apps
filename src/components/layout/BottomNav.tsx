import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, ShoppingCart, Wallet, Menu, Truck, BarChart3, Settings, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const { user } = useAuthStore();
  const [showMore, setShowMore] = useState(false);
  const isKasir = user?.role === 'kasir';

  return (
    <>
      {/* Bottom Sheet for 'Lainnya' */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMore(false)} />
          <div className="bg-white rounded-t-xl p-4 z-50 animate-in slide-in-from-bottom-full pb-20">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-semibold text-lg">Menu Lainnya</h3>
              <button onClick={() => setShowMore(false)} className="p-1"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {!isKasir && (
                <NavLink to="/purchases" onClick={() => setShowMore(false)} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700"><Truck size={24}/></div>
                  <span className="text-xs">Beli</span>
                </NavLink>
              )}
              <NavLink to="/reports/sales" onClick={() => setShowMore(false)} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700"><BarChart3 size={24}/></div>
                <span className="text-xs">Laporan</span>
              </NavLink>
              {!isKasir && (
                <NavLink to="/settings/store" onClick={() => setShowMore(false)} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700"><Settings size={24}/></div>
                  <span className="text-xs">Setting</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 pb-safe z-50 px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <NavLink to="/" className={({isActive}) => cn("flex flex-col items-center p-2 text-xs", isActive ? "text-blue-600" : "text-slate-500")}>
          <Home size={24} />
          <span>Beranda</span>
        </NavLink>
        <NavLink to="/products" className={({isActive}) => cn("flex flex-col items-center p-2 text-xs", isActive ? "text-blue-600" : "text-slate-500")}>
          <Package size={24} />
          <span>Produk</span>
        </NavLink>
        
        <div className="relative -top-5">
          <NavLink to="/pos" className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg border-4 border-white hover:bg-blue-700 transition-colors">
            <ShoppingCart size={24} />
          </NavLink>
        </div>

        <NavLink to="/expenses" className={({isActive}) => cn("flex flex-col items-center p-2 text-xs", isActive ? "text-blue-600" : "text-slate-500")}>
          <Wallet size={24} />
          <span>Keuangan</span>
        </NavLink>
        <button onClick={() => setShowMore(true)} className={cn("flex flex-col items-center p-2 text-xs", showMore ? "text-blue-600" : "text-slate-500")}>
          <Menu size={24} />
          <span>Lainnya</span>
        </button>
      </nav>
    </>
  );
}
