const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Asegurar que el directorio de uploads exista
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar almacenamiento en disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único con timestamp
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Acepta PDFs e imágenes para compatibilidad
  const mimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif"];

  if (!mimeTypes.includes(file.mimetype)) {
    return cb(new Error("Solo se permiten archivos PDF o imágenes"));
  }
  cb(null, true);
};

const limits = {
  fileSize: 5 * 1024 * 1024, // límite 5MB por archivo
};

// Middleware para subir un solo archivo
const upload = multer({
  storage,
  limits,
  fileFilter,
});

// Middleware para subir múltiples archivos con campos específicos
const uploadFields = multer({
  storage,
  limits,
  fileFilter,
});

module.exports = {
  single: upload.single.bind(upload),
  fields: uploadFields.fields.bind(uploadFields),
  array: upload.array.bind(upload),
};
