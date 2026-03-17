const express = require("express");
const router = express.Router();

// Controladores
const {
  login,
  registrarEstudiante,
} = require("../controllers/auth.controller");

// Middleware para manejo de archivos
const { upload } = require("../middlewares/upload");

const uploadRegisterFiles = upload.fields([
  { name: "archivo", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

const normalizeRegisterFile = (req, res, next) => {
  const archivoFile = req.files?.archivo?.[0];
  const genericFile = req.files?.file?.[0];
  if (!req.file && (archivoFile || genericFile)) {
    req.file = archivoFile || genericFile;
  }
  next();
};

// ==============================
// Rutas de autenticación
// ==============================

// Inicio de sesión de usuario
// POST /api/login
router.post("/login", login);

// Alias en ingles para iniciar sesion
// POST /api/auth/login
router.post("/auth/login", login);

// Registro de nuevo estudiante con archivo de matrícula
// POST /api/registro
router.post("/registro", upload.single("archivo"), registrarEstudiante);

// Alias en ingles para registro
// POST /api/auth/register
router.post(
  "/auth/register",
  uploadRegisterFiles,
  normalizeRegisterFile,
  registrarEstudiante
);

module.exports = router;
