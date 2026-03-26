# Implementación de Enlaces Institucionales Dinámicos

## Resumen

Se implementó un sistema dinámico para administrar enlaces institucionales de la universidad desde la vista **Datos Universidad** dentro del módulo administrativo MVA.

La solución reemplaza el enfoque rígido basado en campos fijos por plataforma y adopta una estructura escalable, configurable y consistente con principios de normalización y mantenibilidad.

El resultado permite:

- configurar enlaces institucionales sin hardcodear plataformas
- asociar cada enlace con un icono, URL, orden y visibilidad
- reflejar los cambios automáticamente en el footer
- mantener enlaces desactivados sin eliminarlos del panel administrativo
- actualizar la interfaz en tiempo real mediante Socket.IO
- proteger la eliminación en la UI con confirmación explícita

---

## Objetivo Alcanzado

Antes de esta implementación, el sistema no contaba con una forma flexible de gestionar redes sociales o enlaces institucionales desde la administración.

Con esta mejora, ahora existe un flujo completo que permite:

1. crear enlaces institucionales configurables
2. editarlos desde el panel administrativo
3. activarlos o desactivarlos sin perderlos
4. reordenarlos manualmente
5. mostrarlos en el footer según configuración
6. propagar los cambios en tiempo real

---

## Decisión de Diseño

### Motivo del cambio

Se descartó el enfoque de columnas fijas como:

```prisma
facebookUrl String?
instagramUrl String?
youtubeUrl String?
```

porque no representaba correctamente el requerimiento real. Ese diseño obligaba a modificar el esquema cada vez que aparecía una nueva plataforma y no permitía una colección abierta de enlaces configurables.

### Solución adoptada

Se modeló una entidad independiente llamada `UniversitySocialLink`, relacionada con `University`.

Esta decisión permite:

- escalar a nuevas plataformas sin alterar el esquema
- mantener consistencia estructural
- ordenar, activar/desactivar y administrar cada enlace por separado
- representar mejor la intención del negocio

---

## Estructura de Datos

### Modelo principal

La universidad mantiene una relación uno-a-muchos con `UniversitySocialLink`.

### Campos implementados en `UniversitySocialLink`

- `id`
- `tenantId`
- `universityId`
- `label`
- `url`
- `iconKey`
- `platformKey`
- `displayOrder`
- `isActive`
- `opensInNewTab`
- `createdAt`
- `updatedAt`

### Beneficios del modelo

- soporte para plataformas conocidas y personalizadas
- independencia entre plataforma e icono
- orden configurable por interfaz
- visibilidad controlada sin borrado obligatorio
- mayor coherencia con una estructura normalizada

---

## Backend Implementado

