import { useMemo } from 'react';
import { Clock, AlertCircle, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Tablero, Usuario, EstadoTarjeta } from '../types';
import { TarjetaCard } from './TarjetaCard';

interface EstadosViewProps {
  tablero: Tablero;
  usuarioActual: Usuario;
  onMoverTarjeta: (tarjetaId: string, nuevaListaId: string, nuevoOrden: number) => Promise<void>;
  onActualizarTarjeta: (tarjetaId: string, datos: any) => Promise<void>;
  onEliminarTarjeta: (tarjetaId: string) => Promise<void>;
  onAgregarComentario?: (tarjetaId: string, texto: string) => Promise<void>;
  onSubirAdjunto?: (tarjetaId: string, archivo: File) => Promise<void>;
  onRegistrarActividad?: (tarjetaId: string, usuarioId: string, tipo: string, descripcion: string, metadata?: Record<string, any>) => Promise<void>;
}

interface ColumnaEstado {
  estado: EstadoTarjeta;
  label: string;
  color: string;
  bgColor: string;
  icon: any;
}

export const EstadosView = ({
  tablero,
  usuarioActual,
  onMoverTarjeta,
  onActualizarTarjeta,
  onEliminarTarjeta,
  onAgregarComentario,
  onSubirAdjunto,
  onRegistrarActividad
}: EstadosViewProps) => {
  const columnasEstados: ColumnaEstado[] = [
    {
      estado: 'pendiente',
      label: 'Pendiente',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      icon: Clock
    },
    {
      estado: 'en_progreso',
      label: 'En Progreso',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      icon: AlertCircle
    },
    {
      estado: 'en_revision',
      label: 'En Revisión',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: Eye
    },
    {
      estado: 'completado',
      label: 'Completado',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: CheckCircle
    },
    {
      estado: 'bloqueado',
      label: 'Bloqueado',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: XCircle
    }
  ];

  const tarjetasPorEstado = useMemo(() => {
    const todasLasTarjetas = tablero.listas?.flatMap(lista => lista.tarjetas || []) || [];

    return columnasEstados.reduce((acc, columna) => {
      acc[columna.estado] = todasLasTarjetas
        .filter(tarjeta => (tarjeta.estado || 'pendiente') === columna.estado)
        .sort((a, b) => a.orden - b.orden);
      return acc;
    }, {} as Record<EstadoTarjeta, any[]>);
  }, [tablero]);

  const handleCambiarEstado = async (tarjetaId: string, nuevoEstado: EstadoTarjeta) => {
    try {
      await onActualizarTarjeta(tarjetaId, { estado: nuevoEstado });

      if (onRegistrarActividad) {
        const columna = columnasEstados.find(c => c.estado === nuevoEstado);
        await onRegistrarActividad(
          tarjetaId,
          usuarioActual.id,
          'cambio_estado',
          `Estado cambiado a: ${columna?.label}`,
          { nuevoEstado }
        );
      }
    } catch (error) {
      // Error al cambiar estado
    }
  };

  const handleDragStart = (e: React.DragEvent, tarjetaId: string) => {
    e.dataTransfer.setData('tarjetaId', tarjetaId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, nuevoEstado: EstadoTarjeta) => {
    e.preventDefault();
    const tarjetaId = e.dataTransfer.getData('tarjetaId');
    if (tarjetaId) {
      await handleCambiarEstado(tarjetaId, nuevoEstado);
    }
  };

  return (
    <div className="flex-1 overflow-x-auto pb-4">
      <div className="flex gap-4 h-full min-w-max">
        {columnasEstados.map(columna => {
          const tarjetas = tarjetasPorEstado[columna.estado] || [];
          const IconoEstado = columna.icon;

          return (
            <div
              key={columna.estado}
              className="w-80 flex-shrink-0 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columna.estado)}
            >
              <div className={`${columna.bgColor} rounded-lg p-3 mb-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <IconoEstado className={`w-5 h-5 ${columna.color}`} />
                  <h3 className={`font-semibold ${columna.color}`}>{columna.label}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium ${columna.bgColor} ${columna.color} rounded-full`}>
                    {tarjetas.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {tarjetas.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">No hay tareas</p>
                  </div>
                ) : (
                  tarjetas.map(tarjeta => (
                    <div
                      key={tarjeta.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tarjeta.id)}
                    >
                      <TarjetaCard
                        tarjeta={tarjeta}
                        usuarioActual={usuarioActual}
                        onActualizar={onActualizarTarjeta}
                        onEliminar={onEliminarTarjeta}
                        onAgregarComentario={onAgregarComentario}
                        onSubirAdjunto={onSubirAdjunto}
                        onRegistrarActividad={onRegistrarActividad}
                        tableroId={tablero.id}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
