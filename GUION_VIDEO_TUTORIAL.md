# Guion para Video Tutorial - Sistema de Gestión Rotorc

## Información del Video
- **Duración estimada**: 15-20 minutos
- **Audiencia**: Usuarios nuevos y existentes
- **Objetivo**: Mostrar las funcionalidades principales y nuevas del sistema
- **Formato**: Screencast con narración

---

## INTRODUCCIÓN (1 minuto)

### Escena 1: Pantalla de bienvenida
**Visual**: Logo de Rotorc y pantalla de login

**Narración**:
"Bienvenidos al Sistema de Gestión de Rotorc. En este video vamos a explorar todas las funcionalidades del sistema, desde las básicas hasta las más recientes actualizaciones. Este sistema está diseñado para mejorar la comunicación y organización de nuestros equipos de trabajo."

**Texto en pantalla**:
- Sistema de Gestión Rotorc
- Comunicación + Organización
- Dos módulos: Novedades y Tareas

---

## PARTE 1: INICIO DE SESIÓN Y NAVEGACIÓN (2 minutos)

### Escena 2: Login
**Visual**: Demostración de inicio de sesión

**Narración**:
"Para comenzar, ingresamos con nuestro correo electrónico y contraseña. El sistema usa autenticación segura mediante Supabase."

**Acciones en pantalla**:
1. Escribir email: admin@rotorc.com.ar
2. Escribir contraseña
3. Click en "Iniciar Sesión"
4. Transición al Dashboard

**Nota importante**:
"Si es tu primera vez, el administrador habrá creado tu cuenta y te proporcionará tus credenciales iniciales."

---

### Escena 3: Navegación principal
**Visual**: Recorrido por el header y menú

**Narración**:
"Una vez dentro, vemos el header con el logo de Rotorc. Aquí tenemos el selector de proyectos, nuestro perfil de usuario, y el botón de actualización para sincronizar datos en tiempo real."

**Destacar en pantalla**:
1. Selector de proyectos (señalar con círculo)
2. Botón de actualizar (señalar)
3. Avatar de perfil (señalar)
4. Botón de salir (señalar)

**Narración continuada**:
"En el menú inferior encontramos las pestañas principales: Dashboard, Novedades, Tareas, y si eres administrador, también Usuarios, Proyectos y Sectores."

**Acciones**:
- Pasar el cursor por cada tab
- Hacer zoom en el selector de modo (Novedades/Tareas)

---

## PARTE 2: MÓDULO DE NOVEDADES (5 minutos)

### Escena 4: Dashboard de Novedades
**Visual**: Vista del dashboard con estadísticas

**Narración**:
"El Dashboard de Novedades es nuestro punto de partida. Aquí vemos cuatro estadísticas principales:"

**Acciones con zoom**:
1. "Total de Novedades del proyecto"
2. "Mis Novedades - las que yo he creado"
3. "Sin Leer - las que aún no he revisado"
4. "Archivadas - solo para administradores"

**Narración**:
"Cada una de estas tarjetas es clickeable y filtra automáticamente la vista de novedades."

**Demo**: Click en "Sin Leer" → mostrar cómo cambia la vista

**Continuar con sectores**:
"Más abajo vemos las tarjetas de sectores. Estas nos muestran cuántas novedades sin leer tenemos en cada sector."

**Destacar código de colores**:
- Rojo = Hay novedades sin leer (señalar ejemplo)
- Verde = Todo al día (señalar ejemplo)

---

### Escena 5: Crear una Novedad
**Visual**: Proceso completo de creación

**Narración**:
"Vamos a crear una novedad nueva. Click en el botón 'Nueva Novedad' que está en la esquina superior derecha."

**Demo paso a paso**:
1. Click en "Nueva Novedad"
2. Se abre el modal (pausa)

**Narración**:
"Ahora completamos los campos:"

**Acciones**:
1. Seleccionar sector: "Producción"
2. Título: "Actualización de máquina cortadora"
3. Descripción: "Se realizó mantenimiento preventivo a la máquina cortadora #3. Todos los sistemas operando normalmente."
4. Agregar fotos:
   - "Podemos arrastrar y soltar fotos aquí"
   - Demostrar drag & drop
   - "O hacer click para seleccionar"
   - Mostrar preview de imágenes

