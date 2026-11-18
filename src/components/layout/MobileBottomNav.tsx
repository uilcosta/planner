'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  PiggyBank,
  Calendar,
  Tag,
  Building2,
  Settings,
  Plus,
  ChevronDown,
  X,
} from 'lucide-react';

const mainNavigation = [
  { name: 'Início', href: '/', icon: LayoutDashboard },
  { name: 'Lançamentos', href: '/lancamentos', icon: CreditCard },
  { name: 'Contas', href: '/contas', icon: Wallet },
  { name: 'Mais', href: '#mais', icon: Settings },
];

const moreItems = [
  { name: 'Nova caixinha', href: '/caixinhas', icon: PiggyBank, action: true },
  { name: 'Caixinhas', href: '/caixinhas', icon: PiggyBank },
  { name: 'Planejamento', href: '/planejamento', icon: Calendar },
  { name: 'Categorias', href: '/categorias', icon: Tag },
  { name: 'Instituições', href: '/instituicoes', icon: Building2 },
  { name: 'Preferências', href: '/preferencias', icon: Settings },
];

interface MobileBottomNavProps {
  onNewLaunch: () => void;
}

export function MobileBottomNav({ onNewLaunch }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMaisActive = pathname.startsWith('/caixinhas') || pathname.startsWith('/planejamento') || pathname.startsWith('/categorias') || pathname.startsWith('/instituicoes') || pathname.startsWith('/preferencias');

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around bg-mobile-nav-bg/95 backdrop-blur-md border-t border-mobile-nav-border"
        aria-label="Navegação móvel"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {mainNavigation.map((item) => {
          const isActive = item.href === '#mais' ? isMaisActive : (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href === '#mais' ? '#' : item.href}
              onClick={() => item.href === '#mais' && setMoreOpen(true)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors min-w-[60px]',
                isActive ? 'text-primary' : 'text-text-muted'
              )}
              aria-current={isActive && item.href !== '#mais' ? 'page' : undefined}
              aria-label={item.name}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Botão Novo Lançamento flutuante acima da nav */}
        <button
          type="button"
          onClick={onNewLaunch}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-60 h-12 w-12 rounded-full bg-primary text-on-primary shadow-xl flex items-center justify-center transition-all hover:shadow-2xl hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Novo lançamento"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      </nav>

      {/* Mais Panel - Bottom Sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col" role="dialog" aria-label="Mais opções">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity duration-200"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col animate-slide-up"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h2 className="text-lg font-semibold text-text">Mais opções</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-background transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Novo Lançamento como primeira ação */}
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                onNewLaunch();
              }}
              className="flex items-center gap-3 px-4 py-3 text-base font-medium text-primary hover:bg-background transition-colors border-b border-border"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              <span>Novo lançamento</span>
            </button>

            {/* Lista de itens */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1" aria-label="Mais opções">
              {moreItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text hover:bg-background'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-text-muted')} aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}