import React, { useState, useRef } from 'react';
import { 
  Clock, 
  User, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Archive, 
  ArchiveRestore,
  Trash2,
  Send,
  Calendar,
  Building2,
  Hash,
  Users
} from 'lucide-react';
import { Novedad, Usuario, Comentario } from '../types';
import { PhotoGallery } from './PhotoGallery';
import { PhotoUpload } from './PhotoUpload';

interface NovedadCardProps {
  novedad: Novedad;
  usuarioActual: Usuario;
  esAdministrador: boolean;
  onMarcarLeida: (id: string, usuarioId: string) => void;
  onAgregarComentario: (novedadId: string, comentario: { texto: string; autorId: string }, fotos?: File[]) => void;
  onMarcarComentariosLeidos: (novedadId: string, usuarioId: string) => void;
  onEliminarNovedad?: (id: string) => void;
  onArchivarNovedad?: (id: string) => void;
  onDesarchivarNovedad?: (id: string) => void;
}

export const NovedadCard: React.FC<NovedadCardProps> = ({
  novedad,
  usuarioActual,
  esAdministrador,
  onMarcarLeida,
  onAgregarComentario,
  onMarcarComentariosLeidos,
  onEliminarNovedad,
  onArchivarNovedad,
  onDesarchivarNovedad
}) => {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [fotosComentario, setFotosComentario] = useState<File[]>([]);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const comentarioRef = useRef<HTMLTextAreaElement>(null);

  // Verificar si el usuario actual ha leído la novedad
  const haLeidoNovedad = React.useMemo(() => {
    // Verificar si existe un registro en la tabla lecturas
    const tieneRegistroLectura = novedad.lecturas?.some(l => l.usuario.id === usuarioActual.id) || false;
    
    // Verificar si el usuario ha comentado en esta novedad
    const haComentado = novedad.comentarios?.some(c => c.autor.id === usuarioActual.id) || false;
    
    // Verificar si los comentarios están leídos
    const comentariosLeidos = novedad.comentarioLectura !== null && novedad.comentarioLectura !== undefined;
    
    // La novedad se considera "leída" si cumple cualquiera de las 3 condiciones
    return tieneRegistroLectura || haComentado || comentariosLeidos;
  }, [novedad.lecturas, novedad.comentarios, novedad.comentarioLectura, usuarioActual.id]);
  
  // Verificar si hay comentarios nuevos para el usuario actual
  const tieneComentariosNuevos = React.useMemo(() => {
    if (novedad.comentarios.length === 0) return false;
    
    // Si es el creador de la novedad, verificar comentarios de otros
    if (novedad.creadoPor.id === usuarioActual.id) {
      const comentarioLectura = novedad.comentarioLectura;
      if (!comentarioLectura) {
        return novedad.comentarios.some(comentario => comentario.autor.id !== usuarioActual.id);
      }
      const comentariosNuevos = novedad.comentarios.filter(comentario => 
        comentario.autor.id !== usuarioActual.id && 
        comentario.fecha > comentarioLectura.ultimoComentarioLeidoAt
      );
      return comentariosNuevos.length > 0;
    }
    
    // Para novedades de otros, debe haberla leído primero
    if (!haLeidoNovedad) return false;
    
    const comentarioLectura = novedad.comentarioLectura;
    
    if (!comentarioLectura) {
      return novedad.comentarios.some(comentario => comentario.autor.id !== usuarioActual.id);
    }
    
    const comentariosNuevos = novedad.comentarios.filter(comentario => 
      comentario.autor.id !== usuarioActual.id && 
      comentario.fecha > comentarioLectura.ultimoComentarioLeidoAt
    );
    
    return comentariosNuevos.length > 0;
  }, [novedad, usuarioActual.id, haLeidoNovedad]);

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'nueva': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'leida': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'respondida': return 'bg-green-100 text-green-800 border-green-200';
      case 'archivada': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleMarcarLeida = () => {
    if (!haLeidoNovedad) {
      onMarcarLeida(novedad.id, usuarioActual.id);
    }
  };

  const handleToggleComentarios = () => {
    const nuevoEstado = !mostrarComentarios;
    setMostrarComentarios(nuevoEstado);
    
    // Marcar comentarios como leídos cuando se abren los comentarios
    if (nuevoEstado) {
      onMarcarComentariosLeidos(novedad.id, usuarioActual.id);
    }
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim() && fotosComentario.length === 0) return;
    
    setEnviandoComentario(true);
    
    try {
      // Marcar la novedad como leída automáticamente al comentar
      if (!haLeidoNovedad) {
        await onMarcarLeida(novedad.id, usuarioActual.id);
      }
      
      await onAgregarComentario(
        novedad.id,
        {
          texto: nuevoComentario.trim(),
          autorId: usuarioActual.id
        },
        fotosComentario.length > 0 ? fotosComentario : undefined
      );
      
      setNuevoComentario('');
      setFotosComentario([]);
    } catch (error) {
      // Error al enviar comentario
    } finally {
      setEnviandoComentario(false);
    }
  };

  const formatearFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fecha);
  };

  // Obtener lectores de la novedad (excluyendo al creador)
  const lectoresNovedad = novedad.lecturas?.filter(l => l.usuario.id !== novedad.creadoPor.id) || [];

  // Obtener lectores de comentarios para cada comentario (excluyendo al autor del comentario)
  const getLectoresComentario = (comentario: Comentario) => {
    if (!novedad.comentarioLecturas) return [];
    
    return novedad.comentarioLecturas.filter(cl => 
      cl.usuario && 
      cl.usuario.id !== comentario.autor.id &&
      cl.ultimoComentarioLeidoAt >= comentario.fecha
    );
  };
  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${
      novedad.prioridad === 'critica' ? 'border-l-red-500' :
      novedad.prioridad === 'alta' ? 'border-l-orange-500' :
      novedad.prioridad === 'media' ? 'border-l-yellow-500' :
      'border-l-green-500'
    } ${!haLeidoNovedad && novedad.creadoPor.id !== usuarioActual.id ? 'ring-2 ring-blue-200 bg-blue-50' : ''}`}>
      
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">

              <span className="text-sm font-mono text-gray-600">#{novedad.numeroId}</span>
              {!haLeidoNovedad && novedad.creadoPor.id !== usuarioActual.id && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Nueva
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {novedad.titulo}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {novedad.descripcion}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {!haLeidoNovedad && novedad.creadoPor.id !== usuarioActual.id && (
              <button
                onClick={handleMarcarLeida}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                Marcar leída
              </button>
            )}
            
            {esAdministrador && novedad.estado !== 'archivada' && onArchivarNovedad && (
              <button
                onClick={() => onArchivarNovedad(novedad.id)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                <Archive className="w-4 h-4" />
                Archivar
              </button>
            )}
            
            {esAdministrador && novedad.estado === 'archivada' && onDesarchivarNovedad && (
              <button
                onClick={() => onDesarchivarNovedad(novedad.id)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <ArchiveRestore className="w-4 h-4" />
                Desarchivar
              </button>
            )}
            
            {esAdministrador && onEliminarNovedad && (
              <button
                onClick={() => onEliminarNovedad(novedad.id)}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            )}
          </div>
        </div>

        {/* Fotos de la novedad */}
        {novedad.fotos && novedad.fotos.length > 0 && (
          <div className="mb-4">
            <PhotoGallery fotos={novedad.fotos} />
          </div>
        )}

        {/* Etiquetas y metadatos */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPrioridadColor(novedad.prioridad)}`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {novedad.prioridad.charAt(0).toUpperCase() + novedad.prioridad.slice(1)}
          </span>
          
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(novedad.estado)}`}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {novedad.estado.charAt(0).toUpperCase() + novedad.estado.slice(1)}
          </span>
          
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock className="w-3 h-3 mr-1" />
            {novedad.turno.charAt(0).toUpperCase() + novedad.turno.slice(1)}
          </span>
          
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            <Building2 className="w-3 h-3 mr-1" />
            {novedad.sector.nombre}
          </span>
        </div>

        {/* Quiénes leyeron la novedad */}
        {lectoresNovedad.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Leída por {lectoresNovedad.length} persona{lectoresNovedad.length !== 1 ? 's' : ''}:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lectoresNovedad.map((lectura) => (
                <span
                  key={lectura.id}
                  className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  title={`Leída el ${formatearFecha(lectura.fechaLectura)}`}
                >
                  {lectura.usuario.nombre} {lectura.usuario.apellido}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Información del autor y fecha */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600 border-t pt-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>
              Creado por <span className="font-medium">{novedad.creadoPor.nombre} {novedad.creadoPor.apellido}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatearFecha(novedad.fechaCreacion)}</span>
          </div>
        </div>

        {/* Botón de comentarios */}
        <div className="mt-4 pt-3 border-t">
          <button
            onClick={handleToggleComentarios}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {novedad.comentarios.length} comentario{novedad.comentarios.length !== 1 ? 's' : ''}
            </span>
            {tieneComentariosNuevos && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Sección de comentarios */}
      {mostrarComentarios && (
        <div className="border-t bg-gray-50">
          <div className="p-4 sm:p-6">
            {/* Lista de comentarios */}
            {novedad.comentarios.length > 0 && (
              <div className="space-y-4 mb-6">
                {novedad.comentarios.map((comentario) => {
                  const lectoresComentario = getLectoresComentario(comentario);
                  return (
                  <div key={comentario.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {comentario.autor.nombre} {comentario.autor.apellido}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({comentario.turno})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatearFecha(comentario.fecha)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {comentario.texto}
                    </p>
                    
                    {/* Fotos del comentario */}
                    {comentario.fotos && comentario.fotos.length > 0 && (
                      <div className="mt-3">
                        <PhotoGallery fotos={comentario.fotos} />
                      </div>
                    )}

                      {/* Quiénes leyeron este comentario */}
                      {lectoresComentario.length > 0 && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-800">
                              Visto por:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {lectoresComentario.map((lectura) => (
                              <span
                                key={lectura.id}
                                className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                                title={`Visto el ${formatearFecha(lectura.ultimoComentarioLeidoAt)}`}
                              >
                                {lectura.usuario?.nombre} {lectura.usuario?.apellido}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                  );
                })}
              </div>
            )}

            {/* Formulario para nuevo comentario */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="space-y-3">
                <textarea
                  ref={comentarioRef}
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={enviandoComentario}
                />
                
                <PhotoUpload
                  onPhotosSelected={setFotosComentario}
                  selectedFiles={fotosComentario}
                  maxFiles={3}
                  disabled={enviandoComentario}
                />
                
                <div className="flex justify-end">
                  <button
                    onClick={handleEnviarComentario}
                    disabled={(!nuevoComentario.trim() && fotosComentario.length === 0) || enviandoComentario}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <Send className="w-4 h-4" />
                    {enviandoComentario ? 'Enviando...' : 'Enviar comentario'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};