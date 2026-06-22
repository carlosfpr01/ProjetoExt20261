import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import {
  ApiError,
  backendApi,
  type CommentSummary,
  type DiaryFileSummary,
  type DiaryMediaSummary,
  type DiarySummary,
  type EventSummary,
  type InviteSummary,
  type ProjectMemberSummary,
  type ProjectSummary,
  type UserSummary,
} from '../lib/api';

export interface Usuario extends UserSummary {
  data_cadastro: string;
  criado_por_id?: string;
}

export interface Evento extends EventSummary {}
export interface EventoUsuario {
  id: string;
  evento_id: string;
  usuario_id: string;
  data_vinculo: string;
}
export interface Projeto extends ProjectSummary {}
export interface ProjetoUsuario extends ProjectMemberSummary {}
export interface Comentario extends CommentSummary {
  moderado_por_id?: string;
  data_moderacao?: string;
}
export interface MidiaDiario extends DiaryMediaSummary {}
export interface RegistroDiarioArquivo extends DiaryFileSummary {}
export interface RegistroDiario extends DiarySummary {
  aprovado_por_id?: string;
  data_aprovacao?: string;
}
export interface Convite extends InviteSummary {}

export interface NovoProjetoPayload {
  titulo: string;
  descricao?: string;
  materiais?: string;
  area_de_conhecimento: string;
  serie: string;
  data_apresentacao: string;
  evento_id: string;
}

export interface NovoEventoPayload {
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  capa?: File | null;
}

