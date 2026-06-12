const nodemailer = require("nodemailer");
const { prisma } = require("../config/db");
const emailConfig = require("../config/emailConfig");
const UniversidadService = require("./universidad.service");

/**
 * @class EmailTemplateService
 * @description Servicio para gestionar plantillas de correo electrónico y su envío
 */
class EmailTemplateService {
  constructor() {
    // Configurar transporter de nodemailer
    const port = Number(process.env.SMTP_PORT) || 587;
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Inicializar cliente de Prisma
    this.prisma = prisma;
  }
  /**
   * Obtiene información de la facultad por ID de carrera
   * @param {string} carreraId - ID de la carrera
   * @returns {Promise<Object|null>} Información de la facultad o null
   */
  async obtenerFacultadPorCarrera(carreraId) {
    try {
      if (!carreraId) return null;

      const career = await this.prisma.career.findUnique({
        where: { id: carreraId },
        include: {
          faculty: {
            select: {
              name: true,
              acronym: true,
            },
          },
        },
      });

      return career?.faculty || null;
    } catch (error) {
      console.error("Error al obtener información de facultad:", error);
      return null;
    }
  }
  /**
   * Obtiene información de la facultad por correo electrónico del usuario
   * @param {string} correo - Correo electrónico del usuario
   * @returns {Promise<Object|null>} Información de la facultad o null
   */
  async obtenerFacultadPorCorreo(correo) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { email: correo },
        include: {
          user: {
            include: {
              career: {
                include: {
                  faculty: {
                    select: {
                      name: true,
                      acronym: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return account?.user?.career?.faculty || null;
    } catch (error) {
      console.error("Error al obtener facultad por correo:", error);
      return null;
    }
  }

  /**
   * Genera una plantilla de correo para verificación de email con código numérico
   * @param {Object} options - Opciones para la plantilla
   * @param {string} options.nombre - Nombre del destinatario
   * @param {string} options.codigo - Código numérico de 6 dígitos
   * @param {Object} options.facultad - Información de la facultad (opcional)
   * @param {string} options.facultad.nom_fac - Nombre de la facultad
   * @param {string} options.facultad.acr_fac - Acrónimo de la facultad
   * @returns {Object} Asunto y cuerpo HTML del correo
   */
  obtenerPlantillaVerificacion({
    nombre,
    codigo,
    facultad = null,
  }) {
    const asunto = emailConfig.plantillas.verificacion.asunto;
    const config = emailConfig;

    // Determinar el nombre de la institución
    const nombreInstitucion = facultad?.nom_fac
      ? `${facultad.nom_fac} - ${config.universidad.nombre}`
      : config.universidad.nombre;

    const acronimoFacultad = facultad?.acr_fac || config.universidad.acronimo;

    // Formatear código para la visualización (el espaciado se maneja con CSS)
    const codigoFormateado = codigo;

    const cuerpoHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificación de Correo Electrónico</title>
      <style>
        /* Variables CSS con colores institucionales UTA */
        :root {
          --color-uta-primary: ${config.colores.primary};
          --color-uta-secondary: ${config.colores.secondary};
          --color-uta-accent: ${config.colores.accent};
          --color-uta-light: ${config.colores.light};
          --color-uta-dark: ${config.colores.dark};
          --color-uta-gray: ${config.colores.gray};
          --color-uta-success: ${config.colores.success};
          --color-uta-warning: ${config.colores.warning};
          --color-uta-danger: ${config.colores.danger};
          --color-uta-info: ${config.colores.info};
        }

        /* Reset básico para mayor compatibilidad */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f5f5f5;
          padding: 0;
          margin: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Contenedor principal */
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
        }

        /* Encabezado tipográfico */
        .header {
          padding: 30px 25px;
          background-color: ${config.colores.primary};
          text-align: center;
          border-bottom: 5px solid ${config.colores.accent};
        }

        .header-initials {
          display: inline-block;
          width: 70px;
          height: 70px;
          line-height: 70px;
          border-radius: 50%;
          background-color: white;
          color: ${config.colores.primary};
          font-size: 28px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 15px;
        }

        .header-title {
          color: white;
          font-size: 26px;
          font-weight: bold;
          margin: 0;
          padding: 0;
          line-height: 1.2;
        }

        .header-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin: 5px 0 0 0;
          padding: 0;
          font-weight: normal;
        }

        .header-institution {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin-top: 8px;
          font-weight: normal;
        }

        /* Contenido */
        .content {
          padding: 30px 25px;
          background-color: #ffffff;
        }

        .greeting {
          font-size: 18px;
          color: ${config.colores.primary};
          font-weight: bold;
          margin-bottom: 20px;
        }

        .message {
          font-size: 16px;
          color: #444444;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        /* Separador horizontal */
        .divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 25px 0;
          border: none;
        }

        /* Contenedor del código */
        .code-container {
          text-align: center;
          margin: 30px 0;
          padding: 25px 15px;
          background-color: #f8f9fa;
          border: 2px dashed ${config.colores.primary};
          border-radius: 8px;
        }

        .code-label {
          font-size: 14px;
          color: #666666;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .code-value {
          font-size: 36px;
          font-weight: bold;
          color: ${config.colores.primary};
          letter-spacing: 12px;
          text-indent: 12px; /* Centra el texto compensando el espaciado a la derecha */
          font-family: 'Courier New', Courier, monospace;
          padding: 10px 0;
          white-space: nowrap;
        }

        .code-expiry {
          font-size: 13px;
          color: #888888;
          margin-top: 12px;
        }

        /* Aviso de seguridad */
        .security-notice {
          margin: 25px 0;
          padding: 15px;
          background-color: #fff8e1;
          border-left: 4px solid ${config.colores.accent};
          font-size: 14px;
        }

        .notice-title {
          font-weight: bold;
          color: ${config.colores.primary};
          margin-bottom: 8px;
        }

        /* Pie de página */
        .footer {
          padding: 25px;
          background-color: #f5f5f5;
          text-align: center;
          font-size: 14px;
          color: #666666;
          border-top: 1px solid #e0e0e0;
        }

        .footer-brand {
          font-weight: bold;
          color: ${config.colores.primary};
          font-size: 16px;
          margin-bottom: 5px;
        }

        .footer-institution {
          color: ${config.colores.secondary};
          margin-bottom: 10px;
        }

        .copyright {
          font-size: 12px;
          color: #888888;
          margin-bottom: 10px;
        }

        .disclaimer {
          font-size: 11px;
          color: #999999;
          font-style: italic;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="header-initials">${acronimoFacultad.substring(0, 2)}</div>
          <h1 class="header-title">AcademicEvents</h1>
          <p class="header-subtitle">Sistema de Gestión de Eventos Académicos</p>
          <p class="header-institution">${nombreInstitucion}</p>
        </div>
        
        <div class="content">
          <p class="greeting">Estimado/a ${nombre}:</p>
          
          <p class="message">
            Le damos la más cordial bienvenida a <strong>AcademicEvents</strong>, el sistema oficial para la gestión de eventos académicos de la Universidad Técnica de Ambato. Para completar su proceso de registro y garantizar la seguridad de su cuenta, ingrese el siguiente código de verificación:
          </p>
          
          <hr class="divider">
          
          <div class="code-container">
            <p class="code-label">Tu código de verificación</p>
            <p class="code-value">${codigoFormateado}</p>
            <p class="code-expiry">⏱️ Este código caduca en <strong>15 minutos</strong></p>
          </div>
          
          <p class="message">Ingresa este código en la pantalla de verificación de la aplicación para activar tu cuenta.</p>
          
          <div class="security-notice">
            <p class="notice-title">Importante:</p>
            <p>Si no has solicitado esta verificación, puedes ignorar este mensaje. Nunca compartas este código con nadie.</p>
          </div>
          
          <hr class="divider">
          
          <p class="message">Le agradecemos por formar parte de nuestra comunidad académica y esperamos que tenga una excelente experiencia utilizando nuestros servicios.</p>
        </div>
        
        <div class="footer">
          <p class="footer-brand">AcademicEvents</p>
          <p class="footer-institution">${nombreInstitucion}</p>
          <p class="copyright">&copy; ${new Date().getFullYear()} Todos los derechos reservados</p>
          
          <p class="disclaimer">Este es un mensaje automático generado por el sistema. Por favor, no responda a este correo electrónico.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return { asunto, cuerpoHtml };
  }
  /**
   * Genera una plantilla de correo para recuperación de contraseña
   * @param {Object} options - Opciones para la plantilla
   * @param {string} options.nombre - Nombre del destinatario
   * @param {string} options.urlRecuperacion - URL para recuperar contraseña
   * @param {Object} options.facultad - Información de la facultad (opcional)
   * @returns {Object} Asunto y cuerpo HTML del correo
   */
  obtenerPlantillaRecuperacion({
    nombre,
    urlRecuperacion,
    facultad = null,
  }) {
    const asunto = "Recuperación de Contraseña - AcademicEvents UTA";
    const config = emailConfig;

    // Determinar el nombre de la institución
    const nombreInstitucion = facultad?.nom_fac
      ? `${facultad.nom_fac} - ${config.universidad.nombre}`
      : config.universidad.nombre;

    const acronimoFacultad = facultad?.acr_fac || config.universidad.acronimo;

    const cuerpoHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña</title>
      <style>
        /* Variables CSS con colores institucionales UTA */
        :root {
          --color-uta-primary: ${config.colores.primary};
          --color-uta-secondary: ${config.colores.secondary};
          --color-uta-accent: ${config.colores.accent};
          --color-uta-light: ${config.colores.light};
          --color-uta-dark: ${config.colores.dark};
          --color-uta-gray: ${config.colores.gray};
          --color-uta-success: ${config.colores.success};
          --color-uta-warning: ${config.colores.warning};
          --color-uta-danger: ${config.colores.danger};
          --color-uta-info: ${config.colores.info};
        }

        /* Reset básico para mayor compatibilidad */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f5f5f5;
          padding: 0;
          margin: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Contenedor principal */
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
        }

        /* Encabezado tipográfico */
        .header {
          padding: 30px 25px;
          background-color: ${config.colores.primary};
          text-align: center;
          border-bottom: 5px solid ${config.colores.accent};
        }

        .header-initials {
          display: inline-block;
          width: 70px;
          height: 70px;
          line-height: 70px;
          border-radius: 50%;
          background-color: white;
          color: ${config.colores.primary};
          font-size: 28px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 15px;
        }

        .header-title {
          color: white;
          font-size: 26px;
          font-weight: bold;
          margin: 0;
          padding: 0;
          line-height: 1.2;
        }

        .header-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin: 5px 0 0 0;
          padding: 0;
          font-weight: normal;
        }

        .header-institution {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin-top: 8px;
          font-weight: normal;
        }

        /* Contenido */
        .content {
          padding: 30px 25px;
          background-color: #ffffff;
        }

        .greeting {
          font-size: 18px;
          color: ${config.colores.primary};
          font-weight: bold;
          margin-bottom: 20px;
        }

        .message {
          font-size: 16px;
          color: #444444;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        /* Separador horizontal */
        .divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 25px 0;
          border: none;
        }

        /* Botón de acción */
        .button-container {
          text-align: center;
          margin: 30px 0;
        }

        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: ${config.colores.primary};
          color: #ffffff !important;
          text-decoration: none;
          font-weight: bold;
          border-radius: 4px;
          font-size: 16px;
          border: 2px solid ${config.colores.primary};
        }

        /* Link alternativo */
        .link-container {
          margin: 25px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }

        .link-text {
          word-break: break-all;
          font-family: monospace;
          font-size: 14px;
          color: #444444;
          text-align: center;
        }

        /* Aviso de seguridad */
        .security-notice {
          margin: 25px 0;
          padding: 15px;
          background-color: #fff8e1;
          border-left: 4px solid ${config.colores.accent};
          font-size: 14px;
        }

        .notice-title {
          font-weight: bold;
          color: ${config.colores.primary};
          margin-bottom: 8px;
        }

        /* Pie de página */
        .footer {
          padding: 25px;
          background-color: #f5f5f5;
          text-align: center;
          font-size: 14px;
          color: #666666;
          border-top: 1px solid #e0e0e0;
        }

        .footer-brand {
          font-weight: bold;
          color: ${config.colores.primary};
          font-size: 16px;
          margin-bottom: 5px;
        }

        .footer-institution {
          color: ${config.colores.secondary};
          margin-bottom: 10px;
        }

        .copyright {
          font-size: 12px;
          color: #888888;
          margin-bottom: 10px;
        }

        .disclaimer {
          font-size: 11px;
          color: #999999;
          font-style: italic;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="header-initials">${acronimoFacultad.substring(0, 2)}</div>
          <h1 class="header-title">AcademicEvents</h1>
          <p class="header-subtitle">Sistema de Gestión de Eventos Académicos</p>
          <p class="header-institution">${nombreInstitucion}</p>
        </div>
        
        <div class="content">
          <p class="greeting">Estimado/a ${nombre}:</p>
          
          <p class="message">
            Hemos recibido una solicitud para recuperar la contraseña de su cuenta en <strong>AcademicEvents</strong>. Si usted realizó esta solicitud, por favor haga clic en el siguiente botón para restablecer su contraseña:
          </p>
          
          <hr class="divider">
          
          <div class="button-container">
            <a href="${urlRecuperacion}" class="button" style="color:#ffffff !important; text-decoration:none;">
              🔑 Recuperar mi contraseña
            </a>
          </div>
          
          <p class="message">Si no funciona el botón, puede usar este enlace web:</p>
          
          <div class="link-container">
            <p class="link-text">${urlRecuperacion}</p>
          </div>
          
          <div class="security-notice">
            <p class="notice-title">Importante:</p>
            <p>Este enlace caducará en <strong>2 horas</strong> por motivos de seguridad. Si no ha solicitado esta recuperación, puede ignorar este mensaje.</p>
          </div>
          
          <hr class="divider">
          
          <p class="message">Le recomendamos que, una vez recuperada su contraseña, acceda a su perfil y actualice su información de seguridad.</p>
        </div>
        
        <div class="footer">
          <p class="footer-brand">AcademicEvents</p>
          <p class="footer-institution">${nombreInstitucion}</p>
          <p class="copyright">&copy; ${new Date().getFullYear()} Todos los derechos reservados</p>
          
          <p class="disclaimer">Este es un mensaje automático generado por el sistema. Por favor, no responda a este correo electrónico.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return { asunto, cuerpoHtml };
  }

  /**
   * Obtiene la plantilla para la confirmación de cambio de contraseña
   * @param {Object} params - Parámetros de la plantilla
   * @param {string} params.nombre - Nombre del usuario
   * @param {string} params.fechaCambio - Fecha del cambio de contraseña
   * @returns {Object} Asunto y cuerpo HTML del correo
   */
  obtenerPlantillaConfirmacionCambioContrasena({
    nombre,
    fechaCambio,
    facultad = null,
  }) {
    const plantillaConfig = emailConfig.plantillas.recuperacion;

    const asunto = "Confirmación de cambio de contraseña - AcademicEvents UTA";
    const cuerpoHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cambio de Contraseña Exitoso</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background-color: ${plantillaConfig.colorPrimario || "#8a1538"};
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          
          .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 10px;
          }
          
          h1 {
            font-size: 24px;
            margin: 0;
            padding: 0;
          }
          
          .content {
            padding: 20px;
          }
          
          .divider {
            border: none;
            height: 1px;
            background-color: #e0e0e0;
            margin: 20px 0;
          }
          
          .security-notice {
            background-color: #f8f8f8;
            border-left: 4px solid #ffcc00;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          
          .notice-title {
            font-weight: bold;
            margin-top: 0;
            color: #555;
          }
          
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #777;
          }
          
          @media screen and (max-width: 480px) {
            .header {
              padding: 15px;
            }
            
            h1 {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Contraseña Actualizada</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${nombre}</strong>,</p>
            
            <p>Te confirmamos que la contraseña de tu cuenta en <strong>AcademicEvents</strong> ha sido cambiada exitosamente el <strong>${fechaCambio}</strong>.</p>
            
            <hr class="divider">
            
            <div class="security-notice">
              <p class="notice-title">⚠️ Importante:</p>
              <p>Si tú no realizaste este cambio, por favor contacta inmediatamente con soporte técnico o intenta recuperar tu cuenta nuevamente.</p>
            </div>
            
            <p>No es necesario que respondas a este correo. Este es un mensaje automático para confirmar que tu contraseña ha sido cambiada correctamente.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} AcademicEvents - Universidad Técnica de Ambato</p>
            <p>Este correo fue enviado a solicitud del usuario. Por favor no responder a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { asunto, cuerpoHtml };
  }

  /**
   * Envía un correo electrónico
   * @param {Object} options - Opciones para el envío
   * @param {string} options.destinatario - Correo del destinatario
   * @param {string} options.asunto - Asunto del correo
   * @param {string} options.cuerpoHtml - Cuerpo HTML del correo
   * @returns {Promise<Object>} Resultado del envío
   */
  async enviarEmail({ destinatario, asunto, cuerpoHtml }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"AcademicEvents" <${process.env.SMTP_USER}>`,
        to: destinatario,
        subject: asunto,
        html: cuerpoHtml,
      });

      console.log("Correo enviado:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error al enviar correo:", error);
      throw new Error("Error al enviar correo electrónico");
    }
  }

  /**
   * Método mejorado para enviar correos con información de facultad
   * @param {Object} options - Opciones para el envío
   * @param {string} options.destinatario - Correo del destinatario
   * @param {string} options.tipoPlantilla - Tipo de plantilla (verificacion, recuperacion)
   * @param {Object} options.datosPlantilla - Datos específicos de la plantilla
   * @returns {Promise<Object>} Resultado del envío
   */
  async enviarEmailConFacultad({
    destinatario,
    tipoPlantilla,
    datosPlantilla,
  }) {
    try {
      // Obtener información de la facultad si es posible
      const facultad = await this.obtenerFacultadPorCorreo(destinatario);

      let plantilla;
      switch (tipoPlantilla) {
        case "verificacion":
          plantilla = this.obtenerPlantillaVerificacion({
            ...datosPlantilla,
            facultad,
          });
          break;
        case "recuperacion":
          plantilla = this.obtenerPlantillaRecuperacion({
            ...datosPlantilla,
            facultad,
          });
          break;
        default:
          throw new Error(`Tipo de plantilla no soportado: ${tipoPlantilla}`);
      }

      return await this.enviarEmail({
        destinatario,
        asunto: plantilla.asunto,
        cuerpoHtml: plantilla.cuerpoHtml,
      });
    } catch (error) {
      console.error("Error al enviar correo con facultad:", error);
      throw error;
    }
  }

  /**
   * Obtiene los datos dinámicos de la universidad
   * @returns {Promise<Object>} Datos de la universidad
   */
  async obtenerDatosUniversidad() {
    try {
      return await UniversidadService.getUniversidadData();
    } catch (error) {
      console.error("Error al obtener datos de la universidad:", error);
      // Si hay un error, devolvemos los valores predeterminados de la configuración
      return {
        nom_uni: emailConfig.universidad.nombre,
        acr_uni: emailConfig.universidad.acronimo,
      };
    }
  }
}

module.exports = EmailTemplateService;
// Andriu Dex
