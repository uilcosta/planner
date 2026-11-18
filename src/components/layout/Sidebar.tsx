'use client';

import { useState, useEffect } from 'react';
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
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Plus,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute, useAuth } from '@/components/auth/ProtectedRoute';
import { signOut } from '@/app/actions/auth/signOut';

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

export function Sidebar({ collapsed, onToggleCollapsed, onClose }: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  if (isLoading) {
    return (
      <aside className="lg:w-64 w-16 fixed top-0 left-0 h-screen bg-sidebar-bg border-r border-sidebar-border z-50 flex flex-col">
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'lg:relative z-50 flex min-h-screen max-h-screen flex-col bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 ease-out',
        'fixed top-0 left-0 lg:static lg:sticky lg:top-0',
        collapsed ? 'w-16' : 'w-64',
      )}
      aria-label="Menu principal"
      style={{ height: '100vh' }}
    >
      {/* Logo / Brand */}
      <div className={cn('flex h-16 items-center justify-between px-4 border-b border-sidebar-border shrink-0', collapsed && 'justify-center')}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5" aria-label="Meu Planner Financeiro - Início">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25">
              <Wallet className="h-5 w-5 text-on-primary" aria-hidden="true" />
            </div>
            <span className="font-bold text-lg text-sidebar-text">Meu Planner</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            'p-2 rounded-lg text-sidebar-icon hover:text-sidebar-icon-active hover:bg-sidebar-hover transition-all duration-200 flex-shrink-0'
          )}
          aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 min-h-0" aria-label="Navegação principal">
        {/* Main items */}
        {mainNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg',
                isActive
                  ? 'bg-sidebar-active border border-sidebar-active-border text-sidebar-icon-active shadow-sm'
                  : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text',
                collapsed && 'justify-center px-2'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0 transition-colors', isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon')} aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}

        {/* Mais section */}
        {!collapsed && (
          <>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-sidebar-text-muted uppercase tracking-wider">
                Mais
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={cn(
                  'p-1 rounded-lg text-sidebar-icon hover:text-sidebar-icon-active hover:bg-sidebar-hover transition-all duration-200',
                  moreOpen && 'rotate-90'
                )}
                aria-label={moreOpen ? 'Fechar mais opções' : 'Abrir mais opções'}
                aria-expanded={moreOpen}
              >
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              </button>
            </div>
            <div className={cn('space-y-1 overflow-hidden transition-all duration-200', moreOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0')}>
              {moreNavigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg',
                      isActive
                        ? 'bg-sidebar-active border border-sidebar-active-border text-sidebar-icon-active shadow-sm'
                        : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0 transition-colors', isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon')} aria-hidden="true" />
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
              'flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg',
              moreOpen ? 'bg-sidebar-active text-sidebar-icon-active' : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
            )}
            aria-label={moreOpen ? 'Fechar mais opções' : 'Abrir mais opções'}
            aria-expanded={moreOpen}
            title={moreOpen ? 'Fechar mais opções' : 'Mais opções'}
          >
            <Settings className="h-5 w-5 flex-shrink-0 transition-transform duration-200" style={{ transform: moreOpen ? 'rotate(90deg)' : 'none' }} aria-hidden="true" />
          </button>
        )}

        {/* Mais dropdown when collapsed */}
        {collapsed && moreOpen && (
          <div className="absolute left-full top-16 z-50 w-48 bg-sidebar-bg border border-sidebar-border rounded-xl shadow-xl py-2 animate-slide-up">
            {moreNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-active border-l-2 border-primary text-sidebar-icon-active'
                      : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-sidebar-icon-active' : 'text-sidebar-icon')} aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User menu / Bottom */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25">
              <User className="h-4.5 w-4.5 text-on-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-text truncate">{user.email}</p>
              <p className="text-xs text-sidebar-text-muted truncate">Planner Financeiro</p>
            </div>
          </div>
        )}
        <form action={handleSignOut} className={cn(collapsed && 'flex justify-center')}>
          <button
            type="submit"
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text transition-all duration-200',
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