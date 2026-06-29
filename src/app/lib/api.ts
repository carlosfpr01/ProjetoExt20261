const apiBaseUrl = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not configured.');
}

const API_BASE_URL = apiBaseUrl.replace(/\/$/, '');

const s3BaseUrl = import.meta.env.VITE_S3_BASE_URL;

if (!s3BaseUrl) {
  throw new Error('VITE_S3_BASE_URL is not configured.');
}

export const S3_BASE_URL = s3BaseUrl.replace(/\/$/, '');

export const API_LOADING_EVENT = 'edu-projetos:api-loading-change';

let pendingApiRequests = 0;

function notifyApiLoadingChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(API_LOADING_EVENT, {
      detail: {
        pending: pendingApiRequests,
        loading: pendingApiRequests > 0,
      },
    })
  );
}

function beginApiRequest() {
  pendingApiRequests += 1;
  notifyApiLoadingChange();
}

function endApiRequest() {
  pendingApiRequests = Math.max(0, pendingApiRequests - 1);
  notifyApiLoadingChange();
}

export function getPendingApiRequests() {
  return pendingApiRequests;
}

export type BackendRole = 'ADMIN' | 'PROFESSOR' | 'ALUNO';
export type FrontRole = 'professor' | 'aluno';

export interface ApiErrorPayload {
  message?: string;
  code?: string;
  timestamp?: string;
  details?: string[] | null;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: string[] | null;

  constructor(status: number, payload?: ApiErrorPayload) {
    super(payload?.message ?? 'Erro ao comunicar com a API.');
    this.name = 'ApiError';
    this.status = status;
    this.code = payload?.code;
    this.details = payload?.details ?? null;
  }
}

export interface UserSummary {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: FrontRole;
  backendRole: BackendRole;
  is_adm: boolean;
  matricula?: string;
  ano_escolar?: string;
  materia?: string;
}

export interface InviteSummary {
  id: string;
  nomeConvidado: string;
  status: string;
  token?: string;
  expiraEm?: string;
}

export interface EventSummary {
  id: string;
  nome: string;
  descricao?: string;
  imagem_capa?: string;
  data_inicio: string;
  data_fim: string;
  status: 'ativo' | 'inativo';
  criado_por_id: string;
  data_criacao?: string;
}

export interface ProjectSummary {
  id: string;
  titulo: string;
  materiais: string;
  descricao: string;
  imagem_capa?: string;
  data_criacao: string;
  data_apresentacao: string;
  situacao: 'ativo' | 'fechado';
  area_de_conhecimento: string;
  serie: string;
  criado_por_id: string;
  evento_id?: string;
}

export interface ProjectMemberSummary {
  id: string;
  projeto_id: string;
  usuario_id: string;
  tipo_integrante: 'professor' | 'aluno';
  data_vinculo: string;
}

export interface CommentSummary {
  id: string;
  texto: string;
  data_comentario: string;
  criado_por_id: string;
  projeto_id: string;
  moderado: boolean;
}

export interface DiaryFileSummary {
  id: string;
  registro_diario_id: string;
  base_64: string;
  nome?: string;
  url?: string;
  chave?: string;
}

export interface DiaryMediaSummary {
  id: string;
  registro_diario_id: string;
  url: string;
  legenda?: string;
}

export interface DiarySummary {
  id: string;
  texto: string;
  data_criacao: string;
  criado_por_id: string;
  projeto_id: string;
  aprovado: boolean;
  imagens: DiaryMediaSummary[];
  arquivos: DiaryFileSummary[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  total: number;
  totalPages?: number;
  hasMore?: boolean;
}

export interface LoginResponse {
  token: string;
  usuario: UserSummary;
}

export interface RegisterPayload {
  token: string;
  email: string;
  senha: string;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string | null;
  body?: BodyInit | object | null;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  beginApiRequest();
  const { token, body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  let payload: BodyInit | undefined;
  if (body == null) {
    payload = undefined;
  } else if (isFormData(body) || typeof body === 'string' || body instanceof Blob) {
    payload = body;
  } else {
    requestHeaders.set('Content-Type', 'application/json');
    payload = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders,
      body: payload,
    });

