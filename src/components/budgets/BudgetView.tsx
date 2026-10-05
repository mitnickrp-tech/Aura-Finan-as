import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Edit3, Plus, TrendingDown } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

export const BudgetView: React.FC = () => {
  const { categories, filteredTransactions, updateCategoryBudget, currency } = useFinance();
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editLimitStr, setEditLimitStr] = useState<string>('');

  // Calculate expenses for each category
  const expenseTransactions = filteredTransactions.filter((t) => t.type === 'expense');

  const budgetStats = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const spent = expenseTransactions
        .filter((t) => t.category === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const limit = cat.monthlyBudget || 0;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      const remaining = limit - spent;

      return {
        ...cat,
        spent,
        limit,
        percentage,
        remaining,
        isOverBudget: limit > 0 && spent > limit,
        isWarning: limit > 0 && percentage >= 80 && percentage <= 100,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Global budget sum
  const totalBudget = budgetStats.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetStats.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const globalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const startEdit = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setEditLimitStr(currentLimit > 0 ? currentLimit.toString() : '');
  };

  const saveEdit = (catId: string) => {
    const val = parseFloat(editLimitStr.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      updateCategoryBudget(catId, val);
    }
    setEditingCatId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Card */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Gestão de Orçamentos Mensais
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Controle os limites de gastos por categoria para manter suas economias no azul
            </p>
          </div>

          <div className="flex items-center gap-6 font-mono tabular-nums text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px]">Teto Planejado</span>
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                {formatCurrency(totalBudget, currency)}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Total Gasto</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalSpent, currency)}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Disponível</span>
              <span
                className={`text-base font-bold ${
                  totalRemaining >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(totalRemaining, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-neutral-500 font-mono">
            <span>Progresso Geral dos Gastos</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {formatPercent(globalPercentage)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, globalPercentage)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                globalPercentage > 100
                  ? 'bg-rose-500'
                  : globalPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetStats.map((cat) => {
          const isEditing = editingCatId === cat.id;

          return (
            <div
              key={cat.id}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon, Name and Edit Button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" color={cat.color} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] text-neutral-500 font-mono tabular-nums">
                        {cat.limit > 0
                          ? `Teto: ${formatCurrency(cat.limit, currency)}`
                          : 'Sem teto definido'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => (isEditing ? saveEdit(cat.id) : startEdit(cat.id, cat.limit))}
                    title={isEditing ? 'Salvar limite' : 'Editar limite do orçamento'}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* In-place Limit Editor */}
                {isEditing && (
                  <div className="mb-3 p-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-mono">R$</span>
                    <input
                      type="number"
                      placeholder="Novo limite"
                      value={editLimitStr}
                      onChange={(e) => setEditLimitStr(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono font-medium focus:outline-none text-neutral-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(cat.id)}
                      className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold"
                    >
                      OK
                    </button>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        cat.isOverBudget
                          ? 'bg-rose-500'
                          : cat.isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="flex justify-between items-center text-xs font-mono tabular-nums pt-1">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Gasto atual</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {formatCurrency(cat.spent, currency)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-neutral-500 block text-[10px]">
                      {cat.isOverBudget ? 'Estouro' : 'Restante'}
                    </span>
                    <span
                      className={`font-semibold ${
                        cat.isOverBudget
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {cat.limit > 0
                        ? formatCurrency(Math.abs(cat.remaining), currency)
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] flex items-center justify-between">
                <span className="text-neutral-500">
                  {cat.limit > 0 ? `${formatPercent(cat.percentage)} consumido` : 'Defina um valor'}
                </span>
                {cat.isOverBudget && (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    Excedeu o limite
                  </span>
                )}
                {cat.isWarning && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Atenção aos gastos
                  </span>
                )}
                {!cat.isOverBudget && !cat.isWarning && cat.limit > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Dentro do plano
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
