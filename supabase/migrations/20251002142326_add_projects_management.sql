/*
  # Gestión de Proyectos

  ## Descripción
  Este migration agrega la funcionalidad completa de gestión de proyectos al sistema.
  Permite a los administradores crear, editar y gestionar proyectos, y a los usuarios
  seleccionar el proyecto activo en el que están trabajando.

  ## Nuevas Tablas
  
  ### `proyectos`
  Tabla principal para almacenar la información de los proyectos.
  - `id` (uuid, primary key) - Identificador único del proyecto
  - `nombre` (text, NOT NULL, UNIQUE) - Nombre del proyecto
  - `descripcion` (text) - Descripción del proyecto
  - `estado` (text, NOT NULL) - Estado del proyecto: 'activo', 'finalizado'
  - `activo` (boolean, default true) - Si el proyecto está activo en el sistema
  - `created_at` (timestamptz) - Fecha de creación del proyecto
  - `updated_at` (timestamptz) - Fecha de última actualización

  ### `usuario_proyectos`
  Tabla de relación muchos a muchos entre usuarios y proyectos.
  - `id` (uuid, primary key) - Identificador único
  - `usuario_id` (uuid, NOT NULL) - Referencia al usuario
  - `proyecto_id` (uuid, NOT NULL) - Referencia al proyecto
  - `created_at` (timestamptz) - Fecha de asignación

  ## Modificaciones a Tablas Existentes
  
  ### `novedades`
  - Se agrega `proyecto_id` (uuid) - Proyecto al que pertenece la novedad

  ## Índices
  - Índice único en usuario_proyectos (usuario_id, proyecto_id) para evitar duplicados
  - Índice en novedades.proyecto_id para mejorar consultas

  ## Seguridad (RLS)
  
  ### proyectos
  - Los usuarios autenticados pueden ver todos los proyectos
  - Solo administradores pueden crear, actualizar o eliminar proyectos
  
  ### usuario_proyectos
  - Los usuarios pueden ver sus propias asignaciones
  - Los administradores pueden ver todas las asignaciones
  - Solo administradores pueden crear o eliminar asignaciones

  ## Notas Importantes
  1. Las novedades ahora están asociadas a proyectos además de sectores
  2. Los administradores pueden gestionar proyectos de manera completa
  3. Los usuarios solo pueden trabajar en proyectos asignados
  4. Un proyecto puede estar activo o finalizado, pero siempre visible en el sistema
*/

-- Crear tabla de proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado')),
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de relación usuario-proyectos
CREATE TABLE IF NOT EXISTS usuario_proyectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  proyecto_id uuid NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(usuario_id, proyecto_id)
);

-- Agregar columna proyecto_id a novedades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'novedades' AND column_name = 'proyecto_id'
  ) THEN
    ALTER TABLE novedades ADD COLUMN proyecto_id uuid REFERENCES proyectos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_novedades_proyecto_id ON novedades(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_usuario_proyectos_usuario_id ON usuario_proyectos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_proyectos_proyecto_id ON usuario_proyectos(proyecto_id);

-- Habilitar RLS en proyectos
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

-- Políticas para proyectos
CREATE POLICY "Usuarios autenticados pueden ver proyectos"
  ON proyectos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden crear proyectos"
  ON proyectos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

CREATE POLICY "Solo administradores pueden actualizar proyectos"
  ON proyectos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

CREATE POLICY "Solo administradores pueden eliminar proyectos"
  ON proyectos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

-- Habilitar RLS en usuario_proyectos
ALTER TABLE usuario_proyectos ENABLE ROW LEVEL SECURITY;

-- Políticas para usuario_proyectos
CREATE POLICY "Usuarios pueden ver sus propios proyectos"
  ON usuario_proyectos FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

CREATE POLICY "Solo administradores pueden asignar proyectos"
  ON usuario_proyectos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

CREATE POLICY "Solo administradores pueden eliminar asignaciones de proyectos"
  ON usuario_proyectos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );
