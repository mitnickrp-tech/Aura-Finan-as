import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const CategoryDistribution: React.FC<{ onSelectCategory?: (catId: string) => void }> = ({
  onSelectCategory,
}) => {
  const { filteredTransactions, categories, currency } = useFinance();
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  // Calculate expense sum by category
  const categoryStats = React.useMemo(() => {
    const expenseTxs = filteredTransactions.filter((t) => t.type === 'expense');
    const totalExp = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

    const map: Record<string, { category: (typeof categories)[0]; total: number; percentage: number }> = {};

    for (const tx of expenseTxs) {
      if (!map[tx.category]) {
        const cat = categories.find((c) => c.id === tx.category) || {
          id: tx.category,
          name: 'Outros',
          type: 'expense' as const,
          icon: 'MoreHorizontal',
          color: '#94a3b8',
        };
        map[tx.category] = { category: cat, total: 0, percentage: 0 };
      }
      map[tx.category].total += tx.amount;
    }

    const list = Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalExp > 0 ? (item.total / totalExp) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return { list, totalExp };
  }, [filteredTransactions, categories]);

  // Donut SVG segments
  const { segments } = React.useMemo(() => {
    let accumulatedAngle = 0;
    const radius = 40;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;

    const segs = categoryStats.list.map((item) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * (circumference / 100);
      accumulatedAngle += item.percentage;

      return {
        id: item.category.id,
        color: item.category.color,
        name: item.category.name,
        percentage: item.percentage,
        strokeDasharray,
        strokeDashoffset,
      };
    });

    return { segments: segs };
  }, [categoryStats]);

  const activeCategory = categoryStats.list.find((c) => c.category.id === hoveredCatId);

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Despesas por Categoria
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Distribuição dos gastos do período selecionado
          </p>
        </div>
      </div>

      {categoryStats.totalExp === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-neutral-400 text-xs">
          <p>Nenhuma despesa registrada neste período.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-neutral-100 dark:stroke-neutral-800"
                strokeWidth="14"
                fill="none"
              />
              {segments.map((seg) => (
                <circle
                  key={seg.id}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={hoveredCatId === seg.id ? "16" : "14"}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredCatId(seg.id)}
                  onMouseLeave={() => setHoveredCatId(null)}
                />
              ))}
            </svg>

            {/* Donut Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                {activeCategory ? activeCategory.category.name : 'Total Saídas'}
              </span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
                {activeCategory
                  ? formatCurrency(activeCategory.total, currency)
                  : formatCurrency(categoryStats.totalExp, currency)}
              </span>
              {activeCategory && (
                <span className="text-[11px] font-mono text-neutral-500 font-medium">
                  {formatPercent(activeCategory.percentage)}
                </span>
              )}
            </div>
          </div>

          {/* Category List */}
          <div className="flex-1 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {categoryStats.list.slice(0, 6).map((item) => {
              const isHovered = hoveredCatId === item.category.id;
              return (
                <div
                  key={item.category.id}
                  onMouseEnter={() => setHoveredCatId(item.category.id)}
                  onMouseLeave={() => setHoveredCatId(null)}
                  onClick={() => onSelectCategory && onSelectCategory(item.category.id)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isHovered
                      ? 'bg-neutral-100 dark:bg-neutral-800'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.category.color}20` }}
                    >
                      <CategoryIcon
                        name={item.category.icon}
                        className="w-3.5 h-3.5"
                        color={item.category.color}
                      />
                    </div>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {item.category.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-right">
                    <span className="text-neutral-500 text-[11px]">
                      {formatPercent(item.percentage)}
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(item.total, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
