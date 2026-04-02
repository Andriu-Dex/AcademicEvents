# Checklist de Verificación Integral del Sistema Web

## Objetivo

Verificar de punta a punta que la versión web de AcademicEvents está estable, usable, accesible y lista para congelación funcional antes de iniciar el desarrollo de la aplicación móvil.

---

## 1. Preparación Técnica

- [x] Backend inicia sin errores
- [x] Frontend inicia sin errores
- [x] Base de datos disponible y migraciones aplicadas
- [x] Seed ejecutado correctamente en entorno local
- [x] Variables de entorno configuradas
- [x] Socket.IO conecta correctamente
- [x] Firebase Cloud Messaging inicializa sin errores críticos
- [x] `npm run build` del frontend compila correctamente
- [x] Prisma valida sin errores

---

## 2. Smoke Test Público

### Home y navegación pública
- [x] La página de inicio carga correctamente
- [x] Se muestran secciones institucionales sin errores
- [x] La navbar pública funciona en modo claro
- [x] La navbar pública funciona en modo oscuro
- [x] El footer carga correctamente
- [x] Los enlaces institucionales del footer abren correctamente

### Registro
- [x] El formulario de registro carga correctamente
- [x] Las validaciones de campos funcionan
- [x] El indicador de fortaleza de contraseña funciona
- [x] El formulario permite registrar un usuario nuevo
- [x] El sistema muestra mensajes claros ante errores

### Login
- [x] El formulario de login carga correctamente
- [x] El login funciona con credenciales válidas
- [x] El login rechaza credenciales inválidas
- [x] El botón mostrar/ocultar contraseña funciona
- [x] La redirección tras login respeta el rol del usuario

### Recuperación y verificación de cuenta
- [-] La solicitud de recuperación de contraseña funciona
- [x] El flujo de restablecimiento funciona
- [x] La verificación de correo funciona si aplica
- [x] Las pantallas intermedias de verificación muestran información correcta

---

## 3. Smoke Test de Usuario Autenticado

### Eventos
- [x] La vista de eventos carga correctamente
- [-] Los filtros funcionan
- [x] La búsqueda funciona
- [x] La paginación funciona con mouse
- [x] La paginación funciona con teclado
- [x] Los estados visibles del evento son coherentes
- [x] Los cupos visibles del evento son coherentes

### Inscripción a eventos
- [x] Un usuario puede inscribirse a un evento gratuito
- [x] Un usuario puede inscribirse a un evento de pago
- [x] El modal de inscripción funciona correctamente
- [x] La carta de motivación se guarda correctamente
- [x] El comprobante de pago se sube correctamente
- [x] Los mensajes de éxito y error son correctos

### Mis inscripciones
- [x] La vista de mis inscripciones carga correctamente
- [x] Se muestran estados correctos de inscripción
- [x] El reenvío de comprobante funciona
- [x] La carta de motivación puede visualizarse
- [x] El certificado aparece cuando corresponde

### Perfil
- [x] La vista de perfil carga correctamente
- [x] La edición de imagen de perfil funciona
- [x] El recorte de imagen funciona
- [x] La subida de documentos funciona
- [x] Los nombres largos de archivos no rompen el modal
- [x] La previsualización de documentos funciona
- [x] El visor de documentos muestra PDFs e imágenes

### Certificados
- [x] La vista de certificados carga correctamente
- [x] La descarga de certificados funciona
- [x] El reenvío por correo funciona si aplica
- [x] El visor de certificados funciona

### Notificaciones
- [x] La campana de notificaciones abre correctamente
- [x] No hay parpadeos extraños al abrir la campana
- [x] El historial de notificaciones carga correctamente
- [x] Marcar como leída funciona
- [x] Marcar todas como leídas funciona
- [x] Limpiar notificaciones funciona
- [x] No se generan errores `429` en condiciones normales
- [x] El registro del token push funciona

---

## 4. Smoke Test de Administración

