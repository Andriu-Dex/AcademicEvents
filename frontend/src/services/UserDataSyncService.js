/**
 * Servicio dedicado a la sincronización de datos de usuario
 * Separa la lógica de sincronización del contexto de autenticación
 */
class UserDataSyncService {
  static SYNC_CACHE_TIME = 30000; // 30 segundos
  static lastSyncTime = 0;
  static isSyncing = false;
  static retryAfterTime = 0;

  /**
   * Verifica si es necesario sincronizar datos basado en cache
   * @returns {boolean}
   */
  static shouldSync() {
    const now = Date.now();
    return (
      !this.isSyncing &&
      now >= this.retryAfterTime &&
      now - this.lastSyncTime >= this.SYNC_CACHE_TIME
    );
  }

  /**
   * Actualiza el timestamp del último sync
   */
  static updateSyncTime() {
    this.lastSyncTime = Date.now();
  }

  static markSyncStarted() {
    this.isSyncing = true;
  }

  static markSyncFinished() {
    this.isSyncing = false;
  }

  static markRateLimited(retryDelayMs = 60000) {
    this.retryAfterTime = Date.now() + retryDelayMs;
    this.isSyncing = false;
  }

  /**
   * Obtiene datos actualizados del usuario desde el servidor
   * @param {Function} axiosInstance - Instancia de axios configurada
   * @returns {Promise<Object|null>} Datos del usuario o null si hay error
   */
  static async fetchUserData(axiosInstance) {
    try {
      const response = await axiosInstance.get("/perfil");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      if (error.response?.status !== 429) {
        console.error("Error al obtener datos del usuario:", error);
      }

      return {
        success: false,
        statusCode: error.response?.status ?? null,
        error,
      };
    }
  }

  /**
   * Transforma datos del servidor al formato interno
   * @param {Object} serverData - Datos del servidor
   * @param {Object} currentUser - Usuario actual para mantener campos no modificables
   * @returns {Object} Datos transformados
   */
  static transformUserData(serverData, currentUser) {
    return {
      id: currentUser.id,
      correo: serverData.cor_usu,
      rol_usu: serverData.rol_usu,
      nom_usu: serverData.nom_usu,
      ape_usu: serverData.ape_usu,
      img_per_usu: serverData.img_per_usu,
    };
  }

  /**
   * Actualiza datos en localStorage
   * @param {Object} userData - Datos del usuario a guardar
   */
  static updateLocalStorage(userData) {
    try {
      const authDataStr = localStorage.getItem("authData");
      if (authDataStr) {
        const authData = JSON.parse(authDataStr);
        localStorage.setItem(
          "authData",
          JSON.stringify({
            ...authData,
            usuario: userData,
          })
        );
      }
    } catch (error) {
      console.error("Error al actualizar localStorage:", error);
    }
  }

  static hasUserDataChanged(currentUser, nextUser) {
    if (!currentUser || !nextUser) {
      return true;
    }

    return (
      currentUser.correo !== nextUser.correo ||
      currentUser.rol_usu !== nextUser.rol_usu ||
      currentUser.nom_usu !== nextUser.nom_usu ||
      currentUser.ape_usu !== nextUser.ape_usu ||
      currentUser.img_per_usu !== nextUser.img_per_usu
    );
  }
}

export default UserDataSyncService;
