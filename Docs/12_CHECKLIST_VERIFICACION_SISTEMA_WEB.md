# Checklist de Verificación Integral del Sistema Web

## Objetivo

Verificar de punta a punta que la versión web de AcademicEvents está estable, usable, accesible y lista para congelación funcional antes de iniciar el desarrollo de la aplicación móvil.

---

## 1. Preparación Técnica

- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] Base de datos disponible y migraciones aplicadas
- [ ] Seed ejecutado correctamente en entorno local
- [ ] Variables de entorno configuradas
- [ ] Socket.IO conecta correctamente
- [ ] Firebase Cloud Messaging inicializa sin errores críticos
- [ ] `npm run build` del frontend compila correctamente
- [ ] Prisma valida sin errores

---

## 2. Smoke Test Público

### Home y navegación pública
- [ ] La página de inicio carga correctamente
- [ ] Se muestran secciones institucionales sin errores
- [ ] La navbar pública funciona en modo claro
- [ ] La navbar pública funciona en modo oscuro
- [ ] El footer carga correctamente
- [ ] Los enlaces institucionales del footer abren correctamente

### Registro
- [ ] El formulario de registro carga correctamente
- [ ] Las validaciones de campos funcionan
- [ ] El indicador de fortaleza de contraseña funciona
- [ ] El formulario permite registrar un usuario nuevo
- [ ] El sistema muestra mensajes claros ante errores

### Login
- [ ] El formulario de login carga correctamente
- [ ] El login funciona con credenciales válidas
- [ ] El login rechaza credenciales inválidas
- [ ] El botón mostrar/ocultar contraseña funciona
- [ ] La redirección tras login respeta el rol del usuario

### Recuperación y verificación de cuenta
- [ ] La solicitud de recuperación de contraseña funciona
- [ ] El flujo de restablecimiento funciona
- [ ] La verificación de correo funciona si aplica
- [ ] Las pantallas intermedias de verificación muestran información correcta

---

## 3. Smoke Test de Usuario Autenticado

### Eventos
- [ ] La vista de eventos carga correctamente
- [ ] Los filtros funcionan
- [ ] La búsqueda funciona
- [ ] La paginación funciona con mouse
- [ ] La paginación funciona con teclado
- [ ] Los estados visibles del evento son coherentes
- [ ] Los cupos visibles del evento son coherentes

### Inscripción a eventos
- [ ] Un usuario puede inscribirse a un evento gratuito
- [ ] Un usuario puede inscribirse a un evento de pago
- [ ] El modal de inscripción funciona correctamente
- [ ] La carta de motivación se guarda correctamente
- [ ] El comprobante de pago se sube correctamente
- [ ] Los mensajes de éxito y error son correctos

### Mis inscripciones
- [ ] La vista de mis inscripciones carga correctamente
- [ ] Se muestran estados correctos de inscripción
- [ ] El reenvío de comprobante funciona
- [ ] La carta de motivación puede visualizarse
- [ ] El certificado aparece cuando corresponde

### Perfil
- [ ] La vista de perfil carga correctamente
- [ ] La edición de imagen de perfil funciona
- [ ] El recorte de imagen funciona
- [ ] La subida de documentos funciona
- [ ] Los nombres largos de archivos no rompen el modal
- [ ] La previsualización de documentos funciona
- [ ] El visor de documentos muestra PDFs e imágenes

### Certificados
- [ ] La vista de certificados carga correctamente
- [ ] La descarga de certificados funciona
- [ ] El reenvío por correo funciona si aplica
- [ ] El visor de certificados funciona

### Notificaciones
- [ ] La campana de notificaciones abre correctamente
- [ ] No hay parpadeos extraños al abrir la campana
- [ ] El historial de notificaciones carga correctamente
- [ ] Marcar como leída funciona
- [ ] Marcar todas como leídas funciona
- [ ] Limpiar notificaciones funciona
- [ ] No se generan errores `429` en condiciones normales
- [ ] El registro del token push funciona

---

## 4. Smoke Test de Administración

### Dashboard
- [ ] El dashboard administrativo carga correctamente
- [ ] Los accesos a reportes funcionan
- [ ] Los eventos recientes se muestran correctamente

