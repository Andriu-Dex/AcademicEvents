const { prisma } = require("../config/db");
const jwt = require("jsonwebtoken");

const buildBackendUrl = (requestBaseUrl) => {
  return (
    requestBaseUrl ||
    process.env.BACKEND_URL ||
    process.env.API_BASE_URL ||
    process.env.PUBLIC_BACKEND_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
};

const isSameCorrectionSelection = (cuenta, correoAnteriorNormalizado, correoNuevoNormalizado, carreraNuevaNormalizada) => {
  const carreraActual = cuenta?.user?.careerId ? String(cuenta.user.careerId).trim() : "";
  return correoAnteriorNormalizado === correoNuevoNormalizado && carreraActual === carreraNuevaNormalizada;
};

/**
 * @class EmailVerificationService
 * @description Servicio para gestionar el proceso de verificación de correo electrónico
 */
class EmailVerificationService {
  constructor(tokenService, emailTemplateService) {
    this.tokenService = tokenService;
    this.emailTemplateService = emailTemplateService;
  }

  /**
   * Crea un token de verificación para una cuenta y envía el email
   * @param {Object} cuenta - Objeto cuenta de Prisma
   * @param {string} ip - Dirección IP desde donde se solicita la verificación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async enviarVerificacion(cuenta, ip, requestBaseUrl) {
    try {
      // Crear token con código de verificación de 6 dígitos
      const token = await this.tokenService.crearTokenConCodigo({
        idCuenta: cuenta.id,
        tipoToken: "VERIFY_EMAIL",
        ip,
        minutosValidez: 15,
        tenantId: cuenta.tenantId,
      });

      // Obtener plantilla de correo con código
      const { asunto, cuerpoHtml } =
        this.emailTemplateService.obtenerPlantillaVerificacion({
          nombre: cuenta.user?.firstName || "Usuario",
          codigo: token.code,
        });

      // Enviar correo electrónico
      await this.emailTemplateService.enviarEmail({
        destinatario: cuenta.email,
        asunto,
        cuerpoHtml,
      });

      return {
        success: true,
        message: "Código de verificación enviado al correo electrónico",
        // No exponemos el código en la respuesta por seguridad
      };
    } catch (error) {
      console.error("Error al enviar verificación de correo:", error);
      throw new Error("Error al enviar el correo de verificación");
    }
  }

  /**
   * Verifica un código de 6 dígitos ingresado por el usuario
   * @param {string} correo - Correo electrónico de la cuenta
   * @param {string} code - Código de 6 dígitos
   * @param {string} ip - Dirección IP
   * @param {string} tenantId - ID del tenant
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarCodigo(correo, code, ip, tenantId) {
    try {
      // Obtener la cuenta por correo
      const cuenta = await this.tokenService.obtenerCuentaPorCorreo(correo, tenantId);

      if (!cuenta) {
        return {
          success: false,
          message: "No existe una cuenta con este correo electrónico",
          motivo: "CUENTA_NO_ENCONTRADA",
        };
      }

      if (cuenta.isEmailVerified) {
        return {
          success: false,
          message: "Esta cuenta ya ha sido verificada",
          motivo: "YA_VERIFICADA",
        };
      }

      // Validar el código
      const resultadoValidacion = await this.tokenService.validarCodigo({
        accountId: cuenta.id,
        code,
        tipoToken: "VERIFY_EMAIL",
        ip,
      });

      if (!resultadoValidacion.valido) {
        return {
          success: false,
          message: resultadoValidacion.mensaje,
          motivo: resultadoValidacion.motivo || "ERROR_GENERICO",
        };
      }

      // Usar transacción para asegurar atomicidad
      await prisma.$transaction(async (tx) => {
        // Verificar que el token siga activo dentro de la transacción
        const tokenActual = await tx.accountToken.findUnique({
          where: { id: resultadoValidacion.token.id },
        });

        if (tokenActual?.status !== "ACTIVE") {
          throw new Error("Código ya no válido durante la transacción");
        }

        // Marcar token como usado
        await tx.accountToken.update({
          where: { id: resultadoValidacion.token.id },
          data: { status: "USED" },
        });

        // Registrar el uso del token
        await tx.tokenUsage.create({
          data: {
            tenantId: tokenActual.tenantId,
            tokenId: tokenActual.id,
            ip: ip || "0.0.0.0",
            successful: true,
          },
        });

        // Actualizar estado de verificación en la cuenta
        await tx.account.update({
          where: { id: cuenta.id },
          data: {
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });
      });

      // Obtener información completa de la cuenta para generar JWT
      const accountComplete = await prisma.account.findUnique({
        where: { id: cuenta.id },
        include: { user: true },
      });

      // Generar token JWT para autenticación automática
      const jwt = require("jsonwebtoken");
      const jwtToken = jwt.sign(
        {
          id: accountComplete.id,
          rol_usu: accountComplete.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return {
        success: true,
        message: "¡Correo verificado exitosamente!",
        idCuenta: cuenta.id,
        authToken: jwtToken,
        usuario: {
          id: accountComplete.id,
          correo: accountComplete.email,
          rol_usu: accountComplete.role,
          nom_usu: accountComplete.user.firstName,
          ape_usu: accountComplete.user.lastName,
        },
      };
    } catch (error) {
      console.error("Error al verificar código:", error);

      if (error.message === "Código ya no válido durante la transacción") {
        return {
          success: false,
          message: "Este código ya ha sido utilizado.",
          motivo: "USO_NORMAL",
        };
      }

      throw new Error("Error al verificar el código");
    }
  }
  /**
   * Verifica un token de confirmación de correo electrónico
   * @param {string} tokenValue - Valor del token a verificar
   * @param {string} ip - Dirección IP desde donde se realiza la verificación
   * @returns {Promise<Object>} Resultado de la verificación
   */ async verificarToken(tokenValue, ip) {
    try {
      console.log(
        `[${new Date().toISOString()}] Iniciando verificación de token: ${tokenValue} desde IP: ${ip}`
      );

      // Validar token
      const resultadoValidacion = await this.tokenService.validarToken({
        tokenValue,
        tipoToken: "VERIFY_EMAIL",
        ip,
      });
      console.log(
        `[${new Date().toISOString()}] Resultado validación token ${tokenValue}:`,
        {
          valido: resultadoValidacion.valido,
          mensaje: resultadoValidacion.mensaje,
          motivo: resultadoValidacion.motivo || "N/A",
          estadoToken: resultadoValidacion.token?.status || "N/A",
          cuentaVerificada: resultadoValidacion.cuentaVerificada || false,
        }
      );

      if (!resultadoValidacion.valido) {
        // Caso especial: token usado pero cuenta ya verificada
        if (
          resultadoValidacion.motivo === "USO_NORMAL" &&
          resultadoValidacion.cuentaVerificada
        ) {
          console.log(
            `[${new Date().toISOString()}] Token ${tokenValue} ya usado y cuenta ya verificada, retornando error`
          );

          return {
            success: false,
            message: "Este enlace ya ha sido utilizado.",
            motivo: "USO_NORMAL",
            token: resultadoValidacion.token,
          };
        }

        console.log(
          `[${new Date().toISOString()}] Token inválido ${tokenValue}. Motivo: ${resultadoValidacion.motivo || "ERROR_GENERICO"
          }`
        );
        return {
          success: false,
          message: resultadoValidacion.mensaje,
          motivo: resultadoValidacion.motivo || "ERROR_GENERICO",
          token: resultadoValidacion.token, // Pasar información del token
        };
      }

      console.log(
        `[${new Date().toISOString()}] Iniciando transacción para token ${tokenValue}`
      );
      // Usar transacción para asegurar atomicidad
      await prisma.$transaction(async (tx) => {
        // Verificar nuevamente que el token esté activo dentro de la transacción
        const tokenActual = await tx.accountToken.findUnique({
          where: { value: tokenValue },
        });

        console.log(
          `[${new Date().toISOString()}] Estado del token ${tokenValue} dentro de la transacción:`,
          {
            existe: !!tokenActual,
            estado: tokenActual?.status,
          }
        );

        if (tokenActual?.status !== "ACTIVE") {
          console.log(
            `[${new Date().toISOString()}] Token ${tokenValue} ya no válido durante la transacción. Estado: ${tokenActual?.status || "NO_EXISTE"
            }`
          );
          throw new Error("Token ya no válido durante la transacción");
        }
        console.log(
          `[${new Date().toISOString()}] Marcando token ${tokenValue} como usado`
        );
        // Marcar token como usado
        await tx.accountToken.update({
          where: { value: tokenValue },
          data: { status: "USED" },
        });

        console.log(
          `[${new Date().toISOString()}] Registrando uso del token ${tokenValue}`
        );
        // Registrar el uso del token
        await tx.tokenUsage.create({
          data: {
            tenantId: tokenActual.tenantId,
            tokenId: tokenActual.id,
            ip: ip || "0.0.0.0",
            successful: true,
          },
        });

        console.log(
          `[${new Date().toISOString()}] Actualizando estado de verificación para la cuenta ${resultadoValidacion.token.accountId
          }`
        );
        // Actualizar estado de verificación en la cuenta
        const cuentaActualizada = await tx.account.update({
          where: { id: resultadoValidacion.token.accountId },
          data: {
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        console.log(
          `[${new Date().toISOString()}] Verificación completada con éxito para token ${tokenValue}, cuenta ${resultadoValidacion.token.accountId
          }`
        );
        return cuentaActualizada;
      });

      // Obtener la información completa de la cuenta para generar el JWT
      const accountComplete = await prisma.account.findUnique({
        where: { id: resultadoValidacion.token.accountId },
        include: {
          user: true,
        },
      });

      // Generar token JWT para autenticación automática
      const jwtToken = jwt.sign(
        {
          id: accountComplete.id,
          rol_usu: accountComplete.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      console.log(
        `[${new Date().toISOString()}] Retornando respuesta exitosa con JWT para token ${tokenValue}`
      );
      return {
        success: true,
        message: "¡Correo verificado exitosamente!",
        idCuenta: resultadoValidacion.token.accountId,
        // Datos de autenticación para login automático
        authToken: jwtToken,
        usuario: {
          id: accountComplete.id,
          correo: accountComplete.email,
          rol_usu: accountComplete.role,
          nom_usu: accountComplete.user.firstName,
          ape_usu: accountComplete.user.lastName,
        },
      };
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error al verificar token ${tokenValue}:`,
        error
      );

      // Si el error es porque el token ya no es válido, devolver mensaje específico
      if (error.message === "Token ya no válido durante la transacción") {
        console.log(
          `[${new Date().toISOString()}] Token ${tokenValue} rechazado por estar ya usado dentro de la transacción`
        );
        return {
          success: false,
          message: "Este enlace ya ha sido utilizado.",
          motivo: "USO_NORMAL",
        };
      }

      console.log(
        `[${new Date().toISOString()}] Error general en verificación de token ${tokenValue}`
      );
      throw new Error("Error al verificar el correo electrónico");
    }
  }

  /**
   * Reenvía un correo de verificación a una cuenta específica
   * @param {string} correo - Correo electrónico de la cuenta
   * @param {string} ip - Dirección IP desde donde se solicita el reenvío
   * @param {string} tenantId - ID del tenant
   * @returns {Promise<Object>} Resultado de la operación
   */
  async reenviarVerificacion(correo, ip, tenantId, requestBaseUrl) {
    try {
      // Verificar rate limiting (máximo 3 reenvíos por hora)
      const puedeReenviar = await this.tokenService.verificarRateLimit(
        correo,
        "VERIFY_EMAIL",
        3,
        60,
        tenantId
      );

      if (!puedeReenviar.permitido) {
        return {
          success: false,
          message: puedeReenviar.mensaje,
          tiempoRestante: puedeReenviar.tiempoRestante,
        };
      }

      // Obtener cuenta
      const cuenta = await this.tokenService.obtenerCuentaPorCorreo(correo, tenantId);

      if (!cuenta) {
        return {
          success: false,
          message: "No existe una cuenta con este correo electrónico",
        };
      }

      if (cuenta.isEmailVerified) {
        return {
          success: false,
          message: "Esta cuenta ya ha sido verificada",
        };
      }

      // Invalidar tokens anteriores del mismo tipo
      await this.tokenService.invalidarTokensAnteriores(
        cuenta.id,
        "VERIFY_EMAIL",
        cuenta.tenantId
      );

      // Enviar nueva verificación
      return await this.enviarVerificacion(cuenta, ip, requestBaseUrl);
    } catch (error) {
      console.error("Error al reenviar verificación:", error);
      throw new Error("Error al reenviar el correo de verificación");
    }
  }

  /**
   * Corrige el correo electrónico de una cuenta no verificada
   * @param {string} correoAnterior - Correo electrónico anterior (incorrecto)
   * @param {string} correoNuevo - Nuevo correo electrónico (correcto)
   * @param {string|null} carreraNueva - ID de la nueva carrera (si aplica)
   * @param {string} ip - Dirección IP desde donde se realiza la corrección
   * @param {string} tenantId - ID del tenant
   * @returns {Promise<Object>} Resultado de la operación
   */
  async corregirCorreo(correoAnterior, correoNuevo, carreraNueva, ip, tenantId, requestBaseUrl) {
    try {
      const correoAnteriorNormalizado = String(correoAnterior || "").trim().toLowerCase();
      const correoNuevoNormalizado = String(correoNuevo || "").trim().toLowerCase();
      const carreraNuevaNormalizada = carreraNueva ? String(carreraNueva).trim() : "";

      // 1. Obtener cuenta por correo antiguo
      const cuenta = await this.tokenService.obtenerCuentaPorCorreo(
        correoAnteriorNormalizado,
        tenantId
      );
      console.log("=== Corrección de correo - Detalles ===");
      console.log("Cuenta encontrada:", cuenta ? "Sí" : "No");

      if (cuenta) {
        console.log("ID Cuenta:", cuenta.id);
        console.log("Correo actual:", cuenta.email);
        console.log("Verificada:", cuenta.isEmailVerified);
        console.log("Usuario relacionado:", cuenta.user ? "Sí" : "No");

        if (cuenta.user) {
          console.log("ID Usuario:", cuenta.user.id);
          console.log("Nombre:", cuenta.user.firstName);
          console.log("Carrera ID:", cuenta.user.careerId || "No tiene");
        }
      }

      if (!cuenta) {
        return {
          success: false,
          message: "No existe una cuenta con este correo electrónico",
        };
      }

      // 2. Verificar que la cuenta no esté verificada aún
      if (cuenta.isEmailVerified) {
        return {
          success: false,
          message: "No se puede corregir el correo de una cuenta ya verificada",
        };
      }

      if (isSameCorrectionSelection(cuenta, correoAnteriorNormalizado, correoNuevoNormalizado, carreraNuevaNormalizada)) {
        return {
          success: false,
          message: "Se ha seleccionado el mismo correo y la misma carrera",
        };
      }

      // 3. Verificar que el nuevo correo no exista ya
      const existeCorreoNuevo =
        correoAnteriorNormalizado !== correoNuevoNormalizado &&
        (await this.tokenService.verificarExistenciaCorreo(correoNuevoNormalizado, tenantId));
      if (existeCorreoNuevo) {
        return {
          success: false,
          message: "Ya existe una cuenta con el nuevo correo electrónico",
        };
      }

      // 4. Determinar el tipo de cuenta basado en el nuevo correo
      const esUTA = correoNuevoNormalizado.endsWith("@uta.edu.ec");
      const nuevoRol = esUTA ? "STUDENT" : "GENERAL";
      // 5. Actualizar en transacción para garantizar atomicidad
      console.log("=== Iniciando transacción ===");
      console.log("Es correo UTA:", esUTA);
      console.log("Nuevo rol:", nuevoRol);
      console.log("Carrera nueva:", carreraNuevaNormalizada || "N/A");

      const resultado = await prisma.$transaction(async (prisma) => {
        // 5.1 Actualizar la carrera del usuario si es necesario
        if (esUTA && carreraNuevaNormalizada) {
          console.log("Actualizando usuario con carrera:", carreraNuevaNormalizada);
          await prisma.user.update({
            where: { id: cuenta.user.id },
            data: { careerId: carreraNuevaNormalizada },
          });
        } else if (!esUTA) {
          // Si cambia a correo no institucional, quitar la carrera
          console.log("Quitando carrera del usuario (correo no institucional)");
          await prisma.user.update({
            where: { id: cuenta.user.id },
            data: { careerId: null },
          });
        }

        // 5.2 Actualizar el correo y rol en la cuenta
        console.log("Actualizando correo y rol de la cuenta");
        const accountUpdated = await prisma.account.update({
          where: { id: cuenta.id },
          data: {
            email: correoNuevoNormalizado,
            role: nuevoRol,
          },
          include: { user: true },
        });

        console.log("Cuenta actualizada:", accountUpdated.id);
        return accountUpdated;
      });

      // 6. Invalidar tokens anteriores del mismo tipo
      console.log("=== Invalidando tokens anteriores ===");
      const tokensInvalidados =
        await this.tokenService.invalidarTokensAnteriores(
          cuenta.id,
          "VERIFY_EMAIL",
          cuenta.tenantId
        );
      console.log("Tokens invalidados:", tokensInvalidados);

      // 7. Enviar nueva verificación al correo corregido
      console.log("=== Enviando nueva verificación ===");
      console.log("Correo destino:", correoNuevoNormalizado);
      await this.enviarVerificacion(resultado, ip, requestBaseUrl);
      console.log("Verificación enviada con éxito");

      return {
        success: true,
        message: "Correo actualizado y nueva verificación enviada",
        email: correoNuevoNormalizado,
        tipoCorreo: esUTA ? "institucional" : "general",
      };
    } catch (error) {
      console.error("Error al corregir correo:", error);
      throw new Error("Error al actualizar el correo electrónico");
    }
  }
}

module.exports = EmailVerificationService;
