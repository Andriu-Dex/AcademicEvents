# Análisis del Estado Actual del Proyecto AcademicEvents

**Fecha:** 6 de Marzo de 2026  
**Propósito:** Revisar el estado real del código vs. la documentación existente

---

## ⚠️ HALLAZGOS CRÍTICOS

### 1. Discrepancia entre Documentación y Realidad

**Problema:** El archivo `STANDARIZATION_DB.md` afirma que la estandarización está "completa", pero al revisar el código real:

| Documento dice | Realidad en el código |
|----------------|----------------------|
| ✅ "Schema Prisma completo en inglés" | ❌ `schema.prisma` **SIGUE EN ESPAÑOL** |
| ✅ "Modelos renombrados (Usuario → User)" | ❌ Modelos siguen siendo `usuario`, `cuenta`, `evento` |
| ✅ "Campos en camelCase inglés (firstName)" | ❌ Campos siguen siendo `nom_usu`, `ced_usu`, `cor_usu` |
| ✅ "Enums en inglés (GLOBAL_ADMIN)" | ❌ Enums siguen siendo `ADMIN_GLOBAL`, `ESTUDIANTE` |

**Evidencia:**
```prisma
// STANDARIZATION_DB.md dice:
model User {
  id          String  @id @default(uuid())
  idNumber    String  @unique
  firstName   String
  // ...
}

// schema.prisma REAL tiene:
model usuario {
  id_usu      String  @id @default(uuid())
  ced_usu     String  @unique
  nom_usu     String
  // ...
}
```

**Conclusión:** La documentación describe un estado DESEADO, no el estado ACTUAL. La estandarización NO se ejecutó realmente.

---

### 2. Problema de Cédulas como Primary Key Único Global

**Ubicación:** `backend/prisma/schema.prisma` línea 135

```prisma
model usuario {
  id_usu      String  @id @default(uuid())
  ced_usu     String  @unique  // ❌ PROBLEMA CRÍTICO
  // ...
}
```

**Problemas:**

1. **Multi-tenant imposible:** Si dos universidades diferentes registran a la misma persona (misma cédula), el segundo registro falla.

2. **Datos no modificables:** Las cédulas pueden tener errores de captura. El constraint `@unique` impide correcciones.

3. **Violación de normalización:** La cédula es un atributo del usuario, no un identificador inmutable del sistema.

**Ejemplo de problema:**
```javascript
// Universidad A registra a Juan Pérez - cédula 1804567890
await prisma.usuario.create({
  data: { ced_usu: '1804567890', nom_usu: 'Juan', /* ... */ }
});

// Universidad B intenta registrar al MISMO Juan Pérez
await prisma.usuario.create({
  data: { ced_usu: '1804567890', nom_usu: 'Juan', /* ... */ }
});
// ❌ ERROR: Unique constraint failed on the fields: (`ced_usu`)
```

**Solución Propuesta:**
```prisma
model User {
  id          String  @id @default(uuid())  // ✅ UUID como PK
  tenantId    String                        // ✅ Aislamiento multi-tenant
  idNumber    String                        // ✅ Ya no es unique global
  
  tenant      Tenant  @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, idNumber])  // ✅ Unique SOLO dentro del tenant
  @@index([tenantId])             // ✅ Performance
}
```

---

### 3. Arquitectura No Escalable

**Problema Actual:**

```
Sistema Actual:
┌───────────────────────────────────────┐
│      Base de Datos ÚNICA              │
│                                        │
│  Universidad hardcodeada (singleton)  │
│  Todos los datos mezclados            │
│  Sin aislamiento lógico                │
└───────────────────────────────────────┘

Para agregar una nueva universidad:
❌ Requiere instancia COMPLETA separada
❌ Duplicación de código
❌ Mantenimiento multiplicado
❌ Costos de infraestructura multiplicados
```

**Arquitectura Objetivo:**

```
Sistema Multi-Tenant:
┌─────────────────────────────────────────────────┐
│      Base de Datos COMPARTIDA                   │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Tenant A  │  │  Tenant B  │  │ Tenant C  │ │
│  │  (UTA)     │  │  (PUCE)    │  │ (UCE)     │ │
│  │            │  │            │  │           │ │
│  │ • Users    │  │ • Users    │  │ • Users   │ │
│  │ • Events   │  │ • Events   │  │ • Events  │ │
│  │ • Certs    │  │ • Certs    │  │ • Certs   │ │
│  └────────────┘  └────────────┘  └──────────┘ │
│                                                  │
│  Aislamiento por Row-Level Security             │
└─────────────────────────────────────────────────┘

Beneficios:
✅ Una sola instancia para N universidades
✅ Reducción de costos
✅ Mantenimiento centralizado
✅ Fácil agregar nuevas instituciones
```

---

## 📊 Estado Real del Código

### Backend

| Componente | Estado Real | Acción Requerida |
|------------|-------------|------------------|
| **schema.prisma** | ❌ **100% español** | Refactorizar completamente a inglés + agregar multi-tenant |
| **seed.js** | ❌ **100% español** | Reescribir con nuevos nombres de modelo/campos |
| **Controladores** | ⚠️ **Mixto** | Algunos tienen aliases, mayoría en español puro |
| **Servicios** | ⚠️ **Mixto** | Refactorizar a inglés |
| **Rutas** | ❌ **Español** | Refactorizar nombres de archivo, decidir si cambiar URLs |
| **Middlewares** | ⚠️ **Mixto** | Estandarizar a inglés |
| **Utils** | ❌ **Español** | Refactorizar completamente |

