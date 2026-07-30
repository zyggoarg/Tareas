import { useState } from 'react';
import { Plus, MoreVertical, Trash2, CreditCard as Edit } from 'lucide-react';
import { Lista, Usuario, Tarjeta } from '../types';
import { TarjetaCard } from './TarjetaCard';

interface ListaColumnProps {
  lista: Lista;
  usuarioActual: Usuario;
  onCrearTarjeta: (datos: {
    listaId: string;
    titulo: string;
    descripcion?: string;
    prioridad?: 'baja' | 'media' | 'alta' | 'critica';
    fechaInicio?: Date;
    fechaVencimiento?: Date;
    creadoPorId: string;
    asignadosIds?: string[];
  }) => Promise<any>;
  onMoverTarjeta: (tarjetaId: string, nuevaListaId: string, nuevoOrden: number) => Promise<void>;
  onActualizarTarjeta: (tarjetaId: string, datos: any) => Promise<void>;
  onEliminarTarjeta: (tarjetaId: string) => Promise<void>;
  onEliminarLista: (listaId: string) => Promise<void>;
  onEditarLista?: (lista: Lista) => void;
  onAgregarComentario?: (tarjetaId: string, texto: string) => Promise<void>;
  onSubirAdjunto?: (tarjetaId: string, archivo: File) => Promise<void>;
  onRegistrarActividad?: (tarjetaId: string, usuarioId: string, tipo: string, descripcion: string, metadata?: Record<string, any>) => Promise<void>;
  onAgregarEtiqueta?: (tarjetaId: string, etiquetaId: string) => Promise<void>;
  onQuitarEtiqueta?: (tarjetaId: string, etiquetaId: string) => Promise<void>;
  onAgregarAsignado?: (tarjetaId: string, usuarioId: string) => Promise<void>;
  onQuitarAsignado?: (tarjetaId: string, usuarioId: string) => Promise<void>;
  tableroId: string;
}

