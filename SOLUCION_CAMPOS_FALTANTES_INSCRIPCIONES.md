# Error de Campos Faltantes en API de Inscripciones

## 📋 Descripción del Problema

Al acceder a la vista de administración de inscripciones en el frontend, los campos de validación de eventos mostraban valores por defecto incorretos:

- **Asistencia mínima:** `undefined%` (en lugar del valor real: `77%`)
- **Nota mínima:** `0` (en lugar del valor real: `7`)

Este problema impedía que los administradores vieran los requisitos reales de los eventos al validar inscripciones.

## 🔍 Diagnóstico

### Síntomas Observados

```
📊 Ejemplo de datos del evento enviados:
  - Nombre: Java
  - Tipo: CURSO
  - Asistencia mínima: undefined%
  - Datos del curso: No es curso
🚀 [FINAL] Datos exactos enviados al frontend:
  - JSON completo del evento: {
  "nom_eve": "Java",
  "tip_eve": "CURSO",
  "val_eve": 7,
  "id_eve": "cc55aacd-c38f-4c27-8ec1-76edc8d42427",
  "est_eve": "ACTIVO"
}
```

### Análisis de la Causa Raíz

1. **Primera investigación (incorrecta):** Se pensó que el problema estaba en la función `obtenerInscripcionesPorEvento`
2. **Descubrimiento real:** El problema estaba en la función `obtenerTodasLasInscripciones`
3. **Causa específica:** El mapeo manual de datos excluía los campos `por_min_asi_eve` y `eventos_curso`

### Identificación del Endpoint Real

```bash
# El frontend hacía peticiones a:
GET /api/admin/inscripciones
# NO a:
GET /api/admin/inscripciones/evento/{id}
```

## 🔧 Solución Implementada

### Archivo: `backend/src/controllers/inscripcion.controller.js`

#### 1. Corregir el `include` de Prisma

**Antes:**

```javascript
const inscripciones = await prisma.inscripcion.findMany({
  include: {
    cuenta: {
      include: {
        usuario: true,
      },
    },
    evento: true, // ❌ Solo incluía campos básicos del evento
    inscripcion_curso: true,
    // ...
  },
  // ...
});
```

**Después:**

```javascript
const inscripciones = await prisma.inscripcion.findMany({
  include: {
    cuenta: {
      include: {
        usuario: true,
      },
    },
    evento: {
      include: {
        eventos_curso: true, // ✅ Incluir datos del curso
      },
    },
    inscripcion_curso: true,
    // ...
  },
  // ...
});
```

#### 2. Corregir el mapeo de datos

**Antes:**

```javascript
evento: {
  nom_eve: inscripcion.evento.nom_eve,
  tip_eve: inscripcion.evento.tip_eve,
  val_eve: inscripcion.evento.val_eve,
  id_eve: inscripcion.evento.id_eve,
  est_eve: inscripcion.evento.est_eve,
  // ❌ FALTABAN: por_min_asi_eve y eventos_curso
},
```

**Después:**

```javascript
evento: {
  nom_eve: inscripcion.evento.nom_eve,
  tip_eve: inscripcion.evento.tip_eve,
  val_eve: inscripcion.evento.val_eve,
  id_eve: inscripcion.evento.id_eve,
  est_eve: inscripcion.evento.est_eve,
  por_min_asi_eve: inscripcion.evento.por_min_asi_eve, // ✅ AGREGADO
  eventos_curso: inscripcion.evento.eventos_curso, // ✅ AGREGADO
},
```

## ✅ Verificación de la Solución

### Prueba con curl

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/inscripciones
```

### Resultado Esperado

```json
{
  "evento": {
    "nom_eve": "Java",
    "tip_eve": "CURSO",
    "val_eve": 7,
    "id_eve": "cc55aacd-c38f-4c27-8ec1-76edc8d42427",
    "est_eve": "ACTIVO",
    "por_min_asi_eve": 77,
    "eventos_curso": {
      "id_eve_cur": "cc55aacd-c38f-4c27-8ec1-76edc8d42427",
      "not_min_cur": 7
    }
  }
}
```

### Resultado en Frontend

- **Asistencia (mín: 77%)** ✅ (antes: `undefined%`)
- **Nota (mín: 7)** ✅ (antes: `0`)

## 📚 Lecciones Aprendidas

1. **Debugging metodológico:** Usar logs específicos para identificar exactamente qué función se está ejecutando
2. **Verificación de endpoints:** Confirmar qué endpoint está siendo llamado por el frontend
3. **Mapeo manual vs automático:** Los `select` e `include` de Prisma pueden traer todos los datos, pero el mapeo manual puede excluir campos necesarios
4. **Consistencia de datos:** Asegurar que todas las funciones que devuelven datos similares tengan el mismo formato

## 🔄 Scripts de Debug Utilizados

### Script de Verificación Directa

```javascript
// debug_consulta.js
const prisma = require("./src/config/db");

async function debugInscripciones() {
  const id = "cc55aacd-c38f-4c27-8ec1-76edc8d42427";

  // Verificar evento directamente
  const eventoDirecto = await prisma.evento.findUnique({
    where: { id_eve: id },
    include: { eventos_curso: true },
  });

  console.log("Evento directo:", JSON.stringify(eventoDirecto, null, 2));
}
```

## 📝 Notas Adicionales

- **Tiempo de resolución:** Aproximadamente 2 horas de debugging
- **Archivos afectados:** Solo `inscripcion.controller.js`
- **Impacto:** Solución completa sin efectos secundarios
- **Testing:** Verificado con datos reales del evento "Java"

## 🚀 Estado Final

✅ **Problema resuelto completamente**
✅ **Frontend muestra valores correctos**
✅ **No se requieren cambios adicionales**
✅ **API devuelve datos completos y consistentes**
