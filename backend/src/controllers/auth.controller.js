const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const user = await prisma.usuario.findUnique({
      where: { cor_usu: correo },
    });
    if (!user || user.rol_usu !== "ESTUDIANTE") {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    const passwordValid = await bcrypt.compare(contrasena, user.con_usu);

    if (!passwordValid) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id_usu, rol: user.rol_usu },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.status(200).json({
      token,
      usuario: {
        id: user.id_usu,
        correo: user.cor_usu,
        rol: user.rol_usu,
      },
    });
  } catch (error) {
    return res.status(500).json({ msg: "Error interno", error });
  }
};

module.exports = { login };
