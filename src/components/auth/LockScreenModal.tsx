import React, { useState } from 'react';
import { Lock, ArrowRight, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LockScreenModal: React.FC = () => {
  const { currentUser, isLocked, unlockScreen, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLocked || !currentUser) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = await unlockScreen(password);
    if (!res.success) {
      setError(res.error || 'Senha incorreta.');
    } else {
      setPassword('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 text-center">
        {/* Lock Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Sessão Bloqueada
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Digite a senha de <strong>{currentUser.name}</strong> para continuar
        </p>
        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{currentUser.email}</p>

        {error && (
          <div className="mt-4 p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="mt-5 space-y-3">
          <input
            type="password"
            placeholder="Sua senha de acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-center"
            autoFocus
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Desbloquear Painel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Trocar de conta / Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};
