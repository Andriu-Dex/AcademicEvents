# Solución de Problemas Backend y Frontend - AcademicEvents

## 📋 Resumen Ejecutivo

Este documento detalla los problemas identificados y resueltos en el sistema AcademicEvents, principalmente relacionados con errores 404/500 en el backend, problemas de rutas, configuración de Prisma, y optimización de peticiones en el frontend.

---

## 🚨 Problemas Identificados

### 1. **Error 404 en Endpoint /api/perfil**

- **Síntoma**: Endpoint `/api/perfil` retornaba error 404
- **Causa**: Ruta de perfil no registrada correctamente en `app.js`
- **Impacto**: Imposibilidad de obtener datos del usuario autenticado

### 2. **Error 500 en Validación de Inscripciones**

- **Síntoma**: Error interno al validar inscripciones
- **Causa**: Includes incorrectos en consultas Prisma y campos faltantes
- **Impacto**: Funcionalidad de validación de inscripciones no disponible

### 3. **Error Critical de path-to-regexp**

- **Síntoma**: Error fatal que impedía el inicio del servidor
- **Mensaje de Error**:
  ```
  TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
      at name (C:\...\node_modules\path-to-regexp\dist\index.js:73:19)
  ```
- **Causa**: Middleware 404 con sintaxis incorrecta `app.use("*", callback)`
- **Impacto**: Servidor no podía iniciar

### 4. **Múltiples Peticiones Simultáneas a /api/perfil**

- **Síntoma**: 6 peticiones casi simultáneas al mismo endpoint
- **Causa**: Problema de optimización en el frontend (React)
- **Impacto**: Uso innecesario de recursos del servidor

---

## 🛠️ Soluciones Aplicadas

### 1. **Corrección de Rutas en app.js**

#### **Problema**:

- Rutas de perfil no registradas
- Duplicidad en declaración de rutas
- Servicios mal configurados

#### **Solución Aplicada**:

```javascript
// ANTES: Ruta faltante
// Sin registro de perfilRoutes

// DESPUÉS: Ruta registrada correctamente
const perfilRoutes = require("./routes/perfil.routes");
app.use("/api", perfilRoutes);
console.log("✅ Rutas de perfil registradas en /api");
```

#### **Código Comentado Temporalmente**:

- Rutas de recuperación de contraseña
- Rutas de verificación de correo
- Rutas de corrección de email
- Rutas de comprobantes
- Rutas protegidas adicionales
- Servicios de limpieza y estados automáticos
- Middleware de archivos estáticos

#### **Motivo del Comentado**:

Estrategia de aislamiento para identificar el origen del error crítico de path-to-regexp, habilitando solo las rutas esenciales para el funcionamiento básico.

### 2. **Ajuste de Includes en Controladores Prisma**

#### **Problema**:

```javascript
// ANTES: Includes incompletos
include: {
  evento: true,
  // Faltaban campos críticos
}
```

#### **Solución Aplicada**:

```javascript
// DESPUÉS: Includes completos
include: {
  evento: true,
  inscripcion_curso: true,
  comprobantes_pago: {
    orderBy: { fec_sub_com_pag: "desc" },
    take: 1,
  },
  cartas_motivacion: {
    orderBy: { fec_sub_car_mot: "desc" },
    take: 1,
  },
  observacion: true,
  certificado: true,
}
```

### 3. **Identificación y Resolución del Error Critical path-to-regexp**

#### **Proceso de Debugging**:

El error crítico de `path-to-regexp` requirió un proceso sistemático de aislamiento para identificar su origen exacto.

#### **Error Completo**:

