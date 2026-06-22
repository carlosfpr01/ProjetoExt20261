import React, { useState } from 'react';
import { Navigate } from 'react-router';
import { KeyRound, LoaderCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError, backendApi } from '../lib/api';
import { toast } from 'sonner';

export const ChangePassword = () => {
  const { user, token } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!senhaAtual || !novaSenha || !confirmacaoSenha) {
      toast.error('Preencha todos os campos.');
      return;
    }

    if (novaSenha.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmacaoSenha) {
      toast.error('A confirmacao da senha nao confere.');
      return;
    }

    if (senhaAtual === novaSenha) {
      toast.error('A nova senha deve ser diferente da atual.');
      return;
    }

    setLoading(true);
    try {
      await backendApi.changeOwnPassword(token, user.id, {
        senhaAtual,
        novaSenha,
      });
      toast.success('Senha alterada com sucesso.');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacaoSenha('');
    } catch (caughtError) {
      const message = caughtError instanceof ApiError ? caughtError.message : 'Nao foi possivel alterar a senha.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Alterar minha senha</h1>
            <p className="mt-1 text-sm text-slate-500">Atualize sua senha de acesso com seguranca.</p>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            <span>Senha atual</span>
            <input
              type="password"
              required
              value={senhaAtual}
              onChange={event => setSenhaAtual(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Digite sua senha atual"
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            <span>Nova senha</span>
            <input
              type="password"
              required
              minLength={6}
              value={novaSenha}
              onChange={event => setNovaSenha(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Digite a nova senha"
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            <span>Confirmar nova senha</span>
            <input
              type="password"
              required
              minLength={6}
              value={confirmacaoSenha}
              onChange={event => setConfirmacaoSenha(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Repita a nova senha"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </section>
    </div>
  );
};
