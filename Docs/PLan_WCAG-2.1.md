## Principios de Ingeniería a Aplicar

### Buenas Prácticas de Programación
- **Code Reuse (DRY - Don't Repeat Yourself)**: Crear FormField como componente reutilizable en lugar de repetir validación/labels en 27 vistas
- **Single Responsibility Principle (SOLID)**: Cada componente tendrá una única responsabilidad - formulario, modal, navegación, etc.
- **Open/Closed Principle**: Los componentes serán extensibles sin necesidad de modificar código existente (ejemplo: FormField acepta propiedades custom)
- **Naming Conventions**:
  - Código JavaScript/archivo en inglés: `formFieldComponent.jsx`, `useAccessibilityFocus()`, `validateFormInput()`
  - Texto visible al usuario en español: "Correo Electrónico", "Guardar cambios", "Error de validación"
  - Variables ARIA y attributes en inglés: `aria-label`, `aria-describedby`, `id="email-error-message"`

### Patrones de Software
- **Compound Components Pattern**: Para modales con header, body, footer accesibles
- **Custom Hooks**: `useFormValidation()`, `useAccessibilityFocus()`, `useKeyboardNavigation()` para reutilización de lógica
- **Factory Pattern**: Para crear diferentes tipos de campos de formulario (text, email, password, select, checkbox) con ARIA consistente
- **Decorator Pattern**: Envolver componentes existentes con mejoras de accesibilidad sin modificar el original

### Evitar Sobreingeniería
- NO crear componentes que solo se usan una vez
- NO agregar configuraciones innecesarias si una solución simple resuelve el problema
- Reutilizar `ActionConfirmModal` como patrón base en lugar de crear nuevos componentes modales desde cero
- Usar elementos HTML semánticos `<label>`, `<select>`, `<button>` antes de crear versiones custom

### Escalabilidad y Eficiencia
- Variables CSS centralizadas en `theme-variables.css` para mantener consistencia de contraste en ambos temas
- Configuración de ESLint centralizada para preventiva testing de accesibilidad en todos los archivos
- Tests automatizados con axe-core para evitar regresiones
- Documentación centralizada en `ACCESSIBILITY.md` para onboarding de nuevos desarrolladores

### Base de Datos
- No aplica a este plan (es frontend), pero si necesita cambios de backend posteriores:
  - Normalizar a 3FN (Tercera Forma Normal)
  - Nomenclatura de base de datos en inglés: `user_accessibility_preferences`, `form_field_accessibility_rules`
  - Índices en campos de búsqueda frecuente para eficiencia

---

## Enfoque Recomendado

### Fase 1: Configuración de Herramientas de Accesibilidad
**Duración estimada:** 1-2 días

**Objetivo:** Establecer herramientas automatizadas para detectar y prevenir problemas de accesibilidad.

**Acciones:**
1. **Instalar dependencias**:
   ```bash
   npm install --save-dev eslint-plugin-jsx-a11y @axe-core/react
   ```

2. **Configurar ESLint para accesibilidad** (`frontend/eslint.config.js`):
   - Agregar `eslint-plugin-jsx-a11y` con reglas recommended
   - Configurar reglas específicas para formularios, imágenes, ARIA

3. **Integrar axe-core en desarrollo**:
   - Agregar `@axe-core/react` en modo desarrollo para auditorías en tiempo real
   - Configurar en `frontend/src/main.jsx` solo para modo dev

4. **Correr lint y documentar errores**:
   ```bash
   npm run lint > accessibility-errors.txt
   ```

**Archivos afectados:**
- `frontend/eslint.config.js`
- `frontend/package.json`
- `frontend/src/main.jsx` (integración axe-core)

---

### Fase 2: Formularios y Validaciones Accesibles
**Duración estimada:** 3-5 días

**Objetivo:** Hacer todos los formularios navegables y comprensibles para screen readers.

**Problemas a resolver:**
- Inputs sin `<label>` asociados (Login.jsx líneas 202-211, Register.jsx, etc.)
- Mensajes de error no anunciados a screen readers
- Validaciones visuales sin feedback accesible

**Acciones:**

1. **Crear componente FormField reutilizable**:
   ```jsx
   // frontend/src/components/common/FormField.jsx
   <FormField
     id="email"
     label="Correo Electrónico"
     type="email"
     value={email}
     onChange={handleChange}
     error={errors.email}
     required
   />
   ```
   - Incluye `<label htmlFor>` siempre
   - `aria-invalid` cuando hay error
   - `aria-describedby` para mensajes de error
   - `role="alert"` en mensajes de error

2. **Actualizar vistas con formularios** (27 archivos):
   - `frontend/src/views/Login.jsx` (líneas 202-229)
   - `frontend/src/views/Register.jsx`
   - `frontend/src/views/admin/CreateEvent.jsx`
   - `frontend/src/views/admin/EditEvento.jsx`
   - `frontend/src/views/UserProfile.jsx`
   - Todos los formularios de admin panel

3. **Agregar live regions para mensajes dinámicos**:
   ```jsx
   <div role="status" aria-live="polite" aria-atomic="true">
     {successMessage}
   </div>
   ```

4. **Mejorar ToastContainer de react-toastify**:
   - Asegurar `role="alert"` para errores
   - `role="status"` para éxitos

**Archivos críticos:**
- `frontend/src/components/common/FormField.jsx` (NUEVO)
- `frontend/src/views/Login.jsx`
- `frontend/src/views/Register.jsx`
- `frontend/src/views/admin/CreateEvent.jsx`
- `frontend/src/views/admin/EditEvento.jsx`
- `frontend/src/views/UserProfile.jsx`
- Y 21 archivos más con formularios

---

### Fase 3: Navegación por Teclado y Focus Management
**Duración estimada:** 2-3 días

**Objetivo:** Permitir navegación completa con solo el teclado.

**Acciones:**

1. **Implementar Skip Links** (`frontend/src/App.jsx`):
   ```jsx
   <a href="#main-content" className="skip-link">
     Saltar al contenido principal
   </a>
   ```
   - CSS para mostrar solo en `:focus`
   - Posicionamiento accesible

2. **Agregar estilos `:focus-visible`** (`frontend/src/index.css`):
   ```css
   *:focus-visible {
     outline: 3px solid var(--color-primary);
     outline-offset: 2px;
   }

   .btn:focus-visible {
     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
   }
   ```

3. **Auditar orden de tabulación**:
   - Verificar que `tabIndex={0}` solo en elementos interactivos
   - NO usar `tabIndex` positivos
   - Verificar que elementos custom (divs con onClick) tengan `tabIndex={0}` y `role="button"`

4. **Agregar soporte de teclado en componentes custom**:
   - Enter/Space para activar botones custom
   - Arrow keys para navegación en listas
   - Escape para cerrar modales (ya implementado en ActionConfirmModal)

**Archivos afectados:**
- `frontend/src/App.jsx` (skip links)
- `frontend/src/index.css` (estilos focus)
- `frontend/src/components/Navbar.jsx` (navegación)
- `frontend/src/components/EventCard.jsx` (cards interactivos)
- `frontend/src/components/notifications/NotificationBell.jsx`

---

### Fase 4: Estructura Semántica y Landmarks
**Duración estimada:** 2 días

**Objetivo:** Mejorar la estructura HTML para screen readers.

**Acciones:**

1. **Agregar landmarks semánticos** en cada vista:
   ```jsx
   <main id="main-content" role="main">
     <header role="banner">
       <h1>Título de la página</h1>
     </header>

     <nav role="navigation" aria-label="Menú principal">
       {/* navegación */}
     </nav>

     <section aria-labelledby="section-title">
       <h2 id="section-title">Sección</h2>
     </section>

     <aside role="complementary">
       {/* contenido complementario */}
     </aside>

     <footer role="contentinfo">
       {/* footer */}
     </footer>
   </main>
   ```

2. **Auditar jerarquía de headings** (h1-h6):
   - Solo un `<h1>` por página
   - No saltar niveles (h2 → h4)
   - Orden lógico y descriptivo

3. **Implementar títulos dinámicos por página**:
   ```jsx
   useEffect(() => {
     document.title = `${pageTitle} - AcademicEvents`;
   }, [pageTitle]);
   ```

4. **Revisar uso de `<div>` vs elementos semánticos**:
   - Reemplazar `<div>` por `<article>`, `<section>`, `<nav>` donde aplique

**Archivos afectados:**
- Todas las vistas en `frontend/src/views/` (27 archivos)
- `frontend/src/components/Layout.jsx` (si existe)
- `frontend/src/App.jsx` (estructura principal)

---

### Fase 5: Componentes Interactivos y Modales
**Duración estimada:** 3-4 días

**Objetivo:** Asegurar que todos los componentes interactivos sean completamente accesibles.

**Acciones:**

1. **Auditar y mejorar modales** siguiendo el patrón de ActionConfirmModal:

   **Modales a revisar/actualizar:**
   - [DONE] `frontend/src/components/common/ActionConfirmModal.jsx` (ya bien implementado - usar como referencia)
   - [TODO] `frontend/src/components/ModalCartaMotivacion.jsx`
   - [TODO] `frontend/src/components/ModalRequisitos.jsx`
   - [TODO] Modales en `frontend/src/views/admin/*`

   **Checklist por modal:**
   - `role="dialog"` o `role="alertdialog"`
   - `aria-modal="true"`
   - `aria-labelledby` apuntando al título
   - `aria-describedby` apuntando a la descripción
   - Trap de foco (Tab cicla dentro del modal)
   - Escape para cerrar
   - Restaurar foco al cerrar
   - Overlay con `aria-hidden="true"` en contenido de fondo

2. **Mejorar NotificationBell** (`frontend/src/components/notifications/NotificationBell.jsx`):
   - Agregar `role="status"` o `role="alert"` para notificaciones nuevas
   - `aria-live="polite"` para anuncios automáticos
   - `aria-atomic="true"` para leer mensaje completo
   - Mejorar badge de contador con `aria-label="3 notificaciones nuevas"` (dinámico según cantidad real)

3. **Implementar tooltips accesibles**:
   - Usar `aria-describedby` para asociar tooltip con elemento
   - Mostrar tooltip en `:focus` además de `:hover`
   - Ejemplo:
   ```jsx
   <button
     aria-describedby="tooltip-delete"
     onMouseEnter={() => setShowTooltip(true)}
     onFocus={() => setShowTooltip(true)}
   >
     Eliminar
   </button>
   {showTooltip && (
     <div id="tooltip-delete" role="tooltip">
       Esta acción no se puede deshacer
     </div>
   )}
   ```

4. **Mejorar Navbar menú desplegable** (`frontend/src/components/Navbar.jsx`):
   - Ya tiene `aria-expanded` y `aria-haspopup` (líneas 358-359) [VERIFIED]
   - Verificar que funcione con teclado (Enter para abrir, Escape para cerrar)
   - Agregar navegación con flechas dentro del menú

5. **Crear componente Select accesible** si se usa `<select>` custom:
   - ARIA Authoring Practices Pattern para Combobox
   - O usar `<select>` nativo estilizado (preferido por accesibilidad)

6. **Mejorar PaginationControls** (`frontend/src/components/Pagination/PaginationControls.jsx`):
   - Ya tiene `aria-label` y `aria-current="page"` [VERIFIED]
   - Verificar navegación con flechas del teclado

**Archivos afectados:**
- `frontend/src/components/ModalCartaMotivacion.jsx`
- `frontend/src/components/ModalRequisitos.jsx`
- `frontend/src/components/notifications/NotificationBell.jsx`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/Pagination/PaginationControls.jsx`
- Modales en `frontend/src/views/admin/`

---

### Fase 6: Testing, Validación y Documentación
**Duración estimada:** 2-3 días

**Objetivo:** Validar accesibilidad con herramientas automatizadas y tests manuales.

**Acciones:**

1. **Ejecutar auditorías automatizadas**:
   ```bash
   # Lighthouse CI
   npm install -g @lhci/cli
   lhci autorun --collect.settings.onlyCategories=accessibility

   # Axe DevTools en navegador
   # (instalar extensión y ejecutar en cada página)
   ```

2. **Testing manual con screen readers**:
   - **NVDA** (Windows, gratuito)
   - **JAWS** (Windows, trial)
   - **VoiceOver** (macOS/iOS, incluido)

   **Páginas críticas a probar:**
   - Login/Register
   - Home (listado de eventos)
   - Detalle de evento
   - Inscripción a evento
   - Panel de administración
   - Perfil de usuario

3. **Verificar contraste de colores**:
   - Usar herramientas: Contrast Checker, WebAIM Color Contrast Checker
   - **Ratios mínimos WCAG AA:**
     - Texto normal: 4.5:1
     - Texto grande (18px+): 3:1
     - Componentes UI: 3:1

   **Verificar en modo oscuro y modo claro** (variables en `frontend/src/styles/theme-variables.css`)

4. **Testing con solo teclado**:
   - Navegar toda la aplicación usando solo Tab, Shift+Tab, Enter, Space, Escape
   - Verificar que todos los elementos interactivos sean alcanzables
   - Verificar orden lógico de tabulación

5. **Crear documentación**:
   - `frontend/ACCESSIBILITY.md`:
     - Guía de accesibilidad para desarrolladores
     - Checklist por tipo de componente
     - Keyboard shortcuts documentados
     - Guía de testing con screen readers

6. **Agregar tests automatizados con Jest + axe**:
   ```bash
   npm install --save-dev jest @testing-library/react jest-axe
   ```

   Ejemplo de test:
   ```jsx
   import { axe, toHaveNoViolations } from 'jest-axe';

   test('Login form should have no accessibility violations', async () => {
     const { container } = render(<Login />);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

**Archivos afectados:**
- `frontend/ACCESSIBILITY.md` (NUEVO)
- `frontend/jest.config.js` (NUEVO)
- Tests en `frontend/src/__tests__/` (NUEVO directorio)
- `frontend/package.json` (scripts de testing)

---

## Verificación End-to-End

**Después de implementar todas las fases, verificar:**

[LEVEL A - BÁSICO]:
- Todas las imágenes tienen alt text
- Formularios tienen labels
- Contenido navegable con teclado
- Sin trampa de teclado

[LEVEL AA - INTERMEDIO - OBJETIVO]:
- Contraste mínimo 4.5:1 (texto) y 3:1 (UI)
- Resize hasta 200% sin pérdida de funcionalidad
- Navegación consistente en todas las páginas
- Identificación de errores en formularios
- Labels e instrucciones claras
- Focus visible en todos los elementos interactivos
- Múltiples formas de navegación (menú, búsqueda, skip links)

**Herramientas de validación final:**
1. **Lighthouse Accessibility Score**: Objetivo 95+ (actualmente ~60-70)
2. **axe DevTools**: 0 violaciones críticas/serias
3. **WAVE**: Sin errores de accesibilidad
4. **Manual testing**: Navegación completa con NVDA/VoiceOver

**Métricas de éxito:**
- 100% de formularios con labels asociados
- 100% de modales con ARIA completo
- 100% de componentes interactivos navegables con teclado
- Skip links implementados en todas las páginas
- Contraste AAA en elementos críticos (botones, alertas)
- Todos los componentes pasan auditorías de axe-core

---

## Archivos Críticos a Modificar

### Configuración:
- `frontend/eslint.config.js` - Agregar plugin jsx-a11y
- `frontend/package.json` - Dependencias de accesibilidad
- `frontend/src/main.jsx` - Integración axe-core

### Componentes Comunes (ALTA PRIORIDAD):
- `frontend/src/components/common/FormField.jsx` - **NUEVO** componente de formulario accesible
- `frontend/src/components/common/ActionConfirmModal.jsx` - Ya bueno, usar como referencia
- `frontend/src/components/Navbar.jsx` - Mejorar navegación por teclado
- `frontend/src/components/FloatingThemeSocketControls.jsx` - Mejorar aria-labels

### Componentes Específicos:
- `frontend/src/components/ModalCartaMotivacion.jsx` - Agregar ARIA completo
- `frontend/src/components/ModalRequisitos.jsx` - Agregar ARIA completo
- `frontend/src/components/notifications/NotificationBell.jsx` - Live regions
- `frontend/src/components/Pagination/PaginationControls.jsx` - Ya parcial, verificar

### Vistas Críticas (27 vistas):
- `frontend/src/views/Login.jsx` - Formulario accesible, skip links
- `frontend/src/views/Register.jsx` - Formulario accesible
- `frontend/src/views/Home.jsx` - Landmarks, headings
- `frontend/src/views/UserProfile.jsx` - Formulario accesible
- `frontend/src/views/admin/CreateEvent.jsx` - Formulario accesible
- `frontend/src/views/admin/EditEvento.jsx` - Formulario accesible
- Todas las vistas en `frontend/src/views/admin/*`

### Estilos:
- `frontend/src/index.css` - Focus visible global
- `frontend/src/styles/theme-variables.css` - Verificar contraste (ya tiene variables de dark mode)

### Documentación (NUEVA):
- `frontend/ACCESSIBILITY.md` - Guía completa
- `frontend/jest.config.js` - Configuración de tests
- `frontend/src/__tests__/` - Tests de accesibilidad

---