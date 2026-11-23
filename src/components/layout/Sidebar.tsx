'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  Calendar,
  Tag,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Wallet,
} from 'lucide-react';
import { signOut } from '@/app/actions/auth/signOut';
import { useAuth } from '@/components/auth/ProtectedRoute';

const handleSignOut = async () => {
  await signOut();
};

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

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  onClose,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  if (isLoading) {
    return (
      <aside className="bg-sidebar-bg border-sidebar-border fixed top-0 left-0 z-50 flex h-screen w-16 flex-col border-r lg:w-64">
        <div className="border-sidebar-border flex h-16 items-center justify-center border-b">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-3 border-t-transparent" />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'bg-sidebar-bg border-sidebar-border z-50 flex max-h-screen min-h-screen flex-col border-r transition-all duration-300 ease-out lg:relative',
        'fixed top-0 left-0 lg:static lg:sticky lg:top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Menu principal"
      style={{ height: '100vh' }}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          'border-sidebar-border flex h-16 shrink-0 items-center justify-between border-b px-4',
          collapsed && 'justify-center'
        )}
      >
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Meu Planner Financeiro - Início"
          >
            <div className="from-primary to-primary-hover shadow-primary/25 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
              <Wallet className="text-on-primary h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-sidebar-text text-lg font-bold">Meu Planner</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            'text-sidebar-icon hover:text-sidebar-icon-active hover:bg-sidebar-hover flex-shrink-0 rounded-lg p-2 transition-all duration-200'
          )}
          aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Navegação principal"
      >
        {/* Main items */}
        {mainNavigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'focus-visible:ring-primary focus-visible:ring-offset-sidebar-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-sidebar-active border-sidebar-active-border text-sidebar-icon-active border shadow-sm'
                  : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text',
                collapsed && 'justify-center px-2'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon'
                )}
                aria-hidden="true"
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}

        {/* Mais section */}
        {!collapsed && (
          <>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sidebar-text-muted text-xs font-semibold tracking-wider uppercase">
                Mais
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={cn(
                  'text-sidebar-icon hover:text-sidebar-icon-active hover:bg-sidebar-hover rounded-lg p-1 transition-all duration-200',
                  moreOpen && 'rotate-90'
                )}
                aria-label={moreOpen ? 'Fechar mais opções' : 'Abrir mais opções'}
                aria-expanded={moreOpen}
              >
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              </button>
            </div>
            <div
              className={cn(
                'space-y-1 overflow-hidden transition-all duration-200',
                moreOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              {moreNavigation.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      'focus-visible:ring-primary focus-visible:ring-offset-sidebar-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      isActive
                        ? 'bg-sidebar-active border-sidebar-active-border text-sidebar-icon-active border shadow-sm'
                        : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-colors',
                        isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon'
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Collapsed: Mais as single button */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 transition-all duration-200',
              'focus-visible:ring-primary focus-visible:ring-offset-sidebar-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              moreOpen
                ? 'bg-sidebar-active text-sidebar-icon-active'
                : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
            )}
            aria-label={moreOpen ? 'Fechar mais opções' : 'Abrir mais opções'}
            aria-expanded={moreOpen}
            title={moreOpen ? 'Fechar mais opções' : 'Mais opções'}
          >
            <Settings
              className="h-5 w-5 flex-shrink-0 transition-transform duration-200"
              style={{ transform: moreOpen ? 'rotate(90deg)' : 'none' }}
              aria-hidden="true"
            />
          </button>
        )}

        {/* Mais dropdown when collapsed */}
        {collapsed && moreOpen && (
          <div className="bg-sidebar-bg border-sidebar-border animate-slide-up absolute top-16 left-full z-50 w-48 rounded-xl border py-2 shadow-xl">
            {moreNavigation.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-active border-primary text-sidebar-icon-active border-l-2'
                      : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon'
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User menu / Bottom */}
      <div className="border-sidebar-border shrink-0 border-t p-3">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <div className="from-primary to-primary-hover shadow-primary/25 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br shadow-lg">
              <User className="text-on-primary h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-text truncate text-sm font-medium">{user.email}</p>
              <p className="text-sidebar-text-muted truncate text-xs">Planner Financeiro</p>
            </div>
          </div>
        )}
        <form action={handleSignOut} className={cn(collapsed && 'flex justify-center')}>
          <button
            type="submit"
            className={cn(
              'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            {!collapsed && <span>Sair</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
