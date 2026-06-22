import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router';
import {
  CalendarDays,
  KeyRound,
  Mail,
  Pencil,
  RefreshCcw,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData, type Evento, type Usuario } from '../context/DataContext';
import { SCHOOL_GRADE_OPTIONS, isSchoolGrade, toSchoolGradeLabel, type SchoolGrade } from '../lib/schoolGrades';
import { useConfirmation } from '../context/ConfirmationContext';
import { toast } from 'sonner';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const { confirm } = useConfirmation();
  const {
    usuarios,
    convites,
    eventos,
    loading,
    error,
    refreshAll,
    updateUsuario,
    removeUsuario,
    resetSenhaUsuario,
    createConviteAluno,
    createConviteProfessor,
    removeConvite,
    addEvento,
    updateEvento,
    updateEventoCapa,
    removeEventoCapa,
    removeEvento,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [studentInvite, setStudentInvite] = useState<{ nome: string; matricula: string; anoEscolar: SchoolGrade | '' }>({ nome: '', matricula: '', anoEscolar: '' });
  const [teacherInvite, setTeacherInvite] = useState({ nome: '', disciplina: '' });
  const [eventForm, setEventForm] = useState({ nome: '', descricao: '', data_inicio: '', data_fim: '', capa: null as File | null });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<{ nome: string; email: string; matricula: string; ano_escolar: SchoolGrade | ''; materia: string }>({ nome: '', email: '', matricula: '', ano_escolar: '', materia: '' });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState({ nome: '', descricao: '', data_inicio: '', data_fim: '', status: 'ativo' as 'ativo' | 'inativo' });

  if (!user || user.tipo_usuario !== 'professor') {
    return <Navigate to="/" replace />;
  }

  const isAdmin = Boolean(user.is_adm);

  const filteredUsers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return usuarios;
    return usuarios.filter(candidate => {
      const stack = [candidate.nome, candidate.email, candidate.matricula ?? '', candidate.ano_escolar ?? '', candidate.materia ?? '']
        .join(' ')
        .toLowerCase();
      return stack.includes(normalized);
    });
  }, [searchTerm, usuarios]);

  const copyToken = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  const startUserEdit = (target: Usuario) => {
    setEditingUserId(target.id);
    setEditingUser({
      nome: target.nome,
      email: target.email,
      matricula: target.matricula ?? '',
      ano_escolar: target.ano_escolar && isSchoolGrade(target.ano_escolar) ? target.ano_escolar : '',
      materia: target.materia ?? '',
    });
  };

  const startEventEdit = (target: Evento) => {
    setEditingEventId(target.id);
    setEditingEvent({
      nome: target.nome,
      descricao: target.descricao ?? '',
      data_inicio: target.data_inicio,
      data_fim: target.data_fim,
      status: target.status,
    });
  };

  const handleCreateStudentInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = await createConviteAluno(studentInvite);
    if (token) {
      toast.success('Convite de aluno gerado.', {
        description: token,
        action: {
          label: 'Copiar',
          onClick: () => copyToken(token),
        },
      });
      setStudentInvite({ nome: '', matricula: '', anoEscolar: '' });
    }
  };

  const handleCreateTeacherInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = await createConviteProfessor(teacherInvite);
    if (token) {
      toast.success('Convite de professor gerado.', {
        description: token,
        action: {
          label: 'Copiar',
          onClick: () => copyToken(token),
        },
      });
      setTeacherInvite({ nome: '', disciplina: '' });
    }
  };

  const handleCreateEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    await addEvento(eventForm);
    setEventForm({ nome: '', descricao: '', data_inicio: '', data_fim: '', capa: null });
  };

  const handleSaveUser = async () => {
    if (!editingUserId) return;
    const confirmed = await confirm({
      title: 'Confirmar edicao de usuario',
      description: 'Deseja salvar as alteracoes deste usuario?',
      confirmText: 'Salvar alteracoes',
    });
    if (!confirmed) return;
    await updateUsuario(editingUserId, editingUser);
    setEditingUserId(null);
  };

  const handleSaveEvent = async () => {
    if (!editingEventId) return;
    const confirmed = await confirm({
      title: 'Confirmar edicao de evento',
      description: 'Deseja salvar as alteracoes deste evento?',
      confirmText: 'Salvar alteracoes',
    });
    if (!confirmed) return;
    await updateEvento(editingEventId, editingEvent);
    setEditingEventId(null);
  };

  const handleRemoveConvite = async (conviteId: string) => {
    const confirmed = await confirm({
      title: 'Cancelar convite',
      description: 'Tem certeza que deseja cancelar este convite?',
      confirmText: 'Cancelar convite',
      variant: 'danger',
    });
    if (!confirmed) return;
    await removeConvite(conviteId);
  };

  const handleRemoveUsuario = async (usuarioId: string) => {
    const confirmed = await confirm({
      title: 'Excluir usuario',
      description: 'Esta acao remove o usuario e seus vinculos de projetos. Deseja continuar?',
      confirmText: 'Excluir usuario',
      variant: 'danger',
    });
    if (!confirmed) return;
    await removeUsuario(usuarioId);
  };

  const handleRemoveEventoCapa = async (eventoId: string) => {
    const confirmed = await confirm({
      title: 'Remover capa do evento',
      description: 'Deseja remover a capa deste evento?',
      confirmText: 'Remover capa',
      variant: 'danger',
    });
    if (!confirmed) return;
    await removeEventoCapa(eventoId);
  };

  const handleRemoveEvento = async (eventoId: string) => {
    const confirmed = await confirm({
      title: 'Excluir evento',
      description: 'Esta acao pode afetar projetos vinculados. Deseja realmente excluir?',
      confirmText: 'Excluir evento',
      variant: 'danger',
    });
    if (!confirmed) return;
    await removeEvento(eventoId);
  };

  const handleResetPassword = async (id: string) => {
    const novaSenha = await resetSenhaUsuario(id);
    if (novaSenha) {
      toast.success('Senha temporaria gerada.', {
        description: novaSenha,
        action: {
          label: 'Copiar',
          onClick: () => copyToken(novaSenha),
        },
      });
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Painel de gestao</h1>
            <p className="mt-1 text-sm text-slate-500">
              Professores geram convites de alunos. Admin tambem gerencia convites de professores e eventos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refreshAll()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar dados
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Gerar convite de aluno</h2>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateStudentInvite}>
            <input
              required
              value={studentInvite.nome}
              onChange={event => setStudentInvite(prev => ({ ...prev, nome: event.target.value }))}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:col-span-2"
              placeholder="Nome do aluno"
            />
            <input
              required
              value={studentInvite.matricula}
              onChange={event => setStudentInvite(prev => ({ ...prev, matricula: event.target.value }))}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Matricula"
            />
            <select
              required
              value={studentInvite.anoEscolar}
              onChange={event => setStudentInvite(prev => ({ ...prev, anoEscolar: event.target.value }))}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Selecione a serie</option>
              {SCHOOL_GRADE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
            >
              Gerar token de aluno
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-900" />
            <h2 className="text-lg font-bold text-slate-900">Gerar convite de professor</h2>
          </div>
          {isAdmin ? (
            <form className="grid gap-4" onSubmit={handleCreateTeacherInvite}>
              <input
                required
                value={teacherInvite.nome}
                onChange={event => setTeacherInvite(prev => ({ ...prev, nome: event.target.value }))}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Nome do professor"
              />
              <input
                required
                value={teacherInvite.disciplina}
                onChange={event => setTeacherInvite(prev => ({ ...prev, disciplina: event.target.value }))}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Disciplina"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Gerar token de professor
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-500">Apenas ADMIN pode emitir convites de professor.</p>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">Convites emitidos</h2>
        </div>
        <div className="space-y-3">
          {convites.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum convite retornado.</p>
          ) : (
            convites.map(convite => (
              <div key={convite.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{convite.nomeConvidado}</p>
                  <p className="text-sm text-slate-500">Status: {convite.status}</p>
                  {convite.token && <p className="mt-1 break-all text-xs text-slate-500">{convite.token}</p>}
                </div>
                <div className="flex gap-2">
                  {convite.token && (
                    <button
                      type="button"
                      onClick={() => copyToken(convite.token ?? '')}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Copiar token
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveConvite(convite.id)}
                    className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    Cancelar convite
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Users className="h-5 w-5 text-blue-600" />
              Usuarios acessiveis
            </h2>
            <p className="text-sm text-slate-500">Gestao de usuarios com edicao, exclusao e reset de senha.</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Buscar nome, email, matricula..."
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map(candidate => {
            const isEditing = editingUserId === candidate.id;
            return (
              <div key={candidate.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {isEditing ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input value={editingUser.nome} onChange={event => setEditingUser(prev => ({ ...prev, nome: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Nome" />
                    <input value={editingUser.email} onChange={event => setEditingUser(prev => ({ ...prev, email: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Email" />
                    {candidate.tipo_usuario === 'aluno' ? (
                      <>
                        <input value={editingUser.matricula} onChange={event => setEditingUser(prev => ({ ...prev, matricula: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Matricula" />
                        <select value={editingUser.ano_escolar} onChange={event => setEditingUser(prev => ({ ...prev, ano_escolar: event.target.value as SchoolGrade | '' }))} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm">
                          <option value="">Selecione a serie</option>
                          {SCHOOL_GRADE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <input value={editingUser.materia} onChange={event => setEditingUser(prev => ({ ...prev, materia: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm md:col-span-2" placeholder="Materia" />
                    )}
                    <div className="flex gap-2 md:col-span-2 md:justify-end">
                      <button type="button" onClick={() => setEditingUserId(null)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Cancelar</button>
                      <button type="button" onClick={handleSaveUser} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Salvar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{candidate.nome}</p>
                      <p className="text-sm text-slate-500">{candidate.email}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                        {candidate.is_adm ? 'ADMIN' : candidate.tipo_usuario}
                        {candidate.matricula ? ` • Matricula ${candidate.matricula}` : ''}
                        {candidate.ano_escolar ? ` • ${toSchoolGradeLabel(candidate.ano_escolar)}` : ''}
                        {candidate.materia ? ` • ${candidate.materia}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => startUserEdit(candidate)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button type="button" onClick={() => handleResetPassword(candidate.id)} className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-50">
                        Resetar senha
                      </button>
                      {candidate.id !== user.id && (
                        <button type="button" onClick={() => handleRemoveUsuario(candidate.id)} className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {isAdmin && (
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Eventos
            </h2>
            <p className="text-sm text-slate-500">Gestao de eventos com suporte a capa e ajustes dedicados.</p>
          </div>

          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleCreateEvent}>
            <input required value={eventForm.nome} onChange={event => setEventForm(prev => ({ ...prev, nome: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Nome do evento" />
            <input type="file" accept="image/*" onChange={event => setEventForm(prev => ({ ...prev, capa: event.target.files?.[0] ?? null }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
            <textarea value={eventForm.descricao} onChange={event => setEventForm(prev => ({ ...prev, descricao: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm lg:col-span-2" rows={3} placeholder="Descricao" />
            <input type="date" required value={eventForm.data_inicio} onChange={event => setEventForm(prev => ({ ...prev, data_inicio: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
            <input type="date" required value={eventForm.data_fim} onChange={event => setEventForm(prev => ({ ...prev, data_fim: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 lg:col-span-2">Criar evento</button>
          </form>

          <div className="space-y-3">
            {eventos.map(evento => {
              const isEditing = editingEventId === evento.id;
              return (
                <div key={evento.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {isEditing ? (
                    <div className="grid gap-3 lg:grid-cols-2">
                      <input value={editingEvent.nome} onChange={event => setEditingEvent(prev => ({ ...prev, nome: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Nome" />
                      <select value={editingEvent.status} onChange={event => setEditingEvent(prev => ({ ...prev, status: event.target.value as 'ativo' | 'inativo' }))} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm">
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                      <textarea value={editingEvent.descricao} onChange={event => setEditingEvent(prev => ({ ...prev, descricao: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm lg:col-span-2" rows={3} placeholder="Descricao" />
                      <input type="date" value={editingEvent.data_inicio} onChange={event => setEditingEvent(prev => ({ ...prev, data_inicio: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
                      <input type="date" value={editingEvent.data_fim} onChange={event => setEditingEvent(prev => ({ ...prev, data_fim: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
                      <div className="flex gap-2 lg:col-span-2 lg:justify-end">
                        <button type="button" onClick={() => setEditingEventId(null)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Cancelar</button>
                        <button type="button" onClick={handleSaveEvent} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{evento.nome}</p>
                        <p className="text-sm text-slate-500">{evento.descricao || 'Sem descricao'}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                          {evento.status} • {new Date(evento.data_inicio).toLocaleDateString('pt-BR')} ate {new Date(evento.data_fim).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => startEventEdit(evento)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Editar</button>
                        <label className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer">
                          Atualizar capa
                          <input type="file" accept="image/*" onChange={event => event.target.files?.[0] && updateEventoCapa(evento.id, event.target.files[0])} className="hidden" />
                        </label>
                        <button type="button" onClick={() => handleRemoveEventoCapa(evento.id)} className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-50">Remover capa</button>
                        <button type="button" onClick={() => handleRemoveEvento(evento.id)} className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50">Excluir</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
