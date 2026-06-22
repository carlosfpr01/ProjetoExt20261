import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { GlobalApiLoadingModal } from './components/GlobalApiLoadingModal';
import { ConfirmationProvider } from './context/ConfirmationContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ConfirmationProvider>
          <Toaster richColors position="top-right" closeButton />
          <GlobalApiLoadingModal />
          <RouterProvider router={router} />
        </ConfirmationProvider>
      </DataProvider>
    </AuthProvider>
  );
}
