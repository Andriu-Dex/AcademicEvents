import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as jwt_decode from "jwt-decode";

/**
 * Componente que protege rutas de administración.
 * Redirige al login si el usuario no está autenticado o no es administrador.
 *
 * @param {Object} props - Propiedades del componente
 * @param {ReactNode} props.children - Componentes hijos a renderizar si el usuario está autenticado y es admin
 * @returns {ReactNode} Componente de ruta protegida para admin
 */
const PrivateRouteAdmin = ({ children }) => {
  const { usuario, token, loading } = useAuth();

  // Mientras se verifica la autenticación, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay usuario o token, redirigir al home
  if (!usuario || !token) {
    return <Navigate to="/home" replace />;
  }

  // Verificar rol de administrador
  if (
    usuario.rol_usu !== "ADMIN_GLOBAL" &&
    usuario.rol_usu !== "ADMIN_GENERAL"
  ) {
    return <Navigate to="/eventos" replace />;
  }

  // Si el usuario está autenticado y es admin, renderizar los componentes hijos
  return children;
};

export default PrivateRouteAdmin;
