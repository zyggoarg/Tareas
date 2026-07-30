import { useState } from 'react';
import { X } from 'lucide-react';
import { Lista } from '../types';

interface EditarListaModalProps {
  lista: Lista;
  onCerrar: () => void;
  onActualizar: (listaId: string, nombre: string) => Promise<void>;
}

export const EditarListaModal = ({
  lista,
  onCerrar,
  onActualizar
}: EditarListaModalProps) => {
  const [nombre, setNombre] = useState(lista.nombre);
  const [actualizando, setActualizando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      setActualizando(true);
      await onActualizar(lista.id, nombre.trim());
      onCerrar();
    } catch (error) {
      alert('Error al actualizar la lista');
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Editar Lista</h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
            disabled={actualizando}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la lista *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Por hacer"
              disabled={actualizando}
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={actualizando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={actualizando || !nombre.trim()}
            >
              {actualizando ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
