import React, { useState } from 'react';
import { Target, Plus, ShieldCheck, Palmtree, Laptop, PiggyBank, ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatters';
import { Goal } from '../../types/finance';

export const GoalsView: React.FC = () => {
  const { goals, accounts, addGoal, contributeToGoal, deleteGoal, currency } = useFinance();

  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [contributeModalGoal, setContributeModalGoal] = useState<Goal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [contributeType, setContributeType] = useState<'deposit' | 'withdraw'>('deposit');

  // New goal form state
  const [newTitle, setNewTitle] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newCategory, setNewCategory] = useState('Reserva');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTargetAmount.replace(/\./g, '').replace(',', '.'));
    if (!newTitle.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      title: newTitle.trim(),
      targetAmount: target,
      deadline: newDeadline || '2026-12-31',
      category: newCategory,
      color: '#10b981',
      icon: 'PiggyBank',
      notes: newNotes.trim(),
    });

    setNewTitle('');
    setNewTargetAmount('');
    setNewDeadline('');
    setNewNotes('');
    setIsNewGoalOpen(false);
  };

  const handleContributionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeModalGoal) return;

    const val = parseFloat(contributeAmount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    const finalAmount = contributeType === 'deposit' ? val : -val;
    contributeToGoal(contributeModalGoal.id, finalAmount, selectedAccountId);

    setContributeModalGoal(null);
    setContributeAmount('');
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Metas Financeiras & Caixinhas
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Guarde dinheiro com propósito para conquistas de curto, médio e longo prazo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono tabular-nums mr-2">
              <span className="text-[11px] text-neutral-500 block">Total Guardado em Metas</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalSaved, currency)}
              </span>
            </div>

            <button
              onClick={() => setIsNewGoalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Meta</span>
            </button>
          </div>
        </div>

        {/* Global Progress */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-neutral-500 font-mono">
            <span>Progresso Acumulado ({formatCurrency(totalSaved, currency)} de {formatCurrency(totalTarget, currency)})</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {formatPercent(totalPercentage)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, totalPercentage)}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          // Calculate months remaining
          const now = new Date();
          const deadlineDate = new Date(goal.deadline);
          const monthsRemaining = Math.max(
            1,
            (deadlineDate.getFullYear() - now.getFullYear()) * 12 +
              (deadlineDate.getMonth() - now.getMonth())
          );
          const monthlyTarget = remaining / monthsRemaining;

          return (
            <div
              key={goal.id}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {goal.title}
                      </h3>
                      <span className="text-[11px] text-neutral-400">
                        Prazo: {formatDate(goal.deadline)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Excluir a meta "${goal.title}"?`)) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="p-1 text-neutral-400 hover:text-rose-500 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir meta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {goal.notes && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 italic">
                    "{goal.notes}"
                  </p>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-500">Concluído</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {formatPercent(percentage)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums pt-1">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Guardado</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 block text-[10px]">Meta Final</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Monthly guidance */}
                {remaining > 0 && (
                  <div className="mt-3 p-2 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg text-[11px] text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
                    <span>Aporte sugerido:</span>
                    <span className="font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(monthlyTarget, currency)}/mês
                    </span>
                  </div>
                )}
              </div>

              {/* Actions: Guardar ou Resgatar */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-2">
                <button
                  onClick={() => {
                    setContributeModalGoal(goal);
                    setContributeType('deposit');
                  }}
                  className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={() => {
                    setContributeModalGoal(goal);
                    setContributeType('withdraw');
                  }}
                  className="py-1.5 px-3 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Resgatar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Goal */}
      {isNewGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">
              Criar Nova Meta Financeira
            </h3>
            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Nome do Objetivo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reserva de Emergência, Viagem, Carro Novo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Valor Alvo (R$)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 15.000,00"
                  value={newTargetAmount}
                  onChange={(e) => setNewTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Data Limite
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Anotações / Estratégia
                </label>
                <input
                  type="text"
                  placeholder="Ex: Investido em CDB 100% CDI com liquidez diária"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewGoalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Contribute / Withdraw */}
      {contributeModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
              {contributeType === 'deposit' ? 'Guardar Dinheiro na Meta' : 'Resgatar da Meta'}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">{contributeModalGoal.title}</p>

            <form onSubmit={handleContributionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-base font-mono font-semibold"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {contributeType === 'deposit' ? 'Débito da Conta' : 'Crédito na Conta'}
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setContributeModalGoal(null)}
                  className="px-3.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
