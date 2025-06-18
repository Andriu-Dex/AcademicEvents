import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Hook personalizado para manejar actualizaciones en tiempo real en la vista Home
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.onEventUpdate - Callback cuando hay cambios en eventos
 * @param {Function} options.onInscriptionUpdate - Callback cuando hay cambios en inscripciones
 * @param {Function} options.onCuposUpdate - Callback cuando hay cambios en cupos
 * @param {Function} options.onCarreraUpdate - Callback cuando hay cambios en carreras
 * @param {Function} options.onSystemNotification - Callback para notificaciones del sistema
 * @param {boolean} options.autoRefresh - Si debe refrescar automáticamente los datos
 */
export const useHomeSocket = (options = {}) => {
  const {
    onEventUpdate,
    onInscriptionUpdate,
    onCuposUpdate,
    onCarreraUpdate,
    onSystemNotification,
    autoRefresh = true,
  } = options;

  const {
    isConnected,
    eventUpdates,
    inscriptionUpdates,
    cuposUpdates,
    carreraUpdates,
    systemNotifications,
    clearEventUpdates,
    clearInscriptionUpdates,
    clearCuposUpdates,
    clearCarreraUpdates,
    removeSystemNotification,
  } = useSocket();

  // Estado local para manejar las actualizaciones
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null); // Manejar actualizaciones de eventos
  useEffect(() => {
    if (eventUpdates && eventUpdates.id && eventUpdates.data) {
      setHasNewUpdates(true);
      setLastUpdateTime(new Date());

      // Ejecutar callback si está definido
      if (onEventUpdate && typeof onEventUpdate === "function") {
        onEventUpdate(eventUpdates);
      }

      // Auto-limpiar después de un tiempo
      if (autoRefresh) {
        const timer = setTimeout(() => {
          clearEventUpdates();
        }, 100); // Limpiar rápidamente para permitir nuevas actualizaciones

        return () => clearTimeout(timer);
      }
    }
  }, [eventUpdates, onEventUpdate, autoRefresh, clearEventUpdates]);
  // Manejar actualizaciones de inscripciones
  useEffect(() => {
    if (
      inscriptionUpdates &&
      inscriptionUpdates.id &&
      inscriptionUpdates.data
    ) {
      setHasNewUpdates(true);
      setLastUpdateTime(new Date());

      // Ejecutar callback si está definido
      if (onInscriptionUpdate && typeof onInscriptionUpdate === "function") {
        onInscriptionUpdate(inscriptionUpdates);
      }

      // Auto-limpiar después de un tiempo
      if (autoRefresh) {
        const timer = setTimeout(() => {
          clearInscriptionUpdates();
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [
    inscriptionUpdates,
    onInscriptionUpdate,
    autoRefresh,
    clearInscriptionUpdates,
  ]);
  // Manejar actualizaciones de cupos
  useEffect(() => {
    if (cuposUpdates && cuposUpdates.id && cuposUpdates.eventoId) {
      setHasNewUpdates(true);
      setLastUpdateTime(new Date());

      // Ejecutar callback si está definido
      if (onCuposUpdate && typeof onCuposUpdate === "function") {
        onCuposUpdate(cuposUpdates);
      }

      // Auto-limpiar después de un tiempo
      if (autoRefresh) {
        const timer = setTimeout(() => {
          clearCuposUpdates();
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [cuposUpdates, onCuposUpdate, autoRefresh, clearCuposUpdates]);

  // Manejar actualizaciones de carreras
  useEffect(() => {
    if (carreraUpdates && carreraUpdates.id && carreraUpdates.data) {
      setHasNewUpdates(true);
      setLastUpdateTime(new Date());

      // Ejecutar callback si está definido
      if (onCarreraUpdate && typeof onCarreraUpdate === "function") {
        onCarreraUpdate(carreraUpdates);
      }

      // Auto-limpiar después de un tiempo
      if (autoRefresh) {
        const timer = setTimeout(() => {
          clearCarreraUpdates();
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [carreraUpdates, onCarreraUpdate, autoRefresh, clearCarreraUpdates]);

  // Manejar notificaciones del sistema
  useEffect(() => {
    if (systemNotifications.length > 0) {
      const latestNotification =
        systemNotifications[systemNotifications.length - 1];

      // Ejecutar callback si está definido
      if (onSystemNotification && typeof onSystemNotification === "function") {
        onSystemNotification(latestNotification);
      }

      // Auto-remover notificaciones después de un tiempo
      if (autoRefresh) {
        const timer = setTimeout(() => {
          removeSystemNotification(latestNotification.id);
        }, 5000); // 5 segundos

        return () => clearTimeout(timer);
      }
    }
  }, [
    systemNotifications,
    onSystemNotification,
    autoRefresh,
    removeSystemNotification,
  ]);

  // Función para marcar como visto las actualizaciones
  const markUpdatesAsSeen = () => {
    setHasNewUpdates(false);
  };

  // Función para obtener el resumen de actualizaciones
  const getUpdatesSummary = () => {
    const summary = {
      hasUpdates: hasNewUpdates,
      lastUpdate: lastUpdateTime,
      eventUpdates: eventUpdates,
      inscriptionUpdates: inscriptionUpdates,
      cuposUpdates: cuposUpdates,
      carreraUpdates: carreraUpdates,
      systemNotifications: systemNotifications,
      totalNotifications: systemNotifications.length,
    };

    return summary;
  };

  // Función para forzar limpieza de todas las actualizaciones
  const clearAllUpdates = () => {
    clearEventUpdates();
    clearInscriptionUpdates();
    clearCuposUpdates();
    clearCarreraUpdates();
    setHasNewUpdates(false);
  };

  return {
    // Estado de la conexión
    isConnected,

    // Estado de las actualizaciones
    hasNewUpdates,
    lastUpdateTime,

    // Datos actuales
    eventUpdates,
    inscriptionUpdates,
    cuposUpdates,
    carreraUpdates,
    systemNotifications,

    // Funciones de control
    markUpdatesAsSeen,
    getUpdatesSummary,
    clearAllUpdates,

    // Funciones de limpieza individual
    clearEventUpdates,
    clearInscriptionUpdates,
    clearCuposUpdates,
    clearCarreraUpdates,
    removeSystemNotification,
  };
};

export default useHomeSocket;
