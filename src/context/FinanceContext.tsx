import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Account, Category, Goal, RecurringBill, TimeFilterPeriod, Transaction } from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_GOALS,
  INITIAL_RECURRING,
  INITIAL_TRANSACTIONS,
} from '../utils/initialData';
import { isDateInPeriod } from '../utils/formatters';
import { useAuth } from './AuthContext';
import {
  seedUserDataIfEmpty,
  dbAddTransaction,
  dbUpdateTransaction,
  dbDeleteTransaction,
  dbAddAccount,
  dbUpdateAccount,
  dbDeleteAccount,
  dbUpdateCategory,
  dbAddGoal,
  dbUpdateGoal,
  dbDeleteGoal,
  dbAddRecurring,
  dbUpdateRecurring,
  dbDeleteRecurring,
} from '../services/dbService';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: Goal[];
  recurring: RecurringBill[];
  periodFilter: TimeFilterPeriod;
  currency: 'BRL' | 'USD' | 'EUR';
  isDarkMode: boolean;
  
  // Actions
  setPeriodFilter: (period: TimeFilterPeriod) => void;
  setCurrency: (c: 'BRL' | 'USD' | 'EUR') => void;
  toggleDarkMode: () => void;
  
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;
  
  addAccount: (acc: Omit<Account, 'id' | 'currentBalance'>) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  updateCategoryBudget: (id: string, monthlyBudget: number) => void;
  
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  contributeToGoal: (id: string, amount: number, accountId: string) => void;
  deleteGoal: (id: string) => void;
  
  addRecurring: (bill: Omit<RecurringBill, 'id'>) => void;
  deleteRecurring: (id: string) => void;
  payRecurringBill: (billId: string) => void;
  
  // Stats
  filteredTransactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  totalNetWorth: number;
  
  // Data actions
  resetToDefaultData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => void;
  exportTransactionsCSV: () => void;
  importDataJSON: (jsonStr: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'aura_finance_transactions_v1',
  CATEGORIES: 'aura_finance_categories_v1',
  ACCOUNTS: 'aura_finance_accounts_v1',
  GOALS: 'aura_finance_goals_v1',
  RECURRING: 'aura_finance_recurring_v1',
  THEME: 'aura_finance_theme_v1',
  CURRENCY: 'aura_finance_currency_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved !== null) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        localStorage.setItem(STORAGE_KEYS.THEME, 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Currency
  const [currency, setCurrencyState] = useState<'BRL' | 'USD' | 'EUR'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as 'BRL' | 'USD' | 'EUR') || 'BRL';
    } catch {
      return 'BRL';
    }
  });

  const setCurrency = (c: 'BRL' | 'USD' | 'EUR') => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, c);
    } catch (e) {
      console.error(e);
    }
  };

  // Period filter
  const [periodFilter, setPeriodFilter] = useState<TimeFilterPeriod>('this_month');

  // Core Data
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [recurring, setRecurring] = useState<RecurringBill[]>(INITIAL_RECURRING);

  // Auto-seed and sync data with Cloud Database whenever user logs in
  useEffect(() => {
    if (!currentUser?.id) return;

    const userId = currentUser.id;
    let isMounted = true;
    async function syncWithDatabase() {
      try {
        const userScopedData = await seedUserDataIfEmpty(userId);
        if (isMounted) {
          setTransactions(userScopedData.transactions);
          setCategories(userScopedData.categories);
          setAccounts(userScopedData.accounts);
          setGoals(userScopedData.goals);
          setRecurring(userScopedData.recurring);
        }
      } catch (err) {
        console.warn('Sync with database fallback:', err);
      }
    }

    syncWithDatabase();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // Recalculate Account Balances automatically based on transactions
  useEffect(() => {
    setAccounts((prevAccounts) => {
      return prevAccounts.map((acc) => {
        let balance = acc.initialBalance;
        
        // Sum completed transactions for this account
        for (const tx of transactions) {
          if (tx.status !== 'completed') continue;
          
          if (tx.type === 'expense' && tx.accountId === acc.id) {
            balance -= tx.amount;
          } else if (tx.type === 'income' && tx.accountId === acc.id) {
            balance += tx.amount;
          } else if (tx.type === 'transfer') {
            if (tx.accountId === acc.id) {
              balance -= tx.amount;
            }
            if (tx.destinationAccountId === acc.id) {
              balance += tx.amount;
            }
          }
        }
        
        return {
          ...acc,
          currentBalance: balance,
        };
      });
    });
  }, [transactions]);

  // Filtered transactions for active period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => isDateInPeriod(tx.date, periodFilter));
  }, [transactions, periodFilter]);

  // Financial aggregates
  const { totalIncome, totalExpense, netBalance, savingsRate } = useMemo(() => {
    let income = 0;
    let expense = 0;

    for (const tx of filteredTransactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else if (tx.type === 'expense') {
        expense += tx.amount;
      }
    }

    const net = income - expense;
    const rate = income > 0 ? Math.max(0, (net / income) * 100) : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: net,
      savingsRate: rate,
    };
  }, [filteredTransactions]);

  // Total net worth across all non-credit accounts minus credit balance
  const totalNetWorth = useMemo(() => {
    return accounts.reduce((acc, a) => {
      return acc + a.currentBalance;
    }, 0);
  }, [accounts]);

  // Transaction Actions
  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const userId = currentUser?.id || 'default_user';
    
    // Check if installments requested (> 1)
    if (newTx.installments && newTx.installments.total > 1) {
      const totalInstallments = newTx.installments.total;
      const installmentAmount = Math.round((newTx.amount / totalInstallments) * 100) / 100;
      const [baseY, baseM, baseD] = newTx.date.split('-').map(Number);
      
      const createdTxs: Transaction[] = [];
      const parentId = id;
      
      for (let i = 1; i <= totalInstallments; i++) {
        // Calculate date + (i - 1) months
        const targetDate = new Date(baseY, baseM - 1 + (i - 1), baseD);
        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(targetDate.getDate()).padStart(2, '0');
        const formattedDate = `${y}-${m}-${d}`;
        
        const instTx: Transaction = {
          ...newTx,
          id: i === 1 ? parentId : `tx-${Date.now()}-${i}`,
          amount: installmentAmount,
          date: formattedDate,
          description: `${newTx.description} (${i}/${totalInstallments})`,
          status: i === 1 ? newTx.status : 'pending',
          installments: {
            current: i,
            total: totalInstallments,
            parentId,
          },
        };

        createdTxs.push(instTx);
        dbAddTransaction(userId, instTx);
      }
      
      setTransactions((prev) => [...createdTxs, ...prev]);
    } else {
      const fullTx: Transaction = { ...newTx, id };
      setTransactions((prev) => [fullTx, ...prev]);
      dbAddTransaction(userId, fullTx);
    }
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
    if (currentUser?.id) {
      dbUpdateTransaction(currentUser.id, id, updated);
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (currentUser?.id) {
      dbDeleteTransaction(currentUser.id, id);
    }
  };

  const toggleTransactionStatus = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    const newStatus = tx.status === 'completed' ? 'pending' : 'completed';
    updateTransaction(id, { status: newStatus });
  };

  // Account Actions
  const addAccount = (newAcc: Omit<Account, 'id' | 'currentBalance'>) => {
    const id = `acc-${Date.now()}`;
    const userId = currentUser?.id || 'default_user';
    const fullAcc: Account = {
      ...newAcc,
      id,
      currentBalance: newAcc.initialBalance,
    };
    setAccounts((prev) => [...prev, fullAcc]);
    dbAddAccount(userId, fullAcc);
  };

  const updateAccount = (id: string, updated: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    if (currentUser?.id) {
      dbUpdateAccount(currentUser.id, id, updated);
    }
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (currentUser?.id) {
      dbDeleteAccount(currentUser.id, id);
    }
  };

  // Category Actions
  const updateCategoryBudget = (id: string, monthlyBudget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, monthlyBudget } : c))
    );
    if (currentUser?.id) {
      dbUpdateCategory(currentUser.id, id, { monthlyBudget });
    }
  };

  // Goal Actions
  const addGoal = (newGoal: Omit<Goal, 'id' | 'currentAmount'>) => {
    const id = `goal-${Date.now()}`;
    const userId = currentUser?.id || 'default_user';
    const fullGoal: Goal = {
      ...newGoal,
      id,
      currentAmount: 0,
    };
    setGoals((prev) => [...prev, fullGoal]);
    dbAddGoal(userId, fullGoal);
  };

  const updateGoal = (id: string, updated: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
    );
    if (currentUser?.id) {
      dbUpdateGoal(currentUser.id, id, updated);
    }
  };

  const contributeToGoal = (id: string, amount: number, accountId: string) => {
    const targetGoal = goals.find((g) => g.id === id);
    const newAmount = (targetGoal?.currentAmount || 0) + amount;
    
    updateGoal(id, { currentAmount: newAmount });

    const today = new Date().toISOString().split('T')[0];
    if (amount > 0) {
      addTransaction({
        type: 'expense',
        amount,
        date: today,
        description: `Aporte na meta: ${targetGoal?.title || 'Meta'}`,
        category: 'cat-investimentos',
        accountId,
        status: 'completed',
        paymentMethod: 'transfer',
        tags: ['Meta', 'Poupança'],
      });
    } else {
      addTransaction({
        type: 'income',
        amount: Math.abs(amount),
        date: today,
        description: `Resgate da meta: ${targetGoal?.title || 'Meta'}`,
        category: 'cat-investimentos',
        accountId,
        status: 'completed',
        paymentMethod: 'transfer',
        tags: ['Resgate', 'Meta'],
      });
    }
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (currentUser?.id) {
      dbDeleteGoal(currentUser.id, id);
    }
  };

  // Recurring bills actions
  const addRecurring = (bill: Omit<RecurringBill, 'id'>) => {
    const id = `rec-${Date.now()}`;
    const userId = currentUser?.id || 'default_user';
    const fullBill: RecurringBill = { ...bill, id };
    setRecurring((prev) => [...prev, fullBill]);
    dbAddRecurring(userId, fullBill);
  };

  const deleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
    if (currentUser?.id) {
      dbDeleteRecurring(currentUser.id, id);
    }
  };

  const payRecurringBill = (billId: string) => {
    const bill = recurring.find((r) => r.id === billId);
    if (!bill) return;

    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const todayStr = today.toISOString().split('T')[0];

    // Create completed transaction
    addTransaction({
      type: bill.type,
      amount: bill.amount,
      date: todayStr,
      description: bill.title,
      category: bill.category,
      accountId: bill.accountId,
      status: 'completed',
      paymentMethod: 'pix',
      isRecurring: true,
      tags: ['Recorrente', 'Conta Fixa'],
    });

    // Update last paid month
    setRecurring((prev) =>
      prev.map((r) => (r.id === billId ? { ...r, lastPaidMonth: currentMonthStr } : r))
    );
    if (currentUser?.id) {
      dbUpdateRecurring(currentUser.id, billId, { lastPaidMonth: currentMonthStr });
    }
  };

  // Reset to default
  const resetToDefaultData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    setAccounts(INITIAL_ACCOUNTS);
    setGoals(INITIAL_GOALS);
    setRecurring(INITIAL_RECURRING);
    if (currentUser?.id) {
      seedUserDataIfEmpty(currentUser.id);
    }
  };

  const clearAllData = () => {
    setTransactions([]);
    setGoals([]);
    setRecurring([]);
  };

  // Export JSON
  const exportDataJSON = () => {
    const data = {
      transactions,
      categories,
      accounts,
      goals,
      recurring,
      exportedAt: new Date().toISOString(),
      version: '2.0-cloud',
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-financas-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportTransactionsCSV = () => {
    const headers = ['ID', 'Data', 'Tipo', 'Descrição', 'Categoria', 'Valor (R$)', 'Status', 'Conta', 'Método'];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.category)?.name || t.category;
      const acc = accounts.find((a) => a.id === t.accountId)?.name || t.accountId;
      return [
        t.id,
        t.date,
        t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência',
        `"${t.description.replace(/"/g, '""')}"`,
        `"${cat}"`,
        t.amount.toFixed(2).replace('.', ','),
        t.status === 'completed' ? 'Efetivado' : 'Pendente',
        `"${acc}"`,
        t.paymentMethod,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-transacoes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (Array.isArray(parsed.categories)) {
        setCategories(parsed.categories);
      }
      if (Array.isArray(parsed.accounts)) {
        setAccounts(parsed.accounts);
      }
      if (Array.isArray(parsed.goals)) {
        setGoals(parsed.goals);
      }
      if (Array.isArray(parsed.recurring)) {
        setRecurring(parsed.recurring);
      }
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        goals,
        recurring,
        periodFilter,
        currency,
        isDarkMode,
        setPeriodFilter,
        setCurrency,
        toggleDarkMode,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleTransactionStatus,
        addAccount,
        updateAccount,
        deleteAccount,
        updateCategoryBudget,
        addGoal,
        updateGoal,
        contributeToGoal,
        deleteGoal,
        addRecurring,
        deleteRecurring,
        payRecurringBill,
        filteredTransactions,
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate,
        totalNetWorth,
        resetToDefaultData,
        clearAllData,
        exportDataJSON,
        exportTransactionsCSV,
        importDataJSON,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
