import React from 'react';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Transaction } from '../../types/finance';

interface RecentTransactionsProps {
  onViewAll: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  onViewAll,
  onEditTransaction,
}) => {
  const { transactions, categories, accounts, currency, toggleTransactionStatus } = useFinance();

  const recent = transactions.slice(0, 6);

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Últimas Movimentações
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Lançamentos mais recentes da sua conta
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          <span>Ver todas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          Nenhuma transação cadastrada até o momento.
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {recent.map((tx) => {
            const cat = categories.find((c) => c.id === tx.category);
            const acc = accounts.find((a) => a.id === tx.accountId);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-4 group hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 px-2 rounded-lg transition-colors"
              >
                {/* Left: Icon & Description */}
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => onEditTransaction(tx)}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat?.color || '#94a3b8'}18` }}
                  >
                    <CategoryIcon
                      name={cat?.icon || 'MoreHorizontal'}
                      className="w-4 h-4"
                      color={cat?.color || '#64748b'}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span>{cat?.name || 'Geral'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{acc?.name || 'Conta'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Status */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold font-mono tabular-nums ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {isIncome ? `+${formatCurrency(tx.amount, currency)}` : `-${formatCurrency(tx.amount, currency)}`}
                    </p>
                    {tx.installments && (
                      <p className="text-[11px] text-neutral-400 font-mono">
                        Parcela {tx.installments.current}/{tx.installments.total}
                      </p>
                    )}
                  </div>

                  {/* Status toggle button */}
                  <button
                    onClick={() => toggleTransactionStatus(tx.id)}
                    title={tx.status === 'completed' ? 'Efetivado (clique para marcar pendente)' : 'Pendente (clique para efetivar)'}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    {tx.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
