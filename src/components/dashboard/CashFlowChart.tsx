import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, getMonthName } from '../../utils/formatters';

export const CashFlowChart: React.FC = () => {
  const { transactions, currency } = useFinance();
  const [viewMode, setViewMode] = useState<'months' | 'recent_days'>('months');

  // Group by last 6 months
  const monthlyData = React.useMemo(() => {
    const monthsMap: Record<string, { label: string; income: number; expense: number; monthKey: string }> = {};
    const now = new Date();

    // Prepare last 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${getMonthName(d.getMonth()).slice(0, 3)}/${String(d.getFullYear()).slice(-2)}`;
      monthsMap[key] = { label, income: 0, expense: 0, monthKey: key };
    }

    // Populate data
    for (const tx of transactions) {
      if (!tx.date) continue;
      const key = tx.date.slice(0, 7); // YYYY-MM
      if (monthsMap[key]) {
        if (tx.type === 'income') {
          monthsMap[key].income += tx.amount;
        } else if (tx.type === 'expense') {
          monthsMap[key].expense += tx.amount;
        }
      }
    }

    return Object.values(monthsMap);
  }, [transactions]);

  // Group by last 14 days
  const dailyData = React.useMemo(() => {
    const daysMap: Record<string, { label: string; income: number; expense: number; dayKey: string }> = {};
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      daysMap[key] = { label, income: 0, expense: 0, dayKey: key };
    }

    for (const tx of transactions) {
      if (tx.date && daysMap[tx.date]) {
        if (tx.type === 'income') {
          daysMap[tx.date].income += tx.amount;
        } else if (tx.type === 'expense') {
          daysMap[tx.date].expense += tx.amount;
        }
      }
    }

    return Object.values(daysMap);
  }, [transactions]);

  const activeData = viewMode === 'months' ? monthlyData : dailyData;
  const maxVal = Math.max(
    ...activeData.map((d) => Math.max(d.income, d.expense)),
    1000
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Fluxo de Caixa
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Comparativo de receitas e despesas ao longo do tempo
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              <span>Entradas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
              <span>Saídas</span>
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('months')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'months'
                  ? 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              6 Meses
            </button>
            <button
              onClick={() => setViewMode('recent_days')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'recent_days'
                  ? 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              14 Dias
            </button>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart with subtle grid */}
      <div className="h-64 relative flex items-end pt-8 pb-6">
        {/* Background grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 text-[10px] text-neutral-400 font-mono">
          <div className="border-b border-neutral-100 dark:border-neutral-800/60 w-full flex justify-between">
            <span>{formatCurrency(maxVal, currency)}</span>
          </div>
          <div className="border-b border-neutral-100 dark:border-neutral-800/60 w-full flex justify-between">
            <span>{formatCurrency(maxVal * 0.5, currency)}</span>
          </div>
          <div className="border-b border-neutral-200 dark:border-neutral-800 w-full flex justify-between">
            <span>R$ 0,00</span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="relative w-full h-full flex items-end justify-between gap-2 sm:gap-4 z-10">
          {activeData.map((item, index) => {
            const incomeHeight = Math.min(100, (item.income / maxVal) * 100);
            const expenseHeight = Math.min(100, (item.expense / maxVal) * 100);
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-4 transform -translate-y-full bg-neutral-900 text-white dark:bg-neutral-800 text-[11px] p-2 rounded-lg shadow-xl pointer-events-none z-30 min-w-[140px] border border-neutral-700">
                    <div className="font-semibold text-neutral-300 pb-1 border-b border-neutral-700 mb-1">
                      {item.label}
                    </div>
                    <div className="flex justify-between gap-2 text-emerald-400 font-mono tabular-nums">
                      <span>Entradas:</span>
                      <span>{formatCurrency(item.income, currency)}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-rose-400 font-mono tabular-nums">
                      <span>Saídas:</span>
                      <span>{formatCurrency(item.expense, currency)}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-neutral-300 pt-1 border-t border-neutral-700 mt-1 font-mono tabular-nums">
                      <span>Balanço:</span>
                      <span>{formatCurrency(item.income - item.expense, currency)}</span>
                    </div>
                  </div>
                )}

                {/* Bars Pair */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                  {/* Income Bar */}
                  <div
                    style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                    className="w-1/2 max-w-[16px] bg-emerald-500 hover:bg-emerald-400 rounded-t-xs transition-all duration-200"
                  />
                  {/* Expense Bar */}
                  <div
                    style={{ height: `${Math.max(expenseHeight, 2)}%` }}
                    className="w-1/2 max-w-[16px] bg-rose-500 hover:bg-rose-400 rounded-t-xs transition-all duration-200"
                  />
                </div>

                {/* Bottom X-Axis Label */}
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 font-mono whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
