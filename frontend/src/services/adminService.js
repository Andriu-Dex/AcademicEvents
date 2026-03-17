/**
 * Servicio para la gestión de administradores
 * @module services/adminService
 */

import axiosInstance from "../api/axiosConfig";

/**
 * Clase que provee métodos para interactuar con el API de administradores
 */
class AdminService {
  /**
   * Crea un nuevo administrador
   * @param {Object} adminData - Datos del nuevo administrador
   * @param {string} adminData.cedula - Cédula ecuatoriana
   * @param {string} adminData.nombres - Nombres del administrador
   * @param {string} adminData.apellidos - Apellidos del administrador
   * @param {string} adminData.celular - Número de celular
   * @param {string} adminData.correo - Correo electrónico
   * @param {string} adminData.contrasena - Contraseña
   * @param {string} adminData.rol - Rol (ADMIN_GLOBAL o ADMIN_GENERAL)
   * @returns {Promise<Object>} Respuesta del servidor
   */ async crearAdmin(adminData) {
    try {
      const response = await axiosInstance.post(
        "/admin/create-admin",
        adminData
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear administrador:", error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de administradores
   * @returns {Promise<Array>} Lista de administradores
   */ async obtenerAdmins() {
    try {
      const response = await axiosInstance.get("/admin/list-admins");
      return response.data;
    } catch (error) {
      console.error("Error al obtener administradores:", error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de administradores con paginación
   * @param {Object} params - Parámetros de paginación y filtros
   * @param {number} params.page - Número de página actual
   * @param {number} params.limit - Número de elementos por página
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {string} params.rol - Filtro por rol (opcional)
   * @returns {Promise<Object>} Datos paginados y metadatos
   */
  async obtenerAdminsPaginados(params = {}) {
    try {
      const response = await axiosInstance.get("/admin/list-admins-paginados", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener administradores paginados:", error);
      throw error;
    }
  }

  /**
   * Obtiene usuarios no administrativos paginados
   * @param {Object} params - Parámetros de paginación y filtro
   * @returns {Promise<Object>} Datos paginados y metadatos
   */
  async obtenerUsuariosPaginados(params = {}) {
    try {
      const response = await axiosInstance.get("/admin/list-users-paginados", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuarios paginados:", error);
      throw error;
    }
  }

  /**
   * Actualiza una cuenta existente
   * @param {string} idCuenta - Identificador de la cuenta
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<Object>} Cuenta actualizada
   */
  async actualizarCuenta(idCuenta, data) {
    try {
      const response = await axiosInstance.put(`/admin/accounts/${idCuenta}`, data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar cuenta:", error);
      throw error;
    }
  }

  /**
   * Elimina una cuenta existente
   * @param {string} idCuenta - Identificador de la cuenta
   * @returns {Promise<Object>} Resultado de eliminación
   */
  async eliminarCuenta(idCuenta) {
    try {
      const response = await axiosInstance.delete(`/admin/accounts/${idCuenta}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      throw error;
    }
  }

  /**
   * Bloquea una cuenta con motivo obligatorio
   * @param {string} idCuenta - Identificador de la cuenta
   * @param {string} motivo - Motivo de bloqueo
   * @returns {Promise<Object>} Resultado de la operación
   */
  async bloquearCuenta(idCuenta, motivo) {
    try {
      const response = await axiosInstance.patch(`/admin/accounts/${idCuenta}/block`, {
        motivo,
      });
      return response.data;
    } catch (error) {
      console.error("Error al bloquear cuenta:", error);
      throw error;
    }
  }

  /**
   * Desbloquea una cuenta con motivo obligatorio
   * @param {string} idCuenta - Identificador de la cuenta
   * @param {string} motivo - Motivo de desbloqueo
   * @returns {Promise<Object>} Resultado de la operación
   */
  async desbloquearCuenta(idCuenta, motivo) {
    try {
      const response = await axiosInstance.patch(
        `/admin/accounts/${idCuenta}/unblock`,
        {
          motivo,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al desbloquear cuenta:", error);
      throw error;
    }
  }
}

export default new AdminService();
