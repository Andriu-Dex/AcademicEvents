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
    console.log("✅ Directorio base de uploads creado");
  }

  // Crear cada subdirectorio
  directories.forEach((dir) => {
    const dirPath = path.join(baseDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Directorio ${dir} creado`);
    }
  });

  console.log("✅ Estructura de directorios verificada correctamente");
};

module.exports = {
  setupDirectories,
};
