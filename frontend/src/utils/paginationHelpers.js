/**
 * Utilidades para trabajar con paginación
 */

/**
 * Calcula los metadatos de paginación
 * @param {number} totalItems - Total de elementos
 * @param {number} itemsPerPage - Elementos por página
 * @param {number} currentPage - Página actual
 * @returns {Object} Objeto con metadatos de paginación
 */
export const calculatePaginationMetadata = (
  totalItems,
  itemsPerPage,
  currentPage
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem,
    endItem,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

/**
 * Genera un array con los números de página a mostrar
 * @param {number} currentPage - Página actual
 * @param {number} totalPages - Total de páginas
 * @param {number} maxVisiblePages - Máximo de páginas visibles
 * @returns {Array} Array con números de página o "..." para elipsis
 */
export const getPageNumbers = (
  currentPage,
  totalPages,
  maxVisiblePages = 5
) => {
  const pages = [];

  if (totalPages <= maxVisiblePages) {
    // Mostrar todas las páginas
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Lógica para mostrar páginas relevantes
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Agregar primera página
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Agregar páginas del rango
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Agregar última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
  }

  return pages;
};

/**
 * Genera un array con opciones de límite para selector
 * @param {Array} options - Opciones de límite (por defecto [10, 25, 50, 100])
 * @returns {Array} Array con objetos {value, label}
 */
export const getLimitOptions = (options = [10, 25, 50, 100]) => {
  return options.map((value) => ({
    value,
    label: `${value} por página`,
  }));
};

export default {
  calculatePaginationMetadata,
  getPageNumbers,
  getLimitOptions,
};
