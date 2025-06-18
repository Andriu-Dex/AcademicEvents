// ============================
//  Servicio de Socket.IO
// ============================

class SocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map(); // Almacenar información de clientes conectados
  }

  /**
   * Inicializar el servicio de Socket.IO
   * @param {Object} io - Instancia de Socket.IO
   */
  init(io) {
    this.io = io;
    this.setupEventHandlers();
  }

  /**
   * Configurar manejadores de eventos de Socket.IO
   */
  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`✅ Cliente conectado: ${socket.id}`);

      // Almacenar información del cliente
      this.connectedClients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        userId: null, // Se actualizará cuando el usuario se autentique
      });

      // Manejar autenticación del usuario
      socket.on("authenticate", (userData) => {
        this.handleAuthentication(socket, userData);
      });

      // Unirse a salas específicas (opcional para futuras implementaciones)
      socket.on("join-room", (roomName) => {
        socket.join(roomName);
        console.log(`Cliente ${socket.id} se unió a la sala: ${roomName}`);
      });

      // Manejar desconexión
      socket.on("disconnect", () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  /**
   * Manejar autenticación de usuario en socket
   * @param {Object} socket - Socket del cliente
   * @param {Object} userData - Datos del usuario
   */
  handleAuthentication(socket, userData) {
    if (userData && userData.userId) {
      const clientInfo = this.connectedClients.get(socket.id);
      if (clientInfo) {
        clientInfo.userId = userData.userId;
        clientInfo.userRole = userData.role;
        console.log(
          `🔐 Usuario autenticado en socket: ${userData.userId} (Rol: ${userData.role})`
        );
      }
    } else {
      console.log(`⚠️ Intento de autenticación fallido:`, userData);
    }
  }

  /**
   * Emitir eventos relacionados con la vista Home
   */

  /**
   * Notificar cambios en eventos (creación, actualización, eliminación)
   * @param {string} action - Tipo de acción ('created', 'updated', 'deleted')
   * @param {Object} eventoData - Datos del evento
   */
  notifyEventChange(action, eventoData) {
    if (!this.io) return;

    this.io.emit("evento-change-hm", {
      action,
      data: eventoData,
      timestamp: new Date(),
    });

    console.log(`📡 Evento ${action} notificado a todos los clientes`);
  }

  /**
   * Notificar cambios en inscripciones
   * @param {string} action - Tipo de acción
   * @param {Object} inscripcionData - Datos de la inscripción
   */
  notifyInscriptionChange(action, inscripcionData) {
    if (!this.io) return;

    this.io.emit("inscripcion-change-hm", {
      action,
      data: inscripcionData,
      timestamp: new Date(),
    });

    console.log(`📡 Inscripción ${action} notificada a todos los clientes`);
  }

  /**
   * Notificar específicamente a la vista de validación de inscripciones
   * @param {string} action - Tipo de acción ('new_inscription', 'status_changed', 'validation_required')
   * @param {Object} inscriptionData - Datos completos de la inscripción
   */
  notifyInscriptionValidation(action, inscriptionData) {
    if (!this.io) return;

    const validationData = {
      action,
      data: inscriptionData,
      timestamp: new Date(),
      priority: action === "validation_required" ? "high" : "normal",
    };

    // Enviar a vista específica de validación
    this.io.emit("inscription-validation-change", validationData);

    // También enviar al dashboard general de admin
    this.io.emit("admin-dashboard-update", {
      type: "inscription_update",
      ...validationData,
    });

    console.log(
      `📡 [VALIDATION] ${action} para inscripción ID: ${inscriptionData.id}`
    );
  }

  /**
   * Notificar alerta de capacidad de eventos
   * @param {Object} eventData - Datos del evento con información de cupos
   */
  notifyCapacityAlert(eventData) {
    if (!this.io) return;

    const alertData = {
      type: "capacity_alert",
      eventId: eventData.id,
      eventTitle: eventData.titulo,
      remainingSlots: eventData.cupos_disponibles,
      totalSlots: eventData.cupos_totales,
      percentage: (
        (eventData.cupos_disponibles / eventData.cupos_totales) *
        100
      ).toFixed(1),
      timestamp: new Date(),
    };

    this.io.emit("capacity-alert", alertData);

    console.log(
      `📡 [CAPACITY ALERT] Evento "${eventData.titulo}" - ${eventData.cupos_disponibles} cupos restantes`
    );
  }

  /**
   * Enviar notificación específica a administradores
   * @param {string} message - Mensaje de la notificación
   * @param {string} type - Tipo de notificación
   * @param {Object} additionalData - Datos adicionales
   */
  notifyAdmins(message, type = "info", additionalData = {}) {
    if (!this.io) return;

    const notificationData = {
      message,
      type,
      timestamp: new Date(),
      targetAudience: "admin",
      ...additionalData,
    };

    this.io.emit("admin-notification", notificationData);

    console.log(`📡 [ADMIN NOTIFICATION] ${type.toUpperCase()}: ${message}`);
  }

  /**
   * Notificar cambios en cupos disponibles
   * @param {number} eventoId - ID del evento
   * @param {number} cuposDisponibles - Cupos disponibles actuales
   */
  notifyCuposChange(eventoId, cuposDisponibles) {
    if (!this.io) return;

    this.io.emit("cupos-change-hm", {
      eventoId,
      cuposDisponibles,
      timestamp: new Date(),
    });

    console.log(
      `📡 Cupos actualizados para evento ${eventoId}: ${cuposDisponibles}`
    );
  }

  /**
   * Notificar actualizaciones generales del sistema
   * @param {string} message - Mensaje de la notificación
   * @param {string} type - Tipo de notificación ('info', 'warning', 'error', 'success')
   */
  notifySystemUpdate(message, type = "info") {
    if (!this.io) return;

    this.io.emit("system-notification-hm", {
      message,
      type,
      timestamp: new Date(),
    });

    console.log(`📡 Notificación del sistema: ${message}`);
  }

  /**
   * Obtener estadísticas de conexiones
   * @returns {Object} Estadísticas de conexiones activas
   */
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      authenticatedUsers: Array.from(this.connectedClients.values()).filter(
        (client) => client.userId !== null
      ).length,
      connections: Array.from(this.connectedClients.values()),
    };
  }

  /**
   * Notificar cambio de estado de inscripción al usuario propietario
   * @param {string} userId - ID del usuario propietario de la inscripción
   * @param {Object} inscriptionData - Datos de la inscripción actualizada
   */
  notifyUserInscriptionChange(userId, inscriptionData) {
    if (!this.io) return;

    const notificationData = {
      action: "status_changed",
      data: inscriptionData,
      timestamp: new Date(),
      userId: userId,
    };

    // Emitir evento a todos los clientes, pero solo los que tengan el userId correcto lo procesarán
    this.io.emit("user-inscription-update", notificationData);

    console.log(
      `📡 [USER NOTIFICATION] Cambio de estado de inscripción notificado para usuario: ${userId}`
    );
    console.log(
      `📡 Estado de inscripción actualizado a: ${inscriptionData.estadoNuevo}`
    );
  }
}

// Exportar una instancia única (patrón Singleton)
module.exports = new SocketService();
