<!-- Este diagrama técnico complementa la documentación de SOLUCION_CUPOS.md -->

# Diagrama Técnico: Solución de Gestión de Cupos

## Flujo de Datos y Componentes Involucrados

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐       ┌───────────────────────────┐   │
│  │                 │       │                           │   │
│  │  EventsRoute    │       │  EventosPublicos         │   │
│  │                 │       │                           │   │
│  └────────┬────────┘       └─────────────┬─────────────┘   │
│           │                              │                  │
│           │                              │                  │
│           ▼                              ▼                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              axiosInstance (con headers anti-caché) │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                              │
└─────────────────────────────┼──────────────────────────────┘
                              │
                              │ HTTP Requests
                              │ (con timestamp para evitar caché)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │              API Routes                      │           │
│  │                                             │           │
│  │  ┌────────────────┐    ┌─────────────────┐  │           │
│  │  │ /eventos       │    │ /eventos-       │  │           │
│  │  │                │    │ verificar-cupos │  │           │
│  │  └───────┬────────┘    └────────┬────────┘  │           │
│  └──────────┼─────────────────────┼────────────┘           │
│             │                     │                         │
│             ▼                     ▼                         │
│  ┌──────────────────┐    ┌─────────────────────────────┐   │
│  │                  │    │                             │   │
│  │ evento.controller│    │ verificarYCorregirTodosCupos│   │
│  │                  │    │                             │   │
│  └────────┬─────────┘    └─────────────┬───────────────┘   │
│           │                            │                    │
│           │                            │                    │
│           ▼                            ▼                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 cupo.utils.js                        │   │
│  │                                                     │   │
│  │  ┌─────────────────────┐  ┌────────────────────┐   │   │
│  │  │calcularCuposDisponibles│  │sincronizarCuposDisponibles│   │   │
│  │  │(basado en cup_ocu)│  │                    │   │   │
│  │  └─────────────────────┘  └────────────────────┘   │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                              │
│                             ▼                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Prisma ORM                         │   │
│  │                                                     │   │
│  │  ┌─────────────────┐       ┌─────────────────────┐  │   │
│  │  │  evento         │       │  inscripcion        │  │   │
│  │  │  - cup_max_eve  │       │  - est_ins          │  │   │
│  │  │  - cup_dis_eve  │◄─────►│  - cup_ocu       │  │   │
│  │  │                 │       │                     │  │   │
│  │  └─────────────────┘       └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐      ┌──────────────────────────┐  │
│  │  tabla: evento      │      │  tabla: inscripcion      │  │
│  │  - id_eve           │      │  - id_ins                │  │
│  │  - cup_max_eve      │      │  - id_eve_ins (FK)       │  │
│  │  - cup_dis_eve      │◄────►│  - est_ins               │  │
│  │                     │      │  - cup_ocu            │  │
│  └─────────────────────┘      └──────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Corrección de Datos

```
┌────────────────────┐     ┌────────────────────────┐     ┌───────────────────────┐
│                    │     │                        │     │                       │
│ Verificar cupos    │────►│ Contar inscripciones   │────►│ Calcular cupo         │
│ disponibles        │     │ con cup_ocu = true  │     │ disponible correcto   │
│                    │     │                        │     │                       │
└────────────────────┘     └────────────────────────┘     └───────────┬───────────┘
                                                                      │
                                                                      │
┌────────────────────┐     ┌────────────────────────┐     ┌───────────▼───────────┐
│                    │     │                        │     │                       │
│ Actualizar vista   │◄────┤ Responder con datos    │◄────┤ Actualizar cup_dis_eve│
│ en frontend        │     │ corregidos             │     │ si es necesario       │
│                    │     │                        │     │                       │
└────────────────────┘     └────────────────────────┘     └───────────────────────┘
```

## Diagrama de Estados de Inscripción y Campo cup_ocu

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│  ESTADOS DE INSCRIPCIÓN Y VALOR DE cup_ocu                                 │
│                                                                               │
│  ┌────────────────┬───────────────┬─────────────────────────────────────────┐ │
│  │ Estado         │ cup_ocu    │ Afecta a cup_dis_eve                    │ │
│  ├────────────────┼───────────────┼─────────────────────────────────────────┤ │
│  │ PENDIENTE      │ false         │ No - No ocupa cupo en el evento         │ │
│  │ ACEPTADA       │ true          │ Sí - Reduce cupo disponible             │ │
│  │ RECHAZADA      │ false         │ No - No ocupa cupo en el evento         │ │
│  │ APROBADO       │ true          │ Sí - Mantiene ocupado el cupo           │ │
│  │ REPROBADO_*    │ true          │ Sí - Mantiene ocupado el cupo           │ │
│  └────────────────┴───────────────┴─────────────────────────────────────────┘ │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Implementación en Frontend (Prevención de Caché)

```javascript
// En axiosConfig.js
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

// En EventsRoute.jsx
// Añadir timestamp para evitar caché
const timestamp = new Date().getTime();
const eventosRes = await axiosInstance.get(`/eventos?_t=${timestamp}`);

// Verificar cupos antes de mostrar datos
try {
  await axiosInstance.get("/eventos-verificar-cupos");
} catch (verifyError) {
  console.warn("Error al verificar cupos:", verifyError);
  // Continuar con la carga normal aunque falle la verificación
}
```
