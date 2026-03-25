# Implementación de Accesibilidad WCAG 2.1

## Resumen General

Este documento registra el progreso de la implementación de conformidad con **WCAG 2.1 Nivel AA** en la aplicación **AcademicEvents**. El proyecto se divide en **5 fases principales**, cada una enfocada en áreas específicas de accesibilidad.

**Estado General:** 3/5 Fases Completadas ✅

---

## 📊 Roadmap de Fases

| Fase | Nombre | Estado | Porcentaje |
|------|--------|--------|-----------|
| 1 | Herramientas y Componentes Base | ✅ Completada | 100% |
| 2 | Formularios Accesibles | ✅ Completada | 100% |
| 3 | Navegación y Focus Management | ✅ Completada | 100% |
| 4 | Estructura Semántica y Landmarks | ⏳ Pendiente | 0% |
| 5 | Componentes Interactivos Avanzados | ⏳ Pendiente | 0% |

---

## ✅ Fase 1: Herramientas y Componentes Base

**Estado:** Completada ✅
**Fecha:** Sesión Inicial
**Commit:** `feat(frontend): configurar herramientas de accesibilidad WCAG 2.1 (Fase 1)`

### Objetivos Alcanzados

- ✅ Instalar y configurar `eslint-plugin-jsx-a11y` para validación automática
- ✅ Integrar `@axe-core/react` para auditorías en tiempo real
- ✅ Crear componente `FormField` reutilizable con soporte WCAG
- ✅ Crear componente `SkipLink` para navegación por teclado
- ✅ Configurar estilos accesibles con tema oscuro

### Dependencias Agregadas

```json
{
  "eslint-plugin-jsx-a11y": "^6.8.0",
  "@axe-core/react": "^1.2.3"
}
```

### Componentes Nuevos

#### 1. **FormField.jsx** (`src/components/common/FormField.jsx`)
Componente reutilizable para campos de formulario con soporte WCAG 2.1:
- ✅ Label asociado con `htmlFor`
- ✅ `aria-invalid` para estados de error
- ✅ `aria-describedby` para mensajes de error
- ✅ Soporte para helper text
- ✅ Soporte completo dark mode
- ✅ Estilos focus-visible accesibles

```jsx
<FormField
  id="email"
  label="Correo Electrónico"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
  helperText="Correo válido requerido"
/>
```

#### 2. **SkipLink.jsx** (`src/components/common/SkipLink.jsx`)
Permite saltar al contenido principal al presionar Tab:
- ✅ Oculto hasta recibir foco (solo visible on Tab)
- ✅ Salta al elemento with `id="main-content"`
- ✅ Soporte dark mode
- ✅ Animación suave

### Validación y Resultados

**ESLint Violations Detectadas:** ~50+ errores de accesibilidad
- Labels sin asociar en formularios
- Elementos interactivos sin keyboard support
- Elementos onclick sin soporte de teclado
- Imágenes sin alt text
- Y más

**Herramientas Activas:**
- ✅ `npm run lint` detecta violaciones automáticamente
- ✅ @axe-core reporta en DevTools console
- ✅ Focus-visible estilos funcionando

---

## ✅ Fase 2: Formularios Accesibles

**Estado:** Completada ✅
**Fecha:** Segunda Sesión
**Commit:** `feat(frontend): implementar formularios accesibles WCAG 2.1 (Fase 2)`

### Objetivos Alcanzados

- ✅ Mejorar accesibilidad en componente Login.jsx
- ✅ Mejorar accesibilidad en componente Register.jsx
- ✅ Integrar SkipLink en App.jsx como landmark global
- ✅ Mejorar ToastContainer para notificaciones accesibles
- ✅ Agregar estilos para estados de error

### Cambios en Login.jsx

**Estados de Validación:**
```jsx
const [errors, setErrors] = useState({ email: "", password: "" });
const emailInputRef = useRef(null);
const passwordInputRef = useRef(null);
```

**Mejoras ARIA:**
- ✅ `aria-invalid` en inputs con error
- ✅ `aria-describedby` vinculando inputs con mensajes de error
- ✅ `aria-label` en botones mostrar/ocultar contraseña
- ✅ `aria-pressed` indicando estado del botón
- ✅ `role="listbox"` y `role="option"` para autocompletado
- ✅ `aria-hidden="true"` en iconos decorativos

**Validación y Manejo de Errores:**
```jsx
// Al hacer submit sin campos
- El foco se mueve automáticamente al campo vacío
- Aparece mensaje de error debajo del campo
- El campo tiene borde rojo
- El screen reader anuncia el error
```

**Autocompletado Accesible:**
```jsx
// El contenedor tiene role="listbox"
// Cada sugerencia tiene role="option"
// El botón X tiene aria-label específico
```

