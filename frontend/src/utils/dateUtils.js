/**
 * Utilidades para manejo de fechas en el frontend
 */

/**
 * Convierte una fecha de JavaScript a formato ISO compatible con el backend
 * @param {Date} date - Objeto Date de JavaScript
 * @returns {string} - Fecha en formato ISO 8601 completo
 */
export const formatDateForBackend = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return null;
  }

  // Siempre devolver el formato ISO completo con 'Z' para indicar UTC
  return date.toISOString();
};

/**
 * Analiza una fecha desde el formato ISO y la convierte a objeto Date
 * @param {string} isoString - Fecha en formato ISO
 * @returns {Date|null} - Objeto Date o null si la fecha es inválida
 */
export const parseISODate = (isoString) => {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);
    return isNaN(date) ? null : date;
  } catch (error) {
    console.error("Error al analizar la fecha ISO:", error);
    return null;
  }
};

/**
 * Formatea una fecha en formato legible para el usuario
 * @param {string|Date} date - Fecha a formatear
 * @param {object} options - Opciones de formato
 * @returns {string} - Fecha formateada
 */
export const formatDateForDisplay = (date, options = {}) => {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj)) return "";

  const defaultOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };

  return dateObj.toLocaleString("es-ES", { ...defaultOptions, ...options });
};

/**
 * Verifica si una fecha es mayor o igual que mañana
 * @param {Date} date - Fecha a verificar
 * @returns {boolean} - true si la fecha es mañana o posterior
 */
export const isTomorrowOrLater = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return false;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return date >= tomorrow;
};

/**
 * Formatea la fecha en el formato esperado por el componente DatePicker
 * @param {string|Date} date - Fecha a formatear
 * @returns {Date|null} - Objeto Date para DatePicker
 */
export const formatDateForPicker = (date) => {
  if (!date) return null;

  try {
    return date instanceof Date ? date : new Date(date);
  } catch (error) {
    console.error("Error al formatear fecha para DatePicker:", error);
    return null;
  }
};

/**
 * Formatea una fecha para reportes evitando problemas de zona horaria
 * @param {Date} date - Objeto Date de JavaScript
 * @returns {string} - Fecha en formato YYYY-MM-DD sin conversión de zona horaria
 */
export const formatDateForReports = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return null;
  }

  // Usar getFullYear, getMonth y getDate para evitar problemas de zona horaria
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};
