# Implementación de Paginación en Sistema Academic Events

## **Nota**: Este documento debe actualizarse conforme se vayan implementando las funcionalidades y se descubran nuevos requisitos o optimizaciones.

## Resumen Ejecutivo

### Problema Actual

El sistema Academic Events actualmente carga todos los registros de una vez en las vistas principales, causando:

- **Problemas de performance**: Tiempos de carga largos con bases de datos grandes
- **Mala experiencia de usuario**: Interfaces lentas y poco responsivas
- **Consumo excesivo de memoria**: Tanto en frontend como backend
- **Escalabilidad limitada**: El sistema no funcionará eficientemente con miles de eventos

### Solución Propuesta

Implementar un sistema de paginación completo que incluya:

- **Paginación en el backend**: Consultas optimizadas con LIMIT y OFFSET
- **Componentes reutilizables**: Hook personalizado y componente de controles de paginación
- **Filtros integrados**: Combinación de paginación con filtros existentes
- **Nomenclatura consistente**: Clases CSS con identificadores únicos por archivo

---

## Objetivos

### Objetivos Principales

1. **Mejorar Performance**: Reducir tiempos de carga en 70-80%
2. **Escalabilidad**: Soportar miles de registros sin degradación
3. **Experiencia de Usuario**: Navegación fluida entre páginas
4. **Reutilización**: Componentes que puedan usarse en toda la aplicación

### Objetivos Secundarios

1. **Mantener Compatibilidad**: No romper funcionalidades existentes
2. **Consistencia**: Mismo comportamiento en todas las vistas
3. **Responsive**: Funcionar correctamente en dispositivos móviles
4. **Accesibilidad**: Cumplir estándares de accesibilidad web

---

## Arquitectura de la Solución

### Diagrama de Flujo

```
[Frontend] → [usePagination Hook] → [API Backend] → [Prisma DB]
     ↓              ↓                      ↓            ↓
[PaginationControls] [Filtros] → [Controller] → [Query Optimizada]
```

## Componentes a Modificar

### Prioridad 1: Componentes Públicos

#### 1. EventosPublicos.jsx 🔥 **CRÍTICO**

- **Ubicación**: `frontend/src/routes/EventosPublicos.jsx`
- **Razón**: Vista principal para usuarios no autenticados
- **Impacto**: Alto - Es la primera impresión del sistema
- **Filtros actuales**: software, industrial, público, gratuito, pagado, modalidad
- **Paginación sugerida**: 12 eventos por página

#### 2. EventsRoute.jsx 🔥 **CRÍTICO**

- **Ubicación**: `frontend/src/routes/EventsRoute.jsx`
- **Razón**: Vista principal para usuarios autenticados
- **Impacto**: Alto - Usado por todos los usuarios registrados
- **Filtros actuales**: carrera, modalidad, estado, gratuito, pagado
- **Paginación sugerida**: 12 eventos por página

### Prioridad 2: Panel Administrativo

#### 3. AdminEvents.jsx 🟡 **ALTO**

- **Ubicación**: `frontend/src/views/admin/AdminEvents.jsx`
- **Razón**: Gestión de eventos por administradores
- **Impacto**: Medio-Alto - Usado por administradores frecuentemente
- **Filtros actuales**: búsqueda, tipo, estado, fecha, carrera, modalidad, capacidad, valor
- **Paginación sugerida**: 15 eventos por página

#### 4. AdminInscripciones.jsx 🟡 **ALTO**

- **Ubicación**: `frontend/src/views/admin/AdminInscripciones.jsx`
- **Razón**: Gestión de inscripciones
- **Impacto**: Medio-Alto - Usado para validar inscripciones
- **Filtros actuales**: evento, búsqueda
- **Paginación sugerida**: 20 inscripciones por página

#### 5. AdminEventInscription.jsx 🟡 **MEDIO**

- **Ubicación**: `frontend/src/views/admin/AdminEventInscription.jsx`
- **Razón**: Inscripciones por evento específico
- **Impacto**: Medio - Vista detallada de inscripciones
- **Filtros actuales**: estado de inscripción
- **Paginación sugerida**: 25 inscripciones por página

#### 6. AdminGestion.jsx 🟡 **MEDIO**

