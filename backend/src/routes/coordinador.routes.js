// Importamos Express
const express = require("express");

// Creamos una instancia de router de Express para manejar rutas por separado
const router = express.Router();

// Importamos los controladores que manejan la lógica para cada ruta
const {
  crearCoordinador,
  obtenerCoordinadores,
  actualizarCoordinador,
  eliminarCoordinador,
} = require("../controllers/coordinador.controller");

// =====================================
// RUTAS PARA GESTIÓN DE COORDINADORES
// =====================================

// Ruta GET para obtener todos los coordinadores
router.get("/coordinadores", obtenerCoordinadores);

// Ruta POST para crear un nuevo coordinador
router.post("/coordinadores", crearCoordinador);

// Ruta PUT para actualizar un coordinador específico por su ID
router.put("/coordinadores/:id", actualizarCoordinador);

// Ruta DELETE para eliminar un coordinador específico por su ID
router.delete("/coordinadores/:id", eliminarCoordinador);

// Exportamos el router para usarlo en el archivo principal (app.js o server.js)
module.exports = router;
