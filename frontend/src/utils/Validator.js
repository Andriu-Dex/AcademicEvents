/**
 * Clase para validación de datos de usuario
 * Implementa métodos de validación específicos para Ecuador
 */
class Validator {
  /**
   * Valida una cédula ecuatoriana
   * @param {string} cedula - Cédula a validar
   * @returns {boolean} - true si la cédula es válida, false en caso contrario
   */
  static validarCedulaEcuatoriana(cedula) {
    // Verificar que tenga 10 dígitos
    if (!/^\d{10}$/.test(cedula)) return false;

    // Algoritmo de validación de cédula ecuatoriana
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const verificador = parseInt(cedula.substring(9, 10));
    const provincia = parseInt(cedula.substring(0, 2));

    // Validar código de provincia (de 01 a 24)
    if (provincia < 1 || provincia > 24) return false;

    // Verificar tercer dígito (menor a 6 para personas naturales)
    if (parseInt(cedula.charAt(2)) > 6) return false;

    let suma = 0;

    // Aplicar algoritmo
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
      suma += valor >= 10 ? valor - 9 : valor;
    }

    const digitoVerificador = 10 - (suma % 10);
    const resultadoMod = digitoVerificador === 10 ? 0 : digitoVerificador;

    return resultadoMod === verificador;
  }

  /**
   * Valida un número de celular ecuatoriano
   * @param {string} celular - Número de celular a validar
   * @returns {boolean} - true si el celular es válido, false en caso contrario
   */
  static validarCelularEcuatoriano(celular) {
    return /^09\d{8}$/.test(celular); // Debe empezar con 09 y tener 10 dígitos
  }

  /**
   * Valida que un texto solo contenga letras y espacios
   * @param {string} texto - Texto a validar
   * @returns {boolean} - true si el texto solo contiene letras y espacios, false en caso contrario
   */
  static soloLetras(texto) {
    return /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(texto);
  }

  /**
   * Valida la longitud de una contraseña
   * @param {string} password - Contraseña a validar
   * @param {number} minLength - Longitud mínima
   * @returns {boolean} - true si la contraseña cumple con la longitud mínima, false en caso contrario
   */
  static validarLongitudPassword(password, minLength = 6) {
    return password.length >= minLength;
  }

  /**
   * Valida que dos contraseñas coincidan
   * @param {string} password - Contraseña original
   * @param {string} confirmPassword - Confirmación de contraseña
   * @returns {boolean} - true si las contraseñas coinciden, false en caso contrario
   */
  static passwordsCoinciden(password, confirmPassword) {
    return password === confirmPassword;
  }

  /**
   * Valida que una contraseña sea segura
   * @param {string} password - Contraseña a validar
   * @returns {Object} - Objeto con resultado de validación y detalles
   */
  static validarPasswordSegura(password) {
    const resultado = {
      esValida: false,
      fortaleza: "débil",
      puntuacion: 0,
      errores: [],
      sugerencias: [],
    };

    // Criterios de validación
    const criterios = {
      longitudMinima: password.length >= 8,
      tieneMinuscula: /[a-z]/.test(password),
      tieneMayuscula: /[A-Z]/.test(password),
      tieneNumero: /\d/.test(password),
      tieneEspecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noTieneEspacios: !/\s/.test(password),
      longitudSegura: password.length >= 12,
      noEsComun: !this.esPasswordComun(password),
    };

    // Evaluar cada criterio
    if (!criterios.longitudMinima) {
      resultado.errores.push("Debe tener al menos 8 caracteres");
      resultado.sugerencias.push("Usa al menos 8 caracteres");
    }

    if (!criterios.tieneMinuscula) {
      resultado.errores.push("Debe contener al menos una letra minúscula");
      resultado.sugerencias.push("Agrega letras minúsculas (a-z)");
    }

    if (!criterios.tieneMayuscula) {
      resultado.errores.push("Debe contener al menos una letra mayúscula");
      resultado.sugerencias.push("Agrega letras mayúsculas (A-Z)");
    }

    if (!criterios.tieneNumero) {
      resultado.errores.push("Debe contener al menos un número");
      resultado.sugerencias.push("Agrega números (0-9)");
    }

    if (!criterios.tieneEspecial) {
      resultado.errores.push("Debe contener al menos un carácter especial");
      resultado.sugerencias.push("Agrega símbolos (!@#$%^&*)");
    }

    if (!criterios.noTieneEspacios) {
      resultado.errores.push("No debe contener espacios en blanco");
      resultado.sugerencias.push("Elimina los espacios en blanco");
    }

    if (!criterios.noEsComun) {
      resultado.errores.push("La contraseña es muy común");
      resultado.sugerencias.push("Usa una combinación más única");
    }

    // Calcular puntuación de fortaleza
    let puntuacion = 0;
    if (criterios.longitudMinima) puntuacion += 1;
    if (criterios.tieneMinuscula) puntuacion += 1;
    if (criterios.tieneMayuscula) puntuacion += 1;
    if (criterios.tieneNumero) puntuacion += 1;
    if (criterios.tieneEspecial) puntuacion += 1;
    if (criterios.noTieneEspacios) puntuacion += 1;
    if (criterios.longitudSegura) puntuacion += 2;
    if (criterios.noEsComun) puntuacion += 1;

    resultado.puntuacion = puntuacion;

    // Determinar fortaleza
    if (puntuacion <= 3) {
      resultado.fortaleza = "muy débil";
    } else if (puntuacion <= 5) {
      resultado.fortaleza = "débil";
    } else if (puntuacion <= 7) {
      resultado.fortaleza = "moderada";
    } else if (puntuacion <= 8) {
      resultado.fortaleza = "fuerte";
    } else {
      resultado.fortaleza = "muy fuerte";
    }

    // La contraseña es válida si cumple todos los criterios básicos
    resultado.esValida =
      criterios.longitudMinima &&
      criterios.tieneMinuscula &&
      criterios.tieneMayuscula &&
      criterios.tieneNumero &&
      criterios.tieneEspecial &&
      criterios.noTieneEspacios;

    return resultado;
  }

  /**
   * Verifica si una contraseña está en la lista de contraseñas comunes
   * @param {string} password - Contraseña a verificar
   * @returns {boolean} - true si es una contraseña común, false en caso contrario
   */
  static esPasswordComun(password) {
    const passwordsComunes = [
      "123456",
      "password",
      "123456789",
      "12345678",
      "12345",
      "1234567",
      "qwerty",
      "abc123",
      "football",
      "1234567890",
      "welcome",
      "admin",
      "password123",
      "123123",
      "Password1",
      "letmein",
      "monkey",
      "dragon",
      "master",
      "hello",
      "login",
      "admin123",
      "qwerty123",
      "solo",
      "passw0rd",
      "admin1",
      "test",
      "guest",
      "root",
      "password1",
      "123qwe",
      "zxcvbnm",
      "Password123",
      "Aa123456",
      "password!",
      "Ecuador123",
      "Quito123",
      "Universidad123",
    ];

    return (
      passwordsComunes.includes(password.toLowerCase()) ||
      passwordsComunes.includes(password)
    );
  }

  /**
   * Genera sugerencias para mejorar la fortaleza de la contraseña
   * @param {string} password - Contraseña actual
   * @returns {Array} - Array de sugerencias específicas
   */
  static generarSugerenciasPassword(password) {
    const validacion = this.validarPasswordSegura(password);
    const sugerencias = [...validacion.sugerencias];

    if (
      validacion.fortaleza === "muy débil" ||
      validacion.fortaleza === "débil"
    ) {
      sugerencias.push("Considera usar una frase de contraseña con símbolos");
      sugerencias.push("Evita información personal como nombres o fechas");
    }

    if (password.length < 12) {
      sugerencias.push("Para mayor seguridad, usa al menos 12 caracteres");
    }

    return sugerencias;
  }
}

export default Validator;
