const nodemailer = require("nodemailer");
const { PrismaClient } = require("../generated/prisma");
const emailConfig = require("../config/emailConfig");

/**
 * @class EmailTemplateService
 * @description Servicio para gestionar plantillas de correo electrónico y su envío
 */
class EmailTemplateService {
  constructor() {
    // Configurar transporter de nodemailer
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Inicializar cliente de Prisma
    this.prisma = new PrismaClient();
  }

  /**
   * Obtiene información de la facultad por ID de carrera
   * @param {string} carreraId - ID de la carrera
   * @returns {Promise<Object|null>} Información de la facultad o null
   */ async obtenerFacultadPorCarrera(carreraId) {
    try {
      if (!carreraId) return null;

      const carrera = await this.prisma.carrera.findUnique({
        where: { id_car: carreraId },
        include: {
          facultad: {
            select: {
              nom_fac: true,
              acr_fac: true,
            },
          },
        },
      });

      return carrera?.facultad || null;
    } catch (error) {
      console.error("Error al obtener información de facultad:", error);
      return null;
    }
  }

  /**
   * Obtiene información de la facultad por correo electrónico del usuario
   * @param {string} correo - Correo electrónico del usuario
   * @returns {Promise<Object|null>} Información de la facultad o null
   */ async obtenerFacultadPorCorreo(correo) {
    try {
      const cuenta = await this.prisma.cuenta.findUnique({
        where: { cor_usu: correo },
        include: {
          usuario: {
            include: {
              carrera: {
                include: {
                  facultad: {
                    select: {
                      nom_fac: true,
                      acr_fac: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return cuenta?.usuario?.carrera?.facultad || null;
    } catch (error) {
      console.error("Error al obtener facultad por correo:", error);
      return null;
    }
  }
  /**
   * Genera una plantilla de correo para verificación de email
   * @param {Object} options - Opciones para la plantilla
   * @param {string} options.nombre - Nombre del destinatario
   * @param {string} options.urlVerificacion - URL para verificar correo
   * @param {string} options.token - Token de verificación
   * @param {Object} options.facultad - Información de la facultad (opcional)
   * @param {string} options.facultad.nom_fac - Nombre de la facultad
   * @param {string} options.facultad.acr_fac - Acrónimo de la facultad
   * @returns {Object} Asunto y cuerpo HTML del correo
   */ obtenerPlantillaVerificacion({
    nombre,
    urlVerificacion,
    token,
    facultad = null,
  }) {
    const asunto = emailConfig.plantillas.verificacion.asunto;
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

        /* Botón de acción */
        .button-container {
          text-align: center;
          margin: 30px 0;
        }

        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: ${config.colores.primary};
          color: white !important;
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
            Le damos la más cordial bienvenida a <strong>AcademicEvents</strong>, el sistema oficial para la gestión de eventos académicos de la Universidad Técnica de Ambato. Para completar su proceso de registro y garantizar la seguridad de su cuenta, es necesario verificar su dirección de correo electrónico.
          </p>
          
          <hr class="divider">
          
          <p class="message">Por favor, haga clic en el siguiente botón para validar su cuenta:</p>
          
          <div class="button-container">
            <a href="${urlVerificacion}" class="button">
              ${config.plantillas.verificacion.icono} Verificar mi cuenta
            </a>
          </div>
          
          <p class="message">Si el botón anterior no funciona, puede copiar y pegar la siguiente URL en su navegador web:</p>
          
          <div class="link-container">
            <p class="link-text">${urlVerificacion}</p>
          </div>
          
          <div class="security-notice">
            <p class="notice-title">Importante:</p>
            <p>Este enlace caducará en <strong>24 horas</strong> por motivos de seguridad. Si no ha solicitado esta verificación, puede ignorar este mensaje.</p>
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
   */ obtenerPlantillaRecuperacion({
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
          color: white;
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
            <a href="${urlRecuperacion}" class="button">
              🔑 Recuperar mi contraseña
            </a>
          </div>
          
          <p class="message">Si el botón anterior no funciona, puede copiar y pegar la siguiente URL en su navegador web:</p>
          
          <div class="link-container">
            <p class="link-text">${urlRecuperacion}</p>
          </div>
          
          <div class="security-notice">
            <p class="notice-title">Importante:</p>
            <p>Este enlace caducará en <strong>24 horas</strong> por motivos de seguridad. Si no ha solicitado esta recuperación, puede ignorar este mensaje.</p>
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
}

module.exports = EmailTemplateService;
