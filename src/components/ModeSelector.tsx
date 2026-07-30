import { FileText, LayoutGrid } from 'lucide-react';

interface ModeSelectorProps {
  modo: 'novedades' | 'tareas';
  onCambiarModo: (modo: 'novedades' | 'tareas') => void;
}

export const ModeSelector = ({ modo, onCambiarModo }: ModeSelectorProps) => {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 rounded-lg p-0.5 sm:p-1 shrink-0">
      <button
        onClick={() => onCambiarModo('novedades')}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
          modo === 'novedades'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="hidden sm:inline">Novedades</span>
        <span className="sm:hidden">Nov.</span>
      </button>
      <button
        onClick={() => onCambiarModo('tareas')}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
          modo === 'tareas'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        Tareas
      </button>
    </div>
  );
};
