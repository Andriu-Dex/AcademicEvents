// Importación de módulos principales
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Configuración inicial
dotenv.config();

// Crear instancia de la aplicación Express
const app = express();

// Importar rutas de autenticación
const authRoutes = require("./routes/auth.routes");

// Aplicar middlewares globales
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Habilita parseo de JSON en las peticiones

// Montar rutas bajo /api
app.use("/api", authRoutes);

// Ruta base para verificar que el backend funciona
app.get("/", (req, res) => {
  res.send("API AcademicEvents funcionando");
});

// Importación de rutas protegidas
const protectedRoutes = require("./routes/protected.routes");
app.use("/api", protectedRoutes); // Monta las rutas protegidas bajo /api

// Puerto de escucha
const PORT = process.env.PORT_BACKEND || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
