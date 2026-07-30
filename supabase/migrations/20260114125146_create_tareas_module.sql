/*
  # Módulo de Tareas (Sistema tipo Trello)

  1. Nuevas Tablas
    - `tableros` (Boards)
      - `id` (uuid, primary key)
      - `nombre` (text, nombre del tablero)
      - `descripcion` (text, descripción opcional)
      - `proyecto_id` (uuid, referencia a proyectos - obligatorio)
      - `sector_id` (uuid, referencia a sectores - opcional)
      - `estado` (text, activo/archivado)
      - `color` (text, color del tablero)
      - `creado_por_id` (uuid, referencia a usuarios)
      - `activo` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `listas` (Columns)
      - `id` (uuid, primary key)
      - `tablero_id` (uuid, referencia a tableros)
      - `nombre` (text, nombre de la lista)
      - `orden` (integer, orden de la lista)
      - `activo` (boolean, default true)
      - `created_at` (timestamptz)

    - `tarjetas` (Cards/Tasks)
      - `id` (uuid, primary key)
      - `lista_id` (uuid, referencia a listas)
      - `titulo` (text, título de la tarjeta)
      - `descripcion` (text, descripción opcional)
      - `orden` (integer, orden dentro de la lista)
      - `prioridad` (text, baja/media/alta/critica)
      - `fecha_vencimiento` (date, opcional)
      - `creado_por_id` (uuid, referencia a usuarios)
      - `asignado_a_id` (uuid, referencia a usuarios - opcional)
      - `activo` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `tablero_miembros` (Board Members)
      - `id` (uuid, primary key)
      - `tablero_id` (uuid, referencia a tableros)
      - `usuario_id` (uuid, referencia a usuarios)
      - `created_at` (timestamptz)

    - `tarjeta_comentarios` (Card Comments)
      - `id` (uuid, primary key)
      - `tarjeta_id` (uuid, referencia a tarjetas)
      - `usuario_id` (uuid, referencia a usuarios)
      - `texto` (text, contenido del comentario)
      - `created_at` (timestamptz)

    - `tarjeta_adjuntos` (Card Attachments)
      - `id` (uuid, primary key)
      - `tarjeta_id` (uuid, referencia a tarjetas)
      - `url` (text, URL del archivo)
      - `nombre_archivo` (text, nombre del archivo)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS en todas las tablas
    - Políticas de acceso basadas en:
      - Pertenencia al proyecto del tablero
      - Rol de administrador
      - Miembro del tablero
*/

-- Crear tabla tableros
CREATE TABLE IF NOT EXISTS tableros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  proyecto_id uuid NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  sector_id uuid REFERENCES sectores(id) ON DELETE SET NULL,
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'archivado')),
  color text DEFAULT '#3b82f6',
  creado_por_id uuid NOT NULL REFERENCES usuarios(id),
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla listas
CREATE TABLE IF NOT EXISTS listas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tablero_id uuid NOT NULL REFERENCES tableros(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla tarjetas
CREATE TABLE IF NOT EXISTS tarjetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id uuid NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text,
  orden integer NOT NULL DEFAULT 0,
  prioridad text DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  fecha_vencimiento date,
  creado_por_id uuid NOT NULL REFERENCES usuarios(id),
  asignado_a_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla tablero_miembros
CREATE TABLE IF NOT EXISTS tablero_miembros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tablero_id uuid NOT NULL REFERENCES tableros(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tablero_id, usuario_id)
);