### Cambios en Register.jsx

**Labels Asociados:**
```jsx
// Cada campo tiene:
<label htmlFor={`register-${name}`}>...</label>
<input id={`register-${name}`} />
```

**Indicador de Fortaleza:**
- ✅ `aria-live="polite"` se anuncia automáticamente
- ✅ `role="progressbar"` con `aria-valuenow`/`aria-valuemin`/`aria-valuemax`
- ✅ Errores con `role="alert"`
- ✅ Soporte autoComplete para mejor UX

**AutoComplete Attributes:**
```jsx
const autoCompleteMap = {
  ced_usu: "off",
  nom_usu: "given-name",
  ape_usu: "family-name",
  cor_usu: "email",
  con_usu: "new-password",
  cel_usu: "tel",
};
```

### Cambios en App.jsx

**Integración de SkipLink:**
```jsx
<SkipLink targetId="main-content" label="Saltar al contenido principal" />
```

**Landmark Semántico:**
```jsx
<main id="main-content" tabIndex={-1}>
  <Routes>...</Routes>
</main>
```

**ToastContainer Accesible:**
```jsx
<ToastContainer
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
/>
```

### Estilos Nuevos (Login.css)

```css
.input-error-l {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25) !important;
}

.form-error-l {
  color: #dc3545;
  padding: 0.25rem 0.5rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-left: 3px solid #dc3545;
}

/* Dark mode */
[data-theme="dark"] .input-error-l {
  border-color: #f87171 !important;
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.25) !important;
}
```

### Resultados de Pruebas

✅ Todos los tests de Fase 2 aprobados:
- FormField renderiza con labels asociados
- Focus se mueve a campos con error
- Mensajes de error visibles y accesibles
- Autocompletado con roles ARIA correctos
- ToastContainer anunciable por screen readers
- Dark mode funciona en estados de error

---

## ✅ Fase 3: Navegación y Focus Management

**Estado:** Completada ✅
**Fecha:** Tercera Sesión
**Commit:** `feat(frontend): implementar navegación por teclado y focus management (Fase 3)`

### Objetivos Alcanzados

- ✅ Agregar estilos globales `:focus-visible` en index.css
- ✅ Mejorar Navbar con soporte de teclado (Escape, Enter)
- ✅ Corregir elementos interactivos sin keyboard support
- ✅ Agregar títulos dinámicos de página (WCAG 2.4.2)
- ✅ Mejorar componentes modales

### Estilos Focus-Visible Globales (index.css)

**Estilos Base:**
```css
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 3px solid var(--color-primary, #2563eb);
  outline-offset: 2px;
  border-radius: 2px;
}

button:focus-visible,
[role="button"]:focus-visible,
.btn:focus-visible {
  outline: 3px solid var(--color-primary, #2563eb);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.25);
}
```

**Dark Mode:**
```css
[data-theme="dark"] *:focus-visible {
  outline-color: #60a5fa;
}

[data-theme="dark"] button:focus-visible {
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.3);
}
```

**Preferencias de Usuario:**
```css
@media (prefers-contrast: more) {
  *:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *:focus-visible {
    transition: none;
  }
}
```

