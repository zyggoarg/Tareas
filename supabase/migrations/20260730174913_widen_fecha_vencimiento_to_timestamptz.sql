/*
# Ampliar fecha_vencimiento para soportar hora de fin

1. Cambios en columnas existentes
- `tarjetas.fecha_vencimiento`: cambia de tipo `date` a `timestamptz` (timestamp with time zone).
  - Antes solo guardaba la fecha (día/mes/año).
  - Ahora guarda fecha Y hora, permitiendo definir una hora de fin opcional.
  - Sigue siendo nullable (opcional), así que las tarjetas existentes que solo tenían fecha se interpretan a medianoche de ese día sin perder información.
- `tarjetas.fecha_inicio`: ya es `timestamptz`, así que ya soporta hora de inicio. No se modifica.

2. Seguridad
- No se modifican políticas RLS ni permisos. Solo se cambia el tipo de dato de una columna existente.
- No se eliminan datos: la conversión `date -> timestamptz` preserva los valores existentes interpretándolos a las 00:00:00 de cada fecha.

3. Notas
- La conversión es segura y reversible conceptualmente: los valores existentes (solo fecha) se convierten a timestamp a medianoche.
- Las nuevas inserciones/actualizaciones pueden incluir hora, o seguir enviando solo fecha (se completará a medianoche).
- No se agregan nuevas columnas. No se eliminan columnas.
*/

ALTER TABLE tarjetas
  ALTER COLUMN fecha_vencimiento TYPE timestamptz
  USING fecha_vencimiento::text::timestamptz;