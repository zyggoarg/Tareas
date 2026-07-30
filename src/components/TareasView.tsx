import { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutGrid, Archive, Trash2, Filter, X, Search, Pencil as Edit } from 'lucide-react';
import { useTableros } from '../hooks/useTableros';
import { Usuario, EstadoTarjeta, PrioridadTarjeta } from '../types';
import { TableroBoard } from './TableroBoard';
import { NuevoTableroModal } from './NuevoTableroModal';

interface TareasViewProps {
  usuarioActual: Usuario;
  proyectoActivoId: string | null;
  filtroEstadisticasInicial?: string | null;
  tableroIdInicial?: string | null;
  onLimpiarFiltroEstadisticas?: () => void;
  onEditarLista?: (lista: any) => void;
  onEditarTablero?: (tablero: any) => void;
}

export const TareasView = ({
  usuarioActual,
  proyectoActivoId,
  filtroEstadisticasInicial,
  tableroIdInicial,
  onLimpiarFiltroEstadisticas,
  onEditarLista,
  onEditarTablero
}: TareasViewProps) => {
  const {
    tableros,
    tableroActivo,
    cargando,
    cargarTableroCompleto,
    setTableroActivo,
    crearTablero,
    crearLista,
    crearTarjeta,
    moverTarjeta,
    actualizarTarjeta,
    eliminarTarjeta,
    eliminarLista,
    eliminarTablero,
    agregarComentario,
    registrarActividad,
    subirAdjunto,
    agregarEtiquetaATarjeta,
    eliminarEtiquetaDeTarjeta,
    agregarAsignado,
    eliminarAsignado
  } = useTableros(proyectoActivoId, usuarioActual);

  const [mostrarModalNuevoTablero, setMostrarModalNuevoTablero] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null);
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadTarjeta | 'todas'>('todas');
  const [filtroEstado, setFiltroEstado] = useState<EstadoTarjeta | 'todos'>('todos');
  const [filtroAsignado, setFiltroAsignado] = useState<string | 'todos'>('todos');
  const [filtroChecklist, setFiltroChecklist] = useState<'todos' | 'con_checklist' | 'sin_checklist' | 'checklist_pendiente'>('todos');
  const [filtroVencimiento, setFiltroVencimiento] = useState<'todos' | 'vencidas' | 'proximas' | 'sin_fecha'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    if (tableroIdInicial) {
      cargarTableroCompleto(tableroIdInicial);
    }
  }, [tableroIdInicial, cargarTableroCompleto]);

  useEffect(() => {
    if (filtroEstadisticasInicial) {
      setFiltroActivo(filtroEstadisticasInicial);

      if (filtroEstadisticasInicial === 'criticas') {
        setFiltroPrioridad('critica');
      } else {
        setFiltroPrioridad('todas');
      }
    }
  }, [filtroEstadisticasInicial]);

  const handleEliminarTablero = async (e: React.MouseEvent, tableroId: string, tableroNombre: string) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que deseas eliminar el tablero "${tableroNombre}"?`)) {
      try {
        await eliminarTablero(tableroId);
      } catch (error) {
        alert('Error al eliminar el tablero');
      }
    }
  };

  const limpiarFiltros = () => {
    setFiltroActivo(null);
    setFiltroPrioridad('todas');
    setFiltroEstado('todos');
    setFiltroAsignado('todos');
    setFiltroChecklist('todos');
    setFiltroVencimiento('todos');
    setBusqueda('');
    onLimpiarFiltroEstadisticas?.();
  };

  const usuariosDisponibles = useMemo(() => {
    const usuariosMap = new Map<string, Usuario>();

    const tablerosAConsiderar = tableroActivo ? [tableroActivo] : tableros;

    tablerosAConsiderar.forEach(tablero => {
      tablero.listas?.forEach(lista => {
        lista.tarjetas?.forEach(tarjeta => {
          tarjeta.asignados?.forEach(usuario => {
            usuariosMap.set(usuario.id, usuario);
          });
        });
      });
    });
    return Array.from(usuariosMap.values()).sort((a, b) =>
      `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`)
    );
  }, [tableros, tableroActivo]);

  const filtrarTarjetas = (tarjetas: any[]) => {
    return tarjetas.filter(tarjeta => {
      // Filtro por búsqueda
      if (busqueda && !tarjeta.titulo.toLowerCase().includes(busqueda.toLowerCase()) &&
          !tarjeta.descripcion?.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }

      // Filtro desde dashboard (filtroActivo)
      if (filtroActivo) {
        switch (filtroActivo) {
          case 'todas':
            break;
          case 'asignadas':
            if (!tarjeta.asignados?.some((u: any) => u.id === usuarioActual.id)) return false;
            break;
          case 'vencidas':
            if (!tarjeta.fechaVencimiento || new Date(tarjeta.fechaVencimiento) >= new Date()) return false;
            break;
          case 'criticas':
            if (tarjeta.prioridad !== 'critica') return false;
            break;
          case 'checklist-pendientes':
            if (!tarjeta.checklist?.some((c: any) => !c.completado)) return false;
            break;
        }
      }

      // Filtro manual por prioridad
      if (filtroPrioridad !== 'todas' && tarjeta.prioridad !== filtroPrioridad) {
        return false;
      }

      // Filtro manual por estado
      if (filtroEstado !== 'todos' && tarjeta.estado !== filtroEstado) {
        return false;
      }

      // Filtro manual por asignado
      if (filtroAsignado !== 'todos') {
        if (!tarjeta.asignados?.some((u: any) => u.id === filtroAsignado)) {
          return false;
        }
      }

      // Filtro manual por checklist
      if (filtroChecklist !== 'todos') {
        const tieneChecklist = tarjeta.checklist && tarjeta.checklist.length > 0;
        const tienePendientes = tarjeta.checklist?.some((c: any) => !c.completado);

        switch (filtroChecklist) {
          case 'con_checklist':
            if (!tieneChecklist) return false;
            break;
          case 'sin_checklist':
            if (tieneChecklist) return false;
            break;
          case 'checklist_pendiente':
            if (!tienePendientes) return false;
            break;
        }
      }

      // Filtro manual por vencimiento
      if (filtroVencimiento !== 'todos') {
        const ahora = new Date();
        const tresDias = new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000);

        switch (filtroVencimiento) {
          case 'vencidas':
            if (!tarjeta.fechaVencimiento || new Date(tarjeta.fechaVencimiento) >= ahora) return false;
            break;
          case 'proximas':
            if (!tarjeta.fechaVencimiento || new Date(tarjeta.fechaVencimiento) < ahora || new Date(tarjeta.fechaVencimiento) > tresDias) return false;
            break;
          case 'sin_fecha':
            if (tarjeta.fechaVencimiento) return false;
            break;
        }
      }

      return true;
    });
  };

  if (!proyectoActivoId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <LayoutGrid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Selecciona un proyecto
          </h3>
          <p className="text-gray-500">
            Selecciona un proyecto para ver y gestionar sus tableros de tareas
          </p>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando tableros...</p>
        </div>
      </div>
    );
  }

  const tableroConFiltros = tableroActivo
    ? {
        ...tableroActivo,
        listas: tableroActivo.listas?.map(lista => ({
          ...lista,
          tarjetas: filtrarTarjetas(lista.tarjetas || [])
        }))
      }
    : null;

  const getNombreFiltro = () => {
    switch (filtroActivo) {
      case 'todas': return 'Todas las tareas';
      case 'asignadas': return 'Asignadas a mí';
      case 'vencidas': return 'Tareas vencidas';
      case 'criticas': return 'Tareas críticas';
      case 'checklist-pendientes': return 'Con checklist pendientes';
      default: return '';
    }
  };

  const hayFiltrosActivos = filtroActivo || filtroPrioridad !== 'todas' || filtroEstado !== 'todos' ||
    filtroAsignado !== 'todos' || filtroChecklist !== 'todos' || filtroVencimiento !== 'todos' || busqueda;

  return (
    <div className="h-full flex flex-col">
      {filtroActivo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Filtro del dashboard: {getNombreFiltro()}
            </span>
          </div>
          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      )}

      {/* Barra de filtros manuales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Filtros avanzados</span>
              {hayFiltrosActivos && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  Activos
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hayFiltrosActivos && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    limpiarFiltros();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 px-2"
                >
                  Limpiar todo
                </button>
              )}
              <span className="text-gray-400">{mostrarFiltros ? '▲' : '▼'}</span>
            </div>
          </button>
        </div>

        {mostrarFiltros && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por título o descripción..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtro por Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="en_revision">En Revisión</option>
                <option value="completado">Completado</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>

            {/* Filtro por Asignado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignado a
              </label>
              <select
                value={filtroAsignado}
                onChange={(e) => setFiltroAsignado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                {usuariosDisponibles.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Checklist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checklist
              </label>
              <select
                value={filtroChecklist}
                onChange={(e) => setFiltroChecklist(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="con_checklist">Con checklist</option>
                <option value="sin_checklist">Sin checklist</option>
                <option value="checklist_pendiente">Con items pendientes</option>
              </select>
            </div>

            {/* Filtro por Vencimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vencimiento
              </label>
              <select
                value={filtroVencimiento}
                onChange={(e) => setFiltroVencimiento(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="vencidas">Vencidas</option>
                <option value="proximas">Próximas (3 días)</option>
                <option value="sin_fecha">Sin fecha</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {!tableroActivo ? (
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tableros de Tareas</h2>
            <button
              onClick={() => setMostrarModalNuevoTablero(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nuevo </span>Tablero
            </button>
          </div>

          {tableros.length === 0 ? (
            <div className="text-center py-12">
              <LayoutGrid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No hay tableros
              </h3>
              <p className="text-gray-500 mb-4">
                Crea tu primer tablero para organizar tus tareas
              </p>
              <button
                onClick={() => setMostrarModalNuevoTablero(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crear Tablero
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tableros.map(tablero => (
                <div
                  key={tablero.id}
                  onClick={() => {
                    localStorage.setItem(`ultimoTablero_${usuarioActual.id}`, tablero.id);
                    cargarTableroCompleto(tablero.id);
                  }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: tablero.color }}
                    >
                      <LayoutGrid className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {tablero.estado === 'archivado' && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          <Archive className="w-3 h-3 inline mr-1" />
                          Archivado
                        </span>
                      )}
                      {onEditarTablero && (usuarioActual.rol === 'administrador' || tablero.creadoPor.id === usuarioActual.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditarTablero(tablero);
                          }}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="Editar tablero"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {usuarioActual.rol === 'administrador' && (
                        <button
                          onClick={(e) => handleEliminarTablero(e, tablero.id, tablero.nombre)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar tablero"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {tablero.nombre}
                  </h3>
                  {tablero.descripcion && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {tablero.descripcion}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Por {tablero.creadoPor.nombre}</span>
                    <span>{new Date(tablero.fechaCreacion).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tableroConFiltros ? (
        <TableroBoard
          tablero={tableroConFiltros}
          usuarioActual={usuarioActual}
          onVolverATableros={() => setTableroActivo(null)}
          onCrearLista={crearLista}
          onCrearTarjeta={crearTarjeta}
          onMoverTarjeta={moverTarjeta}
          onActualizarTarjeta={actualizarTarjeta}
          onEliminarTarjeta={eliminarTarjeta}
          onEliminarLista={eliminarLista}
          onEditarLista={onEditarLista}
          onAgregarComentario={agregarComentario}
          onRegistrarActividad={registrarActividad}
          onSubirAdjunto={subirAdjunto}
          onAgregarEtiqueta={agregarEtiquetaATarjeta}
          onQuitarEtiqueta={eliminarEtiquetaDeTarjeta}
          onAgregarAsignado={agregarAsignado}
          onQuitarAsignado={eliminarAsignado}
        />
      ) : null}

      {mostrarModalNuevoTablero && (
        <NuevoTableroModal
          usuarioActual={usuarioActual}
          proyectoActivoId={proyectoActivoId}
          onCerrar={() => setMostrarModalNuevoTablero(false)}
          onCrear={crearTablero}
        />
      )}
    </div>
  );
};
