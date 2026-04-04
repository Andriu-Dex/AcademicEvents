import axios from "axios";
import { toast } from "react-toastify"; // Importar toast para notificaciones

const resolveTenantSlug = () => {
  // Preferir env (config del despliegue) sobre localStorage (puede quedar con valores de pruebas).
  const candidate =
    import.meta.env.VITE_TENANT_SLUG ||
    import.meta.env.VITE_TENANT_ID ||
    localStorage.getItem("tenantSlug") ||
    "uta";

  // Evita valores inválidos que pueden aparecer por pruebas/manual (ej: "192")
  // y causan TENANT_NOT_FOUND en el backend.
  const slug = String(candidate || "").trim().toLowerCase();
  if (!slug) return "uta";
  // Algunos flujos guardan por error el tenantId (p.ej. "uta-tenant-id") en lugar del slug.
  if (slug.includes("tenant")) return "uta";
  if (/^\d+$/.test(slug)) return "uta";
  if (!/^[a-z0-9-]+$/.test(slug)) return "uta";
  return slug;
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
      error.response?.status === 401 &&
      !tokenExpirationNotified
    ) {
      // Verificar si estamos en la página de login, registro o home
      const isLoginOrHomePage =
        globalThis.location?.pathname === "/login" ||
        globalThis.location?.pathname === "/" ||
        globalThis.location?.pathname === "/register" ||
        globalThis.location?.pathname === "/home"; // Marcar que ya se ha notificado para evitar múltiples notificaciones
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
      if (!isLoginOrHomePage && globalThis.location?.pathname !== "/home") {
        globalThis.location.href = "/home";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
