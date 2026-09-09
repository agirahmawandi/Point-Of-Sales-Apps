import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import ProductGrid from '../components/ProductGrid';
import CartPanel from '../components/CartPanel';
import OnlineOrderModal from '../components/OnlineOrderModal';
import { ArrowLeft, Clock, Store, Globe } from 'lucide-react';

export default function POSTerminalPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { transactionType, setTransactionType, onlineDetails } = useCartStore();
  const [time, setTime] = useState(new Date());
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Fetch products and categories when POS loads
    useProductStore.getState().fetchCategories();
    useProductStore.getState().fetchProducts();
    
    return () => clearInterval(timer);
  }, []);

  const handleSelectOnline = () => {
    setTransactionType('online');
    setIsOnlineModalOpen(true);
  };

  const handleSelectOffline = () => {
    setTransactionType('offline');
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 font-sans">
      {/* Top Header */}
      <div className="h-14 bg-[#254222] text-white flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-md z-10 border-b border-[#cae4c5]/20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 hover:bg-[#1b3119] rounded-xl transition-colors text-[#ece2b1] hover:text-white flex items-center gap-1.5"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-semibold hidden md:inline">Dashboard</span>
          </button>
          <div className="h-4 w-[1px] bg-[#cae4c5]/30 hidden sm:block"></div>
          <span className="font-bold text-sm tracking-tight font-heading text-[#ece2b1] hidden lg:inline-block">FREMA MART POS</span>

          {/* Mode Transaksi: Offline vs Online */}
          <div className="flex items-center bg-[#1b3119] p-1 rounded-xl border border-[#cae4c5]/30 text-xs shadow-inner">
            <button
              type="button"
              onClick={handleSelectOffline}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                transactionType === 'offline'
                  ? 'bg-[#99cc66] text-[#254222] shadow-sm'
                  : 'text-[#ece2b1]/80 hover:text-[#ece2b1]'
              }`}
            >
              <Store size={14} />
              <span>Transaksi Offline</span>
            </button>
            <button
              type="button"
              onClick={handleSelectOnline}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                transactionType === 'online'
                  ? 'bg-[#99cc66] text-[#254222] shadow-sm'
                  : 'text-[#ece2b1]/80 hover:text-[#ece2b1]'
              }`}
            >
              <Globe size={14} />
              <span>Transaksi Online</span>
              {transactionType === 'online' && onlineDetails && (
                <span className="w-2 h-2 rounded-full bg-[#ece2b1] animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-2 text-[#ece2b1] text-xs">
            <Clock size={15} className="text-[#99cc66]" />
            <span className="font-mono">{time.toLocaleTimeString('id-ID')} WIB</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-[#ece2b1]/80">Kasir:</span>
            <span className="font-bold bg-[#ece2b1] text-[#254222] px-2.5 py-1 rounded-lg shadow-sm">{user?.name || 'Kasir'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Products (60%) */}
        <div className="w-[60%] flex flex-col z-0 relative shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] border-r border-slate-200">
          <ProductGrid />
        </div>

        {/* Right Side: Cart (40%) */}
        <div className="w-[40%] flex flex-col z-10 relative bg-white">
          <CartPanel onOpenOnlineModal={() => setIsOnlineModalOpen(true)} />
        </div>
      </div>

      {/* Popup Form Data Pesanan Online */}
      <OnlineOrderModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
      />
    </div>
  );
}
