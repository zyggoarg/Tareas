/*
  # Popular correos electrónicos para usuarios existentes
  
  ## Descripción
  Esta migración asigna correos electrónicos a usuarios existentes que no tienen email configurado.
  
  ## Cambios realizados
  
  1. **Actualización de usuarios sin email:**
     - Genera correos electrónicos automáticamente usando el formato: {dni}@rotorc.com.ar
     - Solo afecta a usuarios que tengan email = NULL
  
  ## Notas importantes
  - Los usuarios podrán actualizar su correo posteriormente desde el panel de administración
  - Esta es una solución temporal para usuarios existentes
*/

-- Actualizar usuarios existentes sin email
UPDATE usuarios 
SET email = dni || '@rotorc.com.ar'
WHERE email IS NULL;