interface DataContextType {
  usuarios: Usuario[];
  eventos: Evento[];
  eventoUsuarios: EventoUsuario[];
  projetos: Projeto[];
  projetoUsuarios: ProjetoUsuario[];
  comentarios: Comentario[];
  registrosDiario: RegistroDiario[];
  midiasDiario: MidiaDiario[];
  registroDiarioArquivos: RegistroDiarioArquivo[];
  convites: Convite[];
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  loadProjectWorkspace: (projectId: string) => Promise<void>;
  clearError: () => void;
  updateUsuario: (id: string, updates: Partial<Usuario>) => Promise<void>;
  removeUsuario: (id: string) => Promise<void>;
  resetSenhaUsuario: (id: string) => Promise<string>;
  createConviteAluno: (payload: { nome: string; matricula: string; anoEscolar: string }) => Promise<string>;
  createConviteProfessor: (payload: { nome: string; disciplina: string }) => Promise<string>;
  removeConvite: (id: string) => Promise<void>;
  addEvento: (payload: NovoEventoPayload) => Promise<void>;
  updateEvento: (id: string, payload: { nome: string; descricao?: string; data_inicio: string; data_fim: string; status: 'ativo' | 'inativo' }) => Promise<void>;
  updateEventoCapa: (id: string, file: File) => Promise<void>;
  removeEventoCapa: (id: string) => Promise<void>;
  removeEvento: (id: string) => Promise<void>;
  addProjeto: (payload: NovoProjetoPayload, alunosIds: string[]) => Promise<void>;
  updateProjeto: (id: string, updates: Partial<Projeto>) => Promise<void>;
  updateProjetoMateriaisDescricao: (id: string, payload: { descricao?: string; materiais?: string }) => Promise<void>;
  updateProjetoCapa: (id: string, file: File) => Promise<void>;
  removeProjetoCapa: (id: string) => Promise<void>;
  removeProjeto: (id: string) => Promise<void>;
  addComentario: (payload: { projeto_id: string; texto: string }) => Promise<void>;
  removeComentario: (projetoId: string, comentarioId: string) => Promise<void>;
  addRegistroDiario: (payload: { projeto_id: string; texto: string; arquivos: File[] }) => Promise<void>;
  updateRegistroDiario: (projetoId: string, registroId: string, texto: string) => Promise<void>;
  addRegistroDiarioArquivo: (projetoId: string, registroId: string, file: File) => Promise<void>;
  removeRegistroDiarioArquivo: (projetoId: string, registroId: string, chave: string) => Promise<void>;
  addAlunoAoProjeto: (projetoId: string, alunoId: string) => Promise<void>;
  removeAlunoDoProjeto: (projetoId: string, integranteId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function mapUsuario(user: UserSummary): Usuario {
  return {
    ...user,
    data_cadastro: new Date().toISOString(),
  };
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  items.forEach(item => map.set(item.id, item));
  return [...map.values()];
}

function replaceByProjectId<T extends { projeto_id: string }>(current: T[], projectId: string, next: T[]): T[] {
  return [...current.filter(item => item.projeto_id !== projectId), ...next];
}

function replaceMembersByProjectId(current: ProjetoUsuario[], projectId: string, next: ProjetoUsuario[]): ProjetoUsuario[] {
  return [...current.filter(item => item.projeto_id !== projectId), ...next];
}

function toMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { token, user, logout } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoUsuarios] = useState<EventoUsuario[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoUsuarios, setProjetoUsuarios] = useState<ProjetoUsuario[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [registrosDiario, setRegistrosDiario] = useState<RegistroDiario[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleAuthError = useCallback(
    (caughtError: unknown, fallback: string) => {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        logout();
      }
      const nextMessage = toMessage(caughtError, fallback);
      setError(nextMessage);
      toast.error(nextMessage);
      throw caughtError;
    },
    [logout]
  );

  const refreshAll = useCallback(async () => {
    if (!token || !user) {
      setUsuarios([]);
      setEventos([]);
      setProjetos([]);
      setProjetoUsuarios([]);
      setComentarios([]);
      setRegistrosDiario([]);
      setConvites([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventosResponse = await backendApi.listEvents();
      const projetosPorEvento = await Promise.all(
        eventosResponse.map(evento => backendApi.listProjectsByEvent(evento.id).catch(() => []))
      );
      const todosProjetos = dedupeById(projetosPorEvento.flat());
      const membrosPorProjeto = await Promise.all(
        todosProjetos.map(projeto => backendApi.listProjectMembers(projeto.id).catch(() => []))
      );

      const shouldLoadUsers = user.tipo_usuario === 'professor';
      const [usuariosResponse, convitesResponse] = shouldLoadUsers
        ? await Promise.all([
            backendApi.listUsers(token).catch(() => []),
            backendApi.listInvites(token).catch(() => []),
          ])
        : [[], []];

      const usuariosNormalizados = dedupeById([mapUsuario(user), ...usuariosResponse.map(mapUsuario)]);

      setUsuarios(usuariosNormalizados);
      setEventos(eventosResponse);
      setProjetos(todosProjetos);
      setProjetoUsuarios(membrosPorProjeto.flat());
      setConvites(convitesResponse);
      setComentarios([]);
      setRegistrosDiario([]);
    } catch (caughtError) {
      handleAuthError(caughtError, 'Nao foi possivel carregar os dados da aplicacao.');
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, token, user]);

  useEffect(() => {
    refreshAll().catch(() => undefined);
  }, [refreshAll]);

  const loadProjectWorkspace = useCallback(
    async (projectId: string) => {
      try {
        const [members, projectComments, projectDiary] = await Promise.all([
          backendApi.listProjectMembers(projectId),
          backendApi.listComments(projectId),
          token ? backendApi.listDiary(projectId, token).catch(() => []) : Promise.resolve([]),
        ]);

        setProjetoUsuarios(prev => replaceMembersByProjectId(prev, projectId, members));
        setComentarios(prev => replaceByProjectId(prev, projectId, projectComments));
        setRegistrosDiario(prev => replaceByProjectId(prev, projectId, projectDiary));
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel carregar os detalhes do projeto.');
      }
    },
    [handleAuthError, token]
  );

  const updateUsuario = useCallback(
    async (id: string, updates: Partial<Usuario>) => {
      if (!token) return;
      try {
        const updated = await backendApi.updateUser(token, id, {
          nome: updates.nome,
          email: updates.email,
          matricula: updates.matricula,
          anoEscolar: updates.ano_escolar,
          materia: updates.materia,
        });
        setUsuarios(prev => prev.map(item => (item.id === id ? { ...mapUsuario(updated), data_cadastro: item.data_cadastro } : item)));
        toast.success('Usuario atualizado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel atualizar o usuario.');
      }
    },
    [handleAuthError, token]
  );

  const removeUsuario = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await backendApi.deleteUser(token, id);
        setUsuarios(prev => prev.filter(item => item.id !== id));
        setProjetoUsuarios(prev => prev.filter(item => item.usuario_id !== id));
        toast.success('Usuario removido com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel remover o usuario.');
      }
    },
    [handleAuthError, token]
  );

  const resetSenhaUsuario = useCallback(
    async (id: string) => {
      if (!token) return '';
      try {
        const response = await backendApi.resetUserPassword(token, id);
        toast.success('Senha temporaria gerada com sucesso.');
        return response.novaSenha;
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel resetar a senha.');
        return '';
      }
    },
    [handleAuthError, token]
  );

  const createConviteAluno = useCallback(
    async (payload: { nome: string; matricula: string; anoEscolar: string }) => {
      if (!token) return '';
      try {
        const response = await backendApi.createStudentInvite(token, payload);
        await refreshAll();
        toast.success('Convite de aluno gerado com sucesso.');
        return response.token;
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel gerar o convite do aluno.');
        return '';
      }
    },
    [handleAuthError, refreshAll, token]
  );

  const createConviteProfessor = useCallback(
    async (payload: { nome: string; disciplina: string }) => {
      if (!token) return '';
      try {
        const response = await backendApi.createProfessorInvite(token, payload);
        await refreshAll();
        toast.success('Convite de professor gerado com sucesso.');
        return response.token;
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel gerar o convite do professor.');
        return '';
      }
    },
    [handleAuthError, refreshAll, token]
  );

  const removeConvite = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await backendApi.deleteInvite(token, id);
        setConvites(prev => prev.filter(item => item.id !== id));
        toast.success('Convite cancelado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel remover o convite.');
      }
    },
    [handleAuthError, token]
  );

  const addEvento = useCallback(
    async (payload: NovoEventoPayload) => {
      if (!token) return;
      try {
        const novoEvento = await backendApi.createEvent(token, {
          nome: payload.nome,
          descricao: payload.descricao,
          dataInicio: payload.data_inicio,
          dataFim: payload.data_fim,
          capa: payload.capa,
        });
        setEventos(prev => [novoEvento, ...prev]);
        toast.success('Evento criado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel criar o evento.');
      }
    },
    [handleAuthError, token]
  );

  const updateEvento = useCallback(
    async (id: string, payload: { nome: string; descricao?: string; data_inicio: string; data_fim: string; status: 'ativo' | 'inativo' }) => {
      if (!token) return;
      try {
        const eventoAtualizado = await backendApi.updateEvent(token, id, {
          nome: payload.nome,
          descricao: payload.descricao,
          dataInicio: payload.data_inicio,
          dataFim: payload.data_fim,
          situacao: payload.status === 'ativo' ? 'ATIVO' : 'ENCERRADO',
        });
        setEventos(prev => prev.map(item => (item.id === id ? eventoAtualizado : item)));
        toast.success('Evento atualizado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel atualizar o evento.');
      }
    },
    [handleAuthError, token]
  );

  const updateEventoCapa = useCallback(
    async (id: string, file: File) => {
      if (!token) return;
      try {
        const eventoAtualizado = await backendApi.updateEventCover(token, id, file);
        setEventos(prev => prev.map(item => (item.id === id ? eventoAtualizado : item)));
        toast.success('Capa do evento atualizada com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel atualizar a capa do evento.');
      }
    },
    [handleAuthError, token]
  );

  const removeEventoCapa = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        const updated = await backendApi.deleteEventCover(token, id);
        setEventos(prev => prev.map(item => (item.id === id ? updated : item)));
        toast.success('Capa do evento removida com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel remover a capa do evento.');
      }
    },
    [handleAuthError, token]
  );

  const removeEvento = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await backendApi.deleteEvent(token, id);
        setEventos(prev => prev.filter(item => item.id !== id));
        setProjetos(prev => prev.filter(item => item.evento_id !== id));
        toast.success('Evento removido com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel remover o evento.');
      }
    },
    [handleAuthError, token]
  );

  const addProjeto = useCallback(
    async (payload: NovoProjetoPayload, alunosIds: string[]) => {
      if (!token || !user) return;
      try {
        const novoProjeto = await backendApi.createProject(token, {
          titulo: payload.titulo,
          descricao: payload.descricao,
          materiais: payload.materiais,
          areaDeConhecimento: payload.area_de_conhecimento,
          serie: payload.serie,
          eventoId: Number(payload.evento_id),
          dataApresentacao: payload.data_apresentacao,
        });

        setProjetos(prev => [novoProjeto, ...prev]);

        const membrosAtuais = await backendApi.listProjectMembers(novoProjeto.id).catch(() => []);
        const possuiCriador = membrosAtuais.some(item => item.usuario_id === user.id);
        if (!possuiCriador) {
          await backendApi.addProjectMember(token, novoProjeto.id, {
            usuarioId: Number(user.id),
            tipoIntegrante: 'PROFESSOR',
          }).catch(() => undefined);
        }

        for (const alunoId of alunosIds) {
          await backendApi.addProjectMember(token, novoProjeto.id, {
            usuarioId: Number(alunoId),
            tipoIntegrante: 'ALUNO',
          });
        }

        await loadProjectWorkspace(novoProjeto.id);
        toast.success('Projeto criado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel criar o projeto.');
      }
    },
    [handleAuthError, loadProjectWorkspace, token, user]
  );

  const updateProjeto = useCallback(
    async (id: string, updates: Partial<Projeto>) => {
      if (!token) return;
      const projetoAtual = projetos.find(item => item.id === id);
      if (!projetoAtual) return;

      try {
        const projetoAtualizado = await backendApi.updateProject(token, id, {
          titulo: updates.titulo ?? projetoAtual.titulo,
          descricao: updates.descricao ?? projetoAtual.descricao,
          materiais: updates.materiais ?? projetoAtual.materiais,
          areaDeConhecimento: updates.area_de_conhecimento ?? projetoAtual.area_de_conhecimento,
          serie: updates.serie ?? projetoAtual.serie,
          dataApresentacao: updates.data_apresentacao ?? projetoAtual.data_apresentacao,
          situacao: (updates.situacao ?? projetoAtual.situacao) === 'fechado' ? 'FECHADO' : 'ATIVO',
        });
        setProjetos(prev => prev.map(item => (item.id === id ? { ...item, ...projetoAtualizado } : item)));
        toast.success('Projeto atualizado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel atualizar o projeto.');
      }
    },
    [handleAuthError, projetos, token]
  );

  const updateProjetoMateriaisDescricao = useCallback(
    async (id: string, payload: { descricao?: string; materiais?: string }) => {
      if (!token) return;
      try {
        const projetoAtualizado = await backendApi.updateProjectMaterialsDescription(token, id, payload);
        setProjetos(prev => prev.map(item => (item.id === id ? { ...item, ...projetoAtualizado } : item)));
        toast.success('Conteudo do projeto atualizado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel atualizar materiais e descricao.');
      }
    },
    [handleAuthError, token]
  );

  const updateProjetoCapa = useCallback(
    async (id: string, file: File) => {
      if (!token) return;
      try {
        const projetoAtualizado = await backendApi.updateProjectCover(token, id, file);
        setProjetos(prev => prev.map(item => (item.id === id ? { ...item, ...projetoAtualizado } : item)));
        toast.success('Capa do projeto atualizada com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel atualizar a capa do projeto.');
      }
    },
    [handleAuthError, token]
  );

  const removeProjetoCapa = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        const projetoAtualizado = await backendApi.deleteProjectCover(token, id);
        setProjetos(prev => prev.map(item => (item.id === id ? { ...item, ...projetoAtualizado } : item)));
        toast.success('Capa do projeto removida com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel remover a capa do projeto.');
      }
    },
    [handleAuthError, token]
  );

  const removeProjeto = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await backendApi.deleteProject(token, id);
        setProjetos(prev => prev.filter(item => item.id !== id));
        setProjetoUsuarios(prev => prev.filter(item => item.projeto_id !== id));
        setComentarios(prev => prev.filter(item => item.projeto_id !== id));
        setRegistrosDiario(prev => prev.filter(item => item.projeto_id !== id));
        toast.success('Projeto removido com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel remover o projeto.');
      }
    },
    [handleAuthError, token]
  );

  const addComentario = useCallback(
    async (payload: { projeto_id: string; texto: string }) => {
      if (!token) return;
      try {
        const comentario = await backendApi.addComment(token, payload.projeto_id, payload.texto);
        setComentarios(prev => [...prev.filter(item => item.id !== comentario.id), comentario]);
        toast.success('Comentario publicado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel adicionar o comentario.');
      }
    },
    [handleAuthError, token]
  );

  const removeComentario = useCallback(
    async (projetoId: string, comentarioId: string) => {
      if (!token) return;
      try {
        await backendApi.deleteComment(token, projetoId, comentarioId);
        setComentarios(prev => prev.filter(item => item.id !== comentarioId));
        toast.success('Comentario removido com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel remover o comentario.');
      }
    },
    [handleAuthError, token]
  );

  const addRegistroDiario = useCallback(
    async (payload: { projeto_id: string; texto: string; arquivos: File[] }) => {
      if (!token) return;
      try {
        const registro = await backendApi.addDiary(token, payload.projeto_id, payload);
        setRegistrosDiario(prev => [...prev.filter(item => item.id !== registro.id), registro]);
        toast.success('Registro diario criado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel criar o registro diario.');
      }
    },
    [handleAuthError, token]
  );

  const updateRegistroDiario = useCallback(
    async (projetoId: string, registroId: string, texto: string) => {
      if (!token) return;
      try {
        const registro = await backendApi.updateDiary(token, projetoId, registroId, texto);
        setRegistrosDiario(prev => prev.map(item => (item.id === registroId ? { ...item, ...registro } : item)));
        toast.success('Registro diario atualizado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel atualizar o registro diario.');
      }
    },
    [handleAuthError, token]
  );

  const addRegistroDiarioArquivo = useCallback(
    async (projetoId: string, registroId: string, file: File) => {
      if (!token) return;
      try {
        const registro = await backendApi.addDiaryFile(token, projetoId, registroId, file);
        setRegistrosDiario(prev => prev.map(item => (item.id === registroId ? { ...item, ...registro } : item)));
        toast.success('Arquivo anexado com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel anexar o arquivo.');
      }
    },
    [handleAuthError, token]
  );

  const removeRegistroDiarioArquivo = useCallback(
    async (projetoId: string, registroId: string, chave: string) => {
      if (!token) return;
      try {
        const registro = await backendApi.deleteDiaryFile(token, projetoId, registroId, chave);
        setRegistrosDiario(prev => prev.map(item => (item.id === registroId ? { ...item, ...registro } : item)));
        toast.success('Arquivo removido com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel remover o arquivo do registro.');
      }
    },
    [handleAuthError, token]
  );

  const addAlunoAoProjeto = useCallback(
    async (projetoId: string, alunoId: string) => {
      if (!token) return;
      try {
        const integrante = await backendApi.addProjectMember(token, projetoId, {
          usuarioId: Number(alunoId),
          tipoIntegrante: 'ALUNO',
        });
        setProjetoUsuarios(prev => [...prev.filter(item => item.id !== integrante.id), integrante]);
        toast.success('Aluno adicionado ao projeto com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel adicionar o aluno ao projeto.');
      }
    },
    [handleAuthError, token]
  );

  const removeAlunoDoProjeto = useCallback(
    async (projetoId: string, integranteId: string) => {
      if (!token) return;
      try {
        await backendApi.removeProjectMember(token, projetoId, integranteId);
        setProjetoUsuarios(prev => prev.filter(item => item.id !== integranteId));
        toast.success('Integrante removido do projeto com sucesso.');
      } catch (caughtError) {
        handleAuthError(caughtError, 'Nao foi possivel remover o integrante do projeto.');
      }
    },
    [handleAuthError, token]
  );

  const midiasDiario = useMemo(() => registrosDiario.flatMap(registro => registro.imagens), [registrosDiario]);
  const registroDiarioArquivos = useMemo(() => registrosDiario.flatMap(registro => registro.arquivos), [registrosDiario]);

  return (
    <DataContext.Provider
      value={{
        usuarios,
        eventos,
        eventoUsuarios,
        projetos,
        projetoUsuarios,
        comentarios,
        registrosDiario,
        midiasDiario,
        registroDiarioArquivos,
        convites,
        loading,
        error,
        refreshAll,
        loadProjectWorkspace,
        clearError,
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
        addProjeto,
        updateProjeto,
        updateProjetoMateriaisDescricao,
        updateProjetoCapa,
        removeProjetoCapa,
        removeProjeto,
        addComentario,
        removeComentario,
        addRegistroDiario,
        updateRegistroDiario,
        addRegistroDiarioArquivo,
        removeRegistroDiarioArquivo,
        addAlunoAoProjeto,
        removeAlunoDoProjeto,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
