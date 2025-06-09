import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useRef, useEffect } from "react";
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
  CheckSquare,
  Sliders,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./styles/Navbar.css";

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener la ubicación actual
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const reportMenuRef = useRef(null);
  // Función para determinar si un enlace está activo
  const isActive = (path) => {
    // Para rutas exactas
    const exactPaths = ["/admin", "/home"];
    if (exactPaths.includes(path)) {
      return location.pathname === path ? "nav-link-active" : "";
    }

    // Para /admin/eventos y /eventos, activo para todas las rutas que empiecen con esto
    if (path === "/admin/eventos" || path === "/eventos") {
      return location.pathname.startsWith(path) ? "nav-link-active" : "";
    }

    // Para el resto de rutas
    return location.pathname.startsWith(path) ? "nav-link-active" : "";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reportMenuRef.current && !reportMenuRef.current.contains(event.target)) {
        setShowReportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cerrarSesion = () => {
    // Obtener el nombre del usuario para personalizar el mensaje
    const nombreUsuario = usuario?.nom_usu || "Usuario";

    // Limpiar la sesión
    logout();

    // Mostrar un toast estilizado
    toast.success(
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <UserCheck size={20} color="#8a1538" />
        <div>
          <strong>¡Hasta pronto {nombreUsuario}!</strong>
          <p style={{ margin: 0, fontSize: "0.85rem" }}>
            Sesión cerrada exitosamente
          </p>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          borderLeft: "4px solid #8a1538",
          backgroundColor: "white",
          color: "#333",
        },
        icon: false,
      }
    );

    // Redireccionar al home
    navigate("/home");
  };

  // Cerrar el menú de perfil cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
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
          <div className="navbar-links">
            <Link to="/home" className={`nav-link-item ${isActive("/home")}`}>
              <span className="nav-link-icon">
                <Home size={18} />
              </span>
              <span>Inicio</span>
            </Link>
            <Link
              to="/eventos-publicos"
              className={`nav-link-item ${isActive("/eventos-publicos")}`}
            >
              <span className="nav-link-icon">
                <Calendar size={18} />
              </span>
              <span>Eventos Públicos</span>
            </Link>
          </div>
        </div>
        <div className="navbar-auth">
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
                </Link>{" "}
                <Link
                  to="/eventos"
                  className={`nav-link-item ${isActive("/eventos")}`}
                >
                  <span className="nav-link-icon">
                    <Calendar size={18} />
                  </span>
                  <span>Eventos disponibles</span>
                </Link>
                <Link
                  to="/inscripciones"
                  className={`nav-link-item ${isActive("/inscripciones")}`}
                >
                  <span className="nav-link-icon">
                    <ClipboardList size={18} />
                  </span>
                  <span>Mis inscripciones</span>
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
                  {" "}
                  <span className="nav-link-icon">
                    <FileText size={18} />
                  </span>
                  <span>Gestionar eventos</span>
                </Link>
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
                  to="/admin/inscripciones"
                  className={`nav-link-item ${isActive("/admin/inscripciones")}`}
                >
                  <span className="nav-link-icon">
                    <CheckSquare size={18} />
                  </span>
                  <span>Validar inscripciones</span>
                </Link>
                <Link
                  to="/admin/configuracion"
                  className={`nav-link-item ${isActive("/admin/configuracion")}`}
                >
                  <span className="nav-link-icon">
                    <Sliders size={18} />
                  </span>
                  <span>MVA</span>
                </Link>
                <div
                  className="nav-link-item-container"
                  ref={reportMenuRef}
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <div
                    className={`nav-link-item ${isActive("/admin/reportes")}`}
                    onClick={() => setShowReportMenu((prev) => !prev)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="nav-link-icon">
                      <FileText size={18} />
                    </span>
                    <span>Reportes</span>
                  </div>
                  {showReportMenu && (
                    <div
                      className="report-dropdown-menu"
                      style={{
                        position: "absolute",
                        top: "120%",
                        left: 0,
                        background: "#fff",
                        boxShadow: "0 4px 18px #0002",
                        borderRadius: "10px",
                        zIndex: 10,
                        minWidth: "170px",
                      }}
                    >
                      <Link
                        to="/admin/reportes-evento"
                        className="dropdown-link"
                        style={{ display: "block", padding: "12px 18px", color: "#8a1538", fontWeight: 600, textDecoration: "none" }}
                        onClick={() => setShowReportMenu(false)}
                      >
                        Por Evento
                      </Link>
                      <Link
                        to="/admin/reportes-mes"
                        className="dropdown-link"
                        style={{ display: "block", padding: "12px 18px", color: "#8a1538", fontWeight: 600, textDecoration: "none" }}
                        onClick={() => setShowReportMenu(false)}
                      >
                        Por Mes
                      </Link>
                    </div>
                  )}
                </div>

              </>
            )}
        </div>
      </div>{" "}
      <div className="navbar-profile" ref={profileMenuRef}>
        <div
          className="profile-button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <User size={18} className="profile-icon" />
          <span className="profile-name">{usuario?.nom_usu || "Usuario"}</span>
        </div>
        {showProfileMenu && (
          <div className="profile-dropdown">
            <Link to="/perfil" className="profile-menu-item">
              <User size={16} />
              <span>Mi Perfil</span>
            </Link>
            <div className="profile-menu-item logout" onClick={cerrarSesion}>
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
//Andriu Dex
