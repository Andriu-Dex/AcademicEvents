/**
 * @class GestorModales
 * @description Clase que gestiona la apertura y cierre de modales en la aplicación
 */
class GestorModales {
  /**
   * @constructor
   * @param {Function} setterFunction - Función setState para establecer el estado del modal
   */
  constructor(setterFunction) {
    this.setModal = setterFunction;
    this.modalActual = null;
  }

  /**
   * Abre un modal con la información proporcionada
   * @param {Object} datos - Datos a mostrar en el modal
   */
  abrirModal(datos) {
    this.modalActual = datos;
    this.setModal(datos);
  }

  /**
   * Cierra el modal actualmente abierto
   */
  cerrarModal() {
    this.modalActual = null;
    this.setModal(null);
  }

  /**
   * Verifica si hay un modal abierto
   * @returns {boolean} - Verdadero si hay un modal abierto
   */
  tieneModalAbierto() {
    return this.modalActual !== null;
  }

  /**
   * Obtiene los datos del modal actual
   * @returns {Object|null} - Datos del modal o null si no hay modal
   */
  obtenerDatosModal() {
    return this.modalActual;
  }
}

export default GestorModales;
