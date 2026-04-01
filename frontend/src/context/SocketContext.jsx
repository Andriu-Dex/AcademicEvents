import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

/**
 * Contexto de Socket.IO para la aplicación
 * Maneja la conexión y eventos de tiempo real enfocado en la vista Home
 */

// Crear contexto
const SocketContext = createContext();

// Hook personalizado para usar el contexto
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket debe ser usado dentro de un SocketProvider");
  }
  return context;
};

// Proveedor del contexto
export const SocketProvider = ({ children }) => {
  const { usuario, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Estados específicos para el Home
  const [eventUpdates, setEventUpdates] = useState(null);
  const [inscriptionUpdates, setInscriptionUpdates] = useState(null);
  const [cuposUpdates, setCuposUpdates] = useState(null);
  const [carreraUpdates, setCarreraUpdates] = useState(null);
  const [systemNotifications, setSystemNotifications] = useState([]);

  useEffect(() => {
    // Configurar conexión con el backend
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    console.log("🔌 Conectando a Socket.IO:", backendUrl);

    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    });

    // Eventos de conexión
    newSocket.on("connect", () => {
      console.log("✅ [SOCKET_CONTEXT] Socket.IO conectado:", newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      setSocket(newSocket);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ [SOCKET_CONTEXT] Socket.IO desconectado:", reason);
      setIsConnected(false);
      setSocket(null);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ [SOCKET_CONTEXT] Error de conexión Socket.IO:", error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // ======================================
    // Limpiar listeners previos para evitar duplicados
    // ======================================
    newSocket.off("evento-change-hm");
    newSocket.off("inscripcion-change-hm");
    newSocket.off("cupos-change-hm");
    newSocket.off("carrera-change-hm");
    newSocket.off("system-notification-hm");
    newSocket.off("user-inscription-update");
    newSocket.off("admin-notification");

    // ======================================
    // Eventos específicos para el Home
    // ======================================    // Cambios en eventos
    newSocket.on("evento-change-hm", (data) => {
      // Validar que los datos estén completos
      if (!data || !data.action || !data.data) {
        console.warn(
          "📡 [SOCKET_CONTEXT] Datos de evento incompletos recibidos",
          data
        );
        return;
      }

      const eventoId =
        data.data?.id ?? data.data?.id_eve ?? data.data?.evento?.id ?? data.data?.evento?.id_eve ?? null;
      const nombreEvento =
        data.data?.name ??
        data.data?.nom_eve ??
        data.data?.title ??
        data.data?.evento?.name ??
        data.data?.evento?.nom_eve ??
        null;

      console.log("✅ [SOCKET_CONTEXT] Evento recibido:", {
        action: data.action,
        eventoId,
        nombreEvento,
        timestamp: data.timestamp,
      });

      setEventUpdates({
        action: data.action,
        data: data.data,
        timestamp: data.timestamp,
        id: Date.now(), // ID único para forzar re-render
      });
    });

    // Cambios en inscripciones
    newSocket.on("inscripcion-change-hm", (data) => {
      // Validar que los datos estén completos
      if (!data || !data.action || !data.data) {
        console.warn(
          "📡 [SOCKET_CONTEXT] Datos de inscripción incompletos recibidos",
          data
        );
        return;
      }

      console.log("✅ [SOCKET_CONTEXT] Cambio en inscripción recibido:", {
        action: data.action,
        inscripcionId: data.data?.inscripcion?.id || data.data?.inscripcion?.id_ins,
        eventoNombre: data.data?.evento?.name || data.data?.evento?.nom_eve,
        timestamp: data.timestamp,
      });

      setInscriptionUpdates({
        action: data.action,
        data: data.data,
        timestamp: data.timestamp,
        id: Date.now(),
      });
    });

    // Evento específico para validación de inscripciones (AdminInscripciones)
    newSocket.on("inscription-validation-change", (data) => {
      console.log(
        "✅ [SOCKET_CONTEXT] Evento de validación de inscripción recibido:",
        {
          action: data.action,
          inscripcionId: data.data?.id,
          priority: data.priority,
          timestamp: data.timestamp,
        }
      );
    });

    // Cambios en cupos
    newSocket.on("cupos-change-hm", (data) => {
      // Validar que los datos estén completos
      if (
        !data ||
        typeof data.eventoId === "undefined" ||
        typeof data.cuposDisponibles === "undefined"
      ) {
        console.warn(
          "📡 [SOCKET_CONTEXT] Datos de cupos incompletos recibidos",
          data
        );
        return;
      }

      console.log("✅ [SOCKET_CONTEXT] Cambio en cupos recibido:", {
        eventoId: data.eventoId,
        cuposDisponibles: data.cuposDisponibles,
        timestamp: data.timestamp,
      });

      setCuposUpdates({
        eventoId: data.eventoId,
        cuposDisponibles: data.cuposDisponibles,
        timestamp: data.timestamp,
        id: Date.now(),
      });
    }); // Cambios en carreras
    newSocket.on("carrera-change-hm", (data) => {
      // Validar que los datos estén completos
      if (!data || !data.action || !data.data) {
        console.warn(
          "SocketContext: Datos de carrera incompletos recibidos",
          data
        );
        return;
      }

      console.log("📡 Cambio en carrera recibido:", data);
      setCarreraUpdates({
        action: data.action,
        data: data.data,
        timestamp: data.timestamp,
        id: Date.now(),
      });
    });

    // Notificaciones del sistema
    newSocket.on("system-notification-hm", (data) => {
      console.log("📡 Notificación del sistema recibida:", data);
      setSystemNotifications((prev) => [
        ...prev,
        {
          ...data,
          id: Date.now(),
        },
      ]);
    });

    // Evento específico para actualizaciones de inscripciones de usuario
    newSocket.on("user-inscription-update", (data) => {
      console.log("📡 Actualización de inscripción de usuario recibida:", data);
    });

    // Evento específico para notificaciones administrativas
    newSocket.on("admin-notification", (data) => {
      console.log("📡 Notificación administrativa recibida:", data);
      setSystemNotifications((prev) => [
        ...prev,
        {
          ...data,
          id: Date.now(),
        },
      ]);
    });

    // Limpiar al desmontar
    return () => {
      if (import.meta.env.DEV) {
        console.log("🔌 Desconectando Socket.IO (dev mode)");
      }

      // Remover todos los listeners específicos antes de desconectar
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("evento-change-hm");
      newSocket.off("inscripcion-change-hm");
      newSocket.off("cupos-change-hm");
      newSocket.off("carrera-change-hm");
      newSocket.off("system-notification-hm");
      newSocket.off("user-inscription-update");
      newSocket.off("admin-notification");

      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !isConnected || !token || !usuario) {
      return;
    }

    const role = usuario.rol_usu || usuario.role;
    const userId = usuario.id || usuario.id_cue;

    if (!userId || !role) {
      console.warn("⚠️ [SOCKET_CONTEXT] Datos insuficientes para autenticar socket", {
        userId,
        role,
      });
      return;
    }

    console.log("📤 [SOCKET_CONTEXT] Enviando autenticación por socket:", {
      userId,
      role,
    });

    socket.emit("authenticate", {
      userId,
      role,
      token,
    });
  }, [socket, isConnected, token, usuario]);

  // Funciones auxiliares
  const clearEventUpdates = () => setEventUpdates(null);
  const clearInscriptionUpdates = () => setInscriptionUpdates(null);
  const clearCuposUpdates = () => setCuposUpdates(null);
  const clearCarreraUpdates = () => setCarreraUpdates(null);
  const clearSystemNotifications = () => setSystemNotifications([]);

  const removeSystemNotification = (id) => {
    setSystemNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Función para unirse a salas (para futuras implementaciones)
  const joinRoom = (roomName) => {
    if (socket && isConnected) {
      socket.emit("join-room", roomName);
      console.log(`📫 Uniéndose a la sala: ${roomName}`);
    }
  };

  const value = {
    // Estado de la conexión
    socket,
    isConnected,
    connectionError,

    // Datos de eventos en tiempo real para Home
    eventUpdates,
    inscriptionUpdates,
    cuposUpdates,
    carreraUpdates,
    systemNotifications,

    // Funciones de limpieza
    clearEventUpdates,
    clearInscriptionUpdates,
    clearCuposUpdates,
    clearCarreraUpdates,
    clearSystemNotifications,
    removeSystemNotification,

    // Funciones adicionales
    joinRoom,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
