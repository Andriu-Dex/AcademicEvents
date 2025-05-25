import axios from 'axios';

// Crear una instancia de axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', // URL base del backend
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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas - manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (no autorizado), cerrar sesión automáticamente
    if (error.response && error.response.status === 401) {
      console.warn('Token expirado o inválido. Cerrando sesión...');
      
      // Ejecutar logout si está disponible
      if (logoutFunction) {
        logoutFunction();
      }
      
      // Opcional: redirigir al login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
