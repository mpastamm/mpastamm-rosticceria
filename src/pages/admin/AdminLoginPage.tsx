import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, Store } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { isSupabaseConfigured, supabase } from '../../services/supabaseClient';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToStore,
}) => {
  const [email, setEmail] = useState(import.meta.env.VITE_DEMO_ADMIN_EMAIL || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (authError) throw authError;
      } else {
        const demoEnabled = import.meta.env.VITE_ALLOW_LOCAL_ADMIN === 'true';
        const demoEmail = (import.meta.env.VITE_DEMO_ADMIN_EMAIL || '').trim().toLowerCase();
        const demoPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || '';
        if (!demoEnabled || email.trim().toLowerCase() !== demoEmail || password !== demoPassword) {
          throw new Error('Credenziali demo non valide o modalità locale disabilitata.');
        }
      }

      StorageService.setAdminAuth({
        isAuthenticated: true,
        email: email.trim().toLowerCase(),
      });
      onLoginSuccess();
    } catch {
      setError('Credenziali non valide. Verifica email e password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#182E22] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2D533E] space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1B3B2B] text-white flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1C211E]">
            'Mpastamm Rosticceria
          </h1>
          <p className="text-xs uppercase tracking-wider text-[#7A8A7E] font-bold">
            Accesso Riservato Gestione Locale
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
              Email Amministratore
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mpastamm.it"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
              />
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD1] text-[11px] text-[#55645A]">
            {isSupabaseConfigured
              ? 'Accesso gestito da Supabase Auth.'
              : 'Modalità demo locale: configura VITE_ALLOW_LOCAL_ADMIN e le credenziali in .env.local.'}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#1B3B2B] hover:bg-[#28553E] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Verifica in corso...' : 'Accedi al Pannello'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#F0EBE1]">
          <button
            onClick={onBackToStore}
            className="text-xs text-[#7A8A7E] hover:text-[#1B3B2B] font-semibold flex items-center justify-center gap-1 mx-auto"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Torna alla Vetrina Pubblica</span>
          </button>
        </div>
      </div>
    </div>
  );
};
