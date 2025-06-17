// Importamos Express
const express = require("express");

// Creamos una instancia de router de Express para manejar rutas por separado
const router = express.Router();

// Importamos los controladores que manejan la lógica para cada ruta
const {
  obtenerEstadisticasHome,
} = require("../controllers/estadisticas.controller");

// ================================
// RUTAS PARA ESTADÍSTICAS
// ================================

// Ruta GET para obtener estadísticas del home (pública, no requiere autenticación)
router.get("/home", obtenerEstadisticasHome);

// Exportamos el router para usarlo en el archivo principal (app.js)
module.exports = router;
