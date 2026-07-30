import { useState, useEffect } from 'react';
import { Usuario } from '../types';
import { supabase } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export const useAuth = () => {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    inicializar();
  }, []);

  const inicializar = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      await cargarPerfilUsuario(session.user);
    }

    await cargarUsuarios();

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        (async () => {
          await cargarPerfilUsuario(session.user);
        })();
      } else {
        setUsuarioActual(null);
      }
    });

    setCargando(false);
  };

  const cargarPerfilUsuario = async (authUser: SupabaseUser) => {
    try {
      const { data: usuarioData, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authUser.id)
        .eq('activo', true)
        .single();

      if (error) throw error;

      const sectores = await cargarSectoresUsuario(usuarioData.id);
      const proyectos = await cargarProyectosUsuario(usuarioData.id);

      const usuario: Usuario = {
        id: usuarioData.id,
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        dni: usuarioData.dni,
        email: usuarioData.email || undefined,
        contraseña: '',
        rol: usuarioData.rol as 'administrador' | 'usuario',
        fechaCreacion: new Date(usuarioData.created_at),
        activo: usuarioData.activo,
        photoUrl: usuarioData.photo_url || undefined,
        moduloNovedades: usuarioData.modulo_novedades ?? true,
        moduloTareas: usuarioData.modulo_tareas ?? true,
        sectores,
        proyectos
      };

      setUsuarioActual(usuario);
    } catch (error) {
      // Error al cargar perfil
    }
  };

  const cargarUsuarios = async () => {
    try {
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (usuariosError) throw usuariosError;

      const { data: usuarioSectoresData, error: sectoresError } = await supabase
        .from('usuario_sectores')
        .select(`
          usuario_id,
          sector:sectores(*)
        `);

      if (sectoresError) throw sectoresError;

      const { data: usuarioProyectosData, error: proyectosError } = await supabase
        .from('usuario_proyectos')
        .select(`
          usuario_id,
          proyecto:proyectos(*)
        `);

      if (proyectosError) throw proyectosError;

      const sectoresPorUsuario = usuarioSectoresData.reduce((acc, item) => {
        if (!acc[item.usuario_id]) {
          acc[item.usuario_id] = [];
        }
        acc[item.usuario_id].push({
          id: item.sector.id,
          nombre: item.sector.nombre,
          descripcion: item.sector.descripcion || undefined,
          activo: item.sector.activo,
          fechaCreacion: new Date(item.sector.created_at)
        });
        return acc;
      }, {} as Record<string, any[]>);

      const proyectosPorUsuario = usuarioProyectosData.reduce((acc, item) => {
        if (!acc[item.usuario_id]) {
          acc[item.usuario_id] = [];
        }
        acc[item.usuario_id].push({
          id: item.proyecto.id,
          nombre: item.proyecto.nombre,
          descripcion: item.proyecto.descripcion || undefined,
          estado: item.proyecto.estado,
          activo: item.proyecto.activo,
          fechaCreacion: new Date(item.proyecto.created_at),
          fechaActualizacion: new Date(item.proyecto.updated_at)
        });
        return acc;
      }, {} as Record<string, any[]>);

      const usuariosFormateados = usuariosData.map(u => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        dni: u.dni,
        email: u.email || undefined,
        contraseña: '',
        rol: u.rol as 'administrador' | 'usuario',
        fechaCreacion: new Date(u.created_at),
        activo: u.activo,
        photoUrl: u.photo_url || undefined,
        moduloNovedades: u.modulo_novedades ?? true,
        moduloTareas: u.modulo_tareas ?? true,
        sectores: sectoresPorUsuario[u.id] || [],
        proyectos: proyectosPorUsuario[u.id] || []
      }));

      setUsuarios(usuariosFormateados);
    } catch (error) {
      // Error al cargar usuarios
    }
  };

  const cargarSectoresUsuario = async (usuarioId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuario_sectores')
        .select(`
          sector:sectores(*)
        `)
        .eq('usuario_id', usuarioId);

      if (error) throw error;

      return data.map(item => ({
        id: item.sector.id,
        nombre: item.sector.nombre,
        descripcion: item.sector.descripcion || undefined,
        activo: item.sector.activo,
        fechaCreacion: new Date(item.sector.created_at)
      }));
    } catch (error) {
      return [];
    }
  };

  const cargarProyectosUsuario = async (usuarioId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuario_proyectos')
        .select(`
          proyecto:proyectos(*)
        `)
        .eq('usuario_id', usuarioId);

      if (error) throw error;

      return data.map(item => ({
        id: item.proyecto.id,
        nombre: item.proyecto.nombre,
        descripcion: item.proyecto.descripcion || undefined,
        estado: item.proyecto.estado,
        activo: item.proyecto.activo,
        fechaCreacion: new Date(item.proyecto.created_at),
        fechaActualizacion: new Date(item.proyecto.updated_at)
      }));
    } catch (error) {
      return [];
    }
  };

  const iniciarSesion = async (email: string, contraseña: string): Promise<boolean> => {
    try {
      const { data: usuarioExiste, error: errorBusqueda } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('activo', true)
        .maybeSingle();

      if (errorBusqueda || !usuarioExiste) {
        return false;
      }

      if (usuarioExiste.contraseña !== contraseña) {
        return false;
      }

      if (!usuarioExiste.auth_id) {
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: contraseña,
            options: {
              data: {
                nombre: usuarioExiste.nombre,
                apellido: usuarioExiste.apellido,
                dni: usuarioExiste.dni,
                email: usuarioExiste.email
              }
            }
          });

          if (signUpError) throw signUpError;

          if (signUpData.user) {
            const { error: updateError } = await supabase
              .from('usuarios')
              .update({ auth_id: signUpData.user.id })
              .eq('id', usuarioExiste.id);

            if (updateError) throw updateError;
          }
        } catch (signUpErrorCatch) {
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password: contraseña
            });

            if (signInError) throw signInError;

            if (signInData.user && !usuarioExiste.auth_id) {
              const { error: updateError } = await supabase
                .from('usuarios')
                .update({ auth_id: signInData.user.id })
                .eq('id', usuarioExiste.id);

              if (updateError) throw updateError;
            }
          } catch (signInErrorCatch) {
            return false;
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: contraseña
        });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuarioActual(null);
  };

  const crearUsuario = async (datosUsuario: Omit<Usuario, 'id' | 'fechaCreacion'>) => {
    try {
      const email = datosUsuario.email || `${datosUsuario.dni}@rotorc.com.ar`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: datosUsuario.contraseña,
        options: {
          data: {
            nombre: datosUsuario.nombre,
            apellido: datosUsuario.apellido,
            dni: datosUsuario.dni,
            email: email
          }
        }
      });

      if (authError) throw authError;

      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nombre: datosUsuario.nombre,
          apellido: datosUsuario.apellido,
          dni: datosUsuario.dni,
          email: email,
          contraseña: datosUsuario.contraseña,
          rol: datosUsuario.rol,
          modulo_novedades: datosUsuario.moduloNovedades,
          modulo_tareas: datosUsuario.moduloTareas,
          activo: datosUsuario.activo,
          auth_id: authData.user?.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ya existe un usuario con ese DNI o correo electrónico');
        }
        throw error;
      }

      const nuevoUsuario: Usuario = {
        id: data.id,
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        email: data.email || undefined,
        contraseña: '',
        rol: data.rol as 'administrador' | 'usuario',
        fechaCreacion: new Date(data.created_at),
        activo: data.activo,
        moduloNovedades: data.modulo_novedades,
        moduloTareas: data.modulo_tareas,
        sectores: [],
        proyectos: []
      };

      if (datosUsuario.sectores && datosUsuario.sectores.length > 0) {
        const sectoresIds = datosUsuario.sectores.map(s => s.id);
        await actualizarSectoresUsuario(nuevoUsuario.id, sectoresIds);
        nuevoUsuario.sectores = datosUsuario.sectores;
      }

      if (datosUsuario.proyectos && datosUsuario.proyectos.length > 0) {
        const proyectosIds = datosUsuario.proyectos.map(p => p.id);
        await actualizarProyectosUsuario(nuevoUsuario.id, proyectosIds);
        nuevoUsuario.proyectos = datosUsuario.proyectos;
      }

      setUsuarios(prev => [nuevoUsuario, ...prev]);
      return nuevoUsuario;
    } catch (error) {
      throw error;
    }
  };

  const actualizarUsuario = async (id: string, datosActualizados: Partial<Omit<Usuario, 'id' | 'fechaCreacion'>>) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const apiUrl = `${supabaseUrl}/functions/v1/actualizar-usuario`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: id,
          datos: datosActualizados
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
      }

      await cargarUsuarios();

      if (usuarioActual && usuarioActual.id === id) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await cargarPerfilUsuario(session.user);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const actualizarPerfil = async (datos: {
    nombre?: string;
    apellido?: string;
    photoUrl?: string;
    contraseña?: string;
  }) => {
    if (!usuarioActual) {
      throw new Error('No hay usuario autenticado');
    }

    await actualizarUsuario(usuarioActual.id, datos);
  };

  const desactivarUsuario = async (id: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;

      await cargarUsuarios();
    } catch (error) {
      throw error;
    }
  };

  const esAdministrador = () => {
    return usuarioActual?.rol === 'administrador';
  };

  const actualizarSectoresUsuario = async (usuarioId: string, sectoresIds: string[]) => {
    try {
      await supabase
        .from('usuario_sectores')
        .delete()
        .eq('usuario_id', usuarioId);

      if (sectoresIds.length > 0) {
        const insertData = sectoresIds.map(sectorId => ({
          usuario_id: usuarioId,
          sector_id: sectorId
        }));

        const { error } = await supabase
          .from('usuario_sectores')
          .insert(insertData);

        if (error) throw error;
      }

      await cargarUsuarios();

      if (usuarioActual && usuarioActual.id === usuarioId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await cargarPerfilUsuario(session.user);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const actualizarProyectosUsuario = async (usuarioId: string, proyectosIds: string[]) => {
    try {
      await supabase
        .from('usuario_proyectos')
        .delete()
        .eq('usuario_id', usuarioId);

      if (proyectosIds.length > 0) {
        const insertData = proyectosIds.map(proyectoId => ({
          usuario_id: usuarioId,
          proyecto_id: proyectoId
        }));

        const { error } = await supabase
          .from('usuario_proyectos')
          .insert(insertData);

        if (error) throw error;
      }

      await cargarUsuarios();

      if (usuarioActual && usuarioActual.id === usuarioId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await cargarPerfilUsuario(session.user);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    usuarioActual,
    usuarios,
    cargando,
    iniciarSesion,
    cerrarSesion,
    crearUsuario,
    actualizarUsuario,
    actualizarPerfil,
    desactivarUsuario,
    esAdministrador,
    actualizarSectoresUsuario,
    actualizarProyectosUsuario
  };
};
