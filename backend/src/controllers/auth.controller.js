const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

// ===============================
// Login de estudiante
// ===============================
const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const user = await prisma.usuario.findUnique({
      where: { cor_usu: correo },
    });

    if (!user || !["ESTUDIANTE", "ADMIN"].includes(user.rol_usu)) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    const passwordValid = await bcrypt.compare(contrasena, user.con_usu);

    if (!passwordValid) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      // { id: user.id_usu, rol: user.rol_usu },
      { id: user.id_usu, rol_usu: user.rol_usu },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      token,
      usuario: {
        id: user.id_usu,
        correo: user.cor_usu,
        rol_usu: user.rol_usu,
      },
    });
  } catch (error) {
    return res.status(500).json({ msg: "Error interno", error: error.message });
  }
};

// ==========================================
// Registrar nuevo estudiante
// ==========================================
const registrarEstudiante = async (req, res) => {
  try {
    const { ced_usu, nom_usu, ape_usu, cor_usu, con_usu, cel_usu, carrera } =
      req.body;

    const archivo = req.file;

    // Validación de campos obligatorios
    if (!archivo) {
      return res.status(400).json({ msg: "Debes subir un archivo válido" });
    }

    // Si es correo institucional, carrera es obligatoria
    const esUTA = cor_usu.endsWith("@uta.edu.ec");

    if (esUTA && !carrera) {
      return res.status(400).json({ msg: "Debe seleccionar una carrera" });
    }

    // Validación de contraseña segura
    if (con_usu.length < 6) {
      return res
        .status(400)
        .json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validación de celular
    if (!/^\d{10}$/.test(cel_usu)) {
      return res
        .status(400)
        .json({ msg: "El número de celular debe tener 10 dígitos" });
    }

    // Validar duplicados
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ cor_usu }, { ced_usu }],
      },
    });

    if (usuarioExistente) {
      return res
        .status(400)
        .json({ msg: "Ya existe un usuario con este correo o cédula" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(con_usu, 10);

    // Crear el nuevo usuario con comprobante y carrera
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        ced_usu,
        nom_usu,
        ape_usu,
        cor_usu,
        con_usu: hashedPassword,
        cel_usu,
        rol_usu: "ESTUDIANTE",
        comprobante: archivo.filename, // ← se guarda el nombre del archivo
        carrera, // ← se guarda como texto plano
      },
    });

    return res.status(201).json({
      msg: "Usuario creado exitosamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error("Error en registrarEstudiante:", error);
    res
      .status(500)
      .json({ msg: "Error al registrar usuario", error: error.message });
  }
};

module.exports = {
  login,
  registrarEstudiante,
};