**Screen Reader Only Classes:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only-focusable:focus,
.sr-only-focusable:focus-visible {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Mejoras en Navbar.jsx

**Handler de Teclado:**
```jsx
const handleProfileMenuKeyDown = (event) => {
  if (event.key === "Escape") {
    setShowProfileMenu(false);
    // Devolver foco al botón de perfil
    const profileButton = profileMenuRef.current?.querySelector(".profile-button");
    profileButton?.focus();
  }
};
```

**Atributos ARIA:**
```jsx
<div
  className="navbar-profile"
  ref={profileMenuRef}
  onKeyDown={handleProfileMenuKeyDown}
>
  <button
    type="button"
    className="profile-button"
    onClick={toggleProfileMenu}
    aria-expanded={showProfileMenu}
    aria-haspopup="menu"
    aria-label={`Menú de perfil de ${usuario?.nom_usu}`}
  />

  {showProfileMenu && (
    <div className="profile-dropdown" role="menu" aria-label="Opciones de perfil">
      <Link to="/profile" className="profile-menu-item" role="menuitem">
        Mi Perfil
      </Link>
      <button
        type="button"
        className="profile-menu-item logout"
        onClick={cerrarSesion}
        role="menuitem"
      >
        Cerrar sesión
      </button>
    </div>
  )}
</div>
```

### Mejoras en InscripcionCard.jsx

**Soporte de Teclado:**
```jsx
<div
  className="inscripcion-card-header"
  onClick={handleToggleExpand}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleExpand();
    }
  }}
  role="button"
  tabIndex={0}
  aria-expanded={isExpanded}
  aria-label={`${isExpanded ? "Contraer" : "Expandir"} detalles...`}
/>
```

### Mejoras en DocumentViewer.jsx

**Event Listeners:**
```jsx
componentDidMount() {
  document.addEventListener("keydown", this.handleKeyDown);
  this.modalRef.current?.focus();
}

handleKeyDown = (event) => {
  if (event.key === "Escape") {
    this.props.onClose();
  }
};
```

**Atributos ARIA:**
```jsx
<div
  className="modal-overlay-dv"
  onClick={this.handleOverlayClick}
  role="presentation"
>
  <div
    className="modal-content-dv"
    role="dialog"
    aria-modal="true"
    aria-labelledby="document-viewer-title"
    ref={this.modalRef}
    tabIndex={-1}
  >
    <h2 id="document-viewer-title" className="modal-title-dv">
      {title}
    </h2>
    <button
      className="close-button-dv"
      onClick={onClose}
      aria-label="Cerrar visor de documento"
    >
      <X size={24} aria-hidden="true" />
    </button>
  </div>
</div>
```

### Hook useDocumentTitle.js (NUEVO)

**Ubicación:** `src/hooks/useDocumentTitle.js`

```javascript
import { useEffect } from "react";

/**
 * Hook para establecer el título del documento de forma dinámica
 * Mejora la accesibilidad al proporcionar títulos únicos por página
 * WCAG 2.1 - 2.4.2 Page Titled (Level A)
 */
const useDocumentTitle = (title, suffix = "AcademicEvents") => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - ${suffix}` : suffix;

    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};

export default useDocumentTitle;
```

**Aplicación:**
```jsx
// En Login.jsx
useDocumentTitle("Iniciar Sesión");
// Resultado: "Iniciar Sesión - AcademicEvents"

// En Register.jsx
useDocumentTitle("Registro de Usuario");
// Resultado: "Registro de Usuario - AcademicEvents"
```

### Resultados de Pruebas

✅ Todos los tests de Fase 3 aprobados:
- Todos los elementos interactivos muestran focus-visible
- Outline es azul en light mode, azul claro en dark mode
- Menú de perfil se abre/cierra con Escape
- InscripcionCard se expande/contrae con Enter/Space
- DocumentViewer se cierra con Escape
- Títulos dinámicos cambian por página
- Screen reader only classes funcionan
- Soporte para preferencias de usuario (reduced motion, high contrast)

---

## ⏳ Fase 4: Estructura Semántica y Landmarks

**Estado:** Pendiente ⏳
**Prioridad:** Alta

### Objetivos Planeados

- [ ] Mejorar estructura HTML semántica en vistas principales
- [ ] Agregar landmarks HTML5 (`<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`)
- [ ] Revisar jerarquía de headings (h1, h2, h3) en todas las vistas
- [ ] Agregar `aria-label` a estructuras de navegación
- [ ] Mejorar asociación de labels en formularios dinámicos
- [ ] Auditar y corregir tablas de datos con ARIA (si existen)

### Vistas Prioritarias

1. **Home.jsx** - Estructura de inicio
2. **Navbar.jsx** - Mejora de navegación
3. **PrivateLayout.jsx** - Estructura general de vistas privadas
4. **Footer.jsx** - Estructura de pie de página

### Cambios Esperados

```jsx
// ANTES
<div className="navbar">
  <div>Logo</div>
  <div>Menú</div>
</div>

// DESPUÉS
<header className="navbar" role="banner">
  <div className="navbar-brand">
    <h1><Link to="/home">AcademicEvents</Link></h1>
  </div>
  <nav aria-label="Navegación principal" role="navigation">
    {/* Menú */}
  </nav>
</header>
```

---

## ⏳ Fase 5: Componentes Interactivos Avanzados

**Estado:** Pendiente ⏳
**Prioridad:** Media

### Objetivos Planeados

- [ ] Mejorar accesibilidad en modales complejos
- [ ] Implementar focus trap en modales (mantener foco dentro del modal)
- [ ] Agregar soporte para navegación con arrow keys en menus
- [ ] Mejorar tabla de inscripciones/eventos con ARIA
- [ ] Revisar y mejorar componentes de paginación
- [ ] Agregar live regions para actualizaciones dinámicas
- [ ] Mejorar accesibilidad en selectores de fechas/dropdowns complejos

### Componentes a Revisar

1. **ModalCartaMotivacion.jsx** - Modal de carta de motivación
2. **ModalRequisitos.jsx** - Modal de requisitos
3. **EventForm.jsx** - Formulario de eventos complejo
4. **Admin Tables** - Tablas de administración

### Cambios Esperados

```jsx
// Focus Trap en Modal
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      // Mantener foco dentro del modal
      const focusableElements = /* ... */;
      const lastElement = focusableElements[focusableElements.length - 1];
      const firstElement = focusableElements[0];

      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