### Frontend

| Componente | Estado Real | Acción Requerida |
|------------|-------------|------------------|
| **Componentes** | ❌ **100% español** | Refactorizar todo (nombres de archivo, variables, lógica) |
| **Vistas** | ❌ **100% español** | Refactorizar todo |
| **Servicios API** | ❌ **Español** | Refactorizar y actualizar para enviar datos en inglés |
| **Textos UI** | ✅ **Español** | ✅ Correcto - debe quedarse en español |
| **i18n** | ❌ **No existe** | Implementar sistema de internacionalización |

---

## 🔍 Correcciones al Plan Previo

### Lo que el documento STANDARIZATION_DB.md dice vs. la realidad

1. **"Migración completada"** → ❌ **FALSO**
   - No se ejecutó la migración real
   - Documentación es aspiracional, no factual

2. **"npx prisma generate ejecutado sin errores"** → ⚠️ **TÉCNICAMENTE CIERTO**
   - Genera el cliente con los nombres en español
   - No prueba que la estandarización se haya hecho

3. **"Server arranca en puerto 3000 sin errores"** → ✅ **CIERTO**
   - Pero arranca con código en español, no inglés

4. **"GET /api/eventos responde con campos en inglés"** → ❌ **FALSO**
   - Responde con campos en español: `nom_eve`, `des_eve`, etc.

---

## 💡 Recomendaciones Críticas

### 1. NO usar STANDARIZATION_DB.md como referencia del estado actual

Este documento describe cómo **DEBERÍA** estar el código después de la estandarización, pero la estandarización **NUNCA SE EJECUTÓ**.

**Úsalo como:**
- ✅ Guía de referencias de traducción (español → inglés)
- ✅ Especificación de estado objetivo
- ✅ Glosario de términos

**NO lo uses como:**
- ❌ Descripción del estado actual
- ❌ Documentación de cambios realizados

### 2. Priorizar Multi-Tenant ANTES de Estandarización

**Razón:** Si estandarizas primero y luego agregas multi-tenant, harás el trabajo dos veces.

**Orden correcto:**
1. ✅ Agregar soporte multi-tenant al schema (incluye refactorización a inglés)
2. ✅ Actualizar backend para usar nuevo schema
3. ✅ Actualizar frontend para enviar datos en inglés

**Orden incorrecto (duplica esfuerzo):**
1. ❌ Estandarizar a inglés sin multi-tenant
2. ❌ Luego agregar multi-tenant requiere cambiar todo de nuevo

### 3. Migración Big Bang vs. Incremental

Dado que la estandarización documentada NO existe realmente, tenemos una ventaja:

**Podemos hacer una migración limpia directamente al estado final.**

```bash
# No necesitamos migración de inglés a inglés+multitenant
# Porque el estado actual ES español

# Migración directa:
Español + Single-tenant → Inglés + Multi-tenant
(Una sola migración grande)
```

---

## 🎯 Plan Simplificado Recomendado

### Opción A: Migración Completa (Recomendada)

**Duración:** 10-14 semanas  
**Riesgo:** Medio  
**Beneficio:** Sistema profesional y escalable

Seguir el plan completo descrito en `PLAN_ESTANDARIZACION_MULTITENANT.md`

### Opción B: Solo Multi-Tenant (Mínimo Viable)

**Duración:** 4-6 semanas  
**Riesgo:** Bajo  
**Beneficio:** Soluciona problema de cédulas y habilita múltiples instituciones

**Fases:**
1. Agregar modelo Tenant al schema (mantener nombres en español)
2. Agregar tenantId a todos los modelos existentes
3. Cambiar `@@unique` de ced_usu a `@@unique([tenantId, ced_usu])`
4. Implementar middleware de tenant resolution
5. Aplicar tenant scoping en controladores
6. Migrar datos existentes a tenant "default"

**Postponer para después:**
- Estandarización a inglés
- Refactorización de frontend
- i18n

### Opción C: Solo Estandarización (NO Recomendada)

**Duración:** 8-10 semanas  
**Riesgo:** Alto  
**Beneficio:** Limitado - no soluciona problemas críticos

❌ **NO RECOMIENDO ESTO** porque:
- No soluciona el problema de cédulas únicas globales
- No habilita multi-tenant
- Requiere re-trabajo cuando eventualmente necesiten multi-tenant

---

## 📝 Conclusiones

### Estado Actual (Verdadero)
- ❌ Schema en español
- ❌ Backend en español (mayoría)
- ❌ Frontend en español
- ❌ Sin multi-tenant
- ❌ Cédulas son unique global (problema crítico)
- ❌ No escalable para múltiples instituciones

### Estado Objetivo
- ✅ Schema en inglés con soporte multi-tenant
- ✅ Backend 100% en inglés
- ✅ Frontend con código en inglés, UI en español (i18n)
- ✅ Multi-tenant con aislamiento por tenantId
- ✅ Cédulas modificables, unique por tenant
- ✅ Escalable para N instituciones

### Brecha entre Actual y Objetivo
**Grande** - Requiere refactorización completa del sistema.

### Recomendación Final
Implementar **Opción A (Plan Completo)** si el tiempo y recursos lo permiten.  
Si hay limitaciones de tiempo/presupuesto, implementar **Opción B (Solo Multi-Tenant)** primero y estandarización después.

**NUNCA** implementar solo estandarización sin multi-tenant.

---

**Siguiente Paso:**
Revisar y aprobar `PLAN_ESTANDARIZACION_MULTITENANT.md` y comenzar implementación.
