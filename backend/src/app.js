// ============================
//  Importación de módulos
// ============================
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { scheduledCleanup } = require("./services/cleanupService");
const { setupDirectories } = require("./utils/directory.utils");
const socketService = require("./services/socket.service");
const eventStatusService = require("./services/eventStatusService");
const { apiLimiter, authLimiter } = require("./middlewares/rateLimit");

// ============================
//  Configuración inicial
// ============================
dotenv.config(); // Cargar variables de entorno desde .env

const app = express(); // Crear instancia de la aplicación
const server = http.createServer(app); // Crear servidor HTTP

// Configurar Socket.IO con CORS
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost",
      "http://frontend",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Inicializar el servicio de Socket.IO
socketService.init(io);

// Iniciar el servicio de limpieza programada
scheduledCleanup();

// Iniciar el servicio de estados automáticos de eventos
eventStatusService.inicializarServicio();

// Configurar directorios necesarios
setupDirectories();

// ============================
//  Middlewares globales
// ============================
app.use(
  helmet({
    // Uploads e imágenes se consumen desde otro origen (frontend).
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost",
      "http://frontend",
    ],
    credentials: true,
  })
); // Habilita CORS para todas las rutas
app.use(express.json()); // Habilita el parseo de JSON en las peticiones
app.use("/api", apiLimiter); // Limita tráfico general para evitar abuso

// Servir archivos subidos (comprobantes, PDF, etc.)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware para manejo de tenants (multi-tenancy)
const { tenantMiddleware } = require("./middlewares/tenant");
app.use("/api", tenantMiddleware); // Aplicar a todas las rutas API

// ============================
//  Rutas de la aplicación
// ============================

// Health check endpoint para Docker y monitoreo
app.get("/health", async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await require("./config/db").testConnection();

    // Obtener versión de forma segura
    let version = "1.0.0";
    try {
      // Primero intentar la ruta relativa normal
      version = require("../package.json").version || "1.0.0";
    } catch (packageError) {
      console.log(
        "⚠️ [HEALTH] No se pudo leer package.json desde ruta relativa, usando versión por defecto"
      );
      // En caso de error, usar versión por defecto sin intentar otras rutas
    }

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: version,
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("❌ [HEALTH] Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Database connection failed",
    });
  }
});

// Ruta de prueba para verificar funcionamiento del backend
app.get("/", (req, res) => {
  res.send("API AcademicEvents funcionando");
});

// Rutas no protegidas
const authRoutes = require("./routes/auth.routes");
app.use("/api/login", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/registro", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", authRoutes);

// Rutas de perfil de usuario
const perfilRoutes = require("./routes/perfil.routes");
app.use("/api", perfilRoutes);
console.log("✅ Rutas de perfil registradas en /api");

// Rutas de gestión de usuarios (solo admins)
const adminRoutes = require("./routes/admin.routes");
app.use("/api/admin", adminRoutes);

// Rutas de recuperación de contraseña
const passwordRecoveryRoutes = require("./routes/password-recovery.routes");
app.use("/api/password-recovery", authLimiter, passwordRecoveryRoutes);

// Rutas de verificación de correo
const verificationRoutes = require("./routes/verification.routes");
app.use("/api/verificacion", authLimiter, verificationRoutes);

// Rutas de corrección de correo
const emailCorrectionRoutes = require("./routes/email-correction.routes");
app.use("/api/cuenta", authLimiter, emailCorrectionRoutes);

const comprobanteRoutes = require("./routes/comprobante.routes");
app.use("/api", comprobanteRoutes);

// Rutas protegidas (requieren autenticación)
const protectedRoutes = require("./routes/protected.routes");
app.use("/api", protectedRoutes);

// Rutas de gestión de eventos
const eventoRoutes = require("./routes/evento.routes");
app.use("/api", eventoRoutes);

// Rutas de gestión de facultades
const facultadRoutes = require("./routes/facultad.routes");
app.use("/api", facultadRoutes);

// Rutas para generación y descarga de certificados
const certificadoRoutes = require("./routes/certificado.routes");
app.use("/api", certificadoRoutes);

// Rutas de gestión de carreras
const carreraRoutes = require("./routes/carrera.routes");
app.use("/api", carreraRoutes);

// Rutas de gestión de coordinadores
const coordinadorRoutes = require("./routes/coordinador.routes");
app.use("/api", coordinadorRoutes);

// Rutas de gestión de MVA (Misión, Visión, Autoridades)
app.use("/api/mva", require("./routes/mva.routes"));

// Rutas de gestión de la universidad
const universidadRoutes = require("./routes/universidad.routes");
app.use("/api", universidadRoutes);

// Rutas de estadísticas
const estadisticasRoutes = require("./routes/estadisticas.routes");
app.use("/api/estadisticas", estadisticasRoutes);

// Rutas de subida de imágenes
const uploadRoutes = require("./routes/upload-mva.routes");
app.use("/api/upload", uploadRoutes);

// Rutas de reportes (solo admins)
const reporteRoutes = require("./routes/reporte.routes");
app.use("/api/admin", reporteRoutes);

// Rutas de reportes de ingresos (solo admins) - Canonical & Legacy
const reporteIngresosRoutes = require("./routes/reporte-ingresos.routes");
app.use("/api/admin/reports/revenue", reporteIngresosRoutes); // Canonical (English)
app.use("/api/admin/reportes-ingresos", reporteIngresosRoutes); // Legacy (Spanish)

// Rutas de paginación
const paginacionRoutes = require("./routes/paginacion.routes");
app.use("/api", paginacionRoutes);

// Rutas de gestión de inscripciones para eventos (solo admins)
const inscripcionRoutes = require("./routes/inscripcion.routes");
app.use("/api/inscripciones", inscripcionRoutes);

// Rutas de gestión de tokens de notificaciones push
const pushTokenRoutes = require("./routes/pushToken.routes");
app.use("/api", pushTokenRoutes);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
  console.log(`❌ [404] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Ruta no encontrada",
    method: req.method,
    url: req.originalUrl,
  });
});

// ============================
//  Iniciar el servidor
// ============================
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `❌ Puerto en uso: ${HOST}:${PORT}. Cierra la instancia anterior antes de reiniciar.`
    );
    console.error(
      "💡 Sugerencia (PowerShell): Get-Process node | Stop-Process -Force"
    );
    process.exit(1);
  }

  console.error("❌ Error al iniciar servidor:", error);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Servidor corriendo en http://${HOST}:${PORT} ✅`);
  console.log(`🔌 Socket.IO configurado y funcionando`);
});

// Exportar socketService para uso en otros módulos
module.exports = { app, server, io, socketService };
