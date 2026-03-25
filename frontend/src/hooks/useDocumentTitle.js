import { useEffect } from "react";

/**
 * Hook para establecer el título del documento de forma dinámica
 * Mejora la accesibilidad al proporcionar títulos únicos por página
 * WCAG 2.1 - 2.4.2 Page Titled (Level A)
 *
 * @param {string} title - El título de la página
 * @param {string} suffix - Sufijo opcional (por defecto: "AcademicEvents")
 *
 * @example
 * useDocumentTitle("Iniciar Sesión");
 * // Resultado: "Iniciar Sesión - AcademicEvents"
 *
 * @example
 * useDocumentTitle("Dashboard", "Admin Panel");
 * // Resultado: "Dashboard - Admin Panel"
 */
const useDocumentTitle = (title, suffix = "AcademicEvents") => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - ${suffix}` : suffix;

    // Restaurar título anterior al desmontar (opcional)
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};

export default useDocumentTitle;
