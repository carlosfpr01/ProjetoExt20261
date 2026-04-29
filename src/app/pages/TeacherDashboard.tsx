import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Navigate } from 'react-router';
import { UserPlus, Users, Search, Mail, BookOpen, Fingerprint, Pencil, Trash2, Shield, CalendarDays } from 'lucide-react';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const { usuarios, eventos, addUsuario, updateUsuario, removeUsuario, addEvento, updateEvento, removeEvento } = useData();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [anoEscolar, setAnoEscolar] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentNome, setEditingStudentNome] = useState('');
  const [editingStudentEmail, setEditingStudentEmail] = useState('');
  const [editingStudentMatricula, setEditingStudentMatricula] = useState('');
  const [editingStudentAno, setEditingStudentAno] = useState('');

  const [profNome, setProfNome] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profMateria, setProfMateria] = useState('');
  const [editingProfessorId, setEditingProfessorId] = useState<string | null>(null);
  const [editingProfessorNome, setEditingProfessorNome] = useState('');
  const [editingProfessorEmail, setEditingProfessorEmail] = useState('');
  const [editingProfessorMateria, setEditingProfessorMateria] = useState('');

  const [eventoNome, setEventoNome] = useState('');
  const [eventoDescricao, setEventoDescricao] = useState('');
  const [eventoInicio, setEventoInicio] = useState('');
  const [eventoFim, setEventoFim] = useState('');
  const [eventoStatus, setEventoStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [eventoImagemCapa, setEventoImagemCapa] = useState('/sample-images/science-fair.svg');

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventNome, setEditingEventNome] = useState('');
  const [editingEventDescricao, setEditingEventDescricao] = useState('');
  const [editingEventInicio, setEditingEventInicio] = useState('');
  const [editingEventFim, setEditingEventFim] = useState('');
  const [editingEventStatus, setEditingEventStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [editingEventImagemCapa, setEditingEventImagemCapa] = useState('/sample-images/science-fair.svg');

  if (!user || user.tipo_usuario !== 'professor') {
    return <Navigate to="/" replace />;
  }

  const isAdmin = Boolean(user.is_adm);

  const alunos = useMemo(() => usuarios.filter(u => u.tipo_usuario === 'aluno'), [usuarios]);
  const professores = useMemo(() => usuarios.filter(u => u.tipo_usuario === 'professor'), [usuarios]);

  const filteredStudents = alunos.filter(s =>
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.matricula && s.matricula.includes(searchTerm))
  );

  const canManageStudent = (studentId: string) => isAdmin || alunos.some(s => s.id === studentId && s.criado_por_id === user.id);

  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !anoEscolar || !matricula) return;

    addUsuario({
      nome,
      email,
      tipo_usuario: 'aluno',
      matricula,
      ano_escolar: anoEscolar,
      criado_por_id: user.id,
    });

    setNome('');
    setEmail('');
    setMatricula('');
    setAnoEscolar('');
  };

  const startEditStudent = (studentId: string) => {
    const student = alunos.find(a => a.id === studentId);
    if (!student) return;
    setEditingStudentId(student.id);
    setEditingStudentNome(student.nome);
    setEditingStudentEmail(student.email);
    setEditingStudentMatricula(student.matricula ?? '');
    setEditingStudentAno(student.ano_escolar ?? '');
  };

  const saveEditStudent = () => {
    if (!editingStudentId) return;
    updateUsuario(editingStudentId, {
      nome: editingStudentNome,
      email: editingStudentEmail,
      matricula: editingStudentMatricula,
      ano_escolar: editingStudentAno,
      tipo_usuario: 'aluno',
    });
    setEditingStudentId(null);
  };

  const handleCreateProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !profNome || !profEmail || !profMateria) return;
    addUsuario({
      nome: profNome,
      email: profEmail,
      materia: profMateria,
      tipo_usuario: 'professor',
      is_adm: false,
      criado_por_id: user.id,
    });
    setProfNome('');
    setProfEmail('');
    setProfMateria('');
  };

  const startEditProfessor = (professorId: string) => {
    const professor = professores.find(p => p.id === professorId);
    if (!professor) return;
    setEditingProfessorId(professor.id);
    setEditingProfessorNome(professor.nome);
    setEditingProfessorEmail(professor.email);
    setEditingProfessorMateria(professor.materia ?? '');
  };

  const saveEditProfessor = () => {
    if (!editingProfessorId || !isAdmin) return;
    updateUsuario(editingProfessorId, {
      nome: editingProfessorNome,
      email: editingProfessorEmail,
      materia: editingProfessorMateria,
      tipo_usuario: 'professor',
    });
    setEditingProfessorId(null);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !eventoNome || !eventoInicio || !eventoFim) return;
    addEvento({
      nome: eventoNome,
      descricao: eventoDescricao,
      imagem_capa: eventoImagemCapa,
      data_inicio: eventoInicio,
      data_fim: eventoFim,
      status: eventoStatus,
      criado_por_id: user.id,
    });
    setEventoNome('');
    setEventoDescricao('');
    setEventoInicio('');
    setEventoFim('');
    setEventoStatus('ativo');
    setEventoImagemCapa('/sample-images/science-fair.svg');
  };

  const startEditEvent = (eventId: string) => {
    const event = eventos.find(e => e.id === eventId);
    if (!event) return;
    setEditingEventId(event.id);
    setEditingEventNome(event.nome);
    setEditingEventDescricao(event.descricao ?? '');
    setEditingEventInicio(event.data_inicio);
    setEditingEventFim(event.data_fim);
    setEditingEventStatus(event.status);
    setEditingEventImagemCapa(event.imagem_capa ?? '/sample-images/science-fair.svg');
  };

  const saveEditEvent = () => {
    if (!editingEventId || !isAdmin) return;
    updateEvento(editingEventId, {
      nome: editingEventNome,
      descricao: editingEventDescricao,
      imagem_capa: editingEventImagemCapa,
      data_inicio: editingEventInicio,
      data_fim: editingEventFim,
      status: editingEventStatus,
    });
    setEditingEventId(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel do Professor</h1>
        <p className="text-gray-500 mt-1">
          CRUD dinâmico por contexto: cadastro de alunos, professores e eventos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Cadastrar Novo Aluno
            </h2>

            <form onSubmit={handleSubmitStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nome">
                  Nome Completo
                </label>
                <input
                  id="nome"
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  E-mail do Aluno
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="matricula">
                  Matricula
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Fingerprint className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="matricula"
                    type="text"
                    required
                    value={matricula}
                    onChange={e => setMatricula(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="anoEscolar">
                  Serie / Ano Escolar
                </label>
                <select
                  id="anoEscolar"
                  required
                  value={anoEscolar}
                  onChange={e => setAnoEscolar(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>Selecione a serie</option>
                  <option value="6 Ano">6 Ano</option>
                  <option value="7 Ano">7 Ano</option>
                  <option value="8 Ano">8 Ano</option>
                  <option value="9 Ano">9 Ano</option>
                  <option value="1 Ano Medio">1 Ano Medio</option>
                  <option value="2 Ano Medio">2 Ano Medio</option>
                  <option value="3 Ano Medio">3 Ano Medio</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                Cadastrar Aluno
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                Meus Alunos ({alunos.length})
              </h2>

              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="py-12 text-center text-gray-500">Nenhum aluno encontrado.</div>
              ) : (
                filteredStudents.map(student => {
                  const canManage = canManageStudent(student.id);
                  const isEditing = editingStudentId === student.id;

                  return (
                    <div key={student.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            value={editingStudentNome}
                            onChange={e => setEditingStudentNome(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Nome"
                          />
                          <input
                            value={editingStudentEmail}
                            onChange={e => setEditingStudentEmail(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Email"
                          />
                          <input
                            value={editingStudentMatricula}
                            onChange={e => setEditingStudentMatricula(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Matricula"
                          />
                          <input
                            value={editingStudentAno}
                            onChange={e => setEditingStudentAno(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Ano escolar"
                          />
                          <div className="md:col-span-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingStudentId(null)}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={saveEditStudent}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{student.nome}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{student.email}</p>
                            <p className="text-xs text-gray-400 mb-2">Matricula: {student.matricula}</p>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100/50 px-2 py-0.5 rounded-full border border-blue-200/50">
                              <BookOpen className="h-3 w-3" />
                              {student.ano_escolar}
                            </span>
                          </div>

                          {canManage && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditStudent(student.id)}
                                className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-white"
                                title="Editar aluno"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeUsuario(student.id)}
                                className="p-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                title="Excluir aluno"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Cadastro de Professor
            </h2>

            <form onSubmit={handleCreateProfessor} className="grid grid-cols-1 gap-3">
              <input
                value={profNome}
                onChange={e => setProfNome(e.target.value)}
                placeholder="Nome"
                className="px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                value={profEmail}
                onChange={e => setProfEmail(e.target.value)}
                placeholder="Email"
                className="px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                value={profMateria}
                onChange={e => setProfMateria(e.target.value)}
                placeholder="Materia"
                className="px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700" type="submit">
                Cadastrar Professor
              </button>
            </form>

            <div className="space-y-2">
              {professores.map(prof => (
                <div key={prof.id} className="border border-gray-200 rounded-lg p-3">
                  {editingProfessorId === prof.id ? (
                    <div className="space-y-2">
                      <input
                        value={editingProfessorNome}
                        onChange={e => setEditingProfessorNome(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={editingProfessorEmail}
                        onChange={e => setEditingProfessorEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={editingProfessorMateria}
                        onChange={e => setEditingProfessorMateria(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditingProfessorId(null)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">Cancelar</button>
                        <button type="button" onClick={saveEditProfessor} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{prof.nome}</p>
                        <p className="text-xs text-gray-500">{prof.email}</p>
                        <p className="text-xs text-gray-500">Materia: {prof.materia}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEditProfessor(prof.id)} className="p-2 rounded-md border border-gray-300 text-gray-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        {prof.id !== user.id && (
                          <button type="button" onClick={() => removeUsuario(prof.id)} className="p-2 rounded-md border border-red-200 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-violet-600" />
              Evento (Cadastrar, Ajustar, Excluir)
            </h2>

            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 gap-3">
              <input
                value={eventoNome}
                onChange={e => setEventoNome(e.target.value)}
                placeholder="Nome do evento"
                className="px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <textarea
                value={eventoDescricao}
                onChange={e => setEventoDescricao(e.target.value)}
                placeholder="Descricao"
                className="px-3 py-2 border border-gray-300 rounded-lg min-h-20"
              />
              <select value={eventoImagemCapa} onChange={e => setEventoImagemCapa(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="/sample-images/science-fair.svg">Feira de Ciencias</option>
                <option value="/sample-images/project-volcano.svg">Projeto Vulcao</option>
                <option value="/sample-images/diary-lab.svg">Diario de Bordo</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={eventoInicio} onChange={e => setEventoInicio(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" required />
                <input type="date" value={eventoFim} onChange={e => setEventoFim(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <select value={eventoStatus} onChange={e => setEventoStatus(e.target.value as 'ativo' | 'inativo')} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              <button className="px-4 py-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700" type="submit">
                Cadastrar Evento
              </button>
            </form>

            <div className="space-y-2">
              {eventos.map(evento => (
                <div key={evento.id} className="border border-gray-200 rounded-lg p-3">
                  {editingEventId === evento.id ? (
                    <div className="space-y-2">
                      <input value={editingEventNome} onChange={e => setEditingEventNome(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      <textarea value={editingEventDescricao} onChange={e => setEditingEventDescricao(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-20" />
                      <select value={editingEventImagemCapa} onChange={e => setEditingEventImagemCapa(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                        <option value="/sample-images/science-fair.svg">Feira de Ciencias</option>
                        <option value="/sample-images/project-volcano.svg">Projeto Vulcao</option>
                        <option value="/sample-images/diary-lab.svg">Diario de Bordo</option>
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={editingEventInicio} onChange={e => setEditingEventInicio(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                        <input type="date" value={editingEventFim} onChange={e => setEditingEventFim(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <select value={editingEventStatus} onChange={e => setEditingEventStatus(e.target.value as 'ativo' | 'inativo')} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditingEventId(null)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">Cancelar</button>
                        <button type="button" onClick={saveEditEvent} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={evento.imagem_capa || '/sample-images/science-fair.svg'}
                          alt={evento.nome}
                          className="h-20 w-20 rounded-xl object-cover border border-gray-200 shadow-sm"
                        />
                        <div>
                        <p className="text-sm font-semibold text-gray-900">{evento.nome}</p>
                        <p className="text-xs text-gray-500">{evento.descricao || 'Sem descricao'}</p>
                        <p className="text-xs text-gray-500">{new Date(evento.data_inicio).toLocaleDateString('pt-BR')} ate {new Date(evento.data_fim).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs text-gray-500">Status: {evento.status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEditEvent(evento.id)} className="p-2 rounded-md border border-gray-300 text-gray-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => removeEvento(evento.id)} className="p-2 rounded-md border border-red-200 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
