# AcademicEvents Mobile

Guia de ejecucion solo para la app movil con Expo. Este documento no cubre backend ni frontend web.

## Requisitos previos

- Node.js 18 o superior
- npm
- Expo Go instalado en el telefono, si vas a probar en dispositivo fisico
- Backend del proyecto levantado y accesible desde la red local o el emulador

## Variables de entorno

Antes de arrancar, copia `mobile/.env.example` a `mobile/.env`.

Variables usadas por la app:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_TENANT_SLUG`

Valores recomendados en desarrollo:

- `EXPO_PUBLIC_API_URL=auto`
- `EXPO_PUBLIC_TENANT_SLUG=uta`

`auto` intenta detectar la IP del host por Metro/Expo. Si no resuelve bien, usa manualmente `http://<IP-LAN-PC>:3000`.

## Instalacion

Desde la carpeta `mobile`:

```powershell
cd mobile
npm install
```

## Scripts npm disponibles

Todos los comandos siguientes se ejecutan dentro de `mobile`.

### Arranque y desarrollo

```powershell
npm run start
```

Arranca Expo en LAN.

```powershell
npm run start:stable
```

Arranca Expo en LAN limpiando cache. Es el comando recomendado cuando quieres evitar problemas de cache o resolucion de host.

```powershell
npm run start:tunnel
```

Arranca Expo por tunel cuando LAN no funciona o estas en otra red.

```powershell
npm run start:lan
```

Arranca Expo especificamente en modo LAN.

```powershell
npm run start:localhost
```

Arranca Expo usando localhost. Sirve en emuladores o escenarios locales compatibles.

### Ejecutar en dispositivos

```powershell
npm run android
```

Abre la app en Android.

```powershell
npm run ios
```

Abre la app en iOS.

```powershell
npm run web
```

Abre la version web de Expo solo para pruebas rapidas.

## Flujo recomendado para trabajar

1. Levanta el backend del proyecto.
2. En otra terminal entra a `mobile`.
3. Ejecuta `npm run start:stable`.
4. Abre Expo Go o el emulador.
5. Verifica que `EXPO_PUBLIC_API_URL` apunte al backend correcto.

## Verificación de Correo por Código (OTP)

La aplicación móvil cuenta con un flujo moderno para validar el correo mediante un código de 6 dígitos (OTP):
- **Cajas de Entrada Secuenciales:** Consta de 6 entradas individuales que manejan foco automático y navegación con tecla de retroceso (Backspace).
- **Auto-envío:** Al ingresar el último dígito del código, la aplicación envía automáticamente la petición de verificación.
- **Inicio de Sesión Automático:** Tras una verificación exitosa, la aplicación almacena de forma segura la sesión (`useAuthStore`) y redirige automáticamente al usuario al Dashboard (`/(tabs)`).

## Notas practicas

- Si usas telefono fisico, ambos equipos deben estar en la misma red Wi-Fi.
- Si la API no responde, prueba cambiando `EXPO_PUBLIC_API_URL` a la IP del PC.
- Si cambias variables de entorno, reinicia Expo.
- Esta app usa autenticacion, notificaciones y carga de archivos, asi que conviene probarla siempre con backend funcionando.
