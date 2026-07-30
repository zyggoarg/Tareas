/*
  # Agregar correo electrónico y módulos a usuarios
  
  ## Descripción
  Esta migración agrega funcionalidad de correo electrónico real y selección de módulos a los usuarios.
  
  ## Cambios realizados
  
  1. **Nuevos campos en tabla usuarios:**
     - `email` (text): Correo electrónico único del usuario para login
     - `modulo_novedades` (boolean): Si el usuario tiene acceso al módulo de novedades
     - `modulo_tareas` (boolean): Si el usuario tiene acceso al módulo de tareas (Trello-like)
  
  2. **Valores por defecto:**
     - `modulo_novedades`: true (todos los usuarios existentes tendrán acceso)
     - `modulo_tareas`: true (todos los usuarios existentes tendrán acceso)
  
  3. **Validaciones:**
     - El email debe ser único
     - Al menos uno de los módulos debe estar activo
  
  ## Notas importantes
  - Los usuarios existentes recibirán ambos módulos activos por defecto
  - El campo email es nullable inicialmente para compatibilidad con usuarios existentes
  - Se mantiene el campo dni para registro histórico
*/

-- Agregar campo email a la tabla usuarios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'email'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN email text;
  END IF;
END $$;

-- Agregar índice único para email (permitiendo nulls para usuarios existentes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'usuarios_email_key'
  ) THEN
    CREATE UNIQUE INDEX usuarios_email_key ON usuarios(email) WHERE email IS NOT NULL;
  END IF;
END $$;

-- Agregar campo modulo_novedades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'modulo_novedades'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN modulo_novedades boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Agregar campo modulo_tareas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'modulo_tareas'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN modulo_tareas boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Agregar constraint para asegurar que al menos un módulo esté activo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_at_least_one_module'
  ) THEN
    ALTER TABLE usuarios 
    ADD CONSTRAINT usuarios_at_least_one_module 
    CHECK (modulo_novedades = true OR modulo_tareas = true);
  END IF;
END $$;