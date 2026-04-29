import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  tipo_usuario: 'professor' | 'aluno';
  data_cadastro: string;
  criado_por_id?: string;
  matricula?: string;
  ano_escolar?: string;
  materia?: string;
  is_adm?: boolean;
}

export interface Evento {
  id: string;
  nome: string;
  descricao?: string;
  imagem_capa?: string;
  data_inicio: string;
  data_fim: string;
  status: 'ativo' | 'inativo';
  criado_por_id: string;
}

export interface EventoUsuario {
  id: string;
  evento_id: string;
  usuario_id: string;
  data_vinculo: string;
}

export interface Projeto {
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

export interface ProjetoUsuario {
  id: string;
  projeto_id: string;
  usuario_id: string;
  tipo_integrante: 'professor' | 'aluno';
  data_vinculo: string;
}

export interface Comentario {
  id: string;
  texto: string;
  data_comentario: string;
  criado_por_id: string;
  projeto_id: string;
  moderado: boolean;
  moderado_por_id?: string;
  data_moderacao?: string;
}

export interface MidiaDiario {
  id: string;
  url: string;
  registro_diario_id: string;
  legenda?: string;
}

export interface RegistroDiarioArquivo {
  id: string;
  base_64: string;
  registro_diario_id: string;
}

export interface RegistroDiario {
  id: string;
  texto: string;
  data_criacao: string;
  criado_por_id: string;
  projeto_id: string;
  aprovado: boolean;
  aprovado_por_id?: string;
  data_aprovacao?: string;
  imagens: MidiaDiario[];
  arquivos: RegistroDiarioArquivo[];
}

type NovoProjeto = Omit<Projeto, 'id' | 'data_criacao' | 'situacao'> & {
  situacao?: 'ativo' | 'fechado';
};

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

  addUsuario: (u: Omit<Usuario, 'id' | 'data_cadastro'>) => void;
  updateUsuario: (id: string, updates: Partial<Usuario>) => void;
  removeUsuario: (id: string) => void;

  addEvento: (e: Omit<Evento, 'id'>) => void;
  updateEvento: (id: string, updates: Partial<Evento>) => void;
  removeEvento: (id: string) => void;

  addEventoUsuario: (v: Omit<EventoUsuario, 'id' | 'data_vinculo'>) => void;
  updateEventoUsuario: (id: string, updates: Partial<EventoUsuario>) => void;
  removeEventoUsuario: (id: string) => void;

  addProjeto: (p: NovoProjeto, alunosIds: string[]) => void;
  updateProjeto: (id: string, updates: Partial<Projeto>) => void;
  removeProjeto: (id: string) => void;

  addProjetoUsuario: (v: Omit<ProjetoUsuario, 'id' | 'data_vinculo'>) => void;
  updateProjetoUsuario: (id: string, updates: Partial<ProjetoUsuario>) => void;
  removeProjetoUsuario: (id: string) => void;

  addComentario: (c: Omit<Comentario, 'id' | 'data_comentario' | 'moderado' | 'moderado_por_id' | 'data_moderacao'>) => void;
  updateComentario: (id: string, updates: Partial<Comentario>) => void;
  removeComentario: (id: string) => void;
  moderateComentario: (id: string, moderado: boolean, moderadoPorId: string) => void;

  addRegistroDiario: (r: Omit<RegistroDiario, 'id' | 'data_criacao' | 'aprovado' | 'aprovado_por_id' | 'data_aprovacao' | 'arquivos'>) => void;
  updateRegistroDiario: (id: string, updates: Partial<RegistroDiario>) => void;
  removeRegistroDiario: (id: string) => void;
  approveRegistroDiario: (id: string, aprovado: boolean, aprovadorId: string) => void;

  addRegistroDiarioArquivo: (a: Omit<RegistroDiarioArquivo, 'id'>) => void;
  updateRegistroDiarioArquivo: (id: string, updates: Partial<RegistroDiarioArquivo>) => void;
  removeRegistroDiarioArquivo: (id: string) => void;

  addAlunoAoProjeto: (projetoId: string, alunoId: string) => void;
  removeAlunoDoProjeto: (projetoId: string, alunoId: string) => void;
}

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const mockUsuarios: Usuario[] = [
  { id: 'prof-1', nome: 'Prof. Carlos', email: 'carlos@escola.com', tipo_usuario: 'professor', materia: 'Ciencias', is_adm: true, data_cadastro: '2023-01-01T10:00:00Z' },
  { id: 'aluno-1', nome: 'Ana Souza', email: 'ana@escola.com', tipo_usuario: 'aluno', matricula: '20230001', ano_escolar: '8 Ano', data_cadastro: '2023-01-10T10:00:00Z' },
  { id: 'aluno-2', nome: 'Joao Silva', email: 'joao@escola.com', tipo_usuario: 'aluno', matricula: '20230002', ano_escolar: '8 Ano', data_cadastro: '2023-01-10T11:00:00Z' },
  { id: 'aluno-3', nome: 'Beatriz Costa', email: 'beatriz@escola.com', tipo_usuario: 'aluno', matricula: '20230003', ano_escolar: '9 Ano', data_cadastro: '2023-01-11T09:00:00Z' },
];

