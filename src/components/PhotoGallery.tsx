import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';
import { Foto } from '../types';

interface PhotoGalleryProps {
  fotos: Foto[];
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ fotos, className = '' }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  if (!fotos || fotos.length === 0) {
    return null;
  }

  const openModal = (index: number) => {
    setSelectedPhoto(index);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const nextPhoto = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto((selectedPhoto + 1) % fotos.length);
    }
  };

  const prevPhoto = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto(selectedPhoto === 0 ? fotos.length - 1 : selectedPhoto - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  };

  const isPDF = (foto: Foto) => foto.nombreArchivo.toLowerCase().endsWith('.pdf');

  return (
    <>
      <div className={`grid gap-2 ${className}`}>
        {fotos.length === 1 && (
          <div className="relative group cursor-pointer" onClick={() => openModal(0)}>
            {isPDF(fotos[0]) ? (
              <div className="w-full h-32 bg-red-50 rounded-lg flex flex-col items-center justify-center border-2 border-red-200">
                <FileText className="w-12 h-12 text-red-600 mb-2" />
                <span className="text-xs text-red-800 font-medium">PDF</span>
                <span className="text-xs text-gray-600 truncate max-w-full px-2">{fotos[0].nombreArchivo}</span>
              </div>
            ) : (
              <img
                src={fotos[0].url}
                alt={fotos[0].nombreArchivo}
                className="w-full h-32 object-cover rounded-lg"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
              {isPDF(fotos[0]) ? (
                <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              ) : (
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
        )}

        {fotos.length === 2 && (
          <div className="grid grid-cols-2 gap-2">
            {fotos.map((foto, index) => (
              <div
                key={foto.id}
                className="relative group cursor-pointer"
                onClick={() => openModal(index)}
              >
                {isPDF(foto) ? (
                  <div className="w-full h-24 bg-red-50 rounded-lg flex flex-col items-center justify-center border-2 border-red-200">
                    <FileText className="w-8 h-8 text-red-600" />
                    <span className="text-xs text-red-800">PDF</span>
                  </div>
                ) : (
                  <img
                    src={foto.url}
                    alt={foto.nombreArchivo}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  {isPDF(foto) ? (
                    <Download className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {fotos.length >= 3 && (
          <div className="grid grid-cols-3 gap-2">
            {fotos.slice(0, 3).map((foto, index) => (
              <div
                key={foto.id}
                className="relative group cursor-pointer"
                onClick={() => openModal(index)}
              >
                {isPDF(foto) ? (
                  <div className="w-full h-20 bg-red-50 rounded-lg flex flex-col items-center justify-center border-2 border-red-200">
                    <FileText className="w-6 h-6 text-red-600" />
                    <span className="text-[10px] text-red-800">PDF</span>
                  </div>
                ) : (
                  <img
                    src={foto.url}
                    alt={foto.nombreArchivo}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                )}
                {index === 2 && fotos.length > 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">+{fotos.length - 3}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  {isPDF(foto) ? (
                    <Download className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de visualización */}
      {selectedPhoto !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative w-full h-full p-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {fotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {isPDF(fotos[selectedPhoto]) ? (
              <div className="flex flex-col items-center justify-center h-full" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white rounded-lg p-8 max-w-md">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <FileText className="w-24 h-24 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Documento PDF</h3>
                      <p className="text-sm text-gray-600 mb-4">{fotos[selectedPhoto].nombreArchivo}</p>
                    </div>
                    <a
                      href={fotos[selectedPhoto].url}
                      download
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-5 h-5" />
                      Descargar PDF
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={fotos[selectedPhoto].url}
                alt={fotos[selectedPhoto].nombreArchivo}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {!isPDF(fotos[selectedPhoto]) && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg inline-block">
                  <p className="text-sm">{fotos[selectedPhoto].nombreArchivo}</p>
                  {fotos.length > 1 && (
                    <p className="text-xs opacity-75">
                      {selectedPhoto + 1} de {fotos.length}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};