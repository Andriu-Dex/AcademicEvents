// ============================
//  Importación de módulos
// ============================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ============================
//  Configuración inicial
// ============================
dotenv.config(); // Cargar variables de entorno desde .env

const app = express(); // Crear instancia de la aplicación

// ============================
//  Middlewares globales
// ============================
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Habilita el parseo de JSON en las peticiones

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
app.use("/api/admin", inscripcionRoutes);

// Rutas de gestión de carreras
const carreraRoutes = require("./routes/carrera.routes");
app.use("/api/carreras", carreraRoutes);

// Rutas de gestión de configuraciones
app.use("/api/configuracion", require("./routes/configuracion.routes"));

// ============================
//  Iniciar el servidor
// ============================
const PORT = process.env.PORT_BACKEND || 3000;

app.listen(PORT, () => {
  console.log(`✅Servidor corriendo en puerto ${PORT}✅`);
});
