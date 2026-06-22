import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  FilePlus2,
  MessageSquare,
  Pencil,
  Save,
  Settings,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { SCHOOL_GRADE_OPTIONS, isSchoolGrade, toSchoolGradeLabel } from '../lib/schoolGrades';
import { useConfirmation } from '../context/ConfirmationContext';

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { confirm } = useConfirmation();
  const {
    projetos,
    usuarios,
    projetoUsuarios,
    comentarios,
    registrosDiario,
    loading,
    error,
    loadProjectWorkspace,
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
  } = useData();

  const projeto = projetos.find(item => item.id === id);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [projectForm, setProjectForm] = useState({ titulo: '', area_de_conhecimento: '', serie: '', data_apresentacao: '', situacao: 'ativo' as 'ativo' | 'fechado', descricao: '', materiais: '' });
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newDiaryText, setNewDiaryText] = useState('');
  const [newDiaryFiles, setNewDiaryFiles] = useState<File[]>([]);
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);
  const [editingDiaryText, setEditingDiaryText] = useState('');
  const [selectedAlunoId, setSelectedAlunoId] = useState('');

  useEffect(() => {
    if (id) {
      loadProjectWorkspace(id).catch(() => undefined);
    }
  }, [id, loadProjectWorkspace]);

  useEffect(() => {
    if (projeto) {
      setProjectForm({
        titulo: projeto.titulo,
        area_de_conhecimento: projeto.area_de_conhecimento,
        serie: projeto.serie,
        data_apresentacao: projeto.data_apresentacao,
        situacao: projeto.situacao,
        descricao: projeto.descricao,
        materiais: projeto.materiais,
      });
    }
  }, [projeto]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!projeto || !id) {
    return <Navigate to="/" replace />;
  }

  const isTeacher = user.tipo_usuario === 'professor';
  const projectMembers = projetoUsuarios.filter(item => item.projeto_id === projeto.id);
  const alunoMembers = projectMembers.filter(item => item.tipo_integrante === 'aluno');
  const professorMembers = projectMembers.filter(item => item.tipo_integrante === 'professor');
  const projectComments = comentarios
    .filter(item => item.projeto_id === projeto.id)
    .sort((left, right) => new Date(right.data_comentario).getTime() - new Date(left.data_comentario).getTime());
  const projectDiary = registrosDiario
    .filter(item => item.projeto_id === projeto.id)
    .sort((left, right) => new Date(right.data_criacao).getTime() - new Date(left.data_criacao).getTime());

  const availableStudents = useMemo(
    () => usuarios.filter(item => item.tipo_usuario === 'aluno' && !alunoMembers.some(member => member.usuario_id === item.id)),
    [alunoMembers, usuarios]
  );

  const userMember = projectMembers.find(item => item.usuario_id === user.id);
  const canManageProject = isTeacher || Boolean(user.is_adm);
  const canWriteDiary = user.tipo_usuario === 'aluno';

  const userLabel = (userId: string) => usuarios.find(item => item.id === userId)?.nome ?? `Usuario ${userId}`;

  const handleSaveProject = async () => {
    const confirmed = await confirm({
      title: 'Confirmar edicao do projeto',
      description: 'Deseja salvar as alteracoes de configuracao deste projeto?',
      confirmText: 'Salvar alteracoes',
    });
    if (!confirmed) return;

    await updateProjeto(projeto.id, projectForm);
    if (newCoverFile) {
      await updateProjetoCapa(projeto.id, newCoverFile);
      setNewCoverFile(null);
    }
    setIsEditingProject(false);
  };

  const handleSaveContent = async () => {
    const confirmed = await confirm({
      title: 'Confirmar edicao de conteudo',
      description: 'Deseja salvar as alteracoes de materiais e descricao?',
      confirmText: 'Salvar conteudo',
    });
    if (!confirmed) return;

    await updateProjetoMateriaisDescricao(projeto.id, {
      descricao: projectForm.descricao,
      materiais: projectForm.materiais,
    });
    setIsEditingContent(false);
  };

  const handleDeleteProject = async () => {
    const confirmed = await confirm({
      title: 'Excluir projeto',
      description: 'Esta acao remove o projeto e seus dados relacionados. Deseja continuar?',
      confirmText: 'Excluir projeto',
      variant: 'danger',
    });
    if (!confirmed) return;

    await removeProjeto(projeto.id);
    navigate('/');
  };

  const handleRemoveProjectCover = async () => {
    const confirmed = await confirm({
      title: 'Remover capa do projeto',
      description: 'Deseja remover a capa atual do projeto?',
      confirmText: 'Remover capa',
      variant: 'danger',
    });
    if (!confirmed) return;
    await removeProjetoCapa(projeto.id);
  };

  const handleRemoveComment = async (commentId: string) => {
    const confirmed = await confirm({
      title: 'Excluir comentario',
      description: 'Tem certeza que deseja excluir este comentario?',
      confirmText: 'Excluir comentario',
      variant: 'danger',
    });
    if (!confirmed) return;
    await removeComentario(projeto.id, commentId);
  };

  const handleRemoveAluno = async (memberId: string) => {
    const confirmed = await confirm({
      title: 'Remover integrante',
      description: 'Deseja remover este aluno do projeto?',
      confirmText: 'Remover integrante',
      variant: 'danger',
    });
    if (!confirmed) return;
    await removeAlunoDoProjeto(projeto.id, memberId);
  };

  const handleSaveDiaryEdit = async (entryId: string) => {
    const confirmed = await confirm({
      title: 'Confirmar edicao do registro',
      description: 'Deseja salvar as alteracoes deste registro diario?',
      confirmText: 'Salvar registro',
    });
    if (!confirmed) return;
    await updateRegistroDiario(projeto.id, entryId, editingDiaryText);
    setEditingDiaryId(null);
  };

  const handleRemoveDiaryFile = async (entryId: string, key: string) => {
    const confirmed = await confirm({
      title: 'Remover arquivo do registro',
      description: 'Deseja remover este arquivo anexado?',
      confirmText: 'Remover arquivo',
      variant: 'danger',
    });
    if (!confirmed) return;
    await removeRegistroDiarioArquivo(projeto.id, entryId, key);
  };

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    await addComentario({ projeto_id: projeto.id, texto: newComment });
    setNewComment('');
  };

  const handleAddDiary = async (event: React.FormEvent) => {
    event.preventDefault();
    await addRegistroDiario({ projeto_id: projeto.id, texto: newDiaryText, arquivos: newDiaryFiles });
    setNewDiaryText('');
    setNewDiaryFiles([]);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-700">
        <ArrowLeft className="h-4 w-4" />
        Voltar para o dashboard
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-800 p-6 text-white lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <span className={`rounded-full px-3 py-1 ${projeto.situacao === 'ativo' ? 'bg-emerald-500/80 text-white' : 'bg-slate-700 text-slate-100'}`}>{projeto.situacao}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{projeto.area_de_conhecimento}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{toSchoolGradeLabel(projeto.serie)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{projeto.titulo}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">{projeto.descricao || 'Sem descricao cadastrada ainda.'}</p>
            </div>
            <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Apresentacao: {new Date(projeto.data_apresentacao).toLocaleDateString('pt-BR')}
              </p>
              <p className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Criado em {new Date(projeto.data_criacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-slate-800">
              {projeto.imagem_capa ? (
                <img src={projeto.imagem_capa} alt={projeto.titulo} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-300">Sem capa cadastrada</div>
              )}
            </div>
            {canManageProject && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setIsEditingProject(prev => !prev)} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  <Settings className="h-4 w-4" />
                  Ajustar projeto
                </button>
                <button type="button" onClick={() => setIsEditingContent(prev => !prev)} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                  <Pencil className="h-4 w-4" />
                  Materiais e descricao
                </button>
                <button type="button" onClick={handleDeleteProject} className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-200">
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditingProject && (
          <div className="border-t border-slate-200 bg-slate-50 p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <input value={projectForm.titulo} onChange={event => setProjectForm(prev => ({ ...prev, titulo: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Titulo" />
              <select value={projectForm.situacao} onChange={event => setProjectForm(prev => ({ ...prev, situacao: event.target.value as 'ativo' | 'fechado' }))} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm">
                <option value="ativo">Ativo</option>
                <option value="fechado">Fechado</option>
              </select>
              <input value={projectForm.area_de_conhecimento} onChange={event => setProjectForm(prev => ({ ...prev, area_de_conhecimento: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" placeholder="Area" />
              <select value={projectForm.serie} onChange={event => setProjectForm(prev => ({ ...prev, serie: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm">
                {!isSchoolGrade(projectForm.serie) && projectForm.serie && (
                  <option value={projectForm.serie}>{projectForm.serie} (legado)</option>
                )}
                <option value="">Selecione a serie</option>
                {SCHOOL_GRADE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input type="date" value={projectForm.data_apresentacao} onChange={event => setProjectForm(prev => ({ ...prev, data_apresentacao: event.target.value }))} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
              <input type="file" accept="image/*" onChange={event => setNewCoverFile(event.target.files?.[0] ?? null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={handleSaveProject} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
                <Save className="h-4 w-4" />
                Salvar ajustes
              </button>
              <button type="button" onClick={handleRemoveProjectCover} className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-800">Remover capa</button>
              <button type="button" onClick={() => setIsEditingProject(false)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {isEditingContent && (
          <div className="border-t border-slate-200 bg-white p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <textarea value={projectForm.descricao} onChange={event => setProjectForm(prev => ({ ...prev, descricao: event.target.value }))} className="min-h-40 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Descricao do projeto" />
              <textarea value={projectForm.materiais} onChange={event => setProjectForm(prev => ({ ...prev, materiais: event.target.value }))} className="min-h-40 rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Materiais, um por linha" />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={handleSaveContent} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Salvar conteudo</button>
              <button type="button" onClick={() => setIsEditingContent(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">Fechar</button>
            </div>
          </div>
        )}
      </section>

      {loading && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Sincronizando detalhes do projeto...</div>}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Materiais cadastrados</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{projeto.materiais || 'Nenhum material informado.'}</pre>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Comentarios</h2>
              <span className="text-sm text-slate-400">Comentarios do projeto</span>
            </div>
            <form className="space-y-3" onSubmit={handleAddComment}>
              <textarea value={newComment} onChange={event => setNewComment(event.target.value)} required className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Adicionar comentario" />
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Publicar comentario</button>
            </form>
            <div className="space-y-3">
              {projectComments.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum comentario ainda.</p>
              ) : (
                projectComments.map(comment => (
                  <article key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{userLabel(comment.criado_por_id)}</p>
                        <p className="mt-1 text-sm text-slate-700">{comment.texto}</p>
                        <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{new Date(comment.data_comentario).toLocaleString('pt-BR')}</p>
                      </div>
                      {(comment.criado_por_id === user.id || canManageProject) && (
                        <button type="button" onClick={() => handleRemoveComment(comment.id)} className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700">Excluir</button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Integrantes</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Professores</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {professorMembers.map(member => (
                    <span key={member.id} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">{userLabel(member.usuario_id)}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Alunos</p>
                <div className="mt-2 space-y-2">
                  {alunoMembers.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum aluno vinculado.</p>
                  ) : (
                    alunoMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                        <span>{userLabel(member.usuario_id)}</span>
                        {(canManageProject || member.usuario_id === user.id) && (
                          <button type="button" onClick={() => handleRemoveAluno(member.id)} className="text-rose-700 transition hover:text-rose-900">Remover</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {canManageProject && (
              <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  Adicionar aluno
                </p>
                <div className="flex gap-2">
                  <select value={selectedAlunoId} onChange={event => setSelectedAlunoId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm">
                    <option value="">Selecione um aluno</option>
                    {availableStudents.map(student => (
                      <option key={student.id} value={student.id}>{student.nome}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => selectedAlunoId && addAlunoAoProjeto(projeto.id, selectedAlunoId).then(() => setSelectedAlunoId(''))} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Adicionar</button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FilePlus2 className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Registros diarios</h2>
            </div>
            {canWriteDiary ? (
              <form className="mt-4 space-y-3" onSubmit={handleAddDiary}>
                <textarea value={newDiaryText} onChange={event => setNewDiaryText(event.target.value)} required className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Descreva a evolucao do projeto" />
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
                  <Upload className="h-4 w-4" />
                  <span>Anexar arquivos</span>
                  <input type="file" multiple onChange={event => setNewDiaryFiles(Array.from(event.target.files ?? []))} className="hidden" />
                </label>
                {newDiaryFiles.length > 0 && <p className="text-xs text-slate-500">{newDiaryFiles.length} arquivo(s) pronto(s) para envio.</p>}
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Criar registro</button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-slate-500">A criacao e edicao de registros diarios fica disponivel apenas para alunos.</p>
            )}

            <div className="mt-6 space-y-4">
              {projectDiary.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum registro diario retornado.</p>
              ) : (
                projectDiary.map(entry => {
                  const isEditing = editingDiaryId === entry.id;
                  const canEditEntry = canWriteDiary && entry.criado_por_id === user.id;
                  return (
                    <article key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{userLabel(entry.criado_por_id) || 'Aluno'}</p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{new Date(entry.data_criacao).toLocaleString('pt-BR')}</p>
                        </div>
                        {canEditEntry && !isEditing && (
                          <button type="button" onClick={() => { setEditingDiaryId(entry.id); setEditingDiaryText(entry.texto); }} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">Editar texto</button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-4 space-y-3">
                          <textarea value={editingDiaryText} onChange={event => setEditingDiaryText(event.target.value)} className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleSaveDiaryEdit(entry.id)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Salvar</button>
                            <button type="button" onClick={() => setEditingDiaryId(null)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm leading-6 text-slate-700">{entry.texto}</p>
                      )}

                      <div className="mt-4 space-y-3">
                        {entry.arquivos.length > 0 && (
                          <div className="space-y-2">
                            {entry.arquivos.map(file => (
                              <div key={file.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="font-medium text-slate-800">{file.nome ?? file.chave ?? 'Arquivo'}</p>
                                  {file.url && (
                                    <a href={file.url} target="_blank" rel="noreferrer" className="text-blue-700 underline-offset-2 hover:underline">
                                      Abrir anexo
                                    </a>
                                  )}
                                </div>
                                {canEditEntry && file.chave && (
                                  <button type="button" onClick={() => handleRemoveDiaryFile(entry.id, file.chave ?? '')} className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700">
                                    Remover arquivo
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {canEditEntry && (
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
                            <Upload className="h-4 w-4" />
                            <span>Anexar novo arquivo a este registro</span>
                            <input type="file" onChange={event => event.target.files?.[0] && addRegistroDiarioArquivo(projeto.id, entry.id, event.target.files[0])} className="hidden" />
                          </label>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