    if (!response.ok) {
      let errorPayload: ApiErrorPayload | undefined;
      try {
        errorPayload = (await response.json()) as ApiErrorPayload;
      } catch {
        errorPayload = undefined;
      }
      throw new ApiError(response.status, errorPayload);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } finally {
    endApiRequest();
  }
}

function normalizeRole(value?: string): BackendRole {
  if (value === 'ADMIN' || value === 'PROFESSOR' || value === 'ALUNO') return value;
  return 'ALUNO';
}

function normalizeFrontRole(value?: string): FrontRole {
  return normalizeRole(value) === 'ALUNO' ? 'aluno' : 'professor';
}

function normalizeProjectStatus(value?: string): 'ativo' | 'fechado' {
  const normalized = value?.toUpperCase();
  return normalized === 'FECHADO' || normalized === 'ENCERRADO' ? 'fechado' : 'ativo';
}

function normalizeEventStatus(value?: string): 'ativo' | 'inativo' {
  const normalized = value?.toUpperCase();
  return normalized === 'ATIVO' ? 'ativo' : 'inativo';
}

function arrayFromUnknown<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mapUser(raw: Record<string, unknown>): UserSummary {
  const backendRole = normalizeRole((raw.tipoUsuario ?? raw.tipo) as string | undefined);
  return {
    id: String(raw.id ?? ''),
    nome: String(raw.nome ?? ''),
    email: String(raw.email ?? ''),
    tipo_usuario: normalizeFrontRole(backendRole),
    backendRole,
    is_adm: backendRole === 'ADMIN',
    matricula: raw.matricula ? String(raw.matricula) : undefined,
    ano_escolar: raw.anoEscolar ? String(raw.anoEscolar) : undefined,
    materia: raw.materia != null || raw.disciplina != null ? String(raw.materia ?? raw.disciplina) : undefined,
  };
}

function mapInvite(raw: Record<string, unknown>): InviteSummary {
  return {
    id: String(raw.id ?? ''),
    nomeConvidado: String(raw.nomeConvidado ?? raw.nome ?? ''),
    status: String(raw.status ?? ''),
    token: raw.token ? String(raw.token) : undefined,
    expiraEm: raw.expiraEm ? String(raw.expiraEm) : undefined,
  };
}

function mapEvent(raw: Record<string, unknown>): EventSummary {
  return {
    id: String(raw.id ?? ''),
    nome: String(raw.nome ?? raw.titulo ?? ''),
    descricao: raw.descricao ? String(raw.descricao) : undefined,
    imagem_capa: raw.imagemCapaUrl ? String(raw.imagemCapaUrl) : raw.capaUrl ? String(raw.capaUrl) : undefined,
    data_inicio: String(raw.dataInicio ?? ''),
    data_fim: String(raw.dataFim ?? ''),
    status: normalizeEventStatus((raw.situacao ?? raw.status) as string | undefined),
    criado_por_id: String(raw.criadoPorId ?? ''),
    data_criacao: raw.dataCriacao ? String(raw.dataCriacao) : undefined,
  };
}

function stringifyMaterials(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).join('\n');
  }
  return value ? String(value) : '';
}

function mapProject(raw: Record<string, unknown>): ProjectSummary {
  return {
    id: String(raw.id ?? ''),
    titulo: String(raw.titulo ?? ''),
    materiais: stringifyMaterials(raw.materiais),
    descricao: raw.descricao ? String(raw.descricao) : '',
    imagem_capa: raw.imagemCapaUrl ? String(raw.imagemCapaUrl) : raw.capaUrl ? String(raw.capaUrl) : undefined,
    data_criacao: String(raw.dataCriacao ?? new Date().toISOString()),
    data_apresentacao: String(raw.dataApresentacao ?? ''),
    situacao: normalizeProjectStatus((raw.situacao ?? raw.status) as string | undefined),
    area_de_conhecimento: String(raw.areaDeConhecimento ?? ''),
    serie: String(raw.serie ?? ''),
    criado_por_id: String(raw.criadoPorId ?? ''),
    evento_id: raw.eventoId != null ? String(raw.eventoId) : undefined,
  };
}

function mapProjectMember(raw: Record<string, unknown>): ProjectMemberSummary {
  return {
    id: String(raw.id ?? ''),
    projeto_id: String(raw.projetoId ?? ''),
    usuario_id: String(raw.usuarioId ?? ''),
    tipo_integrante: normalizeFrontRole(String(raw.tipoIntegrante ?? 'ALUNO')),
    data_vinculo: String(raw.dataVinculo ?? ''),
  };
}

function mapComment(raw: Record<string, unknown>): CommentSummary {
  return {
    id: String(raw.id ?? ''),
    texto: String(raw.texto ?? ''),
    data_comentario: String(raw.dataCriacao ?? raw.dataComentario ?? new Date().toISOString()),
    criado_por_id: String(raw.usuarioId ?? raw.criadoPorId ?? ''),
    projeto_id: String(raw.projetoId ?? ''),
    moderado: false,
  };
}

function mapDiaryFile(raw: Record<string, unknown>, registroId: string): DiaryFileSummary {
  const id = String(raw.id ?? raw.chave ?? raw.url ?? crypto.randomUUID());
  return {
    id,
    registro_diario_id: registroId,
    base_64: '',
    nome: raw.nome ? String(raw.nome) : undefined,
    url: raw.url ? String(raw.url) : undefined,
    chave: raw.chave ? String(raw.chave) : undefined,
  };
}

function mapDiary(raw: Record<string, unknown>): DiarySummary {
  const registroId = String(raw.id ?? '');
  const arquivos = arrayFromUnknown<Record<string, unknown>>(raw.arquivos).map(item => mapDiaryFile(item, registroId));
  const imagens = arquivos
    .filter(file => Boolean(file.url) && /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(file.url ?? ''))
    .map(file => ({
      id: file.id,
      registro_diario_id: registroId,
      url: file.url ?? '',
      legenda: file.nome,
    }));

  return {
    id: registroId,
    texto: String(raw.texto ?? ''),
    data_criacao: String(raw.dataCriacao ?? raw.dataAtualizacao ?? new Date().toISOString()),
    criado_por_id: String(raw.usuarioId ?? raw.criadoPorId ?? ''),
    projeto_id: String(raw.projetoId ?? ''),
    aprovado: false,
    imagens,
    arquivos,
  };
}

function mapPage<TInput extends Record<string, unknown>, TOutput>(raw: Record<string, unknown>, mapper: (item: TInput) => TOutput): PageResponse<TOutput> {
  const content = arrayFromUnknown<TInput>(raw.content).map(item => mapper(item));
  return {
    content,
    page: Number(raw.page ?? 0),
    size: Number(raw.size ?? content.length),
    total: Number(raw.total ?? content.length),
    totalPages: raw.totalPages ? Number(raw.totalPages) : undefined,
    hasMore: raw.hasMore ? Boolean(raw.hasMore) : undefined,
  };
}

