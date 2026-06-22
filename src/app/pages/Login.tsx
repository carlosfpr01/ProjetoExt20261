import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, GraduationCap, KeyRound, Lock, LogIn, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login, register, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await login({ email, senha: password });
      navigate('/');
    } catch {
      return;
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await register({ token: inviteToken, email: registerEmail, senha: registerPassword });
      navigate('/');
    } catch {
      return;
    }
  };

  const handleFieldChange = (setter: (value: string) => void) => (value: string) => {
    if (error) clearError();
    setter(value);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%)] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl bg-slate-950 text-white shadow-2xl overflow-hidden border border-slate-800">
          <div className="p-8 md:p-10 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              Feira de Ciencias
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight">EduProjetos conectado ao sistema real.</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                O acesso usa autenticação por token e o cadastro depende do convite recebido.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-cyan-100">Login</h2>
                <p className="mt-2 text-sm text-slate-300">Professores, admins e alunos entram com email e senha cadastrados.</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-cyan-100">Convites</h2>
                <p className="mt-2 text-sm text-slate-300">Professores geram convite de aluno. Admin gera convite de professor.</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-cyan-100">Cadastro</h2>
                <p className="mt-2 text-sm text-slate-300">O convidado finaliza o cadastro com token, email e senha na própria tela.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-600 p-3 text-white">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Entrar ou concluir cadastro</h2>
                <p className="text-sm text-slate-500">Use suas credenciais para entrar.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-2">
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Entrar</h3>
                <p className="text-sm text-slate-500">Acesse sua conta com email e senha.</p>
              </div>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={event => handleFieldChange(setEmail)(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="voce@escola.com"
                  />
                </div>
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Senha</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={event => handleFieldChange(setPassword)(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Sua senha"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Cadastro por convite</h3>
                <p className="text-sm text-slate-500">Conclua o cadastro e entre automaticamente.</p>
              </div>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Token de convite</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={inviteToken}
                    onChange={event => handleFieldChange(setInviteToken)(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Cole o token recebido"
                  />
                </div>
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={event => handleFieldChange(setRegisterEmail)(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="novo.usuario@escola.com"
                  />
                </div>
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Senha</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={registerPassword}
                    onChange={event => handleFieldChange(setRegisterPassword)(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Minimo de 6 caracteres"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? 'Concluindo cadastro...' : 'Concluir cadastro'}
              </button>
            </form>
          </div>

          <div className="border-t border-slate-200 px-8 py-5 text-sm text-slate-500">
            Professores distribuem o token para alunos. Admin distribui token para professores.
            <span className="ml-2 inline-flex items-center gap-1 font-medium text-blue-700">
              Fluxo orientado pelo sistema
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};
