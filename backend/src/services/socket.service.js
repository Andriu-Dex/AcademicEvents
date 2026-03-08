// ============================
//  Servicio de Socket.IO
// ============================

class SocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map(); // Almacenar información de clientes conectados
    // Configuración de logs desde variables de entorno
    this.logsEnabled = process.env.SOCKET_LOGS_ENABLED === "true";
  }

  /**
   * Método helper para logs condicionales de sockets
   * @param {string} message - Mensaje a loggear
   * @param {Object} data - Datos adicionales (opcional)
   */
  log(message, data = null) {
    if (!this.logsEnabled) return;

    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }

  /**
   * Normaliza payload de evento para soportar claves legacy y nuevas.
   * @param {Object} eventData
   * @returns {Object}
   */
  normalizeEventPayload(eventData = {}) {
    return {
      ...eventData,
      id: eventData.id ?? eventData.id_eve ?? eventData.eventId ?? null,
      name:
        eventData.name ?? eventData.nom_eve ?? eventData.eventTitle ?? null,
      availableSpots:
        eventData.availableSpots ??
        eventData.cup_dis_eve ??
        eventData.remainingSlots ??
        null,
      maxCapacity:
        eventData.maxCapacity ?? eventData.cup_max_eve ?? eventData.totalSlots ?? null,
    };
  }

  /**
   * Normaliza payload de inscripción para soportar claves legacy y nuevas.
   * @param {Object} inscriptionData
   * @returns {{registrationId: string|null, registrationStatus: string|null, eventName: string|null}}
   */
  normalizeInscriptionPayload(inscriptionData = {}) {
    const inscription =
      inscriptionData.inscription ?? inscriptionData.inscripcion ?? inscriptionData;
    const event =
      inscriptionData.event ??
      inscriptionData.evento ??
      inscription?.event ??
      inscription?.evento ??
      null;

    return {
      registrationId: inscription?.id ?? inscription?.id_ins ?? null,
      registrationStatus:
        inscription?.status ??
        inscription?.est_ins ??
        inscriptionData.status ??
        inscriptionData.est_ins ??
        null,
      eventName: event?.name ?? event?.nom_eve ?? null,
    };
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
      this.log(`✅ [SOCKET] Nuevo cliente conectado: ${socket.id}`);

      // Almacenar información del cliente
      this.connectedClients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        userId: null, // Se actualizará cuando el usuario se autentique
      });

      this.log(
        `📊 [SOCKET] Total de clientes conectados: ${this.connectedClients.size}`
      );

      // Manejar autenticación del usuario
      socket.on("authenticate", (userData) => {
        this.handleAuthentication(socket, userData);
      });

      // Unirse a salas específicas (opcional para futuras implementaciones)
      socket.on("join-room", (roomName) => {
        socket.join(roomName);
        this.log(
          `🏠 [SOCKET] Cliente ${socket.id} se unió a la sala: ${roomName}`
        );
      });

      // Manejar desconexión
      socket.on("disconnect", () => {
        this.log(`❌ [SOCKET] Cliente desconectado: ${socket.id}`);
        this.connectedClients.delete(socket.id);
        this.log(
          `📊 [SOCKET] Total de clientes conectados: ${this.connectedClients.size}`
        );
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
        this.log(
          `🔐 [SOCKET] Usuario autenticado en socket: ${userData.userId} (Rol: ${userData.role})`
        );
      }
    } else {
      this.log(`⚠️ [SOCKET] Intento de autenticación fallido:`, userData);
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
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyEventChange`
      );
      return;
    }

    const normalizedEvent = this.normalizeEventPayload(eventoData);

    const eventData = {
      action,
      data: eventoData,
      timestamp: new Date(),
    };

    this.log(
      `📡 [SOCKET] Enviando evento "evento-change-hm" para acción "${action}":`,
      {
        clientes_conectados: this.connectedClients.size,
        id_evento: normalizedEvent.id,
        nombre_evento: normalizedEvent.name,
      }
    );

    this.io.emit("evento-change-hm", eventData);

    this.log(
      `✅ [SOCKET] Evento ${action} notificado a ${this.connectedClients.size} clientes`
    );
  }

  /**
   * Notificar cambios en inscripciones
   * @param {string} action - Tipo de acción (created, updated, deleted)
   * @param {Object} inscripcionData - Datos de la inscripción
   */
  notifyInscriptionChange(action, inscripcionData) {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyInscriptionChange`
      );
      return;
    }

    // Validar que los datos mínimos estén presentes
    if (
      !inscripcionData ||
      (!inscripcionData.inscripcion && !inscripcionData.evento)
    ) {
      this.log(
        `⚠️ [SOCKET] Datos incompletos para notifyInscriptionChange:`,
        inscripcionData
      );
      return;
    }

    const normalizedInscription = this.normalizeInscriptionPayload(inscripcionData);

    const eventData = {
      action,
      data: inscripcionData,
      timestamp: new Date(),
    };

    this.log(
      `📡 [SOCKET] Enviando evento "inscripcion-change-hm" para acción "${action}":`,
      {
        clientes_conectados: this.connectedClients.size,
        id_inscripcion: normalizedInscription.registrationId,
        nombre_evento: normalizedInscription.eventName,
        estado_inscripcion: normalizedInscription.registrationStatus,
        datos_completos: {
          tiene_inscripcion: !!inscripcionData.inscripcion,
          tiene_evento: !!inscripcionData.evento,
          inscripcion_keys: inscripcionData.inscripcion
            ? Object.keys(inscripcionData.inscripcion)
            : [],
          evento_keys: inscripcionData.evento
            ? Object.keys(inscripcionData.evento)
            : [],
        },
      }
    );

    this.io.emit("inscripcion-change-hm", eventData);

    this.log(
      `✅ [SOCKET] Inscripción ${action} notificada a ${this.connectedClients.size} clientes`
    );
  }

  /**
   * Notificar específicamente a la vista de validación de inscripciones
   * @param {string} action - Tipo de acción ('new_inscription', 'status_changed', 'validation_required')
   * @param {Object} inscriptionData - Datos completos de la inscripción
   */
  notifyInscriptionValidation(action, inscriptionData) {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyInscriptionValidation`
      );
      return;
    }

    // Validar que los datos mínimos estén presentes
    if (!inscriptionData || !inscriptionData.id) {
      this.log(
        `⚠️ [SOCKET] Datos incompletos para notifyInscriptionValidation:`,
        inscriptionData
      );
      return;
    }

    const normalizedInscription = this.normalizeInscriptionPayload(inscriptionData);

    const validationData = {
      action,
      data: inscriptionData,
      timestamp: new Date(),
      priority: action === "validation_required" ? "high" : "normal",
    };

    this.log(
      `📡 [SOCKET] Enviando eventos de validación para acción "${action}":`,
      {
        clientes_conectados: this.connectedClients.size,
        id_inscripcion: inscriptionData.id,
        priority: validationData.priority,
        correo: inscriptionData.correo,
        evento: normalizedInscription.eventName,
        estado: inscriptionData.estado ?? normalizedInscription.registrationStatus,
        requiere_validacion: inscriptionData.requiresValidation,
      }
    );

    // Enviar a vista específica de validación
    this.io.emit("inscription-validation-change", validationData);

    // También enviar al dashboard general de admin
    this.io.emit("admin-dashboard-update", {
      type: "inscription_update",
      ...validationData,
    });

    this.log(
      `✅ [SOCKET] [VALIDATION] ${action} para inscripción ID: ${inscriptionData.id} enviada a ${this.connectedClients.size} clientes`
    );
  }

  /**
   * Notificar alerta de capacidad de eventos
   * @param {Object} eventData - Datos del evento con información de cupos
   */
  notifyCapacityAlert(eventData) {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyCapacityAlert`
      );
      return;
    }

    const normalizedEvent = this.normalizeEventPayload(eventData);
    const maxCapacity = Number(normalizedEvent.maxCapacity) || 0;
    const availableSpots = Number(normalizedEvent.availableSpots) || 0;

    const alertData = {
      type: "capacity_alert",
      eventId: normalizedEvent.id,
      eventTitle: normalizedEvent.name,
      remainingSlots: availableSpots,
      totalSlots: maxCapacity,
      percentage: maxCapacity > 0 ? ((availableSpots / maxCapacity) * 100).toFixed(1) : "0.0",
      timestamp: new Date(),
    };

    this.log(`📡 [SOCKET] Enviando alerta de capacidad:`, {
      evento: normalizedEvent.name,
      cupos_disponibles: availableSpots,
      porcentaje: alertData.percentage,
      clientes_conectados: this.connectedClients.size,
    });

    this.io.emit("capacity-alert", alertData);

    this.log(
      `✅ [SOCKET] [CAPACITY ALERT] Evento "${normalizedEvent.name}" - ${availableSpots} cupos restantes enviado a ${this.connectedClients.size} clientes`
    );
  }

  /**
   * Enviar notificación específica a administradores
   * @param {string} message - Mensaje de la notificación
   * @param {string} type - Tipo de notificación
   * @param {Object} additionalData - Datos adicionales
   */
  notifyAdmins(message, type = "info", additionalData = {}) {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyAdmins`
      );
      return;
    }

    const notificationData = {
      message,
      type,
      timestamp: new Date(),
      targetAudience: "admin",
      ...additionalData,
    };

    this.log(`📡 [SOCKET] Enviando notificación a administradores:`, {
      mensaje: message,
      tipo: type,
      clientes_conectados: this.connectedClients.size,
      datos_adicionales: Object.keys(additionalData),
    });

    this.io.emit("admin-notification", notificationData);

    this.log(
      `✅ [SOCKET] [ADMIN NOTIFICATION] ${type.toUpperCase()}: ${message} enviado a ${
        this.connectedClients.size
      } clientes`
    );
  }

  /**
   * Notificar cambios en cupos disponibles
   * @param {number} eventoId - ID del evento
   * @param {number} cuposDisponibles - Cupos disponibles actuales
   */
  notifyCuposChange(eventoId, cuposDisponibles) {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyCuposChange`
      );
      return;
    }

    const eventData = {
      eventoId,
      cuposDisponibles,
      timestamp: new Date(),
    };

    this.log(`📡 [SOCKET] Enviando actualización de cupos:`, {
      evento_id: eventoId,
      cupos_disponibles: cuposDisponibles,
      clientes_conectados: this.connectedClients.size,
    });

    this.io.emit("cupos-change-hm", eventData);

    this.log(
      `✅ [SOCKET] Cupos actualizados para evento ${eventoId}: ${cuposDisponibles} enviado a ${this.connectedClients.size} clientes`
    );
  }

  /**
   * Notificar actualizaciones generales del sistema
   * @param {string} message - Mensaje de la notificación
   * @param {string} type - Tipo de notificación ('info', 'warning', 'error', 'success')
   */
  notifySystemUpdate(message, type = "info") {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifySystemUpdate`
      );
      return;
    }

    const eventData = {
      message,
      type,
      timestamp: new Date(),
    };

    this.log(`📡 [SOCKET] Enviando notificación del sistema:`, {
      mensaje: message,
      tipo: type,
      clientes_conectados: this.connectedClients.size,
    });

    this.io.emit("system-notification-hm", eventData);

    this.log(
      `✅ [SOCKET] Notificación del sistema enviada a ${this.connectedClients.size} clientes: ${message}`
    );
  }

  /**
   * Obtener estadísticas de conexiones
   * @returns {Object} Estadísticas de conexiones activas
   */
  getConnectionStats() {
    const stats = {
      totalConnections: this.connectedClients.size,
      authenticatedUsers: Array.from(this.connectedClients.values()).filter(
        (client) => client.userId !== null
      ).length,
      connections: Array.from(this.connectedClients.values()),
    };

    this.log(`📊 [SOCKET] Estadísticas de conexiones:`, stats);
    return stats;
  }

  /**
   * Notificar cambio de estado de inscripción al usuario propietario
   * @param {string} userId - ID del usuario propietario de la inscripción
   * @param {Object} inscriptionData - Datos de la inscripción actualizada
   */
  notifyUserInscriptionChange(userId, inscriptionData) {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyUserInscriptionChange`
      );
      return;
    }

    const notificationData = {
      action: "status_changed",
      data: inscriptionData,
      timestamp: new Date(),
      userId: userId,
    };

    this.log(
      `📡 [SOCKET] Enviando notificación de cambio de inscripción a usuario:`,
      {
        usuario_id: userId,
        estado_nuevo: inscriptionData.estadoNuevo,
        clientes_conectados: this.connectedClients.size,
      }
    );

    // Emitir evento a todos los clientes, pero solo los que tengan el userId correcto lo procesarán
    this.io.emit("user-inscription-update", notificationData);

    this.log(
      `✅ [SOCKET] [USER NOTIFICATION] Cambio de estado de inscripción notificado para usuario: ${userId} enviado a ${this.connectedClients.size} clientes`
    );
    this.log(
      `📡 Estado de inscripción actualizado a: ${inscriptionData.estadoNuevo}`
    );
  }

  /**
   * Notificar cambios masivos en inscripciones
   * @param {string} action - Tipo de acción
   * @param {Object} data - Datos del cambio masivo
   */
  notifyRegistrationChange(action, data) {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyRegistrationChange`
      );
      return;
    }

    const eventData = {
      action,
      data: data,
      timestamp: new Date(),
    };

    this.log(`📡 [SOCKET] Enviando cambio masivo de inscripciones:`, {
      accion: action,
      clientes_conectados: this.connectedClients.size,
      datos: typeof data === "object" ? Object.keys(data) : "primitive",
    });

    this.io.emit("registrations-bulk-change", eventData);

    this.log(
      `✅ [SOCKET] Cambio masivo de inscripciones (${action}) notificado a ${this.connectedClients.size} clientes`
    );
  }

  /**
   * Notificar cambios en carreras (creación, actualización, eliminación)
   * @param {string} action - Tipo de acción ('created', 'updated', 'deleted')
   * @param {Object} carreraData - Datos de la carrera
   */
  notifyCarreraChange(action, carreraData) {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyCarreraChange`
      );
      return;
    }

    const eventData = {
      action,
      data: carreraData,
      timestamp: new Date(),
    };

    this.log(`📡 [SOCKET] Enviando cambio de carrera:`, {
      accion: action,
      carrera: carreraData.nom_car,
      clientes_conectados: this.connectedClients.size,
    });

    this.io.emit("carrera-change-hm", eventData);

    this.log(
      `✅ [SOCKET] Carrera ${action} notificada a ${this.connectedClients.size} clientes`
    );
  }

  /**
   * Notificar cambios en eventos de carreras
   * @param {string} action - Tipo de acción ('created', 'updated', 'deleted')
   * @param {Object} eventoCarreraData - Datos del evento de carrera
   */
  notifyEventoCarreraChange(action, eventoCarreraData) {
    if (!this.io) {
      this.log(
        `❌ [SOCKET] No hay instancia de io disponible para notifyEventoCarreraChange`
      );
      return;
    }

    const eventData = {
      action,
      data: eventoCarreraData,
      timestamp: new Date(),
    };

    this.log(`📡 [SOCKET] Enviando cambio de evento-carrera:`, {
      accion: action,
      clientes_conectados: this.connectedClients.size,
    });

    this.io.emit("evento-carrera-change-hm", eventData);

    this.log(
      `✅ [SOCKET] Evento de carrera ${action} notificado a ${this.connectedClients.size} clientes`
    );
  }
}

// Exportar una instancia única (patrón Singleton)
module.exports = new SocketService();
