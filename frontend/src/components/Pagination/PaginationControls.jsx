import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import "./PaginationControls.css";

/**
 * Componente de controles de paginación reutilizable
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente de controles de paginación
 */
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  totalItems,
  itemsPerPage,
  loading = false,
  className = "",
  showInfo = true,
  showNumbers = true,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
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

  return (
    <div className={`pagination-controls-pc ${className}`}>
      {showInfo && (
        <div className="pagination-info-pc">
          {totalItems > 0 ? (
            <>
              Mostrando {startItem} a {endItem} de {totalItems} resultados
            </>
          ) : (
            <>No hay resultados para mostrar</>
          )}
        </div>
      )}

      <div className="pagination-buttons-pc">
        <button
          className="pagination-btn-pc pagination-prev-pc"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || loading}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
          <span className="pagination-btn-text-pc">Anterior</span>
        </button>

        {showNumbers && (
          <div className="pagination-numbers-pc">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="pagination-ellipsis-pc">
                    <MoreHorizontal size={16} />
                  </span>
                ) : (
                  <button
                    className={`pagination-number-pc ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    aria-label={`Ir a página ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <button
          className="pagination-btn-pc pagination-next-pc"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          aria-label="Página siguiente"
        >
          <span className="pagination-btn-text-pc">Siguiente</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