### Gestión de eventos
- [ ] Crear evento funciona
- [ ] Editar evento funciona
- [ ] Eliminar o desactivar evento funciona
- [ ] Los cambios se reflejan correctamente en listados
- [ ] Los estados automáticos del evento funcionan

### Validación de inscripciones
- [ ] La lista de inscripciones por evento carga correctamente
- [ ] Aceptar inscripción funciona
- [ ] Rechazar inscripción funciona
- [ ] Finalizar inscripción funciona
- [ ] Ver comprobante funciona
- [ ] Ver documentos personales funciona
- [ ] Ver carta de motivación funciona
- [ ] No aparece pantalla en blanco en esta vista

### Gestión institucional
- [ ] Gestión de carreras funciona
- [ ] Crear carrera funciona
- [ ] Editar carrera funciona
- [ ] Gestión de facultades funciona
- [ ] Datos de universidad funcionan
- [ ] Los enlaces institucionales se pueden crear, editar y ordenar
- [ ] Los enlaces institucionales se reflejan en el footer

### Gestión de cuentas
- [ ] La vista de gestión de cuentas carga correctamente
- [ ] Ver cuenta funciona
- [ ] Editar cuenta funciona
- [ ] Bloquear o desbloquear cuenta funciona
- [ ] Eliminar cuenta funciona

### Reportes
- [ ] Reporte por carrera carga correctamente
- [ ] Reporte de inscripciones carga correctamente
- [ ] Reporte de asistencia carga correctamente
- [ ] Reporte de certificados carga correctamente
- [ ] Reporte de ingresos y pagos carga correctamente
- [ ] Reporte mensual carga correctamente
- [ ] Reporte detallado por evento carga correctamente
- [ ] La descarga PDF funciona en todos los reportes

---

## 5. Validación Transversal de Integridad

### Cupos y estados
- [ ] Aceptar una inscripción reduce `availableSpots`
- [ ] Rechazar una aceptada devuelve el cupo
- [ ] Reenviar comprobante no altera cupos
- [ ] Finalizar una inscripción aceptada no libera cupo indebidamente
- [ ] No se puede aceptar una inscripción cuando no hay cupos

### Tiempo real
- [ ] Cambios de inscripción se reflejan por socket donde corresponde
- [ ] Cambios institucionales se reflejan sin recargar donde corresponde
- [ ] El footer se actualiza al cambiar enlaces institucionales
- [ ] Los eventos no hacen recargas innecesarias por socket

### Seguridad y sesión
- [ ] Las rutas protegidas no permiten acceso sin autenticación
- [ ] Las rutas de administrador no permiten acceso a usuarios no autorizados
- [ ] El cierre de sesión funciona
- [ ] La expiración de token se maneja correctamente

---

## 6. Accesibilidad y UX

### Accesibilidad
- [ ] Focus visible en elementos interactivos
- [ ] Navegación por teclado funciona en navbar y menús
- [ ] Los modales atrapan el foco
- [ ] `Escape` cierra los modales cuando corresponde
- [ ] Los títulos de página son correctos
- [ ] Los landmarks principales existen
- [ ] Login y registro son utilizables con lector de pantalla

### UX visual
- [ ] No hay overlays debajo de la navbar
- [ ] No hay modales por debajo de otros modales cuando no corresponde
- [ ] Los toast se muestran por encima de overlays
- [ ] El botón flotante de tema/socket se mantiene visible
- [ ] No hay desbordes visuales notorios
- [ ] Light mode y dark mode se ven consistentes

---

## 7. Criterio de Cierre

La versión web se considera lista para pasar a planificación móvil cuando:

- [ ] No existen errores funcionales conocidos de severidad alta
- [ ] No existen errores funcionales conocidos de severidad media en flujos críticos
- [ ] Los smoke tests principales están aprobados
- [ ] La accesibilidad implementada fue verificada manualmente
- [ ] Los reportes y certificados funcionan correctamente
- [ ] Notificaciones, sockets y sincronización funcionan sin errores repetitivos
- [ ] La documentación refleja el estado real del proyecto
