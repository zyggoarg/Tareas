import React from 'react';
import { CheckSquare, Clock, AlertTriangle, CheckCircle, Users, Calendar, Edit } from 'lucide-react';
import { Tablero, Usuario } from '../types';

interface DashboardTareasProps {
  tableros: Tablero[];
  usuarioActual: Usuario;
  cargando: boolean;
  onSeleccionarTablero: (tableroId: string) => void;
  onFiltrarEstadisticas: (filtro: string) => void;
  onEditarTablero?: (tablero: Tablero) => void;
}

export const DashboardTareas: React.FC<DashboardTareasProps> = ({
  tableros,
  usuarioActual,
  cargando,
  onSeleccionarTablero,
  onFiltrarEstadisticas,
  onEditarTablero
}) => {
  const totalTarjetas = tableros.reduce((acc, tablero) => {
    return acc + (tablero.listas?.reduce((sum, lista) => sum + (lista.tarjetas?.length || 0), 0) || 0);
  }, 0);

  const tarjetasAsignadas = tableros.reduce((acc, tablero) => {
    return acc + (tablero.listas?.reduce((sum, lista) => {
      return sum + (lista.tarjetas?.filter(t =>
        t.asignados?.some(u => u.id === usuarioActual.id)
      ).length || 0);
    }, 0) || 0);
  }, 0);

  const tarjetasVencidas = tableros.reduce((acc, tablero) => {
    return acc + (tablero.listas?.reduce((sum, lista) => {
      return sum + (lista.tarjetas?.filter(t =>
        t.fechaVencimiento && new Date(t.fechaVencimiento) < new Date()
      ).length || 0);
    }, 0) || 0);
  }, 0);

  const tarjetasCriticas = tableros.reduce((acc, tablero) => {
    return acc + (tablero.listas?.reduce((sum, lista) => {
      return sum + (lista.tarjetas?.filter(t => t.prioridad === 'critica').length || 0);
    }, 0) || 0);
  }, 0);

  const checklistsPendientes = tableros.reduce((acc, tablero) => {
    return acc + (tablero.listas?.reduce((sum, lista) => {
      return sum + (lista.tarjetas?.reduce((checkSum, tarjeta) => {
        return checkSum + (tarjeta.checklist?.filter(c => !c.completado).length || 0);
      }, 0) || 0);
    }, 0) || 0);
  }, 0);

  const stats = [
    {
      title: 'Total Tareas',
      value: totalTarjetas,
      icon: CheckSquare,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      filtro: 'todas'
    },
    {
      title: 'Asignadas a Mí',
      value: tarjetasAsignadas,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      filtro: 'asignadas'
    },
    {
      title: 'Vencidas',
      value: tarjetasVencidas,
      icon: Clock,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      filtro: 'vencidas'
    },
    {
      title: 'Críticas',
      value: tarjetasCriticas,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      filtro: 'criticas'
    },
    {
      title: 'Checklist Pendientes',
      value: checklistsPendientes,
      icon: CheckCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      filtro: 'checklist-pendientes'
    },
    {
      title: 'Tableros Activos',
      value: tableros.length,
      icon: Calendar,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      filtro: 'tableros'
    }
  ];

  const StatCard = ({ stat, index }: { stat: any; index: number }) => (
    <button
      key={index}
      onClick={() => onFiltrarEstadisticas(stat.filtro)}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left w-full cursor-pointer"
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

  const TableroCard = ({ tablero }: { tablero: Tablero }) => {
    const totalTarjetas = tablero.listas?.reduce((sum, lista) => sum + (lista.tarjetas?.length || 0), 0) || 0;
    const tarjetasUsuario = tablero.listas?.reduce((sum, lista) => {
      return sum + (lista.tarjetas?.filter(t => t.asignados?.some(u => u.id === usuarioActual.id)).length || 0);
    }, 0) || 0;

    return (
      <div
        key={tablero.id}
        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 text-left relative group"
      >
        {onEditarTablero && (usuarioActual.rol === 'administrador' || tablero.creadoPor.id === usuarioActual.id) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditarTablero(tablero);
            }}
            className="absolute top-3 right-3 p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Editar tablero"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        )}
        <button
          onClick={() => onSeleccionarTablero(tablero.id)}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{tablero.nombre}</h3>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: tablero.color }}
            />
          </div>
          {tablero.descripcion && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tablero.descripcion}</p>
          )}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <CheckSquare className="w-4 h-4" />
              <span>{totalTarjetas} tareas</span>
            </div>
            {tarjetasUsuario > 0 && (
              <div className="flex items-center gap-1 text-blue-600">
                <Users className="w-4 h-4" />
                <span>{tarjetasUsuario} asignadas</span>
              </div>
            )}
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} index={index} />
        ))}
      </div>

      {tableros.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tableros</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tableros.map(tablero => (
              <TableroCard key={tablero.id} tablero={tablero} />
            ))}
          </div>
        </div>
      )}

      {!cargando && tableros.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <CheckSquare className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No hay tableros</h3>
          <p className="text-yellow-700">
            Crea un tablero para comenzar a organizar tus tareas.
          </p>
        </div>
      )}

      {cargando && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Cargando datos...</h3>
          <p className="text-blue-700">Obteniendo las últimas tareas</p>
        </div>
      )}
    </div>
  );
};