- **Ubicación**: `frontend/src/views/admin/AdminGestion.jsx`
- **Razón**: Lista de administradores del sistema
- **Impacto**: Medio - Usado ocasionalmente
- **Filtros actuales**: ninguno
- **Paginación sugerida**: 15 administradores por página

### Prioridad 3: Dashboard y Reportes

#### 7. AdminDashboard.jsx 🟢 **COMPLETADO**

- **Ubicación**: `frontend/src/views/admin/AdminDashboard.jsx`
- **Razón**: "Eventos Recientes" en dashboard
- **Impacto**: Bajo - Es una vista de resumen
- **Filtros actuales**: ninguno
- **Paginación implementada**: 10 eventos recientes con controles estándar
- **Estado**: ✅ Usa PaginationControls estándar en lugar de paginación personalizada

#### 8. Reportes Administrativos 🟢 **BAJO**

- **ReporteCarrera.jsx**: Lista de eventos por carrera
- **ReporteInscripciones.jsx**: Lista de inscripciones
- **ReporteAsistencia.jsx**: Lista de eventos con asistencia
- **ReporteCertificados.jsx**: Lista de certificados
- **ReporteCupos.jsx**: Lista de eventos con análisis de cupos
- **AdminReporteMes.jsx**: Lista de eventos por mes

---

## Implementación Backend

### 1. Modificación de Controladores

#### Estructura Base para Paginación

```javascript
// Patrón estándar para todos los controladores
async function obtenerDatosPaginados(req, res) {
  try {
    // Extraer parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Extraer filtros
    const { search, status, type, ...otherFilters } = req.query;

    // Construir condición WHERE
    const whereCondition = {};
    if (search) {
      whereCondition.OR = [
        { nom_campo: { contains: search, mode: "insensitive" } },
        // Agregar otros campos de búsqueda
      ];
    }
    if (status) whereCondition.est_campo = status;
    if (type) whereCondition.tip_campo = type;

    // Ejecutar consultas en paralelo
    const [datos, totalCount] = await Promise.all([
      prisma.modelo.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy: { fec_cre: "desc" },
        include: {
          // Relaciones necesarias
        },
      }),
      prisma.modelo.count({ where: whereCondition }),
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      data: datos,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error en paginación:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: error.message,
    });
  }
}
```

#### Controladores a Modificar

**1. evento.controller.js**

```javascript
// Nuevos métodos para eventos públicos paginados
async obtenerEventosPublicosPaginados(req, res) {
  // Implementar paginación para eventos públicos
  // Incluir filtros: software, industrial, publico, gratuito, modalidad
}

async obtenerEventosUsuarioPaginados(req, res) {
  // Implementar paginación para eventos de usuario autenticado
  // Incluir filtros: carrera, modalidad, estado
}

async obtenerEventosAdminPaginados(req, res) {
  // Implementar paginación para vista admin de eventos
  // Incluir todos los filtros existentes
}
```

**2. inscripcion.controller.js**

```javascript
async obtenerInscripcionesPaginadas(req, res) {
  // Implementar paginación para todas las inscripciones
}

async obtenerInscripcionesPorEventoPaginadas(req, res) {
  // Implementar paginación para inscripciones de un evento específico
}
```

**3. admin.controller.js**

```javascript
async listarAdminsPaginados(req, res) {
  // Implementar paginación para lista de administradores
}
```

**4. reporte.controller.js**

```javascript
async getEventosParaReportesPaginados(req, res) {
  // Implementar paginación para eventos en dashboard
}

// Modificar métodos existentes de reportes para incluir paginación
```

### 2. Modificación de Rutas

#### Nuevas Rutas Backend

```javascript
// routes/eventos.routes.js
router.get("/eventos-publicos", obtenerEventosPublicosPaginados);
router.get("/eventos", verificarToken, obtenerEventosUsuarioPaginados);

// routes/admin.routes.js
router.get("/eventos", verificarToken, onlyAdmin, obtenerEventosAdminPaginados);
router.get(
  "/inscripciones",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPaginadas
);
router.get(
  "/inscripciones/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEventoPaginadas
);
router.get("/list-admins", verificarToken, onlyAdmin, listarAdminsPaginados);

// routes/reporte.routes.js
router.get(
  "/reportes-evento",
  verificarToken,
  onlyAdmin,
  getEventosParaReportesPaginados
);
```

