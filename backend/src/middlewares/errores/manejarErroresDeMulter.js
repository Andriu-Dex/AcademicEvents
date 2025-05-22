const multer = require("multer");

module.exports = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          msg: "El archivo excede el tamaño máximo permitido (5 MB)",
        });
      }
    }

    if (err.message?.includes("Solo se permiten archivos")) {
      return res.status(400).json({ msg: err.message });
    }

    return res.status(400).json({ msg: "Error al subir archivo" });
  }

  next();
};
