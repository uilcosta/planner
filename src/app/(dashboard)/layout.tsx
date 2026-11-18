'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarRail } from '@/components/layout/SidebarRail';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { HideValuesToggle } from '@/components/ui/HideValuesToggle';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { Button } from '@/components/ui/Button';
import { Plus, Menu, Settings, User, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/auth/signOut';

const handleSignOut = async () => {
  await signOut();
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const savedMonth = localStorage.getItem('selectedMonth');
    const savedYear = localStorage.getItem('selectedYear');
    if (savedMonth && savedYear) {
      setCurrentMonth(parseInt(savedMonth, 10));
      setCurrentYear(parseInt(savedYear, 10));
    } else {
      setCurrentMonth(new Date().getMonth());
      setCurrentYear(new Date().getFullYear());
    }
  }, []);

  // Persist month selection
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('selectedMonth', String(currentMonth));
      localStorage.setItem('selectedYear', String(currentYear));
    }
  }, [currentMonth, currentYear, isMounted]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
  };

  const handleGoToCurrent = () => {
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  };

  const handleNewLaunch = () => {
    // Navegar para lançamentos com modal aberto
    // Por enquanto, apenas navega para a página
    window.location.href = `/lancamentos?new=true&month=${currentMonth + 1}&year=${currentYear}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" aria-hidden="true" />
          <span className="text-sm text-text-muted">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-65 bg-black/50 lg:hidden transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Desktop Sidebar - full */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Tablet Sidebar Rail */}
        <SidebarRail onOpenDrawer={() => setDrawerOpen(true)} />

        {/* Mobile Drawer */}
        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 z-65 bg-black/50 md:hidden transition-opacity duration-200"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 z-70 w-72 bg-sidebar-bg border-r border-sidebar-border md:hidden animate-slide-in" style={{ height: '100vh' }}>
              <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
                <span className="font-semibold text-sidebar-text">Menu</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg text-sidebar-icon hover:text-sidebar-icon-active hover:bg-sidebar-hover"
                  aria-label="Fechar menu"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <nav className="p-3 space-y-1" aria-label="Menu completo">
                {[
                  { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
                  { name: 'Lançamentos', href: '/lancamentos', icon: 'CreditCard' },
                  { name: 'Contas', href: '/contas', icon: 'Wallet' },
                  { name: 'Caixinhas', href: '/caixinhas', icon: 'PiggyBank' },
                  { name: 'Planejamento', href: '/planejamento', icon: 'Calendar' },
                  { name: 'Categorias', href: '/categorias', icon: 'Tag' },
                  { name: 'Instituições', href: '/instituicoes', icon: 'Building2' },
                  { name: 'Preferências', href: '/preferencias', icon: 'Settings' },
                ].map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-sidebar-active border border-sidebar-active-border text-sidebar-icon-active'
                          : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        {item.icon === 'LayoutDashboard' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
                        {item.icon === 'CreditCard' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
                        {item.icon === 'Wallet' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12V7H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v2M9 18v-5l3-3 3 3v5M5 16v3a2 2 0 002 2h10a2 2 0 002-2v-3" />}
                        {item.icon === 'PiggyBank' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M4.165 18.819A12.061 12.061 0 0112 15a12.061 12.061 0 017.835 3.819M10 6h4M7 9h10M9 12h6m-6 0a2 2 0 100-4 2 2 0 000 4zm0 0a2 2 0 110-4 2 2 0 010 4z" />}
                        {item.icon === 'Calendar' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                        {item.icon === 'Tag' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />}
                        {item.icon === 'Building2' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                        {item.icon === 'Settings' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                      </svg>
                      <span>{item.name}</span>
                    </a>
                  );
                })}
                <form action={handleSignOut} className="pt-2 border-t border-sidebar-border">
                  <button
                    type="submit"
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text transition-all"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span>Sair</span>
                  </button>
                </form>
              </nav>
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 lg:ml-0">
          {/* Top Header */}
          <header className="sticky top-0 z-60 flex h-16 items-center gap-4 px-4 lg:px-6 bg-header-bg/95 backdrop-blur-md border-b border-header-border">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text hover:bg-background transition-colors"
              aria-label="Abrir menu"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-6 w-5" />
            </button>

            {/* Page title area - flexible */}
            <div className="flex-1 lg:hidden" />

            {/* Month picker - visible on all screens but responsive */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
                className="rounded-lg h-9 w-9"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Button>
              <MonthPicker
                month={currentMonth}
                year={currentYear}
                onChange={(m, y) => { setCurrentMonth(m); setCurrentYear(y); }}
                onGoToCurrent={handleGoToCurrent}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                aria-label="Próximo mês"
                className="rounded-lg h-9 w-9"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Button>
            </div>

            {/* Mobile month picker (compact) */}
            <div className="md:hidden flex items-center gap-2 flex-1 justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
                className="rounded-lg h-9 w-9"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Button>
              <span className="text-sm font-semibold text-text min-w-[120px] text-center">
                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][currentMonth]} {currentYear}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                aria-label="Próximo mês"
                className="rounded-lg h-9 w-9"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <HideValuesToggle />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Configurações"
                className="rounded-lg h-9 w-9 md:hidden"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Perfil do usuário"
                className="rounded-lg h-9 w-9 md:hidden"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="content-max">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onNewLaunch={handleNewLaunch} />
      </div>
    </ProtectedRoute>
  );
}