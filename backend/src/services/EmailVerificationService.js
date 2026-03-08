const { prisma } = require("../config/db");
const jwt = require("jsonwebtoken");

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
  async enviarVerificacion(cuenta, ip) {
    try {
      // Crear token de verificación
      const token = await this.tokenService.crearToken({
        idCuenta: cuenta.id,
        tipoToken: "VERIFY_EMAIL",
        ip,
        tenantId: cuenta.tenantId,
      });

      // Generar URL para el frontend
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const urlVerificacion = `${frontendUrl}/verificar-correo/${token.value}`;

      // Obtener plantilla de correo
      const { asunto, cuerpoHtml } =
        this.emailTemplateService.obtenerPlantillaVerificacion({
          nombre: cuenta.user?.firstName || "Usuario",
          urlVerificacion,
          token: token.value,
        });

      // Enviar correo electrónico
      await this.emailTemplateService.enviarEmail({
        destinatario: cuenta.email,
        asunto,
        cuerpoHtml,
      });

      return {
        success: true,
        message: "Email de verificación enviado correctamente",
        token: token.value,
      };
    } catch (error) {
      console.error("Error al enviar verificación de correo:", error);
      throw new Error("Error al enviar el correo de verificación");
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
          `[${new Date().toISOString()}] Token inválido ${tokenValue}. Motivo: ${
            resultadoValidacion.motivo || "ERROR_GENERICO"
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
      const resultado = await prisma.$transaction(async (tx) => {
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

        if (!tokenActual || tokenActual.status !== "ACTIVE") {
          console.log(
            `[${new Date().toISOString()}] Token ${tokenValue} ya no válido durante la transacción. Estado: ${
              tokenActual?.status || "NO_EXISTE"
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
          `[${new Date().toISOString()}] Actualizando estado de verificación para la cuenta ${
            resultadoValidacion.token.accountId
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
          `[${new Date().toISOString()}] Verificación completada con éxito para token ${tokenValue}, cuenta ${
            resultadoValidacion.token.accountId
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
  async reenviarVerificacion(correo, ip, tenantId) {
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
      return await this.enviarVerificacion(cuenta, ip);
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
  async corregirCorreo(correoAnterior, correoNuevo, carreraNueva, ip, tenantId) {
    try {
      // 1. Obtener cuenta por correo antiguo
      const cuenta = await this.tokenService.obtenerCuentaPorCorreo(
        correoAnterior,
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

      // 3. Verificar que el nuevo correo no exista ya
      const existeCorreoNuevo =
        await this.tokenService.verificarExistenciaCorreo(correoNuevo, tenantId);
      if (existeCorreoNuevo) {
        return {
          success: false,
          message: "Ya existe una cuenta con el nuevo correo electrónico",
        };
      }

      // 4. Determinar el tipo de cuenta basado en el nuevo correo
      const esUTA = correoNuevo.endsWith("@uta.edu.ec");
      const nuevoRol = esUTA ? "STUDENT" : "GENERAL"; // 5. Actualizar en transacción para garantizar atomicidad
      console.log("=== Iniciando transacción ===");
      console.log("Es correo UTA:", esUTA);
      console.log("Nuevo rol:", nuevoRol);
      console.log("Carrera nueva:", carreraNueva);

      const resultado = await prisma.$transaction(async (prisma) => {
        // 5.1 Actualizar la carrera del usuario si es necesario
        if (esUTA && carreraNueva) {
          console.log("Actualizando usuario con carrera:", carreraNueva);
          await prisma.user.update({
            where: { id: account.user.id },
            data: { careerId: carreraNueva },
          });
        } else if (!esUTA) {
          // Si cambia a correo no institucional, quitar la carrera
          console.log("Quitando carrera del usuario (correo no institucional)");
          await prisma.user.update({
            where: { id: account.user.id },
            data: { careerId: null },
          });
        }

        // 5.2 Actualizar el correo y rol en la cuenta
        console.log("Actualizando correo y rol de la cuenta");
        const accountUpdated = await prisma.account.update({
          where: { id: account.id },
          data: {
            email: correoNuevo,
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
          "VERIFICAR_CORREO"
        );
      console.log("Tokens invalidados:", tokensInvalidados);

      // 7. Enviar nueva verificación al correo corregido
      console.log("=== Enviando nueva verificación ===");
      console.log("Correo destino:", correoNuevo);
      await this.enviarVerificacion(resultado, ip);
      console.log("Verificación enviada con éxito");

      return {
        success: true,
        message: "Correo actualizado y nueva verificación enviada",
        email: correoNuevo,
        tipoCorreo: esUTA ? "institucional" : "general",
      };
    } catch (error) {
      console.error("Error al corregir correo:", error);
      throw new Error("Error al actualizar el correo electrónico");
    }
  }
}

module.exports = EmailVerificationService;
