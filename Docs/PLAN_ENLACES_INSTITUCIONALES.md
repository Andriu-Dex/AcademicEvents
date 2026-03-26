# Plan de Implementación - Enlaces Institucionales Configurables

Este documento define el diseño y el plan de implementación para soportar una **colección de enlaces institucionales configurables** asociados a la universidad, con icono, URL y metadatos básicos, evitando columnas fijas por plataforma.

---

## Objetivo

Permitir que los administradores configuren dinámicamente los enlaces que se muestran en el footer de la aplicación, por ejemplo:

- Página web oficial
- Facebook
- Instagram
- YouTube
- Telegram
- LinkedIn
- TikTok
- Enlace personalizado

La solución debe ser:

- Escalable
- Normalizada
- Accesible
- Compatible con modo claro y oscuro
- Fácil de mantener

---

## Problema a Resolver

No se debe modelar cada red social como una columna fija en `University`, por ejemplo:

```prisma
facebookUrl String?
instagramUrl String?
youtubeUrl String?
```

Ese enfoque:

- acopla la base de datos a plataformas concretas
- obliga a modificar schema y código por cada nueva red
- genera columnas nulas innecesarias
- no representa bien el requerimiento real

El requerimiento correcto es:

> Una universidad tiene una colección de enlaces institucionales configurables, y cada enlace define al menos un icono y una URL.

---

## Diseño Final Propuesto

### Modelo Principal

La universidad mantiene sus datos institucionales base:

- nombre
- acrónimo
- logo
- dirección
- teléfono
- correo

Los enlaces institucionales se modelan en una entidad separada.

### Nuevo Modelo Prisma

```prisma
model University {
  id          String                 @id @default(uuid())
  tenantId    String
  name        String
  acronym     String?
  logoUrl     String?
  address     String
  phone       String?
  email       String?
  foundedAt   DateTime?
  isActive    Boolean                @default(true)
  createdAt   DateTime               @default(now())

  tenant      Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  faculties   Faculty[]
  authorities UniversityAuthority[]
  socialLinks UniversitySocialLink[]

  @@unique([tenantId, name])
  @@index([tenantId])
}

model UniversitySocialLink {
  id             String      @id @default(uuid())
  tenantId       String
  universityId   String
  label          String
  url            String
  iconKey        String
  platformKey    String?
  displayOrder   Int         @default(0)
  isActive       Boolean     @default(true)
  opensInNewTab  Boolean     @default(true)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  tenant         Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  university     University  @relation(fields: [universityId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([universityId, isActive])
  @@index([universityId, displayOrder])
}
```

---

## Justificación de Diseño

### Por qué este modelo es mejor

- Permite cualquier plataforma futura sin cambiar el schema.
- Mantiene una estructura más cercana a 3FN.
- Evita columnas nulas por red social.
- Permite orden configurable.
- Permite activar/desactivar enlaces sin borrarlos.
- Permite renderizar iconos y URLs desde una colección homogénea.

### Por qué `websiteUrl` también irá aquí

Aunque la página web oficial podría mantenerse en `University`, se moverá también a `UniversitySocialLink` para mantener consistencia funcional:

- todos los enlaces visibles del footer salen de la misma fuente
- el admin administra todo desde una sola sección
- el frontend renderiza una sola colección

---

## Campos Definidos en `UniversitySocialLink`

### Obligatorios

- `label`: nombre visible o administrativo del enlace
- `url`: dirección a abrir
- `iconKey`: clave del icono que se renderiza

### Opcionales o de control

- `platformKey`: identificador semántico, por ejemplo `facebook`, `youtube`, `telegram`, `website`, `custom`
- `displayOrder`: orden de renderizado
- `isActive`: permite ocultar sin eliminar
- `opensInNewTab`: define si abre en nueva pestaña
- `createdAt`, `updatedAt`: trazabilidad básica

### Valores esperados para `platformKey`

Catálogo inicial sugerido:

- `website`
- `facebook`
- `instagram`
- `youtube`
- `telegram`
- `linkedin`
- `tiktok`
- `x`
- `custom`

### Valores esperados para `iconKey`

Catálogo inicial sugerido:

- `globe`
- `facebook`
- `instagram`
- `youtube`
- `send`
- `linkedin`
- `music2`
- `twitter`
- `link`

Nota:

- `platformKey` y `iconKey` no tienen por qué ser idénticos
- `platformKey` describe el tipo de plataforma
- `iconKey` controla el ícono visual

