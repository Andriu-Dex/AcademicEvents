# Implementación de Componentes Interactivos y Modales Accesibles


## Decisión de Diseño

### Enfoque adoptado

En lugar de corregir cada modal con lógica repetida, se creó un hook reutilizable llamado `useDialogAccessibility`.

Este hook centraliza:

- foco inicial al abrir
- trap de `Tab`
- cierre con `Escape`
- restauración de foco al cerrar

Esto permitió aplicar un patrón consistente a distintos componentes sin copiar lógica en cada archivo.

### Criterios aplicados

- reutilizar componentes existentes cuando era viable
- preferir HTML semántico y ARIA solo donde agrega valor real
- evitar librerías externas para focus trap
- mantener compatibilidad con flujos actuales del proyecto

---

## Hook Reutilizable

### Archivo principal

- `frontend/src/hooks/useDialogAccessibility.js`

### Responsabilidades del hook

- detectar apertura y cierre del diálogo
- localizar elementos enfocables dentro del contenedor
- enfocar el primer control útil al abrir
- impedir que el foco salga con `Tab` y `Shift + Tab`
- capturar `Escape` a nivel global de forma robusta
- devolver el foco al disparador original cuando el diálogo se cierra

### Motivo técnico

Se dejó la captura de `keydown` en `window` con fase de captura porque resultó ser la opción más estable para garantizar el cierre con `Escape` y el trap de foco incluso cuando existen overlays, iframes o componentes anidados.

---

## Componentes Actualizados

### Modales y diálogos

Se adaptaron o reforzaron los siguientes componentes:

- `frontend/src/components/ModalCartaMotivacion.jsx`
- `frontend/src/components/ModalRequisitos.jsx`
- `frontend/src/components/DocumentViewer.jsx`
- `frontend/src/components/CertificateViewer.jsx`
- `frontend/src/routes/EventsRoute.jsx`
- `frontend/src/views/Perfil.jsx`
- `frontend/src/views/MyInscriptions.jsx`
- `frontend/src/views/admin/AdminGestion.jsx`
- `frontend/src/views/admin/AdminEventInscription.jsx`

### Mejoras aplicadas

- `role="dialog"` o semántica equivalente
- `aria-modal="true"`
- `aria-labelledby`
- `aria-describedby` cuando corresponde
- cierre con `Escape`
- trap de foco
- restauración de foco
- cierre por overlay en flujos compatibles

---

## Reutilización de Visores

En la vista de perfil existía una previsualización improvisada para documentos que podía dejar una pantalla en blanco y no seguía el patrón de accesibilidad del resto del sistema.

Se reemplazó esa solución por la reutilización de:

- `frontend/src/components/DocumentViewer.jsx`

Esto permitió:

- soportar imágenes y PDF en un solo componente
- aplicar el mismo comportamiento accesible
- evitar mantener un modal paralelo con lógica duplicada

---

## Navegación por Teclado

### Navbar

Se mejoró la navegación del `Navbar` para menús desplegables con:

- `ArrowUp`
- `ArrowDown`
- `Home`
- `End`
- `Escape`

Esto se aplicó a menús de perfil y de administración para hacerlos más previsibles con teclado.

### NotificationBell

Se mejoró `frontend/src/components/notifications/NotificationBell.jsx` con:

- mejor nombre accesible del botón
- cierre del panel con `Escape`
- anuncio accesible del estado de notificaciones

### Paginación

Se actualizó:

- `frontend/src/components/Pagination/PaginationControls.jsx`

Ahora soporta:

- `ArrowLeft`
- `ArrowRight`
- `Home`
- `End`

Además, el foco se mantiene sobre el botón de página correspondiente tras la navegación con teclado.

---

## Botones de Solo Ícono

Se revisaron botones que dependían únicamente del ícono visual y se les agregaron nombres accesibles explícitos.

Componentes principales ajustados:

- `frontend/src/views/admin/AdminGestion.jsx`
- `frontend/src/components/common/HomeButton.jsx`
- `frontend/src/components/ImageUploadMVA.jsx`
- `frontend/src/components/FloatingThemeSocketControls.jsx`

### Mejoras aplicadas

- `aria-label`
- `title` cuando aportaba contexto adicional
- `aria-pressed` en toggles cuando correspondía

---

## Ajustes de Estabilidad

Durante la implementación se detectó una regresión en:

- `frontend/src/components/InscripcionCard.jsx`

El componente estaba usando `isExpanded` en lugar del estado real `expanded`, provocando una pantalla en blanco en la vista **Validar Inscripciones**.

Se corrigió esa referencia para restaurar el funcionamiento normal de la pantalla.

---

## Validación Realizada

Se verificó:

- compilación del frontend con `npm run build`
- apertura y cierre de modales con `Escape`
- navegación de foco con `Tab` dentro de los diálogos
- restauración del foco al cerrar
- visualización de documentos desde perfil
- comportamiento de menús de navegación y paginación con teclado

---

## Resultado Final

La aplicación quedó con una base mucho más consistente para componentes interactivos complejos.

La Fase 5 se considera completada porque:

- los modales más importantes ya siguen un patrón uniforme
- los componentes de interacción frecuente tienen soporte sólido de teclado
- los botones de solo ícono ya exponen propósito accesible
- se redujo lógica duplicada mediante reutilización y un hook común