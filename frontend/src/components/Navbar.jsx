import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { usuario, cerrarSesion } = useAuth();

  if (!usuario) return null;

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-blue-700">
          AcademicEvents
        </Link>

        {usuario.rol_usu === "ESTUDIANTE" && (
          <>
            <Link
              to="/eventos"
              className="text-sm text-gray-700 hover:underline"
            >
              Eventos
            </Link>
            <Link
              to="/inscripciones"
              className="text-sm text-gray-700 hover:underline"
            >
              Mis inscripciones
            </Link>
            <Link
              to="/certificados"
              className="text-sm text-gray-700 hover:underline"
            >
              Certificados
            </Link>
          </>
        )}

        {usuario.rol_usu === "ADMIN" && (
          <>
            <Link
              to="/admin/eventos"
              className="text-sm text-gray-700 hover:underline"
            >
              Gestionar eventos
            </Link>
            <Link
              to="/admin/carreras"
              className="text-sm text-gray-700 hover:underline"
            >
              Gestionar carreras
            </Link>
          </>
        )}
      </div>

      <button
        onClick={cerrarSesion}
        className="text-sm flex items-center gap-1 text-red-600 hover:underline"
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
    </nav>
  );
};

export default Navbar;
