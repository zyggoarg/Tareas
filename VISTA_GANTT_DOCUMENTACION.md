# 📊 Vista Gantt - Documentación

## Nueva Funcionalidad: Vista de Diagrama Gantt

### 🎯 Descripción General

Se ha agregado una **Vista Gantt** profesional al módulo de tareas que permite visualizar todas las tareas de un tablero en un diagrama de línea de tiempo (timeline). Esta vista complementa la vista Kanban existente y proporciona una perspectiva temporal del flujo de trabajo.

---

## ✨ Características Principales

### 1. Selector de Vista (Kanban/Gantt)
- **Ubicación**: Header del tablero, junto al nombre
- **Diseño**: Botones estilo toggle con iconos
  - 🔲 Vista Kanban (LayoutGrid)
  - 📅 Vista Gantt (Calendar)
- **Comportamiento**: Switch instantáneo entre vistas

### 2. Timeline Visual
- **Visualización horizontal** de tareas a lo largo del tiempo
- **Fechas en el header**: Día, mes y día de la semana
- **Línea de "Hoy"**: Indicador visual azul vertical
- **Barras de tareas**: Coloreadas según prioridad
- **Fechas calculadas automáticamente** según rango de tareas

### 3. Agrupación de Tareas
Tres modos de agrupación seleccionables:

#### Por Lista (Default)
- Agrupa tareas según la lista/columna del tablero
- Mantiene la estructura Kanban
- Ideal para ver el flujo de trabajo

#### Por Usuario
- Agrupa tareas por persona asignada
- Incluye grupo "Sin asignar" para tareas no asignadas
- Perfecto para ver carga de trabajo por persona

#### Por Prioridad
- Agrupa en: Crítica, Alta, Media, Baja
- Visualiza tareas por urgencia
- Facilita priorización

### 4. Grupos Expandibles/Colapsables
- Click en el nombre del grupo para expandir/colapsar
- Icono de chevron indica estado (▼ expandido, ► colapsado)
- Contador de tareas en cada grupo

### 5. Barras de Tareas con Información
- **Color según prioridad**:
  - 🔴 Crítica: Rojo
  - 🟠 Alta: Naranja
  - 🟡 Media: Amarillo
  - 🟢 Baja: Verde
- **Tareas vencidas**: Fondo rojo claro con borde rojo
- **Hover**: Shadow elevado y cursor pointer
- **Click**: Abre modal de detalles completo

### 6. Grid de Fechas
- Columnas por día
- Grid de fondo para alineación visual
- Destaca el día actual (fondo azul claro)
- Fechas formateadas en español

### 7. Información en Fila de Tarea
- Título de la tarea (truncado si es largo)
- Indicador de prioridad (punto de color)
- Contador de usuarios asignados (si hay)

### 8. Leyenda
- Barra inferior con explicación de colores
- Rango de fechas del timeline
- Símbolos de prioridad
- Indicador de "hoy"

---

## 🔧 Implementación Técnica

### Nuevos Archivos Creados

#### 1. `src/components/GanttView.tsx`
Componente principal de la vista Gantt.

**Props**:
- `tablero`: Datos completos del tablero
- `usuarioActual`: Usuario actual
- `onActualizarTarjeta`: Callback para actualizar
- `onEliminarTarjeta`: Callback para eliminar
- `onAgregarComentario`: Callback para comentarios
- `onRegistrarActividad`: Callback para actividad
- `onSubirAdjunto`: Callback para adjuntos

**Features**:
- Cálculo automático de rango de fechas
- Agrupación dinámica de tareas
- Posicionamiento matemático de barras
- Estado de grupos expandidos/colapsados
- Integración con modal de detalles

### Modificaciones en Archivos Existentes

#### 1. `src/components/TableroBoard.tsx`
- **Agregado**: Import de `GanttView` y iconos
- **Agregado**: Estado `tipoVista` ('kanban' | 'gantt')
- **Agregado**: Selector de vista en el header
- **Modificado**: Renderizado condicional según vista activa

