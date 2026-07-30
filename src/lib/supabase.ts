import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}


// Tipos para las tablas de Supabase
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          apellido: string;
          dni: string;
          contraseña: string;
          rol: 'administrador' | 'usuario';
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          apellido: string;
          dni: string;
          contraseña: string;
          rol: 'administrador' | 'usuario';
          activo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          apellido?: string;
          dni?: string;
          contraseña?: string;
          rol?: 'administrador' | 'usuario';
          activo?: boolean;
          created_at?: string;
        };
      };
      sectores: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          activo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          activo?: boolean;
          created_at?: string;
        };
      };
      novedades: {
        Row: {
          id: string;
          turno: 'mañana' | 'noche';
          titulo: string;
          descripcion: string;
          sector_id: string;
          prioridad: 'baja' | 'media' | 'alta' | 'critica';
          estado: 'nueva' | 'leida' | 'respondida' | 'archivada';
          created_at: string;
          creado_por_id: string;
        };
        Insert: {
          id?: string;
          turno: 'mañana' | 'noche';
          titulo: string;
          descripcion: string;
          sector_id: string;
          prioridad: 'baja' | 'media' | 'alta' | 'critica';
          estado?: 'nueva' | 'leida' | 'respondida' | 'archivada';
          created_at?: string;
          creado_por_id: string;
        };
        Update: {
          id?: string;
          turno?: 'mañana' | 'noche';
          titulo?: string;
          descripcion?: string;
          sector_id?: string;
          prioridad?: 'baja' | 'media' | 'alta' | 'critica';
          estado?: 'nueva' | 'leida' | 'respondida' | 'archivada';
          created_at?: string;
          creado_por_id?: string;
        };
      };
      lecturas: {
        Row: {
          id: string;
          novedad_id: string;
          usuario_id: string;
          fecha_lectura: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          novedad_id: string;
          usuario_id: string;
          fecha_lectura?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          novedad_id?: string;
          usuario_id?: string;
          fecha_lectura?: string;
          created_at?: string;
        };
      };
      comentarios: {
        Row: {
          id: string;
          novedad_id: string;
          texto: string;
          autor_id: string;
          turno: 'mañana' | 'noche';
          created_at: string;
        };
        Insert: {
          id?: string;
          novedad_id: string;
          texto: string;
          autor_id: string;
          turno: 'mañana' | 'noche';
          created_at?: string;
        };
        Update: {
          id?: string;
          novedad_id?: string;
          texto?: string;
          autor_id?: string;
          turno?: 'mañana' | 'noche';
          created_at?: string;
        };
      };
      comentario_lecturas: {
        Row: {
          id: string;
          novedad_id: string;
          usuario_id: string;
          ultimo_comentario_leido_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          novedad_id: string;
          usuario_id: string;
          ultimo_comentario_leido_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          novedad_id?: string;
          usuario_id?: string;
          ultimo_comentario_leido_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      novedad_fotos: {
        Row: {
          id: string;
          novedad_id: string;
          url: string;
          nombre_archivo: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          novedad_id: string;
          url: string;
          nombre_archivo: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          novedad_id?: string;
          url?: string;
          nombre_archivo?: string;
          created_at?: string;
        };
      };
      comentario_fotos: {
        Row: {
          id: string;
          comentario_id: string;
          url: string;
          nombre_archivo: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comentario_id: string;
          url: string;
          nombre_archivo: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          comentario_id?: string;
          url?: string;
          nombre_archivo?: string;
          created_at?: string;
        };
      };
    };
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
