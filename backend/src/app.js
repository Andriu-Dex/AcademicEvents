const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

import carreraRoutes from './routes/carrera.routes.js';

dotenv.config();

const app = express(); // ← también te faltaba crear la instancia de la app

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API AcademicEvents funcionando");
});

// Rutas
app.use('/api', carreraRoutes);  // ← Aquí se registran

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
