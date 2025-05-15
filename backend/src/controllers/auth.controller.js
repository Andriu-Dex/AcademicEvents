const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const user = await prisma.usuario.findUnique({ where: { correo } });
    if (!user || user.tipo !== "ESTUDIANTE") {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    const passwordValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordValid) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id, rol: user.tipo }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.status(200).json({ token, usuario: { id: user.id, correo: user.correo, rol: user.tipo } });
  } catch (error) {
    return res.status(500).json({ msg: "Error interno", error });
  }
};

module.exports = { login };
