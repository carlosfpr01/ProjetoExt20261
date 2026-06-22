import React, { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type ConfirmationVariant = 'default' | 'danger';

interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
}

interface ConfirmationState extends Required<ConfirmationOptions> {
  open: boolean;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

const initialState: ConfirmationState = {
  open: false,
  title: '',
  description: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'default',
};

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConfirmationState>(initialState);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const closeWithValue = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState(initialState);
  }, []);

  const confirm = useCallback((options: ConfirmationOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({
        open: true,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText ?? 'Confirmar',
        cancelText: options.cancelText ?? 'Cancelar',
        variant: options.variant ?? 'default',
      });
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmationContext.Provider value={value}>
      {children}

      {state.open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">{state.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{state.description}</p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => closeWithValue(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {state.cancelText}
              </button>
              <button
                type="button"
                onClick={() => closeWithValue(true)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                  state.variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};
