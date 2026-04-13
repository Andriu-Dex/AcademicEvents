# Mobile - AcademicEvents

Guia rapida para ejecutar el proyecto completo (backend + frontend + mobile) y trabajar la app con Expo Go.

## Que incluye el proyecto

- `backend`: API Express + Prisma + PostgreSQL (puerto `3000`)
- `frontend`: Web React + Vite (puerto `5173`)
- `mobile`: App Expo Router (Expo Go)

## Requisitos previos

- Node.js 18+
- npm
- PostgreSQL en ejecucion
- Expo Go instalado en el telefono (si pruebas en dispositivo fisico)

## 1) Configurar variables de entorno

### Backend

En `backend/.env` define al menos:

- `DATABASE_URL=postgresql://...`
- `PORT=3000`
- `HOST=0.0.0.0`
- `FRONTEND_URL=http://localhost:5173`
- `JWT_SECRET=...`
- Variables SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) para envio de correos

Nota: si usas movil en LAN, `HOST=0.0.0.0` permite acceso desde el telefono.

### Frontend

En `frontend/.env`:

- `VITE_API_URL=http://localhost:3000`

### Mobile

Copia `mobile/.env.example` a `mobile/.env` y ajusta si hace falta:

- `EXPO_PUBLIC_API_URL=auto`
- `EXPO_PUBLIC_TENANT_SLUG=uta`

`auto` detecta la IP del host en dev. Si falla, coloca manualmente `http://<IP-LAN-PC>:3000`.

## 2) Instalar dependencias

Ejecuta en cada modulo:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../mobile
npm install
```

## 3) Preparar base de datos (backend)

Desde `backend`:

```bash
npx prisma migrate deploy
# opcional en desarrollo
# npx prisma db seed
```

## 4) Levantar todo el proyecto

Abre 3 terminales separadas.

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

API esperada en `http://localhost:3000`.

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Web esperada en `http://localhost:5173`.

### Terminal 3 - Mobile (estable)

```bash
cd mobile
npm run start:stable
```

Este comando limpia cache y arranca Expo en LAN:

- Script: `expo start -c --lan`
- Ideal para evitar problemas de cache/resolucion de host

## 5) Probar en Expo Go

- Escanea el QR que muestra Expo
- Verifica que telefono y PC esten en la misma red Wi-Fi
- Si hay problemas de conexion API:
- revisa `EXPO_PUBLIC_API_URL`
- prueba con IP manual del PC (`http://<IP-LAN-PC>:3000`)

## Scripts utiles (mobile)

- `npm run start`: Expo en LAN
- `npm run start:stable`: Expo LAN + cache limpia (recomendado)
- `npm run start:tunnel`: Expo por tunel
- `npm run android`: abrir en Android
- `npm run ios`: abrir en iOS
- `npm run web`: abrir version web de Expo

## Flujo recomendado diario

1. Iniciar PostgreSQL
2. `backend`: `npm run dev`
3. `frontend`: `npm run dev`
4. `mobile`: `npm run start:stable`
5. Probar en navegador y en Expo Go
