// ============================
//  Importación de módulos
// ============================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { scheduledCleanup } = require("./services/cleanupService");
const { setupDirectories } = require("./utils/directory.utils");
const socketService = require("./services/socket.service");

// ============================
//  Configuración inicial
// ============================
dotenv.config(); // Cargar variables de entorno desde .env

const app = express(); // Crear instancia de la aplicación
const server = http.createServer(app); // Crear servidor HTTP

// Configurar Socket.IO con CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Inicializar el servicio de Socket.IO
socketService.init(io);

// Iniciar el servicio de limpieza programada
scheduledCleanup();

// Configurar directorios necesarios
setupDirectories();

// ============================
//  Middlewares globales
// ============================
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Habilita el parseo de JSON en las peticiones

// Middleware de logging de todas las peticiones
app.use((req, res, next) => {
  console.log(
    `📥 [REQUEST] ${req.method} ${req.url} - ${new Date().toISOString()}`
  );
  console.log(`📥 [REQUEST] Original URL: ${req.originalUrl}`);
  console.log(`📥 [REQUEST] Base URL: ${req.baseUrl}`);
  console.log(`📥 [REQUEST] Path: ${req.path}`);
  console.log(`📥 [REQUEST] Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📥 [REQUEST] Body:`, req.body);
  }
  next();
});

// Servir archivos subidos (comprobantes, PDF, etc.)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================
//  Rutas de la aplicación
// ============================

// Ruta de prueba para verificar funcionamiento del backend
app.get("/", (req, res) => {
  res.send("API AcademicEvents funcionando");
});

// Rutas no protegidas
const authRoutes = require("./routes/auth.routes");
app.use("/api", authRoutes);

// Rutas de recuperación de contraseña
console.log("🔧 [APP] Registrando rutas de recuperación de contraseña...");

// Middleware específico para debugging de rutas de recuperación
app.use("/api/password-recovery", (req, res, next) => {
  console.log("🎯 [DEBUG] Petición interceptada en /api/password-recovery");
  console.log("🎯 [DEBUG] Método:", req.method);
  console.log("🎯 [DEBUG] URL completa:", req.originalUrl);
  console.log("🎯 [DEBUG] Path específico:", req.path);
  next();
});

const passwordRecoveryRoutes = require("./routes/password-recovery.routes");
app.use("/api/password-recovery", passwordRecoveryRoutes);
console.log(
  "✅ [APP] Rutas de recuperación de contraseña registradas en /api/password-recovery"
);

// Rutas de verificación de correo
const verificationRoutes = require("./routes/verification.routes");
app.use("/api/verificacion", verificationRoutes);

// Rutas de corrección de correo
const emailCorrectionRoutes = require("./routes/email-correction.routes");
app.use("/api/cuenta", emailCorrectionRoutes);

const comprobanteRoutes = require("./routes/comprobante.routes");
app.use("/api", comprobanteRoutes);

// Rutas protegidas (requieren autenticación)
const protectedRoutes = require("./routes/protected.routes");
app.use("/api", protectedRoutes);

// Rutas de gestión de eventos
const eventoRoutes = require("./routes/evento.routes");
app.use("/api", eventoRoutes);

// Rutas para generación y descarga de certificados
const certificadoRoutes = require("./routes/certificado.routes");
app.use("/api", certificadoRoutes);

// Rutas de gestión de usuarios (solo admins)
const adminRoutes = require("./routes/admin.routes");
app.use("/api/admin", adminRoutes);

// Rutas de gestión de inscripciones para eventos (solo admins)
const inscripcionRoutes = require("./routes/inscripcion.routes");
app.use("/api/inscripciones", inscripcionRoutes);

// Rutas de gestión de carreras
const carreraRoutes = require("./routes/carrera.routes");
app.use("/api", carreraRoutes);

// Rutas de gestión de facultades
const facultadRoutes = require("./routes/facultad.routes");
app.use("/api", facultadRoutes);

// Rutas de gestión de coordinadores
const coordinadorRoutes = require("./routes/coordinador.routes");
app.use("/api", coordinadorRoutes);

// Rutas de gestión de MVA (Misión, Visión, Autoridades)
app.use("/api/mva", require("./routes/mva.routes"));

// Rutas de estadísticas
const estadisticasRoutes = require("./routes/estadisticas.routes");
app.use("/api/estadisticas", estadisticasRoutes);

// Rutas de perfil de usuario
const perfilRoutes = require("./routes/perfil.routes");
app.use("/api", perfilRoutes);

// Rutas de subida de imágenes
const uploadRoutes = require("./routes/upload.routes-mva");
app.use("/api/upload", uploadRoutes);

// Rutas de reportes (solo admins)
const reporteRoutes = require("./routes/reporte.routes");
app.use("/api/admin", reporteRoutes);

// ============================
//  Iniciar el servidor
// ============================
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT_BACKEND || 3000;

server.listen(PORT, HOST, () => {
  console.log(`✅ Servidor corriendo en http://${HOST}:${PORT} ✅`);
  console.log(`🔌 Socket.IO configurado y funcionando`);
});

// Exportar socketService para uso en otros módulos
module.exports = { app, server, io, socketService };
