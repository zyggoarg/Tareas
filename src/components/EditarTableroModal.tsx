import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Tablero } from '../types';
import { useSectores } from '../hooks/useSectores';

interface EditarTableroModalProps {
  tablero: Tablero;
  onCerrar: () => void;
  onActualizar: (tableroId: string, datos: {
    nombre: string;
    descripcion?: string;
    sectorId?: string;
    color?: string;
  }) => Promise<void>;
}

export const EditarTableroModal = ({
  tablero,
  onCerrar,
  onActualizar
}: EditarTableroModalProps) => {
  const [nombre, setNombre] = useState(tablero.nombre);
  const [descripcion, setDescripcion] = useState(tablero.descripcion || '');
  const [sectorId, setSectorId] = useState(tablero.sector?.id || '');
  const [color, setColor] = useState(tablero.color);
  const [actualizando, setActualizando] = useState(false);

  const { sectores } = useSectores();

  const coloresDisponibles = [
    { nombre: 'Azul', valor: '#3b82f6' },
    { nombre: 'Verde', valor: '#10b981' },
    { nombre: 'Morado', valor: '#8b5cf6' },
    { nombre: 'Rosa', valor: '#ec4899' },
    { nombre: 'Naranja', valor: '#f59e0b' },
    { nombre: 'Rojo', valor: '#ef4444' },
    { nombre: 'Gris', valor: '#6b7280' },
    { nombre: 'Índigo', valor: '#6366f1' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      setActualizando(true);
      await onActualizar(tablero.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        sectorId: sectorId || undefined,
        color
      });
      onCerrar();
    } catch (error) {
      alert('Error al actualizar el tablero');
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Editar Tablero</h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
            disabled={actualizando}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del tablero *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Desarrollo Sprint 1"
              disabled={actualizando}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción del tablero (opcional)"
              disabled={actualizando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector
            </label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={actualizando}
            >
              <option value="">Sin sector (visible para todos)</option>
              {sectores.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.nombre}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Si seleccionas un sector, solo los usuarios asignados a ese sector verán este tablero
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {coloresDisponibles.map(({ nombre, valor }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setColor(valor)}
                  className={`h-10 rounded-lg transition-all ${
                    color === valor ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: valor }}
                  title={nombre}
                  disabled={actualizando}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={actualizando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={actualizando || !nombre.trim()}
            >
              {actualizando ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