**Narración**:
"Podemos agregar hasta 10 fotos por novedad. Formatos permitidos: JPG, PNG, GIF y WebP, con un límite de 50MB por imagen."

**Finalizar**:
5. Click en "Publicar Novedad"
6. Mostrar cómo aparece en el listado

---

### Escena 6: Ver y comentar Novedad
**Visual**: Abrir detalle de novedad

**Narración**:
"Para ver el detalle completo de una novedad, simplemente hacemos click en ella."

**Acciones**:
1. Click en una novedad del listado
2. Se abre el modal de detalle (pausa para mostrar)

**Narración**:
"Aquí vemos toda la información: el título, sector, autor, fecha, descripción completa y las fotos. Si hacemos click en una foto, se abre en modo galería completa."

**Demo**:
- Click en una foto
- Navegar entre fotos
- Cerrar galería

**Narración sobre comentarios**:
"Más abajo encontramos la sección de comentarios. Vamos a agregar uno."

**Acciones**:
1. Scroll a sección de comentarios
2. Escribir: "Revisado, todo correcto. Gracias por el aviso."
3. (Opcional) Click en adjuntar foto
4. Click en "Comentar"
5. Mostrar cómo aparece el nuevo comentario

**Narración**:
"Los comentarios permiten mantener la conversación organizada en un solo lugar. Además, podemos adjuntar fotos para dar más contexto."

---

### Escena 7: Timeline de Actividad
**Visual**: Scroll al timeline

**Narración**:
"El timeline de actividad muestra un registro completo de todo lo que ha sucedido con esta novedad: quién la creó, quién la leyó, los comentarios agregados, y si fue archivada o desarchivada."

**Demo**:
- Hacer scroll por el timeline
- Señalar diferentes tipos de actividades

---

### Escena 8: Filtros y Búsqueda
**Visual**: Volver a la lista de novedades

**Narración**:
"En la vista de lista tenemos múltiples opciones para filtrar:"

**Demo de filtros**:
1. **Filtro por Sector**:
   - Abrir dropdown de sectores
   - Seleccionar "Mantenimiento"
   - Mostrar cómo se filtran

2. **Filtro por Estado**:
   - Cambiar a "No leídas"
   - Mostrar cambio

3. **Búsqueda**:
   - Escribir "máquina" en el buscador
   - Mostrar resultados en tiempo real

**Narración**:
"Los filtros se pueden combinar para encontrar exactamente lo que necesitas."

---

## PARTE 3: MÓDULO DE TAREAS (6 minutos)

### Escena 9: Cambiar a modo Tareas
**Visual**: Selector de modo

**Narración**:
"Ahora vamos a explorar el módulo de Tareas. Para cambiar de módulo, usamos este selector en el header."

**Acciones**:
1. Click en selector de modo
2. Seleccionar "Tareas"
3. Mostrar cómo cambia la interfaz

---

### Escena 10: Dashboard de Tareas
**Visual**: Vista de tableros

**Narración**:
"El Dashboard de Tareas nos muestra todos los tableros del proyecto actual. Cada tablero es como un espacio de trabajo independiente para organizar tareas relacionadas."

**Recorrido**:
- Mostrar las tarjetas de tableros
- Señalar estadísticas (total tareas, asignadas, completadas)
- Destacar el botón "Ver Tablero"

---

### Escena 11: Crear un Tablero (solo para admin)
**Visual**: Proceso de creación

**Narración**:
"Los administradores pueden crear nuevos tableros. Veamos cómo:"

**Demo**:
1. Click en "Nuevo Tablero"
2. Nombre: "Sprint Enero 2026"
3. Descripción: "Tareas del sprint de desarrollo de enero"
4. Click en "Crear"
5. Mostrar tablero recién creado

**Narración**:
"El sistema crea automáticamente tres listas básicas: Por Hacer, En Progreso y Completado. Estas se pueden personalizar después."

---

### Escena 12: Vista de Tablero Kanban
**Visual**: Abrir un tablero

**Narración**:
"Vamos a entrar a un tablero para ver cómo funciona."

**Acciones**:
1. Click en "Ver Tablero"
2. Pausa en la vista Kanban

**Narración**:
"Esta es la vista Kanban. Tenemos columnas que representan estados, y tarjetas que representan tareas. Podemos mover las tarjetas entre columnas simplemente arrastrándolas."

