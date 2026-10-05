import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle, Clock, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { RecurringBill } from '../../types/finance';

export const RecurringBillsView: React.FC = () => {
  const { recurring, categories, accounts, addRecurring, deleteRecurring, payRecurringBill, currency } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [dueDay, setDueDay] = useState(10);
  const [category, setCategory] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
    if (!title.trim() || isNaN(cleanAmount) || cleanAmount <= 0) return;

    addRecurring({
      title: title.trim(),
      amount: cleanAmount,
      type,
      dueDay,
      category,
      accountId,
      isAutoPaid: false,
    });

    setTitle('');
    setAmountStr('');
    setIsModalOpen(false);
  };

  const totalFixedExpense = recurring
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalFixedIncome = recurring
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Contas Fixas & Recorrências
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Monitore despesas fixas, assinaturas e recebimentos programados todo mês
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono tabular-nums text-xs">
              <span className="text-neutral-500 block text-[11px]">Custo Fixo Mensal</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalFixedExpense, currency)}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Recorrência</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurring.map((bill) => {
          const cat = categories.find((c) => c.id === bill.category);
          const acc = accounts.find((a) => a.id === bill.accountId);
          const isPaidThisMonth = bill.lastPaidMonth === currentMonthStr;
          const isIncome = bill.type === 'income';

          return (
            <div
              key={bill.id}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat?.color || '#94a3b8'}20` }}
                    >
                      <CategoryIcon
                        name={cat?.icon || 'Calendar'}
                        className="w-4 h-4"
                        color={cat?.color || '#64748b'}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {bill.title}
                      </h4>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        Vence todo dia {bill.dueDay}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remover "${bill.title}" das recorrências?`)) {
                        deleteRecurring(bill.id);
                      }
                    }}
                    className="p-1 text-neutral-400 hover:text-rose-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="my-2">
                  <span className="text-[11px] text-neutral-500 block">Valor Mensal</span>
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-900 dark:text-white'
                    }`}
                  >
                    {isIncome ? `+${formatCurrency(bill.amount, currency)}` : formatCurrency(bill.amount, currency)}
                  </span>
                </div>

                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-2">
                  <span>{cat?.name || 'Geral'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{acc?.name || 'Conta Padrão'}</span>
                </div>
              </div>

              {/* Status & Quick Pay */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  {isPaidThisMonth ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Pago este mês</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pendente este mês</span>
                    </span>
                  )}
                </div>

                {!isPaidThisMonth && (
                  <button
                    onClick={() => payRecurringBill(bill.id)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
                  >
                    Efetivar agora
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Recurring */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">
              Nova Conta Fixa / Recorrência
            </h3>
            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Título da Conta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel, Internet Fibra, Spotify..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Tipo
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'expense' | 'income')}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  >
                    <option value="expense">Despesa Fixa</option>
                    <option value="income">Receita Fixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Dia do Vencimento
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Valor Estimado (R$)
                </label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Conta Débito/Crédito
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  Salvar Recorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