---

## Implementación Frontend

### 1. Hook Custom para Paginación

#### Archivo: `hooks/usePagination.js`

```javascript
import { useState, useCallback, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";

/**
 * Hook personalizado para manejar paginación
 * @param {string} endpoint - URL del endpoint de la API
 * @param {number} initialLimit - Número inicial de elementos por página
 * @param {Object} dependencies - Dependencias que disparán re-fetch
 * @returns {Object} Objeto con datos y métodos de paginación
 */
export const usePagination = (
  endpoint,
  initialLimit = 10,
  dependencies = []
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (filters = {}, page = currentPage) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: itemsPerPage,
          ...filters,
        };

        const response = await axiosInstance.get(endpoint, { params });

        if (response.data.data) {
          setData(response.data.data);
          setTotalItems(response.data.pagination.totalItems);
          setTotalPages(response.data.pagination.totalPages);
        } else {
          // Compatibilidad con endpoints que no usan el formato estándar
          setData(response.data);
          setTotalItems(response.data.length);
          setTotalPages(1);
        }

        return response.data;
      } catch (error) {
        console.error("Error fetching paginated data:", error);
        setError(error.response?.data?.message || "Error al cargar datos");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, currentPage, itemsPerPage]
  );

  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [totalPages, currentPage]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setData([]);
    setTotalItems(0);
    setTotalPages(0);
  }, []);

  // Efecto para re-fetch cuando cambian las dependencias
  useEffect(() => {
    if (dependencies.length > 0) {
      resetPagination();
    }
  }, dependencies);

  return {
    // Datos
    data,
    loading,
    error,

    // Metadatos de paginación
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    // Métodos
    fetchData,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,

    // Estados derivados
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,

    // Información para mostrar al usuario
    startItem: (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems),
  };
};
```

### 2. Componente de Controles de Paginación

#### Archivo: `components/Pagination/PaginationControls.jsx`

