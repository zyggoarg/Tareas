import { useState, useEffect } from 'react';
import { Usuario } from '../types';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface LoginResult {
  success: boolean;
  error?: string;
}

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
    } catch {
      // Perfil no encontrado — la sesión queda activa pero sin perfil
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
    } catch {
      // Error silencioso al cargar la lista de usuarios
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
    } catch {
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
    } catch {
      return [];
    }
  };

  // Autenticación exclusivamente mediante Supabase Auth — nunca compara contraseñas en DB
  const iniciarSesion = async (email: string, contraseña: string): Promise<LoginResult> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: contraseña });

      if (error) {
        if (
          error.message.includes('Invalid login credentials') ||
          error.code === 'invalid_credentials'
        ) {
          return { success: false, error: 'Correo o contraseña incorrectos' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Correo electrónico no confirmado. Contacte al administrador.' };
        }
        if (error.message.includes('Too many requests')) {
          return { success: false, error: 'Demasiados intentos. Espere unos minutos e intente nuevamente.' };
        }
        return { success: false, error: 'Error al iniciar sesión. Intente nuevamente.' };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión. Verifique su conexión a internet.' };
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuarioActual(null);
  };

  // Crea usuario usando el edge function con service role — evita cambiar la sesión del admin
  const crearUsuario = async (
    datosUsuario: Omit<Usuario, 'id' | 'fechaCreacion'> & { contraseña: string }
  ) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) throw new Error('La sesión expiró. Por favor, inicie sesión nuevamente.');

    const response = await fetch(`${supabaseUrl}/functions/v1/crear-usuario`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: datosUsuario.email,
        password: datosUsuario.contraseña,
        nombre: datosUsuario.nombre,
        apellido: datosUsuario.apellido,
        dni: datosUsuario.dni,
        rol: datosUsuario.rol,
        moduloNovedades: datosUsuario.moduloNovedades,
        moduloTareas: datosUsuario.moduloTareas,
        activo: datosUsuario.activo,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear el usuario');
    }

    const result = await response.json();
    const nuevoUsuario: Usuario = {
      id: result.usuario.id,
      nombre: result.usuario.nombre,
      apellido: result.usuario.apellido,
      dni: result.usuario.dni,
      email: result.usuario.email || undefined,
      rol: result.usuario.rol as 'administrador' | 'usuario',
      fechaCreacion: new Date(result.usuario.created_at),
      activo: result.usuario.activo,
      photoUrl: result.usuario.photo_url || undefined,
      moduloNovedades: result.usuario.modulo_novedades ?? true,
      moduloTareas: result.usuario.modulo_tareas ?? true,
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
  };

  // Actualiza perfil o credenciales via edge function con JWT del usuario — no almacena contraseña en DB
  const actualizarUsuario = async (
    id: string,
    datosActualizados: Partial<Omit<Usuario, 'id' | 'fechaCreacion'>> & { contraseña?: string }
  ) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) throw new Error('La sesión expiró. Por favor, inicie sesión nuevamente.');

    const response = await fetch(`${supabaseUrl}/functions/v1/actualizar-usuario`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuarioId: id,
        datos: datosActualizados
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar el usuario');
    }

    await cargarUsuarios();

    if (usuarioActual && usuarioActual.id === id) {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        await cargarPerfilUsuario(currentSession.user);
      }
    }
  };

  // Solo actualiza datos de perfil (nombre, apellido, foto) del usuario actual
  const actualizarPerfil = async (datos: {
    nombre?: string;
    apellido?: string;
    photoUrl?: string;
  }) => {
    if (!usuarioActual) throw new Error('No hay usuario autenticado');
    await actualizarUsuario(usuarioActual.id, datos);
  };

  // Cambia la contraseña del usuario actual verificando primero la contraseña actual
  const cambiarContraseñaPropia = async (contraseñaActual: string, contraseñaNueva: string): Promise<void> => {
    if (!usuarioActual?.email) throw new Error('No hay usuario autenticado');

    // Verifica la contraseña actual re-autenticando con Supabase Auth
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: usuarioActual.email,
      password: contraseñaActual
    });

    if (verifyError) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Actualiza la contraseña directamente en Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: contraseñaNueva
    });

    if (updateError) {
      if (updateError.message.includes('Password should be at least')) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      throw new Error('Error al cambiar la contraseña. Intente nuevamente.');
    }
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
    cambiarContraseñaPropia,
    desactivarUsuario,
    esAdministrador,
    actualizarSectoresUsuario,
    actualizarProyectosUsuario
  };
};
