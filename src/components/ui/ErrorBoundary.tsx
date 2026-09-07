import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-6 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-[#ffdad6] text-[#ba1a1a] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-xl font-bold text-[#0b1c30] mb-2">Terjadi Kesalahan Sistem</h2>
      <p className="text-[14px] text-slate-500 max-w-md mb-6">
        Maaf, komponen ini gagal dimuat karena kesalahan internal. Silakan coba muat ulang atau hubungi administrator.
      </p>
      
      <div className="bg-slate-50 rounded-xl p-4 w-full max-w-lg overflow-auto border border-slate-100 mb-6 text-left">
        <p className="text-xs font-mono text-red-600 font-semibold mb-1">Pesan Error:</p>
        <code className="text-xs text-slate-700 break-words">{(error as Error).message}</code>
      </div>

      <button 
        onClick={resetErrorBoundary}
        className="h-10 px-6 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
      >
        <RefreshCcw size={16} />
        <span>Coba Lagi</span>
      </button>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
