import { useState } from 'react';
import { X } from 'lucide-react';
import { Tarjeta, Usuario } from '../types';

const toLocalDateTimeInputValue = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

interface TarjetaEditModalProps {
  tarjeta: Tarjeta;
  usuarioActual: Usuario;
  onCerrar: () => void;
  onActualizar: (tarjetaId: string, datos: any) => Promise<void>;
}

export const TarjetaEditModal = ({
  tarjeta,
  usuarioActual,
  onCerrar,
  onActualizar
}: TarjetaEditModalProps) => {
  const [titulo, setTitulo] = useState(tarjeta.titulo);
  const [descripcion, setDescripcion] = useState(tarjeta.descripcion || '');
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta' | 'critica'>(tarjeta.prioridad);
  const [fechaInicio, setFechaInicio] = useState<string>(
    tarjeta.fechaInicio
      ? toLocalDateTimeInputValue(new Date(tarjeta.fechaInicio))
      : ''
  );
  const [fechaVencimiento, setFechaVencimiento] = useState<string>(
    tarjeta.fechaVencimiento
      ? toLocalDateTimeInputValue(new Date(tarjeta.fechaVencimiento))
      : ''
  );
  const [duracion, setDuracion] = useState<string>(
    tarjeta.duracion ? tarjeta.duracion.toString() : ''
  );
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    try {
      setGuardando(true);
      await onActualizar(tarjeta.id, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        prioridad,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        duracion: duracion ? parseInt(duracion) : null
      });
      onCerrar();
    } catch (error) {
      alert('Error al actualizar la tarjeta');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Editar Tarjeta</h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
            disabled={guardando}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Título de la tarjeta"
              disabled={guardando}
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
              rows={4}
              placeholder="Añade una descripción más detallada..."
              disabled={guardando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as 'baja' | 'media' | 'alta' | 'critica')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={guardando}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y hora de inicio
              </label>
              <input
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={guardando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y hora de fin
              </label>
              <input
                type="datetime-local"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={guardando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (días)
              </label>
              <input
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                min="1"
                placeholder="Ej: 5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={guardando}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !titulo.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
