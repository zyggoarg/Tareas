import { useState } from 'react';
import { MessageSquare, Activity, Send, Paperclip, Trash2 } from 'lucide-react';
import { Tarjeta, TarjetaAdjunto, Usuario } from '../types';
import { supabase } from '../lib/supabase';

interface TarjetaComentariosActividadProps {
  tarjeta: Tarjeta;
  usuarioActual: Usuario;
  adjuntos: TarjetaAdjunto[];
  onAgregarComentario?: (tarjetaId: string, texto: string) => Promise<void>;
  onSubirAdjunto?: (tarjetaId: string, archivo: File) => Promise<void>;
  onAdjuntoEliminado?: () => void;
}

export const TarjetaComentariosActividad = ({
  tarjeta,
  usuarioActual,
  adjuntos,
  onAgregarComentario,
  onSubirAdjunto,
  onAdjuntoEliminado
}: TarjetaComentariosActividadProps) => {
  const comentarios = tarjeta.comentarios || [];
  const actividad = tarjeta.actividad || [];
  const [vista, setVista] = useState<'comentarios' | 'actividad' | 'adjuntos'>('comentarios');
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [eliminandoAdjunto, setEliminandoAdjunto] = useState<string | null>(null);

  const handleEliminarAdjunto = async (adjunto: TarjetaAdjunto) => {
    if (!window.confirm(`Eliminar "${adjunto.nombreArchivo}"?`)) return;

    try {
      setEliminandoAdjunto(adjunto.id);

      if (adjunto.urlStorage) {
        await supabase.storage
          .from('photos')
          .remove([adjunto.urlStorage]);
      }

      const { error } = await supabase
        .from('tarjeta_adjuntos')
        .delete()
        .eq('id', adjunto.id);

      if (error) throw error;

      onAdjuntoEliminado?.();
    } catch (error) {
      alert('Error al eliminar adjunto');
    } finally {
      setEliminandoAdjunto(null);
    }
  };

  const handleEnviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !onAgregarComentario) return;

    try {
      setEnviandoComentario(true);
      await onAgregarComentario(tarjeta.id, nuevoComentario.trim());
      setNuevoComentario('');
    } catch (error) {
      alert('Error al agregar comentario');
    } finally {
      setEnviandoComentario(false);
    }
  };

  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fecha).getTime();
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;

    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActividadIcon = (tipo: string) => {
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="border-t border-gray-200">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setVista('comentarios')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            vista === 'comentarios'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Comentarios ({comentarios.length})
        </button>
        <button
          onClick={() => setVista('actividad')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            vista === 'actividad'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          Actividad ({actividad.length})
        </button>
        <button
          onClick={() => setVista('adjuntos')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            vista === 'adjuntos'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Paperclip className="w-4 h-4" />
          Adjuntos ({adjuntos.length})
        </button>
      </div>

      <div className="p-4">
        {vista === 'comentarios' && (
          <div className="space-y-4">
            <form onSubmit={handleEnviarComentario} className="space-y-2">
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                  {usuarioActual.nombre[0]}{usuarioActual.apellido[0]}
                </div>
                <div className="flex-1">
                  <textarea
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    disabled={enviandoComentario}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={enviandoComentario || !nuevoComentario.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {enviandoComentario ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </form>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comentarios.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay comentarios aún</p>
              ) : (
                comentarios.map(comentario => (
                  <div key={comentario.id} className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                      {comentario.usuario.nombre[0]}{comentario.usuario.apellido[0]}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {comentario.usuario.nombre} {comentario.usuario.apellido}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatearFecha(comentario.fechaCreacion)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comentario.texto}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {vista === 'actividad' && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {actividad.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay actividad registrada</p>
            ) : (
              actividad.map(act => (
                <div key={act.id} className="flex gap-2 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getActividadIcon(act.tipo)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{act.usuario.nombre} {act.usuario.apellido}</span>
                      {' '}{act.descripcion}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatearFecha(act.fechaCreacion)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {vista === 'adjuntos' && (
          <div className="space-y-3">
            {onSubirAdjunto && (
              <div>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Subir archivo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const archivo = e.target.files?.[0];
                      if (archivo && onSubirAdjunto) {
                        onSubirAdjunto(tarjeta.id, archivo);
                      }
                    }}
                  />
                </label>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {adjuntos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay archivos adjuntos</p>
              ) : (
                adjuntos.map(adjunto => (
                  <div
                    key={adjunto.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {adjunto.tipoMime.startsWith('image/') ? (
                      <img
                        src={adjunto.url}
                        alt={adjunto.nombreArchivo}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Paperclip className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {adjunto.nombreArchivo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(adjunto.tamaño / 1024).toFixed(1)} KB • {formatearFecha(adjunto.fechaCreacion)}
                      </p>
                    </div>
                    <a
                      href={adjunto.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => handleEliminarAdjunto(adjunto)}
                      disabled={eliminandoAdjunto === adjunto.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Eliminar adjunto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