```bash
[nodemon] starting `node src/app.js`
C:\Users\andri\Documents\D-Proyectos\Git\AcademicEvents\backend\node_modules\path-to-regexp\dist\index.js:73
            throw new TypeError(`Missing parameter name at ${i}: ${DEBUG_URL}`);
            ^

TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
    at name (C:\Users\andri\Documents\D-Proyectos\Git\AcademicEvents\backend\node_modules\path-to-regexp\dist\index.js:73:19)
    at lexer (C:\Users\andri\Documents\D-Proyectos\Git\AcademicEvents\backend\node_modules\path-to-regexp\dist\index.js:91:27)
    at lexer.next (<anonymous>)
    at Iter.peek (C:\Users\andri\Documents\D-Proyectos\Git\AcademicEvents\backend\node_modules\path-to-regexp\dist\index.js:106:38)
    at Iter.tryConsume (C:\Users\andri\Documents\D-Proyectos\Git\AcademicEvents\backend\node_modules\path-to-regexp\dist\index.js:112:28)
    at Iter.text (C:\Users\andri\Documents\D-Proyectos\Git\AcademicEvents\backend\node_modules\path-to-regexp\dist\index.js:128:30)
    at consume (C:\Users\andri\Documents\D-Proyectos\Git\AcademicEvents\backend\node_modules\path-to-regexp\dist\index.js:152:29)
    at parse (C:\Users\andri\Documents\D-Proyectos\Git\AcademicEvents\backend\node_modules\path-to-regexp\dist\index.js:183:20)
    at C:\Users\andri\Documents\D-Proyectos\Git\AcademicEvents\backend\node_modules\path-to-regexp\dist\index.js:294:74
    at Array.map (<anonymous>)
```

#### **Estrategia de Aislamiento Aplicada**:

1. **Comentado masivo de rutas**: Se comentaron todas las rutas para verificar si el error persistía
2. **Comentado de servicios**: Se deshabilitaron servicios como Socket.IO, limpieza programada, etc.
3. **Comentado de middlewares**: Se comentaron middlewares de archivos estáticos y 404
4. **Restauración progresiva**: Se habilitaron elementos uno por uno hasta identificar el culpable

#### **Descubrimiento del Problema**:

El error **NO** estaba en las rutas de archivos como inicialmente se pensó. El problema se manifestó cuando se habilitó el middleware 404:

