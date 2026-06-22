import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LayoutDashboard, Users, LogOut, Menu, X, KeyRound } from 'lucide-react';
import { useState } from 'react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isTeacher = user.tipo_usuario === 'professor';

  const navLinks = [
    { name: 'Dashboard de Projetos', href: '/', icon: LayoutDashboard },
    { name: 'Mudar Senha', href: '/mudar-senha', icon: KeyRound },
    ...(isTeacher ? [{ name: 'Painel de Gestão', href: '/teacher', icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-100" />
              <span className="font-bold text-xl tracking-tight hidden sm:block">
                EduProjetos
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-600'
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm text-blue-100 text-right">
                <p className="font-medium text-white">{user.nome}</p>
                <p className="text-xs capitalize">{user.tipo_usuario}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-blue-200 hover:text-white hover:bg-blue-600 rounded-full transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-600 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-800 border-t border-blue-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="px-3 py-2 border-b border-blue-700 mb-2">
                <p className="font-medium text-white">{user.nome}</p>
                <p className="text-xs text-blue-200 capitalize">{user.tipo_usuario}</p>
              </div>
              
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                );
              })}
              
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 mt-4 rounded-md text-base font-medium text-red-200 hover:bg-red-600 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sair do sistema
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
