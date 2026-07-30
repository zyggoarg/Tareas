# Configuración PWA - Sistema de Gestión Rotorc

## Archivos Creados

### 1. `/public/manifest.json`
Manifest de la aplicación con configuración para instalación:
- **name**: Nombre completo de la aplicación
- **short_name**: Nombre corto para pantalla de inicio
- **display**: `standalone` (se ejecuta como app nativa)
- **theme_color**: Color de tema (#3b82f6 - azul)
- **background_color**: Color de fondo (#ffffff - blanco)
- **icons**: Iconos de 192x192 y 512x512 píxeles

### 2. `/public/service-worker.js`
Service Worker para:
- Cache de recursos estáticos
- Funcionamiento offline
- Estrategia Network First con fallback a Cache
- Actualización automática de versiones

### 3. `/public/icon-192.png` y `/public/icon-512.png`
Iconos de la aplicación en formato PNG:
- **icon-192.png**: Icono pequeño (192x192px) - para pantalla de inicio
- **icon-512.png**: Icono grande (512x512px) - para splash screen
- Diseño: Tablero Kanban con la letra "R" de Rotorc

### 4. `/index.html` (actualizado)
Meta tags agregados para PWA:
- `theme-color`: Color de la barra de estado
- `apple-mobile-web-app-capable`: Habilita modo standalone en iOS
- `apple-mobile-web-app-status-bar-style`: Estilo de barra en iOS
- `apple-mobile-web-app-title`: Título en iOS
- `apple-touch-icon`: Iconos para pantalla de inicio en iOS
- `manifest`: Link al archivo manifest.json

### 5. `/src/main.tsx` (actualizado)
Registro automático del Service Worker:
- Detecta y registra el service worker
- Notifica sobre actualizaciones disponibles
- Actualización automática cada hora

## Cómo Instalar la PWA

### En Android (Chrome):
1. Abre la aplicación en Chrome
2. Busca el ícono de "Instalar aplicación" (⊕) en la barra de direcciones
3. Toca "Instalar" o "Agregar a pantalla de inicio"
4. La app aparecerá como una aplicación nativa en tu dispositivo

### En iPhone/iPad (Safari):
1. Abre la aplicación en Safari
2. Toca el botón de compartir (⎙)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma el nombre y toca "Agregar"
5. La app aparecerá en tu pantalla de inicio

### En Desktop (Chrome/Edge):
1. Abre la aplicación en Chrome o Edge
2. Busca el ícono de instalación (+) en la barra de direcciones
3. Haz clic en "Instalar"
4. La app se ejecutará en una ventana independiente

## Verificación

Para verificar que la PWA está configurada correctamente:

1. **Chrome DevTools**:
   - Abre DevTools (F12)
   - Ve a la pestaña "Application"
   - Revisa las secciones:
     - Manifest: Debe mostrar todos los datos del manifest.json
     - Service Workers: Debe aparecer registrado
     - Cache Storage: Debe mostrar los recursos cacheados

2. **Lighthouse**:
   - Abre DevTools (F12)
   - Ve a la pestaña "Lighthouse"
   - Selecciona "Progressive Web App"
   - Haz clic en "Generate report"
   - Debe obtener un puntaje alto (>90)

## Funcionalidades PWA

✅ **Instalable**: Se puede instalar en dispositivos móviles y desktop
✅ **Offline**: Funciona sin conexión a internet (con cache)
✅ **Standalone**: Se ejecuta como aplicación nativa
✅ **Responsive**: Se adapta a cualquier tamaño de pantalla
✅ **Fast**: Carga rápida con service worker
✅ **Updates**: Notifica cuando hay actualizaciones disponibles
✅ **App-like**: Experiencia similar a una app nativa

## Notas Importantes

- Los iconos PNG se generaron automáticamente desde SVG
- El service worker NO cachea requests a Supabase para mantener datos actualizados
- La aplicación funciona offline con los datos previamente cacheados
- Las actualizaciones se verifican cada hora automáticamente
- El usuario será notificado cuando haya una nueva versión disponible

## Requisitos para que Chrome muestre "Instalar aplicación"

✅ Manifest.json con todos los campos requeridos
✅ Service Worker registrado
✅ Iconos de 192x192 y 512x512
✅ HTTPS (o localhost para desarrollo)
✅ Display mode: standalone
✅ Start URL configurada
✅ Nombre y descripción
✅ Theme color

Todos estos requisitos están cumplidos en esta implementación.
