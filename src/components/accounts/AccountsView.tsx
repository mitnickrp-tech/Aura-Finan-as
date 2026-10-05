import React, { useState } from 'react';
import { CreditCard, Landmark, Wallet, Plus, TrendingUp, DollarSign, Calendar, Edit2, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Account, AccountType } from '../../types/finance';

export const AccountsView: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, currency } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [institution, setInstitution] = useState('');
  const [initialBalanceStr, setInitialBalanceStr] = useState('');
  const [creditLimitStr, setCreditLimitStr] = useState('');
  const [closingDay, setClosingDay] = useState(28);
  const [dueDay, setDueDay] = useState(5);
  const [color, setColor] = useState('#8b5cf6');

  const openNewAccount = () => {
    setEditingAccount(null);
    setName('');
    setType('checking');
    setInstitution('');
    setInitialBalanceStr('');
    setCreditLimitStr('');
    setClosingDay(28);
    setDueDay(5);
    setColor('#8b5cf6');
    setIsModalOpen(true);
  };

  const openEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInstitution(acc.institution);
    setInitialBalanceStr(acc.initialBalance.toString());
    setCreditLimitStr(acc.creditLimit ? acc.creditLimit.toString() : '');
    setClosingDay(acc.closingDay || 28);
    setDueDay(acc.dueDay || 5);
    setColor(acc.color);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const initialBal = parseFloat(initialBalanceStr.replace(',', '.')) || 0;
    const limit = creditLimitStr ? parseFloat(creditLimitStr.replace(',', '.')) : undefined;

    if (!name.trim()) return;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: name.trim(),
        type,
        institution: institution.trim() || 'Outro',
        initialBalance: initialBal,
        creditLimit: limit,
        closingDay: type === 'credit' ? closingDay : undefined,
        dueDay: type === 'credit' ? dueDay : undefined,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        institution: institution.trim() || 'Outro',
        initialBalance: initialBal,
        creditLimit: limit,
        closingDay: type === 'credit' ? closingDay : undefined,
        dueDay: type === 'credit' ? dueDay : undefined,
        color,
      });
    }

    setIsModalOpen(false);
  };

  // Group accounts
  const bankAccounts = accounts.filter((a) => a.type === 'checking' || a.type === 'savings' || a.type === 'cash');
  const creditCards = accounts.filter((a) => a.type === 'credit');
  const investmentAccounts = accounts.filter((a) => a.type === 'investment');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Contas Bancárias & Cartões
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie suas carteiras, cartões de crédito e investimentos em um único lugar
          </p>
        </div>

        <button
          onClick={openNewAccount}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Conta / Cartão</span>
        </button>
      </div>

      {/* Cartões de Crédito */}
      {creditCards.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Cartões de Crédito
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map((card) => {
              const invoice = Math.abs(card.currentBalance);
              const limit = card.creditLimit || 0;
              const available = Math.max(0, limit - invoice);
              const usagePercent = limit > 0 ? (invoice / limit) * 100 : 0;

              return (
                <div
                  key={card.id}
                  className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${card.color}20`, color: card.color }}
                        >
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {card.name}
                          </h4>
                          <span className="text-[11px] text-neutral-400">
                            {card.institution}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditAccount(card)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir ${card.name}?`)) deleteAccount(card.id);
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Invoice amount */}
                    <div className="my-3">
                      <span className="text-[11px] text-neutral-500 block">Fatura Atual</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                        {formatCurrency(invoice, currency)}
                      </span>
                    </div>

                    {/* Limit progress */}
                    <div className="space-y-1.5 mb-3">
                      <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, usagePercent)}%` }}
                          className={`h-full rounded-full ${
                            usagePercent > 80 ? 'bg-rose-500' : 'bg-purple-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-neutral-500">
                        <span>Disponível: {formatCurrency(available, currency)}</span>
                        <span>Limite: {formatCurrency(limit, currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500 flex items-center justify-between">
                    <span>Fecha dia {card.closingDay || 28}</span>
                    <span>Vence dia {card.dueDay || 5}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contas Correntes e Carteira */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Contas Correntes & Carteiras
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                    >
                      {acc.type === 'cash' ? (
                        <Wallet className="w-5 h-5" />
                      ) : (
                        <Landmark className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {acc.name}
                      </h4>
                      <span className="text-[11px] text-neutral-400">{acc.institution}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditAccount(acc)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir ${acc.name}?`)) deleteAccount(acc.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-2">
                  <span className="text-[11px] text-neutral-500 block">Saldo Disponível</span>
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      acc.currentBalance >= 0
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(acc.currentBalance, currency)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500 flex items-center justify-between">
                <span>Tipo: {acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'cash' ? 'Espécie' : 'Poupança'}</span>
                <span>Saldo Inicial: {formatCurrency(acc.initialBalance, currency)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investimentos */}
      {investmentAccounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Investimentos & Corretoras
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investmentAccounts.map((inv) => (
              <div
                key={inv.id}
                className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${inv.color}20`, color: inv.color }}
                      >
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {inv.name}
                        </h4>
                        <span className="text-[11px] text-neutral-400">{inv.institution}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditAccount(inv)}
                        className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir ${inv.name}?`)) deleteAccount(inv.id);
                        }}
                        className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="my-2">
                    <span className="text-[11px] text-neutral-500 block">Patrimônio Investido</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(inv.currentBalance, currency)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500">
                  <span>Renda Fixa, Ações e Fundos Imobiliários</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">
              {editingAccount ? 'Editar Conta' : 'Cadastrar Nova Conta'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Nubank, Itaú Corrente, Carteira..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="credit">Cartão de Crédito</option>
                    <option value="investment">Investimento / Corretora</option>
                    <option value="savings">Poupança</option>
                    <option value="cash">Dinheiro em Espécie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Instituição
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Nubank, Bradesco..."
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Saldo Inicial (R$)
                </label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={initialBalanceStr}
                  onChange={(e) => setInitialBalanceStr(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono"
                />
              </div>

              {type === 'credit' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Limite de Crédito Total (R$)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 5000,00"
                      value={creditLimitStr}
                      onChange={(e) => setCreditLimitStr(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Dia do Fechamento
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={closingDay}
                        onChange={(e) => setClosingDay(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-mono"
                      />
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
                      />
                    </div>
                  </div>
                </>
              )}

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
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