```jsx
import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import "./PaginationControls.css";

/**
 * Componente de controles de paginación reutilizable
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente de controles de paginación
 */
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  totalItems,
  itemsPerPage,
  loading = false,
  className = "",
  showInfo = true,
  showNumbers = true,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas relevantes
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      // Agregar primera página
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      // Agregar páginas del rango
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Agregar última página
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`pagination-controls-pc ${className}`}>
      {showInfo && (
        <div className="pagination-info-pc">
          Mostrando {startItem} a {endItem} de {totalItems} resultados
        </div>
      )}

      <div className="pagination-buttons-pc">
        <button
          className="pagination-btn-pc pagination-prev-pc"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || loading}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
          <span className="pagination-btn-text-pc">Anterior</span>
        </button>

        {showNumbers && (
          <div className="pagination-numbers-pc">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="pagination-ellipsis-pc">
                    <MoreHorizontal size={16} />
                  </span>
                ) : (
                  <button
                    className={`pagination-number-pc ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    aria-label={`Ir a página ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <button
          className="pagination-btn-pc pagination-next-pc"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          aria-label="Página siguiente"
        >
          <span className="pagination-btn-text-pc">Siguiente</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
```

#### Archivo: `components/Pagination/PaginationControls.css`

```css
/* Estilos para controles de paginación - Identificador único: pc */

.pagination-controls-pc {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--white, #ffffff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-info-pc {
  text-align: center;
  color: var(--text-light, #6b7280);
  font-size: 0.9rem;
  font-weight: 500;
}

.pagination-buttons-pc {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-btn-pc {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light, #e5e7eb);
  background: var(--white, #ffffff);
  color: var(--text-primary, #374151);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.pagination-btn-pc:hover:not(:disabled) {
  background: var(--primary-light, #f3f4f6);
  border-color: var(--primary-color, #8a1538);
  color: var(--primary-color, #8a1538);
}

.pagination-btn-pc:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--gray-50, #f9fafb);
}

.pagination-numbers-pc {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-number-pc {
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid var(--border-light, #e5e7eb);
  background: var(--white, #ffffff);
  color: var(--text-primary, #374151);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-number-pc:hover:not(:disabled) {
  background: var(--primary-light, #f3f4f6);
  border-color: var(--primary-color, #8a1538);
  color: var(--primary-color, #8a1538);
}

.pagination-number-pc.active {
  background: var(--primary-color, #8a1538);
  border-color: var(--primary-color, #8a1538);
  color: var(--white, #ffffff);
}

.pagination-number-pc:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-ellipsis-pc {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  color: var(--text-light, #6b7280);
}

/* Responsive Design */
@media (max-width: 768px) {
  .pagination-controls-pc {
    padding: 1rem;
  }

  .pagination-btn-text-pc {
    display: none;
  }

  .pagination-btn-pc {
    padding: 0.75rem;
    min-width: 2.5rem;
    justify-content: center;
  }

  .pagination-numbers-pc {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .pagination-info-pc {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .pagination-numbers-pc {
    gap: 0.125rem;
  }

  .pagination-number-pc {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  .pagination-ellipsis-pc {
    min-width: 2rem;
    height: 2rem;
  }
}

/* Estados de loading */
.pagination-controls-pc.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Variantes de color */
.pagination-controls-pc.variant-admin {
  --primary-color: #1e40af;
  --primary-light: #eff6ff;
}

.pagination-controls-pc.variant-public {
  --primary-color: #059669;
  --primary-light: #ecfdf5;
}
```

### 3. Modificación de Componentes Existentes

#### EventosPublicos.jsx

```jsx
// Importaciones adicionales
import { usePagination } from "../hooks/usePagination";
import PaginationControls from "../components/Pagination/PaginationControls";

const EventosPublicos = () => {
  // Reemplazar estado de eventos con paginación
  const {
    data: eventos,
    loading: cargandoPaginacion,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    fetchData,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem,
  } = usePagination("/eventos-publicos", 12);

  // Estados para filtros (mantener existentes)
  const [filtros, setFiltros] = useState({
    software: false,
    industrial: false,
    publico: false,
    gratuito: false,
    pagado: false,
    completo: false,
    modalidad: "",
    finalizado: false,
    cancelado: false,
    suspendido: false,
  });

  // Efecto para cargar datos cuando cambian filtros
  useEffect(() => {
    const filtrosActivos = Object.entries(filtros)
      .filter(([key, value]) => {
        if (typeof value === "boolean") return value;
        if (typeof value === "string") return value !== "";
        return false;
      })
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (filtro) {
      filtrosActivos.search = filtro;
    }

    fetchData(filtrosActivos);
  }, [filtros, filtro, currentPage, fetchData]);

  // Función para manejar cambio de filtros
  const handleFiltroChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    goToPage(1); // Volver a la primera página cuando cambian filtros
  };

  return (
    <div className="eventos-publicos-container-ep">
      {/* Navbar y filtros existentes */}
      <Navbar />

      {/* Contenido principal */}
      <div className="eventos-content-ep">
        {/* Filtros existentes */}
        {/* ... código de filtros ... */}

        {/* Lista de eventos con paginación */}
        <div className="eventos-grid-ep">
          {cargandoPaginacion ? (
            <div className="loading-container-ep">
              <p>Cargando eventos...</p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="no-eventos-ep">
              <p>No se encontraron eventos</p>
            </div>
          ) : (
            eventos.map((evento) => (
              <div key={evento.id_eve} className="evento-card-ep">
                {/* Contenido de la tarjeta existente */}
              </div>
            ))
          )}
        </div>

        {/* Controles de paginación */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          loading={cargandoPaginacion}
          className="variant-public"
        />
      </div>
    </div>
  );
};
```

#### EventsRoute.jsx

```jsx
// Similar implementación a EventosPublicos.jsx
// pero con endpoint '/eventos' y filtros específicos de usuario autenticado
```

#### AdminEvents.jsx

```jsx
// Similar implementación pero con:
// - endpoint '/admin/eventos'
// - filtros más complejos (búsqueda, tipo, estado, fecha, etc.)
// - 15 eventos por página
// - className "variant-admin"
```

---

## Estructura de Archivos

### Archivos Nuevos a Crear

```
frontend/
├── src/
│   ├── hooks/
│   │   └── usePagination.js                     # Hook personalizado
│   ├── components/
│   │   └── Pagination/
│   │       ├── PaginationControls.jsx          # Componente de controles
│   │       └── PaginationControls.css          # Estilos (identificador: pc)
│   └── utils/
│       └── paginationHelpers.js                # Utilidades opcionales
```

### Archivos Existentes a Modificar

#### Backend

```
backend/
├── src/
│   ├── controllers/
│   │   ├── evento.controller.js                # Agregar métodos paginados
│   │   ├── inscripcion.controller.js           # Agregar métodos paginados
│   │   ├── admin.controller.js                 # Agregar métodos paginados
│   │   └── reporte.controller.js               # Agregar métodos paginados
│   └── routes/
│       ├── eventos.routes.js                   # Agregar rutas paginadas
│       ├── admin.routes.js                     # Agregar rutas paginadas
│       └── reporte.routes.js                   # Agregar rutas paginadas
```

#### Frontend

```
frontend/
├── src/
│   ├── routes/
│   │   ├── EventosPublicos.jsx                 # Implementar paginación
│   │   └── EventsRoute.jsx                     # Implementar paginación
│   └── views/
│       └── admin/
│           ├── AdminEvents.jsx                 # Implementar paginación
│           ├── AdminInscripciones.jsx          # Implementar paginación
│           ├── AdminEventInscription.jsx       # Implementar paginación
│           ├── AdminGestion.jsx                # Implementar paginación
│           ├── AdminDashboard.jsx              # Implementar paginación limitada
│           └── reportes/
│               ├── ReporteCarrera.jsx          # Implementar paginación
│               ├── ReporteInscripciones.jsx    # Implementar paginación
│               ├── ReporteAsistencia.jsx       # Implementar paginación
│               ├── ReporteCertificados.jsx     # Implementar paginación
│               ├── ReporteCupos.jsx            # Implementar paginación
│               └── AdminReporteMes.jsx         # Implementar paginación
```

---

## Orden de Implementación

### Fase 1: Fundamentos (Semana 1)

1. **Crear hook usePagination.js**
2. **Crear componente PaginationControls**

### Fase 2: Componentes Críticos (Semana 2)

1. **EventosPublicos.jsx** - Implementación completa
2. **EventsRoute.jsx** - Implementación completa

### Fase 3: Panel Administrativo (Semana 3)

1. **AdminEvents.jsx** - Implementación completa
2. **AdminInscripciones.jsx** - Implementación completa
3. **AdminEventInscription.jsx** - Implementación completa

### Fase 4: Gestión y Dashboard (Semana 4)

1. **AdminGestion.jsx** - Implementación completa
2. **AdminDashboard.jsx** - ✅ **Implementación completa** - Ahora usa PaginationControls estándar

### Fase 5: Reportes (Semana 5)

1. **ReporteCarrera.jsx** - Implementación completa
2. **ReporteInscripciones.jsx** - Implementación completa
3. **ReporteAsistencia.jsx** - Implementación completa

### Fase 6: Finalización (Semana 6)

1. **ReporteCertificados.jsx** - Implementación completa
2. **ReporteCupos.jsx** - Implementación completa
3. **AdminReporteMes.jsx** - Implementación completa
4. **Testing completo del sistema**
5. **Optimizaciones finales**

---

## Especificaciones Técnicas

### Parámetros de Paginación

#### Estándar para Todas las APIs

```javascript
// Query parameters
{
  page: number,        // Página actual (default: 1)
  limit: number,       // Elementos por página (default: 10)
  search: string,      // Término de búsqueda (opcional)
  sortBy: string,      // Campo de ordenamiento (opcional)
  sortOrder: 'asc'|'desc', // Orden (opcional, default: 'desc')
  // ... filtros específicos del endpoint
}

// Response format
{
  data: Array,         // Datos de la página actual
  pagination: {
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  }
}
```

### Configuración por Componente

| Componente            | Items por Página | Filtros Principales        | Ordenamiento Default |
| --------------------- | ---------------- | -------------------------- | -------------------- |
| EventosPublicos       | 12               | modalidad, tipo, precio    | fec_ini_eve DESC     |
| EventsRoute           | 12               | carrera, modalidad, estado | fec_ini_eve DESC     |
| AdminEvents           | 15               | búsqueda, tipo, estado     | fec_cre_eve DESC     |
| AdminInscripciones    | 20               | evento, estado             | fec_ins DESC         |
| AdminEventInscription | 25               | estado                     | fec_ins DESC         |
| AdminGestion          | 15               | rol                        | fec_cre DESC         |
| AdminDashboard        | 10               | ninguno                    | fec_cre_eve DESC     |
| Reportes              | 15-20            | varía                      | fec_cre DESC         |

### Nomenclatura de Clases CSS

#### Convención de Identificadores Únicos

- **EventosPublicos**: `ep` (eventos-publicos)
- **EventsRoute**: `er` (events-route)
- **AdminEvents**: `ae` (admin-events)
- **AdminInscripciones**: `ai` (admin-inscripciones)
- **AdminEventInscription**: `aei` (admin-event-inscription)
- **AdminGestion**: `ag` (admin-gestion)
- **AdminDashboard**: `ad` (admin-dashboard)
- **PaginationControls**: `pc` (pagination-controls)

#### Ejemplos de Clases

```css
/* EventosPublicos.jsx */
.eventos-grid-ep {
}
.evento-card-ep {
}
.filtros-container-ep {
}

/* AdminEvents.jsx */
.events-grid-ae {
}
.event-card-ae {
}
.filters-container-ae {
}

/* PaginationControls.jsx */
.pagination-controls-pc {
}
.pagination-btn-pc {
}
.pagination-number-pc {
}
```

---

## Consideraciones de Performance

### Backend

1. **Índices de Base de Datos**

   ```sql
   -- Crear índices para campos comunes de filtrado y ordenamiento
   CREATE INDEX idx_evento_fecha_creacion ON evento(fec_cre_eve);
   CREATE INDEX idx_evento_fecha_inicio ON evento(fec_ini_eve);
   CREATE INDEX idx_evento_estado ON evento(est_eve);
   CREATE INDEX idx_evento_tipo ON evento(tip_eve);
   CREATE INDEX idx_inscripcion_fecha ON inscripcion(fec_ins);
   CREATE INDEX idx_inscripcion_estado ON inscripcion(est_ins);
   ```

2. **Optimización de Consultas**

   - Usar `select` específicos en lugar de `select *`
   - Implementar eager loading para relaciones necesarias
   - Evitar N+1 queries con `include` optimizado

3. **Caching**
   ```javascript
   // Implementar cache para consultas frecuentes
   const cacheKey = `eventos_page_${page}_limit_${limit}_filters_${JSON.stringify(
     filters
   )}`;
   ```

### Frontend

1. **Lazy Loading**: Implementar carga diferida para componentes pesados
2. **Memoización**: Usar `React.memo` para componentes de lista
3. **Virtual Scrolling**: Considerar para listas muy largas (opcional)
4. **Debounce**: Implementar debounce para filtros de búsqueda

### Límites Recomendados

- **Máximo items por página**: 50
- **Timeout de requests**: 30 segundos
- **Cache TTL**: 5 minutos para datos estáticos
- **Debounce delay**: 300ms para búsquedas

---

### Casos de Prueba Manuales

#### 1. Funcionalidad Básica

- [ ] Cargar primera página correctamente
- [ ] Navegar entre páginas
- [ ] Mostrar información de paginación correcta
- [ ] Deshabilitar botones cuando corresponde

#### 2. Filtros y Búsqueda

- [ ] Aplicar filtros resetea a página 1
- [ ] Búsqueda funciona con paginación
- [ ] Combinación de múltiples filtros
- [ ] Limpiar filtros restaura estado inicial

#### 3. Estados de Error

- [ ] Manejar errores de red correctamente
- [ ] Mostrar mensaje cuando no hay resultados
- [ ] Recovery después de errores temporales

#### 4. Performance

- [ ] Tiempo de carga < 2 segundos
- [ ] No hay memory leaks en navegación
- [ ] Responsive en dispositivos móviles

#### 5. Accesibilidad

- [ ] Navegación con teclado funciona
- [ ] Screen readers pueden navegar
- [ ] Contraste de colores adecuado
- [ ] Aria labels están presentes

---
