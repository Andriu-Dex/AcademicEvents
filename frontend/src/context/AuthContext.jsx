import { createContext, useContext, useState, useEffect } from "react";

// Crea el contexto de autenticación
export const AuthContext = createContext();

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null); // Usuario autenticado
  const [token, setToken] = useState(null); // Token JWT
  const [loading, setLoading] = useState(true); // Indicador de carga inicial

  // Al montar el componente, intenta recuperar sesión desde localStorage
  useEffect(() => {
    const datos = localStorage.getItem("authData");
    if (datos) {
      const { usuario, token } = JSON.parse(datos);
      setUsuario(usuario);
      setToken(token);
    }
    setLoading(false);
  }, []);

  // Iniciar sesión y persistir en localStorage
  const login = (usuario, token) => {
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem("authData", JSON.stringify({ usuario, token }));
  };

  // Cerrar sesión y limpiar localStorage
  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("authData");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto
export const useAuth = () => useContext(AuthContext);
