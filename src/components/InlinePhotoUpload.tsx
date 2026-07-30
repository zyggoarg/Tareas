import React, { useState, useRef } from 'react';
import { Camera, X, Upload, AlertCircle, FileText } from 'lucide-react';

interface InlinePhotoUploadProps {
  onPhotosChange: (photos: File[]) => void;
  photos: File[];
  placeholder?: string;
  disabled?: boolean;
}

export const InlinePhotoUpload: React.FC<InlinePhotoUploadProps> = ({
  onPhotosChange,
  photos,
  placeholder = "Escribe tu mensaje aquí...",
  disabled = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    const updatedPhotos = [...photos, ...newFiles];
    onPhotosChange(updatedPhotos);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Área de arrastrar y soltar */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-4 transition-colors
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Camera className="w-5 h-5" />
            <span className="text-sm">
              {dragOver
                ? 'Suelta los archivos aquí'
                : 'Arrastra archivos aquí o haz clic para seleccionar'
              }
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Imágenes: JPG, PNG, GIF | Documentos: PDF
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {photos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Archivos seleccionados ({photos.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {photo.type === 'application/pdf' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                      <FileText className="w-12 h-12 text-red-600 mb-2" />
                      <span className="text-xs text-gray-600">PDF</span>
                    </div>
                  ) : (
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs p-1 rounded truncate">
                  {photo.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};