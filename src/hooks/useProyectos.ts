import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Proyecto } from '../types';

export const useProyectos = (usuarioId?: string, proyectosAsignados?: Proyecto[]) => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoActivo, setProyectoActivo] = useState<Proyecto | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarProyectos = async () => {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const proyectosMapeados = (data || []).map(p => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        estado: p.estado as 'activo' | 'finalizado',
        activo: p.activo,
        fechaCreacion: new Date(p.created_at),
        fechaActualizacion: new Date(p.updated_at)
      }));

      setProyectos(proyectosMapeados);
      setCargando(false);
    } catch (error) {
      // Error cargando proyectos
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    if (!usuarioId) {
      setProyectoActivo(null);
      return;
    }

    if (proyectos.length === 0) return;

    const proyectosDisponibles = proyectosAsignados && proyectosAsignados.length > 0
      ? proyectos.filter(p => proyectosAsignados.some(pa => pa.id === p.id) && p.estado === 'activo' && p.activo)
      : proyectos.filter(p => p.estado === 'activo' && p.activo);

    if (proyectosDisponibles.length === 0) {
      setProyectoActivo(null);
      localStorage.removeItem(`proyectoActivo_${usuarioId}`);
      return;
    }

    const proyectoActivoGuardado = localStorage.getItem(`proyectoActivo_${usuarioId}`);
    if (proyectoActivoGuardado) {
      const proyectoEncontrado = proyectosDisponibles.find(p => p.id === proyectoActivoGuardado);
      if (proyectoEncontrado) {
        setProyectoActivo(proyectoEncontrado);
        return;
      }
    }

    const proyectoMasReciente = proyectosDisponibles[0];
    setProyectoActivo(proyectoMasReciente);
    if (proyectoMasReciente) {
      localStorage.setItem(`proyectoActivo_${usuarioId}`, proyectoMasReciente.id);
    }
  }, [proyectos, usuarioId, proyectosAsignados]);

  const crearProyecto = async (proyecto: Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .insert({
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          estado: proyecto.estado,
          activo: proyecto.activo
        })
        .select()
        .single();

      if (error) throw error;

      await cargarProyectos();
      return data;
    } catch (error) {
      // Error creando proyecto
      throw error;
    }
  };

  const actualizarProyecto = async (id: string, datos: Partial<Omit<Proyecto, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>) => {
    try {
      const { error } = await supabase
        .from('proyectos')
        .update({
          ...datos,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await cargarProyectos();
    } catch (error) {
      // Error actualizando proyecto
      throw error;
    }
  };

  const eliminarProyecto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (proyectoActivo?.id === id) {
        setProyectoActivo(null);
        localStorage.removeItem('proyectoActivo');
      }

      await cargarProyectos();
    } catch (error) {
      // Error eliminando proyecto
      throw error;
    }
  };

  const cambiarProyectoActivo = (proyecto: Proyecto | null) => {
    setProyectoActivo(proyecto);
    if (proyecto && usuarioId) {
      localStorage.setItem(`proyectoActivo_${usuarioId}`, proyecto.id);
    } else if (usuarioId) {
      localStorage.removeItem(`proyectoActivo_${usuarioId}`);
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
    } catch (error) {
      // Error actualizando proyectos del usuario
      throw error;
    }
  };

  return {
    proyectos,
    proyectoActivo,
    cargando,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto,
    cambiarProyectoActivo,
    actualizarProyectosUsuario,
    recargarProyectos: cargarProyectos
  };
};
