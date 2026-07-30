import React, { useCallback, useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Check, AlertCircle, Plus, FileText } from 'lucide-react';

interface PhotoUploadProps {
  onPhotosSelected: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  existingPhotos?: string[];
  selectedFiles?: File[];
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosSelected,
  maxFiles = 5,
  disabled = false,
  existingPhotos = [],
  selectedFiles: externalSelectedFiles
}) => {
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Usar archivos externos si se proporcionan, sino usar internos
  const selectedFiles = externalSelectedFiles || internalSelectedFiles;
  const setSelectedFiles = externalSelectedFiles ? onPhotosSelected : setInternalSelectedFiles;

  const validateAndAddFiles = useCallback((files: File[]) => {
    setError('');

    // Validar tipos de archivo
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB para PDF, 5MB para imágenes
      const isValidSize = file.size <= maxSize;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Algunos archivos no son válidos. Solo se permiten imágenes (hasta 5MB) y PDFs (hasta 10MB).');
    }

    const totalFiles = selectedFiles.length + existingPhotos.length + validFiles.length;
    if (totalFiles > maxFiles) {
      setError(`Solo se permiten máximo ${maxFiles} archivos.`);
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    if (!externalSelectedFiles) {
      onPhotosSelected(newFiles);
    }
    setShowOptions(false);
  }, [selectedFiles, existingPhotos, maxFiles, onPhotosSelected, externalSelectedFiles]);

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (!externalSelectedFiles) {
      onPhotosSelected(newFiles);
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    if (!externalSelectedFiles) {
      onPhotosSelected([]);
    }
    setError('');
  };

  return (
    <div className="space-y-3">
      {/* Botón principal de fotos */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-all duration-200 w-full justify-center ${
            disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-400'
              : showOptions
              ? 'border-blue-400 bg-blue-50 text-blue-600'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="font-medium">
            {selectedFiles.length > 0
              ? `${selectedFiles.length} archivo${selectedFiles.length > 1 ? 's' : ''} seleccionado${selectedFiles.length > 1 ? 's' : ''}`
              : 'Agregar archivos'
            }
          </span>
          {selectedFiles.length > 0 && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </button>

        {/* Opciones de selección */}
        {showOptions && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="p-2 space-y-1">
              <button
                type="button"
                onClick={handleCameraCapture}
                className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <Camera className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Tomar foto</div>
                  <div className="text-xs text-gray-500">Usar cámara del dispositivo</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={handleGallerySelect}
                className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Seleccionar de galería</div>
                  <div className="text-xs text-gray-500">Elegir fotos o PDFs existentes</div>
                </div>
              </button>
            </div>

            <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500">
              Máximo {maxFiles} archivos • JPG, PNG, WebP, PDF • Imágenes: 5MB | PDFs: 10MB
            </div>
          </div>
        )}
      </div>

      {/* Inputs ocultos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Preview de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Archivos seleccionados ({selectedFiles.length}/{maxFiles})
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Limpiar todo
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  {file.type === 'application/pdf' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                      <FileText className="w-12 h-12 text-red-600 mb-2" />
                      <span className="text-xs text-gray-600 text-center">PDF</span>
                    </div>
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Botón de eliminar */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Indicador de éxito */}
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                
                {/* Nombre del archivo */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-lg truncate">
                  {file.name}
                </div>
              </div>
            ))}
            
            {/* Botón para agregar más fotos */}
            {selectedFiles.length < maxFiles && (
              <button
                type="button"
                onClick={() => setShowOptions(true)}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors group"
              >
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
                <span className="text-xs text-gray-500 group-hover:text-gray-700 mt-1">
                  Agregar más
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};