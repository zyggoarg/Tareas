import { useState, useEffect } from 'react';
import { X, Plus, Calendar, CheckSquare, Users, Paperclip, Tag, Eye, EyeOff, Trash2, Clock, AlertCircle, FileText, Link as LinkIcon } from 'lucide-react';
import { Tarjeta, Usuario, EstadoTarjeta } from '../types';
import { TarjetaComentariosActividad } from './TarjetaComentariosActividad';
import { supabase } from '../lib/supabase';

const toLocalDateTimeInputValue = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDateTime = (date: Date): string => {
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface TarjetaDetallesModalProps {
  tarjeta: Tarjeta;
  usuarioActual: Usuario;
  onCerrar: () => void;
  onActualizar: (tarjetaId: string, datos: any) => Promise<void>;
  onEliminar: (tarjetaId: string) => Promise<void>;
  onAgregarComentario?: (tarjetaId: string, texto: string) => Promise<void>;
  onSubirAdjunto?: (tarjetaId: string, archivo: File) => Promise<void>;
  onRegistrarActividad?: (tarjetaId: string, usuarioId: string, tipo: string, descripcion: string, metadata?: Record<string, any>) => Promise<void>;
  onAgregarEtiqueta?: (tarjetaId: string, etiquetaId: string) => Promise<void>;
  onQuitarEtiqueta?: (tarjetaId: string, etiquetaId: string) => Promise<void>;
  onAgregarAsignado?: (tarjetaId: string, usuarioId: string) => Promise<void>;
  onQuitarAsignado?: (tarjetaId: string, usuarioId: string) => Promise<void>;
  tableroId: string;
}

export const TarjetaDetallesModal = ({
  tarjeta,
  usuarioActual,
  onCerrar,
  onActualizar,
  onEliminar,
  onAgregarComentario,
  onSubirAdjunto,
  onRegistrarActividad,
  onAgregarEtiqueta,
  onQuitarEtiqueta,
  onAgregarAsignado,
  onQuitarAsignado,
  tableroId
}: TarjetaDetallesModalProps) => {
  const [descripcion, setDescripcion] = useState(tarjeta.descripcion || '');
  const [editandoDescripcion, setEditandoDescripcion] = useState(false);
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [titulo, setTitulo] = useState(tarjeta.titulo);
  const [etiquetas, setEtiquetas] = useState(tarjeta.etiquetas || []);
  const [asignados, setAsignados] = useState(tarjeta.asignados || []);
  const [mostrandoAgregarEtiqueta, setMostrandoAgregarEtiqueta] = useState(false);
  const [mostrandoAgregarMiembro, setMostrandoAgregarMiembro] = useState(false);
  const [mostrandoAgregarFecha, setMostrandoAgregarFecha] = useState(false);
  const [mostrandoAgregarChecklist, setMostrandoAgregarChecklist] = useState(false);
  const [ocultarCompletados, setOcultarCompletados] = useState(false);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState({ nombre: '', color: '#ef4444' });
  const [nuevoChecklistItem, setNuevoChecklistItem] = useState('');
  const [editandoChecklistItem, setEditandoChecklistItem] = useState<string | null>(null);
  const [textoEditandoChecklist, setTextoEditandoChecklist] = useState('');
  const [fechaInicio, setFechaInicio] = useState(
    tarjeta.fechaInicio ? toLocalDateTimeInputValue(new Date(tarjeta.fechaInicio)) : ''
  );
  const [fechaVencimiento, setFechaVencimiento] = useState(
    tarjeta.fechaVencimiento ? toLocalDateTimeInputValue(new Date(tarjeta.fechaVencimiento)) : ''
  );
  const [estado, setEstado] = useState<EstadoTarjeta>(tarjeta.estado || 'pendiente');
  const [prioridad, setPrioridad] = useState(tarjeta.prioridad || 'media');
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState<any[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [checklistItems, setChecklistItems] = useState(tarjeta.checklist || []);
  const [adjuntos, setAdjuntos] = useState(tarjeta.adjuntos || []);

  const checklistCompletados = checklistItems.filter(c => c.completado).length;
  const checklistTotal = checklistItems.length;
  const porcentajeCompletado = checklistTotal > 0 ? (checklistCompletados / checklistTotal) * 100 : 0;

  const coloresEtiqueta = [
    { nombre: 'Rojo', valor: '#ef4444' },
    { nombre: 'Naranja', valor: '#f97316' },
    { nombre: 'Amarillo', valor: '#eab308' },
    { nombre: 'Verde', valor: '#22c55e' },
    { nombre: 'Azul', valor: '#3b82f6' },
    { nombre: 'Morado', valor: '#a855f7' },
    { nombre: 'Rosa', valor: '#ec4899' },
    { nombre: 'Gris', valor: '#6b7280' }
  ];

  const estados = [
    { valor: 'pendiente', label: 'Pendiente', color: 'bg-gray-100 text-gray-700', icon: Clock },
    { valor: 'en_progreso', label: 'En Progreso', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
    { valor: 'en_revision', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
    { valor: 'completado', label: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckSquare },
    { valor: 'bloqueado', label: 'Bloqueado', color: 'bg-red-100 text-red-700', icon: AlertCircle }
  ];

  const prioridades = [
    { valor: 'baja', label: 'Baja', color: 'bg-gray-100 text-gray-700' },
    { valor: 'media', label: 'Media', color: 'bg-blue-100 text-blue-700' },
    { valor: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
    { valor: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-700' }
  ];

  useEffect(() => {
    cargarEtiquetasDisponibles();
    cargarUsuariosDisponibles();
  }, []);

  const recargarChecklist = async () => {
    const { data } = await supabase
      .from('tarjeta_checklist')
      .select('*')
      .eq('tarjeta_id', tarjeta.id)
      .order('orden', { ascending: true });
    if (data) {
      setChecklistItems(data.map((item: any) => ({
        id: item.id,
        tarjetaId: item.tarjeta_id,
        texto: item.texto,
        completado: item.completado,
        orden: item.orden,
        fechaCreacion: new Date(item.created_at)
      })));
    }
  };

  const recargarAdjuntos = async () => {
    const { data } = await supabase
      .from('tarjeta_adjuntos')
      .select('*, usuario:usuarios(id, nombre, apellido, dni, contraseña, rol, activo, created_at, photo_url)')
      .eq('tarjeta_id', tarjeta.id)
      .order('created_at', { ascending: false });
    if (data) {
      setAdjuntos(data.map((a: any) => ({
        id: a.id,
        tarjetaId: a.tarjeta_id,
        usuario: a.usuario ? {
          id: a.usuario.id,
          nombre: a.usuario.nombre,
          apellido: a.usuario.apellido,
          dni: a.usuario.dni,
          contraseña: a.usuario.contraseña || '',
          rol: a.usuario.rol,
          activo: a.usuario.activo,
          fechaCreacion: new Date(a.usuario.created_at),
          photoUrl: a.usuario.photo_url
        } : usuarioActual,
        comentarioId: a.comentario_id,
        url: a.url,
        urlStorage: a.url_storage,
        nombreArchivo: a.nombre_archivo,
        tipoMime: a.tipo_mime,
        tamaño: a.tamaño,
        fechaCreacion: new Date(a.created_at)
      })));
    }
  };

  const cargarEtiquetasDisponibles = async () => {
    try {
      const { data, error } = await supabase
        .from('etiquetas')
        .select('*')
        .eq('tablero_id', tableroId);

      if (error) throw error;
      setEtiquetasDisponibles(data || []);
    } catch (error) {
      // Error al cargar etiquetas
    }
  };

  const cargarUsuariosDisponibles = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('activo', true);

      if (error) throw error;
      setUsuariosDisponibles(data || []);
    } catch (error) {
      // Error al cargar usuarios
    }
  };

  const handleGuardarTitulo = async () => {
    if (!titulo.trim()) {
      setTitulo(tarjeta.titulo);
      setEditandoTitulo(false);
      return;
    }
    try {
      await onActualizar(tarjeta.id, { titulo: titulo.trim() });
      setEditandoTitulo(false);
    } catch (error) {
      alert('Error al guardar el título');
    }
  };

  const handleGuardarDescripcion = async () => {
    try {
      await onActualizar(tarjeta.id, { descripcion: descripcion.trim() || null });
      setEditandoDescripcion(false);
    } catch (error) {
      alert('Error al guardar la descripción');
    }
  };

  const handleCambiarEstado = async (nuevoEstado: EstadoTarjeta) => {
    try {
      await onActualizar(tarjeta.id, { estado: nuevoEstado });
      setEstado(nuevoEstado);
    } catch (error) {
      alert('Error al actualizar el estado');
    }
  };

  const handleCambiarPrioridad = async (nuevaPrioridad: typeof prioridad) => {
    try {
      await onActualizar(tarjeta.id, { prioridad: nuevaPrioridad });
      setPrioridad(nuevaPrioridad);
    } catch (error) {
      alert('Error al actualizar la prioridad');
    }
  };

  const handleCrearEtiqueta = async () => {
    if (!nuevaEtiqueta.nombre.trim()) return;

    try {
      const { data, error } = await supabase
        .from('etiquetas')
        .insert({
          tablero_id: tableroId,
          nombre: nuevaEtiqueta.nombre,
          color: nuevaEtiqueta.color
        })
        .select()
        .single();

      if (error) throw error;

      if (onAgregarEtiqueta) {
        await onAgregarEtiqueta(tarjeta.id, data.id);
      } else {
        await supabase.from('tarjeta_etiquetas').insert({ tarjeta_id: tarjeta.id, etiqueta_id: data.id });
      }

      const nuevaEtiq = { id: data.id, tableroId: data.tablero_id, nombre: data.nombre, color: data.color };
      setEtiquetas(prev => [...prev, nuevaEtiq]);
      setEtiquetasDisponibles(prev => [...prev, nuevaEtiq]);
      setNuevaEtiqueta({ nombre: '', color: '#ef4444' });
      setMostrandoAgregarEtiqueta(false);
    } catch (error) {
      alert('Error al crear la etiqueta');
    }
  };

  const handleAgregarEtiquetaExistente = async (etiquetaId: string) => {
    try {
      const yaExiste = etiquetas.some(e => e.id === etiquetaId);
      if (yaExiste) {
        if (onQuitarEtiqueta) {
          await onQuitarEtiqueta(tarjeta.id, etiquetaId);
        } else {
          await supabase.from('tarjeta_etiquetas').delete().match({ tarjeta_id: tarjeta.id, etiqueta_id: etiquetaId });
        }
        setEtiquetas(prev => prev.filter(e => e.id !== etiquetaId));
        return;
      }

      if (onAgregarEtiqueta) {
        await onAgregarEtiqueta(tarjeta.id, etiquetaId);
      } else {
        await supabase.from('tarjeta_etiquetas').insert({ tarjeta_id: tarjeta.id, etiqueta_id: etiquetaId });
      }

      const etiqueta = etiquetasDisponibles.find(e => e.id === etiquetaId);
      if (etiqueta) {
        setEtiquetas(prev => [...prev, etiqueta]);
      }
    } catch (error) {
      alert('Error al actualizar la etiqueta');
    }
  };

  const handleQuitarEtiqueta = async (etiquetaId: string) => {
    try {
      if (onQuitarEtiqueta) {
        await onQuitarEtiqueta(tarjeta.id, etiquetaId);
      } else {
        await supabase.from('tarjeta_etiquetas').delete().match({ tarjeta_id: tarjeta.id, etiqueta_id: etiquetaId });
      }
      setEtiquetas(prev => prev.filter(e => e.id !== etiquetaId));
    } catch (error) {
      alert('Error al quitar la etiqueta');
    }
  };

  const handleAgregarChecklistItem = async () => {
    if (!nuevoChecklistItem.trim()) return;

    try {
      const maxOrden = checklistItems.reduce((max, item) => Math.max(max, item.orden), -1);
      const itemTexto = nuevoChecklistItem.trim();

      const { error } = await supabase
        .from('tarjeta_checklist')
        .insert({
          tarjeta_id: tarjeta.id,
          texto: itemTexto,
          completado: false,
          orden: maxOrden + 1
        });

      if (error) throw error;

      setNuevoChecklistItem('');
      setMostrandoAgregarChecklist(false);

      if (onRegistrarActividad) {
        await onRegistrarActividad(
          tarjeta.id,
          usuarioActual.id,
          'checklist_agregado',
          `Agregó item al checklist: "${itemTexto}"`,
          { item_texto: itemTexto }
        );
      }

      await recargarChecklist();
    } catch (error) {
      // Error al agregar item al checklist
      alert('Error al agregar item al checklist');
    }
  };

  const handleToggleChecklistItem = async (itemId: string, completado: boolean) => {
    try {
      const { error } = await supabase
        .from('tarjeta_checklist')
        .update({ completado: !completado })
        .eq('id', itemId);

      if (error) throw error;

      setChecklistItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, completado: !completado } : item
      ));

      if (onRegistrarActividad) {
        await onRegistrarActividad(
          tarjeta.id,
          usuarioActual.id,
          'checklist_completado',
          `${!completado ? 'Completó' : 'Descompletó'} un item del checklist`,
          { item_id: itemId }
        );
      }
    } catch (error) {
      alert('Error al actualizar item del checklist');
    }
  };

  const handleEditarChecklistItem = async (itemId: string) => {
    if (!textoEditandoChecklist.trim()) {
      setEditandoChecklistItem(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('tarjeta_checklist')
        .update({ texto: textoEditandoChecklist.trim() })
        .eq('id', itemId);

      if (error) throw error;

      setChecklistItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, texto: textoEditandoChecklist.trim() } : item
      ));
      setEditandoChecklistItem(null);
      setTextoEditandoChecklist('');
    } catch (error) {
      alert('Error al editar item del checklist');
    }
  };

  const handleEliminarChecklistItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('tarjeta_checklist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setChecklistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      alert('Error al eliminar item del checklist');
    }
  };

  const handleGuardarFecha = async () => {
    try {
      await onActualizar(tarjeta.id, {
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null
      });
      setMostrandoAgregarFecha(false);
      onCerrar();
    } catch (error) {
      alert('Error al guardar la fecha');
    }
  };

  const handleAgregarMiembro = async (usuarioId: string) => {
    try {
      const yaExiste = asignados.some(a => a.id === usuarioId);
      if (yaExiste) {
        alert('Este usuario ya está asignado');
        return;
      }

      const usuario = usuariosDisponibles.find(u => u.id === usuarioId);

      if (onAgregarAsignado) {
        await onAgregarAsignado(tarjeta.id, usuarioId);
      } else {
        const { error: insertError } = await supabase
          .from('tarjeta_asignados')
          .insert({ tarjeta_id: tarjeta.id, usuario_id: usuarioId });

        if (insertError) {
          if (insertError.code === '23505') {
            alert('Este usuario ya está asignado');
          } else {
            alert('Error al agregar miembro');
          }
          return;
        }
      }

      if (usuario) {
        setAsignados(prev => [...prev, usuario]);
      }

      if (onRegistrarActividad && usuario) {
        await onRegistrarActividad(
          tarjeta.id,
          usuarioActual.id,
          'asignacion',
          `Asignó a ${usuario.nombre} ${usuario.apellido}`,
          { usuario_asignado_id: usuarioId, usuario_asignado_nombre: `${usuario.nombre} ${usuario.apellido}` }
        );
      }

      setMostrandoAgregarMiembro(false);
    } catch (error) {
      alert('Error al agregar miembro');
    }
  };

  const handleQuitarMiembro = async (usuarioId: string) => {
    try {
      const usuario = asignados.find(a => a.id === usuarioId);

      if (onQuitarAsignado) {
        await onQuitarAsignado(tarjeta.id, usuarioId);
      } else {
        const { error: deleteError } = await supabase
          .from('tarjeta_asignados')
          .delete()
          .match({ tarjeta_id: tarjeta.id, usuario_id: usuarioId });

        if (deleteError) {
          alert('Error al quitar miembro');
          return;
        }
      }

      setAsignados(prev => prev.filter(a => a.id !== usuarioId));

      if (onRegistrarActividad && usuario) {
        await onRegistrarActividad(
          tarjeta.id,
          usuarioActual.id,
          'asignacion',
          `Quitó a ${usuario.nombre} ${usuario.apellido}`,
          { usuario_removido_id: usuarioId, usuario_removido_nombre: `${usuario.nombre} ${usuario.apellido}` }
        );
      }

      setMostrandoAgregarMiembro(false);
    } catch (error) {
      alert('Error al quitar miembro');
    }
  };

  const checklistItemsFiltrados = checklistItems.filter(item => !ocultarCompletados || !item.completado);

  const handleEliminarTarjeta = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la tarjeta "${tarjeta.titulo}"?`)) {
      try {
        await onEliminar(tarjeta.id);
        onCerrar();
      } catch (error) {
        alert('Error al eliminar la tarjeta');
      }
    }
  };

  const estadoActual = estados.find(e => e.valor === estado);
  const prioridadActual = prioridades.find(p => p.valor === prioridad);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 rounded-t-xl">
          <div className="p-6 flex items-start justify-between">
            <div className="flex-1">
              {editandoTitulo ? (
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  onBlur={handleGuardarTitulo}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuardarTitulo()}
                  className="text-2xl font-bold text-gray-900 border-2 border-blue-500 rounded px-2 py-1 w-full focus:outline-none"
                  autoFocus
                />
              ) : (
                <h2
                  className="text-2xl font-bold text-gray-900 mb-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                  onClick={() => setEditandoTitulo(true)}
                >
                  {tarjeta.titulo}
                </h2>
              )}
              <p className="text-sm text-gray-500">
                Creada por {tarjeta.creadoPor.nombre} {tarjeta.creadoPor.apellido} • {new Date(tarjeta.fechaCreacion).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {usuarioActual.rol === 'administrador' && (
                <button
                  onClick={handleEliminarTarjeta}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Eliminar tarjeta"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onCerrar}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                  <div className="relative group">
                    <button className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${estadoActual?.color} transition-all hover:shadow-md`}>
                      {estadoActual && <estadoActual.icon className="w-4 h-4" />}
                      {estadoActual?.label}
                    </button>
                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[180px]">
                      {estados.map((est) => {
                        const Icon = est.icon;
                        return (
                          <button
                            key={est.valor}
                            onClick={() => handleCambiarEstado(est.valor as EstadoTarjeta)}
                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                              est.valor === estado ? 'font-medium' : ''
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className={`px-2 py-0.5 rounded text-xs ${est.color}`}>
                              {est.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Prioridad:</span>
                  <div className="relative group">
                    <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prioridadActual?.color} transition-all hover:shadow-md`}>
                      {prioridadActual?.label}
                    </button>
                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[150px]">
                      {prioridades.map((pri) => (
                        <button
                          key={pri.valor}
                          onClick={() => handleCambiarPrioridad(pri.valor as any)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                            pri.valor === prioridad ? 'font-medium' : ''
                          }`}
                        >
                          <span className={`px-2 py-0.5 rounded text-xs ${pri.color}`}>
                            {pri.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {tarjeta.fechaInicio && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Inicio: {formatDateTime(tarjeta.fechaInicio)}
                    </span>
                  </div>
                )}

                {tarjeta.fechaVencimiento && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Fin: {formatDateTime(tarjeta.fechaVencimiento)}
                    </span>
                  </div>
                )}

                {tarjeta.duracion && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">
                      {tarjeta.duracion} {tarjeta.duracion === 1 ? 'día' : 'días'}
                    </span>
                  </div>
                )}

                {asignados.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <div className="flex flex-wrap gap-2">
                      {asignados.map(usuario => (
                        <div
                          key={usuario.id}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          {usuario.nombre} {usuario.apellido}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {etiquetas.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Etiquetas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {etiquetas.map(etiqueta => (
                      <div
                        key={etiqueta.id}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                        style={{ backgroundColor: etiqueta.color }}
                      >
                        <span>{etiqueta.nombre}</span>
                        <button
                          onClick={() => handleQuitarEtiqueta(etiqueta.id)}
                          className="opacity-0 group-hover:opacity-100 hover:bg-black/20 rounded p-0.5 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Descripción</h3>
                </div>
                {editandoDescripcion ? (
                  <div>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Añadir una descripción más detallada..."
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleGuardarDescripcion}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setDescripcion(tarjeta.descripcion || '');
                          setEditandoDescripcion(false);
                        }}
                        className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditandoDescripcion(true)}
                    className="min-h-[60px] px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    {tarjeta.descripcion ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{tarjeta.descripcion}</p>
                    ) : (
                      <p className="text-gray-400 italic">Añadir una descripción más detallada...</p>
                    )}
                  </div>
                )}
              </div>

              {checklistTotal > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Checklist</h3>
                      <span className="text-sm text-gray-500">
                        {checklistCompletados}/{checklistTotal}
                      </span>
                    </div>
                    <button
                      onClick={() => setOcultarCompletados(!ocultarCompletados)}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      {ocultarCompletados ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {ocultarCompletados ? 'Mostrar' : 'Ocultar'} completados
                    </button>
                  </div>
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${porcentajeCompletado}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {checklistItemsFiltrados.map(item => (
                      <div key={item.id} className="flex items-center gap-2 group">
                        <input
                          type="checkbox"
                          checked={item.completado}
                          onChange={() => handleToggleChecklistItem(item.id, item.completado)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        {editandoChecklistItem === item.id ? (
                          <input
                            type="text"
                            value={textoEditandoChecklist}
                            onChange={(e) => setTextoEditandoChecklist(e.target.value)}
                            onBlur={() => handleEditarChecklistItem(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditarChecklistItem(item.id);
                              if (e.key === 'Escape') {
                                setEditandoChecklistItem(null);
                                setTextoEditandoChecklist('');
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => {
                              setEditandoChecklistItem(item.id);
                              setTextoEditandoChecklist(item.texto);
                            }}
                            className={`flex-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded ${
                              item.completado ? 'line-through text-gray-400' : 'text-gray-700'
                            }`}
                          >
                            {item.texto}
                          </span>
                        )}
                        <button
                          onClick={() => handleEliminarChecklistItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={nuevoChecklistItem}
                      onChange={(e) => setNuevoChecklistItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAgregarChecklistItem()}
                      placeholder="Añadir un elemento..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAgregarChecklistItem}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {checklistTotal === 0 && !mostrandoAgregarChecklist && (
                <button
                  onClick={() => setMostrandoAgregarChecklist(true)}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckSquare className="w-5 h-5" />
                  Agregar Checklist
                </button>
              )}

              {checklistTotal === 0 && mostrandoAgregarChecklist && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Checklist</h3>
                    </div>
                    <button
                      onClick={() => {
                        setMostrandoAgregarChecklist(false);
                        setNuevoChecklistItem('');
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Agrega elementos a tu checklist para llevar un seguimiento de las tareas.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nuevoChecklistItem}
                      onChange={(e) => setNuevoChecklistItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAgregarChecklistItem()}
                      placeholder="Añadir un elemento..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={handleAgregarChecklistItem}
                      disabled={!nuevoChecklistItem.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors font-medium"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}

              <TarjetaComentariosActividad
                tarjeta={tarjeta}
                usuarioActual={usuarioActual}
                adjuntos={adjuntos}
                onAgregarComentario={onAgregarComentario}
                onSubirAdjunto={onSubirAdjunto}
                onAdjuntoEliminado={recargarAdjuntos}
              />
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Acciones</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setMostrandoAgregarFecha(!mostrandoAgregarFecha)}
                    className="w-full px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    {tarjeta.fechaInicio || tarjeta.fechaVencimiento ? 'Cambiar Fechas' : 'Agregar Fechas'}
                  </button>
                  <button
                    onClick={() => setMostrandoAgregarEtiqueta(!mostrandoAgregarEtiqueta)}
                    className="w-full px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    Etiquetas
                  </button>
                  <button
                    onClick={() => setMostrandoAgregarMiembro(!mostrandoAgregarMiembro)}
                    className="w-full px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Miembros
                  </button>
                  {checklistTotal === 0 && (
                    <button
                      onClick={() => setMostrandoAgregarChecklist(!mostrandoAgregarChecklist)}
                      className="w-full px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Checklist
                    </button>
                  )}
                </div>
              </div>

              {mostrandoAgregarFecha && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Fecha y hora de inicio y fin</h3>
                  <div className="space-y-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Inicio (opcional)</label>
                      <input
                        type="datetime-local"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fin (opcional)</label>
                      <input
                        type="datetime-local"
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGuardarFecha}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setMostrandoAgregarFecha(false)}
                      className="px-3 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {mostrandoAgregarEtiqueta && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Gestionar Etiquetas</h3>

                  {etiquetasDisponibles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Etiquetas disponibles:</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {etiquetasDisponibles.map(etiqueta => {
                          const yaAgregada = etiquetas.some(e => e.id === etiqueta.id);
                          return (
                            <button
                              key={etiqueta.id}
                              onClick={() => !yaAgregada && handleAgregarEtiquetaExistente(etiqueta.id)}
                              disabled={yaAgregada}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                                yaAgregada ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                              }`}
                              style={{ backgroundColor: etiqueta.color }}
                            >
                              {etiqueta.nombre}
                              {yaAgregada && <span className="ml-auto text-xs">(Agregada)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Crear nueva etiqueta:</p>
                    <input
                      type="text"
                      value={nuevaEtiqueta.nombre}
                      onChange={(e) => setNuevaEtiqueta({ ...nuevaEtiqueta, nombre: e.target.value })}
                      placeholder="Nombre de la etiqueta"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {coloresEtiqueta.map(color => (
                        <button
                          key={color.valor}
                          onClick={() => setNuevaEtiqueta({ ...nuevaEtiqueta, color: color.valor })}
                          className={`w-full h-8 rounded ${
                            nuevaEtiqueta.color === color.valor ? 'ring-2 ring-offset-2 ring-gray-800' : ''
                          }`}
                          style={{ backgroundColor: color.valor }}
                          title={color.nombre}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCrearEtiqueta}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Crear
                      </button>
                      <button
                        onClick={() => setMostrandoAgregarEtiqueta(false)}
                        className="px-3 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {mostrandoAgregarMiembro && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Gestionar Miembros</h3>

                  {asignados.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Miembros asignados:</p>
                      <div className="space-y-2">
                        {asignados.map(usuario => (
                          <div key={usuario.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">
                              {usuario.nombre} {usuario.apellido}
                            </span>
                            <button
                              onClick={() => handleQuitarMiembro(usuario.id)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={asignados.length > 0 ? 'border-t border-gray-200 pt-4' : ''}>
                    <p className="text-sm font-medium text-gray-700 mb-2">Agregar miembro:</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {usuariosDisponibles.map(usuario => {
                        const yaAsignado = asignados.some(a => a.id === usuario.id);
                        return (
                          <button
                            key={usuario.id}
                            onClick={() => !yaAsignado && handleAgregarMiembro(usuario.id)}
                            disabled={yaAsignado}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              yaAsignado
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {usuario.nombre} {usuario.apellido}
                            {yaAsignado && <span className="ml-2 text-xs">(Asignado)</span>}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setMostrandoAgregarMiembro(false)}
                      className="w-full mt-3 px-3 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}

              {tarjeta.vinculosNovedades && tarjeta.vinculosNovedades.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Novedades Vinculadas
                  </h3>
                  <div className="space-y-2">
                    {tarjeta.vinculosNovedades.map(vinculo => (
                      <div key={vinculo.id} className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">Novedad #{vinculo.novedadId}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
