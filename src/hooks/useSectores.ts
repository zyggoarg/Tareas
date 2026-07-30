import { useState, useEffect } from 'react';
import { Sector } from '../types';
import { supabase } from '../lib/supabase';

export const useSectores = () => {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const inicializar = async () => {
      await cargarSectores();
    };
    inicializar();
  }, []);

  const cargarSectores = async () => {
    try {
      setCargando(true);

      const { data, error } = await supabase
        .from('sectores')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;

      const sectoresFormateados = data.map(s => ({
        id: s.id,
        nombre: s.nombre,
        descripcion: s.descripcion || undefined,
        activo: s.activo,
        fechaCreacion: new Date(s.created_at)
      }));

      setSectores(sectoresFormateados);
    } catch (error) {
      setSectores([]);
    } finally {
      setCargando(false);
    }
  };

  const crearSector = async (datos: Omit<Sector, 'id' | 'fechaCreacion'>) => {
    try {
      const { data, error } = await supabase
        .from('sectores')
        .insert({
          nombre: datos.nombre,
          descripcion: datos.descripcion || null,
          activo: datos.activo
        })
        .select()
        .single();

      if (error) throw error;

      const nuevoSector: Sector = {
        id: data.id,
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        activo: data.activo,
        fechaCreacion: new Date(data.created_at)
      };

      setSectores(prev => [...prev, nuevoSector].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return nuevoSector;
    } catch (error) {
      throw error;
    }
  };

  const actualizarSector = async (id: string, datos: Partial<Omit<Sector, 'id' | 'fechaCreacion'>>) => {
    try {
      const updateData: any = {};
      if (datos.nombre) updateData.nombre = datos.nombre;
      if (datos.descripcion !== undefined) updateData.descripcion = datos.descripcion || null;
      if (datos.activo !== undefined) updateData.activo = datos.activo;

      const { error } = await supabase
        .from('sectores')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setSectores(prev => prev.map(sector =>
        sector.id === id
          ? { ...sector, ...datos }
          : sector
      ).sort((a, b) => a.nombre.localeCompare(b.nombre)));
    } catch (error) {
      throw error;
    }
  };

  const desactivarSector = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectores')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;

      setSectores(prev => prev.filter(sector => sector.id !== id));
    } catch (error) {
      throw error;
    }
  };

  return {
    sectores,
    cargando,
    crearSector,
    actualizarSector,
    desactivarSector,
    recargarSectores: cargarSectores
  };
};