#### 2. `src/types.ts`
- **Agregado**: Campo `fechaInicio?: Date` a interface `Tarjeta`

#### 3. `src/components/TarjetaEditModal.tsx`
- **Agregado**: Estado `fechaInicio`
- **Agregado**: Campo de fecha de inicio en formulario
- **Modificado**: Grid de 2 columnas para fechas (inicio y vencimiento)
- **Modificado**: `handleSubmit` incluye fecha de inicio

#### 4. `src/hooks/useTableros.ts`
- **Modificado**: Mapeo de tarjetas incluye `fechaInicio`
- **Modificado**: `crearTarjeta` incluye `fecha_inicio`
- **Modificado**: `actualizarTarjeta` incluye `fecha_inicio`

### Migración de Base de Datos

#### `add_fecha_inicio_to_tarjetas.sql`
```sql
ALTER TABLE tarjetas ADD COLUMN fecha_inicio timestamptz;
```

**Detalles**:
- Columna opcional (nullable)
- Tipo: `timestamptz` (timestamp with timezone)
- Compatible con columna existente `fecha_vencimiento`

---

## 📊 Lógica de Fechas en Vista Gantt

### Cálculo de Fechas de Inicio y Fin

Para cada tarjeta:

1. **Fecha de Inicio**:
   - Si tiene `fechaInicio` definida → usar `fechaInicio`
   - Si no → usar `fechaCreacion`

2. **Fecha de Fin**:
   - Si tiene `fechaVencimiento` definida → usar `fechaVencimiento`
   - Si no → `fechaInicio + 1 día`

3. **Rango del Timeline**:
   - Fecha mínima: La más antigua entre todas las tareas - 3 días
   - Fecha máxima: La más reciente entre todas las tareas + 3 días
   - Default (sin tareas): Hoy hasta dentro de 30 días

### Posicionamiento de Barras

Cálculo matemático:
```typescript
const totalDias = (fechaFin - fechaInicio) del timeline
const diasDesdeInicio = (fechaInicio de tarea - fechaInicio del timeline)
const duracionDias = (fechaFin de tarea - fechaInicio de tarea)

left = (diasDesdeInicio / totalDias) * 100
width = (duracionDias / totalDias) * 100
```

---

## 🎨 Diseño Visual

### Colores

#### Prioridades
- **Crítica**: `bg-red-500`, `border-red-600`
- **Alta**: `bg-orange-500`, `border-orange-600`
- **Media**: `bg-yellow-500`, `border-yellow-600`
- **Baja**: `bg-green-500`, `border-green-600`

#### Estados Especiales
- **Vencida**: `bg-red-100`, `border-red-500` (override)
- **Hoy**: `bg-blue-50`, línea vertical `bg-blue-500`

#### Fondos
- **Header**: `bg-gray-50`
- **Grupos**: `bg-gray-50` con hover `hover:bg-gray-50`
- **Filas**: `bg-white` con hover `hover:bg-gray-50`
- **Leyenda**: `bg-gray-50`

### Dimensiones
- **Ancho de columna de fecha**: 60px
- **Alto de barra de tarea**: 32px (h-8)
- **Ancho de columna de grupos**: 256px (w-64)
- **Padding de barras**: 4px superior

### Responsive
- Grid de 2 columnas en fechas se vuelve 1 columna en móvil
- Scroll horizontal automático en timeline
- Sticky header para mantener fechas visibles

---

## 👤 Casos de Uso

### Caso 1: Planificación de Sprint
**Escenario**: Equipo planificando un sprint de 2 semanas

**Uso**:
1. Cambiar a Vista Gantt
2. Agrupar "Por Usuario"
3. Ver distribución de tareas por persona
4. Identificar sobrecarga o capacidad ociosa
5. Reasignar tareas según sea necesario

**Beneficio**: Visualización clara de carga de trabajo temporal

---

### Caso 2: Identificar Tareas Vencidas
**Escenario**: PM revisando estado del proyecto

