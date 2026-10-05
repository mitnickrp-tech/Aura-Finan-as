export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'cash' | 'transfer';
export type TransactionStatus = 'completed' | 'pending';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  description: string;
  category: string; // category id
  accountId: string; // account id
  destinationAccountId?: string; // for transfers
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  installments?: {
    current: number;
    total: number;
    parentId?: string;
  };
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  monthlyBudget?: number;
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  initialBalance: number;
  currentBalance: number;
  creditLimit?: number;
  color: string;
  closingDay?: number;
  dueDay?: number;
}

export interface Budget {
  categoryId: string;
  monthlyLimit: number;
  alertThreshold: number; // e.g., 0.85 (85%)
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  color: string;
  icon: string;
  notes?: string;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  dueDay: number; // 1-31
  category: string;
  accountId: string;
  isAutoPaid: boolean;
  lastPaidMonth?: string; // YYYY-MM
}

export type TimeFilterPeriod = 'this_month' | 'last_month' | 'last_3_months' | 'year' | 'all';
