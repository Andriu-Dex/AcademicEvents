import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

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
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Estados específicos para el Home
  const [eventUpdates, setEventUpdates] = useState(null);
  const [inscriptionUpdates, setInscriptionUpdates] = useState(null);
  const [cuposUpdates, setCuposUpdates] = useState(null);
  const [systemNotifications, setSystemNotifications] = useState([]);

  useEffect(() => {
    // Configurar conexión con el backend
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    console.log("🔌 Conectando a Socket.IO:", backendUrl);

    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    }); // Eventos de conexión
    newSocket.on("connect", () => {
      console.log("✅ Socket.IO conectado:", newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      setSocket(newSocket);

      // Autenticar usuario si hay token almacenado
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("usuario");

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          newSocket.emit("authenticate", {
            userId: user.id,
            role: user.rol,
            token: token,
          });
        } catch (error) {
          console.error("Error al autenticar usuario en socket:", error);
        }
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO desconectado:", reason);
      setIsConnected(false);
      setSocket(null);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Error de conexión Socket.IO:", error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // ======================================
    // Eventos específicos para el Home
    // ======================================    // Cambios en eventos
    newSocket.on("evento-change-hm", (data) => {
      // Validar que los datos estén completos
      if (!data || !data.action || !data.data) {
        console.warn(
          "SocketContext: Datos de evento incompletos recibidos",
          data
        );
        return;
      }

      setEventUpdates({
        action: data.action,
        data: data.data,
        timestamp: data.timestamp,
        id: Date.now(), // ID único para forzar re-render
      });
    }); // Cambios en inscripciones
    newSocket.on("inscripcion-change-hm", (data) => {
      // Validar que los datos estén completos
      if (!data || !data.action || !data.data) {
        console.warn(
          "SocketContext: Datos de inscripción incompletos recibidos",
          data
        );
        return;
      }

      console.log("📡 Cambio en inscripción recibido:", data);
      setInscriptionUpdates({
        action: data.action,
        data: data.data,
        timestamp: data.timestamp,
        id: Date.now(),
      });
    }); // Cambios en cupos
    newSocket.on("cupos-change-hm", (data) => {
      // Validar que los datos estén completos
      if (
        !data ||
        typeof data.eventoId === "undefined" ||
        typeof data.cuposDisponibles === "undefined"
      ) {
        console.warn(
          "SocketContext: Datos de cupos incompletos recibidos",
          data
        );
        return;
      }

      console.log("📡 Cambio en cupos recibido:", data);
      setCuposUpdates({
        eventoId: data.eventoId,
        cuposDisponibles: data.cuposDisponibles,
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

    // Limpiar al desmontar
    return () => {
      console.log("🔌 Desconectando Socket.IO");
      newSocket.disconnect();
    };
  }, []);

  // Funciones auxiliares
  const clearEventUpdates = () => setEventUpdates(null);
  const clearInscriptionUpdates = () => setInscriptionUpdates(null);
  const clearCuposUpdates = () => setCuposUpdates(null);
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
    systemNotifications,

    // Funciones de limpieza
    clearEventUpdates,
    clearInscriptionUpdates,
    clearCuposUpdates,
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
