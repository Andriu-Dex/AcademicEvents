import { useEffect, useCallback, useRef } from "react";
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
  const syncUserDataRef = useRef(syncUserData);

  useEffect(() => {
    syncUserDataRef.current = syncUserData;
  }, [syncUserData]);

  // Sincronización manual optimizada
  const manualSync = useCallback(() => {
    if (syncUserDataRef.current) {
      return syncUserDataRef.current();
    }
  }, []);

  // Sincronización inicial
  useEffect(() => {
    if (!enableAutoSync || !usuario || !syncUserDataRef.current) return;

    const timeoutId = setTimeout(() => {
      syncUserDataRef.current?.();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [usuario?.id, enableAutoSync]);

  // Sincronización por eventos del navegador
  useEffect(() => {
    if (!usuario || !syncUserDataRef.current) return;

    const handleWindowFocus = () => {
      if (enableWindowFocus) {
        syncUserDataRef.current?.();
      }
    };

    const handleVisibilityChange = () => {
      if (enableVisibilityChange && !document.hidden) {
        syncUserDataRef.current?.();
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
  }, [usuario?.id, enableWindowFocus, enableVisibilityChange]);

  // Sincronización periódica
  useEffect(() => {
    if (!enablePeriodicSync || !usuario || !syncUserDataRef.current) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        syncUserDataRef.current?.();
      }
    }, periodicSyncInterval);

    return () => clearInterval(interval);
  }, [usuario?.id, enablePeriodicSync, periodicSyncInterval]);

  return {
    manualSync,
    isUserLoaded: !!usuario,
  };
};

export default useUserSync;