**Demo de drag & drop**:
1. Tomar una tarjeta de "Por Hacer"
2. Arrastrarla a "En Progreso"
3. Soltar
4. Mostrar animación

---

### Escena 13: Crear Tarea Rápida
**Visual**: Formulario de tarea rápida

**Narración**:
"Para crear una tarea nueva rápidamente, hacemos click en 'Nueva Tarea'."

**Demo**:
1. Click en "Nueva Tarea"
2. Seleccionar tablero: "Sprint Enero 2026"
3. Seleccionar lista: "Por Hacer"
4. Título: "Revisar documentación del sistema"
5. Descripción: "Actualizar manual con nuevas funciones"
6. Prioridad: "Alta"
7. Click en "Crear Tarea"
8. Mostrar la nueva tarjeta en el tablero

---

### Escena 14: Detalle de Tarjeta
**Visual**: Abrir una tarjeta

**Narración**:
"Ahora veamos el detalle completo de una tarjeta. Click en cualquier tarjeta del tablero."

**Recorrido por secciones**:

**1. Información básica**:
"Aquí vemos el título, que podemos editar directamente, la lista donde se encuentra, el estado y la prioridad."

**2. Asignaciones**:
"Podemos asignar la tarea a uno o varios usuarios."

**Demo**:
- Click en "Agregar asignado"
- Seleccionar usuario
- Mostrar cómo aparece su avatar

**3. Etiquetas**:
"Las etiquetas nos ayudan a categorizar tareas."

**Demo**:
- Click en "Agregar etiqueta"
- Crear etiqueta: "Bug" (color rojo)
- Agregar etiqueta: "Urgente" (color naranja)

**4. Checklist**:
"El checklist es perfecto para dividir una tarea en pasos más pequeños."

**Demo**:
- Agregar ítem: "Revisar sección de novedades"
- Agregar ítem: "Actualizar capturas de pantalla"
- Agregar ítem: "Revisar ortografía"
- Marcar el primero como completado
- Mostrar barra de progreso (1/3 - 33%)

**5. Adjuntos**:
"Podemos adjuntar archivos relevantes a la tarea."

**Demo**:
- Click en "Subir archivo"
- Seleccionar documento
- Mostrar cómo aparece en la lista

**6. Comentarios**:
"Similar a las novedades, podemos comentar para mantener conversaciones organizadas."

---

### Escena 15: Editar Tarjeta
**Visual**: Modal de edición

**Narración**:
"Para hacer cambios más profundos, usamos el botón Editar."

**Demo rápido**:
1. Click en "Editar"
2. Cambiar estado a "En Progreso"
3. Agregar fecha de vencimiento
4. Click en "Guardar"
5. Mostrar timeline actualizado

---

### Escena 16: Vincular Novedad a Tarjeta
**Visual**: Función de vinculación

**Narración**:
"Una función muy útil es vincular novedades con tareas. Esto nos permite mantener el contexto de por qué se creó una tarea."

**Demo**:
1. En detalle de tarjeta, ir a "Novedades vinculadas"
2. Click en "Vincular novedad"
3. Seleccionar novedad de la lista
4. Click en "Vincular"
5. Mostrar preview de la novedad vinculada
6. Click en la novedad para abrirla

---

## PARTE 4: GESTIÓN (Solo Administradores) (3 minutos)

### Escena 17: Gestión de Usuarios
**Visual**: Sección de Usuarios

**Narración**:
"Los administradores tienen acceso a secciones especiales de gestión. Empecemos con Usuarios."

**Demo de creación**:
1. Click en tab "Usuarios"
2. Click en "Nuevo Usuario"
3. Completar formulario:
   - Nombre: "Carlos"
   - Apellido: "Mendoza"
   - DNI: "35678901"
   - Email: "cmendoza@rotorc.com.ar"
   - Contraseña: (escribir, pero pixelar en video)
   - Rol: "Usuario"
   - Módulos: Ambos activos
   - Sectores: Seleccionar "Producción" y "Mantenimiento"
   - Proyectos: Seleccionar "Planta Principal"
4. Click en "Crear Usuario"

**Narración**:
"El usuario se crea tanto en nuestra base de datos como en Supabase Auth para la autenticación."

---

### Escena 18: Actualizar Usuario (NUEVA FUNCIÓN)
**Visual**: Edición de usuario

