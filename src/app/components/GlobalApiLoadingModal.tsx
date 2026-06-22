import React, { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { API_LOADING_EVENT, getPendingApiRequests } from '../lib/api';

interface ApiLoadingEventDetail {
  pending: number;
  loading: boolean;
}

export const GlobalApiLoadingModal = () => {
  const [visible, setVisible] = useState(getPendingApiRequests() > 0);

  useEffect(() => {
    const onLoadingChange = (event: Event) => {
      const customEvent = event as CustomEvent<ApiLoadingEventDetail>;
      setVisible(Boolean(customEvent.detail?.loading));
    };

    window.addEventListener(API_LOADING_EVENT, onLoadingChange as EventListener);
    return () => window.removeEventListener(API_LOADING_EVENT, onLoadingChange as EventListener);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl">
        <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
        <div className="text-sm font-medium text-slate-800">Carregando dados...</div>
      </div>
    </div>
  );
};
