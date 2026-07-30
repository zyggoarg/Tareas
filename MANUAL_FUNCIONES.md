# Manual de Funciones - Sistema de Gestión Rotorc

## Índice
1. [Descripción General](#descripción-general)
2. [Gestión de Usuarios](#gestión-de-usuarios)
3. [Módulo de Novedades](#módulo-de-novedades)
4. [Módulo de Tareas](#módulo-de-tareas)
5. [Gestión de Proyectos](#gestión-de-proyectos)
6. [Gestión de Sectores](#gestión-de-sectores)
7. [Perfil de Usuario](#perfil-de-usuario)
8. [Funciones por Rol](#funciones-por-rol)

---

## Descripción General

Sistema integral de gestión diseñado para Rotorc que permite la comunicación efectiva entre equipos de trabajo mediante dos módulos principales:
- **Módulo de Novedades**: Para compartir información, actualizaciones y comunicados
- **Módulo de Tareas**: Para gestión de tareas mediante tableros Kanban

### Características Principales
- Sistema de autenticación seguro con Supabase
- Interfaz responsive (funciona en móviles, tablets y escritorio)
- Sistema de roles (Administrador/Usuario)
- Gestión de proyectos múltiples
- Asignación por sectores
- Carga de imágenes
- Sistema de comentarios y actividad
- Filtros y búsquedas avanzadas

---

## Gestión de Usuarios

### 1. Inicio de Sesión
**Ubicación**: Pantalla inicial del sistema

**Funcionalidad**:
- Ingreso con correo electrónico y contraseña
- Autenticación mediante Supabase Auth
- Sesión persistente (no requiere login repetido)
- Validación de usuarios activos

**Proceso**:
1. Ingresar correo electrónico
2. Ingresar contraseña
3. Click en "Iniciar Sesión"
4. El sistema valida credenciales y redirige al Dashboard

---

### 2. Crear Nuevo Usuario
**Rol requerido**: Administrador
**Ubicación**: Sección "Usuarios" → Botón "Nuevo Usuario"

**Funcionalidad**:
Permite al administrador crear nuevos usuarios del sistema con permisos específicos.

**Campos**:
- **Nombre** (obligatorio)
- **Apellido** (obligatorio)
- **DNI** (obligatorio, único)
- **Correo electrónico** (obligatorio, único, formato válido)
- **Contraseña** (obligatorio para nuevos usuarios)
- **Rol**:
  - Administrador: Acceso completo al sistema
  - Usuario: Acceso limitado según asignaciones
- **Módulos activos**:
  - Módulo de Novedades
  - Módulo de Tareas
  - (Debe tener al menos uno activo)
- **Sectores asignados**: Selección múltiple
- **Proyectos asignados**: Selección múltiple

**Proceso**:
1. Click en "Nuevo Usuario"
2. Completar todos los campos obligatorios
3. Seleccionar rol y módulos
4. Asignar sectores y proyectos
5. Click en "Crear Usuario"
6. El sistema crea el usuario en Supabase Auth y la base de datos

**Validaciones**:
- Email debe tener formato válido (ejemplo@dominio.com)
- DNI y email deben ser únicos
- Al menos un módulo debe estar activo
- Contraseña es obligatoria para nuevos usuarios

---

### 3. Actualizar Usuario
**Rol requerido**: Administrador
**Ubicación**: Sección "Usuarios" → Click en "Editar" en la tarjeta del usuario

**Funcionalidad**:
Permite modificar la información de usuarios existentes, incluyendo cambio de contraseña y actualización en Supabase Auth.

**Campos editables**:
- Nombre
- Apellido
- DNI
- Correo electrónico (actualiza también en Supabase Auth)
- Contraseña (opcional, actualiza también en Supabase Auth)
- Rol
- Módulos activos
- Sectores asignados
- Proyectos asignados

**Proceso**:
1. Click en "Editar" en la tarjeta del usuario
2. Modificar los campos deseados
3. Si se cambia contraseña, ingresarla en el campo (opcional)
4. Click en "Actualizar Usuario"
5. El sistema actualiza:
   - Datos en la tabla usuarios
   - Email en Supabase Auth (si cambió)
   - Contraseña en Supabase Auth (si se proporcionó)
   - Asignaciones de sectores
   - Asignaciones de proyectos

**Notas importantes**:
- La contraseña es opcional al actualizar (solo se cambia si se ingresa una nueva)
- Si se cambia el email, el usuario deberá usar el nuevo email para iniciar sesión
- Los cambios son inmediatos
- El sistema registra logs de la actualización para debugging

---

### 4. Desactivar Usuario
**Rol requerido**: Administrador
**Ubicación**: Sección "Usuarios" → Click en "Desactivar" en la tarjeta del usuario

**Funcionalidad**:
Deshabilita el acceso al sistema sin eliminar el registro del usuario.

**Proceso**:
1. Click en "Desactivar"
2. Confirmar la acción
3. El usuario queda inactivo y no puede iniciar sesión

**Nota**: Los usuarios desactivados no aparecen en la lista de usuarios activos.

---

## Módulo de Novedades

### 5. Dashboard de Novedades
**Ubicación**: Seleccionar modo "Novedades" → Tab "Dashboard"

**Funcionalidad**:
Pantalla principal que muestra estadísticas y resumen de novedades.

**Secciones**:

#### A. Estadísticas Generales (4 tarjetas principales)
- **Total Novedades**: Contador de todas las novedades del proyecto activo
- **Mis Novedades**: Novedades creadas por el usuario actual
- **Sin Leer**: Novedades que el usuario no ha leído aún
- **Archivadas**: Novedades archivadas (solo administradores)

**Interactividad**:
- Click en cualquier estadística filtra la vista de novedades automáticamente
- Los contadores se actualizan en tiempo real

#### B. Novedades por Sector
- Muestra tarjetas por cada sector asignado al usuario
- Indica cantidad de novedades sin leer por sector
- Código de colores:
  - **Rojo**: Hay novedades sin leer
  - **Verde**: Todas las novedades están al día
- Click en una tarjeta filtra novedades de ese sector

**Filtros automáticos**:
- Usuarios regulares: Solo ven sectores asignados
- Administradores sin sectores asignados: Ven todos los sectores

---

### 6. Crear Nueva Novedad
**Ubicación**: Cualquier vista del módulo Novedades → Botón "Nueva Novedad"

**Funcionalidad**:
Permite crear una nueva novedad para comunicar información al equipo.

**Campos**:
- **Sector** (obligatorio): Selector del sector al que pertenece la novedad
- **Título** (obligatorio): Título descriptivo de la novedad
- **Descripción** (obligatorio): Detalle completo de la novedad
- **Fotos** (opcional): Hasta 10 imágenes
  - Formatos soportados: JPG, PNG, GIF, WebP
  - Límite: 50MB por imagen
  - Vista previa antes de publicar
  - Posibilidad de eliminar imágenes antes de publicar

**Proceso**:
1. Click en "Nueva Novedad"
2. Seleccionar sector
3. Ingresar título y descripción
4. (Opcional) Arrastrar y soltar fotos o click para seleccionar
5. Revisar vista previa
6. Click en "Publicar Novedad"
7. La novedad se crea y aparece inmediatamente en el listado

**Características especiales**:
- Sistema de drag & drop para fotos
- Vista previa de imágenes
- Validación de formatos y tamaños
- Delay de 200ms antes de cerrar modal (optimización para Android)

---

### 7. Ver Listado de Novedades
**Ubicación**: Seleccionar modo "Novedades" → Tab "Novedades"

**Funcionalidad**:
Muestra todas las novedades del proyecto activo con múltiples opciones de filtrado.

**Vista de Tarjetas** - Cada novedad muestra:
- Título y descripción
- Sector al que pertenece
- Autor y fecha de creación
- Galería de fotos (si tiene)
- Cantidad de comentarios
- Estado de lectura (leída/no leída)
- Botones de acción

**Filtros disponibles**:

#### A. Filtro por Sector
- Selector desplegable con todos los sectores
- Opción "Todos los sectores" para ver todas
- Se puede combinar con otros filtros

#### B. Filtro por Estado
- **Todas**: Muestra todas las novedades
- **No leídas**: Solo novedades no leídas por el usuario
- **Leídas**: Solo novedades ya leídas
- **Mis novedades**: Solo las creadas por el usuario
- **Archivadas** (solo admin): Novedades archivadas

#### C. Búsqueda por Texto
- Busca en títulos y descripciones
- Búsqueda en tiempo real
- Case-insensitive

**Indicadores visuales**:
- Borde azul: Novedad no leída
- Borde gris: Novedad leída
- Badge "Sin leer": Indica novedades pendientes
- Contador de comentarios

**Ordenamiento**:
- Más recientes primero
- Las no leídas aparecen destacadas

---

### 8. Ver Detalle de Novedad
**Ubicación**: Listado de Novedades → Click en una tarjeta

**Funcionalidad**:
Muestra toda la información detallada de una novedad incluyendo comentarios y actividad.

**Secciones del modal**:

#### A. Encabezado
- Título de la novedad
- Sector (con color distintivo)
- Autor y fecha de publicación
- Botón cerrar (X)

#### B. Contenido Principal
- Descripción completa
- Galería de fotos (si tiene)
  - Click para ampliar en lightbox
  - Navegación entre fotos
  - Botón cerrar galería

#### C. Sección de Comentarios
- Lista de todos los comentarios
- Cada comentario muestra:
  - Nombre del autor
  - Fecha y hora
  - Texto del comentario
  - Fotos adjuntas (si tiene)
- Ordenados del más reciente al más antiguo

#### D. Agregar Comentario
- Campo de texto para escribir comentario
- Botón para adjuntar fotos (hasta 5 por comentario)
- Vista previa de fotos antes de publicar
- Botón "Comentar" para enviar

#### E. Registro de Actividad (Timeline)
Muestra el historial de acciones sobre la novedad:
- Creación de la novedad
- Lecturas por usuarios
- Comentarios agregados
- Archivado/Desarchivado (admin)
- Con fecha, hora y nombre del usuario

**Acciones automáticas**:
- Al abrir una novedad, se marca automáticamente como leída
- El contador de novedades sin leer se actualiza
- Se registra la actividad de lectura

**Acciones disponibles** (según rol):
- **Todos los usuarios**: Agregar comentarios con fotos
- **Administradores**:
  - Archivar novedad
  - Desarchivar novedad
  - Eliminar novedad

---

### 9. Comentar en Novedad
**Ubicación**: Detalle de Novedad → Sección de comentarios

**Funcionalidad**:
Permite participar en la conversación sobre una novedad.

**Campos**:
- Texto del comentario (obligatorio)
- Fotos adjuntas (opcional, hasta 5)

**Proceso**:
1. Escribir comentario en el campo de texto
2. (Opcional) Click en botón de adjuntar fotos
3. Seleccionar hasta 5 imágenes
4. Vista previa de imágenes
5. Click en "Comentar"
6. El comentario aparece inmediatamente
7. Se registra en el timeline de actividad
8. Otros usuarios verán el nuevo comentario

**Características**:
- Los comentarios no se pueden editar ni eliminar
- Quedan registrados permanentemente
- Notifican a otros usuarios (actualiza contador)

---

### 10. Archivar/Desarchivar Novedad
**Rol requerido**: Administrador
**Ubicación**: Detalle de Novedad → Botón "Archivar" o "Desarchivar"

**Funcionalidad**:
Permite ocultar novedades obsoletas sin eliminarlas.

**Proceso de Archivar**:
1. Abrir detalle de la novedad
2. Click en "Archivar"
3. Confirmar acción
4. La novedad desaparece de la vista normal
5. Queda accesible desde filtro "Archivadas"

**Proceso de Desarchivar**:
1. Aplicar filtro "Archivadas"
2. Abrir novedad archivada
3. Click en "Desarchivar"
4. La novedad vuelve a aparecer en el listado normal

**Uso recomendado**:
- Archivar novedades resueltas o antiguas
- Mantener el listado limpio y relevante
- Conservar historial sin eliminar información

---

### 11. Eliminar Novedad
**Rol requerido**: Administrador
**Ubicación**: Detalle de Novedad → Botón "Eliminar"

**Funcionalidad**:
Elimina permanentemente una novedad y todo su contenido.

**Proceso**:
1. Abrir detalle de la novedad
2. Click en "Eliminar"
3. Confirmar acción (es irreversible)
4. Se eliminan:
   - La novedad
   - Todos los comentarios
   - Todas las fotos asociadas
   - Registros de actividad

**Advertencia**: Esta acción es permanente y no se puede deshacer.

---

## Módulo de Tareas

### 12. Dashboard de Tareas
**Ubicación**: Seleccionar modo "Tareas" → Tab "Dashboard"

**Funcionalidad**:
Vista general de todos los tableros de tareas del proyecto activo.

**Elementos mostrados**:

#### A. Tarjetas de Tableros
Cada tablero muestra:
- Nombre del tablero
- Descripción
- Estadísticas:
  - Total de tarjetas
  - Tarjetas asignadas al usuario
  - Tarjetas completadas
  - Tarjetas pendientes
- Estado (Activo/Inactivo)
- Botón "Ver Tablero"

#### B. Estadísticas Generales
- Total de tableros
- Total de tareas en todos los tableros
- Tareas asignadas al usuario
- Tareas completadas vs pendientes

**Interactividad**:
- Click en "Ver Tablero" abre el tablero en vista Kanban
- Las estadísticas son filtros clickeables

---

### 13. Crear Nuevo Tablero
**Rol requerido**: Administrador
**Ubicación**: Dashboard de Tareas → Botón "Nuevo Tablero"

**Funcionalidad**:
Crea un nuevo tablero Kanban para organizar tareas.

**Campos**:
- **Nombre** (obligatorio): Nombre del tablero
- **Descripción** (opcional): Descripción del propósito del tablero
- **Listas predeterminadas**: Se crean automáticamente:
  - Por Hacer
  - En Progreso
  - Completado

**Proceso**:
1. Click en "Nuevo Tablero"
2. Ingresar nombre y descripción
3. Click en "Crear"
4. El tablero se crea con las 3 listas básicas
5. Aparece en el Dashboard

**Características**:
- Cada tablero es independiente
- Se pueden crear múltiples tableros por proyecto
- Las listas se pueden personalizar después de crear

---

### 14. Ver Tablero Kanban
**Ubicación**: Dashboard de Tareas → Click en "Ver Tablero" o Tab "Tareas"

**Funcionalidad**:
Vista de tablero estilo Kanban para gestión visual de tareas.

**Estructura**:

#### A. Columnas (Listas)
- Cada lista representa un estado del flujo de trabajo
- Por defecto: "Por Hacer", "En Progreso", "Completado"
- Las listas tienen:
  - Nombre
  - Contador de tarjetas
  - Opción para agregar nueva tarjeta
  - Scroll vertical si hay muchas tarjetas

#### B. Tarjetas de Tareas
Cada tarjeta muestra:
- Título
- Prioridad (badge de color):
  - 🔴 Crítica
  - 🟠 Alta
  - 🟡 Media
  - 🟢 Baja
- Usuarios asignados (avatares)
- Etiquetas (labels de colores)
- Fecha de vencimiento (si tiene)
- Contador de comentarios
- Contador de checklist (completados/total)
- Contador de adjuntos

**Características**:
- Drag & drop para mover tarjetas entre listas
- Click en tarjeta para ver detalle
- Filtros por usuario asignado, etiqueta, prioridad

---

### 15. Crear Tarea Rápida
**Ubicación**: Dashboard de Tareas → Botón "Nueva Tarea" o dentro de un tablero

**Funcionalidad**:
Crea una nueva tarea de forma rápida.

**Campos básicos**:
- **Tablero** (obligatorio): Selector del tablero
- **Lista** (obligatorio): En qué columna se creará
- **Título** (obligatorio): Nombre de la tarea
- **Descripción** (opcional): Detalles de la tarea
- **Prioridad**: Baja, Media, Alta, Crítica

**Proceso**:
1. Click en "Nueva Tarea"
2. Seleccionar tablero y lista
3. Ingresar título
4. Seleccionar prioridad
5. Click en "Crear Tarea"
6. La tarea aparece en el tablero seleccionado

**Nota**: Para opciones avanzadas (asignaciones, fechas, checklist), se debe editar la tarjeta después de crearla.

---

### 16. Ver Detalle de Tarjeta
**Ubicación**: Tablero Kanban → Click en cualquier tarjeta

**Funcionalidad**:
Modal completo con toda la información y opciones de gestión de la tarea.

**Secciones del modal**:

#### A. Encabezado
- Título (editable en línea)
- Lista actual
- Botones de acción (Editar, Cerrar)

#### B. Información Principal
- **Descripción**: Texto completo de la tarea (editable)
- **Estado**: Activo, En Progreso, Completado
- **Prioridad**: Selector visual de prioridad
- **Fechas**:
  - Fecha de inicio
  - Fecha de vencimiento
  - Indicador si está vencida

#### C. Asignaciones
- Lista de usuarios asignados
- Agregar/remover asignados
- Selector múltiple de usuarios

#### D. Etiquetas (Labels)
- Etiquetas existentes con colores
- Agregar nuevas etiquetas
- Remover etiquetas
- Selector de color para etiquetas

#### E. Checklist
- Lista de ítems a completar
- Checkbox para marcar completados
- Barra de progreso visual
- Agregar nuevos ítems
- Eliminar ítems
- Porcentaje de completitud

#### F. Adjuntos
- Lista de archivos adjuntos
- Subir nuevos archivos
- Descargar archivos
- Eliminar adjuntos
- Vista previa de imágenes

#### G. Comentarios
- Todos los comentarios de la tarjeta
- Agregar nuevos comentarios
- Sistema similar al de novedades

#### H. Actividad
- Timeline de todas las acciones:
  - Creación
  - Cambios de estado
  - Movimientos entre listas
  - Asignaciones/desasignaciones
  - Cambios de prioridad
  - Comentarios
  - Actualizaciones del checklist
- Con fecha, hora y usuario que realizó la acción

---

### 17. Editar Tarjeta
**Ubicación**: Detalle de Tarjeta → Botón "Editar"

**Funcionalidad**:
Modal para editar todos los campos de la tarjeta.

**Campos editables**:
- Título
- Descripción
- Estado (Activo, En Progreso, Completado)
- Prioridad
- Fecha de inicio
- Fecha de vencimiento
- Lista (mover a otra columna)
- Usuarios asignados
- Etiquetas

**Proceso**:
1. Click en "Editar"
2. Modificar los campos deseados
3. Click en "Guardar"
4. Los cambios se reflejan inmediatamente
5. Se registra la actividad

**Características**:
- Validación de fechas (vencimiento no puede ser antes del inicio)
- Actualización en tiempo real
- Historial de cambios en el timeline

---

### 18. Gestionar Checklist
**Ubicación**: Detalle de Tarjeta → Sección Checklist

**Funcionalidad**:
Lista de tareas dentro de una tarjeta para tracking detallado.

**Acciones disponibles**:

#### A. Agregar Ítem
1. Escribir texto en campo "Nuevo ítem"
2. Click en "Agregar"
3. El ítem aparece en la lista

#### B. Marcar Completado
1. Click en checkbox del ítem
2. Se marca como completado
3. Actualiza barra de progreso
4. Registra actividad

#### C. Desmarcar
1. Click en checkbox marcado
2. Se desmarca
3. Actualiza porcentaje

#### D. Eliminar Ítem
1. Click en ícono de basura
2. Confirmar (si hay confirmación)
3. El ítem se elimina

**Visualización**:
- Barra de progreso visual
- Porcentaje de completitud (Ej: 3/5 completados - 60%)
- Ítems completados con tachado
- Ordenados por orden de creación

---

### 19. Vincular Novedad a Tarjeta
**Ubicación**: Detalle de Tarjeta o Detalle de Novedad

**Funcionalidad**:
Relaciona una novedad con una tarjeta de tarea para contexto adicional.

**Proceso desde Tarjeta**:
1. Abrir detalle de tarjeta
2. Sección "Novedades vinculadas"
3. Click en "Vincular novedad"
4. Seleccionar novedad del listado
5. Click en "Vincular"
6. La novedad aparece como relacionada

**Proceso desde Novedad**:
1. Abrir detalle de novedad
2. Sección "Tarjetas vinculadas"
3. Click en "Vincular tarjeta"
4. Seleccionar tarjeta
5. Click en "Vincular"

**Visualización**:
- Se muestra un preview de la novedad/tarjeta vinculada
- Click en el vínculo abre el detalle
- Se puede desvincular en cualquier momento

**Uso recomendado**:
- Vincular novedades que dieron origen a la tarea
- Relacionar updates importantes
- Mantener contexto histórico

---

## Gestión de Proyectos

### 20. Selector de Proyecto
**Ubicación**: Header del sistema (debajo del logo)

**Funcionalidad**:
Permite cambiar entre diferentes proyectos activos.

**Características**:
- Dropdown con lista de proyectos disponibles
- Muestra proyecto actualmente seleccionado
- Filtrado según asignaciones del usuario
- Cambio instantáneo al seleccionar

**Reglas de visibilidad**:
- **Administradores sin proyectos asignados**: Ven todos los proyectos
- **Usuarios regulares**: Solo ven proyectos asignados
- **Administradores con proyectos asignados**: Solo ven sus proyectos asignados

**Efecto del cambio**:
- Actualiza todas las vistas
- Filtra novedades del proyecto seleccionado
- Filtra tableros del proyecto seleccionado
- Resetea filtros activos

---

### 21. Crear Nuevo Proyecto
**Rol requerido**: Administrador
**Ubicación**: Sección "Proyectos" → Botón "Nuevo Proyecto"

**Funcionalidad**:
Crea un nuevo proyecto para organizar novedades y tareas.

**Campos**:
- **Nombre** (obligatorio): Nombre del proyecto
- **Descripción** (opcional): Descripción del proyecto
- **Estado**: Activo/Inactivo

**Proceso**:
1. Click en "Nuevo Proyecto"
2. Ingresar nombre y descripción
3. Seleccionar estado inicial
4. Click en "Crear Proyecto"
5. El proyecto se crea y queda disponible

**Características**:
- El primer proyecto creado se selecciona automáticamente
- Se puede asignar a usuarios desde la gestión de usuarios
- Cada proyecto tiene sus propias novedades y tableros

---

### 22. Editar Proyecto
**Rol requerido**: Administrador
**Ubicación**: Sección "Proyectos" → Click en "Editar"

**Funcionalidad**:
Modifica la información de un proyecto existente.

**Campos editables**:
- Nombre
- Descripción
- Estado (Activo/Inactivo)

**Proceso**:
1. Click en "Editar" en la tarjeta del proyecto
2. Modificar campos
3. Click en "Actualizar"
4. Los cambios se aplican inmediatamente

**Nota**: Cambiar el estado a "Inactivo" no elimina el proyecto, solo lo oculta.

---

### 23. Eliminar Proyecto
**Rol requerido**: Administrador
**Ubicación**: Sección "Proyectos" → Click en "Eliminar"

**Funcionalidad**:
Elimina permanentemente un proyecto y todo su contenido.

**Proceso**:
1. Click en "Eliminar"
2. Confirmar acción (es irreversible)
3. Se eliminan:
   - El proyecto
   - Todas las novedades del proyecto
   - Todos los tableros del proyecto
   - Todas las tarjetas del proyecto
   - Asignaciones de usuarios al proyecto

**Advertencia**:
- Esta acción es irreversible
- Elimina todo el contenido relacionado
- Se recomienda cambiar a estado "Inactivo" en lugar de eliminar

---

## Gestión de Sectores

### 24. Crear Nuevo Sector
**Rol requerido**: Administrador
**Ubicación**: Sección "Sectores" → Botón "Nuevo Sector"

**Funcionalidad**:
Crea un nuevo sector para categorizar novedades.

**Campos**:
- **Nombre** (obligatorio): Nombre del sector
- **Descripción** (opcional): Descripción del sector

**Proceso**:
1. Click en "Nuevo Sector"
2. Ingresar nombre y descripción
3. Click en "Crear Sector"
4. El sector queda disponible para asignar a usuarios y novedades

**Ejemplos de sectores**:
- Producción
- Mantenimiento
- Administración
- Seguridad
- Calidad
- Logística

---

### 25. Editar Sector
**Rol requerido**: Administrador
**Ubicación**: Sección "Sectores" → Click en "Editar"

**Funcionalidad**:
Modifica la información de un sector.

**Campos editables**:
- Nombre
- Descripción

**Proceso**:
1. Click en "Editar"
2. Modificar campos
3. Click en "Actualizar"
4. Los cambios se reflejan en todas las vistas

---

### 26. Desactivar Sector
**Rol requerido**: Administrador
**Ubicación**: Sección "Sectores" → Click en "Desactivar"

**Funcionalidad**:
Deshabilita un sector sin eliminar su historial.

**Proceso**:
1. Click en "Desactivar"
2. Confirmar acción
3. El sector ya no aparece en selectores
4. Las novedades existentes conservan su sector

**Nota**: Los sectores desactivados no se pueden eliminar si tienen novedades asociadas.

---

## Perfil de Usuario

### 27. Editar Perfil
**Ubicación**: Header → Click en foto/avatar de perfil

**Funcionalidad**:
Permite al usuario modificar su información personal.

**Campos editables**:
- **Nombre**: Nombre del usuario
- **Apellido**: Apellido del usuario
- **Foto de perfil**: Imagen del usuario
  - Subir nueva foto
  - Formatos: JPG, PNG
  - Límite: 5MB
  - Preview antes de guardar
- **Contraseña**: Cambiar contraseña
  - Campo opcional
  - Solo se actualiza si se ingresa nueva

**Proceso**:
1. Click en avatar en el header
2. Se abre modal de edición
3. Modificar campos deseados
4. Para foto: Click en "Subir foto" o drag & drop
5. Preview de cambios
6. Click en "Guardar cambios"
7. Los cambios se aplican inmediatamente
8. Si cambió contraseña, se actualiza en Supabase Auth

**Características**:
- La foto se sube a Supabase Storage
- Se muestra inmediatamente en toda la aplicación
- La contraseña se actualiza en Supabase Auth
- Los cambios persisten en la sesión

---

### 28. Cerrar Sesión
**Ubicación**: Header → Botón "Salir"

**Funcionalidad**:
Cierra la sesión del usuario actual.

**Proceso**:
1. Click en "Salir"
2. La sesión se cierra en Supabase
3. Redirige a pantalla de login
4. Los datos locales se limpian

---

## Funciones por Rol

### Rol: Usuario Regular

**Accesos permitidos**:

#### Módulo de Novedades
✅ Ver dashboard de novedades
✅ Crear nuevas novedades
✅ Ver novedades (filtradas por sectores asignados)
✅ Comentar en novedades
✅ Marcar como leídas
✅ Ver solo sectores asignados
❌ Archivar novedades
❌ Eliminar novedades
❌ Ver novedades de sectores no asignados

#### Módulo de Tareas
✅ Ver dashboard de tareas
✅ Crear nuevas tareas
✅ Ver tableros del proyecto
✅ Editar tarjetas asignadas
✅ Comentar en tarjetas
✅ Actualizar checklist
✅ Subir adjuntos
✅ Cambiar estado de tarjetas
❌ Crear tableros
❌ Eliminar tableros
❌ Editar configuración de tableros

#### Gestión
✅ Ver proyectos asignados
✅ Editar propio perfil
✅ Cambiar propia contraseña
❌ Crear/editar usuarios
❌ Crear/editar proyectos
❌ Crear/editar sectores
❌ Asignar usuarios a proyectos/sectores
❌ Desactivar usuarios

---

### Rol: Administrador

**Accesos permitidos**:

#### Módulo de Novedades
✅ Ver dashboard de novedades
✅ Crear nuevas novedades
✅ Ver TODAS las novedades (sin restricción de sectores)
✅ Comentar en novedades
✅ Archivar/desarchivar novedades
✅ Eliminar novedades
✅ Ver estadísticas completas
✅ Filtrar por cualquier sector

#### Módulo de Tareas
✅ Ver dashboard de tareas
✅ Crear nuevos tableros
✅ Editar configuración de tableros
✅ Crear nuevas tareas
✅ Ver todos los tableros
✅ Editar cualquier tarjeta
✅ Eliminar tableros
✅ Gestionar todas las asignaciones

#### Gestión Completa
✅ Crear nuevos usuarios
✅ Editar usuarios existentes
✅ Actualizar contraseñas de usuarios
✅ Desactivar usuarios
✅ Asignar sectores a usuarios
✅ Asignar proyectos a usuarios
✅ Crear proyectos
✅ Editar proyectos
✅ Eliminar proyectos
✅ Crear sectores
✅ Editar sectores
✅ Desactivar sectores
✅ Ver todos los proyectos
✅ Acceso completo al sistema

---

## Funcionalidades Técnicas

### 29. Actualización Automática
**Ubicación**: Header → Botón "Actualizar" (ícono de refresh)

**Funcionalidad**:
Recarga los datos del proyecto actual sin refrescar la página.

**Proceso**:
1. Click en ícono de refresh
2. El ícono gira mostrando carga
3. Se recargan:
   - Novedades
   - Tableros
   - Usuarios (si es admin)
4. Las vistas se actualizan automáticamente

**Uso recomendado**:
- Cuando otro usuario agregó contenido
- Para sincronizar cambios recientes
- Después de que otro usuario comentó

---

### 30. Modo Responsive
**Funcionalidad**:
El sistema se adapta automáticamente a cualquier dispositivo.

**Breakpoints**:
- **Móvil** (< 640px):
  - Menú hamburguesa
  - Tarjetas en columna única
  - Botones compactos
  - Touch-friendly

- **Tablet** (640px - 1024px):
  - Menú visible
  - Dos columnas en grillas
  - Botones estándar

- **Desktop** (> 1024px):
  - Vista completa
  - Tres o más columnas
  - Todos los elementos visibles

**Optimizaciones móviles**:
- Gestos touch
- Scroll optimizado
- Modales full-screen en móvil
- Teclado virtual compatible
- Drag & drop táctil en tableros

---

### 31. Sistema de Storage
**Funcionalidad**:
Almacenamiento de imágenes en Supabase Storage.

**Buckets configurados**:
- **photos**: Para novedades y comentarios
- **tarjetas**: Para adjuntos de tareas
- **avatars**: Para fotos de perfil

**Características**:
- Límite de 50MB por archivo
- Formatos: JPG, PNG, GIF, WebP
- URLs públicas para acceso rápido
- Políticas de seguridad (RLS)
- Limpieza automática al eliminar

---

### 32. Sistema de Autenticación
**Funcionalidad**:
Autenticación segura mediante Supabase Auth.

**Características**:
- Encriptación de contraseñas
- Sesiones persistentes
- Tokens JWT
- Refresh automático de sesión
- Logout en todos los dispositivos
- Cambio de contraseña seguro
- Actualización de email

**Flujo de autenticación**:
1. Usuario ingresa credenciales
2. Sistema valida en Supabase Auth
3. Verifica usuario activo en tabla usuarios
4. Crea sesión con token JWT
5. Token se renueva automáticamente
6. Sesión persiste entre recargas

---

## Nuevas Funciones (Últimas Actualizaciones)

### 33. Actualización de Usuarios con Supabase Auth
**Fecha**: Enero 2026
**Funcionalidad**:
Sistema mejorado para actualizar usuarios que sincroniza con Supabase Auth.

**Mejoras**:
- Actualización de email en Supabase Auth
- Actualización de contraseña en Supabase Auth
- Edge Function para operaciones seguras
- Logs de debugging sin exponer contraseñas
- Validación de formato de email
- Sincronización automática

**Detalles técnicos**:
- Edge Function: `actualizar-usuario`
- Usa Service Role Key para operaciones admin
- Actualiza tabla `usuarios` y Supabase Auth simultáneamente
- Manejo robusto de errores
- Registro de actividad para auditoría

**Campos sincronizados**:
- Email (tabla usuarios ↔ Supabase Auth)
- Contraseña (tabla usuarios ↔ Supabase Auth)
- Nombre, apellido, DNI (solo tabla usuarios)
- Foto de perfil (solo tabla usuarios)
- Rol y permisos (solo tabla usuarios)

---

### 34. Gestión de Módulos por Usuario
**Fecha**: Enero 2026
**Funcionalidad**:
Control granular de acceso a módulos por usuario.

**Módulos disponibles**:
- **Módulo de Novedades**: Acceso a crear y ver novedades
- **Módulo de Tareas**: Acceso a tableros y tareas

**Configuración**:
- Se configura al crear usuario
- Se puede modificar al editar usuario
- Al menos un módulo debe estar activo
- Cambios inmediatos en el sistema

**Efecto de desactivar módulos**:
- **Sin módulo Novedades**:
  - No ve selector de modo Novedades
  - No puede crear novedades
  - No puede ver dashboard de novedades
  - No puede comentar en novedades

- **Sin módulo Tareas**:
  - No ve selector de modo Tareas
  - No puede crear tareas
  - No puede ver tableros
  - No puede ver dashboard de tareas

---

### 35. Emails Automáticos para Usuarios Existentes
**Fecha**: Enero 2026
**Funcionalidad**:
Migración que asigna emails automáticamente a usuarios sin email.

**Formato de email generado**:
```
{DNI}@rotorc.com.ar
```

**Ejemplo**:
- DNI: 12345678
- Email generado: 12345678@rotorc.com.ar

**Uso**:
- Se aplicó automáticamente a usuarios existentes
- Los usuarios pueden cambiar su email desde su perfil
- Administradores pueden actualizar emails desde gestión de usuarios

---

## Consejos de Uso

### Para Usuarios Regulares

1. **Mantente al día con las novedades**:
   - Revisa el dashboard diariamente
   - Atiende las novedades sin leer de tu sector
   - Comenta para confirmar que viste información importante

2. **Organiza tus tareas**:
   - Usa el checklist para subtareas
   - Actualiza el estado de tus tarjetas
   - Agrega comentarios con el progreso

3. **Comunicación efectiva**:
   - Usa fotos para mostrar problemas o avances
   - Sé claro y conciso en descripciones
   - Responde a comentarios relevantes

### Para Administradores

1. **Organización**:
   - Crea sectores específicos y claros
   - Asigna usuarios solo a sectores relevantes
   - Mantén proyectos separados por área

2. **Gestión de usuarios**:
   - Verifica permisos al crear usuarios
   - Usa roles apropiadamente
   - Mantén actualizada la información

3. **Limpieza**:
   - Archiva novedades obsoletas (no las elimines)
   - Mantén tableros organizados
   - Revisa periódicamente usuarios inactivos

4. **Seguridad**:
   - No compartas contraseñas de administrador
   - Cambia contraseñas periódicamente
   - Desactiva usuarios que ya no trabajan

---

## Solución de Problemas Comunes

### No puedo iniciar sesión
1. Verifica que tu email sea correcto
2. Confirma que tu usuario está activo
3. Intenta resetear contraseña con administrador
4. Verifica conexión a internet

### No veo algunas novedades
1. Verifica filtros activos (sector, estado)
2. Confirma que estés asignado al sector de la novedad
3. Asegúrate de estar en el proyecto correcto
4. Actualiza la vista con el botón refresh

### No puedo subir fotos
1. Verifica formato (JPG, PNG, GIF, WebP)
2. Confirma tamaño menor a 50MB
3. Comprueba conexión a internet
4. Intenta con otra imagen

### No veo un tablero
1. Verifica que estés en el proyecto correcto
2. Confirma que tengas acceso al módulo de Tareas
3. Asegúrate de que el tablero esté activo
4. Actualiza la vista

### Los cambios no se guardan
1. Verifica conexión a internet
2. Comprueba que completaste todos los campos obligatorios
3. Revisa si hay mensajes de error
4. Intenta refrescar la página

---

## Glosario de Términos

- **Novedad**: Publicación de información en el sistema
- **Tarjeta**: Tarea en un tablero Kanban
- **Tablero**: Conjunto de listas para organizar tareas
- **Lista**: Columna en un tablero (ej: Por Hacer)
- **Sector**: Categoría para organizar novedades por área
- **Proyecto**: Contenedor de novedades y tableros
- **Checklist**: Lista de subtareas dentro de una tarjeta
- **Asignación**: Vincular un usuario a una tarea
- **Dashboard**: Vista general con estadísticas
- **RLS**: Row Level Security - Seguridad a nivel de filas
- **Edge Function**: Función serverless de Supabase
- **Storage**: Almacenamiento de archivos en Supabase

---

## Información Técnica (para IT)

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Funciones**: Supabase Edge Functions (Deno)
- **Build**: Vite
- **Iconos**: Lucide React
- **Drag & Drop**: React-Dropzone

### Variables de Entorno
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Base de Datos
- 15+ tablas principales
- Políticas RLS en todas las tablas
- Índices optimizados
- Triggers para actividad
- Foreign keys con cascade

### Seguridad
- Autenticación JWT
- RLS en todas las tablas
- Políticas granulares por rol
- Validación de datos
- Sanitización de inputs
- Storage con políticas

---

## Contacto y Soporte

Para soporte técnico o consultas sobre el sistema, contacta al administrador del proyecto.

---

**Versión del Manual**: 2.0
**Fecha**: Enero 2026
**Sistema**: Gestión Rotorc
**Última Actualización**: Integración Edge Functions para actualización de usuarios