---

## Reglas de Negocio

### Reglas mínimas

- `label` no puede ir vacía
- `url` debe ser válida
- `iconKey` no puede ir vacío
- `displayOrder` debe ser mayor o igual a `0`

### Reglas recomendadas

- solo se muestran en el footer los enlaces con `isActive = true`
- los enlaces se renderizan ordenados por `displayOrder ASC`
- si `opensInNewTab = true`, el frontend usará `target="_blank"` y `rel="noopener noreferrer"`

### Restricción opcional recomendada

Si `platformKey` es estándar y distinto de `custom`, no permitir más de un enlace activo por universidad para la misma plataforma.

Ejemplo:

- sí permitir varios `custom`
- no permitir dos `facebook` activos simultáneamente

---

## Plan de Implementación

## Fase 1 - Base de Datos y Prisma

### Objetivo

Agregar el modelo `UniversitySocialLink` y relacionarlo con `University`.

### Archivos a modificar

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/.../migration.sql`
- `backend/prisma/seed.js`

### Tareas

1. Eliminar cualquier idea de columnas fijas para redes sociales.
2. Agregar la relación `socialLinks` en `University`.
3. Crear el modelo `UniversitySocialLink`.
4. Crear migración SQL.
5. Actualizar seed con enlaces iniciales:
   - página web oficial
   - Facebook
   - Instagram
   - YouTube

### Resultado esperado

La base de datos podrá almacenar cualquier cantidad de enlaces institucionales por universidad.

---

## Fase 2 - Backend API

### Objetivo

Exponer endpoints para consultar, crear, editar, eliminar y ordenar enlaces institucionales.

### Archivos a modificar

- `backend/src/routes/universidad.routes.js`
- `backend/src/controllers/universidad.controller.js`
- `backend/src/services/universidad.service.js`

### Endpoints propuestos

- `GET /api/universidad-principal`
- `PUT /api/universidad/:id_uni`
- `POST /api/universidad/:id_uni/social-links`
- `PUT /api/universidad/:id_uni/social-links/:id`
- `DELETE /api/universidad/:id_uni/social-links/:id`
- `PATCH /api/universidad/:id_uni/social-links/reorder`

### Comportamiento esperado

#### `GET /api/universidad-principal`

Debe devolver:

- datos base de la universidad
- `socialLinks` activos ordenados

#### `PUT /api/universidad/:id_uni`

Debe actualizar solo datos base:

- nombre
- acrónimo
- logo
- dirección
- teléfono
- correo

#### `POST /api/universidad/:id_uni/social-links`

Debe crear un nuevo enlace institucional.

#### `PUT /api/universidad/:id_uni/social-links/:id`

Debe editar un enlace existente.

#### `DELETE /api/universidad/:id_uni/social-links/:id`

Debe eliminar un enlace.

#### `PATCH /api/universidad/:id_uni/social-links/reorder`

Debe actualizar el orden visual sin depender del orden de creación.

---

## Fase 3 - Frontend Administrativo

### Objetivo

Permitir que un administrador gestione la colección de enlaces desde “Datos Universidad”.

### Archivos a modificar

- `frontend/src/views/admin/AdminConfiguracionMVA.jsx`
- `frontend/src/views/admin/styles/AdminConfiguracionMVA.css`
- opcional:
  - `frontend/src/constants/socialLinkOptions.js`
  - `frontend/src/utils/universitySocialLinks.js`

### Diseño de UI propuesto

En la sección “Datos Universidad” se mantendrán los campos institucionales actuales y se añadirá una subsección:

**Enlaces institucionales**

Cada ítem mostrará:

- `label`
- `url`
- `platformKey`
- `iconKey`
- `isActive`
- `opensInNewTab`
- acciones de mover arriba / abajo
- acción de eliminar

También habrá un botón:

- `Agregar enlace`

### Flujo de administración

1. Cargar datos de universidad
2. Cargar colección de enlaces
3. Mostrar lista editable
4. Permitir crear, editar, eliminar, activar/desactivar
5. Guardar cambios por item o por lote según implementación elegida

### Recomendación de implementación

Para simplificar:

- datos base de universidad se guardan con su botón actual
- enlaces institucionales se gestionan en bloque dentro de su subsección

---

## Fase 4 - Frontend Público (Footer)

### Objetivo

Renderizar los enlaces institucionales del footer desde la colección de `socialLinks`.

### Archivos a modificar

- `frontend/src/components/Footer.jsx`
- `frontend/src/components/styles/Footer.css`

### Comportamiento esperado

- si no hay enlaces activos, no se muestra el bloque social
- si hay enlaces activos:
  - se ordenan por `displayOrder`
  - se renderiza el icono según `iconKey`
  - se usa el `label` para accesibilidad y `title`
  - se respeta `opensInNewTab`

### Accesibilidad

El bloque debe usar:

- `nav aria-label="Redes sociales y enlaces institucionales"`

Cada enlace debe tener:

- `aria-label`
- `title`
- `rel="noopener noreferrer"` cuando aplique

---

## Fase 5 - Catálogo de Iconos

### Objetivo

Definir un catálogo controlado de iconos disponibles para evitar valores arbitrarios en frontend.

### Archivo sugerido

- `frontend/src/constants/socialLinkOptions.js`

### Estructura sugerida

```js
export const SOCIAL_LINK_OPTIONS = [
  { platformKey: "website", label: "Página web oficial", iconKey: "globe" },
  { platformKey: "facebook", label: "Facebook", iconKey: "facebook" },
  { platformKey: "instagram", label: "Instagram", iconKey: "instagram" },
  { platformKey: "youtube", label: "YouTube", iconKey: "youtube" },
  { platformKey: "telegram", label: "Telegram", iconKey: "send" },
  { platformKey: "linkedin", label: "LinkedIn", iconKey: "linkedin" },
  { platformKey: "tiktok", label: "TikTok", iconKey: "music2" },
  { platformKey: "x", label: "X", iconKey: "twitter" },
  { platformKey: "custom", label: "Personalizado", iconKey: "link" },
];
```

### Beneficio

- el admin elige desde una lista conocida
- el footer no necesita interpretar valores arbitrarios
- el sistema sigue siendo flexible

---

## Validaciones Recomendadas

### Backend

- URL válida
- `label` obligatoria
- `iconKey` obligatoria
- `displayOrder` válido
- control de duplicados activos por `platformKey` si no es `custom`

### Frontend

- evitar guardar URLs vacías
- mostrar error inline si la URL es inválida
- no permitir ítems sin `label`
- no permitir ítems sin icono

---

## Consideraciones de Accesibilidad

- todos los botones de gestión deben ser navegables con teclado
- los íconos decorativos deben usar `aria-hidden="true"`
- los enlaces del footer deben tener nombre accesible claro
- los cambios dinámicos en admin deben mostrar mensajes visibles y comprensibles

---

## Consideraciones de Tema Claro y Oscuro

Los colores no deben ir en la base de datos por ahora.

La estrategia recomendada es:

- usar colores visuales definidos en CSS por `iconKey` o `platformKey`
- mantener la apariencia adaptada a `light` y `dark` desde el frontend

Esto evita:

- acoplar configuración visual a la base de datos
- sobreingeniería innecesaria

---

## Riesgos a Evitar

- guardar iconos como nombres arbitrarios sin catálogo
- mezclar datos base de universidad con enlaces en un mismo payload desordenado
- hardcodear plataformas en el footer
- guardar colores o estilos en base de datos sin necesidad
- usar columnas separadas por red social

---

## Orden Recomendado de Implementación

1. Prisma schema
2. Migración SQL
3. Seed
4. Endpoints backend
5. Catálogo de iconos en frontend
6. AdminConfiguracionMVA
7. Footer dinámico
8. Pruebas manuales y build final

---

## Checklist de Validación Final

- [ ] La migración crea `UniversitySocialLink`
- [ ] El seed crea enlaces institucionales iniciales
- [ ] `GET /universidad-principal` devuelve `socialLinks`
- [ ] El admin puede crear un enlace
- [ ] El admin puede editar un enlace
- [ ] El admin puede eliminar un enlace
- [ ] El admin puede activar/desactivar un enlace
- [ ] El admin puede reordenar enlaces
- [ ] El footer muestra solo enlaces activos
- [ ] El footer respeta el orden configurado
- [ ] Los iconos se renderizan correctamente
- [ ] El modo claro se ve bien
- [ ] El modo oscuro se ve bien
- [ ] El foco visible funciona en los enlaces del footer
- [ ] La aplicación compila sin errores

---

## Decisión Final Aprobada

Se implementará una colección de enlaces institucionales en una entidad separada:

- `UniversitySocialLink`

La página web oficial también vivirá en esta colección para mantener consistencia funcional y de renderizado.
