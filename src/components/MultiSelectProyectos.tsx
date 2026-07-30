import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { Proyecto } from '../types';

interface MultiSelectProyectosProps {
  proyectos: Proyecto[];
  proyectosSeleccionados: string[];
  onCambioSeleccion: (proyectosIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MultiSelectProyectos: React.FC<MultiSelectProyectosProps> = ({
  proyectos,
  proyectosSeleccionados,
  onCambioSeleccion,
  placeholder = "Seleccionar proyectos...",
  disabled = false
}) => {
  const [abierto, setAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProyecto = (proyectoId: string) => {
    if (proyectosSeleccionados.includes(proyectoId)) {
      onCambioSeleccion(proyectosSeleccionados.filter(id => id !== proyectoId));
    } else {
      onCambioSeleccion([...proyectosSeleccionados, proyectoId]);
    }
  };

  const removerProyecto = (proyectoId: string) => {
    onCambioSeleccion(proyectosSeleccionados.filter(id => id !== proyectoId));
  };

  const proyectosSeleccionadosData = proyectos.filter(p => proyectosSeleccionados.includes(p.id));

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => !disabled && setAbierto(!abierto)}
        className={`w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {proyectosSeleccionadosData.length === 0 ? (
              <span className="text-gray-500 text-sm">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {proyectosSeleccionadosData.map((proyecto) => (
                  <span
                    key={proyecto.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {proyecto.nombre}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removerProyecto(proyecto.id);
                        }}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
          {!disabled && (
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                abierto ? 'transform rotate-180' : ''
              }`}
            />
          )}
        </div>
      </div>

      {abierto && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {proyectos.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No hay proyectos disponibles</div>
          ) : (
            proyectos.map((proyecto) => {
              const seleccionado = proyectosSeleccionados.includes(proyecto.id);
              return (
                <div
                  key={proyecto.id}
                  onClick={() => toggleProyecto(proyecto.id)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                    seleccionado ? 'bg-blue-50' : ''
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">{proyecto.nombre}</div>
                    {proyecto.descripcion && (
                      <div className="text-xs text-gray-500">{proyecto.descripcion}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      {proyecto.estado === 'activo' ? 'Activo' : 'Finalizado'}
                    </div>
                  </div>
                  {seleccionado && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
