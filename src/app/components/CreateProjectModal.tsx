import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext.tsx';
import type { Usuario } from '../context/DataContext.tsx';
import { useAuth } from '../context/AuthContext';
import { X, Save, Plus } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
  const { usuarios, eventos, addProjeto } = useData();
  const { user } = useAuth();
  
  const [titulo, setTitulo] = useState('');
  const [areaDeConhecimento, setAreaDeConhecimento] = useState('');
  const [serie, setSerie] = useState('');
  const [dataApresentacao, setDataApresentacao] = useState('');
  const [eventoId, setEventoId] = useState('');
  const [imagemCapa, setImagemCapa] = useState('/sample-images/project-volcano.svg');
  const [imagemUploadPreview, setImagemUploadPreview] = useState('');
  const [selectedAlunos, setSelectedAlunos] = useState<string[]>([]);
  
  const alunosDisponiveis = usuarios.filter(u => u.tipo_usuario === 'aluno');

  useEffect(() => {
    if (!isOpen) {
      setTitulo('');
      setAreaDeConhecimento('');
      setSerie('');
      setDataApresentacao('');
      setEventoId('');
      setImagemCapa('/sample-images/project-volcano.svg');
      setImagemUploadPreview('');
      setSelectedAlunos([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.tipo_usuario !== 'professor') return;

    addProjeto({
      titulo,
      area_de_conhecimento: areaDeConhecimento,
      serie,
      data_apresentacao: dataApresentacao,
      materiais: '',
      descricao: '',
      imagem_capa: imagemCapa,
      criado_por_id: user.id,
      evento_id: eventoId || undefined,
    }, selectedAlunos);
    
    onClose();
  };

  const handleStudentToggle = (alunoId: string) => {
    setSelectedAlunos(prev => 
      prev.includes(alunoId)
        ? prev.filter(id => id !== alunoId)
        : [...prev, alunoId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setImagemCapa(result);
      setImagemUploadPreview(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Criar Novo Projeto
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Projeto *
              </label>
              <input
                type="text"
                id="titulo"
                required
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="Ex: Feira de Ciências..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                  Área de Conhecimento *
                </label>
                <input
                  type="text"
                  id="area"
                  required
                  value={areaDeConhecimento}
                  onChange={e => setAreaDeConhecimento(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="Ex: Biologia, Matemática..."
                />
              </div>

              <div>
                <label htmlFor="serie" className="block text-sm font-medium text-gray-700 mb-1">
                  Série/Ano *
                </label>
                <select
                  id="serie"
                  required
                  value={serie}
                  onChange={e => setSerie(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                >
                  <option value="" disabled>Selecione a série</option>
                  <option value="6º Ano">6º Ano</option>
                  <option value="7º Ano">7º Ano</option>
                  <option value="8º Ano">8º Ano</option>
                  <option value="9º Ano">9º Ano</option>
                  <option value="1º Ano Médio">1º Ano Médio</option>
                  <option value="2º Ano Médio">2º Ano Médio</option>
                  <option value="3º Ano Médio">3º Ano Médio</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Apresentação *
              </label>
              <input
                type="date"
                id="date"
                required
                value={dataApresentacao}
                onChange={e => setDataApresentacao(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="evento" className="block text-sm font-medium text-gray-700 mb-1">
                Evento (opcional)
              </label>
              <select
                id="evento"
                value={eventoId}
                onChange={e => setEventoId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
              >
                <option value="">Sem evento vinculado</option>
                {eventos.map(evento => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nome} ({evento.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="imagemCapa" className="block text-sm font-medium text-gray-700 mb-1">
                Imagem de capa de exemplo
              </label>
              <select
                id="imagemCapa"
                value={imagemCapa}
                onChange={e => setImagemCapa(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
              >
                <option value="/sample-images/project-volcano.svg">Projeto Vulcao</option>
                <option value="/sample-images/science-fair.svg">Feira de Ciencias</option>
                <option value="/sample-images/diary-lab.svg">Diario de Bordo</option>
              </select>
              <label className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Ou anexar uma imagem do computador</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
              </label>
              {imagemUploadPreview && (
                <img src={imagemUploadPreview} alt="Preview da capa" className="mt-3 h-40 w-full rounded-xl object-cover border border-gray-200" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alunos Participantes
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {alunosDisponiveis.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-2">
                    Nenhum aluno cadastrado no sistema.
                  </p>
                ) : (
                  alunosDisponiveis.map((aluno: Usuario) => (
                    <label key={aluno.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAlunos.includes(aluno.id)}
                        onChange={() => handleStudentToggle(aluno.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{aluno.nome}</p>
                        <p className="text-xs text-gray-500">{aluno.ano_escolar} - Matrícula: {aluno.matricula}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Você poderá adicionar ou remover alunos depois.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Criar Projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
