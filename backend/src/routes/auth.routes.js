const express = require("express");
const router = express.Router();

// Controladores
const {
  login,
  registrarEstudiante,
} = require("../controllers/auth.controller");

// Middleware para manejo de archivos
const upload = require("../middlewares/upload");

// ==============================
// Rutas de autenticación
// ==============================

// Inicio de sesión de usuario
// POST /api/login
router.post("/login", login);

// Registro de nuevo estudiante con archivo de matrícula
// POST /api/registro
router.post("/registro", upload.single("archivo"), registrarEstudiante);

module.exports = router;
