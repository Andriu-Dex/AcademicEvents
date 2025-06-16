/**
 * Configuración para el servicio de correos electrónicos
 * Contiene configuraciones institucionales, logos y colores
 */

const emailConfig = {
  // Configuración institucional
  universidad: {
    nombre: "Universidad Técnica de Ambato",
    acronimo: "UTA",
    sitioWeb: "https://uta.edu.ec",
  },

  // Colores institucionales UTA
  colores: {
    primary: "#8a1538", // Rojo UTA principal
    secondary: "#5a0d24", // Rojo UTA oscuro
    accent: "#d4af37", // Dorado institucional
    light: "#f8f9fa", // Gris claro
    dark: "#2c2c2c", // Gris oscuro
    gray: "#6c757d", // Gris medio
    success: "#28a745", // Verde éxito
    warning: "#ffc107", // Amarillo advertencia
    danger: "#dc3545", // Rojo peligro
    info: "#17a2b8", // Azul información
  },

  // Configuración de correos
  email: {
    remitente: process.env.SMTP_USER || "noreply@academicevents.uta.edu.ec",
    nombreRemitente: "AcademicEvents UTA",
    tiempoExpiracion: {
      verificacion: 24, // horas
      recuperacion: 2, // horas
      cambioCorreo: 6, // horas
    },
  },

  // Rutas base para enlaces
  rutas: {
    frontend: process.env.FRONTEND_URL || "http://localhost:5173",
    backend: process.env.BACKEND_URL || "http://localhost:3000",
    verificacion: "/verificar-email",
    recuperacion: "/recuperar-password",
    cambioCorreo: "/cambiar-correo",
  },

  // Configuración de plantillas
  plantillas: {
    verificacion: {
      asunto: "Verificación de Correo Electrónico - AcademicEvents UTA",
      icono: "🔐",
      colorPrimario: "#8a1538",
    },
    recuperacion: {
      asunto: "Recuperación de Contraseña - AcademicEvents UTA",
      icono: "🔑",
      colorPrimario: "#dc3545",
    },
    cambioCorreo: {
      asunto: "Confirmación de Cambio de Correo - AcademicEvents UTA",
      icono: "📧",
      colorPrimario: "#17a2b8",
    },
    bienvenida: {
      asunto: "¡Bienvenido a AcademicEvents UTA!",
      icono: "🎉",
      colorPrimario: "#28a745",
    },
  },
  // Configuración de facultades por defecto (backup)
  facultadesDefecto: [
    {
      nom_fac: "Facultad de Ciencias Administrativas",
      acr_fac: "FCAD",
    },
    {
      nom_fac: "Facultad de Contabilidad y Auditoría",
      acr_fac: "FCCA",
    },
    {
      nom_fac: "Facultad de Ingeniería en Sistemas",
      acr_fac: "FISEI",
    },
    // Se pueden agregar más facultades según sea necesario
  ],
  // Configuración de desarrollo/producción
  desarrollo: {
    mostrarTokens: process.env.NODE_ENV === "development",
    logDetallado: process.env.NODE_ENV === "development",
  },
};

module.exports = emailConfig;
