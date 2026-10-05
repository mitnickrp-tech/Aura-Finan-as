import React, { useMemo } from 'react';
import { Download, TrendingUp, DollarSign, CreditCard, PieChart } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercent, getMonthName } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { transactions, categories, accounts, currency, exportTransactionsCSV } = useFinance();

  // Monthly historical aggregates
  const monthlyReports = useMemo(() => {
    const map: Record<string, { monthKey: string; label: string; income: number; expense: number; count: number }> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${getMonthName(d.getMonth())} ${d.getFullYear()}`;
      map[key] = { monthKey: key, label, income: 0, expense: 0, count: 0 };
    }

    for (const tx of transactions) {
      if (!tx.date) continue;
      const key = tx.date.slice(0, 7);
      if (map[key]) {
        map[key].count += 1;
        if (tx.type === 'income') map[key].income += tx.amount;
        if (tx.type === 'expense') map[key].expense += tx.amount;
      }
    }

    return Object.values(map).map((m) => {
      const net = m.income - m.expense;
      const savingsRate = m.income > 0 ? Math.max(0, (net / m.income) * 100) : 0;
      return {
        ...m,
        net,
        savingsRate,
      };
    });
  }, [transactions]);

  // Top 5 largest expenses
  const topExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  // Payment method breakdown
  const paymentMethodStats = useMemo(() => {
    const map: Record<string, { label: string; count: number; total: number }> = {
      pix: { label: 'PIX', count: 0, total: 0 },
      credit_card: { label: 'Cartão de Crédito', count: 0, total: 0 },
      debit_card: { label: 'Cartão de Débito', count: 0, total: 0 },
      boleto: { label: 'Boleto Bancário', count: 0, total: 0 },
      cash: { label: 'Dinheiro', count: 0, total: 0 },
      transfer: { label: 'Transferência', count: 0, total: 0 },
    };

    let totalSpent = 0;
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        totalSpent += tx.amount;
        if (map[tx.paymentMethod]) {
          map[tx.paymentMethod].count += 1;
          map[tx.paymentMethod].total += tx.amount;
        }
      }
    }

    return Object.values(map)
      .map((m) => ({
        ...m,
        percentage: totalSpent > 0 ? (m.total / totalSpent) * 100 : 0,
      }))
      .filter((m) => m.count > 0)
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Relatórios & Demonstração Financeira
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Análise aprofundada de receitas, despesas, métodos de pagamento e poupança
          </p>
        </div>

        <button
          onClick={exportTransactionsCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar Extrato Completo (CSV)</span>
        </button>
      </div>

      {/* Monthly Comparative Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs p-5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Histórico Consolidado (Últimos 6 Meses)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono tabular-nums">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-500">
                <th className="py-2.5 px-3 font-sans font-medium">Mês de Referência</th>
                <th className="py-2.5 px-3 text-right">Receitas</th>
                <th className="py-2.5 px-3 text-right">Despesas</th>
                <th className="py-2.5 px-3 text-right">Resultado Líquido</th>
                <th className="py-2.5 px-3 text-right">Taxa Poupança</th>
                <th className="py-2.5 px-3 text-center font-sans font-medium">Lançamentos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {monthlyReports.map((m) => (
                <tr key={m.monthKey} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <td className="py-2.5 px-3 font-sans font-medium text-neutral-900 dark:text-white">
                    {m.label}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatCurrency(m.income, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-semibold">
                    {formatCurrency(m.expense, currency)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-semibold ${
                      m.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {m.net >= 0 ? `+${formatCurrency(m.net, currency)}` : formatCurrency(m.net, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-700 dark:text-neutral-300">
                    {formatPercent(m.savingsRate)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-500">
                    {m.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Top Expenses & Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top 5 Expenses */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
            Top 5 Maiores Despesas Registradas
          </h3>

          <div className="space-y-3">
            {topExpenses.map((t, idx) => {
              const cat = categories.find((c) => c.id === t.category);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 bg-neutral-50/70 dark:bg-neutral-800/40 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-neutral-400 font-semibold w-4">
                      0{idx + 1}.
                    </span>
                    <div className="truncate">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {t.description}
                      </p>
                      <span className="text-[11px] text-neutral-500">
                        {cat?.name || 'Geral'} · {t.date}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold tabular-nums text-neutral-900 dark:text-white shrink-0 ml-2">
                    {formatCurrency(t.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
            Despesas por Forma de Pagamento
          </h3>

          <div className="space-y-3">
            {paymentMethodStats.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                    {item.label} ({item.count}x)
                  </span>
                  <div className="font-mono tabular-nums text-right">
                    <span className="font-semibold text-neutral-900 dark:text-white mr-2">
                      {formatCurrency(item.total, currency)}
                    </span>
                    <span className="text-neutral-500 text-[11px]">
                      {formatPercent(item.percentage)}
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
