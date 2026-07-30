import { useState } from 'react';
import { ArrowLeft, Plus, LayoutGrid, Calendar, List as ListIcon } from 'lucide-react';
import { Tablero, Usuario, Tarjeta, Lista } from '../types';
import { ListaColumn } from './ListaColumn';
import { GanttView } from './GanttView';
import { EstadosView } from './EstadosView';

interface TableroBoardProps {
  tablero: Tablero;
  usuarioActual: Usuario;
  onVolverATableros: () => void;
  onCrearLista: (tableroId: string, nombre: string) => Promise<void>;
  onCrearTarjeta: (datos: {
    listaId: string;
    titulo: string;
    descripcion?: string;
    prioridad?: 'baja' | 'media' | 'alta' | 'critica';
    fechaVencimiento?: Date;
    creadoPorId: string;
    asignadoAId?: string;
  }) => Promise<Tarjeta>;
  onMoverTarjeta: (tarjetaId: string, nuevaListaId: string, nuevoOrden: number) => Promise<void>;
  onActualizarTarjeta: (tarjetaId: string, datos: any) => Promise<void>;
  onEliminarTarjeta: (tarjetaId: string) => Promise<void>;
  onEliminarLista: (listaId: string) => Promise<void>;
  onEditarLista?: (lista: Lista) => void;
  onAgregarComentario?: (tarjetaId: string, texto: string) => Promise<void>;
  onSubirAdjunto?: (tarjetaId: string, archivo: File) => Promise<void>;
  onRegistrarActividad?: (tarjetaId: string, usuarioId: string, tipo: string, descripcion: string, metadata?: Record<string, any>) => Promise<void>;
  onAgregarEtiqueta?: (tarjetaId: string, etiquetaId: string) => Promise<void>;
  onQuitarEtiqueta?: (tarjetaId: string, etiquetaId: string) => Promise<void>;
  onAgregarAsignado?: (tarjetaId: string, usuarioId: string) => Promise<void>;
  onQuitarAsignado?: (tarjetaId: string, usuarioId: string) => Promise<void>;
}

export const TableroBoard = ({
  tablero,
  usuarioActual,
  onVolverATableros,
  onCrearLista,
  onCrearTarjeta,
  onMoverTarjeta,
  onActualizarTarjeta,
  onEliminarTarjeta,
  onEliminarLista,
  onEditarLista,
  onAgregarComentario,
  onSubirAdjunto,
  onRegistrarActividad,
  onAgregarEtiqueta,
  onQuitarEtiqueta,
  onAgregarAsignado,
  onQuitarAsignado
}: TableroBoardProps) => {
  const [nombreNuevaLista, setNombreNuevaLista] = useState('');
  const [mostrandoFormLista, setMostrandoFormLista] = useState(false);
  const [creandoLista, setCreandoLista] = useState(false);
  const [tipoVista, setTipoVista] = useState<'kanban' | 'gantt' | 'estados'>('kanban');

  const handleCrearLista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevaLista.trim()) return;

    try {
      setCreandoLista(true);
      await onCrearLista(tablero.id, nombreNuevaLista.trim());
      setNombreNuevaLista('');
      setMostrandoFormLista(false);
    } catch (error) {
      alert('Error al crear la lista');
    } finally {
      setCreandoLista(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onVolverATableros}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver a tableros"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tablero.nombre}</h2>
            {tablero.descripcion && (
              <p className="text-sm text-gray-500 mt-1">{tablero.descripcion}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Selector de vista */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTipoVista('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                tipoVista === 'kanban'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">Kanban</span>
            </button>
            <button
              onClick={() => setTipoVista('estados')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                tipoVista === 'estados'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista por Estados"
            >
              <ListIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Estados</span>
            </button>
            <button
              onClick={() => setTipoVista('gantt')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                tipoVista === 'gantt'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista Gantt"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Gantt</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Proyecto: <span className="font-medium text-gray-700">{tablero.proyecto.nombre}</span>
            </span>
            {tablero.sector && (
              <span className="text-sm text-gray-500">
                | Sector: <span className="font-medium text-gray-700">{tablero.sector.nombre}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {tipoVista === 'kanban' ? (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max">
            {tablero.listas?.map(lista => (
              <ListaColumn
                key={lista.id}
                lista={lista}
                usuarioActual={usuarioActual}
                onCrearTarjeta={onCrearTarjeta}
                onMoverTarjeta={onMoverTarjeta}
                onActualizarTarjeta={onActualizarTarjeta}
                onEliminarTarjeta={onEliminarTarjeta}
                onEliminarLista={onEliminarLista}
                onEditarLista={onEditarLista}
                onAgregarComentario={onAgregarComentario}
                onSubirAdjunto={onSubirAdjunto}
                onRegistrarActividad={onRegistrarActividad}
                onAgregarEtiqueta={onAgregarEtiqueta}
                onQuitarEtiqueta={onQuitarEtiqueta}
                onAgregarAsignado={onAgregarAsignado}
                onQuitarAsignado={onQuitarAsignado}
                tableroId={tablero.id}
              />
            ))}

            <div className="w-80 flex-shrink-0">
              {mostrandoFormLista ? (
                <form onSubmit={handleCrearLista} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <input
                    type="text"
                    value={nombreNuevaLista}
                    onChange={(e) => setNombreNuevaLista(e.target.value)}
                    placeholder="Nombre de la lista..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    disabled={creandoLista}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creandoLista || !nombreNuevaLista.trim()}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creandoLista ? 'Creando...' : 'Agregar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrandoFormLista(false);
                        setNombreNuevaLista('');
                      }}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={creandoLista}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setMostrandoFormLista(true)}
                  className="w-full p-3 bg-white/50 hover:bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Lista
                </button>
              )}
            </div>
          </div>
        </div>
      ) : tipoVista === 'estados' ? (
        <EstadosView
          tablero={tablero}
          usuarioActual={usuarioActual}
          onMoverTarjeta={onMoverTarjeta}
          onActualizarTarjeta={onActualizarTarjeta}
          onEliminarTarjeta={onEliminarTarjeta}
          onAgregarComentario={onAgregarComentario}
          onSubirAdjunto={onSubirAdjunto}
          onRegistrarActividad={onRegistrarActividad}
        />
      ) : (
        <div className="flex-1 overflow-hidden">
          <GanttView
            tablero={tablero}
            usuarioActual={usuarioActual}
            onActualizarTarjeta={onActualizarTarjeta}
            onEliminarTarjeta={onEliminarTarjeta}
            onAgregarComentario={onAgregarComentario || (() => Promise.resolve())}
            onRegistrarActividad={(tarjetaId, tipo, descripcion, metadata) =>
              onRegistrarActividad?.(tarjetaId, usuarioActual.id, tipo, descripcion, metadata) || Promise.resolve()
            }
            onSubirAdjunto={onSubirAdjunto || (() => Promise.resolve())}
          />
        </div>
      )}
    </div>
  );
};
