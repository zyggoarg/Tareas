import React, { useState } from 'react';
import { Plus, AlertTriangle, Info, Wrench, Shield, Users, Building2, Monitor, Award, Sun, Moon, Camera } from 'lucide-react';
import { PrioridadNovedad, Usuario, Sector } from '../types';
import { InlinePhotoUpload } from './InlinePhotoUpload';

interface NovedadFormProps {
  usuarioActual: Usuario;
  sectores: Sector[];
  onCancelar?: () => void;
  onAgregarNovedad: (novedad: {
    turno: 'mañana' | 'noche';
    titulo: string;
    descripcion: string;
    sectorId: string;
    prioridad: PrioridadNovedad;
    creadoPorId: string;
  }, fotosNovedad?: File[]) => void;
}

export const NovedadForm: React.FC<NovedadFormProps> = ({ 
  usuarioActual, 
  sectores,
  onCancelar,
  onAgregarNovedad 
}) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadNovedad>('media');
  const [turno, setTurno] = useState<'mañana' | 'noche'>('mañana');
  const [fotosNovedad, setFotosNovedad] = useState<File[]>([]);
  const [cargando, setCargando] = useState(false);

  // Filtrar sectores para mostrar solo los asignados al usuario
  const sectoresDisponibles = usuarioActual.rol === 'administrador' 
    ? (usuarioActual.sectores && usuarioActual.sectores.length > 0 ? usuarioActual.sectores : sectores)
    : (usuarioActual.sectores || []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim() || !sectorId || cargando) return;

    setCargando(true);
    
    try {
      await onAgregarNovedad({
        turno,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        sectorId,
        prioridad,
        creadoPorId: usuarioActual.id
      }, fotosNovedad.length > 0 ? fotosNovedad : undefined);

      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setSectorId('');
      setPrioridad('media');
      setTurno('mañana');
      setFotosNovedad([]);
    } catch (error) {
      // Error al crear novedad
      // En caso de error, mantener el estado de carga como false
      setCargando(false);
    } finally {
      // Pequeño delay para evitar problemas de renderizado en Android
      setTimeout(() => {
        setCargando(false);
      }, 100);
    }
  };

  const getSectorIcon = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('operacional')) return <Info className="w-4 h-4" />;
    if (nombreLower.includes('mantenimiento')) return <Wrench className="w-4 h-4" />;
    if (nombreLower.includes('seguridad')) return <Shield className="w-4 h-4" />;
    if (nombreLower.includes('personal')) return <Users className="w-4 h-4" />;
    if (nombreLower.includes('sistemas')) return <Monitor className="w-4 h-4" />;
    if (nombreLower.includes('calidad')) return <Award className="w-4 h-4" />;
    return <Building2 className="w-4 h-4" />;
  };

  const getPrioridadColor = (prio: PrioridadNovedad) => {
    switch (prio) {
      case 'baja': return 'text-green-600';
      case 'media': return 'text-yellow-600';
      case 'alta': return 'text-orange-600';
      case 'critica': return 'text-red-600';
    }
  };

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">
        Nueva Novedad
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Resumen breve de la novedad"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción y Fotos
          </label>
          <div className="space-y-3">
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe la novedad..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            
            <InlinePhotoUpload
              photos={fotosNovedad}
              onPhotosChange={setFotosNovedad}
              placeholder="Describe la novedad..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar sector</option>
              {sectoresDisponibles.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Indique su turno
            </label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value as 'mañana' | 'noche')}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="mañana">Mañana</option>
              <option value="noche">Noche</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as 'baja' | 'media' | 'alta' | 'critica')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Creado por
            </label>
            <div className="w-full px-3 py-2 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-md text-gray-700">
              {usuarioActual.nombre} {usuarioActual.apellido}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={cargando || !titulo.trim() || !descripcion.trim() || !sectorId}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md transition-all duration-200"
          >
            {cargando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Crear Novedad
              </>
            )}
          </button>
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              disabled={cargando}
              className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};