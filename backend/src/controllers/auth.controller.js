const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const TokenService = require("../services/TokenService");
const EmailTemplateService = require("../services/EmailTemplateService");
const EmailVerificationService = require("../services/EmailVerificationService");
const accountBlockService = require("../services/accountBlock.service");

// Instanciar servicios
const tokenService = new TokenService();
const emailTemplateService = new EmailTemplateService();
const emailVerificationService = new EmailVerificationService(
  tokenService,
  emailTemplateService
);

const ROLE_TO_LEGACY = {
  GLOBAL_ADMIN: "ADMIN_GLOBAL",
  GENERAL_ADMIN: "ADMIN_GENERAL",
  STUDENT: "ESTUDIANTE",
  GENERAL: "GENERAL",
};

const readFirstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null);

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : value;

// ===============================
// Login de estudiante
// ===============================
const login = async (req, res) => {
  const correo = normalizeEmail(
    readFirstDefined(req.body?.correo, req.body?.email)
  );
  const contrasena = readFirstDefined(req.body?.contrasena, req.body?.password);

  if (!correo || !contrasena) {
    return res.status(400).json({
      msg: "Correo y contrasena son obligatorios",
      error: "MISSING_FIELDS",
    });
  }

  try {
    // Buscar cuenta usando el índice compuesto tenantId_email
    const account = await prisma.account.findUnique({
      where: {
        tenantId_email: {
          tenantId: req.tenantId,
          email: correo,
        },
      },
      include: {
        user: true,
      },
    });

    if (
      !account ||
      !["STUDENT", "GLOBAL_ADMIN", "GENERAL_ADMIN", "GENERAL"].includes(
        account.role
      )
    ) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    const activeBlock = await accountBlockService.getActiveBlock(
      req.tenantId,
      account.id
    );

    if (activeBlock) {
      return res.status(403).json({
        msg: "Tu cuenta se encuentra bloqueada por un administrador",
        error: "ACCOUNT_BLOCKED",
        motivo: activeBlock.blockedReason,
        bloqueadoEn: activeBlock.blockedAt,
      });
    }

    // Verificar si la cuenta está verificada
    if (!account.isEmailVerified) {
      return res.status(403).json({
        msg: "Debes verificar tu correo antes de iniciar sesión",
        requireVerification: true,
        email: account.email,
      });
    }

    const passwordValid = await bcrypt.compare(contrasena, account.password);

    if (!passwordValid) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    const legacyRole = ROLE_TO_LEGACY[account.role] || account.role;

    const token = jwt.sign(
      {
        id: account.id,
        role: account.role,
        rol_usu: legacyRole,
        tenantId: account.tenantId,
        tenantSlug: req.tenantSlug,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    return res.status(200).json({
      token,
      usuario: {
        id: account.id,
        correo: account.email,
        rol_usu: legacyRole,
        nom_usu: account.user.firstName,
        ape_usu: account.user.lastName,
        img_per_usu: account.user.profileImageUrl,
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
    const ced_usu = normalizeText(
      readFirstDefined(req.body?.ced_usu, req.body?.idNumber)
    );
    const nom_usu = normalizeText(
      readFirstDefined(req.body?.nom_usu, req.body?.firstName)
    );
    const ape_usu = normalizeText(
      readFirstDefined(req.body?.ape_usu, req.body?.lastName)
    );
    const cor_usu = normalizeEmail(
      readFirstDefined(req.body?.cor_usu, req.body?.email)
    );
    const con_usu = readFirstDefined(req.body?.con_usu, req.body?.password);
    const cel_usu = normalizeText(
      readFirstDefined(req.body?.cel_usu, req.body?.phone)
    );
    const id_car_est = normalizeText(
      readFirstDefined(req.body?.id_car_est, req.body?.careerId)
    );

    if (!ced_usu || !nom_usu || !ape_usu || !cor_usu || !con_usu || !cel_usu) {
      return res.status(400).json({
        msg: "Todos los campos obligatorios deben enviarse",
        error: "MISSING_FIELDS",
      });
    }

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
    const accountExists = await prisma.account.findUnique({
      where: {
        tenantId_email: {
          tenantId: req.tenantId,
          email: cor_usu,
        },
      },
    });

    if (accountExists) {
      return res
        .status(400)
        .json({ msg: "Ya existe una cuenta con este correo electrónico" });
    }

    // Validar si ya existe un usuario con esa cédula
    const userExists = await prisma.user.findUnique({
      where: {
        tenantId_idNumber: {
          tenantId: req.tenantId,
          idNumber: ced_usu,
        },
      },
    });

    if (userExists) {
      return res
        .status(400)
        .json({ msg: "Ya existe un usuario con esta cédula" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(con_usu, 10);

    // Determinar el rol según el tipo de correo
    const rol = esUTA ? "STUDENT" : "GENERAL";

    // Obtener IP del cliente
    const ip = req.ip || req.connection.remoteAddress;
    const requestBaseUrl = `${req.protocol}://${req.get("host")}`;

    // Crear el usuario y la cuenta en una transacción
    const resultado = await prisma.$transaction(async (prisma) => {
      // 1. Crear el usuario
      const newUser = await prisma.user.create({
        data: {
          tenantId: req.tenantId,
          idNumber: ced_usu,
          firstName: nom_usu,
          lastName: ape_usu,
          phone: cel_usu,
          careerId: id_car_est || null, // la FK de carrera (puede ser null si no es institucional)
        },
      });

      // 2. Crear la cuenta asociada al usuario
      const newAccount = await prisma.account.create({
        data: {
          tenantId: req.tenantId,
          userId: newUser.id,
          email: cor_usu,
          password: hashedPassword,
          role: rol, // Asignar el rol según el tipo de correo
          // isEmailVerified ya es false por defecto
        },
      });

      return { usuario: newUser, cuenta: newAccount };
    });

    // 3. Enviar correo de verificación
    await emailVerificationService.enviarVerificacion(
      {
        ...resultado.cuenta,
        user: resultado.usuario,
      },
      ip,
      requestBaseUrl
    );

    return res.status(201).json({
      msg: "Cuenta creada. Revisa tu correo para activarla",
      requireVerification: true,
      email: resultado.cuenta.email,
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
  register: registrarEstudiante,
};
