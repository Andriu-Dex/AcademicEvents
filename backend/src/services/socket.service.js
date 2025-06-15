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
        console.log(`🔐 Usuario autenticado en socket: ${userData.userId}`);
      }
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
}

// Exportar una instancia única (patrón Singleton)
module.exports = new SocketService();
