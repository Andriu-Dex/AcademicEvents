const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const TokenService = require("../services/TokenService");
const EmailTemplateService = require("../services/EmailTemplateService");
const EmailVerificationService = require("../services/EmailVerificationService");

// Instanciar servicios
const tokenService = new TokenService();
const emailTemplateService = new EmailTemplateService();
const emailVerificationService = new EmailVerificationService(
  tokenService,
  emailTemplateService
);

// ===============================
// Login de estudiante
// ===============================
const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Ahora el correo está en el modelo cuenta, no en usuario
    const cuenta = await prisma.cuenta.findUnique({
      where: { cor_usu: correo },
      include: {
        usuario: true,
      },
    });

    if (
      !cuenta ||
      !["ESTUDIANTE", "ADMIN_GLOBAL", "ADMIN_GENERAL", "GENERAL"].includes(
        cuenta.rol_usu
      )
    ) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    // Verificar si la cuenta está verificada
    if (!cuenta.est_ver_cor) {
      return res.status(403).json({
        msg: "Debes verificar tu correo antes de iniciar sesión",
        requireVerification: true,
        email: cuenta.cor_usu,
      });
    }

    const passwordValid = await bcrypt.compare(contrasena, cuenta.con_usu);

    if (!passwordValid) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: cuenta.id_cue, rol_usu: cuenta.rol_usu },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    return res.status(200).json({
      token,
      usuario: {
        id: cuenta.id_cue,
        correo: cuenta.cor_usu,
        rol_usu: cuenta.rol_usu,
        nom_usu: cuenta.usuario.nom_usu,
        ape_usu: cuenta.usuario.ape_usu,
        img_per_usu: cuenta.usuario.img_per_usu,
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
    const { ced_usu, nom_usu, ape_usu, cor_usu, con_usu, cel_usu, id_car_est } =
      req.body;

    // Si es correo institucional, carrera es obligatoria
    const esUTA = cor_usu.endsWith("@uta.edu.ec");
    if (esUTA && !id_car_est) {
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

    // Validar si ya existe una cuenta con ese correo
    const cuentaExistente = await prisma.cuenta.findUnique({
      where: { cor_usu },
    });

    if (cuentaExistente) {
      return res
        .status(400)
        .json({ msg: "Ya existe una cuenta con este correo electrónico" });
    }

    // Validar si ya existe un usuario con esa cédula
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { ced_usu },
    });

    if (usuarioExistente) {
      return res
        .status(400)
        .json({ msg: "Ya existe un usuario con esta cédula" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(con_usu, 10);

    // Determinar el rol según el tipo de correo
    const rol = esUTA ? "ESTUDIANTE" : "GENERAL";

    // Obtener IP del cliente
    const ip = req.ip || req.connection.remoteAddress;

    // Crear el usuario y la cuenta en una transacción
    const resultado = await prisma.$transaction(async (prisma) => {
      // 1. Crear el usuario
      const nuevoUsuario = await prisma.usuario.create({
        data: {
          ced_usu,
          nom_usu,
          ape_usu,
          cel_usu,
          id_car_est: id_car_est || null, // la FK de carrera (puede ser null si no es institucional)
        },
      });

      // 2. Crear la cuenta asociada al usuario
      const nuevaCuenta = await prisma.cuenta.create({
        data: {
          id_usu_per: nuevoUsuario.id_usu,
          cor_usu,
          con_usu: hashedPassword,
          rol_usu: rol, // Asignar el rol según el tipo de correo
          // est_ver_cor ya es false por defecto
        },
      });

      return { usuario: nuevoUsuario, cuenta: nuevaCuenta };
    });

    // 3. Enviar correo de verificación
    await emailVerificationService.enviarVerificacion(
      {
        id_cue: resultado.cuenta.id_cue,
        cor_usu: resultado.cuenta.cor_usu,
        usuario: resultado.usuario,
      },
      ip
    );

    return res.status(201).json({
      msg: "Cuenta creada. Revisa tu correo para activarla",
      requireVerification: true,
      email: resultado.cuenta.cor_usu,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res
      .status(500)
      .json({ msg: "Error al registrar usuario", error: error.message });
  }
};

module.exports = {
  login,
  registrarEstudiante,
};
