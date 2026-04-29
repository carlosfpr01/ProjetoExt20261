import React, { useState } from 'react';
import { useData } from '../context/DataContext.tsx';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { Plus, Search, Calendar, Users, BookOpen, Layers } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';

export const Dashboard = () => {
  const { user } = useAuth();
  const { projetos, projetoUsuarios } = useData();
  const [activeTab, setActiveTab] = useState<'ativo' | 'fechado'>('ativo');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isTeacher = user?.tipo_usuario === 'professor';
  const isStudent = user?.tipo_usuario === 'aluno';

  // Encontra os projetos do usuário
  const userProjectsIds = projetoUsuarios
    .filter(pu => pu.usuario_id === user?.id)
    .map(pu => pu.projeto_id);

  const myProjects = projetos.filter(p => userProjectsIds.includes(p.id));
  const visibleProjects = isStudent ? projetos : myProjects;

  // Filtra projetos baseado na aba e busca
  const filteredProjects = visibleProjects.filter((p) => {
    // Status filter
    if (p.situacao !== activeTab) return false;

    // Search filter
    if (searchTerm) {
      return p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.area_de_conhecimento.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Projetos</h1>
          <p className="text-gray-500 mt-1">
            {isTeacher 
              ? 'Gerencie os projetos das suas turmas' 
              : 'Visualize os projetos da feira e acompanhe os detalhes'}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Criar Novo Projeto
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex space-x-1 w-full md:w-auto p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('ativo')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === 'ativo' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            Projetos Ativos
          </button>
          <button
            onClick={() => setActiveTab('fechado')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === 'fechado' 
                ? 'bg-white text-gray-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            Projetos Fechados
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {isTeacher && (
        <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-700 rounded-3xl overflow-hidden shadow-xl border border-white/10 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
            <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center space-y-4">
              <span className="inline-flex items-center w-fit gap-2 text-xs font-semibold uppercase tracking-[0.24em] bg-white/10 px-3 py-1 rounded-full">
                Feira de Ciencias
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight max-w-xl">
                Visualize projetos com imagens de exemplo, diarios e o evento da feira no mesmo fluxo.
              </h2>
              <p className="text-blue-100 max-w-xl text-sm md:text-base leading-6">
                O objetivo agora e deixar o conteudo visual espalhado pela aplicacao, sem depender de uma pagina unica de CRUD.
              </p>
            </div>
            <div className="min-h-[280px] bg-black/15 p-4 md:p-6">
              <img
                src="/sample-images/science-fair.svg"
                alt="Feira de ciencias"
                className="h-full w-full object-cover rounded-2xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        </section>
      )}

      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum projeto encontrado</h3>
          <p className="text-gray-500 max-w-sm">
            {activeTab === 'ativo' 
              ? (isTeacher
                  ? 'Você não tem projetos ativos no momento. Crie um novo projeto para começar.'
                  : 'Nenhum projeto ativo disponível no momento.')
              : (isTeacher
                  ? 'Você não tem projetos fechados no histórico.'
                  : 'Nenhum projeto fechado disponível no momento.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const numAlunos = projetoUsuarios.filter(pu => pu.projeto_id === project.id && pu.tipo_integrante === 'aluno').length;
            const isParticipant = userProjectsIds.includes(project.id);
            
            return (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col overflow-hidden"
              >
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                  <img
                    src={project.imagem_capa || '/sample-images/project-volcano.svg'}
                    alt={project.titulo}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      project.situacao === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.situacao}
                    </span>
                    {isStudent && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        isParticipant ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isParticipant ? 'Participando' : 'Somente visualização'}
                      </span>
                    )}
                    <Layers className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {project.titulo}
                  </h3>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{project.area_de_conhecimento} • {project.serie}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Apresentação: {new Date(project.data_apresentacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{numAlunos} Aluno(s)</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-800">Ver detalhes</span>
                  <span className="text-xs text-gray-400">Criado em {new Date(project.data_criacao).toLocaleDateString('pt-BR')}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {isTeacher && (
        <CreateProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};
