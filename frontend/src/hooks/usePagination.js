import { useState, useCallback, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";

/**
 * Hook personalizado para manejar paginación
 * @param {string} endpoint - URL del endpoint de la API
 * @param {number} initialLimit - Número inicial de elementos por página
 * @param {Object} dependencies - Dependencias que dispararán re-fetch
 * @returns {Object} Objeto con datos y métodos de paginación
 */
export const usePagination = (
  endpoint,
  initialLimit = 10,
  dependencies = []
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (filters = {}, page = currentPage) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: itemsPerPage,
          ...filters,
        };

        const response = await axiosInstance.get(endpoint, { params });

        if (response.data.data) {
          setData(response.data.data);
          setTotalItems(response.data.pagination.totalItems);
          setTotalPages(response.data.pagination.totalPages);
        } else {
          // Compatibilidad con endpoints que no usan el formato estándar
          setData(response.data);
          setTotalItems(response.data.length);
          setTotalPages(1);
        }

        return response.data;
      } catch (error) {
        console.error("Error fetchData en usePagination:", error);
        setError(error.response?.data?.message || "Error al cargar datos");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, currentPage, itemsPerPage]
  );

  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [totalPages, currentPage]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setData([]);
    setTotalItems(0);
    setTotalPages(0);
  }, []);

  // Efecto para re-fetch cuando cambian las dependencias
  useEffect(() => {
    if (dependencies.length > 0) {
      resetPagination();
    }
  }, dependencies);

  // Efecto para cargar datos cuando cambia la página
  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  return {
    // Datos
    data,
    loading,
    error,

    // Metadatos de paginación
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    // Métodos
    fetchData,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,

    // Estados derivados
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,

    // Información para mostrar al usuario
    startItem: totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems),
  };
};

export default usePagination;
