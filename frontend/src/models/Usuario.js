/**
 * Clase que representa un modelo de Usuario
 * Implementa validaciones específicas para Ecuador
 */
class Usuario {
  /**
   * Constructor de la clase Usuario
   * @param {Object} datos - Datos del usuario
   * @param {string} datos.ced_usu - Cédula del usuario
   * @param {string} datos.nom_usu - Nombre del usuario
   * @param {string} datos.ape_usu - Apellido del usuario
   * @param {string} datos.cor_usu - Correo electrónico del usuario
   * @param {string} datos.con_usu - Contraseña del usuario
   * @param {string} datos.cel_usu - Número de celular del usuario
   * @param {string} datos.id_car_est - ID de carrera (solo para estudiantes)
   */
  constructor(datos = {}) {
    this.cedula = datos.ced_usu || "";
    this.nombre = datos.nom_usu || "";
    this.apellido = datos.ape_usu || "";
    this.correo = datos.cor_usu || "";
    this.contrasena = datos.con_usu || "";
    this.celular = datos.cel_usu || "";
    this.idCarrera = datos.id_car_est || "";
  }

  /**
   * Convierte el objeto Usuario a formato para enviar al servidor
   * @returns {Object} - Datos formateados para el servidor
   */
  toServerFormat() {
    return {
      ced_usu: this.cedula,
      nom_usu: this.nombre,
      ape_usu: this.apellido,
      cor_usu: this.correo,
      con_usu: this.contrasena,
      cel_usu: this.celular,
      id_car_est: this.idCarrera,
    };
  }

  /**
   * Verifica si el usuario es estudiante UTA
   * @returns {boolean} - true si es estudiante UTA, false en caso contrario
   */
  esEstudianteUTA() {
    return this.correo.endsWith("@uta.edu.ec");
  }

  /**
   * Actualiza los datos del usuario
   * @param {string} campo - Campo a actualizar
   * @param {string} valor - Nuevo valor
   */
  actualizarCampo(campo, valor) {
    switch (campo) {
      case "cedula":
      case "ced_usu":
        this.cedula = valor.replace(/\D/g, "").slice(0, 10);
        break;
      case "nombre":
      case "nom_usu":
        this.nombre = valor;
        break;
      case "apellido":
      case "ape_usu":
        this.apellido = valor;
        break;
      case "correo":
      case "cor_usu":
        this.correo = valor;
        break;
      case "contrasena":
      case "con_usu":
        this.contrasena = valor;
        break;
      case "celular":
      case "cel_usu":
        // Validación para celular ecuatoriano
        let celularLimpio = valor.replace(/\D/g, "").slice(0, 10);
        if (celularLimpio.length <= 2) {
          if (celularLimpio === "0" || celularLimpio.startsWith("0")) {
            this.celular = celularLimpio;
          } else {
            this.celular = "0" + celularLimpio.slice(0, 1);
          }
        } else {
          if (!celularLimpio.startsWith("09")) {
            this.celular = "09" + celularLimpio.slice(2);
          } else {
            this.celular = celularLimpio;
          }
        }
        break;
      case "idCarrera":
      case "id_car_est":
        this.idCarrera = valor;
        break;
      default:
        // Campo no reconocido
        break;
    }
  }
}

export default Usuario;
