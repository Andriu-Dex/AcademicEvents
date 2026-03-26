# Plan de Cierre de la Versión Web Antes de App Móvil

## Resumen

La web no debe pasar a móvil todavía. El siguiente tramo se manejará como **cierre de versión web**, no como una nueva fase de implementación grande. El objetivo es dejar la plataforma web funcionalmente estable, técnicamente coherente y documentalmente alineada con lo que promete [`Comparacion.md`](c:/Users/andri/Documentos/D-Proyectos/Git/AcademicEvents/Docs/Comparacion.md).

La prioridad se dividirá en tres niveles: **bloqueantes**, **importantes** y **mejoras opcionales**. La app móvil solo debe comenzar cuando los bloqueantes e importantes estén cerrados y validados.

## Bloqueantes

- **Corregir la integridad de cupos de eventos**
  - Revisar el modelo actual con `availableSpots` y definir una solución única para concurrencia.
  - Implementar una estrategia consistente en backend para evitar sobreinscripciones bajo solicitudes simultáneas.
  - Auditar todos los flujos que consumen o liberan cupos: inscripción, aceptación, rechazo, cancelación, finalización y verificaciones administrativas.
  - Criterio de cierre: no debe existir ningún flujo que modifique cupos fuera del mecanismo definido.

- **Ejecutar una validación funcional completa de la web**
  - Probar de punta a punta los flujos críticos:
    - registro
    - login
    - recuperación/verificación de cuenta si aplica
    - creación/edición/eliminación de eventos
    - inscripción a eventos gratuitos y pagados
    - validación administrativa de inscripciones
    - carga y vista previa de documentos
    - generación y descarga de certificados
    - perfil de usuario
    - notificaciones en tiempo real y push
    - reportes y panel administrativo
  - Cada error detectado en esta pasada se corrige antes de seguir.
  - Criterio de cierre: cero errores funcionales conocidos en flujos críticos.

- **Alinear el sistema con lo que promete el documento comparativo**
  - Revisar [`Comparacion.md`](c:/Users/andri/Documentos/D-Proyectos/Git/AcademicEvents/Docs/Comparacion.md) y decidir, por cada punto, si:
    - ya existe
    - existe parcialmente
    - no existe y debe implementarse
    - no aplica y debe retirarse del documento
  - Criterio de cierre: no debe quedar ninguna funcionalidad “prometida” como terminada si en web aún no está realmente cerrada.

- **Cerrar consistencia técnica mínima de backend**
  - Revisar los puntos críticos ya identificados en base de datos:
    - índices compuestos relevantes para consultas frecuentes
    - puntos sensibles de consistencia en inscripciones/eventos
  - No incluir refactors grandes no urgentes, pero sí resolver lo que pueda comprometer operación real.
  - Criterio de cierre: backend estable para uso web sin deudas críticas abiertas de integridad.

## Importantes

- **Actualizar documentación técnica consolidada**
  - Mantener `Comparacion.md` como documento de alcance real.
  - Mantener los documentos `09_` y `10_` como registro de implementación cerrada.
  - Renombrar o corregir referencias inconsistentes de documentación si todavía quedan nombres viejos o rutas obsoletas.
  - Criterio de cierre: la documentación principal describe el estado actual del proyecto web y no el estado histórico.

- **Hacer una pasada final de consistencia visual y UX**
  - Revisar vistas clave en modo claro y oscuro:
    - navbar
    - login/register
    - perfil
    - eventos
    - inscripciones
    - panel admin
  - Confirmar que no queden overlays por debajo de la navbar, botones con estilos incoherentes, modales rotos o desbordes evidentes.
  - Criterio de cierre: la UI web se siente consistente y no tiene defectos visuales notorios en rutas principales.

- **Verificación final de accesibilidad ya implementada**
  - Ejecutar una validación manual final sobre los puntos ya trabajados:
    - foco visible
    - navegación por teclado
    - menús
    - modales
    - títulos de página
    - landmarks
    - lector de pantalla en login/register y flujos críticos
  - Criterio de cierre: accesibilidad validada como parte del cierre web, no como nueva línea de desarrollo.

- **Comprobar robustez de notificaciones y tiempo real**
  - Verificar que sockets y notificaciones no solo conecten, sino que actualicen correctamente en escenarios reales de uso.
  - Validar cambios en footer institucional, panel admin, y notificaciones visibles para usuario/admin.
  - Criterio de cierre: eventos de tiempo real visibles y funcionales sin necesidad de recargas manuales donde ya se definió actualización inmediata.

## Mejoras Opcionales

- **Reducir advertencias de build**
  - Revisar warnings de chunking y `dynamic import` en Vite.
  - Solo actuar si el ajuste es simple y no introduce riesgo antes del cierre web.

- **Mejorar ergonomía administrativa**
  - Pulir interacciones no críticas del panel como microdetalles visuales, reordenamientos más cómodos o ayudas contextuales menores.

- **Preparar terreno para móvil sin implementarlo**
  - Identificar qué endpoints, estructuras y flujos serán consumidos por móvil.
  - Documentar lo necesario, pero sin iniciar aún pantallas ni lógica móvil.

- **Evaluar refactors futuros no urgentes**
  - `AccountCredential`
  - limpieza adicional de naming heredado
  - mejoras más profundas de performance
  - estos puntos solo se documentan; no bloquean el cierre web.

## Cambios/Interfaces a revisar explícitamente

- **Base de datos y backend**
  - `Event.availableSpots` y flujo real de cupos.
  - índices de `Registration`, `Event`, `AccountToken` y `PushToken` según consultas dominantes.
  - consistencia entre schema, controladores y servicios luego de la estandarización a inglés.

- **Documentación de alcance**
  - [`Comparacion.md`](c:/Users/andri/Documentos/D-Proyectos/Git/AcademicEvents/Docs/Comparacion.md) debe reflejar:
    - stack real
    - módulos reales
    - accesibilidad ya implementada
    - funcionalidades web realmente terminadas

- **Criterio para pasar a móvil**
  - Solo se habilita cuando:
    - bloqueantes cerrados
    - importantes cerrados
    - smoke test manual completo aprobado
    - sin errores funcionales abiertos de severidad alta o media

## Plan de validación final

- **Smoke test de usuario**
  - registro
  - login
  - navegación general
  - inscripción
  - perfil
  - documentos
  - certificados
  - notificaciones

- **Smoke test de administración**
  - dashboard
  - eventos
  - validar inscripciones
  - carreras/facultades/universidad
  - reportes
  - gestión de cuentas

- **Validación transversal**
  - modo claro/oscuro
  - responsive básico
  - websockets
  - push notifications
  - modales
  - paginación
  - accesibilidad esencial

- **Cierre**
  - documentar cualquier brecha
  - corregir lo bloqueante/importante
  - declarar la web “lista para congelación funcional”
  - recién después abrir planificación móvil

## Supuestos y decisiones ya tomadas

- El cierre web incluirá validación manual y corrección puntual, no una nueva tanda grande de features.
- La app móvil queda explícitamente fuera de ejecución hasta terminar este cierre.
- Las mejoras opcionales no retrasan el inicio de móvil si bloqueantes e importantes ya están cerrados.
