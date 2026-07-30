import React, { useState } from 'react';
import { BarChart3, FileText, Plus, Users, LogOut, RefreshCw, FolderKanban, Briefcase, CircleUser as UserCircle, LayoutGrid } from 'lucide-react';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { NovedadForm } from './components/NovedadForm';
import { NovedadesList } from './components/NovedadesList';
import { Dashboard } from './components/Dashboard';
import { DashboardTareas } from './components/DashboardTareas';
import { ProjectManagement } from './components/ProjectManagement';
import { ProjectSelector } from './components/ProjectSelector';
import { ModeSelector } from './components/ModeSelector';
import { SectorManagement } from './components/SectorManagement';
import { ProfileEdit } from './components/ProfileEdit';
import { TareasView } from './components/TareasView';
import { TareaRapidaForm } from './components/TareaRapidaForm';
import { NuevoTableroModal } from './components/NuevoTableroModal';
import { EditarTableroModal } from './components/EditarTableroModal';
import { EditarListaModal } from './components/EditarListaModal';
import { useNovedades } from './hooks/useNovedades';
import { useAuth } from './hooks/useAuth';
import { useSectores } from './hooks/useSectores';
import { useProyectos } from './hooks/useProyectos';
import { useTableros } from './hooks/useTableros';

function App() {
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'novedades' | 'tareas' | 'usuarios' | 'proyectos' | 'sectores'>('dashboard');
  const [modo, setModo] = useState<'novedades' | 'tareas'>('novedades');
  const [filtroSectorActivo, setFiltroSectorActivo] = useState<string | null>(null);
  const [filtroEstadisticasActivo, setFiltroEstadisticasActivo] = useState<string | null>(null);
  const [filtroEstadisticasTareasActivo, setFiltroEstadisticasTareasActivo] = useState<string | null>(null);
  const [tableroSeleccionadoId, setTableroSeleccionadoId] = useState<string | null>(null);
  const [mostrarFormNovedad, setMostrarFormNovedad] = useState(false);
  const [mostrarFormTarea, setMostrarFormTarea] = useState(false);
  const [mostrarNuevoTableroModal, setMostrarNuevoTableroModal] = useState(false);
  const [mostrarEditarTableroModal, setMostrarEditarTableroModal] = useState(false);
  const [tableroAEditar, setTableroAEditar] = useState<any>(null);
  const [mostrarEditarListaModal, setMostrarEditarListaModal] = useState(false);
  const [listaAEditar, setListaAEditar] = useState<any>(null);
  const [mostrarEditarPerfil, setMostrarEditarPerfil] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  const {
    usuarioActual,
    usuarios,
    cargando: cargandoAuth,
    iniciarSesion,
    cerrarSesion,
    crearUsuario,
    actualizarUsuario,
    actualizarPerfil,
    desactivarUsuario,
    esAdministrador,
    actualizarSectoresUsuario,
    actualizarProyectosUsuario
  } = useAuth();

  const {
    sectores,
    crearSector,
    actualizarSector,
    desactivarSector
  } = useSectores();

  const {
    proyectos,
    proyectoActivo,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto,
    cambiarProyectoActivo,
    actualizarProyectosUsuario: actualizarProyectosUsuarioHook
  } = useProyectos(usuarioActual?.id, usuarioActual?.proyectos);

  const {
    novedades,
    cargando: cargandoNovedades,
    agregarNovedad,
    eliminarNovedad,
    marcarComoLeida,
    marcarComentariosComoLeidos,
    agregarComentario,
    archivarNovedad,
    desarchivarNovedad,
    recargarNovedades
  } = useNovedades(proyectoActivo?.id, usuarioActual);

  const {
    tableros,
    tableroActivo,
    cargando: cargandoTableros,
    crearTarjeta,
    crearTablero,
    actualizarTablero,
    actualizarLista,
    setTableroActivo,
    cargarTableroCompleto
  } = useTableros(proyectoActivo?.id || null, usuarioActual);

  // Resetear vista al dashboard cuando cambie el usuario
  React.useEffect(() => {
    if (usuarioActual) {
      setFiltroSectorActivo(null);
      setFiltroEstadisticasActivo(null);
      setFiltroEstadisticasTareasActivo(null);
      setMostrarFormNovedad(false);

      // Determinar módulo inicial según permisos del usuario
      const soloTareas = usuarioActual.moduloTareas && !usuarioActual.moduloNovedades;
      const ultimoModulo = localStorage.getItem(`ultimoModulo_${usuarioActual.id}`) as 'novedades' | 'tareas' | null;
      const ultimoTablero = localStorage.getItem(`ultimoTablero_${usuarioActual.id}`);
      
      const modoInicial =
        soloTareas || (ultimoModulo === 'tareas' && usuarioActual.moduloTareas) || ultimoTablero
          ? 'tareas'
          : 'novedades';
      
      setModo(modoInicial);

      if (modoInicial === 'tareas') {
        const ultimoTablero = localStorage.getItem(`ultimoTablero_${usuarioActual.id}`);
        setTableroSeleccionadoId(ultimoTablero);
        setVistaActual('tareas');
      } else {
        setTableroSeleccionadoId(null);
        setVistaActual('dashboard');
      }
    }
  }, [usuarioActual?.id]);
  
  const handleFiltrarPorSector = (sectorId: string) => {
    setFiltroSectorActivo(sectorId);
    setFiltroEstadisticasActivo(null);
    // Cuando se filtra por sector desde las tarjetas, también aplicar filtro de "no leídas"
    setFiltroEstadisticasActivo('sector-no-leidas');
    setVistaActual('novedades');
  };

  const handleFiltrarEstadisticas = (filtro: string) => {
    setFiltroSectorActivo(null);
    setVistaActual('novedades');
    setFiltroEstadisticasActivo(filtro);
  };

  const handleFiltrarEstadisticasTareas = (filtro: string) => {
    setVistaActual('tareas');
    setFiltroEstadisticasTareasActivo(filtro);
  };

  const handleAgregarNovedad = async (novedad: any, fotosNovedad?: File[]) => {
    try {
      await agregarNovedad(novedad, fotosNovedad);
      // Pequeño delay antes de cerrar el modal para evitar problemas en Android
      setTimeout(() => {
        setMostrarFormNovedad(false);
      }, 200);
      // Recargar datos después de agregar
      await recargarNovedades();
    } catch (error) {
      // En caso de error, no cerrar el modal
    }
  };

  const handleActualizar = async () => {
    setActualizando(true);
    try {
      await recargarNovedades();
    } finally {
      setActualizando(false);
    }
  };

  const handleCrearTareaRapida = async (datos: {
    tableroId: string;
    listaId: string;
    titulo: string;
    descripcion?: string;
    prioridad?: 'baja' | 'media' | 'alta' | 'critica';
    fechaInicio?: Date;
    fechaVencimiento?: Date;
  }) => {
    try {
      await crearTarjeta({
        listaId: datos.listaId,
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        prioridad: datos.prioridad || 'media',
        fechaInicio: datos.fechaInicio,
        fechaVencimiento: datos.fechaVencimiento,
        creadoPorId: usuarioActual.id
      });

      setMostrarFormTarea(false);
      setTableroSeleccionadoId(datos.tableroId);
      setVistaActual('tareas');

      if (usuarioActual) {
        localStorage.setItem(`ultimoTablero_${usuarioActual.id}`, datos.tableroId);
      }

      // Recargar el tablero para mostrar la nueva tarea
      await cargarTableroCompleto(datos.tableroId);
    } catch (error) {
      throw error;
    }
  };

  const handleCrearTablero = async (datos: {
    nombre: string;
    descripcion?: string;
    proyectoId: string;
    sectorId?: string;
    color?: string;
    creadoPorId: string;
  }) => {
    try {
      const nuevoTablero = await crearTablero(datos);
      setMostrarNuevoTableroModal(false);
      return nuevoTablero;
    } catch (error) {
      throw error;
    }
  };

  const handleEditarTablero = (tablero: any) => {
    setTableroAEditar(tablero);
    setMostrarEditarTableroModal(true);
  };

  const handleActualizarTablero = async (tableroId: string, datos: {
    nombre: string;
    descripcion?: string;
    sectorId?: string;
    color?: string;
  }) => {
    try {
      await actualizarTablero(tableroId, datos);
      setMostrarEditarTableroModal(false);
      setTableroAEditar(null);
    } catch (error) {
      throw error;
    }
  };

  const handleEditarLista = (lista: any) => {
    setListaAEditar(lista);
    setMostrarEditarListaModal(true);
  };

  const handleActualizarLista = async (listaId: string, nombre: string) => {
    try {
      await actualizarLista(listaId, nombre);
      setMostrarEditarListaModal(false);
      setListaAEditar(null);
    } catch (error) {
      throw error;
    }
  };

  const handleCambiarModo = (nuevoModo: 'novedades' | 'tareas') => {
    setModo(nuevoModo);
  
    if (usuarioActual) {
      localStorage.setItem(`ultimoModulo_${usuarioActual.id}`, nuevoModo);
    }
  
    if (nuevoModo === 'novedades') {
      setVistaActual('dashboard');
    } else {
      const ultimoTablero = usuarioActual ? localStorage.getItem(`ultimoTablero_${usuarioActual.id}`) : null;
      setTableroSeleccionadoId(ultimoTablero);
      setVistaActual('tareas');
    }
  };

  const handleSeleccionarTablero = async (tableroId: string) => {
    setTableroSeleccionadoId(tableroId);
    setModo('tareas');
    setVistaActual('tareas');
  
    if (usuarioActual) {
      localStorage.setItem(`ultimoModulo_${usuarioActual.id}`, 'tareas');
      localStorage.setItem(`ultimoTablero_${usuarioActual.id}`, tableroId);
    }
  };

  // Filtrar proyectos según asignaciones del usuario
  const proyectosDisponibles = React.useMemo(() => {
    if (!usuarioActual) return [];

    // Administradores sin proyectos asignados ven todos
    if (usuarioActual.rol === 'administrador' && (!usuarioActual.proyectos || usuarioActual.proyectos.length === 0)) {
      return proyectos;
    }

    // Usuarios normales o administradores con proyectos asignados ven solo los asignados
    const proyectosAsignados = usuarioActual.proyectos || [];
    return proyectos.filter(p => proyectosAsignados.some(pa => pa.id === p.id));
  }, [usuarioActual, proyectos]);

  // Si no hay usuario logueado, mostrar login
  if (cargandoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando sesión...</p>
        </div>
      </div>
    );
  }
  
  if (!usuarioActual) {
    return <Login onLogin={iniciarSesion} />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center gap-4">
              <img
                src="/Rotorc alta calidad.png"
                alt="Rotorc Logo"
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Sistema de Gestión de Novedades
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Comunicación efectiva entre equipos de trabajo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleActualizar}
                disabled={actualizando}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200 disabled:opacity-50"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-4 h-4 ${actualizando ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">Actualizar</span>
              </button>
              <button
                onClick={() => setMostrarEditarPerfil(true)}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                {usuarioActual.photoUrl ? (
                  <img
                    src={usuarioActual.photoUrl}
                    alt="Perfil"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${usuarioActual.nombre}+${usuarioActual.apellido}&size=32&background=3b82f6&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {usuarioActual.nombre.charAt(0)}{usuarioActual.apellido.charAt(0)}
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-medium text-gray-900">
                    {usuarioActual.nombre} {usuarioActual.apellido}
                  </p>
                  <p className="text-xs text-gray-500">
                    {usuarioActual.rol.charAt(0).toUpperCase() + usuarioActual.rol.slice(1)}
                  </p>
                </div>
              </button>
              <button
                onClick={cerrarSesion}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col">
            {proyectoActivo && (
              <div className="py-2 border-b">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  <ProjectSelector
                    proyectos={proyectosDisponibles}
                    proyectoActivo={proyectoActivo}
                    onCambiarProyecto={cambiarProyectoActivo}
                  />
                  <ModeSelector
                    modo={modo}
                    onCambiarModo={handleCambiarModo}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex overflow-x-auto">
              {modo === 'novedades' && (
                <>
                  <button
                    onClick={() => setVistaActual('dashboard')}
                    className={`flex items-center gap-2 px-3 py-3 sm:py-4 border-b-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                      vistaActual === 'dashboard'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Dashboard</span>
                  </button>
                  <button
                    onClick={() => setVistaActual('novedades')}
                    className={`flex items-center gap-2 px-3 py-3 sm:py-4 border-b-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                      vistaActual === 'novedades'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Novedades</span>
                  </button>
                </>
              )}
              {modo === 'tareas' && (
                <>
                  <button
                    onClick={() => {
                      setTableroSeleccionadoId(null);
                      setVistaActual('tareas');
                    }}
                    className={`flex items-center gap-2 px-3 py-3 sm:py-4 border-b-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                      vistaActual === 'tareas'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Tareas</span>
                  </button>
                  <button
                    onClick={() => {
                      setTableroSeleccionadoId(null);
                      setVistaActual('dashboard');
                    }}
                    className={`flex items-center gap-2 px-3 py-3 sm:py-4 border-b-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                      vistaActual === 'dashboard'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Dashboard</span>
                  </button>
                </>
              )}
              {esAdministrador() && (
                <>
                  <button
                    onClick={() => setVistaActual('usuarios')}
                    className={`flex items-center gap-2 px-3 py-3 sm:py-4 border-b-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                      vistaActual === 'usuarios'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Usuarios</span>
                  </button>
                  <button
                    onClick={() => setVistaActual('proyectos')}
                    className={`flex items-center gap-2 px-3 py-3 sm:py-4 border-b-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                      vistaActual === 'proyectos'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Proyectos</span>
                  </button>
                  <button
                    onClick={() => setVistaActual('sectores')}
                    className={`flex items-center gap-2 px-3 py-3 sm:py-4 border-b-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                      vistaActual === 'sectores'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Sectores</span>
                  </button>
                </>
              )}
              </div>

              {proyectoActivo && (
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => modo === 'novedades' ? setMostrarFormNovedad(true) : setMostrarFormTarea(true)}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 font-medium transition-colors duration-200 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base font-medium">
                      {modo === 'novedades' ? 'Nueva Novedad' : 'Nueva Tarea'}
                    </span>
                  </button>
                  {modo === 'tareas' && (
                    <button
                      onClick={() => setMostrarNuevoTableroModal(true)}
                      className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 font-medium transition-colors duration-200 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base font-medium">
                        Nuevo Tablero
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {!proyectoActivo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-800 text-lg font-semibold mb-2">
              No hay proyecto seleccionado
            </div>
            <p className="text-yellow-700">
              {proyectos.length === 0
                ? 'No hay proyectos disponibles. Los administradores pueden crear proyectos en la sección "Proyectos".'
                : 'Por favor, selecciona un proyecto del selector en el header para ver las novedades.'}
            </p>
          </div>
        )}

        {proyectoActivo && vistaActual === 'dashboard' && modo === 'novedades' && (
          <Dashboard
            novedades={novedades}
            usuarioActual={usuarioActual}
            cargando={cargandoNovedades}
            onFiltrarPorSector={handleFiltrarPorSector}
            onFiltrarEstadisticas={handleFiltrarEstadisticas}
          />
        )}

        {proyectoActivo && vistaActual === 'dashboard' && modo === 'tareas' && (
          <DashboardTareas
            tableros={tableros}
            usuarioActual={usuarioActual}
            cargando={cargandoTableros}
            onSeleccionarTablero={handleSeleccionarTablero}
            onFiltrarEstadisticas={handleFiltrarEstadisticasTareas}
            onEditarTablero={handleEditarTablero}
          />
        )}

        {proyectoActivo && vistaActual === 'novedades' && (
          <NovedadesList
            novedades={novedades}
            sectores={sectores}
            usuarioActual={usuarioActual}
            esAdministrador={esAdministrador()}
            filtroSectorInicial={filtroSectorActivo}
            filtroEstadisticasInicial={filtroEstadisticasActivo}
            onLimpiarFiltroSector={() => setFiltroSectorActivo(null)}
            onLimpiarFiltroEstadisticas={() => setFiltroEstadisticasActivo(null)}
            onMarcarLeida={marcarComoLeida}
            onAgregarComentario={agregarComentario}
            onMarcarComentariosLeidos={marcarComentariosComoLeidos}
            onEliminarNovedad={esAdministrador() ? eliminarNovedad : undefined}
            onArchivarNovedad={esAdministrador() ? archivarNovedad : undefined}
            onDesarchivarNovedad={esAdministrador() ? desarchivarNovedad : undefined}
          />
        )}

        {vistaActual === 'tareas' && (
          <TareasView
            usuarioActual={usuarioActual}
            proyectoActivoId={proyectoActivo?.id || null}
            filtroEstadisticasInicial={filtroEstadisticasTareasActivo}
            tableroIdInicial={tableroSeleccionadoId}
            onLimpiarFiltroEstadisticas={() => setFiltroEstadisticasTareasActivo(null)}
            onEditarLista={handleEditarLista}
            onEditarTablero={handleEditarTablero}
          />
        )}

        {vistaActual === 'usuarios' && esAdministrador() && (
          <UserManagement
            usuarios={usuarios}
            onCrearUsuario={crearUsuario}
            onActualizarUsuario={actualizarUsuario}
            onDesactivarUsuario={desactivarUsuario}
            sectores={sectores}
            proyectos={proyectos}
            onActualizarSectoresUsuario={actualizarSectoresUsuario}
            onActualizarProyectosUsuario={actualizarProyectosUsuario}
          />
        )}

        {vistaActual === 'proyectos' && esAdministrador() && (
          <ProjectManagement
            proyectos={proyectos}
            onCrearProyecto={crearProyecto}
            onActualizarProyecto={actualizarProyecto}
            onEliminarProyecto={eliminarProyecto}
          />
        )}

        {vistaActual === 'sectores' && esAdministrador() && (
          <SectorManagement
            sectores={sectores}
            onCrearSector={crearSector}
            onActualizarSector={actualizarSector}
            onDesactivarSector={desactivarSector}
          />
        )}
      </main>

      {mostrarFormNovedad && proyectoActivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <NovedadForm
                usuarioActual={usuarioActual}
                sectores={usuarioActual.sectores || sectores}
                onAgregarNovedad={handleAgregarNovedad}
                onCancelar={() => setMostrarFormNovedad(false)}
              />
            </div>
          </div>
        </div>
      )}

      {mostrarEditarPerfil && (
        <ProfileEdit
          usuario={usuarioActual}
          onActualizarPerfil={actualizarPerfil}
          onCerrar={() => setMostrarEditarPerfil(false)}
        />
      )}

      {mostrarFormTarea && proyectoActivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TareaRapidaForm
              usuarioActual={usuarioActual}
              tableros={tableros}
              onCrearTarea={handleCrearTareaRapida}
              onCancelar={() => setMostrarFormTarea(false)}
            />
          </div>
        </div>
      )}

      {mostrarNuevoTableroModal && proyectoActivo && (
        <NuevoTableroModal
          usuarioActual={usuarioActual}
          proyectoActivoId={proyectoActivo.id}
          onCrear={handleCrearTablero}
          onCerrar={() => setMostrarNuevoTableroModal(false)}
        />
      )}

      {mostrarEditarTableroModal && tableroAEditar && (
        <EditarTableroModal
          tablero={tableroAEditar}
          onActualizar={handleActualizarTablero}
          onCerrar={() => {
            setMostrarEditarTableroModal(false);
            setTableroAEditar(null);
          }}
        />
      )}

      {mostrarEditarListaModal && listaAEditar && (
        <EditarListaModal
          lista={listaAEditar}
          onActualizar={handleActualizarLista}
          onCerrar={() => {
            setMostrarEditarListaModal(false);
            setListaAEditar(null);
          }}
        />
      )}
    </div>
  );
}

export default App;