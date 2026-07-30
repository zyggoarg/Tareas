import { useState } from 'react';
import { X } from 'lucide-react';
import { Usuario, Tablero } from '../types';
import { useSectores } from '../hooks/useSectores';

interface NuevoTableroModalProps {
  usuarioActual: Usuario;
  proyectoActivoId: string;
  onCerrar: () => void;
  onCrear: (datos: {
    nombre: string;
    descripcion?: string;
    proyectoId: string;
    sectorId?: string;
    color?: string;
    creadoPorId: string;
  }) => Promise<Tablero>;
}

export const NuevoTableroModal = ({
  usuarioActual,
  proyectoActivoId,
  onCerrar,
  onCrear
}: NuevoTableroModalProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [creando, setCreando] = useState(false);

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
      setCreando(true);
      await onCrear({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        proyectoId: proyectoActivoId,
        sectorId: sectorId || undefined,
        color,
        creadoPorId: usuarioActual.id
      });
      onCerrar();
    } catch (error) {
      alert('Error al crear el tablero');
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Nuevo Tablero</h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
            disabled={creando}
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
              disabled={creando}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Describe el propósito de este tablero..."
              disabled={creando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector (opcional)
            </label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={creando}
            >
              <option value="">Sin sector específico</option>
              {sectores.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color del tablero
            </label>
            <div className="grid grid-cols-4 gap-2">
              {coloresDisponibles.map(c => (
                <button
                  key={c.valor}
                  type="button"
                  onClick={() => setColor(c.valor)}
                  className={`h-12 rounded-lg transition-all ${
                    color === c.valor
                      ? 'ring-2 ring-offset-2 ring-gray-900'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.valor }}
                  title={c.nombre}
                  disabled={creando}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={creando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creando || !nombre.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creando ? 'Creando...' : 'Crear Tablero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
