// Importamos Express
const express = require("express");

// Creamos una instancia de router de Express para manejar rutas por separado
const router = express.Router();

// Importamos los controladores que manejan la lógica para cada ruta
const {
  crearCarrera,
  obtenerCarreras,
  actualizarCarrera,
  eliminarCarrera,
} = require("../controllers/carrera.controller");

// ================================
// RUTAS PARA GESTIÓN DE CARRERAS
// ================================

// Ruta GET para obtener todas las carreras
router.get("/carreras", obtenerCarreras);

// Ruta POST para crear una nueva carrera
router.post("/carreras", crearCarrera);

// Ruta PUT para actualizar una carrera específica por su ID
router.put("/carreras/:id", actualizarCarrera);

// Ruta DELETE para eliminar una carrera específica por su ID
router.delete("/carreras/:id", eliminarCarrera);

// Exportamos el router para usarlo en el archivo principal (app.js o server.js)
module.exports = router;
