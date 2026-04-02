# 14. Plan App Mobile - AcademicEvents

## Resumen Ejecutivo

La app mobile se desarrollara con **React Native + Expo** y reutilizara el backend actual (**Node.js + Express + Prisma + PostgreSQL**).
Esta decision reduce tiempo de salida, mantiene coherencia con el stack JS actual y facilita compartir reglas de negocio entre web y mobile.

## Objetivo

Construir una app mobile (Android/iOS) para estudiantes y personal academico que permita:
- autenticacion y gestion de sesion
- consulta y busqueda de eventos
- inscripciones y seguimiento de estado
- notificaciones push en tiempo real
- acceso a certificados e historial

## Tecnologia Seleccionada

### Frontend Mobile
- **React Native** para UI nativa multiplataforma.
- **Expo (SDK actual)** para acelerar desarrollo, build y distribucion.
- **Expo Router** para navegacion basada en archivos.
- **TypeScript** para tipado y mantenibilidad.
- **React Query (TanStack Query)** para cache y sincronizacion de datos.
- **Axios** para consumo de API REST.
- **Zustand o Context API** para estado global ligero.
- **React Hook Form + Zod** para formularios y validaciones robustas.

### Integraciones Mobile
- **Expo Notifications + FCM/APNs** para push notifications.
- **expo-secure-store** para almacenar tokens de forma segura.
- **expo-image-picker** para imagen de perfil.
- **expo-file-system / expo-sharing** para manejo de certificados.

### Backend (Reutilizado)
- API actual en **Node.js + Express**.
- Seguridad con **JWT** (login, refresh token).
- Persistencia con **PostgreSQL + Prisma**.
- Notificaciones existentes con **Firebase Admin + Socket.IO + FCM**.

## Por Que React Native + Expo

1. **Alineacion con el equipo**: ya usan JavaScript/React.
2. **Menor curva de aprendizaje** que Flutter/Kotlin/Swift para este equipo.
3. **Reutilizacion real** de servicios, modelos, validaciones y contratos API.
4. **Time-to-market menor** para MVP mobile.
5. **Escalabilidad**: permite migrar partes criticas a modulos nativos si se requiere.

## Arquitectura Propuesta

- Mobile consumira la API REST existente bajo versionado (ideal: `/api/v1`).
- El backend seguira siendo la unica fuente de verdad.
- Autenticacion con access token + refresh token.
- Cache de lectura en cliente con React Query para listas de eventos.
- Estrategia offline-basica: cache de ultima lectura + reintentos automaticos.

## Fases de Implementacion

## Fase 0 - Condicion de Inicio

Iniciar mobile solo cuando la version web este cerrada segun checklist interno.

## Fase 1 - Foundation (1-2 semanas)
- bootstrap del proyecto Expo con TypeScript
- arquitectura base (capas: app, features, shared, api)
- sistema de temas y componentes base
- configuracion CI para lint y build

## Fase 2 - Autenticacion y Perfil (1-2 semanas)
- login, logout, refresh token
- guardado seguro de sesion (SecureStore)
- perfil de usuario y actualizacion basica

## Fase 3 - Eventos e Inscripciones (2-3 semanas)
- listado, filtros y detalle de eventos
- flujo de inscripcion/cancelacion
- estados y mensajes de feedback

## Fase 4 - Notificaciones y Certificados (1-2 semanas)
- recepcion de push en foreground/background
- deep links desde notificacion
- descarga/visualizacion/compartir certificado

## Fase 5 - Calidad y Release (1-2 semanas)
- pruebas funcionales E2E de flujos criticos
- hardening de errores y telemetria
- build interna y publicacion (Play Store/TestFlight)

## Convenciones y Buenas Practicas

- Mantener identificadores y codigo en ingles.
- Mantener textos UI en espanol (i18n listo para crecer).
- Evitar logica de negocio en componentes de presentacion.
- Usar contratos API estables y documentados.
- Definir metricas de rendimiento y error desde el inicio.

## Riesgos y Mitigaciones

- **Riesgo:** cambios frecuentes en API.
  - **Mitigacion:** versionado de endpoints y contrato OpenAPI.

- **Riesgo:** duplicidad web/mobile en reglas de negocio.
  - **Mitigacion:** centralizar reglas criticas en backend.

- **Riesgo:** experiencia push inconsistente por plataforma.
  - **Mitigacion:** pruebas separadas Android/iOS y fallback con historial.

## Entregables

- repositorio mobile con estructura base y CI
- MVP funcional con autenticacion, eventos e inscripciones
- push notifications operativas
- guia de despliegue y checklist de release

## Decision Final

La ruta recomendada para AcademicEvents es **React Native + Expo + TypeScript**, reutilizando el backend actual y el sistema de notificaciones ya implementado. Esto ofrece el mejor balance entre velocidad, costo de desarrollo y mantenibilidad a mediano plazo.