const mockEventos: Evento[] = [
  {
    id: 'evento-1',
    nome: 'Feira de Ciencias 2026',
    descricao: 'Evento anual de apresentacao dos projetos',
    imagem_capa: '/sample-images/science-fair.svg',
    data_inicio: '2026-11-20',
    data_fim: '2026-11-22',
    status: 'ativo',
    criado_por_id: 'prof-1',
  },
];

const mockEventoUsuarios: EventoUsuario[] = [
  { id: 'evu-1', evento_id: 'evento-1', usuario_id: 'prof-1', data_vinculo: '2026-04-01T08:00:00Z' },
  { id: 'evu-2', evento_id: 'evento-1', usuario_id: 'aluno-1', data_vinculo: '2026-04-02T08:00:00Z' },
];

const mockProjetos: Projeto[] = [
  {
    id: 'proj-1',
    titulo: 'Feira de Ciencias: Vulcao',
    area_de_conhecimento: 'Ciencias',
    serie: '8 Ano',
    situacao: 'ativo',
    data_criacao: '2023-10-01',
    data_apresentacao: '2026-11-20',
    materiais: '1. Bicarbonato de sodio\n2. Vinagre\n3. Argila',
    descricao: 'Montar a maquete usando argila ao redor de uma garrafa. Misturar os ingredientes para criar a erupcao.',
    imagem_capa: '/sample-images/project-volcano.svg',
    criado_por_id: 'prof-1',
    evento_id: 'evento-1',
  },
];

const mockProjetoUsuarios: ProjetoUsuario[] = [
  { id: 'pu-1', projeto_id: 'proj-1', usuario_id: 'prof-1', tipo_integrante: 'professor', data_vinculo: '2023-10-01T10:00:00Z' },
  { id: 'pu-2', projeto_id: 'proj-1', usuario_id: 'aluno-1', tipo_integrante: 'aluno', data_vinculo: '2023-10-01T10:05:00Z' },
  { id: 'pu-3', projeto_id: 'proj-1', usuario_id: 'aluno-2', tipo_integrante: 'aluno', data_vinculo: '2023-10-01T10:05:00Z' },
];

const mockComentarios: Comentario[] = [
  {
    id: 'com-1',
    texto: 'Lembrem de forrar a mesa antes da erupcao!',
    criado_por_id: 'prof-1',
    projeto_id: 'proj-1',
    data_comentario: '2023-10-05T10:00:00Z',
    moderado: false,
  },
];

