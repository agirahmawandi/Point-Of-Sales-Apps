import React from 'react';
import { AppRouter } from './routes';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}
