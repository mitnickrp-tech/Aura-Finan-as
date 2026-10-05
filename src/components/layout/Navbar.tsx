import React, { useState, useRef, useEffect } from 'react';
import { Plus, Sun, Moon, Download, User as UserIcon, Lock, LogOut, ChevronDown } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab = 'overview' | 'transactions' | 'budgets' | 'goals' | 'accounts' | 'recurring' | 'reports';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  onOpenDataModal: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenDataModal,
  onOpenProfile,
}) => {
  const { isDarkMode, toggleDarkMode } = useFinance();
  const { currentUser, lockScreen, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'transactions', label: 'Transações' },
    { id: 'budgets', label: 'Orçamentos' },
    { id: 'goals', label: 'Metas' },
    { id: 'accounts', label: 'Contas' },
    { id: 'recurring', label: 'Recorrentes' },
    { id: 'reports', label: 'Relatórios' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              A
            </div>
            <span>Aura Finanças</span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 overflow-x-auto py-1">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`relative py-1 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenDataModal}
            title="Backup e Dados"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              title="Perfil do Usuário"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                {getInitials(currentUser?.name)}
              </div>
              <span className="hidden xl:inline text-xs font-medium text-neutral-700 dark:text-neutral-300 max-w-[100px] truncate">
                {currentUser?.name?.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg py-1.5 text-xs z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="font-semibold text-neutral-900 dark:text-white truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono truncate">
                    {currentUser?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Meu Perfil</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    lockScreen();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Bloquear Tela</span>
                </button>

                <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Mobile subnavigation bar for small screens */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2 border-t border-neutral-100 dark:border-neutral-900 overflow-x-auto bg-neutral-50/70 dark:bg-neutral-900/50">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
