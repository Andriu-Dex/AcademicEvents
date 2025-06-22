import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
import { DEFAULT_ACTIVE_STATISTICS } from "../utils/statistics";

/**
 * Hook personalizado para cargar y manejar las estadísticas configurables del Home
 * @returns {Object} Estadísticas y funciones relacionadas
 */
export const useConfigurableStats = () => {
  // Estado para todas las estadísticas disponibles
  const [allStats, setAllStats] = useState({});

  // Estado para las estadísticas que se mostrarán (configuradas por el admin)
  const [activeStats, setActiveStats] = useState(DEFAULT_ACTIVE_STATISTICS);

  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Estado de error
  const [error, setError] = useState(null);
  // Función para actualizar las estadísticas activas desde StatisticsConfig
  const updateActiveStats = (newActiveStats) => {
    setActiveStats(newActiveStats);
    // También guardamos en localStorage para persistencia temporal
    localStorage.setItem("activeStatistics", JSON.stringify(newActiveStats));

    // Disparar evento personalizado para sincronización inmediata
    window.dispatchEvent(
      new CustomEvent("activeStatsChange", {
        detail: { activeStats: newActiveStats },
      })
    );
  };
  // Cargar estadísticas y configuración
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar todas las estadísticas disponibles
        const statsResponse = await axiosInstance.get("/estadisticas/home");
        setAllStats(statsResponse.data || {});

        // Cargar configuración desde localStorage o usar predeterminadas
        const savedConfig = localStorage.getItem("activeStatistics");
        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
            setActiveStats(parsedConfig);
          } catch (e) {
            console.error("Error parsing saved config:", e);
            setActiveStats(DEFAULT_ACTIVE_STATISTICS);
          }
        } else {
          setActiveStats(DEFAULT_ACTIVE_STATISTICS);
        }
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
        setError("No se pudieron cargar las estadísticas");
        // En caso de error, usar valores guardados o predeterminados
        const savedConfig = localStorage.getItem("activeStatistics");
        if (savedConfig) {
          try {
            setActiveStats(JSON.parse(savedConfig));
          } catch (e) {
            setActiveStats(DEFAULT_ACTIVE_STATISTICS);
          }
        } else {
          setActiveStats(DEFAULT_ACTIVE_STATISTICS);
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats(); // Escuchar cambios en localStorage para sincronización en tiempo real
    const handleStorageChange = (e) => {
      if (e.key === "activeStatistics") {
        try {
          const newActiveStats = e.newValue
            ? JSON.parse(e.newValue)
            : DEFAULT_ACTIVE_STATISTICS;
          setActiveStats(newActiveStats);
        } catch (error) {
          console.error("Error parsing storage change:", error);
          setActiveStats(DEFAULT_ACTIVE_STATISTICS);
        }
      }
    };

    // Escuchar eventos personalizados para sincronización inmediata
    const handleCustomStatsChange = (e) => {
      const { activeStats: newActiveStats } = e.detail;
      setActiveStats(newActiveStats);
    };

    // Agregar listeners para cambios
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("activeStatsChange", handleCustomStatsChange);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("activeStatsChange", handleCustomStatsChange);
    };
  }, []);

  // Obtener solo las estadísticas activas para mostrar
  const getActiveStatsData = () => {
    const activeStatsData = {};

    // Si no hay estadísticas configuradas, retornar objeto vacío
    if (activeStats.length === 0) {
      return {};
    }

    // Para cada estadística activa, obtener su valor
    activeStats.forEach((statId) => {
      if (allStats.hasOwnProperty(statId)) {
        activeStatsData[statId] = allStats[statId];
      }
    });

    return activeStatsData;
  };

  return {
    allStats,
    activeStats,
    activeStatsData: getActiveStatsData(),
    loading,
    error,
    updateActiveStats,
  };
};
