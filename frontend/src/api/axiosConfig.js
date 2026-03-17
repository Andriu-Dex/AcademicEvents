import axios from "axios";
import { toast } from "react-toastify"; // Importar toast para notificaciones

const resolveTenantSlug = () => {
  return (
    localStorage.getItem("tenantSlug") ||
    import.meta.env.VITE_TENANT_SLUG ||
    import.meta.env.VITE_TENANT_ID ||
    "uta"
  );
};

// Crear una instancia de axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api", // URL base del backend desde las variables de entorno
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
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
    const tenantSlug = resolveTenantSlug();

    config.headers["X-Tenant-ID"] = tenantSlug;

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
      // Verificar si estamos en la página de login, registro o home
      const isLoginOrHomePage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/" ||
        window.location.pathname === "/register" ||
        window.location.pathname === "/home"; // Marcar que ya se ha notificado para evitar múltiples notificaciones
      tokenExpirationNotified = true;

      console.warn("Token expirado o inválido. Cerrando sesión...");

      // Mostrar notificación al usuario solo si NO estamos en la página de login o home
      if (!isLoginOrHomePage) {
        toast.error(
          "Tu sesión ha expirado. Serás redirigido a la página principal.",
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
      if (logoutFunction && !isLoginOrHomePage) {
        logoutFunction();
      } // Redirigir al home solo si no estamos ya en la página de home
      if (!isLoginOrHomePage && window.location.pathname !== "/home") {
        window.location.href = "/home";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
