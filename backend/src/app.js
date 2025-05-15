const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express(); // ← también te faltaba crear la instancia de la app

const authRoutes = require("./routes/auth.routes");

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.send("API AcademicEvents funcionando");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
