import { useState, useEffect } from 'react';
import { Novedad, Comentario, Lectura, Turno, Usuario, Sector, ComentarioLectura, Foto, Proyecto } from '../types';
import { supabase } from '../lib/supabase';
import { uploadPhoto } from '../utils/photoUpload';

export const useNovedades = (proyectoActivoId?: string | null, usuarioActual?: Usuario | null) => {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (usuarioActual) {
      cargarNovedades();
    } else {
      setNovedades([]);
      setCargando(false);
    }
  }, [usuarioActual, proyectoActivoId]);

  const cargarNovedades = async () => {
    if (!usuarioActual) return;

    if (!proyectoActivoId) {
      setNovedades([]);
      setCargando(false);
      return;
    }

    try {
      setCargando(true);

      const sectoresUsuario = usuarioActual.sectores || [];
      const sectoresIds = sectoresUsuario.map(s => s.id);

      let query = supabase
        .from('novedades')
        .select(`
          *,
          creado_por:usuarios!novedades_creado_por_id_fkey(
            id,
            nombre,
            apellido,
            dni,
            contraseña,
            rol,
            activo,
            created_at
          ),
          sector:sectores(
            id,
            nombre,
            descripcion,
            activo,
            created_at
          ),
          proyecto:proyectos(
            id,
            nombre,
            descripcion,
            estado,
            activo,
            created_at,
            updated_at
          ),
          lecturas(
            id,
            usuario_id,
            fecha_lectura,
            created_at,
            usuario:usuarios(
              id,
              nombre,
              apellido,
              dni,
              contraseña,
              rol,
              activo,
              created_at
            )
          ),
          comentarios(
            id,
            texto,
            autor_id,
            turno,
            created_at,
            autor:usuarios(
              id,
              nombre,
              apellido,
              dni,
              contraseña,
              rol,
              activo,
              created_at
            ),
            comentario_fotos(
              id,
              url,
              nombre_archivo,
              created_at
            )
          ),
          novedad_fotos(
            id,
            url,
            nombre_archivo,
            created_at
          ),
          comentario_lecturas(
            id,
            usuario_id,
            ultimo_comentario_leido_at,
            created_at,
            updated_at,
            usuario:usuarios(
              id,
              nombre,
              apellido,
              dni,
              contraseña,
              rol,
              activo,
              created_at
            )
          )
        `);

      query = query.eq('proyecto_id', proyectoActivoId);

      // ✅ Verificar asignaciones de proyectos y sectores para TODOS los usuarios (incluye administradores)
      const proyectosUsuario = usuarioActual.proyectos || [];
      const proyectosIds = proyectosUsuario.map(p => p.id);

      // Verificar que el usuario tiene asignado el proyecto activo
      if (!proyectosIds.includes(proyectoActivoId)) {
        setNovedades([]);
        setCargando(false);
        return;
      }

      // Verificar que el usuario tiene sectores asignados
      if (sectoresIds.length === 0) {
        setNovedades([]);
        setCargando(false);
        return;
      }

      // Filtrar por sectores asignados
      query = query.in('sector_id', sectoresIds);

      // Los administradores pueden ver novedades archivadas, los usuarios normales no
      if (usuarioActual.rol !== 'administrador') {
        query = query.neq('estado', 'archivada');
      }

      // Ejecutar la consulta
      const { data: novedadesData, error: novedadesError } = await query
        .order('created_at', { ascending: false });

      if (novedadesError) throw novedadesError;

      const novedadesFormateadas = novedadesData.map(n => ({
        id: n.id,
        numeroId: n.numero_id,
        turno: n.turno as 'mañana' | 'noche',
        titulo: n.titulo,
        descripcion: n.descripcion,
        sector: {
          id: n.sector.id,
          nombre: n.sector.nombre,
          descripcion: n.sector.descripcion || undefined,
          activo: n.sector.activo,
          fechaCreacion: new Date(n.sector.created_at)
        },
        proyecto: n.proyecto ? {
          id: n.proyecto.id,
          nombre: n.proyecto.nombre,
          descripcion: n.proyecto.descripcion || undefined,
          estado: n.proyecto.estado as 'activo' | 'finalizado',
          activo: n.proyecto.activo,
          fechaCreacion: new Date(n.proyecto.created_at),
          fechaActualizacion: new Date(n.proyecto.updated_at)
        } : undefined,
        prioridad: n.prioridad as 'baja' | 'media' | 'alta' | 'critica',
        estado: n.estado as 'nueva' | 'leida' | 'respondida' | 'archivada',
        fechaCreacion: new Date(n.created_at),
        creadoPor: {
          id: n.creado_por.id,
          nombre: n.creado_por.nombre,
          apellido: n.creado_por.apellido,
          dni: n.creado_por.dni,
          contraseña: n.creado_por.contraseña,
          rol: n.creado_por.rol as 'administrador' | 'usuario',
          fechaCreacion: new Date(n.creado_por.created_at),
          activo: n.creado_por.activo
        },
        lecturas: (n.lecturas || []).map(lectura => ({
          id: lectura.id,
          usuario: {
            id: lectura.usuario.id,
            nombre: lectura.usuario.nombre,
            apellido: lectura.usuario.apellido,
            dni: lectura.usuario.dni,
            contraseña: lectura.usuario.contraseña,
            rol: lectura.usuario.rol as 'administrador' | 'usuario',
            fechaCreacion: new Date(lectura.usuario.created_at),
            activo: lectura.usuario.activo
          },
          fechaLectura: new Date(lectura.fecha_lectura)
        })),
        comentarios: (n.comentarios || []).map(comentario => ({
          id: comentario.id,
          texto: comentario.texto,
          autor: {
            id: comentario.autor.id,
            nombre: comentario.autor.nombre,
            apellido: comentario.autor.apellido,
            dni: comentario.autor.dni,
            contraseña: comentario.autor.contraseña,
            rol: comentario.autor.rol as 'administrador' | 'usuario',
            fechaCreacion: new Date(comentario.autor.created_at),
            activo: comentario.autor.activo
          },
          turno: comentario.turno as 'mañana' | 'noche',
          fecha: new Date(comentario.created_at),
          fotos: (comentario.comentario_fotos || []).map(foto => ({
            id: foto.id,
            url: foto.url,
            nombreArchivo: foto.nombre_archivo,
            fechaCreacion: new Date(foto.created_at)
          }))
        })),
        comentarioLectura: (n.comentario_lecturas || []).find(cl => cl.usuario_id === usuarioActual.id) ? {
          id: n.comentario_lecturas.find(cl => cl.usuario_id === usuarioActual.id)!.id,
          novedadId: n.id,
          usuarioId: usuarioActual.id,
          ultimoComentarioLeidoAt: new Date(n.comentario_lecturas.find(cl => cl.usuario_id === usuarioActual.id)!.ultimo_comentario_leido_at),
          createdAt: new Date(n.comentario_lecturas.find(cl => cl.usuario_id === usuarioActual.id)!.created_at),
          updatedAt: new Date(n.comentario_lecturas.find(cl => cl.usuario_id === usuarioActual.id)!.updated_at),
          usuario: usuarioActual
        } : null,
        comentarioLecturas: (n.comentario_lecturas || []).map(lectura => ({
          id: lectura.id,
          novedadId: n.id,
          usuarioId: lectura.usuario_id,
          ultimoComentarioLeidoAt: new Date(lectura.ultimo_comentario_leido_at),
          createdAt: new Date(lectura.created_at),
          updatedAt: new Date(lectura.updated_at),
          usuario: {
            id: lectura.usuario.id,
            nombre: lectura.usuario.nombre,
            apellido: lectura.usuario.apellido,
            dni: lectura.usuario.dni,
            contraseña: lectura.usuario.contraseña,
            rol: lectura.usuario.rol as 'administrador' | 'usuario',
            fechaCreacion: new Date(lectura.usuario.created_at),
            activo: lectura.usuario.activo
          }
        })),
        fotos: (n.novedad_fotos || []).map(foto => ({
          id: foto.id,
          url: foto.url,
          nombreArchivo: foto.nombre_archivo,
          fechaCreacion: new Date(foto.created_at)
        }))
      }));

      setNovedades(novedadesFormateadas);
    } catch (error) {
      setNovedades([]);
    } finally {
      setCargando(false);
    }
  };

  const agregarNovedad = async (novedad: {
    turno: Turno;
    titulo: string;
    descripcion: string;
    sectorId: string;
    prioridad: 'baja' | 'media' | 'alta' | 'critica';
    creadoPorId: string;
  }, fotosNovedad?: File[]) => {
    try {
      // ✅ Validar permisos de sector y proyecto para TODOS los usuarios (incluye administradores)
      if (usuarioActual) {
        const sectoresUsuario = usuarioActual.sectores || [];
        const sectoresIds = sectoresUsuario.map(s => s.id);

        if (!sectoresIds.includes(novedad.sectorId)) {
          throw new Error('No tienes permiso para crear novedades en este sector');
        }

        const proyectosUsuario = usuarioActual.proyectos || [];
        const proyectosIds = proyectosUsuario.map(p => p.id);

        if (!proyectoActivoId || !proyectosIds.includes(proyectoActivoId)) {
          throw new Error('No tienes permiso para crear novedades en este proyecto');
        }
      }

      const fotosSubidas: { url: string; nombreArchivo: string }[] = [];
      
      // Solo intentar subir fotos si hay fotos seleccionadas
      if (fotosNovedad && fotosNovedad.length > 0) {
        try {
          for (const foto of fotosNovedad) {
            const resultado = await uploadPhoto(foto, 'novedades');
            if (resultado.success && resultado.url) {
              fotosSubidas.push({
                url: resultado.url,
                nombreArchivo: foto.name
              });
            } else {
              break;
            }
          }
        } catch (uploadError) {
          fotosSubidas.length = 0;
        }
      }
      
      const { data, error } = await supabase
        .from('novedades')
        .insert({
          turno: novedad.turno,
          titulo: novedad.titulo,
          descripcion: novedad.descripcion,
          sector_id: novedad.sectorId,
          proyecto_id: proyectoActivoId,
          prioridad: novedad.prioridad,
          creado_por_id: novedad.creadoPorId
        })
        .select(`
          *,
          creado_por:usuarios!novedades_creado_por_id_fkey(*),
          sector:sectores(*),
          proyecto:proyectos(*)
        `)
        .single();

      if (error) throw error;

      // Guardar fotos en la base de datos
      if (fotosSubidas.length > 0) {
        const fotosParaInsertar = fotosSubidas.map(foto => ({
          novedad_id: data.id,
          url: foto.url,
          nombre_archivo: foto.nombreArchivo
        }));

        const { error: fotosError } = await supabase
          .from('novedad_fotos')
          .insert(fotosParaInsertar);

        if (fotosError) {
          // Silently handle error
        }
      }

      const nuevaNovedad: Novedad = {
        id: data.id,
        numeroId: data.numero_id,
        turno: data.turno as 'mañana' | 'noche',
        titulo: data.titulo,
        descripcion: data.descripcion,
        sector: {
          id: data.sector.id,
          nombre: data.sector.nombre,
          descripcion: data.sector.descripcion || undefined,
          activo: data.sector.activo,
          fechaCreacion: new Date(data.sector.created_at)
        },
        proyecto: data.proyecto ? {
          id: data.proyecto.id,
          nombre: data.proyecto.nombre,
          descripcion: data.proyecto.descripcion || undefined,
          estado: data.proyecto.estado as 'activo' | 'finalizado',
          activo: data.proyecto.activo,
          fechaCreacion: new Date(data.proyecto.created_at),
          fechaActualizacion: new Date(data.proyecto.updated_at)
        } : undefined,
        prioridad: data.prioridad as 'baja' | 'media' | 'alta' | 'critica',
        estado: data.estado as 'nueva' | 'leida' | 'respondida' | 'archivada',
        fechaCreacion: new Date(data.created_at),
        creadoPor: {
          id: data.creado_por.id,
          nombre: data.creado_por.nombre,
          apellido: data.creado_por.apellido,
          dni: data.creado_por.dni,
          contraseña: data.creado_por.contraseña,
          rol: data.creado_por.rol as 'administrador' | 'usuario',
          fechaCreacion: new Date(data.creado_por.created_at),
          activo: data.creado_por.activo
        },
        lecturas: [],
        comentarios: [],
        comentarioLectura: null,
        fotos: fotosSubidas.map((foto, index) => ({
          id: `temp-${index}`,
          url: foto.url,
          nombreArchivo: foto.nombreArchivo,
          fechaCreacion: new Date()
        }))
      };

      setNovedades(prev => [nuevaNovedad, ...prev]);
    } catch (error) {
      throw error;
    }
  };

  const eliminarNovedad = async (id: string) => {
    try {
      const { error } = await supabase
        .from('novedades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNovedades(prev => prev.filter(novedad => novedad.id !== id));
    } catch (error) {
      throw error;
    }
  };

  const marcarComoLeida = async (id: string, usuarioId: string) => {
    try {
      // Actualizar estado local inmediatamente para respuesta rápida
      setNovedades(prev => prev.map(novedad => {
        if (novedad.id === id) {
          const nuevaLectura = {
            id: `temp-${Date.now()}`,
            usuario: usuarioActual!,
            fechaLectura: new Date()
          };
          return {
            ...novedad,
            lecturas: [...(novedad.lecturas || []), nuevaLectura],
            estado: novedad.estado === 'nueva' ? 'leida' as const : novedad.estado
          };
        }
        return novedad;
      }));

      // Operación en base de datos en segundo plano
      const operacionBD = async () => {
        // Usar upsert para insertar o actualizar en una sola operación
        const { error } = await supabase
          .from('lecturas')
          .upsert({
            novedad_id: id,
            usuario_id: usuarioId,
            fecha_lectura: new Date().toISOString()
          }, {
            onConflict: 'novedad_id,usuario_id'
          });

        if (error) {
          setNovedades(prev => prev.map(novedad => {
            if (novedad.id === id) {
              return {
                ...novedad,
                lecturas: novedad.lecturas?.filter(l => !l.id.startsWith('temp-')) || [],
                estado: 'nueva' as const
              };
            }
            return novedad;
          }));
          throw error;
        }

        // Actualizar estado de la novedad si es necesario
        const novedadActual = novedades.find(n => n.id === id);
        if (novedadActual && novedadActual.estado === 'nueva') {
          await supabase
            .from('novedades')
            .update({ estado: 'leida' })
            .eq('id', id);
        }
      };

      // Ejecutar operación de BD sin esperar
      operacionBD().catch(() => {});

    } catch (error) {
      throw error;
    }
  };

  const marcarComentariosComoLeidos = async (novedadId: string, usuarioId: string) => {
    try {
      
      // Primero marcar la novedad como leída en la tabla lecturas
      await supabase
        .from('lecturas')
        .upsert({
          novedad_id: novedadId,
          usuario_id: usuarioId,
          fecha_lectura: new Date().toISOString()
        }, {
          onConflict: 'novedad_id,usuario_id'
        });
      
      // Usar upsert para insertar o actualizar la lectura de comentarios
      const { error } = await supabase
        .from('comentario_lecturas')
        .upsert({
          novedad_id: novedadId,
          usuario_id: usuarioId,
          ultimo_comentario_leido_at: new Date().toISOString()
        }, {
          onConflict: 'novedad_id,usuario_id'
        });

      if (error) {
        throw error;
      }

      await cargarNovedades();
    } catch (error) {
      throw error;
    }
  };

  const agregarComentario = async (novedadId: string, comentario: {
    texto: string;
    autorId: string;
  }, fotosComentario?: File[]) => {
    try {
      const fotosSubidas: { url: string; nombreArchivo: string }[] = [];
      
      // Solo intentar subir fotos si hay fotos seleccionadas
      if (fotosComentario && fotosComentario.length > 0) {
        try {
          for (const foto of fotosComentario) {
            const resultado = await uploadPhoto(foto, 'comentarios');
            if (resultado.success && resultado.url) {
              fotosSubidas.push({
                url: resultado.url,
                nombreArchivo: foto.name
              });
            } else {
              if (resultado.error?.includes('bucket') || resultado.error?.includes('Bucket')) {
                break;
              } else {
                throw new Error(resultado.error || 'Error subiendo foto');
              }
            }
          }
        } catch (uploadError) {
          fotosSubidas.length = 0;
        }
      }
      
      const { data, error } = await supabase
        .from('comentarios')
        .insert({
          novedad_id: novedadId,
          texto: comentario.texto,
          autor_id: comentario.autorId,
          turno: 'mañana' // Valor por defecto requerido por la BD
        })
        .select(`
          *,
          autor:usuarios(*)
        `)
        .single();

      if (error) throw error;

      // Guardar fotos en la base de datos
      if (fotosSubidas.length > 0) {
        const fotosParaInsertar = fotosSubidas.map(foto => ({
          comentario_id: data.id,
          url: foto.url,
          nombre_archivo: foto.nombreArchivo
        }));

        const { error: fotosError } = await supabase
          .from('comentario_fotos')
          .insert(fotosParaInsertar);

        if (fotosError) {
          // Error guardando fotos del comentario
        }
      }

      // Actualizar estado de la novedad a 'respondida'
      await supabase
        .from('novedades')
        .update({ estado: 'respondida' })
        .eq('id', novedadId);

      // Recargar novedades para obtener los datos actualizados
      await cargarNovedades();
    } catch (error) {
      throw error;
    }
  };

  const archivarNovedad = async (id: string) => {
    try {
      const { error } = await supabase
        .from('novedades')
        .update({ estado: 'archivada' })
        .eq('id', id);

      if (error) throw error;

      // Recargar novedades para obtener los datos actualizados
      await cargarNovedades();
    } catch (error) {
      throw error;
    }
  };

  const desarchivarNovedad = async (id: string) => {
    try {
      const { error } = await supabase
        .from('novedades')
        .update({ estado: 'leida' })
        .eq('id', id);

      if (error) throw error;

      // Recargar novedades para obtener los datos actualizados
      await cargarNovedades();
    } catch (error) {
      throw error;
    }
  };

  const obtenerNovedadesPorTurno = (turno: Turno) => {
    return novedades.filter(novedad => novedad.turno === turno);
  };

  const obtenerNovedadesPendientes = () => {
    return novedades.filter(novedad => novedad.estado === 'nueva');
  };

  return {
    novedades,
    cargando,
    agregarNovedad,
    eliminarNovedad,
    marcarComoLeida,
    marcarComentariosComoLeidos,
    agregarComentario,
    archivarNovedad,
    desarchivarNovedad,
    obtenerNovedadesPorTurno,
    obtenerNovedadesPendientes,
    recargarNovedades: cargarNovedades
  };
};