### Archivos principales

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260325163000_add_university_social_links/migration.sql`
- `backend/prisma/seed.js`
- `backend/src/controllers/universidad.controller.js`
- `backend/src/routes/universidad.routes.js`
- `backend/src/services/socket.service.js`

### Cambios realizados

#### 1. Nuevo modelo relacional

Se agregó `UniversitySocialLink` al esquema Prisma y se relacionó con `University`.

#### 2. Migración de base de datos

Se creó la tabla correspondiente con sus claves foráneas e índices.

#### 3. Seed inicial

Se incorporaron enlaces iniciales institucionales de ejemplo:

- página web oficial
- Facebook oficial
- Instagram oficial
- YouTube oficial

#### 4. Endpoints administrativos

Se implementaron endpoints para:

- crear enlaces institucionales
- actualizar enlaces institucionales
- eliminar enlaces institucionales
- reordenar enlaces institucionales
- obtener la colección completa de enlaces de una universidad

#### 5. Validaciones

Se validó que:

- `label`, `url` e `iconKey` sean obligatorios
- la URL sea absoluta y válida
- no existan duplicados activos en plataformas estándar cuando corresponde

---

## Socket.IO y Actualización en Tiempo Real

### Objetivo

Evitar recargas manuales cuando cambian los enlaces institucionales o los datos base de la universidad.

### Implementación

Se agregó una notificación específica en `socket.service.js`:

- evento: `university-change-hm`

Este evento se emite cuando ocurre alguna de estas acciones:

- actualización de datos básicos de universidad
- creación de enlace institucional
- edición de enlace institucional
- eliminación de enlace institucional
- reordenamiento de enlaces institucionales

### Consideración multi-tenant

El evento incluye `tenantSlug` para que el frontend procese solo los cambios del tenant correspondiente.

---

## Frontend Implementado

### Archivos principales

- `frontend/src/views/admin/AdminConfiguracionMVA.jsx`
- `frontend/src/views/admin/styles/AdminConfiguracionMVA.css`
- `frontend/src/components/Footer.jsx`
- `frontend/src/components/styles/Footer.css`
- `frontend/src/constants/socialLinkOptions.js`
- `frontend/src/utils/universityData.js`
- `frontend/src/utils/tenantScope.js`

### Cambios realizados

#### 1. Administración desde MVA

Dentro de **Datos Universidad** se agregó una sección para administrar enlaces institucionales.

Cada enlace permite configurar:

- plataforma
- icono
- etiqueta
- URL
- visibilidad en footer
- apertura en nueva pestaña
- orden de visualización

#### 2. Footer dinámico

El footer ahora consume enlaces institucionales desde backend y renderiza únicamente los enlaces activos.

#### 3. Diferenciación entre vista pública y vista administrativa

Se corrigió un problema importante:

- el footer usa solo enlaces activos
- la vista administrativa obtiene todos los enlaces, incluso los desactivados

Esto permite desactivar un enlace sin que desaparezca del formulario administrativo.

#### 4. Confirmación antes de quitar enlaces de la lista

Se integró `ActionConfirmModal` para evitar la eliminación directa desde la interfaz.

Además, el botón con icono de basurero ahora incluye `title` para hacer más claro su propósito.

---

## Reordenamiento Híbrido

### Estrategia adoptada

Se implementó un enfoque híbrido:

- drag and drop ligero con HTML5
- botones de subir y bajar como alternativa estable y accesible

### Motivo

Se buscó mejorar la experiencia sin introducir una librería compleja ni sobreingeniería.

### Resultado

El administrador puede:

- arrastrar enlaces desde un handle visual
- seguir usando controles explícitos de orden
- guardar el nuevo orden reutilizando la lógica existente de `displayOrder`

---

## Criterios de UX y Seguridad Aplicados

### Buenas prácticas seguidas

- reutilización de infraestructura existente (`SocketContext`, `ActionConfirmModal`)
- separación de responsabilidades entre backend, vista admin y footer
- uso de utilidades compartidas para evitar duplicación
- preservación del comportamiento administrativo ante enlaces inactivos
- confirmación explícita antes de eliminar elementos de la lista visual
- mantenimiento de fallback accesible para reordenamiento

### Decisiones importantes

- no se eliminó la alternativa con flechas al agregar drag and drop
- no se usó una dependencia externa para una necesidad acotada
- no se sobreescriben cambios locales de forma agresiva si hay ediciones pendientes en la vista administrativa

---

## Validación Realizada

### Backend

Se verificó la sintaxis de:

- `universidad.controller.js`
- `universidad.routes.js`
- `socket.service.js`

### Frontend

Se ejecutó correctamente:

```bash
npm run build
```

La compilación finalizó sin errores. Solo permanecieron warnings preexistentes relacionados con chunking y módulos dinámicos.

### Validación funcional esperada

El flujo implementado permite comprobar que:

1. un enlace puede activarse o desactivarse sin desaparecer de la lista administrativa
2. el footer refleja únicamente los enlaces activos
3. los cambios se propagan automáticamente sin recarga manual
4. el orden visual puede cambiarse por drag and drop o por flechas
5. la eliminación desde la interfaz requiere confirmación

---

## Estado Final

**Implementación completada.**

La funcionalidad de enlaces institucionales quedó:

- dinámica
- escalable
- configurable
- consistente con multi-tenancy
- integrada con tiempo real
- alineada con una arquitectura mantenible

---

## Posibles Mejoras Futuras

Estas mejoras no son necesarias para dar por finalizada esta implementación, pero podrían evaluarse más adelante:

- drag and drop con animaciones más avanzadas
- vista previa en tiempo real más rica dentro del panel administrativo
- historial o auditoría de cambios sobre enlaces institucionales
- selección de iconos personalizados por imagen

---

**Fecha de cierre de implementación:** 2026-03-25
