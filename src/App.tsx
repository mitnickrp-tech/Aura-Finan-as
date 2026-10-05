/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { LockScreenModal } from './components/auth/LockScreenModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { PeriodFilterBar } from './components/dashboard/PeriodFilterBar';
import { StatCards } from './components/dashboard/StatCards';
import { CashFlowChart } from './components/dashboard/CashFlowChart';
import { CategoryDistribution } from './components/dashboard/CategoryDistribution';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { TransactionList } from './components/transactions/TransactionList';
import { TransactionModal } from './components/transactions/TransactionModal';
import { BudgetView } from './components/budgets/BudgetView';
import { GoalsView } from './components/goals/GoalsView';
import { AccountsView } from './components/accounts/AccountsView';
import { RecurringBillsView } from './components/recurring/RecurringBillsView';
import { ReportsView } from './components/reports/ReportsView';
import { FinancialInsightsModal } from './components/ai/FinancialInsightsModal';
import { DataManagementModal } from './components/common/DataManagementModal';
import { Transaction } from './types/finance';

function FinanceAppContent() {
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // If user is not logged in, render the Login / Password / Registration screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleSelectCategoryFromDonut = (catId: string) => {
    setSelectedCategoryFilter(catId);
    setActiveTab('transactions');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'transactions') setSelectedCategoryFilter(null);
          setActiveTab(tab);
        }}
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <PeriodFilterBar onOpenInsights={() => setIsInsightsOpen(true)} />

            {/* Stat Cards */}
            <StatCards />

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CashFlowChart />
              </div>
              <div className="lg:col-span-1">
                <CategoryDistribution onSelectCategory={handleSelectCategoryFromDonut} />
              </div>
            </div>

            {/* Recent Transactions List */}
            <RecentTransactions
              onViewAll={() => setActiveTab('transactions')}
              onEditTransaction={handleEditTransaction}
            />
          </div>
        )}

        {/* Tab 2: Transactions */}
        {activeTab === 'transactions' && (
          <TransactionList
            onNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
            initialCategoryId={selectedCategoryFilter}
          />
        )}

        {/* Tab 3: Budgets */}
        {activeTab === 'budgets' && <BudgetView />}

        {/* Tab 4: Goals */}
        {activeTab === 'goals' && <GoalsView />}

        {/* Tab 5: Accounts & Cards */}
        {activeTab === 'accounts' && <AccountsView />}

        {/* Tab 6: Recurring Bills */}
        {activeTab === 'recurring' && <RecurringBillsView />}

        {/* Tab 7: Reports */}
        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aura Finanças &copy; {new Date().getFullYear()} · Controle Financeiro Pessoal</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Armazenamento criptografado no navegador</span>
            <span aria-hidden="true">·</span>
            <span>Sessão Protegida</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        transactionToEdit={editingTransaction}
      />

      <FinancialInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
      />

      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <LockScreenModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <FinanceAppContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