-- Crear tabla tarjeta_comentarios
CREATE TABLE IF NOT EXISTS tarjeta_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarjeta_id uuid NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  texto text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla tarjeta_adjuntos
CREATE TABLE IF NOT EXISTS tarjeta_adjuntos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarjeta_id uuid NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
  url text NOT NULL,
  nombre_archivo text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tableros_proyecto ON tableros(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_tableros_sector ON tableros(sector_id);
CREATE INDEX IF NOT EXISTS idx_listas_tablero ON listas(tablero_id);
CREATE INDEX IF NOT EXISTS idx_tarjetas_lista ON tarjetas(lista_id);
CREATE INDEX IF NOT EXISTS idx_tablero_miembros_tablero ON tablero_miembros(tablero_id);
CREATE INDEX IF NOT EXISTS idx_tablero_miembros_usuario ON tablero_miembros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_comentarios_tarjeta ON tarjeta_comentarios(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_adjuntos_tarjeta ON tarjeta_adjuntos(tarjeta_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_tableros_updated_at ON tableros;
CREATE TRIGGER update_tableros_updated_at
  BEFORE UPDATE ON tableros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tarjetas_updated_at ON tarjetas;
CREATE TRIGGER update_tarjetas_updated_at
  BEFORE UPDATE ON tarjetas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE tableros ENABLE ROW LEVEL SECURITY;
ALTER TABLE listas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarjetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tablero_miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarjeta_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarjeta_adjuntos ENABLE ROW LEVEL SECURITY;

-- Políticas para tableros
CREATE POLICY "Usuarios pueden ver tableros de sus proyectos"
  ON tableros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario_proyectos
      WHERE usuario_proyectos.usuario_id = auth.uid()
      AND usuario_proyectos.proyecto_id = tableros.proyecto_id
    )
  );

CREATE POLICY "Usuarios pueden crear tableros en sus proyectos"
  ON tableros FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuario_proyectos
      WHERE usuario_proyectos.usuario_id = auth.uid()
      AND usuario_proyectos.proyecto_id = proyecto_id
    )
    AND creado_por_id = auth.uid()
  );

CREATE POLICY "Creadores pueden actualizar sus tableros"
  ON tableros FOR UPDATE
  TO authenticated
  USING (creado_por_id = auth.uid())
  WITH CHECK (creado_por_id = auth.uid());

CREATE POLICY "Creadores pueden eliminar sus tableros"
  ON tableros FOR DELETE
  TO authenticated
  USING (creado_por_id = auth.uid());

-- Políticas para listas
CREATE POLICY "Usuarios pueden ver listas de tableros accesibles"
  ON listas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = listas.tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear listas en tableros accesibles"
  ON listas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden actualizar listas de tableros accesibles"
  ON listas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = listas.tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden eliminar listas de tableros accesibles"
  ON listas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = listas.tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

-- Políticas para tarjetas
CREATE POLICY "Usuarios pueden ver tarjetas de tableros accesibles"
  ON tarjetas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listas
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE listas.id = tarjetas.lista_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear tarjetas en tableros accesibles"
  ON tarjetas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listas
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE listas.id = lista_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
    AND creado_por_id = auth.uid()
  );

CREATE POLICY "Usuarios pueden actualizar tarjetas de tableros accesibles"
  ON tarjetas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listas
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE listas.id = tarjetas.lista_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listas
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE listas.id = lista_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden eliminar tarjetas de tableros accesibles"
  ON tarjetas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listas
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE listas.id = tarjetas.lista_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

-- Políticas para tablero_miembros
CREATE POLICY "Usuarios pueden ver miembros de tableros accesibles"
  ON tablero_miembros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tableros.id = tablero_miembros.tablero_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Creadores de tableros pueden agregar miembros"
  ON tablero_miembros FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tableros
      WHERE tableros.id = tablero_id
      AND tableros.creado_por_id = auth.uid()
    )
  );

CREATE POLICY "Creadores de tableros pueden eliminar miembros"
  ON tablero_miembros FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tableros
      WHERE tableros.id = tablero_miembros.tablero_id
      AND tableros.creado_por_id = auth.uid()
    )
  );

-- Políticas para tarjeta_comentarios
CREATE POLICY "Usuarios pueden ver comentarios de tarjetas accesibles"
  ON tarjeta_comentarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_comentarios.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear comentarios en tarjetas accesibles"
  ON tarjeta_comentarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
    AND usuario_id = auth.uid()
  );

CREATE POLICY "Usuarios pueden eliminar sus propios comentarios"
  ON tarjeta_comentarios FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- Políticas para tarjeta_adjuntos
CREATE POLICY "Usuarios pueden ver adjuntos de tarjetas accesibles"
  ON tarjeta_adjuntos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_adjuntos.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden agregar adjuntos a tarjetas accesibles"
  ON tarjeta_adjuntos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden eliminar adjuntos de tarjetas accesibles"
  ON tarjeta_adjuntos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tarjetas
      JOIN listas ON listas.id = tarjetas.lista_id
      JOIN tableros ON tableros.id = listas.tablero_id
      JOIN usuario_proyectos ON usuario_proyectos.proyecto_id = tableros.proyecto_id
      WHERE tarjetas.id = tarjeta_adjuntos.tarjeta_id
      AND usuario_proyectos.usuario_id = auth.uid()
    )
  );