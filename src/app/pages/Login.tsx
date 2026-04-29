import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { GraduationCap, Mail, Lock, AlertCircle, LogIn, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('professor', email || 'professor@escola.com');
    navigate('/');
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('aluno', email || 'aluno@escola.com');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-700 py-8 px-8 flex flex-col items-center">
          <div className="bg-white/20 p-4 rounded-full mb-4 ring-4 ring-blue-500/30">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white text-center tracking-tight">EduProjetos</h1>
          <p className="text-blue-100 text-center mt-2 font-medium opacity-90">Plataforma Educacional de Gestão</p>
        </div>
        
        <div className="p-8 space-y-8">
          <form className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">
                  E-mail institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="voce@escola.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleTeacherLogin}
                type="button"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Entrar como Professor
              </button>
              
              <button
                onClick={handleStudentLogin}
                type="button"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-blue-200 rounded-xl shadow-sm text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200 transition-colors"
              >
                <GraduationCap className="h-4 w-4" />
                Entrar como Aluno
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center justify-between group cursor-pointer">
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700 transition-colors">
                É professor e não tem conta?
              </span>
              <a href="#" className="text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1">
                Criar conta de Professor <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            
            <div className="bg-amber-50 rounded-xl p-4 flex gap-3 items-start border border-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium">
                Alunos: O acesso é exclusivo via convite. Solicitem o acesso ao seu professor para poderem utilizar a plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};