const express = require("express");
const router = express.Router();
const { login } = require("../controllers/auth.controller");

// Ruta para login
router.post("/login", login);

module.exports = router;
