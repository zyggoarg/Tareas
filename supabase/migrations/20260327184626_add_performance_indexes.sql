/*
  # Add performance indexes

  1. Purpose
    - Speed up frequent queries by adding indexes on commonly filtered/joined columns
    - Reduce query time for tableros, listas, tarjetas, and related tables

  2. Indexes added
    - `tableros.proyecto_id` - Filter tableros by project
    - `tableros.activo` - Filter active tableros
    - `tableros.creado_por_id` - Join with usuarios
    - `listas.tablero_id` - Filter listas by tablero
    - `listas.activo` - Filter active listas
    - `tarjetas.lista_id` - Filter tarjetas by lista
    - `tarjetas.activo` - Filter active tarjetas
    - `tarjetas.creado_por_id` - Join with usuarios
    - `tarjeta_asignados.tarjeta_id` - Lookup assignees by tarjeta
    - `tarjeta_checklist.tarjeta_id` - Lookup checklist by tarjeta
    - `tarjeta_etiquetas.tarjeta_id` - Lookup etiquetas by tarjeta
    - `tarjeta_comentarios.tarjeta_id` - Lookup comments by tarjeta
    - `tarjeta_actividad.tarjeta_id` - Lookup activity by tarjeta
    - `tarjeta_adjuntos.tarjeta_id` - Lookup attachments by tarjeta
    - `usuarios.auth_id` - Auth lookup (critical for login)
    - `usuarios.activo` - Filter active users
    - `novedades.proyecto_id` - Filter novedades by project

  3. Notes
    - All indexes use IF NOT EXISTS to be safe for re-runs
    - These indexes target the exact columns used in WHERE and JOIN clauses
*/

CREATE INDEX IF NOT EXISTS idx_tableros_proyecto_id ON tableros(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_tableros_activo ON tableros(activo);
CREATE INDEX IF NOT EXISTS idx_tableros_creado_por_id ON tableros(creado_por_id);
CREATE INDEX IF NOT EXISTS idx_tableros_proyecto_activo ON tableros(proyecto_id, activo);

CREATE INDEX IF NOT EXISTS idx_listas_tablero_id ON listas(tablero_id);
CREATE INDEX IF NOT EXISTS idx_listas_activo ON listas(activo);
CREATE INDEX IF NOT EXISTS idx_listas_tablero_activo ON listas(tablero_id, activo);

CREATE INDEX IF NOT EXISTS idx_tarjetas_lista_id ON tarjetas(lista_id);
CREATE INDEX IF NOT EXISTS idx_tarjetas_activo ON tarjetas(activo);
CREATE INDEX IF NOT EXISTS idx_tarjetas_lista_activo ON tarjetas(lista_id, activo);
CREATE INDEX IF NOT EXISTS idx_tarjetas_creado_por_id ON tarjetas(creado_por_id);

CREATE INDEX IF NOT EXISTS idx_tarjeta_asignados_tarjeta_id ON tarjeta_asignados(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_asignados_usuario_id ON tarjeta_asignados(usuario_id);

CREATE INDEX IF NOT EXISTS idx_tarjeta_checklist_tarjeta_id ON tarjeta_checklist(tarjeta_id);

CREATE INDEX IF NOT EXISTS idx_tarjeta_etiquetas_tarjeta_id ON tarjeta_etiquetas(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_tarjeta_etiquetas_etiqueta_id ON tarjeta_etiquetas(etiqueta_id);

CREATE INDEX IF NOT EXISTS idx_tarjeta_comentarios_tarjeta_id ON tarjeta_comentarios(tarjeta_id);

CREATE INDEX IF NOT EXISTS idx_tarjeta_actividad_tarjeta_id ON tarjeta_actividad(tarjeta_id);

CREATE INDEX IF NOT EXISTS idx_tarjeta_adjuntos_tarjeta_id ON tarjeta_adjuntos(tarjeta_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

CREATE INDEX IF NOT EXISTS idx_novedades_proyecto_id ON novedades(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_novedades_sector_id ON novedades(sector_id);

CREATE INDEX IF NOT EXISTS idx_usuario_proyectos_usuario_id ON usuario_proyectos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_proyectos_proyecto_id ON usuario_proyectos(proyecto_id);

CREATE INDEX IF NOT EXISTS idx_usuario_sectores_usuario_id ON usuario_sectores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_sectores_sector_id ON usuario_sectores(sector_id);

CREATE INDEX IF NOT EXISTS idx_etiquetas_tablero_id ON etiquetas(tablero_id);

CREATE INDEX IF NOT EXISTS idx_tablero_miembros_tablero_id ON tablero_miembros(tablero_id);
CREATE INDEX IF NOT EXISTS idx_tablero_miembros_usuario_id ON tablero_miembros(usuario_id);
