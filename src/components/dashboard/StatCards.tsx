import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, Scale } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const StatCards: React.FC = () => {
  const { totalIncome, totalExpense, netBalance, savingsRate, totalNetWorth, currency } = useFinance();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Saldo Patrimonial Consolidado */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-2">
          <span>Patrimônio Líquido Total</span>
          <Wallet className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-mono tabular-nums">
          {formatCurrency(totalNetWorth, currency)}
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span>Contas correntes</span>
          <span aria-hidden="true">·</span>
          <span>Investimentos</span>
          <span aria-hidden="true">·</span>
          <span>Cartões</span>
        </div>
      </div>

      {/* 2. Receitas do Mês */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-2">
          <span>Entradas do Período</span>
          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
          {formatCurrency(totalIncome, currency)}
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span>Salário</span>
          <span aria-hidden="true">·</span>
          <span>Freelances</span>
          <span aria-hidden="true">·</span>
          <span>Rendimentos</span>
        </div>
      </div>

      {/* 3. Despesas do Mês */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-2">
          <span>Saídas do Período</span>
          <ArrowDownRight className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono tabular-nums">
          {formatCurrency(totalExpense, currency)}
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span>Fixas e variáveis</span>
          <span aria-hidden="true">·</span>
          <span>Faturas de cartão</span>
        </div>
      </div>

      {/* 4. Balanço Líquido & Taxa de Poupança */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-2">
          <span>Balanço Líquido (Superávit)</span>
          <Scale className={`w-4 h-4 ${netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
        </div>
        <div className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${
          netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`}>
          {netBalance >= 0 ? `+${formatCurrency(netBalance, currency)}` : formatCurrency(netBalance, currency)}
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300 font-mono tabular-nums">
            {formatPercent(savingsRate)}
          </span>
          <span>taxa de economia</span>
        </div>
      </div>
    </div>
  );
};
