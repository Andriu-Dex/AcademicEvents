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
app.use(express.json()); // Habilita el parseo de JSON en peticiones

// Servir archivos subidos (por ejemplo, comprobantes, documentos PDF, etc.)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================
// 🧩 Rutas de la aplicación
// ============================

// Ruta pública para verificar funcionamiento del backend
app.get("/", (req, res) => {
  res.send("API AcademicEvents funcionando");
});

// Rutas no protegidas
const authRoutes = require("./routes/auth.routes");
app.use("/api", authRoutes);

const comprobanteRoutes = require("./routes/comprobante.routes");
app.use("/api", comprobanteRoutes);

// Rutas protegidas (requieren autenticación, como acceso a datos internos)
const protectedRoutes = require("./routes/protected.routes");
app.use("/api", protectedRoutes);

// ============================
//  Iniciar el servidor
// ============================
const PORT = process.env.PORT_BACKEND || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});