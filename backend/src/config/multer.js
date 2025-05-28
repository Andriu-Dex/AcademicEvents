const multer = require("multer");

const storage = multer.memoryStorage(); // Usar memoria RAM, no disco

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // límite 5MB (ajusta si quieres)
    fileFilter: (req, file, cb) => {
        // Acepta solo imágenes
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Solo se permiten archivos de imagen"));
        }
        cb(null, true);
    },
});

module.exports = upload;
