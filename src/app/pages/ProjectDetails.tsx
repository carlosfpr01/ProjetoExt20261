import React, { useMemo, useState } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  ArrowLeft,
  Calendar,
  Tag,
  BookOpen,
  Clock,
  AlertCircle,
  Users,
  CheckCircle2,
  FileText,
  Settings,
  PenLine,
  Save,
  X,
  GraduationCap,
  NotebookPen,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    projetos,
    usuarios,
    projetoUsuarios,
    comentarios,
    registrosDiario,
    updateProjeto,
    removeProjeto,
    addComentario,
    updateComentario,
    removeComentario,
    moderateComentario,
    addRegistroDiario,
    updateRegistroDiario,
    removeRegistroDiario,
    approveRegistroDiario,
    addAlunoAoProjeto,
    removeAlunoDoProjeto,
  } = useData();

  const [isEditingMaterials, setIsEditingMaterials] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isAdjustingProject, setIsAdjustingProject] = useState(false);
  const [isManagingStudents, setIsManagingStudents] = useState(false);

  const [materialsContent, setMaterialsContent] = useState('');
  const [descriptionContent, setDescriptionContent] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectArea, setProjectArea] = useState('');
  const [projectSerie, setProjectSerie] = useState('');
  const [projectPresentationDate, setProjectPresentationDate] = useState('');
  const [projectStatus, setProjectStatus] = useState<'ativo' | 'fechado'>('ativo');
  const [projectImage, setProjectImage] = useState('');

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const [newRegistroTexto, setNewRegistroTexto] = useState('');
  const [newRegistroImagens, setNewRegistroImagens] = useState<string[]>([]);
  const [editingRegistroId, setEditingRegistroId] = useState<string | null>(null);
  const [editingRegistroText, setEditingRegistroText] = useState('');

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; legenda?: string }>>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const projeto = projetos.find(p => p.id === id);

  if (!projeto || !user) {
    return <Navigate to="/" replace />;
  }

  const isTeacher = user.tipo_usuario === 'professor';
  const pUsuarios = projetoUsuarios.filter(pu => pu.projeto_id === projeto.id);
  const userIdsDoProjeto = pUsuarios.map(pu => pu.usuario_id);
  const isParticipant = userIdsDoProjeto.includes(user.id);
  const canEditProject = isTeacher && isParticipant;
  const canAdjustProject = isTeacher && projeto.criado_por_id === user.id;
  const hasEditRights = isParticipant;
  const canModerate = isTeacher && isParticipant;

  const profIds = pUsuarios.filter(pu => pu.tipo_integrante === 'professor').map(pu => pu.usuario_id);
  const alunoIds = pUsuarios.filter(pu => pu.tipo_integrante === 'aluno').map(pu => pu.usuario_id);

  const projComentarios = comentarios
    .filter(c => c.projeto_id === projeto.id)
    .sort((a, b) => new Date(a.data_comentario).getTime() - new Date(b.data_comentario).getTime());

  const visibleComentarios = useMemo(
    () => projComentarios.filter(c => !c.moderado || canModerate || c.criado_por_id === user.id),
    [projComentarios, canModerate, user.id]
  );

  const projRegistros = registrosDiario
    .filter(r => r.projeto_id === projeto.id)
    .sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());

  const alunosNoProjeto = usuarios.filter(u => alunoIds.includes(u.id));
  const alunosDisponiveis = usuarios.filter(u => u.tipo_usuario === 'aluno' && !alunoIds.includes(u.id));

  const getUserName = (uid: string) => usuarios.find(u => u.id === uid)?.nome || 'Usuario desconhecido';

  const canManageComment = (authorId: string) => canModerate || authorId === user.id;
  const canManageRegistro = (authorId: string) => canModerate || authorId === user.id;

  const handleOpenAdjustProject = () => {
    setProjectTitle(projeto.titulo);
    setProjectArea(projeto.area_de_conhecimento);
    setProjectSerie(projeto.serie);
    setProjectPresentationDate(projeto.data_apresentacao);
    setProjectStatus(projeto.situacao);
    setProjectImage(projeto.imagem_capa || '/sample-images/project-volcano.svg');
    setIsAdjustingProject(true);
  };

  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setProjectImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProjectAdjustments = (e: React.FormEvent) => {
    e.preventDefault();

    const titulo = projectTitle.trim();
    const area = projectArea.trim();
    const serie = projectSerie.trim();

    if (!titulo || !area || !serie || !projectPresentationDate) return;

    updateProjeto(projeto.id, {
      titulo,
      area_de_conhecimento: area,
      serie,
      data_apresentacao: projectPresentationDate,
      situacao: projectStatus,
      imagem_capa: projectImage,
    });
    setIsAdjustingProject(false);
  };

  const handleCloseProject = () => {
    updateProjeto(projeto.id, { situacao: 'fechado' });
  };

  const handleReopenProject = () => {
    updateProjeto(projeto.id, { situacao: 'ativo' });
  };

  const handleDeleteProject = () => {
    removeProjeto(projeto.id);
    navigate('/');
  };

  const handleEditMaterials = () => {
    setMaterialsContent(projeto.materiais);
    setIsEditingMaterials(true);
  };

  const handleSaveMaterials = () => {
    updateProjeto(projeto.id, { materiais: materialsContent });
    setIsEditingMaterials(false);
  };

  const handleEditDescription = () => {
    setDescriptionContent(projeto.descricao);
    setIsEditingDescription(true);
  };

  const handleSaveDescription = () => {
    updateProjeto(projeto.id, { descricao: descriptionContent });
    setIsEditingDescription(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComentario({
      projeto_id: projeto.id,
      texto: newComment,
      criado_por_id: user.id,
    });
    setNewComment('');
  };

  const startEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  const saveEditComment = () => {
    if (!editingCommentId || !editingCommentText.trim()) return;
    updateComentario(editingCommentId, { texto: editingCommentText.trim() });
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleAddRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegistroTexto.trim()) return;
    addRegistroDiario({
      projeto_id: projeto.id,
      texto: newRegistroTexto,
      criado_por_id: user.id,
      imagens: newRegistroImagens.map((url, index) => ({
        id: `mid-local-${Date.now()}-${index}`,
        url,
        legenda: `Comprovacao ${index + 1}`,
        registro_diario_id: '',
      })),
    });
    setNewRegistroTexto('');
    setNewRegistroImagens([]);
  };

  const startEditRegistro = (registroId: string, currentText: string) => {
    setEditingRegistroId(registroId);
    setEditingRegistroText(currentText);
  };

  const saveEditRegistro = () => {
    if (!editingRegistroId || !editingRegistroText.trim()) return;
    updateRegistroDiario(editingRegistroId, { texto: editingRegistroText.trim() });
    setEditingRegistroId(null);
    setEditingRegistroText('');
  };

  const handleRegistroImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const readAsDataUrl = (file: File) =>
      new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.readAsDataURL(file);
      });

    const imageUrls = (await Promise.all(files.map(readAsDataUrl))).filter(Boolean);
    setNewRegistroImagens(prev => [...prev, ...imageUrls]);
    e.target.value = '';
  };

  const handleRemoveRegistroImagePreview = (index: number) => {
    setNewRegistroImagens(prev => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const openGallery = (images: Array<{ url: string; legenda?: string }>, startIndex: number) => {
    if (images.length === 0) return;
    setGalleryImages(images);
    setGalleryIndex(startIndex);
    setIsImageModalOpen(true);
  };

  const showPreviousGalleryImage = () => {
    setGalleryIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const showNextGalleryImage = () => {
    setGalleryIndex(prev => (prev + 1) % galleryImages.length);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para o Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                projeto.situacao === 'ativo' ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'
              }`}>
                {projeto.situacao === 'ativo' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {projeto.situacao}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium bg-blue-800/50 px-3 py-1 rounded-full">
                <Tag className="h-3.5 w-3.5" />
                {projeto.area_de_conhecimento}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium bg-blue-800/50 px-3 py-1 rounded-full">
                <BookOpen className="h-3.5 w-3.5" />
                {projeto.serie}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{projeto.titulo}</h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-blue-100 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 opacity-70" />
                <span><strong className="text-white">Criado:</strong> {new Date(projeto.data_criacao).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 opacity-70" />
                <span><strong className="text-white">Apresentacao:</strong> {new Date(projeto.data_apresentacao).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-72 lg:w-80 shrink-0">
            <img
              src={projeto.imagem_capa || '/sample-images/project-volcano.svg'}
              alt={projeto.titulo}
              className="w-full h-56 object-cover rounded-2xl border border-white/15 shadow-xl"
            />
          </div>

          {canEditProject && (
            <div className="bg-white/10 p-1 rounded-lg flex flex-col gap-2 shrink-0 self-stretch justify-center">
              <button
                onClick={handleOpenAdjustProject}
                disabled={!canAdjustProject}
                className="px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold bg-white text-blue-900 hover:bg-gray-100 rounded-md transition-colors shadow-sm"
              >
                <Settings className="h-4 w-4" />
                Ajustar Projeto
              </button>
              <button
                onClick={() => setIsManagingStudents(prev => !prev)}
                disabled={!canAdjustProject}
                className="px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <Users className="h-4 w-4" />
                Gerenciar Alunos
              </button>
              {canAdjustProject && projeto.situacao === 'ativo' && (
                <button
                  onClick={handleCloseProject}
                  className="px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium bg-amber-400 text-amber-950 hover:bg-amber-300 rounded-md transition-colors"
                >
                  Fechar Projeto
                </button>
              )}
              {canAdjustProject && projeto.situacao === 'fechado' && (
                <button
                  onClick={handleReopenProject}
                  className="px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium bg-emerald-400 text-emerald-950 hover:bg-emerald-300 rounded-md transition-colors"
                >
                  Reabrir Projeto
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-gray-50 border-t border-gray-200">
          <div className="p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Professores Orientadores
            </h3>
            <div className="flex flex-wrap gap-2">
              {profIds.map(uid => (
                <span key={uid} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {getUserName(uid)}
                </span>
              ))}
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Alunos Participantes ({alunoIds.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {alunoIds.length === 0 ? (
                <span className="text-sm text-gray-500 italic">Nenhum aluno adicionado</span>
              ) : (
                alunoIds.map(uid => (
                  <span key={uid} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800 border border-gray-300">
                    {getUserName(uid)}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isAdjustingProject && canAdjustProject && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-blue-600" />
                Ajustes do Projeto
              </h2>

              <form onSubmit={handleSaveProjectAdjustments} className="space-y-4">
                <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={projectArea} onChange={e => setProjectArea(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  <input value={projectSerie} onChange={e => setProjectSerie(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="date" value={projectPresentationDate} onChange={e => setProjectPresentationDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  <select value={projectStatus} onChange={e => setProjectStatus(e.target.value as 'ativo' | 'fechado')} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                    <option value="ativo">Ativo</option>
                    <option value="fechado">Fechado</option>
                  </select>
                </div>
                <div className="space-y-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  <label className="block text-sm font-medium text-gray-700">Imagem do projeto</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <select value={projectImage} onChange={e => setProjectImage(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                      <option value="/sample-images/project-volcano.svg">Projeto Vulcao</option>
                      <option value="/sample-images/science-fair.svg">Feira de Ciencias</option>
                      <option value="/sample-images/diary-lab.svg">Diario de Bordo</option>
                    </select>
                    <input type="file" accept="image/*" onChange={handleProjectImageUpload} className="w-full text-sm" />
                  </div>
                  <img src={projectImage || '/sample-images/project-volcano.svg'} alt="Preview do projeto" className="h-44 w-full rounded-xl object-cover border border-gray-200" />
                </div>
                <div className="flex justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    className="px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 border border-red-200 rounded-md flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Excluir Projeto
                  </button>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsAdjustingProject(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-1">
                      <X className="h-4 w-4" /> Cancelar
                    </button>
                    <button type="submit" className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1 shadow-sm">
                      <Save className="h-4 w-4" /> Salvar Ajustes
                    </button>
                  </div>
                </div>
              </form>
            </section>
          )}

          {isManagingStudents && canAdjustProject && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                Gerenciar Alunos
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Participantes ({alunosNoProjeto.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {alunosNoProjeto.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Nenhum aluno participante.</p>
                    ) : (
                      alunosNoProjeto.map(aluno => (
                        <div key={aluno.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{aluno.nome}</p>
                            <p className="text-xs text-gray-500">{aluno.ano_escolar} - Matricula: {aluno.matricula}</p>
                          </div>
                          <button type="button" onClick={() => removeAlunoDoProjeto(projeto.id, aluno.id)} className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md">
                            Remover
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-blue-50/40">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Disponiveis ({alunosDisponiveis.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {alunosDisponiveis.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Nao ha alunos disponiveis.</p>
                    ) : (
                      alunosDisponiveis.map(aluno => (
                        <div key={aluno.id} className="flex items-center justify-between bg-white border border-blue-100 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{aluno.nome}</p>
                            <p className="text-xs text-gray-500">{aluno.ano_escolar} - Matricula: {aluno.matricula}</p>
                          </div>
                          <button type="button" onClick={() => addAlunoAoProjeto(projeto.id, aluno.id)} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-md">
                            Adicionar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                Materiais Necessarios
              </h2>
              {hasEditRights && !isEditingMaterials && (
                <button onClick={handleEditMaterials} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5">
                  <PenLine className="h-4 w-4" /> Editar
                </button>
              )}
            </div>

            {isEditingMaterials ? (
              <div className="space-y-3">
                <textarea value={materialsContent} onChange={e => setMaterialsContent(e.target.value)} className="w-full h-32 p-3 border border-gray-300 rounded-lg" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsEditingMaterials(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-1">
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                  <button onClick={handleSaveMaterials} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1 shadow-sm">
                    <Save className="h-4 w-4" /> Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap bg-amber-50/50 p-4 rounded-xl border border-amber-100 min-h-[100px]">
                {projeto.materiais || <span className="text-gray-400 italic">Nenhum material listado ainda.</span>}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Descricao de como fazer
              </h2>
              {hasEditRights && !isEditingDescription && (
                <button onClick={handleEditDescription} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5">
                  <PenLine className="h-4 w-4" /> Editar
                </button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-3">
                <textarea value={descriptionContent} onChange={e => setDescriptionContent(e.target.value)} className="w-full h-48 p-3 border border-gray-300 rounded-lg" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsEditingDescription(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-1">
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                  <button onClick={handleSaveDescription} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1 shadow-sm">
                    <Save className="h-4 w-4" /> Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap bg-blue-50/30 p-4 rounded-xl border border-blue-100 min-h-[120px]">
                {projeto.descricao || <span className="text-gray-400 italic">Nenhuma descricao adicionada ainda.</span>}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <NotebookPen className="h-5 w-5 text-indigo-500" />
                Diario de Bordo (Registros)
              </h2>
            </div>

            <div className="space-y-4">
              {hasEditRights && (
                <form onSubmit={handleAddRegistro} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <textarea value={newRegistroTexto} onChange={e => setNewRegistroTexto(e.target.value)} className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg mb-2" placeholder="O que foi feito no projeto hoje?" required />
                  <div className="mb-3 space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Imagens de comprovacao (pode anexar varias)</label>
                    <input type="file" accept="image/*" multiple onChange={handleRegistroImagesUpload} className="w-full text-sm" />
                    {newRegistroImagens.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {newRegistroImagens.map((imagem, index) => (
                          <div key={`${imagem}-${index}`} className="relative">
                            <img src={imagem} alt={`Preview ${index + 1}`} className="h-24 w-full rounded-lg object-cover border border-gray-200" />
                            <button
                              type="button"
                              onClick={() => handleRemoveRegistroImagePreview(index)}
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white text-xs"
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={!newRegistroTexto.trim()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-lg">
                      Adicionar Registro
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3 mt-4">
                {projRegistros.length === 0 ? (
                  <p className="text-gray-500 text-sm italic py-4">Nenhum registro no diario de bordo ainda.</p>
                ) : (
                  projRegistros.map(registro => (
                    <div key={registro.id} className="flex gap-4 p-4 border-l-2 border-indigo-500 bg-white shadow-sm rounded-r-xl border-y border-r border-gray-100">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-sm font-bold text-gray-900">{getUserName(registro.criado_por_id)}</span>
                            <div className="text-xs text-gray-500">{new Date(registro.data_criacao).toLocaleString('pt-BR')}</div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${registro.aprovado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {registro.aprovado ? 'Aprovado' : 'Pendente'}
                            </span>
                            {canModerate && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveRegistroDiario(registro.id, !registro.aprovado, user.id)}
                                  className="text-xs px-2 py-1 rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  {registro.aprovado ? 'Reprovar' : 'Aprovar'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {editingRegistroId === registro.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingRegistroText}
                              onChange={e => setEditingRegistroText(e.target.value)}
                              className="w-full h-24 p-2 border border-gray-300 rounded-lg"
                            />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditingRegistroId(null)} className="text-xs px-2 py-1 border border-gray-300 rounded-md">Cancelar</button>
                              <button type="button" onClick={saveEditRegistro} className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md">Salvar</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{registro.texto}</p>
                        )}

                        {registro.imagens.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {registro.imagens.map((imagem, imageIndex) => (
                              <figure
                                key={imagem.id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 cursor-pointer group"
                                onClick={() => openGallery(registro.imagens, imageIndex)}
                              >
                                <img src={imagem.url} alt={imagem.legenda || 'Imagem do diário'} className="h-44 w-full object-cover group-hover:scale-[1.02] transition-transform" />
                                {imagem.legenda && <figcaption className="px-3 py-2 text-xs text-gray-500">{imagem.legenda}</figcaption>}
                              </figure>
                            ))}
                          </div>
                        )}

                        {canManageRegistro(registro.criado_por_id) && editingRegistroId !== registro.id && (
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => startEditRegistro(registro.id, registro.texto)} className="text-xs px-2 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">Editar</button>
                            <button type="button" onClick={() => removeRegistroDiario(registro.id)} className="text-xs px-2 py-1 border border-red-200 rounded-md text-red-700 hover:bg-red-50">Excluir</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full lg:max-h-[800px] sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-4">
              Comentarios
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{visibleComentarios.length}</span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {visibleComentarios.length === 0 ? (
                <p className="text-gray-500 text-sm italic text-center py-8">Nenhum comentario visivel.</p>
              ) : (
                visibleComentarios.map(comment => (
                  <div key={comment.id} className={`rounded-xl p-4 border ${comment.moderado ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <div>
                        <span className="text-sm font-bold text-gray-900">{getUserName(comment.criado_por_id)}</span>
                        <div className="text-xs text-gray-500">{new Date(comment.data_comentario).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {comment.moderado && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Moderado</span>}
                        {canModerate && (
                          <button
                            type="button"
                            onClick={() => moderateComentario(comment.id, !comment.moderado, user.id)}
                            className="text-[11px] px-2 py-1 rounded-md border border-amber-200 text-amber-700 hover:bg-amber-100"
                          >
                            {comment.moderado ? 'Desmoderar' : 'Moderar'}
                          </button>
                        )}
                      </div>
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} className="w-full h-24 p-2 border border-gray-300 rounded-lg" />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingCommentId(null)} className="text-xs px-2 py-1 border border-gray-300 rounded-md">Cancelar</button>
                          <button type="button" onClick={saveEditComment} className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md">Salvar</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.texto}</p>
                    )}

                    {canManageComment(comment.criado_por_id) && editingCommentId !== comment.id && (
                      <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => startEditComment(comment.id, comment.texto)} className="text-xs px-2 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">Editar</button>
                        <button type="button" onClick={() => removeComentario(comment.id)} className="text-xs px-2 py-1 border border-red-200 rounded-md text-red-700 hover:bg-red-50">Excluir</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {hasEditRights && (
              <form onSubmit={handleAddComment} className="mt-auto pt-4 border-t">
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg mb-2" placeholder="Escreva um comentario..." required />
                <button type="submit" disabled={!newComment.trim()} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-lg">
                  Adicionar Comentario
                </button>
              </form>
            )}
          </section>
        </div>
      </div>

      {isImageModalOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 rounded-full h-10 w-10"
          >
            x
          </button>

          <button
            type="button"
            onClick={showPreviousGalleryImage}
            className="absolute left-4 md:left-10 text-white bg-white/10 hover:bg-white/20 rounded-full h-12 w-12 text-xl"
          >
            {'<'}
          </button>

          <div className="max-w-5xl w-full space-y-3">
            <img
              src={galleryImages[galleryIndex].url}
              alt={galleryImages[galleryIndex].legenda || `Imagem ${galleryIndex + 1}`}
              className="max-h-[75vh] w-full object-contain rounded-2xl"
            />
            <div className="text-center text-white text-sm">
              {galleryImages[galleryIndex].legenda || `Imagem ${galleryIndex + 1}`} ({galleryIndex + 1}/{galleryImages.length})
            </div>
          </div>

          <button
            type="button"
            onClick={showNextGalleryImage}
            className="absolute right-4 md:right-10 text-white bg-white/10 hover:bg-white/20 rounded-full h-12 w-12 text-xl"
          >
            {'>'}
          </button>
        </div>
      )}
    </div>
  );
};
