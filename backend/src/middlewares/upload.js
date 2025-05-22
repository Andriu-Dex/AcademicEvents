// Importación de módulos necesarios
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ruta absoluta a la carpeta donde se guardarán los archivos subidos
const rutaUploads = path.join(__dirname, "../../uploads");

// Verifica si la carpeta 'uploads' existe, si no, la crea
if (!fs.existsSync(rutaUploads)) {
  fs.mkdirSync(rutaUploads, { recursive: true }); // Se agrega { recursive: true } para seguridad futura
}

// Configuración del almacenamiento con multer
const storage = multer.diskStorage({
  // Define el destino de los archivos
  destination: (req, file, cb) => {
    cb(null, rutaUploads);
  },

  // Define cómo se llamarán los archivos guardados
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now(); // Marca de tiempo para evitar nombres repetidos
    const nombre = `${timestamp}-${file.fieldname}${ext}`;
    cb(null, nombre);
  },
});

// Filtro para aceptar solo archivos con extensiones válidas y tipos MIME válidos
const fileFilter = (req, file, cb) => {
  const extensionesPermitidas = /\.(jpeg|jpg|png|pdf)$/;
  const mimetiposPermitidos = ["image/jpeg", "image/png", "application/pdf"];

  const esExtensionValida = extensionesPermitidas.test(
    path.extname(file.originalname).toLowerCase()
  );
  const esMimeValido = mimetiposPermitidos.includes(file.mimetype);

  if (esExtensionValida && esMimeValido) {
    cb(null, true); // Archivo válido
  } else {
    cb(new Error("Solo se permiten archivos JPEG, PNG o PDF con tipo válido"));
  }
};

// Middleware multer configurado
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Exportación del middleware para uso en rutas
module.exports = upload;
