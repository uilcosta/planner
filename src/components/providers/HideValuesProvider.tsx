'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface HideValuesContextType {
  hidden: boolean;
  toggle: () => void;
  setHidden: (hidden: boolean) => void;
}

const HideValuesContext = createContext<HideValuesContextType | undefined>(undefined);

export function HideValuesProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem('hideValues');
    if (stored === 'true') {
      setHidden(true);
    }
  }, []);

  const toggle = () => {
    const newValue = !hidden;
    setHidden(newValue);
    if (mounted) {
      sessionStorage.setItem('hideValues', String(newValue));
    }
  };

  const setHiddenValue = (value: boolean) => {
    setHidden(value);
    if (mounted) {
      sessionStorage.setItem('hideValues', String(value));
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <HideValuesContext.Provider value={{ hidden, toggle, setHidden: setHiddenValue }}>
      {children}
    </HideValuesContext.Provider>
  );
}

export function useHideValues() {
  const context = useContext(HideValuesContext);
  if (context === undefined) {
    throw new Error('useHideValues must be used within a HideValuesProvider');
  }
  return context;
}