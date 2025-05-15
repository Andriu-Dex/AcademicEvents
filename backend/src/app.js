// Importación de módulos principales
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Carga de variables de entorno desde .env
dotenv.config();

// Instancia principal de la aplicación
const app = express();

// Middlewares globales
app.use(cors()); // Habilita CORS para permitir peticiones externas
app.use(express.json()); // Parsea JSON en los cuerpos de las solicitudes

// Ruta raíz para prueba
app.get("/", (req, res) => {
  res.send("API AcademicEvents funcionando");
});

// Importación de rutas protegidas
const protectedRoutes = require("./routes/protected.routes");
app.use("/api", protectedRoutes); // Monta las rutas protegidas bajo /api

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
