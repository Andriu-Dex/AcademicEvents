// Importa useContext para consumir contextos de React
import { useContext } from "react";

// Importa el contexto de autenticación previamente definido
import { AuthContext } from "../context/AuthContext";

// Hook personalizado para acceder al contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
