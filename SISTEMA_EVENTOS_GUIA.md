# 📚 Sistema de Gestión de Eventos/Cursos - Guía de Usuario

## 🎯 Funcionalidades Implementadas

### ✅ **Formulario Completo de Eventos**
- **Campos Básicos**: Nombre, Descripción, Tipo, Fechas, Duración
- **Campos de Curso**: Nota mínima, Asistencia mínima (solo para tipo "CURSO")
- **Campos Adicionales**: Requisitos, Modalidad, Público objetivo
- **Subida de Imagen**: Portada del evento con preview
- **Validación**: Formulario con validación en tiempo real
- **Carreras**: Asociación con carreras académicas

### ✅ **Panel de Administración**
- **Vista de Gestión**: `/admin/eventos` - Lista todos los eventos
- **Crear Evento**: `/admin/eventos/crear` - Formulario de creación
- **Editar Evento**: `/admin/eventos/editar/:id` - Formulario de edición
- **Ver Inscripciones**: Por cada evento individual
- **Eliminar Eventos**: Con confirmación

### ✅ **Visualización Mejorada**
- **Tarjetas de Eventos**: Con imágenes de portada
- **Información Completa**: Descripción, modalidad, público objetivo
- **Estados Visuales**: Activo/Finalizado, Pagado/Gratuito
- **Responsive Design**: Se adapta a diferentes pantallas

## 🚀 Cómo Usar el Sistema

### **Para Administradores:**

1. **Acceso al Panel**
   - Iniciar sesión como ADMIN
   - Navegar a `/admin` o usar el menú superior

2. **Crear un Evento**
   - Ir a "Crear evento" desde el panel o navbar
   - Llenar el formulario completo:
     - **Información básica**: Nombre, descripción, tipo
     - **Fechas**: Inicio y fin del evento
     - **Duración**: En horas
     - **Modalidad**: Presencial, Virtual, Híbrida
     - **Público objetivo**: A quién está dirigido
     - **Imagen**: Subir portada (opcional)
     - **Para Cursos**: Nota mínima y asistencia mínima

3. **Gestionar Eventos Existentes**
   - Ir a "Gestionar eventos"
   - **Editar**: Clic en el botón "Editar" de cualquier evento
   - **Ver Inscritos**: Clic en "Ver inscritos"
   - **Eliminar**: Clic en "Eliminar" (con confirmación)

4. **Validar Inscripciones**
   - Acceder desde el panel de admin
   - Revisar comprobantes subidos
   - Aceptar/Rechazar inscripciones
   - Para cursos: Finalizar con nota y asistencia

### **Para Estudiantes:**

1. **Ver Eventos Disponibles**
   - Ir a `/eventos`
   - Ver tarjetas con información completa e imágenes
   - Usar el buscador para filtrar eventos

2. **Inscribirse a un Evento**
   - Clic en "Inscribirme" en la tarjeta del evento
   - Subir comprobante de pago (PDF o imagen)
   - Esperar validación del administrador

## 🛠️ Aspectos Técnicos

### **Backend:**
- **Controller**: `evento.controller.js` - Manejo completo de CRUD
- **Routes**: `evento.routes.js` - Rutas con middleware de upload
- **Upload**: Middleware multer para imágenes en `/uploads`
- **Validación**: Campos obligatorios y tipos de archivo
- **Base de datos**: Nuevos campos en modelo `evento`

### **Frontend:**
- **Componente**: `EventForm.jsx` - Formulario reutilizable
- **Vistas**: `CreateEvent.jsx`, `EditEvent.jsx`
- **Rutas**: Integradas en `App.jsx`
- **Estilos**: `EventForm.css` con diseño moderno
- **API**: Configurada para subida de archivos

### **Nuevos Campos en Base de Datos:**
```sql
- requisitos: String? (Texto libre)
- modalidad: String? (Presencial, Virtual, Híbrida)
- publico_objetivo: String? (Texto libre)
- imagen_portada: String? (Nombre del archivo)
```

## 🎨 Características del Diseño

### **Interfaz Moderna:**
- **Colores**: Esquema visual consistente
- **Animaciones**: Transiciones suaves
- **Icons**: Lucide React para iconografía
- **Responsive**: Mobile-first design
- **Toast**: Notificaciones de retroalimentación

### **UX Mejorada:**
- **Validación en Tiempo Real**: Feedback inmediato
- **Preview de Imágenes**: Vista previa antes de subir
- **Campos Condicionales**: Solo aparecen cuando es necesario
- **Estados Visuales**: Indicadores claros de estado
- **Drag & Drop**: Para subida de archivos

## 📋 Flujo de Trabajo

### **Creación de Evento:**
1. Admin accede al formulario de creación
2. Llena información básica y específica del tipo
3. Sube imagen de portada (opcional)
4. Sistema valida y guarda
5. Evento aparece en listado público

### **Inscripción de Estudiante:**
1. Estudiante ve evento en la lista
2. Hace clic en "Inscribirme"
3. Sube comprobante de pago
4. Admin valida la inscripción
5. Estudiante puede generar certificado al finalizar (si es curso)

### **Finalización de Curso:**
1. Admin accede a inscripciones del evento
2. Ingresa nota y porcentaje de asistencia
3. Sistema valida requisitos mínimos
4. Cambia estado a "FINALIZADA"
5. Habilita generación de certificado

## 🔧 Configuración de Desarrollo

### **Variables de Entorno:**
```env
# Frontend (.env)
VITE_API_URL=http://localhost:3000

# Backend (.env)
PORT_BACKEND=3000
DATABASE_URL="postgresql://..."
```

### **Comandos Útiles:**
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev

# Base de datos
npx prisma studio
npx prisma db push
```

## 🚨 Puntos Importantes

1. **Imágenes**: Se guardan en `/backend/uploads` y son servidas públicamente
2. **Validación**: Tipos CURSO requieren nota_min_eve y por_asist_eve
3. **Permisos**: Solo administradores pueden crear/editar eventos
4. **Archivos**: Máximo 5MB para imágenes (JPG, PNG) y PDFs
5. **Responsive**: El sistema funciona en móviles y escritorio

## 🎉 ¡Sistema Listo!

El sistema de gestión de eventos/cursos está completamente implementado y funcionando. Los administradores pueden crear eventos completos con toda la información necesaria, y los estudiantes pueden inscribirse y ver toda la información de manera atractiva y organizada.

**¡El flujo completo desde creación hasta certificación está operativo!**
