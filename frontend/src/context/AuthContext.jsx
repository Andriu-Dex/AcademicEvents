import { createContext, useContext, useState, useEffect } from "react";

// Crea el contexto de autenticación
export const AuthContext = createContext();

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null); // Usuario autenticado
  const [token, setToken] = useState(null); // Token JWT

  // Al montar el componente, intenta recuperar sesión desde localStorage
  useEffect(() => {
    const datos = localStorage.getItem("authData");
    if (datos) {
      const { usuario, token } = JSON.parse(datos);
      setUsuario(usuario);
      setToken(token);
    }
  }, []);

  // Función para iniciar sesión y guardar en localStorage
  const login = (usuario, token) => {
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem("authData", JSON.stringify({ usuario, token }));
  };

  // Función para cerrar sesión y limpiar todo
  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("authData");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto de autenticación
export const useAuth = () => useContext(AuthContext);
