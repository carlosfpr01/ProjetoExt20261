import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TipoUsuario = 'professor' | 'aluno';

export interface User {
  id: string;
  nome: string;
  tipo_usuario: TipoUsuario;
  email: string;
  // Propriedades de Professor
  materia?: string;
  is_adm?: boolean;
  // Propriedades de Aluno
  matricula?: string;
  ano_escolar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (tipo_usuario: TipoUsuario, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (tipo_usuario: TipoUsuario, email: string) => {
    setUser({
      id: tipo_usuario === 'professor' ? 'prof-1' : 'aluno-1',
      nome: tipo_usuario === 'professor' ? 'Prof. Carlos' : 'Ana Souza',
      tipo_usuario,
      email,
      ...(tipo_usuario === 'professor' 
        ? { materia: 'Ciências', is_adm: true } 
        : { matricula: '20230001', ano_escolar: '8º Ano' }
      )
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
