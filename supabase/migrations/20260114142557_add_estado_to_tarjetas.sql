/*
  # Agregar campo estado a tarjetas
  
  1. Cambios en tabla tarjetas
    - Agregar columna `estado` con valores: pendiente, en_progreso, en_revision, completado
    - Estado por defecto: pendiente
  
  2. Notas
    - Esto permite un seguimiento más detallado del progreso de las tareas
    - Compatible con el sistema de listas existente (columnas Kanban)
*/

-- Agregar columna estado a tarjetas si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tarjetas' AND column_name = 'estado'
  ) THEN
    ALTER TABLE tarjetas ADD COLUMN estado text DEFAULT 'pendiente';
    
    -- Agregar constraint para validar valores
    ALTER TABLE tarjetas ADD CONSTRAINT tarjetas_estado_check 
      CHECK (estado IN ('pendiente', 'en_progreso', 'en_revision', 'completado', 'bloqueado'));
  END IF;
END $$;