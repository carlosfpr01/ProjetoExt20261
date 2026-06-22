import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { ApiError, backendApi, type FrontRole, type UserSummary } from '../lib/api';
import { toast } from 'sonner';

export type TipoUsuario = FrontRole;
export type User = UserSummary;

interface RegisterData {
  token: string;
  email: string;
  senha: string;
}

interface LoginData {
  email: string;
  senha: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'edu-projetos-auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return;

    try {
      const parsed = JSON.parse(rawValue) as { token: string; user: User };
      if (parsed?.token && parsed?.user) {
        setToken(parsed.token);
        setUser(parsed.user);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persistAuth = (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  };

  const clearError = () => setError(null);

  const login = async ({ email, senha }: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendApi.login(email, senha);
      persistAuth(response.token, response.usuario);
      toast.success('Login realizado com sucesso.');
    } catch (caughtError) {
      const message = caughtError instanceof ApiError ? caughtError.message : 'Nao foi possivel entrar.';
      setError(message);
      toast.error(message);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ token: inviteToken, email, senha }: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      await backendApi.register({ token: inviteToken, email, senha });
      const response = await backendApi.login(email, senha);
      persistAuth(response.token, response.usuario);
      toast.success('Cadastro concluido com sucesso.');
    } catch (caughtError) {
      const message = caughtError instanceof ApiError ? caughtError.message : 'Nao foi possivel concluir o cadastro.';
      setError(message);
      toast.error(message);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, token, loading, error, login, register, logout, clearError }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
