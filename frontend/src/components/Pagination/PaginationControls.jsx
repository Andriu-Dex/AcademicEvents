import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import "./PaginationControls.css";

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
  const pageButtonRefs = useRef(new Map());
  const [pendingFocusPage, setPendingFocusPage] = useState(null);

  const pageNumbers = useMemo(() => {
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        pages.push(pageNumber);
      }

      return pages;
    }

    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
      pages.push(pageNumber);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, maxVisiblePages, totalPages]);

  useEffect(() => {
    if (pendingFocusPage === null) {
      return;
    }

    const targetButton = pageButtonRefs.current.get(pendingFocusPage);
    targetButton?.focus();
    setPendingFocusPage(null);
  }, [currentPage, pendingFocusPage]);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const changePage = (targetPage, shouldFocus = false) => {
    if (
      loading ||
      targetPage < 1 ||
      targetPage > totalPages ||
      targetPage === currentPage
    ) {
      return;
    }

    if (shouldFocus) {
      setPendingFocusPage(targetPage);
    }

    onPageChange(targetPage);
  };

  const handlePageKeyDown = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        changePage(currentPage - 1, true);
        break;
      case "ArrowRight":
        event.preventDefault();
        changePage(currentPage + 1, true);
        break;
      case "Home":
        event.preventDefault();
        changePage(1, true);
        break;
      case "End":
        event.preventDefault();
        changePage(totalPages, true);
        break;
      default:
        break;
    }
  };

  return (
    <nav className={`pagination-controls-pc ${className}`} aria-label="Paginación">
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
          type="button"
          className="pagination-btn-pc pagination-prev-pc"
          onClick={() => changePage(currentPage - 1)}
          disabled={!hasPrevPage || loading}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span className="pagination-btn-text-pc">Anterior</span>
        </button>

        {showNumbers && (
          <div className="pagination-numbers-pc" role="group" aria-label="Páginas disponibles">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={`${page}-${index}`}>
                {page === "..." ? (
                  <span className="pagination-ellipsis-pc" aria-hidden="true">
                    <MoreHorizontal size={16} />
                  </span>
                ) : (
                  <button
                    ref={(node) => {
                      if (node) {
                        pageButtonRefs.current.set(page, node);
                        return;
                      }

                      pageButtonRefs.current.delete(page);
                    }}
                    type="button"
                    className={`pagination-number-pc ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => changePage(page)}
                    onKeyDown={handlePageKeyDown}
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
          type="button"
          className="pagination-btn-pc pagination-next-pc"
          onClick={() => changePage(currentPage + 1)}
          disabled={!hasNextPage || loading}
          aria-label="Página siguiente"
        >
          <span className="pagination-btn-text-pc">Siguiente</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default PaginationControls;