```javascript
// PROBLEMÁTICO: Esta sintaxis causa el error path-to-regexp
app.use("*", (req, res) => {
  console.log(`❌ [404] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Ruta no encontrada",
    method: req.method,
    url: req.originalUrl,
  });
});
```

#### **Causa Raíz**:

La sintaxis `app.use("*", callback)` no es compatible con la versión actual de `path-to-regexp` utilizada por Express. El patrón `"*"` genera un error de parsing en la librería que interpreta las rutas.

#### **Solución Implementada**:

```javascript
// CORRECTO: Middleware 404 sin patrón de ruta específico
app.use((req, res) => {
  console.log(`❌ [404] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Ruta no encontrada",
    method: req.method,
    url: req.originalUrl,
  });
});
```

#### **Diferencia Clave**:

- **Antes**: `app.use("*", callback)` - Intenta usar `"*"` como patrón de ruta
- **Después**: `app.use(callback)` - Middleware sin patrón específico que captura todas las rutas no manejadas

#### **Validación de la Solución**:

Después de aplicar la corrección:

```bash
[nodemon] starting `node src/app.js`
✅ Servidor corriendo en http://localhost:3000 ✅
🔌 Socket.IO configurado y funcionando
```

#### **Lecciones Aprendidas**:

1. **Los errores de librerías internas pueden ser engañosos**: El error se manifestaba en `path-to-regexp` pero la causa estaba en la sintaxis del middleware
2. **La estrategia de aislamiento es efectiva**: Comentar sistemáticamente cada elemento permite identificar exactamente dónde está el problema
3. **Las versiones de dependencias importan**: Sintaxis que funcionaba en versiones anteriores puede fallar en versiones más recientes
4. **Los middlewares 404 deben ser simples**: No necesitan patrones de ruta específicos para funcionar correctamente

### 4. **Mejoras en Logging y Debugging**

#### **Logs Agregados**:

```javascript
// Logging de peticiones para debugging
app.use((req, res, next) => {
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(
    `📋 Headers:`,
    req.headers.authorization ? "TOKEN PRESENT" : "NO TOKEN"
  );
  next();
});

// Logs específicos en controladores
console.log("🎯 [PERFIL] Iniciando obtenerPerfil");
console.log("🔑 [PERFIL] Usuario en request:", req.usuario);
```

---

## 📊 Estado Final del Sistema

### ✅ **Todas las Funcionalidades Completamente Restauradas**:

#### **Rutas de API Operativas**:

- ✅ Autenticación de usuarios (`/api/auth`)
- ✅ Gestión de perfil de usuario (`/api/perfil`)
- ✅ Panel de administración (`/api/admin`)
- ✅ Recuperación de contraseña (`/api/password-recovery`)
- ✅ Verificación de correo (`/api/verificacion`)
- ✅ Corrección de email (`/api/cuenta`)
- ✅ Gestión de comprobantes (`/api/comprobante`)
- ✅ Rutas protegidas (`/api/protected`)
- ✅ Gestión de eventos (`/api/eventos`)
- ✅ Gestión de facultades (`/api/facultades`)
- ✅ Generación de certificados (`/api/certificados`)
- ✅ Gestión de carreras (`/api/carreras`)
- ✅ Gestión de coordinadores (`/api/coordinadores`)
- ✅ MVA - Misión, Visión, Autoridades (`/api/mva`)
- ✅ Gestión de universidad (`/api/universidad`)
- ✅ Estadísticas (`/api/estadisticas`)
- ✅ Upload de imágenes (`/api/upload`)
- ✅ Reportes administrativos (`/api/admin/reportes`)
- ✅ Paginación (`/api/paginacion`)
- ✅ Gestión de inscripciones (`/api/inscripciones`)

#### **Servicios del Sistema Operativos**:

- ✅ Socket.IO para comunicación en tiempo real
- ✅ Servicio de limpieza programada de archivos temporales
- ✅ Servicio de estados automáticos de eventos (cron job)
- ✅ Configuración automática de directorios
- ✅ Middleware de archivos estáticos
- ✅ Middleware 404 corregido y funcional
- ✅ Sistema de logging detallado

#### **Estado de la Base de Datos**:

- ✅ Conexión Prisma estable
- ✅ Migraciones aplicadas correctamente
- ✅ Includes de consultas optimizados
- ✅ Validaciones de inscripciones operativas

### ⚠️ **Problema Pendiente**:

**Múltiples Peticiones a /api/perfil**

- **Naturaleza**: Optimización de frontend (no crítico)
- **Descripción**: 6 peticiones simultáneas al endpoint de perfil
- **Ubicación**: Frontend (React)
- **Impacto**: Uso innecesario de recursos del servidor

---

## 🔍 Análisis Detallado: Problema de Múltiples Peticiones

### **Descripción del Problema**

El frontend está realizando 6 peticiones casi simultáneas al endpoint `/api/perfil`, lo que indica un problema de optimización en la gestión de estado de React.

### **Posibles Causas en Frontend**:

#### 1. **Bucle en useEffect**

```javascript
// Problemático:
useEffect(() => {
  fetchPerfil();
}, [usuario]); // Si 'usuario' se actualiza múltiples veces

// O sin dependencias:
useEffect(() => {
  fetchPerfil();
}); // Se ejecuta en cada render
```

#### 2. **Re-renderizados en Cascada**

- Múltiples componentes consumiendo UserContext
- Actualizaciones de estado que disparan nuevos renders
- Falta de memoización en componentes

#### 3. **Múltiples Context Providers**

- Varios `UserContext.Provider` anidados
- Cada uno intentando inicializar el estado

#### 4. **Navegación mal Sincronizada**

```javascript
// Problema común:
if (token && !usuario) {
  fetchPerfil(); // Se ejecuta múltiples veces
}
```

#### 5. **Ausencia de Control de Carga**

- No hay verificación de estado `isLoading`
- Falta de cache para evitar peticiones duplicadas

### **Archivos Frontend Probablemente Afectados**:

- `src/context/AuthContext.jsx`
- `src/hooks/useAuth.js`
- `src/components/Layout.jsx`
- `src/views/Profile.jsx`
- `src/App.jsx`

### **Soluciones Recomendadas** (sin implementar):

#### 1. **Control de Estado de Carga**

```javascript
const [isLoadingProfile, setIsLoadingProfile] = useState(false);

const fetchPerfil = async () => {
  if (isLoadingProfile) return;
  setIsLoadingProfile(true);
  // ... lógica de fetch
  setIsLoadingProfile(false);
};
```

#### 2. **Implementar Cache**

```javascript
// Con React Query
const { data: usuario, isLoading } = useQuery("perfil", fetchPerfil, {
  staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  cacheTime: 10 * 60 * 1000,
});
```

#### 3. **Memoización de Componentes**

```javascript
const PerfilComponent = React.memo(() => {
  // Componente memoizado
});
```

#### 4. **Control de Dependencias useEffect**

```javascript
useEffect(() => {
  if (token && !usuario && !isLoadingProfile) {
    fetchPerfil();
  }
}, [token, usuario, isLoadingProfile]);
```

---

## 📈 Resultados Obtenidos

### **Antes de la Solución**:

- ❌ Error 404 en `/api/perfil`
- ❌ Error 500 en validación de inscripciones
- ❌ Error crítico path-to-regexp
- ❌ Servidor no podía iniciar
- ⚠️ 6 peticiones simultáneas a `/api/perfil`

### **Después de la Solución Completa**:

- ✅ Endpoint `/api/perfil` funcionando correctamente
- ✅ Validación de inscripciones operativa
- ✅ **ERROR CRÍTICO path-to-regexp COMPLETAMENTE RESUELTO**
- ✅ **TODAS las rutas y servicios restaurados y funcionando**
- ✅ Socket.IO operativo con eventos en tiempo real
- ✅ Servicios automáticos (limpieza y estados) funcionando
- ✅ Sistema robusto y completamente operacional
- ⚠️ Múltiples peticiones (problema de optimización frontend pendiente)

---

## 🎯 Próximos Pasos Recomendados

### **Prioridad Alta - COMPLETADO ✅**:

1. **✅ Restaurar rutas comentadas gradualmente**

   - ✅ Todas las rutas verificadas y habilitadas
   - ✅ Sin errores críticos introducidos

2. **✅ Habilitar servicios comentados**
   - ✅ Servicio de limpieza programada activo
   - ✅ Servicio de estados automáticos de eventos activo
   - ✅ Configuración de directorios funcionando
   - ✅ Socket.IO completamente operativo

### **Prioridad Alta - PENDIENTE**:

1. **Optimizar frontend**

   - Revisar y corregir múltiples peticiones a `/api/perfil`
   - Implementar cache o React Query
   - Mejorar gestión de estado de usuario

2. **Mejoras de rendimiento**
   - Optimizar consultas Prisma
   - Implementar paginación donde sea necesario
   - Añadir índices a la base de datos

### **Prioridad Baja**:

1. **Monitoreo y logging**
   - Implementar sistema de logs más robusto
   - Añadir métricas de rendimiento
   - Configurar alertas de errores

---

## 📝 Notas de Desarrollo

### **Estrategia de Debugging Aplicada**:

1. **Aislamiento**: Comentar servicios no esenciales
2. **Restauración progresiva**: Habilitar rutas de forma incremental
3. **Logging detallado**: Añadir logs para rastrear problemas
4. **Validación**: Verificar funcionamiento tras cada cambio

### **Lecciones Aprendidas**:

- La estrategia de comentado masivo permitió identificar rápidamente el origen de errores críticos
- Los includes de Prisma deben ser revisados cuidadosamente para evitar errores 500
- El registro de rutas debe ser explícito y verificado
- Los problemas de frontend requieren enfoques diferentes a los de backend

### **Consideraciones para el Futuro**:

- Implementar tests automatizados para prevenir regresiones
- Documentar mejor las dependencias entre servicios
- Crear un sistema de feature flags para habilitar/deshabilitar funcionalidades
- Establecer un proceso de deployment más robusto

---

## 🔧 Comandos Útiles para Debugging

```bash
# Verificar logs del servidor
npm run dev

# Verificar base de datos
npx prisma studio

# Revisar migraciones
npx prisma migrate status

# Generar cliente Prisma actualizado
npx prisma generate
```

---

## 📞 Contacto y Soporte

Para dudas sobre esta solución o problemas relacionados, revisar:

1. Este documento de solución
2. Logs del servidor backend
3. Console del navegador (frontend)
4. Estado de la base de datos con Prisma Studio

---

**Fecha de creación**: 20 de junio de 2025  
**Fecha de resolución completa**: 20 de junio de 2025  
**Estado**: ✅ TODOS LOS PROBLEMAS CRÍTICOS RESUELTOS - Sistema completamente operacional  
**Problema pendiente**: Optimización frontend (no crítico)  
**Versión**: 2.0 - Resolución Completa
