// Importación de módulos principales
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express(); // ← también te faltaba crear la instancia de la app

app.use(cors());
app.use(express.json());

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
