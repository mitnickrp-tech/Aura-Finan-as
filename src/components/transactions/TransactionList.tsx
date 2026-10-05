import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Transaction, TransactionType } from '../../types/finance';

interface TransactionListProps {
  onNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  initialCategoryId?: string | null;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onNewTransaction,
  onEditTransaction,
  initialCategoryId = null,
}) => {
  const {
    transactions,
    categories,
    accounts,
    currency,
    deleteTransaction,
    toggleTransactionStatus,
    exportTransactionsCSV,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Filtered & Sorted transactions
  const filteredList = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
          const matchTags = tx.tags ? tx.tags.some((tag) => tag.toLowerCase().includes(q)) : false;
          if (!matchDesc && !matchNotes && !matchTags) return false;
        }

        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) return false;

        // Category filter
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

        // Account filter
        if (selectedAccount !== 'all' && tx.accountId !== selectedAccount) return false;

        // Status filter
        if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const res = new Date(b.date).getTime() - new Date(a.date).getTime();
          return sortDirection === 'desc' ? res : -res;
        } else {
          const res = b.amount - a.amount;
          return sortDirection === 'desc' ? res : -res;
        }
      });
  }, [
    transactions,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedAccount,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por descrição, tag ou anotação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-lg text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportTransactionsCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onNewTransaction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Transação</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
            <option value="transfer">Transferências</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Todas Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Todas as Contas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Todos os Status</option>
            <option value="completed">Efetivado</option>
            <option value="pending">Pendente</option>
          </select>

          {(selectedType !== 'all' ||
            selectedCategory !== 'all' ||
            selectedAccount !== 'all' ||
            selectedStatus !== 'all' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedCategory('all');
                setSelectedAccount('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline ml-auto"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Transaction Table / Grid */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 space-y-3">
            <Filter className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-sm font-medium">Nenhum lançamento encontrado.</p>
            <p className="text-xs text-neutral-500">
              Tente alterar os filtros ou adicione uma nova transação.
            </p>
            <button
              onClick={onNewTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Transação</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 text-neutral-500 dark:text-neutral-400 font-medium">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-neutral-900 dark:hover:text-white"
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Data</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Conta / Cartão</th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white"
                    onClick={() => toggleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Valor</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {filteredList.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.category);
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Description & tags */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900 dark:text-white truncate max-w-xs">
                            {tx.description}
                          </span>
                          {tx.installments && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              ({tx.installments.current}/{tx.installments.total})
                            </span>
                          )}
                        </div>
                        {tx.tags && tx.tags.length > 0 && (
                          <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
                            {tx.tags.join(' · ')}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat?.color || '#94a3b8'}20` }}
                          >
                            <CategoryIcon
                              name={cat?.icon || 'MoreHorizontal'}
                              className="w-3 h-3"
                              color={cat?.color || '#64748b'}
                            />
                          </div>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {cat?.name || 'Sem Categoria'}
                          </span>
                        </div>
                      </td>

                      {/* Account */}
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {acc?.name || 'Conta Padrão'}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-neutral-900 dark:text-white'
                        }`}
                      >
                        {isIncome
                          ? `+${formatCurrency(tx.amount, currency)}`
                          : `-${formatCurrency(tx.amount, currency)}`}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleTransactionStatus(tx.id)}
                          title="Clique para alternar status"
                          className="inline-flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-80"
                        >
                          {tx.status === 'completed' ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Efetivado</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pendente</span>
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Editar lançamento"
                            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir transação "${tx.description}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            title="Excluir lançamento"
                            className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
