import React, { useState } from 'react';
import { FolderKanban, Check, ChevronDown } from 'lucide-react';
import { Proyecto } from '../types';

interface ProjectSelectorProps {
  proyectos: Proyecto[];
  proyectoActivo: Proyecto | null;
  onCambiarProyecto: (proyecto: Proyecto) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  proyectos,
  proyectoActivo,
  onCambiarProyecto
}) => {
  const [abierto, setAbierto] = useState(false);

  const proyectosActivos = proyectos.filter(p => p.estado === 'activo' && p.activo);

  if (proyectosActivos.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 min-w-0 sm:min-w-[200px] max-w-[45vw] sm:max-w-none"
      >
        <FolderKanban className="w-4 h-4 text-blue-600" />
        <span className="flex-1 text-left truncate">
          {proyectoActivo ? proyectoActivo.nombre : 'Seleccionar proyecto'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setAbierto(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-[300px] overflow-y-auto">
            {proyectosActivos.map((proyecto) => (
              <button
                key={proyecto.id}
                onClick={() => {
                  onCambiarProyecto(proyecto);
                  setAbierto(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                  proyectoActivo?.id === proyecto.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">{proyecto.nombre}</div>
                    {proyecto.descripcion && (
                      <div className="text-xs text-gray-500 truncate max-w-[250px]">
                        {proyecto.descripcion}
                      </div>
                    )}
                  </div>
                </div>
                {proyectoActivo?.id === proyecto.id && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
