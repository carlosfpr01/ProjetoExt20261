import React, { useEffect, useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { useData, type Usuario } from '../context/DataContext';
import { SCHOOL_GRADE_OPTIONS, type SchoolGrade, toSchoolGradeLabel } from '../lib/schoolGrades';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
  const { usuarios, eventos, addProjeto, loading } = useData();
  const [titulo, setTitulo] = useState('');
  const [areaDeConhecimento, setAreaDeConhecimento] = useState('');
  const [serie, setSerie] = useState<SchoolGrade | ''>('');
  const [dataApresentacao, setDataApresentacao] = useState('');
  const [eventoId, setEventoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [materiais, setMateriais] = useState('');
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([]);

  const alunosDisponiveis = usuarios.filter(usuario => usuario.tipo_usuario === 'aluno');

  useEffect(() => {
    if (!isOpen) {
      setTitulo('');
      setAreaDeConhecimento('');
      setSerie('');
      setDataApresentacao('');
      setEventoId('');
      setDescricao('');
      setMateriais('');
      setSelectedAlunos([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStudentToggle = (alunoId: string) => {
    setSelectedAlunos(prev => (prev.includes(alunoId) ? prev.filter(id => id !== alunoId) : [...prev, alunoId]));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await addProjeto(
      {
        titulo,
        descricao,
        materiais,
        area_de_conhecimento: areaDeConhecimento,
        serie,
        data_apresentacao: dataApresentacao,
        evento_id: eventoId,
      },
      selectedAlunos
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Plus className="h-5 w-5 text-blue-600" />
            Criar projeto
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-6 p-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">
              <span>Titulo</span>
              <input
                required
                value={titulo}
                onChange={event => setTitulo(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ex: Detector de pH com Arduino"
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              <span>Area de conhecimento</span>
              <input
                required
                value={areaDeConhecimento}
                onChange={event => setAreaDeConhecimento(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              <span>Serie</span>
              <select
                required
                value={serie}
                onChange={event => setSerie(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Selecione a serie</option>
                {SCHOOL_GRADE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              <span>Data de apresentacao</span>
              <input
                type="date"
                required
                value={dataApresentacao}
                onChange={event => setDataApresentacao(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              <span>Evento</span>
              <select
                required
                value={eventoId}
                onChange={event => setEventoId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Selecione um evento</option>
                {eventos.map(evento => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nome} ({evento.status})
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">
              <span>Descricao</span>
              <textarea
                rows={4}
                value={descricao}
                onChange={event => setDescricao(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Resumo do objetivo do projeto"
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">
              <span>Materiais</span>
              <textarea
                rows={4}
                value={materiais}
                onChange={event => setMateriais(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Um item por linha"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Alunos participantes</h3>
              <p className="text-sm text-slate-500">Os convites e cadastros ja precisam ter sido concluídos para aparecerem aqui.</p>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {alunosDisponiveis.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum aluno cadastrado ainda.</p>
              ) : (
                alunosDisponiveis.map((aluno: Usuario) => (
                  <label key={aluno.id} className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedAlunos.includes(aluno.id)}
                      onChange={() => handleStudentToggle(aluno.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{aluno.nome}</p>
                      <p className="text-slate-500">{toSchoolGradeLabel(aluno.ano_escolar) || 'Sem ano'} • Matricula {aluno.matricula ?? '-'}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Salvando...' : 'Criar projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
