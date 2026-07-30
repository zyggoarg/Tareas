import React, { useState } from 'react';
import { X, Save, Camera, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Usuario } from '../types';

interface ProfileEditProps {
  usuario: Usuario;
  onActualizarPerfil: (datos: {
    nombre?: string;
    apellido?: string;
    photoUrl?: string;
  }) => Promise<void>;
  onCambiarContraseña: (contraseñaActual: string, contraseñaNueva: string) => Promise<void>;
  onCerrar: () => void;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({
  usuario,
  onActualizarPerfil,
  onCambiarContraseña,
  onCerrar
}) => {
  const [nombre, setNombre] = useState(usuario.nombre);
  const [apellido, setApellido] = useState(usuario.apellido);
  const [photoUrl, setPhotoUrl] = useState(usuario.photoUrl || '');
  const [contraseñaActual, setContraseñaActual] = useState('');
  const [contraseñaNueva, setContraseñaNueva] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [mostrarContraseñaActual, setMostrarContraseñaActual] = useState(false);
  const [mostrarContraseñaNueva, setMostrarContraseñaNueva] = useState(false);
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] = useState(false);
  const [cambiarContraseña, setCambiarContraseña] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!nombre.trim() || !apellido.trim()) {
      setError('Nombre y apellido son obligatorios');
      return;
    }

    if (cambiarContraseña) {
      if (!contraseñaActual || !contraseñaNueva || !confirmarContraseña) {
        setError('Debe completar todos los campos de contraseña');
        return;
      }

      if (contraseñaNueva !== confirmarContraseña) {
        setError('Las contraseñas nuevas no coinciden');
        return;
      }

      if (contraseñaNueva.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (contraseñaNueva === contraseñaActual) {
        setError('La nueva contraseña debe ser diferente a la actual');
        return;
      }
    }

    try {
      setCargando(true);

      // Actualizar datos de perfil (nombre, apellido, foto)
      await onActualizarPerfil({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        photoUrl: photoUrl.trim() || undefined
      });

      // Cambiar contraseña por separado si fue solicitado
      if (cambiarContraseña && contraseñaNueva) {
        await onCambiarContraseña(contraseñaActual, contraseñaNueva);
        setContraseñaActual('');
        setContraseñaNueva('');
        setConfirmarContraseña('');
        setCambiarContraseña(false);
      }

      setExito('Perfil actualizado correctamente');

      setTimeout(() => {
        onCerrar();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Editar Mi Perfil</h3>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {exito && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-green-700">{exito}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
              <div className="relative">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Foto de perfil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${nombre}+${apellido}&size=128&background=3b82f6&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                    {nombre.charAt(0).toUpperCase()}{apellido.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Información Personal</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={cargando}
                  />
                </div>

                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="apellido"
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                <input
                  type="text"
                  value={usuario.dni}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  El DNI no puede ser modificado
                </p>
              </div>

              {usuario.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="text"
                    value={usuario.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Para cambiar el correo, contacte al administrador
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <input
                  type="text"
                  value={usuario.rol === 'administrador' ? 'Administrador' : 'Usuario'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Cambiar Contraseña</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cambiarContraseña}
                    onChange={(e) => {
                      setCambiarContraseña(e.target.checked);
                      if (!e.target.checked) {
                        setContraseñaActual('');
                        setContraseñaNueva('');
                        setConfirmarContraseña('');
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    disabled={cargando}
                  />
                  <span className="text-sm text-gray-600">Modificar contraseña</span>
                </label>
              </div>

              {cambiarContraseña && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="contraseñaActual" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña Actual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="contraseñaActual"
                        type={mostrarContraseñaActual ? 'text' : 'password'}
                        value={contraseñaActual}
                        onChange={(e) => setContraseñaActual(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={cargando}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarContraseñaActual(!mostrarContraseñaActual)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {mostrarContraseñaActual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contraseñaNueva" className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="contraseñaNueva"
                        type={mostrarContraseñaNueva ? 'text' : 'password'}
                        value={contraseñaNueva}
                        onChange={(e) => setContraseñaNueva(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={cargando}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarContraseñaNueva(!mostrarContraseñaNueva)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {mostrarContraseñaNueva ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  </div>

                  <div>
                    <label htmlFor="confirmarContraseña" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmarContraseña"
                        type={mostrarConfirmarContraseña ? 'text' : 'password'}
                        value={confirmarContraseña}
                        onChange={(e) => setConfirmarContraseña(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={cargando}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmarContraseña(!mostrarConfirmarContraseña)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {mostrarConfirmarContraseña ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={cargando || exito !== ''}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-blue-400"
              >
                <Save className="w-4 h-4" />
                {cargando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={onCerrar}
                disabled={cargando}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