export const ListaColumn = ({
  lista,
  usuarioActual,
  onCrearTarjeta,
  onMoverTarjeta,
  onActualizarTarjeta,
  onEliminarTarjeta,
  onEliminarLista,
  onEditarLista,
  onAgregarComentario,
  onSubirAdjunto,
  onRegistrarActividad,
  onAgregarEtiqueta,
  onQuitarEtiqueta,
  onAgregarAsignado,
  onQuitarAsignado,
  tableroId
}: ListaColumnProps) => {
  const [tituloNuevaTarjeta, setTituloNuevaTarjeta] = useState('');
  const [descripcionNuevaTarjeta, setDescripcionNuevaTarjeta] = useState('');
  const [prioridadNuevaTarjeta, setPrioridadNuevaTarjeta] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [fechaInicioNuevaTarjeta, setFechaInicioNuevaTarjeta] = useState('');
  const [fechaVencimientoNuevaTarjeta, setFechaVencimientoNuevaTarjeta] = useState('');
  const [mostrandoFormTarjeta, setMostrandoFormTarjeta] = useState(false);
  const [creandoTarjeta, setCreandoTarjeta] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleEliminarLista = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la lista "${lista.nombre}"?`)) {
      try {
        await onEliminarLista(lista.id);
      } catch (error) {
        alert('Error al eliminar la lista');
      }
    }
  };

  const handleCrearTarjeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloNuevaTarjeta.trim()) return;

    try {
      setCreandoTarjeta(true);
      await onCrearTarjeta({
        listaId: lista.id,
        titulo: tituloNuevaTarjeta.trim(),
        descripcion: descripcionNuevaTarjeta.trim() || undefined,
        prioridad: prioridadNuevaTarjeta,
        fechaInicio: fechaInicioNuevaTarjeta ? new Date(fechaInicioNuevaTarjeta) : undefined,
        fechaVencimiento: fechaVencimientoNuevaTarjeta ? new Date(fechaVencimientoNuevaTarjeta) : undefined,
        creadoPorId: usuarioActual.id
      });
      setTituloNuevaTarjeta('');
      setDescripcionNuevaTarjeta('');
      setPrioridadNuevaTarjeta('media');
      setFechaInicioNuevaTarjeta('');
      setFechaVencimientoNuevaTarjeta('');
      setMostrandoFormTarjeta(false);
    } catch (error) {
      alert('Error al crear la tarjeta');
    } finally {
      setCreandoTarjeta(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, tarjetaId: string) => {
    setDraggedCardId(tarjetaId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tarjetaId);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const tarjetaId = e.dataTransfer.getData('text/plain');
    if (!tarjetaId || tarjetaId === draggedCardId) return;

    const maxOrden = lista.tarjetas?.reduce((max, t) => Math.max(max, t.orden), -1) ?? -1;

    try {
      await onMoverTarjeta(tarjetaId, lista.id, maxOrden + 1);
    } catch (error) {
      alert('Error al mover la tarjeta');
    }
  };

  const handleDropOnCard = async (e: React.DragEvent, tarjetaObjetivoId: string, ordenObjetivo: number) => {
    e.preventDefault();
    e.stopPropagation();

    const tarjetaId = e.dataTransfer.getData('text/plain');
    if (!tarjetaId || tarjetaId === tarjetaObjetivoId) return;

    try {
      await onMoverTarjeta(tarjetaId, lista.id, ordenObjetivo);
    } catch (error) {
      alert('Error al mover la tarjeta');
    }
  };

  const tarjetasCompletadas = lista.tarjetas?.filter(t => t.estado === 'completado').length || 0;
  const totalTarjetas = lista.tarjetas?.length || 0;

  return (
    <div
      className={`w-80 bg-gray-50 rounded-lg p-3 flex flex-col max-h-full flex-shrink-0 transition-all ${
        isDragOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{lista.nombre}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {tarjetasCompletadas}/{totalTarjetas}
          </span>
          {onEditarLista && (
            <button
              onClick={() => onEditarLista(lista)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Editar lista"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {usuarioActual.rol === 'administrador' && (
            <button
              onClick={handleEliminarLista}
              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Eliminar lista"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {lista.tarjetas?.map(tarjeta => (
          <TarjetaCard
            key={tarjeta.id}
            tarjeta={tarjeta}
            usuarioActual={usuarioActual}
            onActualizar={onActualizarTarjeta}
            onEliminar={onEliminarTarjeta}
            onAgregarComentario={onAgregarComentario}
            onSubirAdjunto={onSubirAdjunto}
            onRegistrarActividad={onRegistrarActividad}
            onAgregarEtiqueta={onAgregarEtiqueta}
            onQuitarEtiqueta={onQuitarEtiqueta}
            onAgregarAsignado={onAgregarAsignado}
            onQuitarAsignado={onQuitarAsignado}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDropOnCard={handleDropOnCard}
            isDragging={draggedCardId === tarjeta.id}
            tableroId={tableroId}
          />
        ))}
      </div>

      {mostrandoFormTarjeta ? (
        <form onSubmit={handleCrearTarjeta} className="space-y-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={tituloNuevaTarjeta}
              onChange={(e) => setTituloNuevaTarjeta(e.target.value)}
              placeholder="Título de la tarjeta"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={creandoTarjeta}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcionNuevaTarjeta}
              onChange={(e) => setDescripcionNuevaTarjeta(e.target.value)}
              placeholder="Añade una descripción..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={creandoTarjeta}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              value={prioridadNuevaTarjeta}
              onChange={(e) => setPrioridadNuevaTarjeta(e.target.value as 'baja' | 'media' | 'alta' | 'critica')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={creandoTarjeta}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Inicio (opcional)
              </label>
              <input
                type="datetime-local"
                value={fechaInicioNuevaTarjeta}
                onChange={(e) => setFechaInicioNuevaTarjeta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={creandoTarjeta}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fin (opcional)
              </label>
              <input
                type="datetime-local"
                value={fechaVencimientoNuevaTarjeta}
                onChange={(e) => setFechaVencimientoNuevaTarjeta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={creandoTarjeta}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={creandoTarjeta || !tituloNuevaTarjeta.trim()}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {creandoTarjeta ? 'Creando...' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMostrandoFormTarjeta(false);
                setTituloNuevaTarjeta('');
                setDescripcionNuevaTarjeta('');
                setPrioridadNuevaTarjeta('media');
                setFechaInicioNuevaTarjeta('');
                setFechaVencimientoNuevaTarjeta('');
              }}
              className="px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              disabled={creandoTarjeta}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setMostrandoFormTarjeta(true)}
          className="w-full p-2 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Tarea
        </button>
      )}
    </div>
  );
};
