const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Crear instancia de la aplicación Express
const app = express();

const carreraRoutes = require("./routes/carrera.routes");
app.use("/api", carreraRoutes);

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

// Definir el puerto de escucha
const PORT = process.env.PORT_BACKEND || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
