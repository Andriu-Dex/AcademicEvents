// Importamos Express
const express = require("express");

// Creamos una instancia de router de Express para manejar rutas por separado
const router = express.Router();

// Importamos los controladores que manejan la lógica para cada ruta
const {
  obtenerFacultades,
  obtenerFacultad,
  obtenerPrimeraFacultad,
  actualizarDatosFacultad,
  crearFacultad,
} = require("../controllers/facultad.controller");

// ================================
// RUTAS PARA GESTIÓN DE FACULTADES
// ================================

// Ruta GET para obtener todas las facultades
router.get("/facultades", obtenerFacultades);

// Ruta GET para obtener la primera facultad (la más antigua)
router.get("/facultad-principal", obtenerPrimeraFacultad);

// Ruta GET para obtener una facultad específica por su ID
router.get("/facultades/:id", obtenerFacultad);

// Ruta PUT para actualizar datos básicos de una facultad
router.put("/facultades/:id/datos-basicos", actualizarDatosFacultad);

// Ruta POST para crear una nueva facultad
router.post("/facultades", crearFacultad);

// Exportamos el router para usarlo en el archivo principal (app.js o server.js)
module.exports = router;
