import { createContext, useContext, useState, useEffect } from "react";
import { setLogoutFunction } from "../api/axiosConfig";

// Crea el contexto de autenticación
export const AuthContext = createContext();

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null); // Usuario autenticado
  const [token, setToken] = useState(null); // Token JWT
  const [loading, setLoading] = useState(true); // Indicador de carga inicial
  // Al montar el componente, intenta recuperar sesión desde localStorage
  useEffect(() => {
    try {
      const datos = localStorage.getItem("authData");
      if (datos) {
        const { usuario, token } = JSON.parse(datos);
        
        // Validación básica del token antes de usarlo
        if (token && typeof token === 'string' && token.length > 10) {
          setUsuario(usuario);
          setToken(token);
        } else {
          console.warn("🚫 Token inválido detectado, limpiando storage...");
          localStorage.removeItem("authData");
          localStorage.removeItem("token");
        }
      }
    } catch (error) {
      console.error("❌ Error al recuperar datos de autenticación:", error);
      // Limpiar datos corruptos
      localStorage.removeItem("authData");
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);
  // Iniciar sesión y persistir en localStorage
  const login = (usuario, token) => {
    // Validación básica del token antes de guardarlo
    if (!token || typeof token !== 'string' || token.length < 10) {
      console.error("❌ Token inválido recibido en login:", token);
      return false;
    }
    
    try {
      setUsuario(usuario);
      setToken(token);
      localStorage.setItem("authData", JSON.stringify({ usuario, token }));
      localStorage.setItem("token", token);
      
      // Comprobar el token se guarda correctamente
      console.log("✅ Login exitoso, token guardado:", token.substring(0, 20) + "...");
      return true;
    } catch (error) {
      console.error("❌ Error al guardar datos de login:", error);
      return false;
    }
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

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto
export const useAuth = () => useContext(AuthContext);
