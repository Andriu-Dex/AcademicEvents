const { Resend } = require("resend");
const axios = require("axios");

const resendKey = process.env.RESEND_API_KEY || process.env.RENDER_API_KEY;
let resend = null;
if (resendKey) {
  resend = new Resend(resendKey);
}

console.log("Servicio de correo para certificados inicializado");

const enviarCorreoConCertificado = async (
  correoDestino,
  pdfBuffer,
  nombreEvento,
  nombreEstudiante
) => {
  try {
    console.log(`Intentando enviar certificado por correo a: ${correoDestino}`);
    const brevoKey = process.env.BREVO_API_KEY;

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

    const attachmentFilename = `Certificado_${nombreEvento.replace(/\s+/g, "_")}.pdf`;

    if (brevoKey) {
      console.log("[Mailer] Enviando certificado vía Brevo HTTP API");
      const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || "andriudex@gmail.com";
      const senderName = process.env.BREVO_SENDER_NAME || "AcademicEvents";

      const base64Content = Buffer.isBuffer(pdfBuffer) ? pdfBuffer.toString("base64") : pdfBuffer;

      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: senderName, email: senderEmail },
          to: [{ email: correoDestino }],
          subject: `Certificado - ${nombreEvento}`,
          htmlContent: html,
          attachment: [
            {
              name: attachmentFilename,
              content: base64Content,
            },
          ],
        },
        {
          headers: {
            "api-key": brevoKey,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Certificado enviado via Brevo. ID:", response.data.messageId);
      return true;
    } else if (resend) {
      console.log("[Mailer] Enviando certificado vía Resend");
      const fromEmail = process.env.RESEND_FROM_EMAIL || "AcademicEvents <onboarding@resend.dev>";
      
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: correoDestino,
        subject: `Certificado - ${nombreEvento}`,
        html: html,
        attachments: [
          {
            filename: attachmentFilename,
            content: pdfBuffer,
          },
        ],
      });

      if (error) {
        throw error;
      }

      console.log("Certificado enviado via Resend:", data.id);
      return true;
    } else {
      throw new Error("No hay un proveedor de correo configurado (Brevo ni Resend)");
    }
  } catch (error) {
    console.error("Error al enviar correo:", error.response ? error.response.data : error.message);
    return false;
  }
};

module.exports = { enviarCorreoConCertificado };
