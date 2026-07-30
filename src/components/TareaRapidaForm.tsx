import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { Tablero, Usuario } from '../types';
import { supabase } from '../lib/supabase';

interface TareaRapidaFormProps {
  usuarioActual: Usuario;
  tableros: Tablero[];
  onCrearTarea: (datos: {
    tableroId: string;
    listaId: string;
    titulo: string;
    descripcion?: string;
    prioridad?: 'baja' | 'media' | 'alta' | 'critica';
    fechaInicio?: Date;
    fechaVencimiento?: Date;
  }) => Promise<void>;
  onCancelar: () => void;
}

export const TareaRapidaForm = ({
  usuarioActual,
  tableros,
  onCrearTarea,
  onCancelar
}: TareaRapidaFormProps) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [tableroSeleccionado, setTableroSeleccionado] = useState('');
  const [listaSeleccionada, setListaSeleccionada] = useState('');
  const [listas, setListas] = useState<any[]>([]);
  const [cargandoListas, setCargandoListas] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (tableroSeleccionado) {
      cargarListas(tableroSeleccionado);
    } else {
      setListas([]);
      setListaSeleccionada('');
    }
  }, [tableroSeleccionado]);

  const cargarListas = async (tableroId: string) => {
    try {
      setCargandoListas(true);
      const { data, error } = await supabase
        .from('listas')
        .select('*')
        .eq('tablero_id', tableroId)
        .eq('activo', true)
        .order('orden', { ascending: true });

      if (error) throw error;
      setListas(data || []);

      if (data && data.length > 0) {
        setListaSeleccionada(data[0].id);
      }
    } catch (error) {
      // Error cargando listas
      setListas([]);
    } finally {
      setCargandoListas(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !tableroSeleccionado || !listaSeleccionada) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setEnviando(true);
      await onCrearTarea({
        tableroId: tableroSeleccionado,
        listaId: listaSeleccionada,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        prioridad,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined
      });
    } catch (error) {
      // Error creando tarea
      alert('Error al crear la tarea');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Nueva Tarea Rápida</h2>
        <button
          onClick={onCancelar}
          className="text-gray-400 hover:text-gray-600"
          disabled={enviando}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Revisar documentación del proyecto"
            required
            disabled={enviando}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tablero <span className="text-red-500">*</span>
          </label>
          <select
            value={tableroSeleccionado}
            onChange={(e) => setTableroSeleccionado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={enviando}
          >
            <option value="">Selecciona un tablero</option>
            {tableros.map(tablero => (
              <option key={tablero.id} value={tablero.id}>
                {tablero.nombre}
              </option>
            ))}
          </select>
        </div>

        {tableroSeleccionado && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lista <span className="text-red-500">*</span>
            </label>
            {cargandoListas ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : (
              <select
                value={listaSeleccionada}
                onChange={(e) => setListaSeleccionada(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={enviando || listas.length === 0}
              >
                {listas.length === 0 ? (
                  <option value="">No hay listas disponibles</option>
                ) : (
                  <>
                    <option value="">Selecciona una lista</option>
                    {listas.map(lista => (
                      <option key={lista.id} value={lista.id}>
                        {lista.nombre}
                      </option>
                    ))}
                  </>
                )}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Descripción opcional de la tarea"
            disabled={enviando}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as 'baja' | 'media' | 'alta' | 'critica')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={enviando}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inicio (opcional)
            </label>
            <input
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={enviando}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fin (opcional)
            </label>
            <input
              type="datetime-local"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={enviando}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={enviando || !titulo.trim() || !tableroSeleccionado || !listaSeleccionada}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Tarea'
            )}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            disabled={enviando}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
