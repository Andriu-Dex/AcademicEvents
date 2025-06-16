const prisma = require("../config/db");

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
        idCuenta: cuenta.id_cue,
        tipoToken: "VERIFICAR_CORREO",
        ip,
      });

      // Generar URL para el frontend
      const urlVerificacion = `${
        process.env.HOST === "localhost" ? "http" : "https"
      }://${process.env.HOST}${
        process.env.HOST === "localhost" ? ":5173" : ""
      }/verificar-correo/${token.tok_val}`;

      // Obtener plantilla de correo
      const { asunto, cuerpoHtml } =
        this.emailTemplateService.obtenerPlantillaVerificacion({
          nombre: cuenta.usuario?.nom_usu || "Usuario",
          urlVerificacion,
          token: token.tok_val,
        });

      // Enviar correo electrónico
      await this.emailTemplateService.enviarEmail({
        destinatario: cuenta.cor_usu,
        asunto,
        cuerpoHtml,
      });

      return {
        success: true,
        message: "Email de verificación enviado correctamente",
        token: token.tok_val,
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
   */
  async verificarToken(tokenValue, ip) {
    try {
      // Validar token
      const resultadoValidacion = await this.tokenService.validarToken({
        tokenValue,
        tipoToken: "VERIFICAR_CORREO",
        ip,
      });

      if (!resultadoValidacion.valido) {
        return {
          success: false,
          message: resultadoValidacion.mensaje,
        };
      }

      // Marcar token como usado
      await this.tokenService.marcarTokenComoUsado(tokenValue, ip);

      // Actualizar estado de verificación en la cuenta
      await this.tokenService.actualizarEstadoVerificacion(
        resultadoValidacion.token.id_cue_per
      );

      return {
        success: true,
        message: "¡Correo verificado exitosamente!",
        idCuenta: resultadoValidacion.token.id_cue_per,
      };
    } catch (error) {
      console.error("Error al verificar token:", error);
      throw new Error("Error al verificar el correo electrónico");
    }
  }

  /**
   * Reenvía un correo de verificación a una cuenta específica
   * @param {string} correo - Correo electrónico de la cuenta
   * @param {string} ip - Dirección IP desde donde se solicita el reenvío
   * @returns {Promise<Object>} Resultado de la operación
   */
  async reenviarVerificacion(correo, ip) {
    try {
      // Verificar rate limiting (máximo 3 reenvíos por hora)
      const puedeReenviar = await this.tokenService.verificarRateLimit(
        correo,
        "VERIFICAR_CORREO",
        3,
        60
      );

      if (!puedeReenviar.permitido) {
        return {
          success: false,
          message: puedeReenviar.mensaje,
          tiempoRestante: puedeReenviar.tiempoRestante,
        };
      }

      // Obtener cuenta
      const cuenta = await this.tokenService.obtenerCuentaPorCorreo(correo);

      if (!cuenta) {
        return {
          success: false,
          message: "No existe una cuenta con este correo electrónico",
        };
      }

      if (cuenta.est_ver_cor) {
        return {
          success: false,
          message: "Esta cuenta ya ha sido verificada",
        };
      }

      // Invalidar tokens anteriores del mismo tipo
      await this.tokenService.invalidarTokensAnteriores(
        cuenta.id_cue,
        "VERIFICAR_CORREO"
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
   * @returns {Promise<Object>} Resultado de la operación
   */
  async corregirCorreo(correoAnterior, correoNuevo, carreraNueva, ip) {
    try {
      // 1. Obtener cuenta por correo antiguo
      const cuenta = await this.tokenService.obtenerCuentaPorCorreo(
        correoAnterior
      );
      console.log("=== Corrección de correo - Detalles ===");
      console.log("Cuenta encontrada:", cuenta ? "Sí" : "No");

      if (cuenta) {
        console.log("ID Cuenta:", cuenta.id_cue);
        console.log("Correo actual:", cuenta.cor_usu);
        console.log("Verificada:", cuenta.est_ver_cor);
        console.log("Usuario relacionado:", cuenta.usuario ? "Sí" : "No");

        if (cuenta.usuario) {
          console.log("ID Usuario:", cuenta.usuario.id_usu);
          console.log("Nombre:", cuenta.usuario.nom_usu);
          console.log("Carrera ID:", cuenta.usuario.id_car_est || "No tiene");
        }
      }

      if (!cuenta) {
        return {
          success: false,
          message: "No existe una cuenta con este correo electrónico",
        };
      }

      // 2. Verificar que la cuenta no esté verificada aún
      if (cuenta.est_ver_cor) {
        return {
          success: false,
          message: "No se puede corregir el correo de una cuenta ya verificada",
        };
      }

      // 3. Verificar que el nuevo correo no exista ya
      const existeCorreoNuevo =
        await this.tokenService.verificarExistenciaCorreo(correoNuevo);
      if (existeCorreoNuevo) {
        return {
          success: false,
          message: "Ya existe una cuenta con el nuevo correo electrónico",
        };
      }

      // 4. Determinar el tipo de cuenta basado en el nuevo correo
      const esUTA = correoNuevo.endsWith("@uta.edu.ec");
      const nuevoRol = esUTA ? "ESTUDIANTE" : "GENERAL"; // 5. Actualizar en transacción para garantizar atomicidad
      console.log("=== Iniciando transacción ===");
      console.log("Es correo UTA:", esUTA);
      console.log("Nuevo rol:", nuevoRol);
      console.log("Carrera nueva:", carreraNueva);

      const resultado = await prisma.$transaction(async (prisma) => {
        // 5.1 Actualizar la carrera del usuario si es necesario
        if (esUTA && carreraNueva) {
          console.log("Actualizando usuario con carrera:", carreraNueva);
          await prisma.usuario.update({
            where: { id_usu: cuenta.usuario.id_usu },
            data: { id_car_est: carreraNueva },
          });
        } else if (!esUTA) {
          // Si cambia a correo no institucional, quitar la carrera
          console.log("Quitando carrera del usuario (correo no institucional)");
          await prisma.usuario.update({
            where: { id_usu: cuenta.usuario.id_usu },
            data: { id_car_est: null },
          });
        }

        // 5.2 Actualizar el correo y rol en la cuenta
        console.log("Actualizando correo y rol de la cuenta");
        const cuentaActualizada = await prisma.cuenta.update({
          where: { id_cue: cuenta.id_cue },
          data: {
            cor_usu: correoNuevo,
            rol_usu: nuevoRol,
          },
          include: { usuario: true },
        });

        console.log("Cuenta actualizada:", cuentaActualizada.id_cue);
        return cuentaActualizada;
      });

      // 6. Invalidar tokens anteriores del mismo tipo
      console.log("=== Invalidando tokens anteriores ===");
      const tokensInvalidados =
        await this.tokenService.invalidarTokensAnteriores(
          cuenta.id_cue,
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
