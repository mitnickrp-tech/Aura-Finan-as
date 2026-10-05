import React, { useRef, useState } from 'react';
import { X, Download, Upload, RotateCcw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const {
    exportDataJSON,
    exportTransactionsCSV,
    importDataJSON,
    resetToDefaultData,
    clearAllData,
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setFeedbackMessage({ text: 'Dados importados com sucesso!', type: 'success' });
        } else {
          setFeedbackMessage({ text: 'Arquivo inválido. Verifique o formato JSON.', type: 'error' });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Gerenciamento de Dados & Backup
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedbackMessage && (
          <div
            className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        <div className="space-y-3 text-xs">
          {/* Export JSON */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">Exportar Backup Completo</p>
              <p className="text-neutral-500 text-[11px]">Salva transações, contas, metas e orçamentos em JSON</p>
            </div>
            <button
              onClick={exportDataJSON}
              className="px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Exportar JSON
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">Exportar Extrato CSV</p>
              <p className="text-neutral-500 text-[11px]">Compatível com Excel, Google Planilhas e bancos</p>
            </div>
            <button
              onClick={exportTransactionsCSV}
              className="px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Exportar CSV
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">Restaurar de Backup</p>
              <p className="text-neutral-500 text-[11px]">Carregue um arquivo JSON gerado anteriormente</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Importar JSON
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">Dados de Demonstração</p>
              <p className="text-neutral-500 text-[11px]">Recarrega dados realistas completos para teste</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Deseja recarregar o conjunto de dados demonstrativo padrão?')) {
                  resetToDefaultData();
                  setFeedbackMessage({ text: 'Dados de demonstração restaurados!', type: 'success' });
                }
              }}
              className="px-3 py-1.5 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Restaurar Padrão
            </button>
          </div>

          {/* Clear Data */}
          <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-rose-700 dark:text-rose-400">Limpar Todos os Lançamentos</p>
              <p className="text-neutral-500 text-[11px]">Apaga todas as transações e metas salvas</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Atenção: deseja realmente zerar todos os lançamentos? Essa ação não pode ser desfeita.')) {
                  clearAllData();
                  setFeedbackMessage({ text: 'Todos os lançamentos foram apagados.', type: 'success' });
                }
              }}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-500 transition-colors"
            >
              Zerar Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
