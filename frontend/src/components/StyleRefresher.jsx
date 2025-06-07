/**
 * StyleRefresher.jsx
 * Este componente ayuda a solucionar problemas de carga de estilos en aplicaciones SPA
 * Fuerza la recarga de estilos personalizados en cada cambio de ruta
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const StyleRefresher = () => {
  const location = useLocation();

  useEffect(() => {
    // Esta función se ejecutará cada vez que cambie la ruta
    const refreshStyles = () => {
      // 1. Forzar recálculo de estilos globales
      document.body.style.display = "none";
      // Este timeout de 0ms es suficiente para forzar un repintado
      setTimeout(() => {
        document.body.style.display = "";
      }, 0);

      // 2. Asegurarse de que las variables CSS se están aplicando correctamente
      const primaryColor = "#8a1538";
      document.documentElement.style.setProperty("--bs-primary", primaryColor);
      document.documentElement.style.setProperty(
        "--bs-primary-rgb",
        "138, 21, 56"
      );

      // 3. Aplicar estilos críticos directamente a los elementos que puedan tener problemas
      const inputGroupTexts = document.querySelectorAll(".input-group-text");
      inputGroupTexts.forEach((el) => {
        el.style.backgroundColor = primaryColor;
        el.style.borderColor = primaryColor;
        el.style.color = "white";
      });

      const primaryButtons = document.querySelectorAll(".btn-primary");
      primaryButtons.forEach((el) => {
        el.style.backgroundColor = primaryColor;
        el.style.borderColor = primaryColor;
      });
    };

    refreshStyles();

    // Limpieza al desmontar el componente
    return () => {
      // No es necesario limpiar nada en este caso
    };
  }, [location.pathname]); // Se ejecutará cuando cambie la ruta

  return null; // Este componente no renderiza nada
};

export default StyleRefresher;
