import React, { useState } from 'react';
import { FolderKanban, Plus, Pencil as Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { Proyecto, EstadoProyecto } from '../types';

interface ProjectManagementProps {
  proyectos: Proyecto[];
  onCrearProyecto: (proyecto: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  onActualizarProyecto: (id: string, datos: Partial<Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>) => void;
  onEliminarProyecto: (id: string) => void;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({
  proyectos,
  onCrearProyecto,
  onActualizarProyecto,
  onEliminarProyecto
}) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState<Proyecto | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoProyecto | 'todos'>('todos');

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState<EstadoProyecto>('activo');
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState('');

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setEstado('activo');
    setActivo(true);
    setError('');
    setProyectoEditando(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre del proyecto es obligatorio');
      return;
    }

    try {
      if (proyectoEditando) {
        onActualizarProyecto(proyectoEditando.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          estado,
          activo
        });
      } else {
        onCrearProyecto({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          estado,
          activo
        });
      }

      limpiarFormulario();
      setMostrarForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    }
  };

  const handleEditar = (proyecto: Proyecto) => {
    setProyectoEditando(proyecto);
    setNombre(proyecto.nombre);
    setDescripcion(proyecto.descripcion || '');
    setEstado(proyecto.estado);
    setActivo(proyecto.activo);
    setMostrarForm(true);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleCancelar = () => {
    limpiarFormulario();
    setMostrarForm(false);
  };

  const proyectosFiltrados = proyectos.filter(proyecto => {
    const coincideBusqueda = busqueda === '' ||
      proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideEstado = filtroEstado === 'todos' || proyecto.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
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
            <FolderKanban className="w-6 h-6" />
            Gestión de Proyectos
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Administrar proyectos del sistema
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </button>
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">
                {proyectoEditando ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h3>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Planta Central 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción del proyecto..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoProyecto)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="activo">Activo</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Visible en Sistema
                  </label>
                  <div className="flex items-center h-10">
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Proyecto activo en el sistema
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
              >
                <CheckCircle className="w-4 h-4" />
                {proyectoEditando ? 'Actualizar' : 'Crear'} Proyecto
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
                Buscar proyecto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar por nombre o descripción"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Filtrar por estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as EstadoProyecto | 'todos')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-xs sm:text-sm text-gray-600">
            Mostrando {proyectosFiltrados.length} de {proyectos.length} proyectos
          </div>
        </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Descripción
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Fecha Creación
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proyectosFiltrados.map((proyecto) => (
                <tr key={proyecto.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                        <FolderKanban className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {proyecto.nombre}
                        </div>
                        {!proyecto.activo && (
                          <div className="text-xs text-gray-500">
                            Oculto
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    {proyecto.descripcion || '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      proyecto.estado === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {proyecto.estado === 'activo' ? 'Activo' : 'Finalizado'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {formatearFecha(proyecto.fechaCreacion)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(proyecto)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="Editar proyecto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Está seguro de eliminar el proyecto ${proyecto.nombre}?`)) {
                            onEliminarProyecto(proyecto.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Eliminar proyecto"
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

          {proyectosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">No se encontraron proyectos</p>
            </div>
          )}
        </div>
    </div>
  );
};
