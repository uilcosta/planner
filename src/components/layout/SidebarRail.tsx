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
  Plus,
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
      className="hidden md:block fixed top-0 left-0 z-50 h-screen w-16 bg-sidebar-bg border-r border-sidebar-border flex flex-col transition-all duration-300"
      aria-label="Menu lateral compacto"
      style={{ height: '100vh' }}
    >
      {/* Logo compacto */}
      <Link href="/" className="flex h-16 items-center justify-center border-b border-sidebar-border" aria-label="Meu Planner Financeiro - Início">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25">
          <Wallet className="h-5 w-5 text-on-primary" aria-hidden="true" />
        </div>
      </Link>

      {/* Navigation rail */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 min-h-0" aria-label="Navegação principal">
        {mainNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg',
                isActive
                  ? 'bg-sidebar-active border border-sidebar-active-border text-sidebar-icon-active shadow-sm'
                  : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.name}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0 transition-colors', isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon')} aria-hidden="true" />
              <span className="hidden">{item.name}</span>
            </Link>
          );
        })}

        {/* Mais button */}
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className={cn(
            'flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg',
            moreOpen ? 'bg-sidebar-active text-sidebar-icon-active' : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
          )}
          aria-label={moreOpen ? 'Fechar mais opções' : 'Abrir mais opções'}
          aria-expanded={moreOpen}
        >
          <Settings className="h-5 w-5 flex-shrink-0 transition-transform duration-200" style={{ transform: moreOpen ? 'rotate(90deg)' : 'none' }} aria-hidden="true" />
          <span className="hidden">Mais</span>
        </button>
      </nav>

      {/* Bottom: Menu button to open drawer */}
      <div className="p-2 border-t border-sidebar-border shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenDrawer}
          aria-label="Abrir menu completo"
          className="w-full h-10 rounded-lg"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      {/* Mais dropdown popover */}
      {moreOpen && (
        <div className="absolute left-full top-0 z-50 w-56 bg-sidebar-bg border border-sidebar-border rounded-r-xl shadow-xl h-screen animate-slide-up">
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <span className="font-semibold text-sidebar-text">Mais opções</span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="p-1 rounded-lg text-sidebar-icon hover:text-sidebar-icon-active hover:bg-sidebar-hover"
              aria-label="Fechar mais opções"
            >
              <ChevronRight className="h-5 w-5 rotate-90" />
            </button>
          </div>
          <nav className="p-3 space-y-1" aria-label="Mais opções">
            {moreNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-active border border-sidebar-active-border text-sidebar-icon-active'
                      : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon')} aria-hidden="true" />
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