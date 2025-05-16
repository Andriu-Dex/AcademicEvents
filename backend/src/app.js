const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Configuración inicial
dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", require("./routes/carrera.routes"));
app.use("/api", require("./routes/auth.routes"));

// Verificación
app.get("/", (req, res) => {
  res.send("API AcademicEvents funcionando");
});

// Puerto
const PORT = process.env.PORT_BACKEND || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
