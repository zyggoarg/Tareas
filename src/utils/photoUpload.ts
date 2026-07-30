import { supabase } from '../lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadFile = async (file: File, folder: string = 'novedades'): Promise<UploadResult> => {
  try {
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Intentar subir archivo a Supabase Storage
    let uploadResult;
    try {
      uploadResult = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
    } catch (uploadError) {
      return {
        success: false,
        error: 'Error de conexión al subir la foto. Verifique su conexión a internet.'
      };
    }

    const { data, error } = uploadResult;

    if (error) {
      // Manejar específicamente el error de bucket no encontrado
      if (error.message?.includes('Bucket not found') || error.message?.includes('bucket') || error.statusCode === '404') {
        return {
          success: false,
          error: 'El almacenamiento de fotos no está configurado. Por favor, contacte al administrador del sistema para configurar el bucket "photos" en Supabase Storage.'
        };
      }

      return { success: false, error: `Error subiendo archivo: ${error.message}` };
    }

    // Obtener URL pública
    let publicUrl;
    try {
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    } catch (urlError) {
      return {
        success: false,
        error: 'Error obteniendo la URL de la foto subida.'
      };
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    return {
      success: false,
      error: 'Error inesperado al subir el archivo. Verifique que el almacenamiento esté configurado correctamente.'
    };
  }
};

export const uploadPhoto = uploadFile;

export const deletePhoto = async (url: string): Promise<boolean> => {
  try {
    // Extraer el path del archivo de la URL
    const urlParts = url.split('/');
    const filePath = urlParts.slice(-2).join('/'); // folder/filename

    const { error } = await supabase.storage
      .from('photos')
      .remove([filePath]);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};