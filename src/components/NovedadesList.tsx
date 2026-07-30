import React, { useState } from 'react';
import { Filter, Search, AlertTriangle } from 'lucide-react';
import { Novedad, EstadoNovedad, PrioridadNovedad, Usuario, Sector } from '../types';
import { NovedadCard } from './NovedadCard';

interface NovedadesListProps {
  novedades: Novedad[];
  sectores: Sector[];
  usuarioActual: Usuario;
  esAdministrador: boolean;
  filtroSectorInicial?: string | null;
  filtroEstadisticasInicial?: string | null;
  onLimpiarFiltroSector: () => void;
  onLimpiarFiltroEstadisticas: () => void;
  onMarcarLeida: (id: string, usuarioId: string) => void;
  onAgregarComentario: (novedadId: string, comentario: { texto: string; autorId: string }, fotos?: File[]) => void;
  onMarcarComentariosLeidos: (novedadId: string, usuarioId: string) => void;
  onEliminarNovedad?: (id: string) => void;
  onArchivarNovedad?: (id: string) => void;
  onDesarchivarNovedad?: (id: string) => void;
}

export const NovedadesList: React.FC<NovedadesListProps> = ({
  novedades,
  sectores,
  usuarioActual,
  esAdministrador,
  filtroSectorInicial,
  filtroEstadisticasInicial,
  onLimpiarFiltroSector,
  onLimpiarFiltroEstadisticas,
  onMarcarLeida,
  onAgregarComentario,
  onMarcarComentariosLeidos,
  onEliminarNovedad,
  onArchivarNovedad,
  onDesarchivarNovedad
}) => {
  const [filtroEstado, setFiltroEstado] = useState<EstadoNovedad | 'todas'>('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadNovedad | 'todas'>('todas');
  const [filtroTurno, setFiltroTurno] = useState<'mañana' | 'noche' | 'todos'>('todos');
  const [filtroSector, setFiltroSector] = useState<string | 'todos'>(filtroSectorInicial || 'todos');
  const [busqueda, setBusqueda] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState<string | 'todos'>('todos');
  const [novedadesLeidasEnSesion, setNovedadesLeidasEnSesion] = useState<Set<string>>(new Set());
  const [comentariosLeidosEnSesion, setComentariosLeidosEnSesion] = useState<Set<string>>(new Set());
  const [novedadesComentadasEnSesion, setNovedadesComentadasEnSesion] = useState<Set<string>>(new Set());
  const [filtroSectorPorTarjeta, setFiltroSectorPorTarjeta] = useState<string | null>(null);

  // Obtener sectores asignados al usuario actual
  const sectoresAsignados = React.useMemo(() => {
    if (!usuarioActual) return [];
    
    // Si es administrador sin sectores específicos, puede ver todos los sectores
    if (usuarioActual.rol === 'administrador' && (!usuarioActual.sectores || usuarioActual.sectores.length === 0)) {
      return sectores;
    }
    
    // Para usuarios normales o administradores con sectores específicos
    return usuarioActual.sectores || [];
  }, [usuarioActual, sectores]);

  // Actualizar filtro cuando cambie el filtro inicial
  React.useEffect(() => {
    if (filtroSectorInicial) {
      setFiltroSector(filtroSectorInicial);
    }
  }, [filtroSectorInicial]);

  // Aplicar filtros de estadísticas
  React.useEffect(() => {
    if (filtroEstadisticasInicial) {
      switch (filtroEstadisticasInicial) {
        case 'todas':
          setFiltroEstado('todas');
          setFiltroPrioridad('todas');
          setFiltroTurno('todos');
          break;
        case 'sector-no-leidas':
          // Filtro especial para tarjetas de sector: mostrar solo no leídas
          // La lógica específica se maneja en el filtrado principal
          break;
        case 'pendientes':
          setFiltroEstado('nueva');
          // No filtrar por turno específico, mostrar todas las pendientes
          break;
        case 'criticas':
          setFiltroEstado('nueva');
          setFiltroPrioridad('critica');
          break;
        case 'leidas':
          setFiltroEstado('leida');
          break;
        case 'respondidas':
          setFiltroEstado('respondida');
          break;
        case 'hoy':
          // Filtrar por fecha de hoy (se aplicará en la lógica de filtrado)
          break;
        case 'nuevos-comentarios':
          setFiltroEstado('todas'); // Mostrar todas las novedades, no solo nuevas
          break;
        case 'creadas-por-mi':
          setFiltroUsuario(usuarioActual.id);
          break;
        case 'turno-mañana':
          setFiltroTurno('mañana');
          break;
        case 'turno-noche':
          setFiltroTurno('noche');
          break;
      }
    }
  }, [filtroEstadisticasInicial]);

  // Limpiar novedades leídas en sesión cuando cambie el filtro
  React.useEffect(() => {
    setNovedadesLeidasEnSesion(new Set());
    setComentariosLeidosEnSesion(new Set());
    setNovedadesComentadasEnSesion(new Set());
  }, [filtroEstadisticasInicial]);

  // Las novedades ya vienen filtradas por sectores asignados desde el hook
  // Para administradores incluye archivadas, para usuarios normales no
  const novedadesVisibles = novedades;

  // Obtener usuarios únicos de las novedades visibles
  const usuariosUnicos = Array.from(
    new Map(
      novedadesVisibles.map(n => [n.creadoPor.id, n.creadoPor])
    ).values()
  ).sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`));

  const novedadesFiltradas = novedadesVisibles.filter(novedad => {
    // No mostrar archivadas a usuarios normales (solo a administradores con filtro específico)
    if (novedad.estado === 'archivada' && (!esAdministrador || filtroEstado !== 'archivada')) {
      return false;
    }
    
    // IMPORTANTE: Durante la sesión actual, mantener visibles las novedades con las que se ha interactuado
    const interactuadoEnSesion = novedadesLeidasEnSesion.has(novedad.id) || 
                                novedadesComentadasEnSesion.has(novedad.id) ||
                                comentariosLeidosEnSesion.has(novedad.id);

    // Si se ha interactuado en esta sesión, mantener visible independientemente de otros filtros
    if (interactuadoEnSesion) {
      // Solo aplicar filtros básicos de búsqueda, estado manual, etc.
      const coincideBusqueda = busqueda === '' || 
        novedad.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        novedad.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      
      const coincideEstado = filtroEstado === 'todas' || novedad.estado === filtroEstado;
      const coincidePrioridad = filtroPrioridad === 'todas' || novedad.prioridad === filtroPrioridad;
      const coincideTurno = filtroTurno === 'todos' || novedad.turno === filtroTurno;
      const coincideSector = filtroSector === 'todos' || novedad.sector.id === filtroSector;
      const coincideUsuario = filtroUsuario === 'todos' || novedad.creadoPor.id === filtroUsuario;

      return coincideBusqueda && coincideEstado && coincidePrioridad && coincideTurno && coincideSector && coincideUsuario;
    }

    // Para novedades sin interacción en sesión, aplicar lógica normal
    
    // Una novedad está "leída" si cumple alguna de estas condiciones de BD
    const tieneRegistroLectura = novedad.lecturas?.some(l => l.usuario.id === usuarioActual.id) || false;
    const haComentado = novedad.comentarios?.some(c => c.autor.id === usuarioActual.id) || false;
    const comentariosLeidos = novedad.comentarioLectura !== null && novedad.comentarioLectura !== undefined;
    const novedadLeida = tieneRegistroLectura || haComentado || comentariosLeidos;
    
    // Filtro especial para tarjetas de sector: solo no leídas y no creadas por el usuario
    if (filtroEstadisticasInicial === 'sector-no-leidas') {
      if (novedadLeida) {
        return false;
      }
      // Excluir novedades creadas por el usuario actual para mantener consistencia con las tarjetas
      if (novedad.creadoPor.id === usuarioActual.id) {
        return false;
      }
    }
    
    // Para filtro de "pendientes", excluir las creadas por el usuario actual Y las que ya están leídas
    if (filtroEstadisticasInicial === 'pendientes') {
      if (novedad.creadoPor.id === usuarioActual.id) {
        return false; // No mostrar las propias en pendientes
      }
      if (novedadLeida) {
        return false; // No mostrar las ya leídas en pendientes
      }
    }
    
    // Para filtro "creadas-por-mi", mostrar solo las propias
    if (filtroEstadisticasInicial === 'creadas-por-mi') {
      if (novedad.creadoPor.id !== usuarioActual.id) {
        return false;
      }
    }
    
    // Para filtro manual de usuario específico
    if (filtroUsuario !== 'todos' && novedad.creadoPor.id !== filtroUsuario) {
      return false;
    }
    
    // Filtro especial para "hoy"
    if (filtroEstadisticasInicial === 'hoy') {
      const hoy = new Date();
      const esHoy = novedad.fechaCreacion.toDateString() === hoy.toDateString();
      if (!esHoy) return false;
    }

    // Filtro especial para "nuevos comentarios"
    if (filtroEstadisticasInicial === 'nuevos-comentarios') {
      // Debe tener comentarios
      if (novedad.comentarios.length === 0) return false;
      
      // Si es el creador de la novedad
      if (novedad.creadoPor.id === usuarioActual.id) {
        const comentarioLectura = novedad.comentarioLectura;
        if (!comentarioLectura) {
          // Si no hay registro de lectura, verificar si hay comentarios de otros
          return novedad.comentarios.some(comentario => comentario.autor.id !== usuarioActual.id);
        }
        // Verificar si hay comentarios de otros posteriores a la última lectura
        const comentariosNuevos = novedad.comentarios.filter(comentario => 
          comentario.autor.id !== usuarioActual.id && 
          comentario.fecha > comentarioLectura.ultimoComentarioLeidoAt
        );
        return comentariosNuevos.length > 0;
      }
      
      // Para novedades creadas por otros usuarios
      // Si los comentarios fueron leídos en esta sesión, mantener visible
      if (comentariosLeidosEnSesion.has(novedad.id)) {
        return true;
      }
      
      // Obtener la lectura de comentarios del usuario para esta novedad
      const comentarioLectura = novedad.comentarioLectura;
      
      if (!comentarioLectura) {
        // Si no hay registro de lectura de comentarios, verificar si hay comentarios de otros
        const tieneComentariosDeOtros = novedad.comentarios.some(comentario => comentario.autor.id !== usuarioActual.id);
        return tieneComentariosDeOtros;
      }
      
      // Verificar si hay comentarios de otros usuarios posteriores a la última lectura
      const comentariosNuevos = novedad.comentarios.filter(comentario => 
        comentario.autor.id !== usuarioActual.id && 
        comentario.fecha > comentarioLectura.ultimoComentarioLeidoAt
      );
      
      return comentariosNuevos.length > 0;
    }

    // Calcular el estado efectivo ignorando el campo estado de la BD
    let estadoEfectivo: string;
    
    if (!novedadLeida && !interactuadoEnSesion) {
      estadoEfectivo = 'nueva';
    } else if (novedad.comentarios.length > 0) {
      estadoEfectivo = 'respondida';
    } else {
      estadoEfectivo = 'leida';
    }
    
    // Para archivadas, mantener el estado original solo para el filtro
    if (novedad.estado === 'archivada') {
      estadoEfectivo = 'archivada';
    }
    
    const coincideBusqueda = busqueda === '' || 
      novedad.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      novedad.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    
    // Usar el estado efectivo para el filtrado
    const coincideEstado = filtroEstado === 'todas' || estadoEfectivo === filtroEstado;
    const coincidePrioridad = filtroPrioridad === 'todas' || novedad.prioridad === filtroPrioridad;
    const coincideTurno = filtroTurno === 'todos' || novedad.turno === filtroTurno;
    const coincideSector = filtroSector === 'todos' || novedad.sector.id === filtroSector;
    const coincideUsuario = filtroUsuario === 'todos' || novedad.creadoPor.id === filtroUsuario;

    return coincideBusqueda && coincideEstado && coincidePrioridad && coincideTurno && coincideSector && coincideUsuario;
  });

  const novedadesPendientes = novedadesVisibles.filter(n => {
    // Una novedad está pendiente si el usuario actual NO la ha "leído" (según las 3 condiciones), NO fue creada por él, y no está archivada
    const tieneRegistroLectura = n.lecturas?.some(l => l.usuario.id === usuarioActual.id) || false;
    const haComentado = n.comentarios?.some(c => c.autor.id === usuarioActual.id) || false;
    const comentariosLeidos = n.comentarioLectura !== null && n.comentarioLectura !== undefined;
    const novedadLeida = tieneRegistroLectura || haComentado || comentariosLeidos;
    
    const noEsCreador = n.creadoPor.id !== usuarioActual.id;
    const noArchivada = n.estado !== 'archivada';
    return !novedadLeida && noEsCreador && noArchivada;
  });

  // Función para manejar cuando se marca una novedad como leída
  const handleMarcarLeida = (id: string, usuarioId: string) => {
    // Agregar la novedad al set de leídas en esta sesión
    setNovedadesLeidasEnSesion(prev => new Set(prev).add(id));
    // Llamar a la función original
    onMarcarLeida(id, usuarioId);
  };

  // Función para manejar cuando se marcan comentarios como leídos
  const handleMarcarComentariosLeidos = (novedadId: string, usuarioId: string) => {
    // Agregar la novedad al set de comentarios leídos en esta sesión
    setComentariosLeidosEnSesion(prev => new Set(prev).add(novedadId));
    // Llamar a la función original
    onMarcarComentariosLeidos(novedadId, usuarioId);
  };

  // Función para manejar cuando se agrega un comentario
  const handleAgregarComentario = async (novedadId: string, comentario: { texto: string; autorId: string }, fotos?: File[]) => {
    try {
      // Llamar a la función original primero
      await onAgregarComentario(novedadId, comentario, fotos);
      // Solo agregar al set si el comentario se envió exitosamente
      setNovedadesComentadasEnSesion(prev => new Set(prev).add(novedadId));
    } catch (error) {
      // Si hay error, no agregar al set y re-lanzar el error
      throw error;
    }
  };
  return (
    <div className="space-y-6">
      {/* Alerta de novedades pendientes */}
      {novedadesPendientes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">
              Tienes {novedadesPendientes.length} novedad(es) pendiente(s) de leer
            </p>
            <p className="text-sm text-yellow-700">
              Revisa las novedades y márcalas como leídas
            </p>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm sm:text-base font-medium text-gray-800">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoNovedad | 'todas')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="nueva">Nueva</option>
              <option value="leida">Leída</option>
              <option value="respondida">Respondida</option>
              {esAdministrador && <option value="archivada">Archivada</option>}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value as PrioridadNovedad | 'todas')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Turno
            </label>
            <select
              value={filtroTurno}
              onChange={(e) => setFiltroTurno(e.target.value as 'mañana' | 'noche' | 'todos')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="mañana">Mañana</option>
              <option value="noche">Noche</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <select
              value={filtroSector}
              onChange={(e) => setFiltroSector(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              {sectoresAsignados.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.nombre}
                </option>
              ))}
            </select>
            {filtroSectorInicial && (
              <button
                onClick={() => {
                  setFiltroSector('todos');
                  setFiltroSectorPorTarjeta(null);
                  onLimpiarFiltroSector();
                }}
                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
              >
                Limpiar filtro de sector
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Creado por
            </label>
            <select
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              {usuariosUnicos.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} {usuario.apellido}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar novedades..."
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <span>
            Mostrando {novedadesFiltradas.length} de {novedadesVisibles.length} novedades
          </span>
          <button
            onClick={() => {
              setFiltroEstado('todas');
              setFiltroPrioridad('todas');
              setFiltroTurno('todos');
              setFiltroSector('todos');
              setFiltroUsuario('todos');
              setBusqueda('');
              setFiltroSectorPorTarjeta(null);
              onLimpiarFiltroSector();
              onLimpiarFiltroEstadisticas();
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-left sm:text-right"
          >
            Limpiar filtros
          </button>
          <button
            onClick={() => {
              setNovedadesLeidasEnSesion(new Set());
              setComentariosLeidosEnSesion(new Set());
              setNovedadesComentadasEnSesion(new Set());
            }}
            className="text-red-600 hover:text-red-800 transition-colors duration-200 text-left sm:text-right"
          >
            Limpiar sesión
          </button>
        </div>

        <div className="mt-2 space-y-1">
          {filtroSectorInicial && (
            <div className="text-xs text-green-600">
              Filtro de sector: {sectoresAsignados.find(s => s.id === filtroSectorInicial)?.nombre}
              <button
                onClick={() => {
                  setFiltroSector('todos');
                  onLimpiarFiltroSector();
                }}
                className="ml-2 text-green-800 hover:underline"
              >
                (quitar)
              </button>
            </div>
          )}
          
          {filtroEstadisticasInicial && (
            <div className="text-xs text-blue-600">
              Filtro aplicado: {
                filtroEstadisticasInicial === 'todas' ? 'Todas las novedades' :
                filtroEstadisticasInicial === 'sector-no-leidas' ? 'No leídas del sector (excluyendo las propias)' :
                filtroEstadisticasInicial === 'pendientes' ? 'Pendientes de leer' :
                filtroEstadisticasInicial === 'criticas' ? 'Críticas sin leer' :
                filtroEstadisticasInicial === 'leidas' ? 'Novedades leídas' :
                filtroEstadisticasInicial === 'respondidas' ? 'Con respuestas' :
                filtroEstadisticasInicial === 'hoy' ? 'Novedades de hoy' :
                filtroEstadisticasInicial === 'nuevos-comentarios' ? 'Con nuevos comentarios' :
                filtroEstadisticasInicial === 'creadas-por-mi' ? 'Creadas por mí' :
                filtroEstadisticasInicial === 'turno-mañana' ? 'Turno Mañana' :
                filtroEstadisticasInicial === 'turno-noche' ? 'Turno Noche' : ''
              }
              <button
                onClick={onLimpiarFiltroEstadisticas}
                className="ml-2 text-blue-800 hover:underline"
              >
                (quitar)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista de novedades */}
      <div className="space-y-4">
        {novedadesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base sm:text-lg">No hay novedades que coincidan con los filtros</p>
          </div>
        ) : (
          novedadesFiltradas.map((novedad) => (
            <NovedadCard
              key={novedad.id}
              novedad={novedad}
              usuarioActual={usuarioActual}
              esAdministrador={esAdministrador}
              onMarcarLeida={handleMarcarLeida}
              onAgregarComentario={handleAgregarComentario}
              onMarcarComentariosLeidos={handleMarcarComentariosLeidos}
              onEliminarNovedad={onEliminarNovedad}
              onArchivarNovedad={onArchivarNovedad}
              onDesarchivarNovedad={onDesarchivarNovedad}
            />
          ))
        )}
      </div>
    </div>
  );
};