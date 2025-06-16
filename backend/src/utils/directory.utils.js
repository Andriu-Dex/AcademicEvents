const fs = require("fs");
const path = require("path");

/**
 * Crea los directorios necesarios para el funcionamiento del sistema
 */
const setupDirectories = () => {
  const baseDir = path.join(__dirname, "../../uploads");

  // Directorios principales
  const directories = ["certificados", "temp", "profiles"];

  // Crear directorio base si no existe
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // Crear cada subdirectorio
  directories.forEach((dir) => {
    const dirPath = path.join(baseDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

module.exports = {
  setupDirectories,
};
