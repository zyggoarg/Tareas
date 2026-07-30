/*
  # Extensión de colaboración en tarjetas

  1. Modificaciones a tablas existentes
    - tarjeta_comentarios: agregar updated_at
    - tarjeta_adjuntos: agregar campos usuario_id, comentario_id, tipo_mime, tamaño, url_storage

  2. Nueva tabla
    - tarjeta_actividad: registro de actividad de tarjetas

  3. Security
    - Políticas RLS para todas las tablas
*/

-- Agregar updated_at a tarjeta_comentarios si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tarjeta_comentarios' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE tarjeta_comentarios ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Agregar columnas a tarjeta_adjuntos si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tarjeta_adjuntos' AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE tarjeta_adjuntos ADD COLUMN usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tarjeta_adjuntos' AND column_name = 'comentario_id'
  ) THEN
    ALTER TABLE tarjeta_adjuntos ADD COLUMN comentario_id uuid REFERENCES tarjeta_comentarios(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tarjeta_adjuntos' AND column_name = 'tipo_mime'
  ) THEN
    ALTER TABLE tarjeta_adjuntos ADD COLUMN tipo_mime text DEFAULT 'application/octet-stream';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tarjeta_adjuntos' AND column_name = 'tamaño'
  ) THEN
    ALTER TABLE tarjeta_adjuntos ADD COLUMN tamaño bigint DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tarjeta_adjuntos' AND column_name = 'url_storage'
  ) THEN
    ALTER TABLE tarjeta_adjuntos ADD COLUMN url_storage text;
  END IF;
END $$;

-- Crear tabla tarjeta_actividad
CREATE TABLE IF NOT EXISTS tarjeta_actividad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarjeta_id uuid NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  descripcion text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_tarjeta_actividad_tarjeta ON tarjeta_actividad(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_actividad_usuario ON tarjeta_actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_adjuntos_usuario ON tarjeta_adjuntos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_adjuntos_comentario ON tarjeta_adjuntos(comentario_id);

-- Enable RLS
ALTER TABLE tarjeta_actividad ENABLE ROW LEVEL SECURITY;

-- Políticas para tarjeta_actividad
CREATE POLICY "Ver actividad de tarjetas accesibles"
  ON tarjeta_actividad FOR SELECT
  TO authenticated
  USING (
    tarjeta_id IN (
      SELECT t.id FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE up.usuario_id IN (SELECT id FROM usuarios WHERE id = auth.uid())
    )
  );

CREATE POLICY "Crear registros de actividad"
  ON tarjeta_actividad FOR INSERT
  TO authenticated
  WITH CHECK (
    usuario_id IN (SELECT id FROM usuarios WHERE id = auth.uid())
    AND tarjeta_id IN (
      SELECT t.id FROM tarjetas t
      JOIN listas l ON l.id = t.lista_id
      JOIN tableros tb ON tb.id = l.tablero_id
      JOIN usuario_proyectos up ON up.proyecto_id = tb.proyecto_id
      WHERE up.usuario_id IN (SELECT id FROM usuarios WHERE id = auth.uid())
    )
  );

-- Trigger para updated_at en comentarios
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_tarjeta_comentarios_updated_at') THEN
    CREATE FUNCTION update_tarjeta_comentarios_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

DROP TRIGGER IF EXISTS tarjeta_comentarios_updated_at ON tarjeta_comentarios;
CREATE TRIGGER tarjeta_comentarios_updated_at
  BEFORE UPDATE ON tarjeta_comentarios
  FOR EACH ROW
  EXECUTE FUNCTION update_tarjeta_comentarios_updated_at();