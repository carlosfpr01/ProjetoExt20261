import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Calendar, Layers, Plus, RefreshCcw, Search, Users } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { SCHOOL_GRADE_OPTIONS, toSchoolGradeLabel } from '../lib/schoolGrades';

export const Dashboard = () => {
  const { user } = useAuth();
  const { projetos, projetoUsuarios, eventos, loading, error, refreshAll } = useData();
  const [activeTab, setActiveTab] = useState<'ativo' | 'fechado'>('ativo');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('todos');
  const [selectedArea, setSelectedArea] = useState('todas');
  const [selectedSerie, setSelectedSerie] = useState('todas');
  const [participationFilter, setParticipationFilter] = useState<'todos' | 'participando' | 'nao-participando'>('todos');
  const [sortBy, setSortBy] = useState<
    'apresentacao-recente' |
    'apresentacao-antiga' |
    'criacao-recente' |
    'criacao-antiga' |
    'titulo-az' |
    'titulo-za' |
    'alunos-maior' |
    'alunos-menor'
  >('apresentacao-recente');

  const isTeacher = user?.tipo_usuario === 'professor';
  const isStudent = user?.tipo_usuario === 'aluno';
  const isAdmin = Boolean(user?.is_adm);

  const userProjectIds = useMemo(
    () => projetoUsuarios.filter(item => item.usuario_id === user?.id).map(item => item.projeto_id),
    [projetoUsuarios, user?.id]
  );

  const visibleProjects = useMemo(() => projetos, [projetos]);

  const areas = useMemo(
    () => [...new Set(projetos.map(project => project.area_de_conhecimento).filter(Boolean))].sort((left, right) => left.localeCompare(right)),
    [projetos]
  );

  const studentsCountByProject = useMemo(() => {
    const counts = new Map<string, number>();
    projetoUsuarios.forEach(item => {
      if (item.tipo_integrante !== 'aluno') return;
      counts.set(item.projeto_id, (counts.get(item.projeto_id) ?? 0) + 1);
    });
    return counts;
  }, [projetoUsuarios]);

  const filteredProjects = useMemo(
    () =>
      visibleProjects.filter(project => {
        if (project.situacao !== activeTab) return false;

        if (selectedEventId !== 'todos' && project.evento_id !== selectedEventId) return false;

        if (selectedArea !== 'todas' && project.area_de_conhecimento !== selectedArea) return false;

        if (selectedSerie !== 'todas' && project.serie !== selectedSerie) return false;

        const isParticipant = userProjectIds.includes(project.id);
        if (participationFilter === 'participando' && !isParticipant) return false;
        if (participationFilter === 'nao-participando' && isParticipant) return false;

        if (!searchTerm.trim()) return true;
        const normalized = searchTerm.toLowerCase();
        return (
          project.titulo.toLowerCase().includes(normalized) ||
          project.area_de_conhecimento.toLowerCase().includes(normalized) ||
          project.serie.toLowerCase().includes(normalized)
        );
      }),
    [
      activeTab,
      participationFilter,
      searchTerm,
      selectedArea,
      selectedEventId,
      selectedSerie,
      userProjectIds,
      visibleProjects,
    ]
  );

  const sortedProjects = useMemo(() => {
    const parseDate = (value: string) => {
      const timestamp = new Date(value).getTime();
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    return [...filteredProjects].sort((left, right) => {
      switch (sortBy) {
        case 'apresentacao-antiga':
          return parseDate(left.data_apresentacao) - parseDate(right.data_apresentacao);
        case 'apresentacao-recente':
          return parseDate(right.data_apresentacao) - parseDate(left.data_apresentacao);
        case 'criacao-antiga':
          return parseDate(left.data_criacao) - parseDate(right.data_criacao);
        case 'criacao-recente':
          return parseDate(right.data_criacao) - parseDate(left.data_criacao);
        case 'titulo-az':
          return left.titulo.localeCompare(right.titulo, 'pt-BR');
        case 'titulo-za':
          return right.titulo.localeCompare(left.titulo, 'pt-BR');
        case 'alunos-menor':
          return (studentsCountByProject.get(left.id) ?? 0) - (studentsCountByProject.get(right.id) ?? 0);
        case 'alunos-maior':
          return (studentsCountByProject.get(right.id) ?? 0) - (studentsCountByProject.get(left.id) ?? 0);
        default:
          return 0;
      }
    });
  }, [filteredProjects, sortBy, studentsCountByProject]);

  const clearExtraFilters = () => {
    setSelectedEventId('todos');
    setSelectedArea('todas');
    setSelectedSerie('todas');
    setParticipationFilter('todos');
    setSortBy('apresentacao-recente');
  };

  const eventNameById = useMemo(() => new Map(eventos.map(evento => [evento.id, evento.nome])), [eventos]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projetos da feira</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isStudent
                ? 'Visualize os projetos publicados e acompanhe os detalhes do seu grupo.'
                : isAdmin
                  ? 'Administra eventos e acompanha todos os projetos cadastrados.'
                  : 'Gerencie convites, integrantes e atualizações dos seus projetos reais.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => refreshAll()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
            {isTeacher && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Novo projeto
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-800 p-6 text-white shadow-xl">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              Fonte oficial da UI
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Cada ação respeita as permissões do sistema.</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-200">
              Projetos são agrupados a partir dos eventos, integrantes vêm de `/projetos/{'{id}'}/integrantes` e a criação exige evento vinculado.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-cyan-100">Eventos</p>
              <p className="mt-2 text-2xl font-bold">{eventos.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-cyan-100">Projetos</p>
              <p className="mt-2 text-2xl font-bold">{projetos.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-cyan-100">Vinculos</p>
              <p className="mt-2 text-2xl font-bold">{projetoUsuarios.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-cyan-100">Meu acesso</p>
              <p className="mt-2 text-sm font-semibold uppercase">{user?.is_adm ? 'Admin' : user?.tipo_usuario}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex rounded-2xl bg-slate-100 p-1 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('ativo')}
              className={`rounded-2xl px-4 py-2 transition ${activeTab === 'ativo' ? 'bg-white text-blue-700 shadow-sm' : ''}`}
            >
              Ativos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fechado')}
              className={`rounded-2xl px-4 py-2 transition ${activeTab === 'fechado' ? 'bg-white text-slate-800 shadow-sm' : ''}`}
            >
              Fechados
            </button>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Buscar por titulo, area ou serie"
              className="w-full rounded-2xl border border-slate-300 px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Evento
            <select
              value={selectedEventId}
              onChange={event => setSelectedEventId(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-700"
            >
              <option value="todos">Todos</option>
              {eventos.map(evento => (
                <option key={evento.id} value={evento.id}>{evento.nome}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Area
            <select
              value={selectedArea}
              onChange={event => setSelectedArea(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-700"
            >
              <option value="todas">Todas</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Serie
            <select
              value={selectedSerie}
              onChange={event => setSelectedSerie(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-700"
            >
              <option value="todas">Todas</option>
              {SCHOOL_GRADE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Participacao
            <select
              value={participationFilter}
              onChange={event => setParticipationFilter(event.target.value as 'todos' | 'participando' | 'nao-participando')}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-700"
            >
              <option value="todos">Todos</option>
              <option value="participando">Somente participando</option>
              <option value="nao-participando">Somente nao participando</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Ordenar por
            <select
              value={sortBy}
              onChange={event => setSortBy(event.target.value as typeof sortBy)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-700"
            >
              <option value="apresentacao-recente">Apresentacao mais recente</option>
              <option value="apresentacao-antiga">Apresentacao mais antiga</option>
              <option value="criacao-recente">Criacao mais recente</option>
              <option value="criacao-antiga">Criacao mais antiga</option>
              <option value="titulo-az">Titulo A-Z</option>
              <option value="titulo-za">Titulo Z-A</option>
              <option value="alunos-maior">Mais alunos</option>
              <option value="alunos-menor">Menos alunos</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={clearExtraFilters}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-50"
          >
            Limpar filtros e ordenacao
          </button>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">Carregando dados...</div>
      ) : sortedProjects.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Nenhum projeto encontrado</h3>
          <p className="mt-2 text-sm text-slate-500">Ajuste os filtros ou crie um projeto vinculado a um evento existente.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedProjects.map(project => {
            const alunosCount = studentsCountByProject.get(project.id) ?? 0;
            const isParticipant = userProjectIds.includes(project.id);
            return (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="aspect-[16/9] bg-slate-100">
                  {project.imagem_capa ? (
                    <img src={project.imagem_capa} alt={project.titulo} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-slate-400">
                      <Layers className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${project.situacao === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                        {project.situacao}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-blue-700">{project.titulo}</h3>
                    </div>
                    <Layers className="h-5 w-5 text-slate-400 transition group-hover:text-blue-600" />
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      {project.area_de_conhecimento} • {toSchoolGradeLabel(project.serie)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Apresentacao em {new Date(project.data_apresentacao).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      {alunosCount} aluno(s)
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-medium text-slate-800">Evento</p>
                    <p className="mt-1">{project.evento_id ? eventNameById.get(project.evento_id) ?? 'Evento nao encontrado' : 'Sem evento'}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                      {isParticipant ? 'Voce participa deste projeto' : 'Visualizacao publica'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {isTeacher && <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
