import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRouteAdmin = ({ children }) => {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" />;
  if (usuario.rol_usu !== "ADMIN") return <Navigate to="/eventos" />;

  return children;
};

export default PrivateRouteAdmin;
