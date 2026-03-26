import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setLogoutFunction } from "../api/axiosConfig";
import * as jwt_decode from "jwt-decode";
import { toast } from "react-toastify";
import ProfileImageService from "../services/ProfileImageService";
import UserDataSyncService from "../services/UserDataSyncService";

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
  };

  // Actualizar la imagen de perfil del usuario
  const updateProfileImage = (imageUrl) => {
    if (!usuario) return;

    // Crear una copia actualizada del usuario con URL con cache buster
    const updatedUser = {
      ...usuario,
      img_per_usu: ProfileImageService.addCacheBuster(imageUrl),
    };

    // Actualizar el estado y localStorage
    setUsuario(updatedUser);

    // Actualizar localStorage solo si hay datos guardados
    const authDataStr = localStorage.getItem("authData");
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        localStorage.setItem(
          "authData",
          JSON.stringify({
            ...authData,
            usuario: updatedUser,
          })
        );
      } catch (error) {
        console.error("Error al actualizar la imagen en localStorage:", error);
      }
    }

    // Actualizar imagen en el DOM
    ProfileImageService.updateProfileImageInDOM(imageUrl);

    // Precargar la nueva imagen
    ProfileImageService.preloadImage(imageUrl).catch((error) => {
      console.warn("Error al precargar imagen de perfil:", error);
    });
  };

  // Función para sincronizar datos del usuario con el servidor
  const syncUserData = useCallback(async () => {
    if (!token || !usuario || !UserDataSyncService.shouldSync()) {
      return;
    }

    try {
      UserDataSyncService.markSyncStarted();

      // Importar axiosInstance dinámicamente para evitar circular dependencies
      const { default: axiosInstance } = await import("../api/axiosConfig");
      const result = await UserDataSyncService.fetchUserData(axiosInstance);

      if (!result?.success) {
        if (result?.statusCode === 429) {
          UserDataSyncService.markRateLimited();
          return;
        }
        return;
      }

      const serverData = result.data;

      if (serverData) {
        const updatedUserData = UserDataSyncService.transformUserData(
          serverData,
          usuario
        );

        UserDataSyncService.updateSyncTime();

        if (!UserDataSyncService.hasUserDataChanged(usuario, updatedUserData)) {
          return;
        }

        // Actualizar estado
        setUsuario(updatedUserData);

        // Actualizar localStorage
        UserDataSyncService.updateLocalStorage(updatedUserData);
      }
    } catch (error) {
      console.error("Error al sincronizar datos del usuario:", error);
    } finally {
      UserDataSyncService.markSyncFinished();
    }
  }, [token, usuario]);

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
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        loading,
        updateProfileImage,
        syncUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto
export const useAuth = () => useContext(AuthContext);
