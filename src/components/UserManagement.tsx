import React, { useState } from 'react';
import { Users, Plus, Pencil as Edit, Trash2, Shield, User, Search, UserCheck } from 'lucide-react';
import { Usuario, RolUsuario, Sector, Proyecto } from '../types';
import { MultiSelectSectores } from './MultiSelectSectores';
import { MultiSelectProyectos } from './MultiSelectProyectos';

interface UserManagementProps {
  usuarios: Usuario[];
  sectores: Sector[];
  proyectos: Proyecto[];
  onCrearUsuario: (usuario: Omit<Usuario, 'id' | 'fechaCreacion'> & { contraseña: string }) => void;
  onActualizarUsuario: (id: string, datos: Partial<Omit<Usuario, 'id' | 'fechaCreacion'>> & { contraseña?: string }) => void;
  onDesactivarUsuario: (id: string) => void;
  onActualizarSectoresUsuario: (usuarioId: string, sectoresIds: string[]) => void;
  onActualizarProyectosUsuario: (usuarioId: string, proyectosIds: string[]) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  usuarios,
  sectores,
  proyectos,
  onCrearUsuario,
  onActualizarUsuario,
  onDesactivarUsuario,
  onActualizarSectoresUsuario,
  onActualizarProyectosUsuario
}) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<RolUsuario | 'todos'>('todos');
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [rol, setRol] = useState<RolUsuario>('usuario');
  const [moduloNovedades, setModuloNovedades] = useState(true);
  const [moduloTareas, setModuloTareas] = useState(true);
  const [sectoresSeleccionados, setSectoresSeleccionados] = useState<string[]>([]);
  const [proyectosSeleccionados, setProyectosSeleccionados] = useState<string[]>([]);
  const [error, setError] = useState('');

  const limpiarFormulario = () => {
    setNombre('');
    setApellido('');
    setDni('');
    setEmail('');
    setContraseña('');
    setRol('usuario');
    setModuloNovedades(true);
    setModuloTareas(true);
    setSectoresSeleccionados([]);
    setProyectosSeleccionados([]);
    setError('');
    setUsuarioEditando(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim() || !apellido.trim() || !dni.trim() || !email.trim() || (!usuarioEditando && !contraseña.trim())) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!moduloNovedades && !moduloTareas) {
      setError('El usuario debe tener al menos un módulo activo');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingrese un correo electrónico válido');
      return;
    }

    try {
      if (usuarioEditando) {
        const datosActualizacion: any = {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          dni: dni.trim(),
          email: email.trim(),
          rol,
          moduloNovedades,
          moduloTareas,
          activo: true
        };

        if (contraseña.trim()) {
          datosActualizacion.contraseña = contraseña.trim();
        }

        await onActualizarUsuario(usuarioEditando.id, datosActualizacion);
        await onActualizarSectoresUsuario(usuarioEditando.id, sectoresSeleccionados);
        await onActualizarProyectosUsuario(usuarioEditando.id, proyectosSeleccionados);
      } else {
        const sectoresParaUsuario = sectores.filter(s => sectoresSeleccionados.includes(s.id));
        const proyectosParaUsuario = proyectos.filter(p => proyectosSeleccionados.includes(p.id));

        await onCrearUsuario({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          dni: dni.trim(),
          email: email.trim(),
          contraseña: contraseña.trim(),
          rol,
          moduloNovedades,
          moduloTareas,
          activo: true,
          sectores: sectoresParaUsuario,
          proyectos: proyectosParaUsuario
        });
      }

      limpiarFormulario();
      setMostrarForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setNombre(usuario.nombre);
    setApellido(usuario.apellido);
    setDni(usuario.dni);
    setEmail(usuario.email || '');
    setContraseña('');
    setRol(usuario.rol);
    setModuloNovedades(usuario.moduloNovedades);
    setModuloTareas(usuario.moduloTareas);
    setSectoresSeleccionados((usuario.sectores || []).map(s => s.id));
    setProyectosSeleccionados((usuario.proyectos || []).map(p => p.id));
    setMostrarForm(true);
  };

  const handleCancelar = () => {
    limpiarFormulario();
    setMostrarForm(false);
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = busqueda === '' || 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.dni.includes(busqueda);
    
    const coincideRol = filtroRol === 'todos' || usuario.rol === filtroRol;

    return coincideBusqueda && coincideRol;
  });

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Gestión de Usuarios
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Administrar usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">
                {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del usuario"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apellido del usuario"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  DNI *
                </label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de DNI"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Contraseña {usuarioEditando ? '(dejar vacío para mantener)' : '*'}
                </label>
                <input
                  type="password"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contraseña del usuario"
                  required={!usuarioEditando}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RolUsuario)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="usuario">Usuario</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Módulos Habilitados *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moduloNovedades}
                      onChange={(e) => setModuloNovedades(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Módulo de Novedades</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moduloTareas}
                      onChange={(e) => setModuloTareas(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Módulo de Tareas (Tableros)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  * El usuario debe tener al menos un módulo habilitado
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Sectores Asignados {rol === 'usuario' && '*'}
                </label>
                <MultiSelectSectores
                  sectores={sectores}
                  sectoresSeleccionados={sectoresSeleccionados}
                  onCambioSeleccion={setSectoresSeleccionados}
                  placeholder={rol === 'administrador'
                    ? "Seleccionar sectores (opcional para administradores)..."
                    : "Seleccionar sectores..."
                  }
                />
                {sectoresSeleccionados.length === 0 && rol === 'usuario' && (
                  <p className="text-xs text-amber-600 mt-1">
                    * Los usuarios requieren al menos un sector asignado
                  </p>
                )}
                {sectoresSeleccionados.length === 0 && rol === 'administrador' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Los administradores pueden ver todos los sectores si no seleccionan ninguno
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Proyectos Asignados
                </label>
                <MultiSelectProyectos
                  proyectos={proyectos}
                  proyectosSeleccionados={proyectosSeleccionados}
                  onCambioSeleccion={setProyectosSeleccionados}
                  placeholder="Seleccionar proyectos (opcional)..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si no se seleccionan proyectos, el usuario puede acceder a todos
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
              >
                <UserCheck className="w-4 h-4" />
                {usuarioEditando ? 'Actualizar' : 'Crear'} Usuario
              </button>
              <button
                type="button"
                onClick={handleCancelar}
                className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Buscar usuario
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar por nombre, apellido o DNI"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Filtrar por rol
              </label>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value as RolUsuario | 'todos')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los roles</option>
                <option value="administrador">Administrador</option>
                <option value="usuario">Usuario</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-xs sm:text-sm text-gray-600">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </div>
        </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  DNI
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Fecha Creación
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        usuario.rol === 'administrador' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {usuario.rol === 'administrador' ? (
                          <Shield className="w-4 h-4 text-red-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          DNI: {usuario.dni}
                        </div>
                          <div className="text-xs text-gray-500">
                            {(usuario.sectores || []).length} sector(es) | {(usuario.proyectos || []).length} proyecto(s)
                          </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    {usuario.dni}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.rol === 'administrador' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <span className="hidden sm:inline">{usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}</span>
                      <span className="sm:hidden">{usuario.rol === 'administrador' ? 'Admin' : 'User'}</span>
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {formatearFecha(usuario.fechaCreacion)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(usuario)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Está seguro de desactivar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
                            onDesactivarUsuario(usuario.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Desactivar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">No se encontraron usuarios</p>
            </div>
          )}
        </div>
    </div>
  );
};