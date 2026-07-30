import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Tablero, Lista, Tarjeta, Usuario, Etiqueta, ChecklistItem, EstadoTarjeta } from '../types';

const formatUsuario = (u: any): Usuario => ({
  id: u.id,
  nombre: u.nombre,
  apellido: u.apellido,
  dni: u.dni,
  contraseña: u.contraseña || '',
  rol: u.rol as 'administrador' | 'usuario',
  fechaCreacion: new Date(u.created_at),
  activo: u.activo,
  photoUrl: u.photo_url || undefined
});

export const useTableros = (proyectoActivoId: string | null, usuarioActual: Usuario | null) => {
  const [tableros, setTableros] = useState<Tablero[]>([]);
  const [tableroActivo, setTableroActivo] = useState<Tablero | null>(null);
  const [cargando, setCargando] = useState(true);
  const abortRef = useRef(0);

  useEffect(() => {
    if (usuarioActual && proyectoActivoId) {
      setTableroActivo(null);
      cargarTableros();
    } else {
      setTableros([]);
      setTableroActivo(null);
      setCargando(false);
    }
  }, [usuarioActual?.id, proyectoActivoId]);

  const cargarTableros = async () => {
    if (!usuarioActual || !proyectoActivoId) return;

    try {
      setCargando(true);

      const { data, error } = await supabase
        .from('tableros')
        .select(`
          *,
          proyecto:proyectos(id, nombre, descripcion, estado, activo, created_at, updated_at),
          sector:sectores(id, nombre, descripcion, activo, created_at),
          creado_por:usuarios!tableros_creado_por_id_fkey(id, nombre, apellido, dni, contraseña, rol, activo, created_at, photo_url)
        `)
        .eq('proyecto_id', proyectoActivoId)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tableroIds = data.map(t => t.id);

      if (tableroIds.length === 0) {
        setTableros([]);
        setCargando(false);
        return;
      }

      const { data: listasData, error: listasError } = await supabase
        .from('listas')
        .select('*')
        .in('tablero_id', tableroIds)
        .eq('activo', true)
        .order('orden');

      if (listasError) throw listasError;

      const listas = listasData || [];
      const listaIds = listas.map(l => l.id);

      let tarjetas: any[] = [];
      if (listaIds.length > 0) {
        const { data: tarjetasData } = await supabase
          .from('tarjetas')
          .select(`
            *,
            creado_por:usuarios!tarjetas_creado_por_id_fkey(id, nombre, apellido, dni, contraseña, rol, activo, created_at, photo_url),
            asignado_a:usuarios!tarjetas_asignado_a_id_fkey(id, nombre, apellido, dni, contraseña, rol, activo, created_at, photo_url)
          `)
          .in('lista_id', listaIds)
          .eq('activo', true)
          .order('orden');
        tarjetas = tarjetasData || [];
      }

      const tarjetaIds = tarjetas.map(t => t.id);

      let asignadosData: any[] = [];
      let checklistData: any[] = [];

      if (tarjetaIds.length > 0) {
        const [asignadosRes, checklistRes] = await Promise.all([
          supabase
            .from('tarjeta_asignados')
            .select('tarjeta_id, usuario:usuarios(id, nombre, apellido, dni, contraseña, rol, activo, created_at, photo_url)')
            .in('tarjeta_id', tarjetaIds),
          supabase
            .from('tarjeta_checklist')
            .select('*')
            .in('tarjeta_id', tarjetaIds)
            .order('orden')
        ]);
        asignadosData = asignadosRes.data || [];
        checklistData = checklistRes.data || [];
      }

      const asignadosPorTarjeta: Record<string, Usuario[]> = {};
      asignadosData.forEach(a => {
        if (!asignadosPorTarjeta[a.tarjeta_id]) asignadosPorTarjeta[a.tarjeta_id] = [];
        asignadosPorTarjeta[a.tarjeta_id].push(formatUsuario(a.usuario));
      });

      const checklistPorTarjeta: Record<string, ChecklistItem[]> = {};
      checklistData.forEach(c => {
        if (!checklistPorTarjeta[c.tarjeta_id]) checklistPorTarjeta[c.tarjeta_id] = [];
        checklistPorTarjeta[c.tarjeta_id].push({
          id: c.id,
          tarjetaId: c.tarjeta_id,
          texto: c.texto,
          completado: c.completado,
          orden: c.orden,
          fechaCreacion: new Date(c.created_at)
        });
      });

      const tarjetasPorLista: Record<string, Tarjeta[]> = {};
      tarjetas.forEach(tarjeta => {
        if (!tarjetasPorLista[tarjeta.lista_id]) tarjetasPorLista[tarjeta.lista_id] = [];
        tarjetasPorLista[tarjeta.lista_id].push({
          id: tarjeta.id,
          listaId: tarjeta.lista_id,
          titulo: tarjeta.titulo,
          descripcion: tarjeta.descripcion || undefined,
          orden: tarjeta.orden,
          prioridad: tarjeta.prioridad as 'baja' | 'media' | 'alta' | 'critica',
          estado: tarjeta.estado || 'pendiente',
          fechaInicio: tarjeta.fecha_inicio ? new Date(tarjeta.fecha_inicio) : undefined,
          fechaVencimiento: tarjeta.fecha_vencimiento ? new Date(tarjeta.fecha_vencimiento) : undefined,
          duracion: tarjeta.duracion || undefined,
          creadoPor: formatUsuario(tarjeta.creado_por),
          asignadoA: tarjeta.asignado_a ? formatUsuario(tarjeta.asignado_a) : undefined,
          asignados: asignadosPorTarjeta[tarjeta.id] || [],
          checklist: checklistPorTarjeta[tarjeta.id] || [],
          etiquetas: [],
          comentarios: [],
          actividad: [],
          adjuntos: [],
          activo: tarjeta.activo,
          fechaCreacion: new Date(tarjeta.created_at),
          fechaActualizacion: new Date(tarjeta.updated_at)
        });
      });

      const listasPorTablero: Record<string, Lista[]> = {};
      listas.forEach(lista => {
        if (!listasPorTablero[lista.tablero_id]) listasPorTablero[lista.tablero_id] = [];
        listasPorTablero[lista.tablero_id].push({
          id: lista.id,
          tableroId: lista.tablero_id,
          nombre: lista.nombre,
          orden: lista.orden,
          activo: lista.activo,
          fechaCreacion: new Date(lista.created_at),
          tarjetas: tarjetasPorLista[lista.id] || []
        });
      });

      const tablerosFormateados: Tablero[] = data.map(t => ({
        id: t.id,
        nombre: t.nombre,
        descripcion: t.descripcion || undefined,
        proyecto: {
          id: t.proyecto.id,
          nombre: t.proyecto.nombre,
          descripcion: t.proyecto.descripcion || undefined,
          estado: t.proyecto.estado as 'activo' | 'finalizado',
          activo: t.proyecto.activo,
          fechaCreacion: new Date(t.proyecto.created_at),
          fechaActualizacion: new Date(t.proyecto.updated_at)
        },
        sector: t.sector ? {
          id: t.sector.id,
          nombre: t.sector.nombre,
          descripcion: t.sector.descripcion || undefined,
          activo: t.sector.activo,
          fechaCreacion: new Date(t.sector.created_at)
        } : undefined,
        estado: t.estado as 'activo' | 'archivado',
        color: t.color,
        creadoPor: formatUsuario(t.creado_por),
        activo: t.activo,
        fechaCreacion: new Date(t.created_at),
        fechaActualizacion: new Date(t.updated_at),
        listas: listasPorTablero[t.id] || []
      }));

      const tablerosFiltrados = tablerosFormateados.filter(tablero => {
        if (!tablero.sector) return true;
        if (!usuarioActual.sectores || usuarioActual.sectores.length === 0) return false;
        return usuarioActual.sectores.some(s => s.id === tablero.sector!.id);
      });

      setTableros(tablerosFiltrados);
    } catch (error) {
      setTableros([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarTableroCompleto = useCallback(async (tableroId: string) => {
    const requestId = ++abortRef.current;

    try {
      const { data: tableroData, error: tableroError } = await supabase
        .from('tableros')
        .select(`
          *,
          proyecto:proyectos(*),
          sector:sectores(*),
          creado_por:usuarios!tableros_creado_por_id_fkey(*)
        `)
        .eq('id', tableroId)
        .maybeSingle();

      if (requestId !== abortRef.current) return;
      if (tableroError) throw tableroError;
      if (!tableroData) throw new Error('Tablero no encontrado');

      const { data: listasData, error: listasError } = await supabase
        .from('listas')
        .select('*')
        .eq('tablero_id', tableroId)
        .eq('activo', true)
        .order('orden');

      if (requestId !== abortRef.current) return;
      if (listasError) throw listasError;

      const listaIds = (listasData || []).map(l => l.id);

      let tarjetas: any[] = [];
      if (listaIds.length > 0) {
        const { data: tarjetasData, error: tarjetasError } = await supabase
          .from('tarjetas')
          .select(`
            *,
            creado_por:usuarios!tarjetas_creado_por_id_fkey(*),
            asignado_a:usuarios!tarjetas_asignado_a_id_fkey(*)
          `)
          .in('lista_id', listaIds)
          .eq('activo', true)
          .order('orden');

        if (requestId !== abortRef.current) return;
        if (tarjetasError) throw tarjetasError;
        tarjetas = tarjetasData || [];
      }

      const tarjetaIds = tarjetas.map(t => t.id);

      let asignadosData: any[] = [];
      let etiquetasData: any[] = [];
      let checklistData: any[] = [];
      let comentariosData: any[] = [];
      let actividadData: any[] = [];
      let adjuntosData: any[] = [];

      if (tarjetaIds.length > 0) {
        const [asignadosRes, etiquetasRes, checklistRes, comentariosRes, actividadRes, adjuntosRes] = await Promise.all([
          supabase
            .from('tarjeta_asignados')
            .select('tarjeta_id, usuario:usuarios(*)')
            .in('tarjeta_id', tarjetaIds),
          supabase
            .from('tarjeta_etiquetas')
            .select('tarjeta_id, etiqueta:etiquetas(*)')
            .in('tarjeta_id', tarjetaIds),
          supabase
            .from('tarjeta_checklist')
            .select('*')
            .in('tarjeta_id', tarjetaIds)
            .order('orden'),
          supabase
            .from('tarjeta_comentarios')
            .select('*, usuario:usuarios(*)')
            .in('tarjeta_id', tarjetaIds)
            .order('created_at'),
          supabase
            .from('tarjeta_actividad')
            .select('*, usuario:usuarios(*)')
            .in('tarjeta_id', tarjetaIds)
            .order('created_at', { ascending: false }),
          supabase
            .from('tarjeta_adjuntos')
            .select('*, usuario:usuarios(*)')
            .in('tarjeta_id', tarjetaIds)
            .order('created_at', { ascending: false })
        ]);

        if (requestId !== abortRef.current) return;

        asignadosData = asignadosRes.data || [];
        etiquetasData = etiquetasRes.data || [];
        checklistData = checklistRes.data || [];
        comentariosData = comentariosRes.data || [];
        actividadData = actividadRes.data || [];
        adjuntosData = adjuntosRes.data || [];
      }

      const asignadosPorTarjeta: Record<string, Usuario[]> = {};
      asignadosData.forEach(a => {
        if (!asignadosPorTarjeta[a.tarjeta_id]) asignadosPorTarjeta[a.tarjeta_id] = [];
        asignadosPorTarjeta[a.tarjeta_id].push(formatUsuario(a.usuario));
      });

      const etiquetasPorTarjeta: Record<string, Etiqueta[]> = {};
      etiquetasData.forEach(e => {
        if (!etiquetasPorTarjeta[e.tarjeta_id]) etiquetasPorTarjeta[e.tarjeta_id] = [];
        etiquetasPorTarjeta[e.tarjeta_id].push({
          id: e.etiqueta.id,
          tableroId: e.etiqueta.tablero_id,
          nombre: e.etiqueta.nombre,
          color: e.etiqueta.color,
          fechaCreacion: new Date(e.etiqueta.created_at)
        });
      });

      const checklistPorTarjeta: Record<string, ChecklistItem[]> = {};
      checklistData.forEach(c => {
        if (!checklistPorTarjeta[c.tarjeta_id]) checklistPorTarjeta[c.tarjeta_id] = [];
        checklistPorTarjeta[c.tarjeta_id].push({
          id: c.id,
          tarjetaId: c.tarjeta_id,
          texto: c.texto,
          completado: c.completado,
          orden: c.orden,
          fechaCreacion: new Date(c.created_at)
        });
      });

      const comentariosPorTarjeta: Record<string, any[]> = {};
      comentariosData.forEach(c => {
        if (!comentariosPorTarjeta[c.tarjeta_id]) comentariosPorTarjeta[c.tarjeta_id] = [];
        comentariosPorTarjeta[c.tarjeta_id].push({
          id: c.id,
          tarjetaId: c.tarjeta_id,
          usuario: formatUsuario(c.usuario),
          texto: c.texto,
          fechaCreacion: new Date(c.created_at),
          fechaActualizacion: new Date(c.updated_at)
        });
      });

      const actividadPorTarjeta: Record<string, any[]> = {};
      actividadData.forEach(a => {
        if (!actividadPorTarjeta[a.tarjeta_id]) actividadPorTarjeta[a.tarjeta_id] = [];
        actividadPorTarjeta[a.tarjeta_id].push({
          id: a.id,
          tarjetaId: a.tarjeta_id,
          usuario: formatUsuario(a.usuario),
          tipo: a.tipo,
          descripcion: a.descripcion,
          metadata: a.metadata,
          fechaCreacion: new Date(a.created_at)
        });
      });

      const adjuntosPorTarjeta: Record<string, any[]> = {};
      adjuntosData.forEach(adj => {
        if (!adjuntosPorTarjeta[adj.tarjeta_id]) adjuntosPorTarjeta[adj.tarjeta_id] = [];
        adjuntosPorTarjeta[adj.tarjeta_id].push({
          id: adj.id,
          tarjetaId: adj.tarjeta_id,
          usuario: formatUsuario(adj.usuario),
          comentarioId: adj.comentario_id || undefined,
          url: adj.url,
          urlStorage: adj.url_storage,
          nombreArchivo: adj.nombre_archivo,
          tipoMime: adj.tipo_mime,
          tamaño: adj.tamaño,
          fechaCreacion: new Date(adj.created_at)
        });
      });

      const listasConTarjetas: Lista[] = (listasData || []).map(lista => ({
        id: lista.id,
        tableroId: lista.tablero_id,
        nombre: lista.nombre,
        orden: lista.orden,
        activo: lista.activo,
        fechaCreacion: new Date(lista.created_at),
        tarjetas: tarjetas
          .filter(t => t.lista_id === lista.id)
          .map(tarjeta => ({
            id: tarjeta.id,
            listaId: tarjeta.lista_id,
            titulo: tarjeta.titulo,
            descripcion: tarjeta.descripcion || undefined,
            orden: tarjeta.orden,
            prioridad: tarjeta.prioridad as 'baja' | 'media' | 'alta' | 'critica',
            estado: (tarjeta.estado as EstadoTarjeta) || 'pendiente',
            fechaInicio: tarjeta.fecha_inicio ? new Date(tarjeta.fecha_inicio) : undefined,
            fechaVencimiento: tarjeta.fecha_vencimiento ? new Date(tarjeta.fecha_vencimiento) : undefined,
            duracion: tarjeta.duracion || undefined,
            creadoPor: formatUsuario(tarjeta.creado_por),
            asignadoA: tarjeta.asignado_a ? formatUsuario(tarjeta.asignado_a) : undefined,
            asignados: asignadosPorTarjeta[tarjeta.id] || [],
            comentarios: comentariosPorTarjeta[tarjeta.id] || [],
            actividad: actividadPorTarjeta[tarjeta.id] || [],
            adjuntos: adjuntosPorTarjeta[tarjeta.id] || [],
            etiquetas: etiquetasPorTarjeta[tarjeta.id] || [],
            checklist: checklistPorTarjeta[tarjeta.id] || [],
            activo: tarjeta.activo,
            fechaCreacion: new Date(tarjeta.created_at),
            fechaActualizacion: new Date(tarjeta.updated_at)
          }))
      }));

      const tableroCompleto: Tablero = {
        id: tableroData.id,
        nombre: tableroData.nombre,
        descripcion: tableroData.descripcion || undefined,
        proyecto: {
          id: tableroData.proyecto.id,
          nombre: tableroData.proyecto.nombre,
          descripcion: tableroData.proyecto.descripcion || undefined,
          estado: tableroData.proyecto.estado as 'activo' | 'finalizado',
          activo: tableroData.proyecto.activo,
          fechaCreacion: new Date(tableroData.proyecto.created_at),
          fechaActualizacion: new Date(tableroData.proyecto.updated_at)
        },
        sector: tableroData.sector ? {
          id: tableroData.sector.id,
          nombre: tableroData.sector.nombre,
          descripcion: tableroData.sector.descripcion || undefined,
          activo: tableroData.sector.activo,
          fechaCreacion: new Date(tableroData.sector.created_at)
        } : undefined,
        estado: tableroData.estado as 'activo' | 'archivado',
        color: tableroData.color,
        creadoPor: formatUsuario(tableroData.creado_por),
        activo: tableroData.activo,
        fechaCreacion: new Date(tableroData.created_at),
        fechaActualizacion: new Date(tableroData.updated_at),
        listas: listasConTarjetas
      };

      setTableroActivo(tableroCompleto);
      return tableroCompleto;
    } catch (error) {
      if (requestId === abortRef.current) {
        throw error;
      }
    }
  }, []);

  const crearTablero = async (datos: {
    nombre: string;
    descripcion?: string;
    proyectoId: string;
    sectorId?: string;
    color?: string;
    creadoPorId: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('tableros')
        .insert({
          nombre: datos.nombre,
          descripcion: datos.descripcion || null,
          proyecto_id: datos.proyectoId,
          sector_id: datos.sectorId || null,
          color: datos.color || '#3b82f6',
          creado_por_id: datos.creadoPorId
        })
        .select(`
          *,
          proyecto:proyectos(*),
          sector:sectores(*),
          creado_por:usuarios!tableros_creado_por_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      const nuevoTablero: Tablero = {
        id: data.id,
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        proyecto: {
          id: data.proyecto.id,
          nombre: data.proyecto.nombre,
          descripcion: data.proyecto.descripcion || undefined,
          estado: data.proyecto.estado as 'activo' | 'finalizado',
          activo: data.proyecto.activo,
          fechaCreacion: new Date(data.proyecto.created_at),
          fechaActualizacion: new Date(data.proyecto.updated_at)
        },
        sector: data.sector ? {
          id: data.sector.id,
          nombre: data.sector.nombre,
          descripcion: data.sector.descripcion || undefined,
          activo: data.sector.activo,
          fechaCreacion: new Date(data.sector.created_at)
        } : undefined,
        estado: data.estado as 'activo' | 'archivado',
        color: data.color,
        creadoPor: formatUsuario(data.creado_por),
        activo: data.activo,
        fechaCreacion: new Date(data.created_at),
        fechaActualizacion: new Date(data.updated_at)
      };

      setTableros(prev => [nuevoTablero, ...prev]);
      return nuevoTablero;
    } catch (error) {
      throw error;
    }
  };

  const crearLista = async (tableroId: string, nombre: string) => {
    try {
      const ultimaLista = tableroActivo?.listas?.reduce((max, lista) =>
        lista.orden > max ? lista.orden : max, -1) ?? -1;

      const { data, error } = await supabase
        .from('listas')
        .insert({
          tablero_id: tableroId,
          nombre: nombre,
          orden: ultimaLista + 1
        })
        .select()
        .single();

      if (error) throw error;

      const nuevaLista: Lista = {
        id: data.id,
        tableroId: data.tablero_id,
        nombre: data.nombre,
        orden: data.orden,
        activo: data.activo,
        fechaCreacion: new Date(data.created_at),
        tarjetas: []
      };

      if (tableroActivo) {
        setTableroActivo({
          ...tableroActivo,
          listas: [...(tableroActivo.listas || []), nuevaLista]
        });
      }

      return nuevaLista;
    } catch (error) {
      throw error;
    }
  };

  const actualizarTablero = async (tableroId: string, datos: {
    nombre: string;
    descripcion?: string;
    sectorId?: string;
    color?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('tableros')
        .update({
          nombre: datos.nombre,
          descripcion: datos.descripcion || null,
          sector_id: datos.sectorId || null,
          color: datos.color
        })
        .eq('id', tableroId);

      if (error) throw error;

      await cargarTableros();

      if (tableroActivo?.id === tableroId) {
        await cargarTableroCompleto(tableroId);
      }
    } catch (error) {
      throw error;
    }
  };

  const actualizarLista = async (listaId: string, nombre: string) => {
    try {
      const { error } = await supabase
        .from('listas')
        .update({ nombre })
        .eq('id', listaId);

      if (error) throw error;

      if (tableroActivo) {
        setTableroActivo({
          ...tableroActivo,
          listas: tableroActivo.listas?.map(l =>
            l.id === listaId ? { ...l, nombre } : l
          )
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const crearTarjeta = async (datos: {
    listaId: string;
    titulo: string;
    descripcion?: string;
    prioridad?: 'baja' | 'media' | 'alta' | 'critica';
    fechaInicio?: Date;
    fechaVencimiento?: Date;
    creadoPorId: string;
    asignadosIds?: string[];
  }) => {
    try {
      const lista = tableroActivo?.listas?.find(l => l.id === datos.listaId);
      const ultimaTarjeta = lista?.tarjetas?.reduce((max, tarjeta) =>
        tarjeta.orden > max ? tarjeta.orden : max, -1) ?? -1;

      const { data, error } = await supabase
        .from('tarjetas')
        .insert({
          lista_id: datos.listaId,
          titulo: datos.titulo,
          descripcion: datos.descripcion || null,
          orden: ultimaTarjeta + 1,
          prioridad: datos.prioridad || 'media',
          fecha_inicio: datos.fechaInicio ? datos.fechaInicio.toISOString() : null,
          fecha_vencimiento: datos.fechaVencimiento ? datos.fechaVencimiento.toISOString() : null,
          creado_por_id: datos.creadoPorId,
          asignado_a_id: null
        })
        .select(`
          *,
          creado_por:usuarios!tarjetas_creado_por_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      if (datos.asignadosIds && datos.asignadosIds.length > 0) {
        const asignaciones = datos.asignadosIds.map(usuarioId => ({
          tarjeta_id: data.id,
          usuario_id: usuarioId
        }));

        await supabase
          .from('tarjeta_asignados')
          .insert(asignaciones);
      }

      const nuevaTarjeta: Tarjeta = {
        id: data.id,
        listaId: data.lista_id,
        titulo: data.titulo,
        descripcion: data.descripcion || undefined,
        orden: data.orden,
        prioridad: (data.prioridad as 'baja' | 'media' | 'alta' | 'critica') || 'media',
        estado: (data.estado as EstadoTarjeta) || 'pendiente',
        fechaInicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
        fechaVencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : undefined,
        duracion: data.duracion || undefined,
        creadoPor: formatUsuario(data.creado_por),
        asignadoA: undefined,
        asignados: [],
        checklist: [],
        etiquetas: [],
        comentarios: [],
        actividad: [],
        adjuntos: [],
        activo: data.activo,
        fechaCreacion: new Date(data.created_at),
        fechaActualizacion: new Date(data.updated_at)
      };

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista =>
              lista.id === datos.listaId
                ? { ...lista, tarjetas: [...(lista.tarjetas || []), nuevaTarjeta] }
                : lista
            )
          };
        });
      }

      setTableros(prev => prev.map(t => {
        const lista = t.listas?.find(l => l.id === datos.listaId);
        if (!lista) return t;
        return {
          ...t,
          listas: t.listas?.map(l =>
            l.id === datos.listaId
              ? { ...l, tarjetas: [...(l.tarjetas || []), nuevaTarjeta] }
              : l
          )
        };
      }));

      return data;
    } catch (error) {
      throw error;
    }
  };

  const moverTarjeta = async (tarjetaId: string, nuevaListaId: string, nuevoOrden: number) => {
    if (!usuarioActual) return;

    const tarjetaActual = tableroActivo?.listas
      ?.flatMap(l => l.tarjetas || [])
      .find(t => t.id === tarjetaId);
    const listaOrigen = tableroActivo?.listas?.find(l => l.tarjetas?.some(t => t.id === tarjetaId));
    const listaDestino = tableroActivo?.listas?.find(l => l.id === nuevaListaId);

    if (tableroActivo && tarjetaActual && listaOrigen) {
      const nuevasListas = tableroActivo.listas?.map(lista => {
        let tarjetas = [...(lista.tarjetas || [])];
        tarjetas = tarjetas.filter(t => t.id !== tarjetaId);
        if (lista.id === nuevaListaId) {
          tarjetas.push({ ...tarjetaActual, listaId: nuevaListaId, orden: nuevoOrden });
          tarjetas.sort((a, b) => a.orden - b.orden);
        }
        return { ...lista, tarjetas };
      });
      setTableroActivo({ ...tableroActivo, listas: nuevasListas });
    }

    try {
      const { error } = await supabase
        .from('tarjetas')
        .update({ lista_id: nuevaListaId, orden: nuevoOrden })
        .eq('id', tarjetaId);

      if (error) throw error;

      if (listaOrigen && listaDestino && tarjetaActual) {
        const esMismaLista = listaOrigen.id === listaDestino.id;
        const descripcion = esMismaLista
          ? `Cambio el orden de la tarjeta en ${listaOrigen.nombre}`
          : `Movio la tarjeta de ${listaOrigen.nombre} a ${listaDestino.nombre}`;

        await registrarActividad(
          tarjetaId,
          usuarioActual.id,
          'movimiento',
          descripcion,
          { lista_origen: listaOrigen.nombre, lista_destino: listaDestino.nombre, orden_nuevo: nuevoOrden }
        );
      }
    } catch (error) {
      if (tableroActivo) {
        await cargarTableroCompleto(tableroActivo.id);
      }
      throw error;
    }
  };

  const actualizarTarjeta = async (tarjetaId: string, datos: Partial<{
    titulo: string;
    descripcion: string;
    prioridad: 'baja' | 'media' | 'alta' | 'critica';
    estado: EstadoTarjeta;
    fechaVencimiento: Date | null;
    fechaInicio: Date | null;
    duracion: number | null;
  }>) => {
    try {
      const updateData: any = {};
      if (datos.titulo !== undefined) updateData.titulo = datos.titulo;
      if (datos.descripcion !== undefined) updateData.descripcion = datos.descripcion || null;
      if (datos.prioridad !== undefined) updateData.prioridad = datos.prioridad;
      if (datos.estado !== undefined) updateData.estado = datos.estado;
      if (datos.fechaInicio !== undefined) {
        updateData.fecha_inicio = datos.fechaInicio ? datos.fechaInicio.toISOString() : null;
      }
      if (datos.fechaVencimiento !== undefined) {
        updateData.fecha_vencimiento = datos.fechaVencimiento ? datos.fechaVencimiento.toISOString() : null;
      }
      if (datos.duracion !== undefined) {
        updateData.duracion = datos.duracion || null;
      }

      const { error } = await supabase
        .from('tarjetas')
        .update(updateData)
        .eq('id', tarjetaId);

      if (error) throw error;

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t =>
                t.id === tarjetaId ? {
                  ...t,
                  ...(datos.titulo !== undefined && { titulo: datos.titulo }),
                  ...(datos.descripcion !== undefined && { descripcion: datos.descripcion || undefined }),
                  ...(datos.prioridad !== undefined && { prioridad: datos.prioridad }),
                  ...(datos.estado !== undefined && { estado: datos.estado }),
                  ...(datos.fechaInicio !== undefined && { fechaInicio: datos.fechaInicio ? new Date(datos.fechaInicio) : undefined }),
                  ...(datos.fechaVencimiento !== undefined && { fechaVencimiento: datos.fechaVencimiento ? new Date(datos.fechaVencimiento) : undefined }),
                  ...(datos.duracion !== undefined && { duracion: datos.duracion || undefined }),
                } : t
              )
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const eliminarTarjeta = async (tarjetaId: string) => {
    try {
      const { error } = await supabase
        .from('tarjetas')
        .update({ activo: false })
        .eq('id', tarjetaId);

      if (error) throw error;

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.filter(t => t.id !== tarjetaId)
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const agregarAsignado = async (tarjetaId: string, usuarioId: string) => {
    try {
      const { error } = await supabase
        .from('tarjeta_asignados')
        .insert({ tarjeta_id: tarjetaId, usuario_id: usuarioId });

      if (error) throw error;

      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioId)
        .maybeSingle();

      if (usuarioData && tableroActivo) {
        const nuevoUsuario = formatUsuario(usuarioData);
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t =>
                t.id === tarjetaId
                  ? { ...t, asignados: [...(t.asignados || []), nuevoUsuario] }
                  : t
              )
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const eliminarAsignado = async (tarjetaId: string, usuarioId: string) => {
    try {
      const { error } = await supabase
        .from('tarjeta_asignados')
        .delete()
        .eq('tarjeta_id', tarjetaId)
        .eq('usuario_id', usuarioId);

      if (error) throw error;

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t =>
                t.id === tarjetaId
                  ? { ...t, asignados: (t.asignados || []).filter(u => u.id !== usuarioId) }
                  : t
              )
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const crearEtiqueta = async (tableroId: string, nombre: string, color: string) => {
    try {
      const { data, error } = await supabase
        .from('etiquetas')
        .insert({ tablero_id: tableroId, nombre, color })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        tableroId: data.tablero_id,
        nombre: data.nombre,
        color: data.color,
        fechaCreacion: new Date(data.created_at)
      } as Etiqueta;
    } catch (error) {
      throw error;
    }
  };

  const agregarEtiquetaATarjeta = async (tarjetaId: string, etiquetaId: string) => {
    try {
      const { error } = await supabase
        .from('tarjeta_etiquetas')
        .insert({ tarjeta_id: tarjetaId, etiqueta_id: etiquetaId });

      if (error) throw error;

      const { data: etiquetaData } = await supabase
        .from('etiquetas')
        .select('*')
        .eq('id', etiquetaId)
        .maybeSingle();

      if (etiquetaData && tableroActivo) {
        const nuevaEtiqueta: Etiqueta = {
          id: etiquetaData.id,
          tableroId: etiquetaData.tablero_id,
          nombre: etiquetaData.nombre,
          color: etiquetaData.color,
          fechaCreacion: new Date(etiquetaData.created_at)
        };

        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t =>
                t.id === tarjetaId
                  ? { ...t, etiquetas: [...(t.etiquetas || []), nuevaEtiqueta] }
                  : t
              )
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const eliminarEtiquetaDeTarjeta = async (tarjetaId: string, etiquetaId: string) => {
    try {
      const { error } = await supabase
        .from('tarjeta_etiquetas')
        .delete()
        .eq('tarjeta_id', tarjetaId)
        .eq('etiqueta_id', etiquetaId);

      if (error) throw error;

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t =>
                t.id === tarjetaId
                  ? { ...t, etiquetas: (t.etiquetas || []).filter(e => e.id !== etiquetaId) }
                  : t
              )
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const agregarChecklistItem = async (tarjetaId: string, texto: string) => {
    try {
      const tarjeta = tableroActivo?.listas
        ?.flatMap(l => l.tarjetas || [])
        .find(t => t.id === tarjetaId);

      const ultimoOrden = tarjeta?.checklist?.reduce((max, item) =>
        item.orden > max ? item.orden : max, -1) ?? -1;

      const { data, error } = await supabase
        .from('tarjeta_checklist')
        .insert({ tarjeta_id: tarjetaId, texto, orden: ultimoOrden + 1 })
        .select()
        .single();

      if (error) throw error;

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t =>
                t.id === tarjetaId ? {
                  ...t,
                  checklist: [...(t.checklist || []), {
                    id: data.id,
                    tarjetaId: data.tarjeta_id,
                    texto: data.texto,
                    completado: data.completado,
                    orden: data.orden,
                    fechaCreacion: new Date(data.created_at)
                  }]
                } : t
              )
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const actualizarChecklistItem = async (itemId: string, completado: boolean) => {
    try {
      const { error } = await supabase
        .from('tarjeta_checklist')
        .update({ completado })
        .eq('id', itemId);

      if (error) throw error;

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t => ({
                ...t,
                checklist: t.checklist?.map(c =>
                  c.id === itemId ? { ...c, completado } : c
                )
              }))
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const eliminarChecklistItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('tarjeta_checklist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t => ({
                ...t,
                checklist: t.checklist?.filter(c => c.id !== itemId)
              }))
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const cargarEtiquetasDelTablero = async (tableroId: string) => {
    try {
      const { data, error } = await supabase
        .from('etiquetas')
        .select('*')
        .eq('tablero_id', tableroId);

      if (error) throw error;

      return data.map(e => ({
        id: e.id,
        tableroId: e.tablero_id,
        nombre: e.nombre,
        color: e.color,
        fechaCreacion: new Date(e.created_at)
      })) as Etiqueta[];
    } catch (error) {
      throw error;
    }
  };

  const agregarComentario = async (tarjetaId: string, texto: string) => {
    if (!usuarioActual) throw new Error('Usuario no autenticado');

    try {
      const { data, error } = await supabase
        .from('tarjeta_comentarios')
        .insert({ tarjeta_id: tarjetaId, usuario_id: usuarioActual.id, texto })
        .select()
        .single();

      if (error) throw error;

      if (tableroActivo && data) {
        const nuevoComentario = {
          id: data.id,
          tarjetaId: data.tarjeta_id,
          usuario: usuarioActual,
          texto: data.texto,
          fechaCreacion: new Date(data.created_at),
          fechaActualizacion: new Date(data.updated_at)
        };

        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t =>
                t.id === tarjetaId
                  ? { ...t, comentarios: [...(t.comentarios || []), nuevoComentario] }
                  : t
              )
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const registrarActividad = async (
    tarjetaId: string,
    usuarioId: string,
    tipo: string,
    descripcion: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { error } = await supabase
        .from('tarjeta_actividad')
        .insert({
          tarjeta_id: tarjetaId,
          usuario_id: usuarioId,
          tipo,
          descripcion,
          metadata: metadata || {}
        });

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const subirAdjunto = async (
    tarjetaId: string,
    archivo: File,
    comentarioId?: string
  ) => {
    if (!usuarioActual) throw new Error('Usuario no autenticado');

    try {
      const extension = archivo.name.split('.').pop();
      const nombreArchivo = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
      const rutaStorage = `tarjeta-adjuntos/${tarjetaId}/${nombreArchivo}`;

      const { error: uploadError } = await supabase.storage
        .from('tarjetas')
        .upload(rutaStorage, archivo);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tarjetas')
        .getPublicUrl(rutaStorage);

      const { data: adjuntoData, error: dbError } = await supabase
        .from('tarjeta_adjuntos')
        .insert({
          tarjeta_id: tarjetaId,
          usuario_id: usuarioActual.id,
          comentario_id: comentarioId || null,
          nombre_archivo: archivo.name,
          url: publicUrl,
          url_storage: rutaStorage,
          tipo_mime: archivo.type,
          tamaño: archivo.size
        })
        .select()
        .single();

      if (dbError) throw dbError;

      if (tableroActivo && adjuntoData) {
        const nuevoAdjunto = {
          id: adjuntoData.id,
          tarjetaId: adjuntoData.tarjeta_id,
          usuario: usuarioActual,
          comentarioId: adjuntoData.comentario_id || undefined,
          url: adjuntoData.url,
          urlStorage: adjuntoData.url_storage,
          nombreArchivo: adjuntoData.nombre_archivo,
          tipoMime: adjuntoData.tipo_mime,
          tamaño: adjuntoData.tamaño,
          fechaCreacion: new Date(adjuntoData.created_at)
        };

        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t =>
                t.id === tarjetaId
                  ? { ...t, adjuntos: [nuevoAdjunto, ...(t.adjuntos || [])] }
                  : t
              )
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const eliminarAdjunto = async (adjuntoId: string, urlStorage: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('tarjetas')
        .remove([urlStorage]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('tarjeta_adjuntos')
        .delete()
        .eq('id', adjuntoId);

      if (dbError) throw dbError;

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.map(lista => ({
              ...lista,
              tarjetas: lista.tarjetas?.map(t => ({
                ...t,
                adjuntos: (t.adjuntos || []).filter(a => a.id !== adjuntoId)
              }))
            }))
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const vincularNovedad = async (tarjetaId: string, novedadId: string, usuarioId: string) => {
    try {
      const { error } = await supabase
        .from('novedad_tarjetas')
        .insert({ tarjeta_id: tarjetaId, novedad_id: novedadId, creado_por_id: usuarioId });

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const desvincularNovedad = async (tarjetaId: string, novedadId: string) => {
    try {
      const { error } = await supabase
        .from('novedad_tarjetas')
        .delete()
        .eq('tarjeta_id', tarjetaId)
        .eq('novedad_id', novedadId);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const eliminarLista = async (listaId: string) => {
    try {
      const { error } = await supabase
        .from('listas')
        .update({ activo: false })
        .eq('id', listaId);

      if (error) throw error;

      if (tableroActivo) {
        setTableroActivo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            listas: prev.listas?.filter(l => l.id !== listaId)
          };
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const eliminarTablero = async (tableroId: string) => {
    try {
      const { error } = await supabase
        .from('tableros')
        .update({ activo: false })
        .eq('id', tableroId);

      if (error) throw error;

      await cargarTableros();
      if (tableroActivo?.id === tableroId) {
        setTableroActivo(null);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    tableros,
    tableroActivo,
    cargando,
    cargarTableros,
    cargarTableroCompleto,
    setTableroActivo,
    crearTablero,
    actualizarTablero,
    crearLista,
    actualizarLista,
    crearTarjeta,
    moverTarjeta,
    actualizarTarjeta,
    eliminarTarjeta,
    eliminarLista,
    eliminarTablero,
    agregarAsignado,
    eliminarAsignado,
    crearEtiqueta,
    agregarEtiquetaATarjeta,
    eliminarEtiquetaDeTarjeta,
    agregarChecklistItem,
    actualizarChecklistItem,
    eliminarChecklistItem,
    cargarEtiquetasDelTablero,
    agregarComentario,
    registrarActividad,
    subirAdjunto,
    eliminarAdjunto,
    vincularNovedad,
    desvincularNovedad
  };
};