### Dashboard
- [x] El dashboard administrativo carga correctamente
- [x] Los accesos a reportes funcionan
- [x] Los eventos recientes se muestran correctamente

### Gestión de eventos
- [x] Crear evento funciona
- [x] Editar evento funciona
- [x] Eliminar o desactivar evento funciona
- [x] Los cambios se reflejan correctamente en listados
- [x] Los estados automáticos del evento funcionan

### Validación de inscripciones
- [x] La lista de inscripciones por evento carga correctamente
- [x] Aceptar inscripción funciona
- [x] Rechazar inscripción funciona
- [x] Finalizar inscripción funciona
- [x] Ver comprobante funciona
- [x] Ver documentos personales funciona
- [x] Ver carta de motivación funciona
- [x] No aparece pantalla en blanco en esta vista

### Gestión institucional
- [x] Gestión de carreras funciona
- [x] Crear carrera funciona
- [x] Editar carrera funciona
- [x] Gestión de facultades funciona
- [x] Datos de universidad funcionan
- [x] Los enlaces institucionales se pueden crear, editar y ordenar
- [x] Los enlaces institucionales se reflejan en el footer

### Gestión de cuentas
- [x] La vista de gestión de cuentas carga correctamente
- [x] Ver cuenta funciona
- [-] Editar cuenta funciona
- [x] Bloquear o desbloquear cuenta funciona
- [x] Eliminar cuenta funciona

### Reportes
- [x] Reporte por carrera carga correctamente
- [x] Reporte de inscripciones carga correctamente
- [x] Reporte de asistencia carga correctamente
- [x] Reporte de certificados carga correctamente
- [x] Reporte de ingresos y pagos carga correctamente
- [x] Reporte mensual carga correctamente
- [x] Reporte detallado por evento carga correctamente
- [x] La descarga PDF funciona en todos los reportes

---

## 5. Validación Transversal de Integridad

### Cupos y estados
- [x] Aceptar una inscripción reduce `availableSpots`
- [x] Rechazar una aceptada devuelve el cupo
- [x] Reenviar comprobante no altera cupos
- [x] Finalizar una inscripción aceptada no libera cupo indebidamente
- [x] No se puede aceptar una inscripción cuando no hay cupos

### Tiempo real
- [x] Cambios de inscripción se reflejan por socket donde corresponde
- [x] Cambios institucionales se reflejan sin recargar donde corresponde
- [x] El footer se actualiza al cambiar enlaces institucionales
- [x] Los eventos no hacen recargas innecesarias por socket

### Seguridad y sesión
- [x] Las rutas protegidas no permiten acceso sin autenticación
- [x] Las rutas de administrador no permiten acceso a usuarios no autorizados
- [x] El cierre de sesión funciona
- [x] La expiración de token se maneja correctamente

---

## 6. Accesibilidad y UX

### Accesibilidad
- [x] Focus visible en elementos interactivos
- [x] Navegación por teclado funciona en navbar y menús
- [x] Los modales atrapan el foco
- [x] `Escape` cierra los modales cuando corresponde
- [x] Los títulos de página son correctos
- [x] Los landmarks principales existen
- [x] Login y registro son utilizables con lector de pantalla

### UX visual
- [x] No hay overlays debajo de la navbar
- [x] No hay modales por debajo de otros modales cuando no corresponde
- [x] Los toast se muestran por encima de overlays
- [x] El botón flotante de tema/socket se mantiene visible
- [x] No hay desbordes visuales notorios
- [x] Light mode y dark mode se ven consistentes

---

## 7. Criterio de Cierre

La versión web se considera lista para pasar a planificación móvil cuando:

- [x] No existen errores funcionales conocidos de severidad alta
- [x] No existen errores funcionales conocidos de severidad media en flujos críticos
- [x] Los smoke tests principales están aprobados
- [x] La accesibilidad implementada fue verificada manualmente
- [x] Los reportes y certificados funcionan correctamente
- [x] Notificaciones, sockets y sincronización funcionan sin errores repetitivos
- [x] La documentación refleja el estado real del proyecto
