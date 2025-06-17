# Implementación de Datos Dinámicos de Universidad

## Descripción General

Se implementó un sistema completo para hacer que los datos de la universidad (nombre, logo, dirección, etc.) sean dinámicos y editables desde el panel de administración, en lugar de estar hardcodeados en el código.

## Objetivos Cumplidos

- ✅ Datos dinámicos de universidad en el footer del frontend
- ✅ Datos dinámicos de universidad en las plantillas de correo
- ✅ Panel de administración para editar los datos de la universidad
- ✅ API backend para gestionar los datos de universidad
- ✅ Integración completa entre frontend y backend

## Archivos Modificados/Creados

### Backend

#### 1. Controlador de Universidad

**Archivo:** `backend/src/controllers/universidad.controller.js`

- Creado controlador completo para gestionar los datos de la universidad
- Métodos implementados:
  - `getUniversidadPrincipal()`: Obtiene los datos de la universidad principal
  - `updateUniversidadDatos()`: Actualiza los datos básicos de la universidad

#### 2. Servicio de Universidad

**Archivo:** `backend/src/services/universidad.service.js`

- Creado servicio para manejar la lógica de negocio
- Funciones implementadas:
  - `getUniversidadData()`: Recupera datos de la BD con valores por defecto de fallback

#### 3. Rutas de Universidad

**Archivo:** `backend/src/routes/universidad.routes.js`

- Definidas rutas REST para la gestión de universidad:
  - `GET /api/universidad-principal`: Obtener datos (público)
  - `PUT /api/universidad/:id_uni`: Actualizar datos (requiere autenticación de admin)

#### 4. Configuración de Rutas

**Archivo:** `backend/src/app.js`

- Integradas las nuevas rutas de universidad en la aplicación principal

#### 5. Servicio de Plantillas de Correo

**Archivo:** `backend/src/services/EmailTemplateService.js`

- Optimizado para usar datos dinámicos de la universidad
- Integración con el servicio de universidad para obtener datos actualizados
- Método `obtenerDatosUniversidad()` agregado para soporte dinámico
- Soporte para datos dinámicos en todas las plantillas de correo

### Frontend

#### 1. Componente Footer

**Archivo:** `frontend/src/components/Footer.jsx`

- Modificado para consumir datos dinámicos desde la API
- Implementado estado de carga y manejo de errores
- Datos mostrados dinámicamente:
  - Nombre de la universidad
  - Logo de la universidad
  - Dirección
  - Teléfono
  - Correo electrónico

#### 2. Panel de Administración

**Archivo:** `frontend/src/views/admin/AdminConfiguracionMVA.jsx`

- Agregada nueva sección "Configuración de Universidad"
- Formulario completo para editar:
  - Nombre de la universidad
  - Logo (URL)
  - Dirección
  - Teléfono
  - Correo electrónico
- Funcionalidades implementadas:
  - Carga de datos existentes
  - Validación de formulario
  - Guardado de cambios
  - Notificaciones de éxito/error

## Funcionalidades Implementadas

### 1. Gestión Dinámica de Datos

- Los datos de la universidad se obtienen desde la base de datos
- Sistema de valores por defecto cuando no hay datos configurados
- Actualización en tiempo real sin necesidad de reiniciar la aplicación

### 2. Panel de Administración

- Interfaz intuitiva para editar los datos de la universidad
- Validación de campos obligatorios
- Guardado automático con confirmación visual

### 3. Footer Dinámico

- Muestra información actualizada de la universidad
- Carga responsiva con indicadores de estado
- Manejo elegante de errores de conexión

### 4. Plantillas de Correo Dinámicas

- Todas las plantillas de correo ahora usan datos dinámicos
- Información de la universidad se actualiza automáticamente en los correos
- Consistencia en la marca institucional

## Estructura de Datos

### Modelo Universidad

```javascript
{
  id_uni: String (UUID),
  nom_uni: String,
  acr_uni: String (opcional),
  url_log_uni: String (URL, opcional),
  url_web_uni: String (URL, opcional),
  dir_uni: String,
  tel_uni: String (opcional),
  cor_uni: String (opcional),
  fec_fun_uni: DateTime (opcional),
  fec_cre_uni: DateTime,
  est_uni: Boolean
}
```

## Beneficios de la Implementación

1. **Flexibilidad**: Los datos se pueden cambiar sin modificar código
2. **Consistencia**: Información unificada en toda la aplicación
3. **Mantenibilidad**: Gestión centralizada de los datos institucionales
4. **Escalabilidad**: Base sólida para futuras expansiones
5. **Usabilidad**: Interface administrativa fácil de usar

## Flujo de Funcionamiento

1. **Carga Inicial**: Al cargar la aplicación, se obtienen los datos de universidad desde la BD
2. **Visualización**: El footer y otros componentes muestran los datos dinámicos
3. **Edición**: Los administradores pueden modificar los datos desde el panel admin
4. **Actualización**: Los cambios se reflejan inmediatamente en toda la aplicación
5. **Correos**: Las plantillas de email utilizan los datos actualizados automáticamente

## Notas Técnicas

- Implementación RESTful estándar
- Manejo robusto de errores con valores por defecto
- Código modular y reutilizable
- Compatibilidad con la arquitectura existente
- Output personalizado de Prisma en `src/generated/prisma`
- Middlewares de autenticación: `verificarToken` y `requireRole('ADMIN_GLOBAL')`
- Sistema de fallback para datos de universidad cuando no existen en BD

## Problemas Resueltos Durante la Implementación

### 1. Error de Prisma Client

**Problema**: Error `@prisma/client did not initialize yet. Please run "prisma generate"`
**Causa**: El cliente de Prisma no se había regenerado después de los cambios
**Solución**: Ejecutar `npx prisma generate` para regenerar el cliente con output personalizado

### 2. Error de Middleware de Autenticación

**Problema**: `Cannot find module '../middlewares/auth.middleware'`
**Causa**: El archivo se llamaba `auth.js`, no `auth.middleware.js`
**Solución**: Corregir la importación en `universidad.routes.js`

### 3. Error de Handler de Rutas

**Problema**: `TypeError: argument handler must be a function`
**Causa**: Los middlewares `validateToken` y `validateAdmin` no existían
**Solución**: Usar los middlewares correctos `verificarToken` y `requireRole('ADMIN_GLOBAL')`

### 4. Configuración de Output de Prisma

**Decisión**: Mantener output personalizado en `../src/generated/prisma`
**Beneficio**: Control total sobre la ubicación del cliente generado
**Consideración**: Requiere regeneración manual después de cambios al schema

## Próximos Pasos Sugeridos

- Implementar caché para mejorar el rendimiento
- Agregar validaciones adicionales en el backend (URLs válidas, formato de teléfono)
- Considerar un sistema de logs para auditoría de cambios
- Expandir la funcionalidad para múltiples instituciones (si es necesario)
- Implementar subida de imágenes para logos en lugar de URLs
- Agregar tests unitarios para los nuevos endpoints

---

**Fecha de implementación:** Junio 2025  
**Estado:** Completado y funcional  
**Última actualización:** 17 de Junio 2025 - Corrección de errores de middlewares y regeneración de Prisma Client