**Uso**:
1. Abrir Vista Gantt
2. Buscar barras rojas (vencidas)
3. La línea azul de "hoy" facilita identificación
4. Click en tarea vencida para ver detalles
5. Actualizar o reasignar

**Beneficio**: Identificación visual inmediata de retrasos

---

### Caso 3: Secuencia de Dependencias
**Escenario**: Tareas con dependencias temporales

**Uso**:
1. Vista Gantt agrupada "Por Lista"
2. Ver flujo de Por Hacer → En Progreso → Completado
3. Identificar gaps o solapamientos
4. Ajustar fechas de inicio/fin según dependencias

**Beneficio**: Visión temporal del flujo de trabajo

---

### Caso 4: Priorización Visual
**Escenario**: Identificar tareas críticas

**Uso**:
1. Cambiar a Vista Gantt
2. Agrupar "Por Prioridad"
3. Sección "Crítica" en la parte superior
4. Ver timeline de tareas críticas
5. Enfocarse en fechas cercanas

**Beneficio**: Priorización clara y temporal

---

## 🔄 Flujo de Trabajo Completo

### Desde Vista Kanban
```
Usuario en Tablero Kanban
    ↓
Click en botón "Gantt" (header)
    ↓
Sistema renderiza GanttView
    ↓
Calcula rango de fechas
    ↓
Agrupa tareas (default: por Lista)
    ↓
Renderiza timeline
    ↓
Usuario puede:
    - Expandir/colapsar grupos
    - Cambiar agrupación
    - Click en tarea → Ver detalles
    ↓
Click en "Kanban" para volver
```

### Edición de Fechas
```
Usuario en cualquier vista
    ↓
Click en tarjeta
    ↓
Modal de detalles se abre
    ↓
Click en "Editar"
    ↓
Modal de edición con fechas
    ↓
Campos: Fecha Inicio | Fecha Vencimiento
    ↓
Guardar cambios
    ↓
Vista Gantt se actualiza automáticamente
```

---

## 🚀 Ventajas de la Vista Gantt

### Para Project Managers
✅ Visión temporal completa del proyecto
✅ Identificación rápida de cuellos de botella
✅ Planificación de recursos eficiente
✅ Tracking de progreso vs fechas

### Para Equipos
✅ Claridad sobre deadlines
✅ Visibilidad de prioridades
✅ Comprensión de carga de trabajo
✅ Mejor coordinación temporal

### Para Stakeholders
✅ Vista ejecutiva del timeline
✅ Estado de proyecto de un vistazo
✅ Identificación de riesgos (vencimientos)
✅ Planificación estratégica

---

## 📱 Compatibilidad

### Navegadores
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- **Desktop**: Experiencia completa, scroll horizontal fluido
- **Tablet**: Funcional, scroll táctil optimizado
- **Mobile**: Funcional pero mejor en landscape

### Resoluciones
- Mínimo recomendado: 1024px de ancho
- Óptimo: 1440px+ (full timeline visible)
- Mobile: Scroll horizontal habilitado

---

## 🎓 Guía de Usuario

### Cómo Cambiar a Vista Gantt
1. Abrir un tablero
2. En el header, buscar los botones de vista
3. Click en botón "Gantt" con ícono de calendario
4. La vista cambia instantáneamente

### Cómo Cambiar Agrupación
1. En Vista Gantt, buscar dropdown "Agrupar por"
2. Seleccionar entre: Lista, Usuario, Prioridad
3. Vista se reorganiza automáticamente

### Cómo Ver Detalles de una Tarea
1. Ubicar la tarea en el timeline (barra coloreada)
2. Click en la barra
3. Modal completo se abre con todos los detalles
4. Desde ahí se puede editar, comentar, etc.

### Cómo Establecer Fecha de Inicio
1. Abrir tarea (click en tarjeta)
2. Click en "Editar"
3. En el formulario, sección "Fecha de inicio"
4. Seleccionar fecha del calendario
5. Guardar cambios
6. Vista Gantt reflejará la nueva fecha

