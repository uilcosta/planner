'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_LIMIT = 2;
const TOAST_REMOVE_DELAY = 1000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...options, id };
    setToasts((prev) => [...prev.slice(-TOAST_LIMIT + 1), newToast]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[800] flex flex-col gap-2 md:w-[380px] max-w-[calc(100vw-32px)] pointer-events-none"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const typeStyles = {
    success: 'border-positive-border bg-positive-bg',
    error: 'border-negative-border bg-negative-bg',
    warning: 'border-warning-border bg-warning-bg',
    info: 'border-primary/20 bg-primary/5',
    loading: 'border-primary/20 bg-primary/5',
  };

  const iconComponents = {
    success: <CheckCircle className="h-5 w-5 text-positive" />,
    error: <AlertCircle className="h-5 w-5 text-negative" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    info: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
    loading: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), TOAST_REMOVE_DELAY);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'pointer-events-auto card p-4 shadow-lg animate-slide-up',
        typeStyles[toast.type],
        'flex items-start gap-3'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{iconComponents[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-text-muted mt-1">{toast.description}</p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action!.onClick();
              handleDismiss();
            }}
            className="mt-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-lg text-text-muted hover:text-text hover:bg-background transition-colors"
        aria-label="Dispensar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Hook helpers for common toast patterns
export function useToastHelpers() {
  const { toast, dismiss, dismissAll } = useToast();

  const success = useCallback((title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    return toast({ type: 'success', title, description, action, duration: 5000 });
  }, [toast]);

  const error = useCallback((title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    return toast({ type: 'error', title, description, action, duration: 8000 });
  }, [toast]);

  const warning = useCallback((title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    return toast({ type: 'warning', title, description, action, duration: 6000 });
  }, [toast]);

  const info = useCallback((title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    return toast({ type: 'info', title, description, action, duration: 5000 });
  }, [toast]);

  const loading = useCallback((title: string, description?: string) => {
    return toast({ type: 'loading', title, description, duration: Infinity });
  }, [toast]);

  return { toast, dismiss, dismissAll, success, error, warning, info, loading };
}