import { useState } from 'react';
import { Calendar, User, AlertCircle, Clock, Trash2, CheckSquare, Tag, CreditCard as Edit3, Users } from 'lucide-react';
import { Tarjeta, Usuario as UsuarioType } from '../types';
import { TarjetaEditModal } from './TarjetaEditModal';
import { TarjetaDetallesModal } from './TarjetaDetallesModal';
import { TarjetaComentariosActividad } from './TarjetaComentariosActividad';

interface TarjetaCardProps {
  tarjeta: Tarjeta;
  usuarioActual: UsuarioType;
  onActualizar: (tarjetaId: string, datos: any) => Promise<void>;
  onEliminar: (tarjetaId: string) => Promise<void>;
  onAgregarComentario?: (tarjetaId: string, texto: string) => Promise<void>;
  onSubirAdjunto?: (tarjetaId: string, archivo: File) => Promise<void>;
  onRegistrarActividad?: (tarjetaId: string, usuarioId: string, tipo: string, descripcion: string, metadata?: Record<string, any>) => Promise<void>;
  onAgregarEtiqueta?: (tarjetaId: string, etiquetaId: string) => Promise<void>;
  onQuitarEtiqueta?: (tarjetaId: string, etiquetaId: string) => Promise<void>;
  onAgregarAsignado?: (tarjetaId: string, usuarioId: string) => Promise<void>;
  onQuitarAsignado?: (tarjetaId: string, usuarioId: string) => Promise<void>;
  onDragStart?: (e: React.DragEvent, tarjetaId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDropOnCard?: (e: React.DragEvent, tarjetaId: string, orden: number) => void;
  isDragging?: boolean;
  tableroId: string;
}

export const TarjetaCard = ({
  tarjeta,
  usuarioActual,
  onActualizar,
  onEliminar,
  onAgregarComentario,
  onSubirAdjunto,
  onRegistrarActividad,
  onAgregarEtiqueta,
  onQuitarEtiqueta,
  onAgregarAsignado,
  onQuitarAsignado,
  onDragStart,
  onDragEnd,
  onDropOnCard,
  isDragging,
  tableroId
}: TarjetaCardProps) => {
  const [mostrandoDetalles, setMostrandoDetalles] = useState(false);
  const [mostrandoEdicion, setMostrandoEdicion] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'border-l-red-500';
      case 'alta': return 'border-l-orange-500';
      case 'media': return 'border-l-yellow-500';
      case 'baja': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getPrioridadLabel = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'Crítica';
      case 'alta': return 'Alta';
      case 'media': return 'Media';
      case 'baja': return 'Baja';
      default: return prioridad;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { label: 'Pendiente', color: 'bg-gray-100 text-gray-700', icon: Clock };
      case 'en_progreso':
        return { label: 'En Progreso', color: 'bg-blue-100 text-blue-700', icon: AlertCircle };
      case 'en_revision':
        return { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'completado':
        return { label: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckSquare };
      case 'bloqueado':
        return { label: 'Bloqueado', color: 'bg-red-100 text-red-700', icon: AlertCircle };
      default:
        return { label: 'Pendiente', color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  const estaVencida = tarjeta.fechaVencimiento && new Date(tarjeta.fechaVencimiento) < new Date();
  const checklistCompletados = tarjeta.checklist?.filter(c => c.completado).length || 0;
  const checklistTotal = tarjeta.checklist?.length || 0;
  const tieneChecklist = checklistTotal > 0;

  const handleEliminar = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) {
      try {
        await onEliminar(tarjeta.id);
      } catch (error) {
        alert('Error al eliminar la tarjeta');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (onDropOnCard) {
      onDropOnCard(e, tarjeta.id, tarjeta.orden);
    }
  };

  return (
    <>
      <div
        draggable={!mostrandoDetalles && !mostrandoEdicion}
        onDragStart={(e) => onDragStart && onDragStart(e, tarjeta.id)}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white rounded-lg p-3 shadow-sm border-l-4 ${getPrioridadColor(tarjeta.prioridad)} hover:shadow-md transition-all cursor-pointer group ${
          isDragging ? 'opacity-50' : ''
        } ${isDragOver ? 'ring-2 ring-blue-400 scale-105' : ''}`}
        onClick={(e) => {
          if (!mostrandoEdicion) {
            setMostrandoDetalles(true);
          }
        }}
      >
        {tarjeta.etiquetas && tarjeta.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tarjeta.etiquetas.slice(0, 3).map(etiqueta => (
              <span
                key={etiqueta.id}
                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: etiqueta.color }}
                title={etiqueta.nombre}
              >
                {etiqueta.nombre}
              </span>
            ))}
            {tarjeta.etiquetas.length > 3 && (
              <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600">
                +{tarjeta.etiquetas.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mb-2">
          <h4 className="font-medium text-gray-900 text-sm break-words">{tarjeta.titulo}</h4>
        </div>

        {tarjeta.estado && (
          <div className="mb-2">
            {(() => {
              const estadoBadge = getEstadoBadge(tarjeta.estado);
              const Icon = estadoBadge.icon;
              return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${estadoBadge.color}`}>
                  <Icon className="w-3 h-3" />
                  {estadoBadge.label}
                </span>
              );
            })()}
          </div>
        )}

        {tarjeta.descripcion && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {tarjeta.descripcion}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {tarjeta.fechaInicio && (
            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
              <Clock className="w-3 h-3" />
              {new Date(tarjeta.fechaInicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
            </div>
          )}

          {tarjeta.fechaVencimiento && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${
              estaVencida ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <Calendar className="w-3 h-3" />
              {new Date(tarjeta.fechaVencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
            </div>
          )}

          {tieneChecklist && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${
              checklistCompletados === checklistTotal ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <CheckSquare className="w-3 h-3" />
              {checklistCompletados}/{checklistTotal}
            </div>
          )}

          {tarjeta.asignados && tarjeta.asignados.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {tarjeta.asignados.length === 1 ? (
                <>
                  <User className="w-3 h-3" />
                  {tarjeta.asignados[0].nombre}
                </>
              ) : (
                <>
                  <Users className="w-3 h-3" />
                  {tarjeta.asignados.length}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {mostrandoDetalles && (
        <TarjetaDetallesModal
          tarjeta={tarjeta}
          usuarioActual={usuarioActual}
          onCerrar={() => setMostrandoDetalles(false)}
          onActualizar={onActualizar}
          onEliminar={onEliminar}
          onAgregarComentario={onAgregarComentario}
          onSubirAdjunto={onSubirAdjunto}
          onRegistrarActividad={onRegistrarActividad}
          onAgregarEtiqueta={onAgregarEtiqueta}
          onQuitarEtiqueta={onQuitarEtiqueta}
          onAgregarAsignado={onAgregarAsignado}
          onQuitarAsignado={onQuitarAsignado}
          tableroId={tableroId}
        />
      )}

      {mostrandoEdicion && (
        <TarjetaEditModal
          tarjeta={tarjeta}
          usuarioActual={usuarioActual}
          onCerrar={() => setMostrandoEdicion(false)}
          onActualizar={onActualizar}
        />
      )}
    </>
  );
};