const mockRegistrosDiario: RegistroDiario[] = [
  {
    id: 'reg-1',
    texto: 'Hoje compramos a argila e comecamos a montar a base.',
    criado_por_id: 'aluno-1',
    projeto_id: 'proj-1',
    data_criacao: '2023-10-10T14:30:00Z',
    aprovado: false,
    imagens: [
      {
        id: 'mid-1',
        url: '/sample-images/diary-lab.svg',
        registro_diario_id: 'reg-1',
        legenda: 'Montagem inicial da base',
      },
    ],
    arquivos: [
      {
        id: 'arq-1',
        base_64: 'RHVtbXkgQmFzZTY0',
        registro_diario_id: 'reg-1',
      },
    ],
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [eventos, setEventos] = useState<Evento[]>(mockEventos);
  const [eventoUsuarios, setEventoUsuarios] = useState<EventoUsuario[]>(mockEventoUsuarios);
  const [projetos, setProjetos] = useState<Projeto[]>(mockProjetos);
  const [projetoUsuarios, setProjetoUsuarios] = useState<ProjetoUsuario[]>(mockProjetoUsuarios);
  const [comentarios, setComentarios] = useState<Comentario[]>(mockComentarios);
  const [registrosDiario, setRegistrosDiario] = useState<RegistroDiario[]>(mockRegistrosDiario);

  const midiasDiario = useMemo(
    () => registrosDiario.flatMap(registro => registro.imagens),
    [registrosDiario]
  );

  const registroDiarioArquivos = useMemo(
    () => registrosDiario.flatMap(registro => registro.arquivos),
    [registrosDiario]
  );

  const addUsuario = (u: Omit<Usuario, 'id' | 'data_cadastro'>) => {
    setUsuarios(prev => [
      ...prev,
      { ...u, id: makeId('user'), data_cadastro: new Date().toISOString() },
    ]);
  };

  const updateUsuario = (id: string, updates: Partial<Usuario>) => {
    setUsuarios(prev => prev.map(usuario => (usuario.id === id ? { ...usuario, ...updates } : usuario)));
  };

  const removeUsuario = (id: string) => {
    setUsuarios(prev => prev.filter(usuario => usuario.id !== id));
    setEventoUsuarios(prev => prev.filter(v => v.usuario_id !== id));
    setProjetoUsuarios(prev => prev.filter(v => v.usuario_id !== id));
    setComentarios(prev => prev.filter(c => c.criado_por_id !== id));
    setRegistrosDiario(prev => prev.filter(r => r.criado_por_id !== id));

    const projectIdsCreatedByUser = projetos.filter(p => p.criado_por_id === id).map(p => p.id);
    if (projectIdsCreatedByUser.length > 0) {
      setProjetos(prev => prev.filter(p => p.criado_por_id !== id));
      setProjetoUsuarios(prev => prev.filter(v => !projectIdsCreatedByUser.includes(v.projeto_id)));
      setComentarios(prev => prev.filter(c => !projectIdsCreatedByUser.includes(c.projeto_id)));
      setRegistrosDiario(prev => prev.filter(r => !projectIdsCreatedByUser.includes(r.projeto_id)));
    }

    setEventos(prev => prev.filter(e => e.criado_por_id !== id));
  };

  const addEvento = (e: Omit<Evento, 'id'>) => {
    setEventos(prev => [...prev, { ...e, id: makeId('evento') }]);
  };

  const updateEvento = (id: string, updates: Partial<Evento>) => {
    setEventos(prev => prev.map(evento => (evento.id === id ? { ...evento, ...updates } : evento)));
  };

  const removeEvento = (id: string) => {
    setEventos(prev => prev.filter(evento => evento.id !== id));
    setEventoUsuarios(prev => prev.filter(v => v.evento_id !== id));
    setProjetos(prev => prev.map(p => (p.evento_id === id ? { ...p, evento_id: undefined } : p)));
  };

  const addEventoUsuario = (v: Omit<EventoUsuario, 'id' | 'data_vinculo'>) => {
    setEventoUsuarios(prev => {
      const exists = prev.some(item => item.evento_id === v.evento_id && item.usuario_id === v.usuario_id);
      if (exists) return prev;
      return [
        ...prev,
        { ...v, id: makeId('evu'), data_vinculo: new Date().toISOString() },
      ];
    });
  };

  const updateEventoUsuario = (id: string, updates: Partial<EventoUsuario>) => {
    setEventoUsuarios(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };

  const removeEventoUsuario = (id: string) => {
    setEventoUsuarios(prev => prev.filter(v => v.id !== id));
  };

  const addProjeto = (p: NovoProjeto, alunosIds: string[]) => {
    const newProjetoId = makeId('proj');
    const now = new Date().toISOString();
    const newProjeto: Projeto = {
      ...p,
      id: newProjetoId,
      situacao: p.situacao ?? 'ativo',
      data_criacao: now.split('T')[0],
    };

    setProjetos(prev => [...prev, newProjeto]);

    const newVinculos: ProjetoUsuario[] = [
      {
        id: makeId('pu-prof'),
        projeto_id: newProjetoId,
        usuario_id: p.criado_por_id,
        tipo_integrante: 'professor',
        data_vinculo: now,
      },
      ...alunosIds.map(alunoId => ({
        id: makeId('pu-aluno'),
        projeto_id: newProjetoId,
        usuario_id: alunoId,
        tipo_integrante: 'aluno' as const,
        data_vinculo: now,
      })),
    ];

    setProjetoUsuarios(prev => [...prev, ...newVinculos]);
  };

  const updateProjeto = (id: string, updates: Partial<Projeto>) => {
    setProjetos(prev => prev.map(projeto => (projeto.id === id ? { ...projeto, ...updates } : projeto)));
  };

  const removeProjeto = (id: string) => {
    setProjetos(prev => prev.filter(projeto => projeto.id !== id));
    setProjetoUsuarios(prev => prev.filter(v => v.projeto_id !== id));
    setComentarios(prev => prev.filter(c => c.projeto_id !== id));
    setRegistrosDiario(prev => prev.filter(r => r.projeto_id !== id));
  };

  const addProjetoUsuario = (v: Omit<ProjetoUsuario, 'id' | 'data_vinculo'>) => {
    setProjetoUsuarios(prev => {
      const exists = prev.some(item => item.projeto_id === v.projeto_id && item.usuario_id === v.usuario_id);
      if (exists) return prev;
      return [
        ...prev,
        { ...v, id: makeId('pu'), data_vinculo: new Date().toISOString() },
      ];
    });
  };

  const updateProjetoUsuario = (id: string, updates: Partial<ProjetoUsuario>) => {
    setProjetoUsuarios(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };

  const removeProjetoUsuario = (id: string) => {
    setProjetoUsuarios(prev => prev.filter(v => v.id !== id));
  };

  const addComentario = (c: Omit<Comentario, 'id' | 'data_comentario' | 'moderado' | 'moderado_por_id' | 'data_moderacao'>) => {
    setComentarios(prev => [
      ...prev,
      {
        ...c,
        id: makeId('com'),
        data_comentario: new Date().toISOString(),
        moderado: false,
      },
    ]);
  };

  const updateComentario = (id: string, updates: Partial<Comentario>) => {
    setComentarios(prev => prev.map(comentario => (comentario.id === id ? { ...comentario, ...updates } : comentario)));
  };

  const removeComentario = (id: string) => {
    setComentarios(prev => prev.filter(comentario => comentario.id !== id));
  };

  const moderateComentario = (id: string, moderado: boolean, moderadoPorId: string) => {
    setComentarios(prev =>
      prev.map(comentario =>
        comentario.id === id
          ? {
              ...comentario,
              moderado,
              moderado_por_id: moderado ? moderadoPorId : undefined,
              data_moderacao: moderado ? new Date().toISOString() : undefined,
            }
          : comentario
      )
    );
  };

  const addRegistroDiario = (r: Omit<RegistroDiario, 'id' | 'data_criacao' | 'aprovado' | 'aprovado_por_id' | 'data_aprovacao' | 'arquivos'>) => {
    const registroId = makeId('reg');
    setRegistrosDiario(prev => [
      ...prev,
      {
        ...r,
        id: registroId,
        data_criacao: new Date().toISOString(),
        aprovado: false,
        imagens: r.imagens.map((imagem, index) => ({
          ...imagem,
          id: imagem.id || makeId(`mid-${index}`),
          registro_diario_id: registroId,
        })),
        arquivos: [],
      },
    ]);
  };

  const updateRegistroDiario = (id: string, updates: Partial<RegistroDiario>) => {
    setRegistrosDiario(prev => prev.map(registro => (registro.id === id ? { ...registro, ...updates } : registro)));
  };

  const removeRegistroDiario = (id: string) => {
    setRegistrosDiario(prev => prev.filter(registro => registro.id !== id));
  };

  const approveRegistroDiario = (id: string, aprovado: boolean, aprovadorId: string) => {
    setRegistrosDiario(prev =>
      prev.map(registro =>
        registro.id === id
          ? {
              ...registro,
              aprovado,
              aprovado_por_id: aprovado ? aprovadorId : undefined,
              data_aprovacao: aprovado ? new Date().toISOString() : undefined,
            }
          : registro
      )
    );
  };

  const addRegistroDiarioArquivo = (a: Omit<RegistroDiarioArquivo, 'id'>) => {
    const newFile: RegistroDiarioArquivo = { ...a, id: makeId('arq') };
    setRegistrosDiario(prev =>
      prev.map(registro =>
        registro.id === a.registro_diario_id
          ? { ...registro, arquivos: [...registro.arquivos, newFile] }
          : registro
      )
    );
  };

  const updateRegistroDiarioArquivo = (id: string, updates: Partial<RegistroDiarioArquivo>) => {
    setRegistrosDiario(prev =>
      prev.map(registro => ({
        ...registro,
        arquivos: registro.arquivos.map(arquivo =>
          arquivo.id === id ? { ...arquivo, ...updates } : arquivo
        ),
      }))
    );
  };

  const removeRegistroDiarioArquivo = (id: string) => {
    setRegistrosDiario(prev =>
      prev.map(registro => ({
        ...registro,
        arquivos: registro.arquivos.filter(arquivo => arquivo.id !== id),
      }))
    );
  };

  const addAlunoAoProjeto = (projetoId: string, alunoId: string) => {
    addProjetoUsuario({
      projeto_id: projetoId,
      usuario_id: alunoId,
      tipo_integrante: 'aluno',
    });
  };

  const removeAlunoDoProjeto = (projetoId: string, alunoId: string) => {
    setProjetoUsuarios(prev =>
      prev.filter(
        pu => !(pu.projeto_id === projetoId && pu.usuario_id === alunoId && pu.tipo_integrante === 'aluno')
      )
    );
  };

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
        addUsuario,
        updateUsuario,
        removeUsuario,
        addEvento,
        updateEvento,
        removeEvento,
        addEventoUsuario,
        updateEventoUsuario,
        removeEventoUsuario,
        addProjeto,
        updateProjeto,
        removeProjeto,
        addProjetoUsuario,
        updateProjetoUsuario,
        removeProjetoUsuario,
        addComentario,
        updateComentario,
        removeComentario,
        moderateComentario,
        addRegistroDiario,
        updateRegistroDiario,
        removeRegistroDiario,
        approveRegistroDiario,
        addRegistroDiarioArquivo,
        updateRegistroDiarioArquivo,
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