**Narración**:
"Esta es una de nuestras funciones más recientes y mejoradas. Ahora podemos actualizar usuarios de forma completa, incluyendo su email y contraseña."

**Demo**:
1. Click en "Editar" en un usuario
2. Cambiar email: "nuevo@rotorc.com.ar"
3. Ingresar nueva contraseña
4. Cambiar rol de "Usuario" a "Administrador"
5. Agregar un sector nuevo
6. Click en "Actualizar Usuario"

**Narración importante**:
"Lo especial de esta actualización es que ahora el sistema sincroniza automáticamente con Supabase Auth. Si cambiamos el email o la contraseña, estos cambios se aplican también en el sistema de autenticación. Esto se hace de forma segura mediante una Edge Function."

**Mostrar en pantalla** (consola del navegador):
- Logs de debugging (sin mostrar contraseña)
- Confirmación de actualización exitosa

---

### Escena 19: Gestión de Proyectos
**Visual**: Sección de Proyectos

**Narración rápida**:
"En la sección de Proyectos podemos crear, editar y gestionar los diferentes proyectos de la organización."

**Demo rápida**:
1. Mostrar lista de proyectos
2. Click en "Nuevo Proyecto"
3. Crear: "Planta Norte - Expansión"
4. Estado: Activo
5. Guardar

---

### Escena 20: Gestión de Sectores
**Visual**: Sección de Sectores

**Narración rápida**:
"Y en Sectores gestionamos las áreas de la empresa para categorizar las novedades."

**Demo rápida**:
1. Mostrar lista de sectores
2. Crear nuevo: "Seguridad Industrial"
3. Guardar

---

## PARTE 5: PERFIL Y CONFIGURACIÓN (1 minuto)

### Escena 21: Editar Perfil
**Visual**: Modal de perfil

**Narración**:
"Todos los usuarios pueden editar su perfil. Click en el avatar en el header."

**Demo**:
1. Click en avatar
2. Cambiar nombre: "Carlos Alberto"
3. Subir foto de perfil:
   - Click en "Subir foto"
   - Seleccionar imagen
   - Mostrar preview
4. Cambiar contraseña (opcional)
5. Click en "Guardar cambios"
6. Mostrar cómo se actualiza el avatar en el header

---

## PARTE 6: CARACTERÍSTICAS ESPECIALES (2 minutos)

### Escena 22: Diseño Responsive
**Visual**: Cambiar tamaño de ventana

**Narración**:
"El sistema está optimizado para funcionar en cualquier dispositivo."

**Demo**:
1. Vista desktop → tablet
2. Mostrar cómo se adapta el menú
3. Tablet → móvil
4. Mostrar vista móvil completa
5. Demostrar scroll, botones táctiles

**Narración**:
"En móviles, los modales se muestran en pantalla completa y todos los elementos son touch-friendly."

---

### Escena 23: Actualización en Tiempo Real
**Visual**: Dos navegadores lado a lado

**Narración**:
"El sistema permite trabajo colaborativo. Veamos qué pasa cuando dos usuarios trabajan simultáneamente."

**Demo**:
1. **Navegador 1**: Usuario crea una novedad
2. **Navegador 2**: Click en botón "Actualizar"
3. Mostrar cómo aparece la nueva novedad
4. **Navegador 2**: Usuario comenta
5. **Navegador 1**: Actualizar
6. Mostrar el nuevo comentario

---

### Escena 24: Filtros y Permisos
**Visual**: Comparación de vistas

**Narración**:
"El sistema tiene control de acceso inteligente. Los usuarios solo ven lo que les corresponde según sus asignaciones."

**Demo split screen**:
- **Lado izquierdo**: Usuario regular (solo ve sectores asignados)
- **Lado derecho**: Administrador (ve todo)

**Narración**:
"Esto garantiza que cada persona tenga acceso a la información relevante para su trabajo, sin sobrecargar con información innecesaria."

---

## CONCLUSIÓN (1 minuto)

### Escena 25: Resumen
**Visual**: Dashboard general

**Narración**:
"En resumen, el Sistema de Gestión de Rotorc ofrece:"

