---
name: 🐛 Reporte de Bug
about: Reportar un error o fallo en el sistema AcademicEvents
title: "[BUG-XXX] "
labels: ["bug", "pendiente"]
assignees: ""
---

## 🎯 Estándar de Título

**Formato requerido:** `[BUG-XXX] Descripción breve del error`

**Ejemplos correctos:**

- `[BUG-101] Error al generar certificados en formato PDF`
- `[BUG-102] Fallo en autenticación de usuarios en login`
- `[BUG-103] Dashboard no carga estadísticas correctamente`

---

## 🐛 Información del Bug

### Referencia de Ticket

BUG-XXX

### ✅ Clasificación Requerida

- [ ] `prioridad:baja` | `prioridad:media` | `prioridad:alta` | `prioridad:critica`
- [ ] `impacto:bajo` | `impacto:medio` | `impacto:alto` | `impacto:critico`
- [ ] `tipo:bug`
- [ ] `estado:reportado` | `estado:en-analisis` | `estado:corregido`
- [ ] `severidad:menor` | `severidad:moderada` | `severidad:critica`

## 📝 Descripción del Error

### Resumen del problema:

<!-- Describe brevemente qué está fallando -->

### Comportamiento actual:

<!-- Qué está pasando ahora (comportamiento incorrecto) -->

### Comportamiento esperado:

<!-- Qué debería pasar (comportamiento correcto) -->

### Impacto en el usuario:

<!-- Cómo afecta este bug a los usuarios del sistema -->

## 🔍 Pasos para Reproducir

1. **Paso 1:**
2. **Paso 2:**
3. **Paso 3:**
4. **Paso 4:**
5. **Resultado:** El error ocurre

## 🖥️ Sistemas Afectados

- [ ] Base de Datos
- [ ] API Backend
- [ ] Frontend (React)
- [ ] Servicios Externos
- [ ] Infraestructura

### Detalle técnico:

- **Componentes afectados:**
- **URLs con error:**
- **APIs involucradas:**
- **Funcionalidades impactadas:**

## 🌐 Información del Entorno

### Navegador/Cliente:

- [ ] Chrome (versión: \_\_\_)
- [ ] Firefox (versión: \_\_\_)
- [ ] Safari (versión: \_\_\_)
- [ ] Edge (versión: \_\_\_)
- [ ] Mobile (especificar: \_\_\_)

### Sistema Operativo:

- [ ] Windows (versión: \_\_\_)
- [ ] macOS (versión: \_\_\_)
- [ ] Linux (distribución: \_\_\_)
- [ ] iOS (versión: \_\_\_)
- [ ] Android (versión: \_\_\_)

### Resolución de pantalla:

- [ ] Desktop (1920x1080 o mayor)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667 o menor)

## 📸 Evidencias

### Capturas de pantalla:

<!-- Arrastra y suelta imágenes del error aquí -->

### Logs de error:

```
<!-- Pega aquí cualquier mensaje de error de consola -->
```

### Videos (opcional):

<!-- Si tienes un video mostrando el error, comparte el link -->

## 🔄 Información de Reproducibilidad

### Frecuencia del error:

- [ ] Siempre (100%)
- [ ] Frecuentemente (75-99%)
- [ ] A veces (25-74%)
- [ ] Raramente (1-24%)
- [ ] Una sola vez

### ¿Cuándo empezó a ocurrir?

<!-- Fecha aproximada o versión donde comenzó el problema -->

### Workaround temporal:

<!-- ¿Hay alguna forma de evitar el error temporalmente? -->

## ⚠️ Evaluación de Impacto

| Aspecto                    | Nivel                      | Descripción                    |
| -------------------------- | -------------------------- | ------------------------------ |
| Usuarios afectados         | Pocos/Algunos/Muchos/Todos | % aproximado de usuarios       |
| Funcionalidad crítica      | Sí/No                      | ¿Bloquea funciones esenciales? |
| Pérdida de datos           | Sí/No                      | ¿Se pierden datos del usuario? |
| Disponibilidad del sistema | Afectada/No afectada       | ¿El sistema sigue usable?      |

## 🔧 Análisis Técnico (Para desarrolladores)

### Posible causa raíz:

<!-- Hipótesis inicial sobre qué está causando el error -->

### Archivos/módulos sospechosos:

<!-- Qué partes del código podrían estar relacionadas -->

### Logs del servidor (si aplica):

```
<!-- Logs relevantes del backend -->
```

## ✅ Criterios de Aceptación para la Corrección

- [ ] El error ya no se reproduce siguiendo los pasos descritos
- [ ] La funcionalidad trabaja como se esperaba originalmente
- [ ] No se introdujeron nuevos bugs
- [ ] Se agregaron tests para prevenir regresión
- [ ] Documentación actualizada si es necesario

## 📢 Comunicaciones

- [ ] Usuarios afectados notificados
- [ ] Equipo de soporte informado
- [ ] Documentación de bugs actualizada

## 📝 Notas Adicionales

**Información adicional relevante:**

<!-- Cualquier otro detalle que pueda ayudar a resolver el bug -->

**Enlaces relacionados:**

<!-- Links a issues relacionados, documentación, etc. -->

## 👥 Equipo Responsable

- **Reportado por:**
- **Asignado a:**
- **Revisor técnico:**
- **Responsable de QA:**

---

<!-- AUDIT-DATA-START
{
  "templateVersion": "1.0",
  "changeType": "bugfix",
  "requiresDowntime": false,
  "estimatedDurationMinutes": 30,
  "riskLevel": "medium",
  "hasBackoutPlan": false,
  "issueType": "bug",
  "reproduced": false,
  "severityLevel": "medium"
}
AUDIT-DATA-END -->
