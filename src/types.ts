export interface Novedad {
  id: string;
  numeroId: number;
  turno: 'mañana' | 'noche'; // Mantener para compatibilidad, pero ahora es solo una etiqueta
  titulo: string;
  descripcion: string;
  sector: Sector;
  proyecto?: Proyecto;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'nueva' | 'leida' | 'respondida' | 'archivada';
  fechaCreacion: Date;
  creadoPor: Usuario;
  lecturas: Lectura[];
  comentarios: Comentario[];
  comentarioLectura?: ComentarioLectura | null;
  comentarioLecturas?: ComentarioLectura[]; // Para mostrar quién leyó los comentarios
  fotos?: Foto[];
}

export interface Foto {
  id: string;
  url: string;
  nombreArchivo: string;
  fechaCreacion: Date;
}

export interface Lectura {
  id: string;
  usuario: Usuario;
  fechaLectura: Date;
}

export interface Comentario {
  id: string;
  texto: string;
  autor: Usuario;
  turno: 'mañana' | 'noche'; // Mantener para compatibilidad con BD
  fecha: Date;
  fotos?: Foto[];
}

export interface ComentarioLectura {
  id: string;
  novedadId: string;
  usuarioId: string;
  ultimoComentarioLeidoAt: Date;
  createdAt: Date;
  updatedAt: Date;
  usuario?: Usuario;
}

export interface Sector {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: Date;
}

export type Turno = 'mañana' | 'noche';
export type EstadoNovedad = 'nueva' | 'leida' | 'respondida' | 'archivada';
export type PrioridadNovedad = 'baja' | 'media' | 'alta' | 'critica';

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: 'activo' | 'finalizado';
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export type EstadoProyecto = 'activo' | 'finalizado';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  rol: 'administrador' | 'usuario';
  fechaCreacion: Date;
  activo: boolean;
  photoUrl?: string;
  moduloNovedades: boolean;
  moduloTareas: boolean;
  sectores?: Sector[];
  proyectos?: Proyecto[];
}

export type RolUsuario = 'administrador' | 'usuario';

// Tipos del módulo de Tareas (Trello-like)

export interface Tablero {
  id: string;
  nombre: string;
  descripcion?: string;
  proyecto: Proyecto;
  sector?: Sector;
  estado: 'activo' | 'archivado';
  color: string;
  creadoPor: Usuario;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  miembros?: Usuario[];
  listas?: Lista[];
}

export interface Lista {
  id: string;
  tableroId: string;
  nombre: string;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
  tarjetas?: Tarjeta[];
}

export interface Tarjeta {
  id: string;
  listaId: string;
  titulo: string;
  descripcion?: string;
  orden: number;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_progreso' | 'en_revision' | 'completado' | 'bloqueado';
  fechaInicio?: Date;
  fechaVencimiento?: Date;
  duracion?: number;
  creadoPor: Usuario;
  asignadoA?: Usuario;
  asignados?: Usuario[];
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  comentarios?: TarjetaComentario[];
  actividad?: TarjetaActividad[];
  adjuntos?: TarjetaAdjunto[];
  etiquetas?: Etiqueta[];
  checklist?: ChecklistItem[];
  vinculosNovedades?: NovedadTarjetaVinculo[];
}

export interface TarjetaComentario {
  id: string;
  tarjetaId: string;
  usuario: Usuario;
  texto: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface TarjetaActividad {
  id: string;
  tarjetaId: string;
  usuario: Usuario;
  tipo: 'creada' | 'editada' | 'movida' | 'asignado_agregado' | 'asignado_eliminado' | 'archivada' | 'etiqueta_agregada' | 'etiqueta_eliminada' | 'checklist_agregado' | 'checklist_completado';
  descripcion: string;
  metadata?: Record<string, any>;
  fechaCreacion: Date;
}

export interface TarjetaAdjunto {
  id: string;
  tarjetaId: string;
  usuario: Usuario;
  comentarioId?: string;
  url: string;
  urlStorage: string;
  nombreArchivo: string;
  tipoMime: string;
  tamaño: number;
  fechaCreacion: Date;
}

export interface NovedadTarjetaVinculo {
  id: string;
  novedadId: string;
  tarjetaId: string;
  creadoPor: Usuario;
  fechaCreacion: Date;
}

export interface Etiqueta {
  id: string;
  tableroId: string;
  nombre: string;
  color: string;
  fechaCreacion: Date;
}

export interface ChecklistItem {
  id: string;
  tarjetaId: string;
  texto: string;
  completado: boolean;
  orden: number;
  fechaCreacion: Date;
}

export type EstadoTablero = 'activo' | 'archivado';
export type PrioridadTarjeta = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoTarjeta = 'pendiente' | 'en_progreso' | 'en_revision' | 'completado' | 'bloqueado';