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
  Menu,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Lançamentos', href: '/lancamentos', icon: CreditCard },
  { name: 'Contas', href: '/contas', icon: Wallet },
  { name: 'Caixinhas', href: '/caixinhas', icon: PiggyBank },
  { name: 'Planejamento', href: '/planejamento', icon: Calendar },
];

const moreNavigation = [
  { name: 'Categorias', href: '/categorias', icon: Tag },
  { name: 'Instituições', href: '/instituicoes', icon: Building2 },
  { name: 'Preferências', href: '/preferencias', icon: Settings },
];

interface SidebarRailProps {
  onOpenDrawer: () => void;
}

export function SidebarRail({ onOpenDrawer }: SidebarRailProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <aside
      className="bg-sidebar-bg border-sidebar-border fixed top-0 left-0 z-50 flex hidden h-screen w-18 flex-col border-r transition-all duration-300 md:block"
      aria-label="Menu lateral compacto"
      style={{ height: '100vh' }}
    >
      {/* Logo compacto */}
      <Link
        href="/"
        className="border-sidebar-border flex h-16 items-center justify-center border-b"
        aria-label="Meu Planner Financeiro - Início"
      >
        <div className="from-primary to-primary-hover shadow-primary/25 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
          <Wallet className="text-on-primary h-5 w-5" aria-hidden="true" />
        </div>
      </Link>

      {/* Navigation rail */}
      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-4"
        aria-label="Navegação principal"
      >
        {mainNavigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all duration-200',
                'focus-visible:ring-primary focus-visible:ring-offset-sidebar-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-sidebar-active border-sidebar-active-border text-sidebar-icon-active border shadow-sm'
                  : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.name}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon'
                )}
                aria-hidden="true"
              />
              <span className="hidden">{item.name}</span>
            </Link>
          );
        })}

        {/* Mais button */}
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all duration-200',
            'focus-visible:ring-primary focus-visible:ring-offset-sidebar-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            moreOpen
              ? 'bg-sidebar-active text-sidebar-icon-active'
              : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
          )}
          aria-label={moreOpen ? 'Fechar mais opções' : 'Abrir mais opções'}
          aria-expanded={moreOpen}
        >
          <Settings
            className="h-5 w-5 flex-shrink-0 transition-transform duration-200"
            style={{ transform: moreOpen ? 'rotate(90deg)' : 'none' }}
            aria-hidden="true"
          />
          <span className="hidden">Mais</span>
        </button>
      </nav>

      {/* Bottom: Menu button to open drawer */}
      <div className="border-sidebar-border shrink-0 border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenDrawer}
          aria-label="Abrir menu completo"
          className="h-10 w-full rounded-lg"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      {/* Mais dropdown popover */}
      {moreOpen && (
        <div className="bg-sidebar-bg border-sidebar-border animate-slide-up absolute top-0 left-full z-50 h-screen w-56 rounded-r-xl border shadow-xl">
          <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-4">
            <span className="text-sidebar-text font-semibold">Mais opções</span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="text-sidebar-icon hover:text-sidebar-icon-active hover:bg-sidebar-hover rounded-lg p-1"
              aria-label="Fechar mais opções"
            >
              <ChevronRight className="h-5 w-5 rotate-90" />
            </button>
          </div>
          <nav className="space-y-1 p-3" aria-label="Mais opções">
            {moreNavigation.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-active border-sidebar-active-border text-sidebar-icon-active border'
                      : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon'
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
}
