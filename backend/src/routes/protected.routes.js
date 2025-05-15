const express = require("express");
const router = express.Router();

// Middleware que verifica el token JWT
const verificarToken = require("../middlewares/auth");

/**
 * Ruta protegida por token
 * Retorna los datos decodificados del usuario si el token es válido
 */
router.get("/privado", verificarToken, (req, res) => {
  res.json({
    msg: "✅ Acceso permitido",
    usuario: req.usuario, // Este valor viene del payload decodificado del token
  });
});

module.exports = router;
