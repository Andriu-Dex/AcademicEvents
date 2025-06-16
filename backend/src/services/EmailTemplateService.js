const nodemailer = require("nodemailer");

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
  }

  /**
   * Genera una plantilla de correo para verificación de email
   * @param {Object} options - Opciones para la plantilla
   * @param {string} options.nombre - Nombre del destinatario
   * @param {string} options.urlVerificacion - URL para verificar correo
   * @param {string} options.token - Token de verificación
   * @returns {Object} Asunto y cuerpo HTML del correo
   */
  obtenerPlantillaVerificacion({ nombre, urlVerificacion, token }) {
    const asunto = "Verifica tu correo - AcademicEvents";

    const cuerpoHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifica tu correo electrónico</title>
      <style>
        /* Estilos generales con identificadores únicos */
        .container-ets {
          font-family: 'Arial', sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header-ets {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #0056b3;
        }
        .logo-ets {
          max-width: 150px;
          margin-bottom: 10px;
        }
        .title-ets {
          color: #0056b3;
          font-size: 24px;
          margin: 0;
        }
        .content-ets {
          padding: 20px 0;
          line-height: 1.6;
        }
        .verification-button-ets {
          display: block;
          width: 200px;
          margin: 30px auto;
          padding: 12px 24px;
          background-color: #0056b3;
          color: white;
          text-align: center;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          font-size: 16px;
        }
        .token-display-ets {
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 5px;
          font-family: monospace;
          margin: 20px 0;
          word-break: break-all;
          text-align: center;
        }
        .footer-ets {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container-ets">
        <div class="header-ets">
          <h1 class="title-ets">AcademicEvents</h1>
        </div>
        <div class="content-ets">
          <p>Hola, ${nombre}:</p>
          <p>Gracias por registrarte en <strong>AcademicEvents</strong>. Para completar tu registro, necesitamos verificar tu dirección de correo electrónico.</p>
          
          <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
          
          <a href="${urlVerificacion}" class="verification-button-ets">Verificar mi correo</a>
          
          <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
          <div class="token-display-ets">${urlVerificacion}</div>
          
          <p>Este enlace expirará en 24 horas. Si no solicitaste esta verificación, puedes ignorar este correo.</p>
        </div>
        <div class="footer-ets">
          <p>&copy; ${new Date().getFullYear()} AcademicEvents - Sistema de Gestión de Eventos Académicos</p>
          <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
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
}

module.exports = EmailTemplateService;
