import React from 'react';
import { FileText, CheckCircle, MessageCircle, TrendingUp, AlertTriangle, Clock, Info, Wrench, Shield, Users, Building2, Monitor, Award, Sun, Moon } from 'lucide-react';
import { Novedad, Usuario, Sector } from '../types';

interface DashboardProps {
  novedades: Novedad[];
  usuarioActual: Usuario;
  cargando: boolean;
  onFiltrarPorSector: (sectorId: string) => void;
  onFiltrarEstadisticas: (filtro: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ novedades, usuarioActual, cargando, onFiltrarPorSector, onFiltrarEstadisticas }) => {
  // Filtrar novedades por sectores asignados al usuario
  // Para el dashboard, excluir archivadas incluso para administradores (métricas más claras)
  const novedadesFiltradas = novedades.filter(n => n.estado !== 'archivada');

  const totalNovedades = novedadesFiltradas.length;
  
  const novedadesNuevas = novedadesFiltradas.filter(n => n.estado === 'nueva').length;
  const novedadesLeidas = novedadesFiltradas.filter(n => n.estado === 'leida' || n.estado === 'respondida').length;
  const novedadesRespondidas = novedadesFiltradas.filter(n => n.estado === 'respondida').length;
  
  // Calcular pendientes correctamente
  // Calcular pendientes como la suma de todas las novedades sin leer por sector
  const novedadesPendientes = novedadesFiltradas.filter(n => {
    // Una novedad está pendiente si el usuario actual NO la ha "leído" (según las 3 condiciones) y no está archivada
    const tieneRegistroLectura = n.lecturas?.some(l => l.usuario.id === usuarioActual.id) || false;
    const haComentado = n.comentarios?.some(c => c.autor.id === usuarioActual.id) || false;
    const comentariosLeidos = n.comentarioLectura !== null && n.comentarioLectura !== undefined;
    const novedadLeida = tieneRegistroLectura || haComentado || comentariosLeidos;
    
    // No incluir novedades creadas por el usuario actual
    const noEsCreador = n.creadoPor.id !== usuarioActual.id;
    
    const noArchivada = n.estado !== 'archivada';
    
    // Verificar que el usuario puede ver este sector
    let puedeVerSector = false;
    if (usuarioActual.rol === 'administrador' && (!usuarioActual.sectores || usuarioActual.sectores.length === 0)) {
      puedeVerSector = true;
    } else {
      puedeVerSector = (usuarioActual.sectores || []).some(s => s.id === n.sector.id);
    }
    
    return !novedadLeida && noEsCreador && noArchivada && puedeVerSector;
  }).length;
  
  const novedadesCriticas = novedadesFiltradas.filter(n => n.prioridad === 'critica' && n.estado === 'nueva').length;
  
  const novedadesHoy = novedadesFiltradas.filter(n => {
    const hoy = new Date();
    return n.fechaCreacion.toDateString() === hoy.toDateString();
  }).length;

  // Novedades del turno mañana y noche
  const novedadesMañana = novedadesFiltradas.filter(n => n.turno === 'mañana').length;
  const novedadesNoche = novedadesFiltradas.filter(n => n.turno === 'noche').length;

  // Novedades con nuevos comentarios
  const novedadesConNuevosComentarios = novedadesFiltradas.filter(n => {
    if (n.comentarios.length === 0) return false;
    
    // Si es el creador de la novedad, verificar si hay comentarios de otros usuarios
    if (n.creadoPor.id === usuarioActual.id) {
      const comentarioLectura = n.comentarioLectura;
      if (!comentarioLectura) {
        // Si no hay registro de lectura, verificar si hay comentarios de otros
        return n.comentarios.some(comentario => comentario.autor.id !== usuarioActual.id);
      }
      // Verificar si hay comentarios de otros posteriores a la última lectura
      const comentariosNuevos = n.comentarios.filter(comentario => 
        comentario.autor.id !== usuarioActual.id && 
        comentario.fecha > comentarioLectura.ultimoComentarioLeidoAt
      );
      return comentariosNuevos.length > 0;
    }
    
    // Para novedades creadas por otros usuarios (lógica original)
    const haLeidoNovedad = n.lecturas?.some(l => l.usuario.id === usuarioActual.id);
    if (!haLeidoNovedad) return false;
    const comentarioLectura = n.comentarioLectura;
    if (!comentarioLectura) {
      return n.comentarios.some(comentario => comentario.autor.id !== usuarioActual.id);
    }
    const comentariosNuevos = n.comentarios.filter(comentario => 
      comentario.autor.id !== usuarioActual.id && 
      comentario.fecha > comentarioLectura.ultimoComentarioLeidoAt
    );
    return comentariosNuevos.length > 0;
  }).length;

  const novedadesCreadasPorMi = novedadesFiltradas.filter(n => 
    n.creadoPor.id === usuarioActual.id
  ).length;

  // Función para aplicar filtro específico para novedades no leídas de un sector
  const aplicarFiltroSectorNoLeidas = (sectorId: string) => {
    onFiltrarPorSector(sectorId);
  };
  const stats = [
    {
      title: 'Total Novedades',
      value: totalNovedades,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      filtro: 'todas'
    },
    {
      title: 'Pendientes de Leer',
      value: novedadesPendientes,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      filtro: 'pendientes'
    },
    {
      title: 'Críticas Sin Leer',
      value: novedadesCriticas,
      icon: TrendingUp,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      filtro: 'criticas'
    },
    {
      title: 'Leídas',
      value: novedadesLeidas,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      filtro: 'leidas'
    },
    {
      title: 'Con Respuestas',
      value: novedadesRespondidas,
      icon: MessageCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      filtro: 'respondidas'
    },
    {
      title: 'Hoy',
      value: novedadesHoy,
      icon: Clock,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      filtro: 'hoy'
    },
    {
      title: 'Nuevos Comentarios',
      value: novedadesConNuevosComentarios,
      icon: MessageCircle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      filtro: 'nuevos-comentarios'
    },
    {
      title: 'Creadas por Mí',
      value: novedadesCreadasPorMi,
      icon: Users,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      filtro: 'creadas-por-mi'
    },
    {
      title: 'Turno Mañana',
      value: novedadesMañana,
      icon: Sun,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      filtro: 'turno-mañana'
    },
    {
      title: 'Turno Noche',
      value: novedadesNoche,
      icon: Moon,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      filtro: 'turno-noche'
    }
  ];

  // Obtener novedades no leídas por sector
  const getSectorIcon = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('operacional')) return Info;
    if (nombreLower.includes('mantenimiento')) return Wrench;
    if (nombreLower.includes('seguridad')) return Shield;
    if (nombreLower.includes('personal')) return Users;
    if (nombreLower.includes('sistemas')) return Monitor;
    if (nombreLower.includes('calidad')) return Award;
    return Building2;
  };

  // Obtener sectores únicos basados en las novedades filtradas
  const sectoresConNovedades = Array.from(new Map(novedadesFiltradas.map(n => [n.sector.id, n.sector])).values())
    .filter(sector => {
      if (usuarioActual.rol === 'administrador' && (!usuarioActual.sectores || usuarioActual.sectores.length === 0)) {
        return true;
      }

      const sectoresAsignados = usuarioActual.sectores || [];
      const puedeVer = sectoresAsignados.some(s => s.id === sector.id);
      return puedeVer;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const novedadesPorSector = sectoresConNovedades.map(sector => {
    const novedadesNoLeidasSector = novedadesFiltradas.filter(n => {
      const esMismoSector = n.sector.id === sector.id;
      
      const noArchivada = n.estado !== 'archivada';
      
      // Verificar si el usuario puede ver este sector
      let puedeVerSector = false;
      if (usuarioActual.rol === 'administrador' && (!usuarioActual.sectores || usuarioActual.sectores.length === 0)) {
        puedeVerSector = true;
      } else {
        puedeVerSector = (usuarioActual.sectores || []).some(s => s.id === sector.id);
      }
      
      // Una novedad está "no leída" si NO cumple ninguna de estas condiciones
      // (incluyendo interacciones de la sesión actual):
      const tieneRegistroLectura = n.lecturas?.some(l => l.usuario.id === usuarioActual.id) || false;
      const haComentado = n.comentarios?.some(c => c.autor.id === usuarioActual.id) || false;
      const comentariosLeidos = n.comentarioLectura !== null && n.comentarioLectura !== undefined;
      
      // También considerar interacciones de la sesión actual
      // Nota: En el Dashboard no tenemos acceso a los estados de sesión,
      // por lo que solo consideramos el estado de la base de datos
      const novedadLeida = tieneRegistroLectura || haComentado || comentariosLeidos;
      
      // Para las tarjetas de sector, mostrar solo novedades no leídas de otros usuarios
      const esNoLeida = !novedadLeida;
      const noEsCreador = n.creadoPor.id !== usuarioActual.id;
      
      return esMismoSector && esNoLeida && noEsCreador && noArchivada && puedeVerSector;
    }).length;
    
    return {
      sector,
      novedadesNoLeidas: novedadesNoLeidasSector,
      icon: getSectorIcon(sector.nombre)
    };
  }); // Mostrar todos los sectores, incluso con 0 novedades sin leer

  // Componente de loading para las estadísticas
  const StatCard = ({ stat, index }: { stat: any; index: number }) => (
    <button
      key={index}
      onClick={() => onFiltrarEstadisticas(stat.filtro)}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left w-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
          <div className={`text-xl sm:text-2xl font-bold ${stat.textColor}`}>
            {cargando ? (
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              stat.value
            )}
          </div>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${stat.color}`}>
          <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </button>
  );

  // Componente de loading para sectores
  const SectorCard = ({ sector, novedadesNoLeidas, icon: IconComponent }: any) => (
    <button
      key={sector.id}
      onClick={() => aplicarFiltroSectorNoLeidas(sector.id)}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{sector.nombre}</p>
          <p className={`text-2xl font-bold ${novedadesNoLeidas > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {cargando ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              novedadesNoLeidas
            )}
          </p>
          <p className="text-xs text-gray-500">
            {cargando ? 'Cargando...' : (novedadesNoLeidas > 0 ? `sin leer` : 'al día')}
          </p>
        </div>
        <div className={`p-3 rounded-full ${novedadesNoLeidas > 0 ? 'bg-red-500' : 'bg-green-500'}`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} index={index} />
        ))}
      </div>

      {/* Novedades no leídas por sector */}
      {novedadesPorSector.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Novedades por Sector</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {novedadesPorSector.map((sectorData) => (
              <SectorCard key={sectorData.sector.id} {...sectorData} />
            ))}
          </div>
        </div>
      )}

      {!cargando && novedadesPorSector.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">¡Sin novedades!</h3>
          <p className="text-green-700">No hay novedades en tus sectores asignados.</p>
        </div>
      )}

      {cargando && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Cargando datos...</h3>
          <p className="text-blue-700">Obteniendo las últimas novedades</p>
        </div>
      )}
    </div>
  );
};