/**
 * Servicio dedicado a la sincronización de datos de usuario
 * Separa la lógica de sincronización del contexto de autenticación
 */
class UserDataSyncService {
  static SYNC_CACHE_TIME = 30000; // 30 segundos
  static lastSyncTime = 0;

  /**
   * Verifica si es necesario sincronizar datos basado en cache
   * @returns {boolean}
   */
  static shouldSync() {
    const now = Date.now();
    return now - this.lastSyncTime >= this.SYNC_CACHE_TIME;
  }

  /**
   * Actualiza el timestamp del último sync
   */
  static updateSyncTime() {
    this.lastSyncTime = Date.now();
  }

  /**
   * Obtiene datos actualizados del usuario desde el servidor
   * @param {Function} axiosInstance - Instancia de axios configurada
   * @returns {Promise<Object|null>} Datos del usuario o null si hay error
   */
  static async fetchUserData(axiosInstance) {
    try {
      const response = await axiosInstance.get("/perfil");
      return response.data;
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      return null;
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
}

export default UserDataSyncService;
