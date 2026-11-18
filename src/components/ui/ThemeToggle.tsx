'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border" role="group" aria-label="Selecionar tema">
      {(['light', 'dark', 'system'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          className={cn(
            'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            theme === t
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-text-muted hover:text-text hover:bg-background'
          )}
          aria-pressed={theme === t}
          aria-label={t === 'light' ? 'Tema claro' : t === 'dark' ? 'Tema escuro' : 'Sistema'}
        >
          {t === 'light' && <Sun className="h-4 w-4" aria-hidden="true" />}
          {t === 'dark' && <Moon className="h-4 w-4" aria-hidden="true" />}
          {t === 'system' && <Monitor className="h-4 w-4" aria-hidden="true" />}
          <span className="hidden sm:inline">
            {t === 'light' && 'Claro'}
            {t === 'dark' && 'Escuro'}
            {t === 'system' && 'Sistema'}
          </span>
        </button>
      ))}
    </div>
  );
}

export function ThemeToggleSimple() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={resolvedTheme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      title={resolvedTheme === 'dark' ? 'Tema escuro (clique para mudar)' : 'Tema claro (clique para mudar)'}
      className="rounded-lg h-9 w-9"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5 text-warning" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}