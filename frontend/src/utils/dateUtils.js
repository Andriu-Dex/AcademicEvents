/**
 * Utilidades para manejo de fechas en el frontend
 */

/**
 * Convierte una fecha de JavaScript a formato ISO manteniendo la hora local como UTC
 * Evita la conversión automática de zona horaria
 * @param {Date} date - Objeto Date de JavaScript
 * @returns {string} - Fecha en formato ISO 8601 completo tratando la hora local como UTC
 */
export const formatDateForBackend = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return null;
  }

  // Crear fecha UTC usando los componentes locales para evitar conversión de zona horaria
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );

  return utcDate.toISOString();
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
 * Verifica si una fecha es mayor o igual que hoy
 * @param {Date} date - Fecha a verificar
 * @returns {boolean} - true si la fecha es hoy o posterior
 */
export const isDateTodayOrLater = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date >= today;
};

/**
 * @deprecated Use isDateTodayOrLater instead. Kept for backwards compatibility.
 */
export const isTomorrowOrLater = isDateTodayOrLater;

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

/**
 * Convierte una fecha UTC del backend a display local manteniendo la hora exacta
 * @param {string} utcDateString - Fecha en formato ISO UTC del backend
 * @param {object} options - Opciones de formato
 * @returns {string} - Fecha formateada para display local
 */
export const formatUTCForLocalDisplay = (utcDateString, options = {}) => {
  if (!utcDateString) return "";

  try {
    // Parsear la fecha UTC directamente
    const date = new Date(utcDateString);

    if (isNaN(date)) return "";

    const defaultOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "UTC", // Mantener UTC para evitar conversiones automáticas
    };

    return date.toLocaleString("es-EC", { ...defaultOptions, ...options });
  } catch (error) {
    console.error("Error al formatear fecha UTC para display:", error);
    return "";
  }
};

/**
 * Convierte una fecha UTC del backend a Date local para el DatePicker
 * sin conversión de zona horaria
 * @param {string} utcDateString - Fecha en formato ISO UTC del backend
 * @returns {Date|null} - Objeto Date para DatePicker manteniendo la hora exacta
 */
export const formatUTCForDatePicker = (utcDateString) => {
  if (!utcDateString) return null;

  try {
    // Parsear la fecha UTC y extraer componentes
    const date = new Date(utcDateString);

    if (isNaN(date)) return null;

    // Crear nueva fecha usando los componentes UTC como si fueran locales
    // Esto evita la conversión automática de zona horaria
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    );
  } catch (error) {
    console.error("Error al formatear fecha UTC para DatePicker:", error);
    return null;
  }
};
