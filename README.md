# Sistema de Novedades

## ✅ Configuración Automática de Storage

**¡BUENAS NOTICIAS!** El sistema ahora configura automáticamente el almacenamiento de fotos. 

La migración `configure_photos_bucket.sql` se ejecutará automáticamente y creará:
- ✅ Bucket 'photos' configurado como público
- ✅ Políticas de seguridad para subida, lectura y eliminación
- ✅ Límite de 50MB por archivo
- ✅ Soporte para JPEG, PNG, GIF y WebP

**No necesitas hacer nada manualmente** - el sistema funcionará automáticamente.

---

## Configuración de Supabase Storage

**NOTA**: Si prefieres configurar manualmente o tienes problemas, puedes seguir estos pasos:

### 1. Crear el Bucket 'photos'

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"New bucket"**
4. Nombra el bucket como: `photos`
5. Configura como **Public bucket** (recomendado para facilidad de uso)

### 2. Configurar Políticas de Seguridad (RLS)

Si no configuraste el bucket como público, necesitarás crear políticas RLS:

```sql
-- Política para permitir subida de archivos
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Política para permitir lectura de archivos
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'photos');

-- Política para permitir eliminación (opcional)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'photos');
```

### 3. Verificar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga las variables correctas:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 4. Estructura del Bucket

El sistema creará automáticamente estas carpetas:
- `photos/novedades/` - Para fotos de novedades
- `photos/comentarios/` - Para fotos de comentarios

## Solución de Problemas

### Error: "Bucket not found"
- Verifica que el bucket 'photos' existe en tu proyecto Supabase
- Confirma que las variables de entorno apuntan al proyecto correcto

### Error: "Row Level Security policy violation"
- Configura las políticas RLS como se muestra arriba
- O marca el bucket como público en la configuración

### Error de permisos
- Verifica que tu clave anónima tiene los permisos necesarios
- Revisa las políticas de seguridad del bucket