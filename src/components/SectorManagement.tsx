import React, { useState } from 'react';
import { Plus, Pencil as Edit2, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { Sector } from '../types';

interface SectorManagementProps {
  sectores: Sector[];
  onCrearSector: (datos: Omit<Sector, 'id' | 'fechaCreacion'>) => Promise<Sector>;
  onActualizarSector: (id: string, datos: Partial<Omit<Sector, 'id' | 'fechaCreacion'>>) => Promise<void>;
  onDesactivarSector: (id: string) => Promise<void>;
}

export const SectorManagement: React.FC<SectorManagementProps> = ({
  sectores,
  onCrearSector,
  onActualizarSector,
  onDesactivarSector
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [sectorEditando, setSectorEditando] = useState<Sector | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const resetearFormulario = () => {
    setNombre('');
    setDescripcion('');
    setError('');
    setSectorEditando(null);
    setMostrarFormulario(false);
  };

  const handleEditar = (sector: Sector) => {
    setSectorEditando(sector);
    setNombre(sector.nombre);
    setDescripcion(sector.descripcion || '');
    setMostrarFormulario(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre del sector es obligatorio');
      return;
    }

    try {
      setCargando(true);

      if (sectorEditando) {
        await onActualizarSector(sectorEditando.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo: true
        });
      } else {
        await onCrearSector({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo: true
        });
      }

      resetearFormulario();
    } catch (err) {
      setError('Error al guardar el sector. Por favor, intente nuevamente.');
      // Error
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: string, nombreSector: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el sector "${nombreSector}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setCargando(true);
      await onDesactivarSector(id);
    } catch (err) {
      setError('Error al eliminar el sector. Por favor, intente nuevamente.');
      // Error
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sectores</h2>
          <p className="text-sm text-gray-600 mt-1">Administra los sectores de trabajo del sistema</p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Sector
        </button>
      </div>

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {sectorEditando ? 'Editar Sector' : 'Nuevo Sector'}
                </h3>
                <button
                  onClick={resetearFormulario}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Sector <span className="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Producción, Mantenimiento, etc."
                disabled={cargando}
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descripción opcional del sector..."
                disabled={cargando}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={cargando}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-blue-400"
              >
                <Save className="w-4 h-4" />
                {cargando ? 'Guardando...' : sectorEditando ? 'Actualizar' : 'Crear Sector'}
              </button>
              <button
                type="button"
                onClick={resetearFormulario}
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
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sectores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No hay sectores registrados. Crea el primer sector para comenzar.
                  </td>
                </tr>
              ) : (
                sectores.map((sector) => (
                  <tr key={sector.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{sector.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {sector.descripcion || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sector.fechaCreacion.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditar(sector)}
                          disabled={cargando}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Editar sector"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(sector.id, sector.nombre)}
                          disabled={cargando}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar sector"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
