const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Ruta a la carpeta de archivos temporales
const tempUploadsPath = path.join(__dirname, '../../uploads/temp');

// Función para verificar si un archivo es más viejo que cierto tiempo
const isFileOld = (filePath, hours = 24) => {
  const stats = fs.statSync(filePath);
  const fileAge = (Date.now() - stats.mtime) / 1000 / 60 / 60; // Edad en horas
  return fileAge > hours;
};

// Función para limpiar un solo archivo
const cleanupFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
    console.log(`✅ Archivo temporal eliminado: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar archivo ${filePath}:`, error.message);
    return false;
  }
};

// Función principal de limpieza
const cleanup = () => {
  console.log('🧹 Iniciando limpieza de archivos temporales...');
  
  try {
    // Verificar si la carpeta temporal existe
    if (!fs.existsSync(tempUploadsPath)) {
      console.log('📁 Carpeta temporal no existe, no hay nada que limpiar');
      return;
    }

    // Leer todos los archivos en la carpeta temporal
    const files = fs.readdirSync(tempUploadsPath);
    
    if (files.length === 0) {
      console.log('📂 No hay archivos temporales para limpiar');
      return;
    }

    let deletedCount = 0;
    let errorCount = 0;

    // Procesar cada archivo
    files.forEach(file => {
      const filePath = path.join(tempUploadsPath, file);
      
      try {
        // Solo eliminar archivos más viejos que 24 horas
        if (isFileOld(filePath, 24)) {
          if (cleanupFile(filePath)) {
            deletedCount++;
          } else {
            errorCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error procesando archivo ${file}:`, error.message);
        errorCount++;
      }
    });

    console.log(`🧹 Limpieza completada: ${deletedCount} archivos eliminados, ${errorCount} errores`);
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
  }
};

// Programar la tarea para ejecutarse cada 12 horas
const scheduledCleanup = () => {
  // Ejecutar la limpieza inmediatamente al iniciar el servidor
  cleanup();
  
  // Programar la limpieza para ejecutarse cada 12 horas
  cron.schedule('0 */12 * * *', () => {
    cleanup();
  });
};

module.exports = {
  cleanup,
  scheduledCleanup
};
