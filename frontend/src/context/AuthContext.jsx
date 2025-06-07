import { createContext, useContext, useState, useEffect } from "react";
import { setLogoutFunction } from "../api/axiosConfig";
import * as jwt_decode from "jwt-decode";
import { toast } from "react-toastify";

// Crea el contexto de autenticación
export const AuthContext = createContext();

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null); // Usuario autenticado
  const [token, setToken] = useState(null); // Token JWT
  const [loading, setLoading] = useState(true); // Indicador de carga inicial
  // Función para verificar si un token es válido
  const isTokenValid = (token) => {
    try {
      const decoded = jwt_decode.jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return false;
    }
  };

  // Al montar el componente, intenta recuperar sesión desde localStorage
  useEffect(() => {
    const datos = localStorage.getItem("authData");
    if (datos) {
      try {
        const { usuario, token } = JSON.parse(datos);

        // Verificar si el token es válido antes de establecer el estado
        if (token && isTokenValid(token)) {
          setUsuario(usuario);
          setToken(token);
        } else {
          // Si el token ha expirado, limpiar localStorage
          console.log("Token expirado encontrado al iniciar. Sesión cerrada.");
          localStorage.removeItem("authData");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error al recuperar datos de autenticación:", error);
        localStorage.removeItem("authData");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // Iniciar sesión y persistir en localStorage
  const login = (usuario, token) => {
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem("authData", JSON.stringify({ usuario, token }));
    localStorage.setItem("token", token);
    // Comprobar el token se guarda correctamente
    console.log("TOKEN:", localStorage.getItem("token"));
  };
  // Cerrar sesión y limpiar localStorage
  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("authData");
    localStorage.removeItem("token");
  };
  // Configurar la función de logout en axios al montar el componente
  useEffect(() => {
    setLogoutFunction(logout);
  }, []);

  // Verificación periódica de la validez del token (Silent Check)
  useEffect(() => {
    // No hacer nada si no hay token
    if (!token) return;

    // Función para verificar si el token está próximo a expirar
    const checkTokenExpiration = () => {
      try {
        const decoded = jwt_decode.jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Si el token ya expiró, cerrar sesión
        if (decoded.exp <= currentTime) {
          console.log(
            "Token expirado detectado durante verificación periódica."
          );
          toast.error(
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
          );
          logout();
          return;
        }

        // Si el token expira en menos de 5 minutos, mostrar advertencia
        if (decoded.exp < currentTime + 300) {
          // 300 segundos = 5 minutos
          toast.warning(
            "Tu sesión expirará pronto. Por favor, guarda tus cambios."
          );
        }
      } catch (error) {
        console.error("Error al verificar token:", error);
      }
    };

    // Verificar inmediatamente al montar el componente
    checkTokenExpiration();

    // Configurar verificación periódica cada 5 minutos
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [token]);

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto
export const useAuth = () => useContext(AuthContext);
