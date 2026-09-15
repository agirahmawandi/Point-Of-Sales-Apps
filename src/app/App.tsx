import React, { useEffect } from 'react';
import { AppRouter } from './routes';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useAuthStore } from '@/stores/authStore';
import { Toaster } from 'sonner';

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  // Sinkronisasi session Supabase saat app pertama kali dibuka
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ErrorBoundary>
      <AppRouter />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            fontSize: '13px',
          },
        }}
      />
    </ErrorBoundary>
  );
}
