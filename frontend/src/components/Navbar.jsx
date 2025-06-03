import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LogOut,
  Home,
  Calendar,
  ClipboardList,
  GraduationCap,
  Settings,
  FileText,
  PlusCircle,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./styles/Navbar.css";

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener la ubicación actual  // Función para determinar si un enlace está activo
  const isActive = (path) => {
    // Para rutas exactas
    const exactPaths = ["/admin", "/home", "/admin/eventos/crear"];
    if (exactPaths.includes(path)) {
      return location.pathname === path ? "nav-link-active" : "";
    }

    // Para /admin/eventos, solo activo si estamos en la lista de eventos pero no en crear
    if (path === "/admin/eventos") {
      return location.pathname === "/admin/eventos" ||
        (location.pathname.startsWith("/admin/eventos/") &&
          !location.pathname.includes("/crear"))
        ? "nav-link-active"
        : "";
    }

    // Para el resto de rutas
    return location.pathname.startsWith(path) ? "nav-link-active" : "";
  };

  const cerrarSesion = () => {
    logout(); // Limpiar token y usuario
    navigate("/login"); // Redirigir al login
  };
  if (!usuario) {
    return (
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo-container">
            <img
              src="https://imgur.com/fch1iy6.png"
              alt="Logo FISEI"
              className="navbar-logo-img"
            />
            <span className="navbar-logo-text">FISEI</span>
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/login" className="navbar-auth-btn login-btn">
            Iniciar sesión
          </Link>
          <Link to="/registro" className="navbar-auth-btn register-btn">
            Registrarse
          </Link>
        </div>
      </nav>
    );
  }
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/home" className="navbar-logo-container">
          <img
            src="https://imgur.com/fch1iy6.png"
            alt="Logo FISEI"
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">FISEI</span>
        </Link>{" "}
        <div className="navbar-links">
          {(usuario.rol_usu === "ESTUDIANTE" ||
            usuario.rol_usu === "GENERAL") && (
            <>
              {" "}
              <Link to="/home" className={`nav-link-item ${isActive("/home")}`}>
                <span className="nav-link-icon">
                  <Home size={18} />
                </span>
                <span>Inicio</span>
              </Link>
              <Link
                to="/eventos"
                className={`nav-link-item ${isActive("/eventos")}`}
              >
                <span className="nav-link-icon">
                  <Calendar size={18} />
                </span>
                <span>Eventos</span>
              </Link>
              <Link
                to="/inscripciones"
                className={`nav-link-item ${isActive("/inscripciones")}`}
              >
                <span className="nav-link-icon">
                  <ClipboardList size={18} />
                </span>
                <span>Mis inscripciones</span>
              </Link>{" "}
              <Link
                to="/certificados"
                className={`nav-link-item ${isActive("/certificados")}`}
              >
                <span className="nav-link-icon">
                  <GraduationCap size={18} />
                </span>
                <span>Certificados</span>
              </Link>
              <Link
                to="/perfil"
                className={`nav-link-item ${isActive("/perfil")}`}
              >
                <span className="nav-link-icon">
                  <User size={18} />
                </span>
                <span>Mi Perfil</span>
              </Link>
            </>
          )}{" "}
          {(usuario.rol_usu === "ADMIN_GLOBAL" ||
            usuario.rol_usu === "ADMIN_GENERAL") && (
            <>
              {" "}
              <Link
                to="/admin"
                className={`nav-link-item ${isActive("/admin")}`}
              >
                <span className="nav-link-icon">
                  <Settings size={18} />
                </span>
                <span>Panel Admin</span>
              </Link>
              <Link
                to="/admin/eventos"
                className={`nav-link-item ${isActive("/admin/eventos")}`}
              >
                <span className="nav-link-icon">
                  <FileText size={18} />
                </span>
                <span>Gestionar eventos</span>
              </Link>
              <Link
                to="/admin/eventos/crear"
                className={`nav-link-item ${isActive("/admin/eventos/crear")}`}
              >
                <span className="nav-link-icon">
                  <PlusCircle size={18} />
                </span>
                <span>Crear evento</span>
              </Link>{" "}
              <Link
                to="/admin/carreras"
                className={`nav-link-item ${isActive("/admin/carreras")}`}
              >
                <span className="nav-link-icon">
                  <GraduationCap size={18} />
                </span>
                <span>Gestionar carreras</span>
              </Link>
              <Link
                to="/perfil"
                className={`nav-link-item ${isActive("/perfil")}`}
              >
                <span className="nav-link-icon">
                  <User size={18} />
                </span>
                <span>Mi Perfil</span>
              </Link>
            </>
          )}
        </div>
      </div>{" "}
      <button className="navbar-logout" onClick={cerrarSesion}>
        <LogOut size={18} />
        <span>Cerrar sesión</span>
      </button>
    </nav>
  );
};

export default Navbar;
//Andriu Dex
