import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export default function MainLayout() {
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
