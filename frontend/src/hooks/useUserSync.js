import { useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Hook personalizado para manejo inteligente de sincronización de usuario
 * Combina sincronización automática y manual de forma eficiente
 */
const useUserSync = (options = {}) => {
  const {
    enableAutoSync = true,
    enableWindowFocus = true,
    enableVisibilityChange = true,
    enablePeriodicSync = true,
    periodicSyncInterval = 5 * 60 * 1000, // 5 minutos por defecto
  } = options;

  const { usuario, syncUserData } = useAuth();

  // Sincronización manual optimizada
  const manualSync = useCallback(() => {
    if (syncUserData) {
      return syncUserData();
    }
  }, [syncUserData]);

  // Sincronización inicial
  useEffect(() => {
    if (!enableAutoSync || !usuario || !syncUserData) return;

    const timeoutId = setTimeout(() => {
      syncUserData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [usuario?.id, syncUserData, enableAutoSync]);

  // Sincronización por eventos del navegador
  useEffect(() => {
    if (!usuario || !syncUserData) return;

    const handleWindowFocus = () => {
      if (enableWindowFocus) {
        syncUserData();
      }
    };

    const handleVisibilityChange = () => {
      if (enableVisibilityChange && !document.hidden) {
        syncUserData();
      }
    };

    // Registrar eventos solo si están habilitados
    if (enableWindowFocus) {
      window.addEventListener("focus", handleWindowFocus);
    }
    if (enableVisibilityChange) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      if (enableWindowFocus) {
        window.removeEventListener("focus", handleWindowFocus);
      }
      if (enableVisibilityChange) {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      }
    };
  }, [usuario, syncUserData, enableWindowFocus, enableVisibilityChange]);

  // Sincronización periódica
  useEffect(() => {
    if (!enablePeriodicSync || !usuario || !syncUserData) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        syncUserData();
      }
    }, periodicSyncInterval);

    return () => clearInterval(interval);
  }, [usuario, syncUserData, enablePeriodicSync, periodicSyncInterval]);

  return {
    manualSync,
    isUserLoaded: !!usuario,
  };
};

export default useUserSync;