**Texto en pantalla con bullets**:
✅ Módulo de Novedades para comunicación efectiva
✅ Módulo de Tareas con tableros Kanban
✅ Gestión completa de usuarios y permisos
✅ Sistema de comentarios y actividad
✅ Vinculación entre novedades y tareas
✅ Carga de imágenes y archivos
✅ Filtros avanzados de búsqueda
✅ Interfaz responsive para todos los dispositivos
✅ Actualizaciones en tiempo real
✅ **NUEVO**: Sincronización con Supabase Auth
✅ **NUEVO**: Control de módulos por usuario

**Narración final**:
"Con estas herramientas, nuestros equipos pueden comunicarse mejor, organizarse eficientemente, y mantener toda la información centralizada y accesible."

---

### Escena 26: Cierre
**Visual**: Logo de Rotorc

**Narración**:
"Gracias por ver este tutorial. Si tienes preguntas o necesitas ayuda, contacta a tu administrador del sistema."

**Texto en pantalla**:
- Sistema de Gestión Rotorc
- Versión 2.0 - Enero 2026
- ¡Gracias!

---

## NOTAS DE PRODUCCIÓN

### Configuración Técnica
- **Resolución**: 1920x1080 (Full HD)
- **Frame rate**: 30 fps
- **Audio**: Voz clara con reducción de ruido
- **Software recomendado**: OBS Studio o Camtasia

### Elementos Gráficos a Agregar
1. **Círculos/flechas** para señalar elementos importantes
2. **Zoom** en campos de formulario cuando se llenan
3. **Highlights** en botones antes de hacer click
4. **Transiciones** suaves entre escenas (fade, 0.5s)
5. **Texto en pantalla** para reforzar puntos clave
6. **Música de fondo** (muy suave, no invasiva)

### Consejos de Grabación
1. Usar datos de ejemplo realistas pero ficticios
2. Pixelar contraseñas en todas las escenas
3. Limpiar notificaciones del sistema antes de grabar
4. Usar cursor grande para mejor visibilidad
5. Hacer pausas de 1-2 segundos después de cada acción importante
6. Hablar claramente y a velocidad moderada
7. Si algo sale mal, es mejor re-grabar que editar extensamente

### Variaciones Sugeridas

#### Versión Corta (5 minutos)
- Escenas: 1, 2, 4, 5, 6, 10, 12, 13, 14, 18, 25, 26
- Para usuarios que solo necesitan lo básico

#### Versión para Administradores (10 minutos)
- Enfocarse en escenas 17-20
- Agregar más detalles de configuración
- Incluir mejores prácticas de administración

#### Versión para Usuarios Móviles (3 minutos)
- Grabar todo en dispositivo móvil
- Enfocarse en gestos táctiles
- Demostrar uso en campo

### Subtítulos
Se recomienda agregar subtítulos en español para:
- Mejor accesibilidad
- Uso en ambientes ruidosos
- Usuarios con problemas de audición

### Actualizaciones Futuras
Este guion debe actualizarse cuando se agreguen:
- Nuevas funcionalidades
- Cambios en la interfaz
- Mejoras en flujos de trabajo
- Integraciones con otros sistemas

---

## CHECKLIST PRE-GRABACIÓN

- [ ] Preparar datos de ejemplo
- [ ] Crear usuarios de prueba
- [ ] Cargar novedades de ejemplo con fotos
- [ ] Crear tableros y tareas de ejemplo
- [ ] Configurar proyectos y sectores
- [ ] Limpiar notificaciones del navegador
- [ ] Cerrar pestañas innecesarias
- [ ] Verificar audio del micrófono
- [ ] Probar software de grabación
- [ ] Ajustar resolución de pantalla
- [ ] Preparar script de narración
- [ ] Hacer grabación de prueba de 1 minuto

---

## CHECKLIST POST-GRABACIÓN

- [ ] Revisar audio (nivel, claridad)
- [ ] Agregar música de fondo
- [ ] Insertar elementos gráficos (círculos, flechas)
- [ ] Agregar texto en pantalla
- [ ] Pixelar información sensible
- [ ] Agregar transiciones
- [ ] Generar subtítulos
- [ ] Exportar en múltiples resoluciones (1080p, 720p, 480p)
- [ ] Probar reproducción completa
- [ ] Compartir con equipo para feedback
- [ ] Realizar correcciones finales
- [ ] Publicar y distribuir

---

**Preparado por**: Sistema de Gestión Rotorc
**Fecha**: Enero 2026
**Versión**: 1.0