---

## 📋 Normas WCAG 2.1 Cubiertas

### ✅ Cubiertas (Fases 1-3)

| Criterio | Descripción | Nivel | Estado |
|----------|-------------|-------|--------|
| 2.1.1 | Teclado | A | ✅ |
| 2.1.2 | Sin trampa de teclado | A | ✅ |
| 2.4.2 | Título de página | A | ✅ |
| 2.4.3 | Orden de foco | A | ✅ |
| 2.4.7 | Indicador de foco visible | AA | ✅ |
| 3.2.1 | Al recibir el foco | A | ✅ |
| 3.2.2 | Al cambiar entrada | A | ✅ |
| 3.3.1 | Identificación de error | A | ✅ |
| 3.3.3 | Sugerencias de error | AA | ✅ |
| 4.1.3 | Mensajes de estado | AA | ✅ |

### ⏳ Pendientes (Fases 4-5)

| Criterio | Descripción | Nivel | Estado |
|----------|-------------|-------|--------|
| 1.1.1 | Contenido no textual | A | ⏳ |
| 1.3.1 | Información y relaciones | A | ⏳ |
| 2.4.1 | Bypass de bloques | A | ⏳ |
| 2.4.6 | Encabezados y etiquetas | AA | ⏳ |
| 3.3.2 | Etiquetas o instrucciones | A | ⏳ |

---

## 🛠️ Herramientas Utilizadas

### Dependencias

```json
{
  "eslint": "^8.x",
  "eslint-plugin-jsx-a11y": "^6.8.0",
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "react-toastify": "^9.x",
  "@axe-core/react": "^1.2.3"
}
```

### Scripts de Validación

```bash
# Ejecutar linting con validación de accesibilidad
npm run lint

# Compilar la aplicación
npm run build

# Desarrollo
npm run dev
```

### Testing Manual

- ✅ Navegación con Tab
- ✅ Screen reader (NVDA, VoiceOver)
- ✅ Estilos focus-visible
- ✅ Dark mode
- ✅ Preferencias de usuario (reduced motion, high contrast)

---

## 📊 Estadísticas de Implementación

### Por Fase

| Fase | Componentes | Archivos | Commits | Líneas Código |
|------|------------|----------|---------|---------------|
| 1 | 2 | 3 | 1 | ~150 |
| 2 | 0 | 3 | 1 | ~200 |
| 3 | 0 | 6 | 1 | ~350 |
| **Total** | **2** | **12** | **3** | **~700** |

### Por Tipo

| Tipo | Cantidad |
|------|----------|
| Componentes Nuevos | 2 |
| Componentes Mejorados | 8+ |
| Archivos Modificados | 12 |
| Estilos Nuevos | ~250 líneas |
| Hooks Nuevos | 1 |

---

## 🚀 Próximos Pasos

### Inmediatos (Fase 4)

1. [ ] Revisar estructura semántica de Home.jsx
2. [ ] Mejorar landmarks en Navbar y Footer
3. [ ] Validar jerarquía de headings
4. [ ] Agregar aria-labels a navegación

### Mediano Plazo (Fase 5)

1. [ ] Implementar focus trap en modales
2. [ ] Agregar navegación con arrow keys
3. [ ] Mejorar tablas de datos
4. [ ] Revisar componentes interactivos

### Largo Plazo

1. [ ] Auditoría externa con herramientas especializadas
2. [ ] Testing con usuarios con discapacidades
3. [ ] Certificación WCAG 2.1 AA (si es posible)
4. [ ] Mantenimiento continuo

---

## 📚 Referencias

### WCAG 2.1 Oficiales
- [W3C - Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Herramientas
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Componentes
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React A11y Pattern Library](https://react-a11y-examples.com/)

---

## 📝 Notas Importantes

- **Compatibilidad:** Todas las mejoras mantienen compatibilidad con navegadores modernos (Chrome, Firefox, Safari, Edge)
- **Dark Mode:** Todos los cambios incluyen soporte para tema oscuro
- **Preferencias de Usuario:** Se respetan `prefers-reduced-motion` y `prefers-contrast`
- **Rendimiento:** No hay impacto negativo en rendimiento de la aplicación
- **Regressions:** Se han probado todas las funcionalidades existentes

---

**Última Actualización:** 2026-03-25
**Próxima Revisión:** Después de completar Fase 4
