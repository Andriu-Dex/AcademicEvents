import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./styles/Navbar.css";

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout(); // Limpiar token y usuario
    navigate("/login"); // Redirigir al login
  };

  if (!usuario) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          AcademicEvents
        </Link>

        <div className="navbar-links">
          {usuario.rol_usu === "ESTUDIANTE" && (
            <>
              <Link to="/eventos">Eventos</Link>
              <Link to="/inscripciones">Mis inscripciones</Link>
              <Link to="/certificados">Certificados</Link>
            </>
          )}
          {usuario.rol_usu === "ADMIN" && (
            <>
              <Link to="/admin/eventos">Gestionar eventos</Link>
              <Link to="/admin/carreras">Gestionar carreras</Link>
            </>
          )}
        </div>
      </div>

      <button className="navbar-logout" onClick={cerrarSesion}>
        <LogOut size={16} />
        <span>Cerrar sesión</span>
      </button>
    </nav>
  );
};

export default Navbar;
//Andriu Dex
