import axios from "axios";
import { toast } from "react-toastify"; // Importar toast para notificaciones

// Crear una instancia de axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api", // URL base del backend desde las variables de entorno
});

// Variable para almacenar la función de logout
let logoutFunction = null;

// Función para configurar el logout (será llamada desde AuthContext)
export const setLogoutFunction = (logout) => {
  logoutFunction = logout;
};

// Interceptor de solicitudes - agregar token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable para controlar que solo se muestre una notificación de sesión expirada
let tokenExpirationNotified = false;

// Interceptor de respuestas - manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (no autorizado), cerrar sesión automáticamente
    if (
      error.response &&
      error.response.status === 401 &&
      !tokenExpirationNotified
    ) {
      // Verificar si estamos en la página de login o registro
      const isLoginPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/" ||
        window.location.pathname === "/register";

      // Marcar que ya se ha notificado para evitar múltiples notificaciones
      tokenExpirationNotified = true;

      console.warn("Token expirado o inválido. Cerrando sesión...");

      // Mostrar notificación al usuario solo si NO estamos en la página de login
      if (!isLoginPage) {
        toast.error(
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          {
            onClose: () => {
              // Resetear la bandera después de que se cierre la notificación
              setTimeout(() => {
                tokenExpirationNotified = false;
              }, 1000);
            },
          }
        );
      } // Ejecutar logout si está disponible
      if (logoutFunction && !isLoginPage) {
        logoutFunction();
      }

      // Redirigir al login solo si no estamos ya en la página de login
      if (!isLoginPage && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
