const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const enviarCorreoConCertificado = async (correoDestino, pdfBuffer) => {
  try {
    await transporter.sendMail({
      from: `"AcademicEvents" <${process.env.SMTP_USER}>`,
      to: correoDestino,
      subject: "Certificado de participación",
      text: "Adjunto encontrará su certificado en formato PDF.",
      attachments: [
        {
          filename: "certificado.pdf",
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
