import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calendar, User, Clock } from 'lucide-react';
import { Tablero, Usuario, Tarjeta } from '../types';
import { TarjetaDetallesModal } from './TarjetaDetallesModal';

interface GanttViewProps {
  tablero: Tablero;
  usuarioActual: Usuario;
  onActualizarTarjeta: (tarjetaId: string, cambios: any) => Promise<void>;
  onEliminarTarjeta: (tarjetaId: string) => Promise<void>;
  onAgregarComentario: (tarjetaId: string, texto: string) => Promise<void>;
  onRegistrarActividad: (tarjetaId: string, tipo: string, descripcion: string, metadata?: any) => Promise<void>;
  onSubirAdjunto: (tarjetaId: string, archivo: File) => Promise<void>;
}

type VistaAgrupacion = 'lista' | 'usuario' | 'prioridad';

interface TarjetaConFechas extends Tarjeta {
  fechaInicio: Date;
  fechaFin: Date;
}

export const GanttView = ({
  tablero,
  usuarioActual,
  onActualizarTarjeta,
  onEliminarTarjeta,
  onAgregarComentario,
  onRegistrarActividad,
  onSubirAdjunto
}: GanttViewProps) => {
  const [vistaAgrupacion, setVistaAgrupacion] = useState<VistaAgrupacion>('lista');
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set());
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<Tarjeta | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Calcular rango de fechas del timeline
  const rangoFechas = useMemo(() => {
    const todasTarjetas = tablero.listas?.flatMap(lista => lista.tarjetas || []) || [];
    const tarjetasConFechas = todasTarjetas.filter(t => t.fechaCreacion || t.fechaVencimiento);

    if (tarjetasConFechas.length === 0) {
      const hoy = new Date();
      const en30Dias = new Date(hoy);
      en30Dias.setDate(en30Dias.getDate() + 30);
      return { inicio: hoy, fin: en30Dias };
    }

    const fechas = tarjetasConFechas.flatMap(t => [
      t.fechaCreacion ? new Date(t.fechaCreacion) : null,
      t.fechaVencimiento ? new Date(t.fechaVencimiento) : null
    ].filter(Boolean) as Date[]);

    const fechaMin = new Date(Math.min(...fechas.map(f => f.getTime())));
    const fechaMax = new Date(Math.max(...fechas.map(f => f.getTime())));

    // Agregar margen
    fechaMin.setDate(fechaMin.getDate() - 3);
    fechaMax.setDate(fechaMax.getDate() + 3);

    return { inicio: fechaMin, fin: fechaMax };
  }, [tablero]);

  // Preparar tarjetas con fechas válidas
  const tarjetasConFechasValidas = useMemo(() => {
    const todasTarjetas = tablero.listas?.flatMap(lista => lista.tarjetas || []) || [];
    return todasTarjetas
      .filter(t => t.fechaCreacion || t.fechaVencimiento || t.fechaInicio)
      .map(tarjeta => {
        const fechaInicio = tarjeta.fechaInicio
          ? new Date(tarjeta.fechaInicio)
          : tarjeta.fechaCreacion
          ? new Date(tarjeta.fechaCreacion)
          : tarjeta.fechaVencimiento
          ? new Date(tarjeta.fechaVencimiento)
          : new Date();

        let fechaFin: Date;
        if (tarjeta.fechaVencimiento) {
          fechaFin = new Date(tarjeta.fechaVencimiento);
        } else if (tarjeta.duracion) {
          fechaFin = new Date(fechaInicio.getTime() + tarjeta.duracion * 24 * 60 * 60 * 1000);
        } else {
          fechaFin = new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000);
        }

        return {
          ...tarjeta,
          fechaInicio,
          fechaFin
        } as TarjetaConFechas;
      });
  }, [tablero]);

  // Agrupar tarjetas según vista
  const tarjetasAgrupadas = useMemo(() => {
    const grupos: { [key: string]: { nombre: string; tarjetas: TarjetaConFechas[] } } = {};

    if (vistaAgrupacion === 'lista') {
      tablero.listas?.forEach(lista => {
        const tarjetasLista = tarjetasConFechasValidas.filter(t => t.listaId === lista.id);
        if (tarjetasLista.length > 0) {
          grupos[lista.id] = { nombre: lista.nombre, tarjetas: tarjetasLista };
        }
      });
    } else if (vistaAgrupacion === 'usuario') {
      const tarjetasSinAsignar: TarjetaConFechas[] = [];

      tarjetasConFechasValidas.forEach(tarjeta => {
        if (!tarjeta.asignados || tarjeta.asignados.length === 0) {
          tarjetasSinAsignar.push(tarjeta);
        } else {
          tarjeta.asignados.forEach(usuario => {
            const key = usuario.id;
            if (!grupos[key]) {
              grupos[key] = {
                nombre: `${usuario.nombre} ${usuario.apellido}`,
                tarjetas: []
              };
            }
            grupos[key].tarjetas.push(tarjeta);
          });
        }
      });

      if (tarjetasSinAsignar.length > 0) {
        grupos['sin-asignar'] = { nombre: 'Sin asignar', tarjetas: tarjetasSinAsignar };
      }
    } else if (vistaAgrupacion === 'prioridad') {
      const prioridades = ['critica', 'alta', 'media', 'baja'];
      prioridades.forEach(prioridad => {
        const tarjetasPrioridad = tarjetasConFechasValidas.filter(t => t.prioridad === prioridad);
        if (tarjetasPrioridad.length > 0) {
          grupos[prioridad] = {
            nombre: prioridad === 'critica' ? 'Crítica' : prioridad.charAt(0).toUpperCase() + prioridad.slice(1),
            tarjetas: tarjetasPrioridad
          };
        }
      });
    }

    return grupos;
  }, [tarjetasConFechasValidas, vistaAgrupacion, tablero.listas]);

  const toggleGrupo = (grupoId: string) => {
    const nuevosExpandidos = new Set(gruposExpandidos);
    if (nuevosExpandidos.has(grupoId)) {
      nuevosExpandidos.delete(grupoId);
    } else {
      nuevosExpandidos.add(grupoId);
    }
    setGruposExpandidos(nuevosExpandidos);
  };

  // Calcular posición de una tarjeta en el timeline
  const calcularPosicion = (fechaInicio: Date, fechaFin: Date) => {
    const totalDias = Math.ceil((rangoFechas.fin.getTime() - rangoFechas.inicio.getTime()) / (1000 * 60 * 60 * 24));
    const diasDesdeInicio = Math.ceil((fechaInicio.getTime() - rangoFechas.inicio.getTime()) / (1000 * 60 * 60 * 24));
    const duracionDias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    const left = (diasDesdeInicio / totalDias) * 100;
    const width = (duracionDias / totalDias) * 100;

    return { left: Math.max(0, left), width: Math.max(1, width) };
  };

  // Generar columnas de fechas para el header
  const generarColumnasFechas = () => {
    const columnas: Date[] = [];
    const fecha = new Date(rangoFechas.inicio);

    while (fecha <= rangoFechas.fin) {
      columnas.push(new Date(fecha));
      fecha.setDate(fecha.getDate() + 1);
    }

    return columnas;
  };

  const columnasFechas = generarColumnasFechas();

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPrioridadBorderColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'border-red-600';
      case 'alta': return 'border-orange-600';
      case 'media': return 'border-yellow-600';
      case 'baja': return 'border-green-600';
      default: return 'border-gray-600';
    }
  };

  const estaVencida = (tarjeta: TarjetaConFechas) => {
    return tarjeta.fechaFin < new Date() && tarjeta.estado !== 'completado';
  };

  if (tarjetasConFechasValidas.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay tareas con fechas
          </h3>
          <p className="text-gray-500">
            Las tareas necesitan tener fecha de creación o vencimiento para aparecer en la vista Gantt
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Controles */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Vista Gantt</span>
            <span className="text-sm text-gray-500">
              ({tarjetasConFechasValidas.length} tareas)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Agrupar por:</label>
            <select
              value={vistaAgrupacion}
              onChange={(e) => setVistaAgrupacion(e.target.value as VistaAgrupacion)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lista">Lista</option>
              <option value="usuario">Usuario</option>
              <option value="prioridad">Prioridad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Header con fechas */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-300">
            <div className="flex">
              {/* Columna de grupos */}
              <div className="w-64 border-r border-gray-300 bg-gray-50 p-3 font-semibold text-gray-700 flex items-center">
                {vistaAgrupacion === 'lista' && 'Lista / Tarea'}
                {vistaAgrupacion === 'usuario' && 'Usuario / Tarea'}
                {vistaAgrupacion === 'prioridad' && 'Prioridad / Tarea'}
              </div>

              {/* Columnas de fechas */}
              <div className="flex-1 relative" style={{ minWidth: `${columnasFechas.length * 60}px` }}>
                <div className="flex border-b border-gray-200">
                  {columnasFechas.map((fecha, idx) => {
                    const esHoy = fecha.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={idx}
                        className={`flex-shrink-0 p-2 text-center border-r border-gray-200 ${
                          esHoy ? 'bg-blue-50' : ''
                        }`}
                        style={{ width: '60px' }}
                      >
                        <div className={`text-xs font-medium ${esHoy ? 'text-blue-600' : 'text-gray-700'}`}>
                          {fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className={`text-xs ${esHoy ? 'text-blue-500' : 'text-gray-500'}`}>
                          {fecha.toLocaleDateString('es-ES', { weekday: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Línea de hoy */}
                {(() => {
                  const hoy = new Date();
                  if (hoy >= rangoFechas.inicio && hoy <= rangoFechas.fin) {
                    const { left } = calcularPosicion(hoy, hoy);
                    return (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
                        style={{ left: `${left}%` }}
                      />
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Filas de tareas agrupadas */}
          <div>
            {Object.entries(tarjetasAgrupadas).map(([grupoId, grupo]) => {
              const expandido = gruposExpandidos.has(grupoId);
              return (
                <div key={grupoId} className="border-b border-gray-200">
                  {/* Header del grupo */}
                  <div className="flex hover:bg-gray-50">
                    <div className="w-64 border-r border-gray-300 p-3 flex items-center gap-2">
                      <button
                        onClick={() => toggleGrupo(grupoId)}
                        className="hover:bg-gray-200 rounded p-1"
                      >
                        {expandido ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <span className="font-medium text-gray-900">{grupo.nombre}</span>
                      <span className="text-xs text-gray-500">({grupo.tarjetas.length})</span>
                    </div>

                    <div className="flex-1 relative bg-gray-50" style={{ minWidth: `${columnasFechas.length * 60}px` }}>
                      {/* Grid de fondo */}
                      <div className="absolute inset-0 flex">
                        {columnasFechas.map((_, idx) => (
                          <div key={idx} className="flex-shrink-0 border-r border-gray-200" style={{ width: '60px' }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tarjetas del grupo */}
                  {expandido && grupo.tarjetas.map((tarjeta, idx) => {
                    const { left, width } = calcularPosicion(tarjeta.fechaInicio, tarjeta.fechaFin);
                    const vencida = estaVencida(tarjeta);

                    return (
                      <div key={tarjeta.id} className="flex hover:bg-gray-50">
                        <div className="w-64 border-r border-gray-300 p-3 pl-12">
                          <div className="text-sm text-gray-900 truncate" title={tarjeta.titulo}>
                            {tarjeta.titulo}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block w-2 h-2 rounded-full ${getPrioridadColor(tarjeta.prioridad)}`} />
                            {tarjeta.asignados && tarjeta.asignados.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                {tarjeta.asignados.length}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 relative p-2" style={{ minWidth: `${columnasFechas.length * 60}px` }}>
                          {/* Grid de fondo */}
                          <div className="absolute inset-0 flex">
                            {columnasFechas.map((_, idx) => (
                              <div key={idx} className="flex-shrink-0 border-r border-gray-100" style={{ width: '60px' }} />
                            ))}
                          </div>

                          {/* Barra de la tarjeta */}
                          <div
                            className={`absolute h-8 rounded-md shadow-sm cursor-pointer transition-all hover:shadow-md border-2 ${
                              vencida ? 'bg-red-100 border-red-500' : `${getPrioridadColor(tarjeta.prioridad)} bg-opacity-70 ${getPrioridadBorderColor(tarjeta.prioridad)}`
                            }`}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              top: '4px'
                            }}
                            onClick={() => setTarjetaSeleccionada(tarjeta)}
                            title={`${tarjeta.titulo} (${tarjeta.fechaInicio.toLocaleDateString()} - ${tarjeta.fechaFin.toLocaleDateString()})`}
                          >
                            <div className="px-2 py-1 text-xs font-medium text-white truncate">
                              {tarjeta.titulo}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Rango: {rangoFechas.inicio.toLocaleDateString()} - {rangoFechas.fin.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Crítica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span>Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Baja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-50" />
            <span>Hoy</span>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {tarjetaSeleccionada && (
        <TarjetaDetallesModal
          tarjeta={tarjetaSeleccionada}
          usuarioActual={usuarioActual}
          tablero={tablero}
          modoEdicion={modoEdicion}
          onCerrar={() => setTarjetaSeleccionada(null)}
          onActualizar={onActualizarTarjeta}
          onEliminar={onEliminarTarjeta}
          onAgregarComentario={onAgregarComentario}
          onRegistrarActividad={onRegistrarActividad}
          onSubirAdjunto={onSubirAdjunto}
          onModoEdicionCambio={setModoEdicion}
        />
      )}
    </div>
  );
};