### Interpretar Colores
- **Rojo**: Prioridad crítica o tarea vencida
- **Naranja**: Prioridad alta
- **Amarillo**: Prioridad media
- **Verde**: Prioridad baja
- **Línea azul vertical**: Día actual

---

## 🔍 Detalles de Implementación

### Estado Local
```typescript
const [tipoVista, setTipoVista] = useState<'kanban' | 'gantt'>('kanban');
const [vistaAgrupacion, setVistaAgrupacion] = useState<'lista' | 'usuario' | 'prioridad'>('lista');
const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set());
```

### Cálculos Clave
```typescript
// Rango de fechas del timeline
const rangoFechas = useMemo(() => {
  // Encuentra min y max de todas las fechas
  // Agrega margen de 3 días a cada lado
}, [tablero]);

// Posición de barra en porcentaje
const calcularPosicion = (fechaInicio: Date, fechaFin: Date) => {
  const left = (diasDesdeInicio / totalDias) * 100;
  const width = (duracionDias / totalDias) * 100;
  return { left, width };
};
```

### Filtrado
```typescript
// Solo muestra tareas con fechas válidas
const tarjetasConFechasValidas = todasTarjetas.filter(t =>
  t.fechaCreacion || t.fechaVencimiento
);
```

---

## 🐛 Manejo de Casos Especiales

### Sin Tareas con Fechas
- Muestra mensaje: "No hay tareas con fechas"
- Ícono de calendario
- Instrucción de que necesitan fechas para Gantt

### Tareas sin Fecha de Vencimiento
- Usa fecha de inicio + 1 día como duración
- Barra mínima visible (1 día)

### Tareas sin Fecha de Inicio
- Usa fecha de creación como inicio
- Siempre hay una fecha válida

### Fecha de Inicio > Fecha de Vencimiento
- Sistema acepta ambas fechas
- Validación opcional puede agregarse en futuro

### Grupos Vacíos
- No se muestran en agrupación
- Solo grupos con tareas aparecen

---

## 🔮 Futuras Mejoras Sugeridas

### Funcionalidad
1. **Drag & drop de barras** para cambiar fechas
2. **Zoom** (día, semana, mes, año)
3. **Dependencias** entre tareas (flechas)
4. **Milestones** (hitos del proyecto)
5. **Filtros** adicionales (estado, etiquetas)
6. **Exportar** a imagen o PDF
7. **Vista de recursos** (capacidad vs asignación)
8. **Línea de progreso** real vs planificado

### UX
1. **Tooltips** al hacer hover en barras
2. **Mini-mapa** para navegación en timelines largos
3. **Indicadores de conflictos** (sobrecarga)
4. **Atajos de teclado** para navegación
5. **Vista de hoy** (auto-scroll al día actual)

### Integración
1. **Sincronización** con calendario externo
2. **Notificaciones** de fechas próximas
3. **Dashboard** con múltiples proyectos
4. **Comparación** de versiones de timeline

---

## 📊 Métricas de Éxito

### KPIs para Medir Adopción
- % de usuarios que usan Vista Gantt
- Frecuencia de cambio Kanban ↔ Gantt
- Tiempo promedio en cada vista
- % de tareas con fecha de inicio definida
- Reducción en tareas vencidas

### Feedback Esperado
✅ "Ahora veo claramente los plazos"
✅ "Fácil identificar sobrecarga de trabajo"
✅ "Útil para planning meetings"
✅ "Complementa perfecto el Kanban"

---

## 🎯 Conclusión

La Vista Gantt es una adición poderosa al módulo de tareas que:

1. **Complementa** la vista Kanban sin reemplazarla
2. **Visualiza** la dimensión temporal del trabajo
3. **Facilita** la planificación y seguimiento
4. **Mejora** la toma de decisiones
5. **Integra** perfectamente con el flujo existente

Es una herramienta profesional que eleva el sistema al nivel de soluciones empresariales como Jira, Asana o Monday.com, pero integrada nativamente en el sistema Rotorc.

---

**Versión**: 1.0
**Fecha**: Enero 2026
**Desarrollador**: Sistema Rotorc
**Estado**: ✅ Producción
