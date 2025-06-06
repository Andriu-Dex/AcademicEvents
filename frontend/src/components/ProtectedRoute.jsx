import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Componente que protege rutas que requieren autenticación.
 * Redirige al login si el usuario no está autenticado.
 *
 * @param {Object} props - Propiedades del componente
 * @param {ReactNode} props.children - Componentes hijos a renderizar si el usuario está autenticado
 * @returns {ReactNode} Componente de ruta protegida
 */
const ProtectedRoute = ({ children }) => {
  const { usuario, token, loading } = useAuth();

  // Mientras se verifica la autenticación, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay usuario o token, redirigir al login
  if (!usuario || !token) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, renderizar los componentes hijos
  return children;
};

export default ProtectedRoute;
