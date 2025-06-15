# Solución de Gestión de Cupos en AcademicEvents

## Descripción del Problema

El sistema AcademicEvents presentaba dos problemas con el manejo de cupos disponibles (`cup_dis_eve`):

1. **Inconsistencia en estado de inscripciones**: Cuando una inscripción cambiaba de estado, particularmente en las transiciones desde ACEPTADA a otros estados (como REPROBADO_NOTA) o viceversa, los cupos no se actualizaban correctamente.

2. **Inconsistencia en la visualización**: Al recargar la página de eventos (http://localhost:5173/eventos), los cupos disponibles mostraban un valor incorrecto (80) cuando en realidad la base de datos contenía el valor correcto (79).

## Análisis del Problema

### Problema 1: Inconsistencia en el cálculo de cupos

El sistema original basaba el cálculo de cupos disponibles únicamente en el conteo de inscripciones en estado "ACEPTADA". Sin embargo, esto generaba inconsistencias cuando una inscripción pasaba de "ACEPTADA" a un estado final como "APROBADO" o "REPROBADO_NOTA", ya que el sistema interpretaba incorrectamente que el cupo se había liberado.

**Ejemplo de escenario problemático:**

1. Usuario A se inscribe en evento con 80 cupos → 79 disponibles
2. Administrador acepta inscripción → estado "ACEPTADA" → 79 disponibles
3. Evento finaliza y administrador cambia estado a "APROBADO"
4. El sistema contaba solo inscripciones "ACEPTADA", así que consideraba que había 80 disponibles (incorrecto)

### Problema 2: Inconsistencia en la visualización

Incluso después de corregir los datos en la base de datos mediante scripts, al recargar la página web, los cupos volvían a mostrar un valor incorrecto. Esto se debía a dos factores:

1. Caché del navegador o del framework frontend que mantenía datos desactualizados
2. Problemas en las rutas del backend que impedían la verificación correcta de los cupos

## Solución Técnica Implementada

### 1. Nuevo campo en la base de datos: `cup_ocu`

**Justificación técnica:** Se añadió un campo booleano `cup_ocu` al modelo `inscripcion` en Prisma por los siguientes motivos:

- **Desacoplamiento de estado y ocupación:** Permite separar el concepto de "estado de inscripción" del concepto de "ocupación de cupo", evitando lógica compleja.
- **Flexibilidad para reglas de negocio:** Facilita modificar en el futuro qué estados ocupan cupo sin tener que cambiar múltiples partes del código.
- **Simplificación de consultas:** Permite realizar consultas directas para contar inscripciones que ocupan cupo, sin necesidad de filtrar por múltiples estados.
- **Rendimiento mejorado:** Reduce la complejidad de las consultas al basarse en un único campo booleano.

**Implementación en schema.prisma:**

```prisma
model inscripcion {
  // ...campos existentes...
  cup_ocu Boolean @default(false) // Nuevo campo para controlar explícitamente si ocupa cupo
}
```

### 2. Reglas del Sistema Implementadas

Se han implementado las siguientes reglas para la gestión de cupos:

- Una inscripción ocupa cupo (`cup_ocu = true`) SOLO si su estado es ACEPTADA o uno de los estados finales (APROBADO, REPROBADO\_\*).
- Una inscripción NO ocupa cupo (`cup_ocu = false`) si su estado es PENDIENTE o RECHAZADA.
- El cálculo de cupos disponibles se basa en el campo `cup_ocu`, no en el estado de la inscripción.

Esto simplifica la lógica y evita casos borde donde podría haber inconsistencias al realizar transiciones complejas de estados.

## Cambios Realizados

### 1. Mejoras en el Backend

#### Schema de Prisma:

- Añadido campo `cup_ocu Boolean @default(false)` al modelo `inscripcion`
- Migración de Prisma creada y aplicada: `20250608173544_agregar_cupos`

#### Utilidades de Cupos (`src/utils/cupo.utils.js`):

- Modificada la función `calcularCuposDisponibles` para usar el campo `cup_ocu` en lugar de filtrar por estado
- Simplificada la lógica en `actualizarEstadoYSincronizarCupos` para ser más robusta y predecible
- Implementación de transacciones atómicas para garantizar consistencia en los datos

#### Controladores:

- **Inscripción (`src/controllers/inscripcion.controller.js`)**: Modificado para usar `cup_ocu = false` al crear una nueva inscripción
- **Evento (`src/controllers/evento.controller.js`)**: Implementado método `verificarYCorregirTodosLosCupos` para verificación masiva

#### Rutas API:

- Creada ruta específica `/eventos-verificar-cupos` para verificación proactiva de cupos
- Optimizado orden de rutas para evitar conflictos con rutas dinámicas

### 2. Scripts de Corrección y Mantenimiento

#### Script `actualizar_cup_ocu.js`:

- Establece `cup_ocu = false` para todas las inscripciones
- Establece `cup_ocu = true` para inscripciones en estado ACEPTADA y estados finales
- Recalcula y corrige los cupos disponibles para todos los eventos

#### Script `verificar_cupos.js`:

- Verifica inconsistencias entre cupos disponibles calculados y almacenados
- Proporciona información detallada sobre discrepancias encontradas

### 3. Solución a Problemas de Caché en Frontend

#### Configuración de Axios (`src/api/axiosConfig.js`):

- Añadidas cabeceras para prevenir caché en las solicitudes HTTP:
  ```javascript
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  }
  ```

#### Componentes de Eventos:

- **EventsRoute.jsx**:

  - Modificado para incluir parámetros de timestamp en solicitudes GET
  - Implementada llamada a verificación de cupos antes de cargar eventos
  - Manejo de errores para garantizar que la interfaz funcione aunque falle la verificación

- **EventosPublicos.jsx**:
  - Modificado de manera similar para garantizar datos actualizados
  - Implementada lógica de reintento para casos de error

#### Gestión de Errores:

- Implementación de manejo de errores para garantizar una experiencia fluida al usuario
- Mensajes informativos en caso de errores en la verificación de cupos

## Ejemplo de Flujo de Estados

```
                                   ┌─────────────┐
                                   │  PENDIENTE  │ (cup_ocu = false)
                                   └──────┬──────┘
                                          │
                                          ▼
┌──────────────────┐               ┌───────────────────────┐
│     RECHAZADA    │◄──────────────│       ACEPTADA        │
│ (cup_ocu=false)  │               │   (cup_ocu=true)      │
└──────────────────┘               └──────────┬────────────┘
                                              │
                                              ▼
                    ┌─────────────────────────┬─────────────────────────┐
                    ▼                         ▼                         ▼
         ┌────────────────┐         ┌─────────────────┐         ┌──────────────────┐
         │    APROBADO    │         │ REPROBADO_NOTA  │         │REPROBADO_*       │
         │(cup_ocu=true)  │         │(cup_ocu=true)   │         │(cup_ocu=true)    │
         └────────────────┘         └─────────────────┘         └──────────────────┘
```

## Cuándo una inscripción ocupa cupo

Una inscripción ocupa cupo (`cup_ocu = true`) cuando está en alguno de estos estados:

- ACEPTADA
- APROBADO
- REPROBADO_NOTA
- REPROBADO_ASISTENCIA
- REPROBADO_TOTAL

## Cómo Aplicar la Solución en Producción

1. Ejecutar la migración de Prisma para añadir el campo `cup_ocu` (ya realizado)
2. Ejecutar el script `actualizar_cup_ocu.js` para actualizar todas las inscripciones existentes
3. Ejecutar el script `verificar_cupos.js` para confirmar que los cupos son correctos

Se proporcionan dos scripts para facilitar este proceso:

- `deploy-fix.sh` (para sistemas Unix/Linux)
- `deploy-fix.cmd` (para sistemas Windows)

## Verificación de la Solución

Después de aplicar la solución, el script de verificación debería mostrar que todos los eventos tienen cupos correctos. Si aún hay discrepancias, el script proporcionará información sobre cuáles son los eventos afectados.

## Conclusión

Esta solución integral garantiza que los cupos disponibles siempre reflejen el número correcto según las reglas de negocio simplificadas, donde el estado de la inscripción determina directamente si debe ocupar un cupo o no.

### Beneficios de la Implementación

1. **Mejora en la Integridad de Datos:**

   - Separación clara entre estado de inscripción y ocupación de cupos
   - Modelo de datos más coherente con la lógica del negocio
   - Transacciones atómicas que garantizan consistencia

2. **Mejoras Técnicas:**

   - Simplificación de la lógica: Ahora solo hay que preguntar "¿Está en estado ACEPTADA o estado final?" para saber si ocupa cupo
   - Reducción de casos borde: Al simplificar la lógica, se eliminan escenarios problemáticos en transiciones complejas
   - Rendimiento optimizado mediante consultas más simples
   - Prevención efectiva de problemas de caché

3. **Facilidad de Mantenimiento:**
   - Código más legible y mantenible gracias a la separación de conceptos
   - Scripts de verificación y corrección para facilitar el mantenimiento
   - Documentación clara del problema y la solución

### Resultados Verificados

La prueba realizada con los scripts muestra que todos los eventos tienen los cupos correctamente calculados. Además, las pruebas manuales confirman que:

1. Los cupos se muestran correctamente después de recargar la página
2. Las operaciones de inscripción actualizan correctamente los cupos
3. Los cambios de estado mantienen la coherencia en los cupos disponibles

Esta solución integral aborda tanto los síntomas como las causas raíz del problema, asegurando un sistema robusto para la gestión de cupos en eventos académicos.
