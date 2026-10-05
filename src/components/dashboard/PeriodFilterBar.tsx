import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TimeFilterPeriod } from '../../types/finance';

interface PeriodFilterBarProps {
  onOpenInsights: () => void;
}

export const PeriodFilterBar: React.FC<PeriodFilterBarProps> = ({ onOpenInsights }) => {
  const { periodFilter, setPeriodFilter, currency, setCurrency } = useFinance();

  const periods: { id: TimeFilterPeriod; label: string }[] = [
    { id: 'this_month', label: 'Este Mês' },
    { id: 'last_month', label: 'Mês Passado' },
    { id: 'last_3_months', label: 'Últimos 3 Meses' },
    { id: 'year', label: 'Este Ano' },
    { id: 'all', label: 'Todo Período' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl shadow-xs">
      {/* Segmented Period Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-0.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg">
        {periods.map((p) => {
          const isActive = periodFilter === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPeriodFilter(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Right controls: Currency selector & AI Insights */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {/* Currency Switcher */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs font-medium">
          {(['BRL', 'USD', 'EUR'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2 py-1 rounded-md transition-colors ${
                currency === c
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {c === 'BRL' ? 'R$' : c === 'USD' ? '$' : '€'}
            </button>
          ))}
        </div>

        {/* Financial health & Insights button */}
        <button
          onClick={onOpenInsights}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Diagnóstico Financeiro</span>
        </button>
      </div>
    </div>
  );
};
