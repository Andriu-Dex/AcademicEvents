const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Importar rutas
const carreraRoutes = require("./routes/carrera.routes"); // ← ruta al archivo de rutas

dotenv.config();

const app = express(); // ← también te faltaba crear la instancia de la app

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API AcademicEvents funcionando");
});

// Rutas API
app.use("/api", carreraRoutes); // ← aquí se monta el router de carreras

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
