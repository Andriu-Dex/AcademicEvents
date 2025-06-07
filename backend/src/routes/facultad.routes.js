// Importamos Express
const express = require("express");

// Creamos una instancia de router de Express para manejar rutas por separado
const router = express.Router();

// Importamos los controladores que manejan la lógica para cada ruta
const {
  obtenerFacultades,
  obtenerFacultad,
  crearFacultad,
  actualizarFacultad, // Importamos la nueva función para actualizar misión y visión
} = require("../controllers/facultad.controller");

// ================================
// RUTAS PARA GESTIÓN DE FACULTADES
// ================================

// Ruta GET para obtener todas las facultades
router.get("/facultades", obtenerFacultades);

// Ruta GET para obtener una facultad específica por su ID
router.get("/facultades/:id", obtenerFacultad);

// Ruta POST para crear una nueva facultad
router.post("/facultades", crearFacultad);

// Ruta PUT para actualizar misión y visión de una facultad (solo ADMIN)
router.put("/facultades/:id", actualizarFacultad); // Nueva ruta para actualizar misión y visión

// Exportamos el router para usarlo en el archivo principal (app.js o server.js)
module.exports = router;
