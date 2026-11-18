'use client';

import { useHideValues } from '@/components/providers/HideValuesProvider';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HideValuesToggle() {
  const { hidden, toggle } = useHideValues();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={hidden ? 'Mostrar valores' : 'Ocultar valores'}
      aria-pressed={hidden}
      title={hidden ? 'Valores ocultos (clique para mostrar)' : 'Valores visíveis (clique para ocultar)'}
      className="rounded-lg h-9 w-9"
    >
      {hidden ? (
        <EyeOff className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Eye className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}