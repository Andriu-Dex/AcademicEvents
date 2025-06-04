const nodemailer = require("nodemailer");

// Crear el transporter con la configuración SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Acepta certificados autofirmados sin desactivar toda la seguridad
    rejectUnauthorized: false,
  },
  debug: true, // Activar debug para ver más información de errores
});

// Verificar la conexión al iniciar
transporter.verify(function (error, success) {
  if (error) {
    console.error("Error de configuración SMTP:", error);
  } else {
    console.log("Servidor SMTP listo para enviar emails");
  }
});

const enviarCorreoConCertificado = async (
  correoDestino,
  pdfBuffer,
  nombreEvento,
  nombreEstudiante
) => {
  try {
    console.log(`Intentando enviar certificado por correo a: ${correoDestino}`);
    console.log(
      `Configuración SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`
    );
    console.log(`Usuario SMTP: ${process.env.SMTP_USER}`);

    // Preparar un HTML amigable para el correo
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8a1538; margin-bottom: 5px;">¡Felicitaciones!</h1>
          <h2 style="color: #333; font-size: 18px; margin-top: 0;">Tu certificado está listo</h2>
        </div>
        
        <p style="color: #555; line-height: 1.5;">
          Estimado/a <strong>${nombreEstudiante}</strong>,
        </p>
        
        <p style="color: #555; line-height: 1.5;">
          Nos complace informarte que has completado satisfactoriamente el evento académico:
          <strong>${nombreEvento}</strong>.
        </p>
        
        <p style="color: #555; line-height: 1.5;">
          Adjunto encontrarás tu certificado oficial en formato PDF. Este documento acredita tu participación
          y/o aprobación del evento, y puede ser utilizado para fines académicos y profesionales.
        </p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #555; margin: 0;">
            <strong>Nota:</strong> Este certificado tiene un código de validación único que puede ser verificado 
            a través de nuestro sistema de verificación en línea.
          </p>
        </div>
        
        <p style="color: #555; line-height: 1.5;">
          Agradecemos tu participación y esperamos contar contigo en futuros eventos académicos.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
          <p>Este es un correo automático, por favor no responder.</p>
          <p>© ${new Date().getFullYear()} AcademicEvents - Todos los derechos reservados</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"AcademicEvents" <${process.env.SMTP_USER}>`,
      to: correoDestino,
      subject: `Certificado - ${nombreEvento}`,
      text: `Felicitaciones ${nombreEstudiante}. Adjunto encontrarás tu certificado oficial por tu participación en: ${nombreEvento}.`,
      html: html,
      attachments: [
        {
          filename: `Certificado_${nombreEvento.replace(/\s+/g, "_")}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return true;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return false;
  }
};

module.exports = { enviarCorreoConCertificado };
