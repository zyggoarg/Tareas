import React, { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, contraseña: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (!email.trim() || !contraseña.trim()) {
      setError('Por favor complete todos los campos');
      setCargando(false);
      return;
    }

    const loginExitoso = await onLogin(email.trim(), contraseña);

    if (!loginExitoso) {
      setError('Correo o contraseña incorrectos');
    }

    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-6">
            <img 
              src="/Rotorc alta calidad.png" 
              alt="Rotorc Logo" 
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sistema de Gestión de Novedades
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 sm:mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-xs sm:text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="correo@ejemplo.com"
                disabled={cargando}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese su contraseña"
                disabled={cargando}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 sm:py-3 px-4 text-sm sm:text-base rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {cargando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
            <span className="sm:hidden">{cargando ? 'Iniciando...' : 'Entrar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};