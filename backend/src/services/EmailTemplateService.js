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
   */ obtenerPlantillaVerificacion({ nombre, urlVerificacion, token }) {
    const asunto = "Verificación de Correo Electrónico - AcademicEvents";

    const cuerpoHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificación de Correo Electrónico</title>
      <style>
        /* Estilos generales con identificadores únicos */
        .container-etv {
          font-family: 'Arial', sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 25px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header-etv {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 3px solid #0056b3;
        }
        .logo-etv {
          max-width: 150px;
          margin-bottom: 15px;
        }
        .title-etv {
          color: #0056b3;
          font-size: 26px;
          margin: 0;
          font-weight: bold;
        }
        .subtitle-etv {
          color: #003366;
          font-size: 18px;
          margin-top: 10px;
        }
        .content-etv {
          padding: 25px 0;
          line-height: 1.8;
          color: #333333;
        }
        .greeting-etv {
          font-size: 18px;
          margin-bottom: 15px;
        }
        .verification-button-etv {
          display: block;
          width: 250px;
          margin: 35px auto;
          padding: 15px 30px;
          background-color: #0056b3;
          color: white !important;
          text-align: center;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .verification-button-etv:hover {
          background-color: #003366;
        }
        .token-display-etv {
          background-color: #f8f9fa;
          padding: 15px;
          border: 1px solid #e9ecef;
          border-radius: 5px;
          font-family: monospace;
          margin: 25px 0;
          word-break: break-all;
          text-align: center;
          font-size: 14px;
          color: #495057;
        }
        .notice-etv {
          background-color: #e6f3ff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          font-size: 14px;
          border-left: 4px solid #0056b3;
        }
        .footer-etv {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
          border-top: 1px solid #dee2e6;
          padding-top: 25px;
        }
        .social-etv {
          margin-top: 15px;
        }
        .disclaimer-etv {
          font-size: 12px;
          color: #868e96;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container-etv">
        <div class="header-etv">
          <h1 class="title-etv">AcademicEvents</h1>
          <p class="subtitle-etv">Sistema de Gestión de Eventos Académicos</p>
        </div>
        <div class="content-etv">
          <p class="greeting-etv">Estimado/a <strong>${nombre}</strong>:</p>
          
          <p>Le damos la más cordial bienvenida a <strong>AcademicEvents</strong>, el sistema oficial para la gestión de eventos académicos. Para completar su proceso de registro y garantizar la seguridad de su cuenta, es necesario verificar su dirección de correo electrónico.</p>
          
          <p>Por favor, haga clic en el siguiente botón para validar su cuenta:</p>
          
          <a href="${urlVerificacion}" class="verification-button-etv">Verificar mi cuenta</a>
          
          <p>Si el botón anterior no funciona, puede copiar y pegar la siguiente URL en su navegador web:</p>
          
          <div class="token-display-etv">${urlVerificacion}</div>
          
          <div class="notice-etv">
            <p><strong>Importante:</strong> Este enlace caducará en 24 horas por motivos de seguridad. Si no ha solicitado esta verificación, puede ignorar este mensaje.</p>
          </div>
          
          <p>Le agradecemos por formar parte de nuestra comunidad académica.</p>
        </div>
        
        <div class="footer-etv">
          <p><strong>AcademicEvents</strong></p>
          <p>Universidad Técnica de Ambato</p>
          <p>&copy; ${new Date().getFullYear()} Todos los derechos reservados</p>
          
          <p class="disclaimer-etv">Este es un mensaje automático. Por favor, no responda a este correo electrónico.</p>
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