export const backendApi = {
  async login(email: string, senha: string): Promise<LoginResponse> {
    const response = await request<{ token: string; usuario: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      body: { email, senha },
    });
    return {
      token: response.token,
      usuario: mapUser(response.usuario),
    };
  },

  async register(payload: RegisterPayload): Promise<void> {
    await request('/usuarios', {
      method: 'POST',
      body: payload,
    });
  },

  async listUsers(token: string, tipo?: BackendRole): Promise<UserSummary[]> {
    const query = tipo ? `?tipo=${tipo}&page=0&size=100` : '?page=0&size=100';
    const response = await request<Record<string, unknown>>(`/usuarios${query}`, { token });
    return mapPage(response, mapUser).content;
  },

  async updateUser(token: string, id: string, payload: Record<string, unknown>): Promise<UserSummary> {
    const response = await request<Record<string, unknown>>(`/usuarios/${id}`, {
      method: 'PATCH',
      token,
      body: payload,
    });
    return mapUser(response);
  },

  async deleteUser(token: string, id: string): Promise<void> {
    await request(`/usuarios/${id}`, { method: 'DELETE', token });
  },

  async resetUserPassword(token: string, id: string): Promise<{ novaSenha: string }> {
    return request(`/usuarios/${id}/senha/reset`, { method: 'POST', token });
  },

  async changeOwnPassword(token: string, id: string, payload: { senhaAtual: string; novaSenha: string }): Promise<void> {
    await request(`/usuarios/${id}/senha`, {
      method: 'PATCH',
      token,
      body: payload,
    });
  },

  async listInvites(token: string): Promise<InviteSummary[]> {
    const response = await request<Record<string, unknown>>('/convites?page=0&size=100', { token });
    return mapPage(response, mapInvite).content;
  },

  async createStudentInvite(token: string, payload: { nome: string; matricula: string; anoEscolar: string }): Promise<{ token: string }> {
    return request('/convites/alunos', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  async createProfessorInvite(token: string, payload: { nome: string; disciplina: string }): Promise<{ token: string }> {
    return request('/convites/professores', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  async deleteInvite(token: string, id: string): Promise<void> {
    await request(`/convites/${id}`, { method: 'DELETE', token });
  },

  async listEvents(): Promise<EventSummary[]> {
    const response = await request<Record<string, unknown>>('/eventos?page=0&size=100');
    return mapPage(response, mapEvent).content;
  },

  async createEvent(token: string, payload: { nome: string; descricao?: string; dataInicio: string; dataFim: string; capa?: File | null }): Promise<EventSummary> {
    const form = new FormData();
    form.set('nome', payload.nome);
    form.set('descricao', payload.descricao ?? '');
    form.set('dataInicio', payload.dataInicio);
    form.set('dataFim', payload.dataFim);
    if (payload.capa) form.set('capa', payload.capa);
    const response = await request<Record<string, unknown>>('/eventos', {
      method: 'POST',
      token,
      body: form,
    });
    return mapEvent(response);
  },

  async updateEvent(token: string, id: string, payload: { nome: string; descricao?: string; dataInicio: string; dataFim: string; situacao: 'ATIVO' | 'ENCERRADO' }): Promise<EventSummary> {
    const response = await request<Record<string, unknown>>(`/eventos/${id}`, {
      method: 'PUT',
      token,
      body: payload,
    });
    return mapEvent(response);
  },

  async updateEventCover(token: string, id: string, file: File): Promise<EventSummary> {
    const form = new FormData();
    form.set('capa', file);
    const response = await request<Record<string, unknown>>(`/eventos/${id}/capa`, {
      method: 'PUT',
      token,
      body: form,
    });
    return mapEvent(response);
  },

  async deleteEventCover(token: string, id: string): Promise<EventSummary> {
    const response = await request<Record<string, unknown>>(`/eventos/${id}/capa`, {
      method: 'DELETE',
      token,
    });
    return mapEvent(response);
  },

  async deleteEvent(token: string, id: string): Promise<void> {
    await request(`/eventos/${id}`, { method: 'DELETE', token });
  },

  async listProjectsByEvent(eventId: string): Promise<ProjectSummary[]> {
    const response = await request<Record<string, unknown>[] | Record<string, unknown>>(`/projetos/evento/${eventId}`);
    if (Array.isArray(response)) {
      return response.map(item => mapProject(item));
    }
    return arrayFromUnknown<Record<string, unknown>>((response as Record<string, unknown>).content).map(item => mapProject(item));
  },

  async getProject(id: string): Promise<ProjectSummary> {
    const response = await request<Record<string, unknown>>(`/projetos/${id}`);
    return mapProject(response);
  },

  async createProject(token: string, payload: { titulo: string; descricao?: string; materiais?: string; areaDeConhecimento: string; serie: string; eventoId: number; dataApresentacao: string }): Promise<ProjectSummary> {
    const response = await request<Record<string, unknown>>('/projetos', {
      method: 'POST',
      token,
      body: payload,
    });
    return mapProject(response);
  },

  async updateProject(token: string, id: string, payload: { titulo: string; descricao?: string; materiais?: string; areaDeConhecimento: string; serie: string; dataApresentacao: string; situacao: 'ATIVO' | 'FECHADO' }): Promise<ProjectSummary> {
    const response = await request<Record<string, unknown>>(`/projetos/${id}`, {
      method: 'PUT',
      token,
      body: payload,
    });
    return mapProject(response);
  },

  async updateProjectMaterialsDescription(token: string, id: string, payload: { descricao?: string; materiais?: string }): Promise<ProjectSummary> {
    const response = await request<Record<string, unknown>>(`/projetos/${id}/materiais-descricao`, {
      method: 'PATCH',
      token,
      body: payload,
    });
    return mapProject(response);
  },

  async deleteProject(token: string, id: string): Promise<void> {
    await request(`/projetos/${id}`, { method: 'DELETE', token });
  },

  async updateProjectCover(token: string, id: string, file: File): Promise<ProjectSummary> {
    const form = new FormData();
    form.set('capa', file);
    const response = await request<Record<string, unknown>>(`/projetos/${id}/capa`, {
      method: 'PUT',
      token,
      body: form,
    });
    return mapProject(response);
  },

  async deleteProjectCover(token: string, id: string): Promise<ProjectSummary> {
    const response = await request<Record<string, unknown>>(`/projetos/${id}/capa`, {
      method: 'DELETE',
      token,
    });
    return mapProject(response);
  },

  async listProjectMembers(projectId: string): Promise<ProjectMemberSummary[]> {
    const response = await request<Record<string, unknown>[] | Record<string, unknown>>(`/projetos/${projectId}/integrantes`);
    if (Array.isArray(response)) {
      return response.map(item => mapProjectMember(item));
    }
    return arrayFromUnknown<Record<string, unknown>>((response as Record<string, unknown>).content).map(item => mapProjectMember(item));
  },

  async addProjectMember(token: string, projectId: string, payload: { usuarioId: number; tipoIntegrante: 'ALUNO' | 'PROFESSOR' }): Promise<ProjectMemberSummary> {
    const response = await request<Record<string, unknown>>(`/projetos/${projectId}/integrantes`, {
      method: 'POST',
      token,
      body: payload,
    });
    return mapProjectMember(response);
  },

  async removeProjectMember(token: string, projectId: string, memberId: string): Promise<void> {
    await request(`/projetos/${projectId}/integrantes/${memberId}`, {
      method: 'DELETE',
      token,
    });
  },

  async listComments(projectId: string): Promise<CommentSummary[]> {
    const response = await request<Record<string, unknown>[] | Record<string, unknown>>(`/projetos/${projectId}/comentarios`);
    if (Array.isArray(response)) {
      return response.map(item => mapComment(item));
    }
    return arrayFromUnknown<Record<string, unknown>>((response as Record<string, unknown>).content).map(item => mapComment(item));
  },

  async addComment(token: string, projectId: string, texto: string): Promise<CommentSummary> {
    const response = await request<Record<string, unknown>>(`/projetos/${projectId}/comentarios`, {
      method: 'POST',
      token,
      body: { texto },
    });
    return mapComment(response);
  },

  async deleteComment(token: string, projectId: string, commentId: string): Promise<void> {
    await request(`/projetos/${projectId}/comentarios/${commentId}`, {
      method: 'DELETE',
      token,
    });
  },

  async listDiary(projectId: string, token: string): Promise<DiarySummary[]> {
    const response = await request<Record<string, unknown>[] | Record<string, unknown>>(`/projetos/${projectId}/registros-diarios`, { token });
    if (Array.isArray(response)) {
      return response.map(item => mapDiary(item));
    }
    return arrayFromUnknown<Record<string, unknown>>((response as Record<string, unknown>).content).map(item => mapDiary(item));
  },

  async addDiary(token: string, projectId: string, payload: { texto: string; arquivos: File[] }): Promise<DiarySummary> {
    const form = new FormData();
    form.set('texto', payload.texto);
    payload.arquivos.forEach(file => form.append('arquivos', file));
    const response = await request<Record<string, unknown>>(`/projetos/${projectId}/registros-diarios`, {
      method: 'POST',
      token,
      body: form,
    });
    return mapDiary(response);
  },

  async updateDiary(token: string, projectId: string, diaryId: string, texto: string): Promise<DiarySummary> {
    const response = await request<Record<string, unknown>>(`/projetos/${projectId}/registros-diarios/${diaryId}`, {
      method: 'PUT',
      token,
      body: { texto },
    });
    return mapDiary(response);
  },

  async addDiaryFile(token: string, projectId: string, diaryId: string, file: File): Promise<DiarySummary> {
    const form = new FormData();
    form.set('arquivo', file);
    const response = await request<Record<string, unknown>>(`/projetos/${projectId}/registros-diarios/${diaryId}/arquivos`, {
      method: 'POST',
      token,
      body: form,
    });
    return mapDiary(response);
  },

  async deleteDiaryFile(token: string, projectId: string, diaryId: string, chave: string): Promise<DiarySummary> {
    const encodedKey = encodeURIComponent(chave);
    const response = await request<Record<string, unknown>>(`/projetos/${projectId}/registros-diarios/${diaryId}/arquivos/${encodedKey}`, {
      method: 'DELETE',
      token,
    });
    return mapDiary(response);
  },
};
