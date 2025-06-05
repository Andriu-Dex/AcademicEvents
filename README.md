# AcademicEvents

Sistema de gestión de eventos académicos para la Facultad de Ingeniería en Sistemas, Electrónica e Industrial.

## Configuración del Proyecto

### Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL
- npm o yarn

### Instalación del Backend

1. Navega al directorio del backend:

   ```bash
   cd backend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno:

   - Copia el archivo `.env.example` a `.env`
   - Edita el archivo `.env` con tus configuraciones específicas

   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Linux/macOS
   cp .env.example .env
   ```

4. Configura la base de datos:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

### Instalación del Frontend

1. Navega al directorio del frontend:

   ```bash
   cd frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno:

   - Copia el archivo `.env.example` a `.env`
   - Edita el archivo `.env` con tus configuraciones específicas, especialmente la IP del servidor

   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Linux/macOS
   cp .env.example .env
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Acceso para Desarrollo en Red Local

Para permitir que otros dispositivos en tu red local accedan a la aplicación:

1. Edita el archivo `.env` en el directorio frontend:

   - Establece `VITE_HOST` con la IP de tu máquina en la red local
   - Establece `VITE_API_URL` con la misma IP y el puerto del backend

2. Edita el archivo `.env` en el directorio backend:

   - Establece `HOST` con la IP de tu máquina en la red local

3. Inicia ambos servidores como se describió anteriormente.

4. Otros dispositivos en la misma red pueden acceder al frontend usando:
   ```
   http://tu_ip_local:5173
   ```

## Características

- Gestión de eventos académicos
- Inscripción a eventos
- Emisión y verificación de certificados
- Panel de administración
- Perfil de usuario personalizado

## Licencia

Este proyecto está licenciado bajo [Licencia MIT](LICENSE).
