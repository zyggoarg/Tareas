import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { Sector } from '../types';

interface MultiSelectSectoresProps {
  sectores: Sector[];
  sectoresSeleccionados: string[];
  onCambioSeleccion: (sectoresIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MultiSelectSectores: React.FC<MultiSelectSectoresProps> = ({
  sectores,
  sectoresSeleccionados,
  onCambioSeleccion,
  placeholder = "Seleccionar sectores...",
  disabled = false
}) => {
  const [abierto, setAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSector = (sectorId: string) => {
    if (sectoresSeleccionados.includes(sectorId)) {
      onCambioSeleccion(sectoresSeleccionados.filter(id => id !== sectorId));
    } else {
      onCambioSeleccion([...sectoresSeleccionados, sectorId]);
    }
  };

  const removerSector = (sectorId: string) => {
    onCambioSeleccion(sectoresSeleccionados.filter(id => id !== sectorId));
  };

  const sectoresSeleccionadosData = sectores.filter(s => sectoresSeleccionados.includes(s.id));

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Campo principal */}
      <div
        onClick={() => !disabled && setAbierto(!abierto)}
        className={`w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {sectoresSeleccionadosData.length === 0 ? (
              <span className="text-gray-500 text-sm">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {sectoresSeleccionadosData.map((sector) => (
                  <span
                    key={sector.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {sector.nombre}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removerSector(sector.id);
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

      {/* Dropdown */}
      {abierto && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {sectores.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No hay sectores disponibles</div>
          ) : (
            sectores.map((sector) => {
              const seleccionado = sectoresSeleccionados.includes(sector.id);
              return (
                <div
                  key={sector.id}
                  onClick={() => toggleSector(sector.id)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                    seleccionado ? 'bg-blue-50' : ''
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">{sector.nombre}</div>
                    {sector.descripcion && (
                      <div className="text-xs text-gray-500">{sector.descripcion}</div>
                    )}
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