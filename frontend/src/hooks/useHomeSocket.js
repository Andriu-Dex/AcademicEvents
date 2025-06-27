import { useEffect, useState, useRef } from "react";
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
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Referencias para evitar bucles infinitos y procesar eventos una sola vez
  const processedEventIds = useRef(new Set());
  const processedInscriptionIds = useRef(new Set());
  const processedCuposIds = useRef(new Set());
  const processedCarreraIds = useRef(new Set());
  const processedNotificationIds = useRef(new Set()); // Manejar actualizaciones de eventos
  useEffect(() => {
    if (eventUpdates && eventUpdates.id && eventUpdates.data) {
      // Verificar si ya procesamos este evento
      if (processedEventIds.current.has(eventUpdates.id)) {
        return; // Ya procesado
      }

      // Marcar como procesado
      processedEventIds.current.add(eventUpdates.id);

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
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [eventUpdates]); // Solo eventUpdates como dependencia
  // Manejar actualizaciones de inscripciones
  useEffect(() => {
    if (
      inscriptionUpdates &&
      inscriptionUpdates.id &&
      inscriptionUpdates.data
    ) {
      // Verificar si ya procesamos este evento
      if (processedInscriptionIds.current.has(inscriptionUpdates.id)) {
        return; // Ya procesado
      }

      // Marcar como procesado
      processedInscriptionIds.current.add(inscriptionUpdates.id);

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
  }, [inscriptionUpdates]); // Solo inscriptionUpdates como dependencia
  // Manejar actualizaciones de cupos
  useEffect(() => {
    if (cuposUpdates && cuposUpdates.id && cuposUpdates.eventoId) {
      // Verificar si ya procesamos este evento
      if (processedCuposIds.current.has(cuposUpdates.id)) {
        return; // Ya procesado
      }

      // Marcar como procesado
      processedCuposIds.current.add(cuposUpdates.id);

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
  }, [cuposUpdates]); // Solo cuposUpdates como dependencia

  // Manejar actualizaciones de carreras
  useEffect(() => {
    if (carreraUpdates && carreraUpdates.data && carreraUpdates.id) {
      // Verificar si ya procesamos este evento usando su ID único
      if (processedCarreraIds.current.has(carreraUpdates.id)) {
        return; // Ya procesado, no hacer nada
      }

      // Marcar como procesado
      processedCarreraIds.current.add(carreraUpdates.id);

      console.log(
        "🏠 useHomeSocket: Procesando actualización de carrera:",
        carreraUpdates
      );
      setHasNewUpdates(true);
      setLastUpdateTime(new Date());

      // Ejecutar callback si está definido
      if (onCarreraUpdate && typeof onCarreraUpdate === "function") {
        onCarreraUpdate(carreraUpdates);
      }

      // Limpiar después de un tiempo
      if (autoRefresh) {
        const timer = setTimeout(() => {
          clearCarreraUpdates();
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [carreraUpdates]); // Solo carreraUpdates como dependencia

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
