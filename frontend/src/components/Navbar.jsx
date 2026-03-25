import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React, { useState, useRef, useEffect } from "react";
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
  Menu,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosConfig";
import ProfileImageService from "../services/ProfileImageService";
import { NotificationBell } from "./notifications";
import "./styles/Navbar.css";

/**
 * Componente Navbar que muestra la barra de navegación de la aplicación
 * @returns {JSX.Element} El componente Navbar
 */
const Navbar = () => {
  const { usuario, logout, syncUserData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [logoFacultad, setLogoFacultad] = useState(
    "https://imgur.com/fch1iy6.png"
  );
  const [acronimoFacultad, setAcronimoFacultad] = useState("FISEI");
  const profileMenuRef = useRef();
  const hamburgerMenuRef = useRef();

  /**
   * Carga los datos de la facultad desde la API
   */
  const cargarDatosFacultad = async () => {
    try {
      const response = await axiosInstance.get("/facultad-principal");
      if (response.data) {
        setLogoFacultad(response.data.url_log_fac || logoFacultad);
        setAcronimoFacultad(response.data.acr_fac || acronimoFacultad);
      }
    } catch (error) {
      console.error("Error al cargar datos de la facultad:", error);
    }
  };

  /**
   * Cierra los menús si se hace clic fuera de ellos
   */
  const handleClickOutside = (event) => {
    // Cierra el menú de perfil si se hace clic fuera de él
    if (
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target)
    ) {
      setShowProfileMenu(false);
    }

    // Cierra el menú hamburguesa si se hace clic fuera de él
    if (
      hamburgerMenuRef.current &&
      !hamburgerMenuRef.current.contains(event.target)
    ) {
      setShowHamburgerMenu(false);
    }
  };

  /**
   * Maneja eventos de teclado para accesibilidad del menú de perfil
   * Soporta: Escape para cerrar, Enter/Space para activar
   */
  const handleProfileMenuKeyDown = (event) => {
    if (event.key === "Escape") {
      setShowProfileMenu(false);
      // Devolver foco al botón de perfil
      const profileButton = profileMenuRef.current?.querySelector(".profile-button");
      profileButton?.focus();
    }
  };

  /**
   * Alterna la visibilidad del menú de perfil
   */
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  /**
   * Alterna la visibilidad del menú hamburguesa
   */
  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };

  /**
   * Determina si un enlace está activo
   * @param {string} path - La ruta a verificar
   * @returns {string} Clase CSS para marcar el enlace como activo
   */
  const isActive = (path) => {
    const routeAliases = {
      "/register": ["/registro"],
      "/public-events": ["/eventos-publicos"],
      "/events": ["/eventos"],
      "/enrollments": ["/inscripciones"],
      "/profile": ["/perfil"],
      "/admin/events": ["/admin/eventos"],
      "/admin/careers": ["/admin/carreras"],
      "/admin/settings": ["/admin/configuracion"],
      "/admin/admins": ["/admin/gestion-admins"],
      "/admin/enrollments": ["/admin/inscripciones"],
    };

    const candidates = [path, ...(routeAliases[path] || [])];

    // Para rutas exactas
    const exactPaths = ["/admin", "/home"];
    if (exactPaths.includes(path)) {
      return candidates.includes(location.pathname) ? "nav-link-active" : "";
    }

    return candidates.some(
      (candidatePath) =>
        location.pathname === candidatePath ||
        location.pathname.startsWith(`${candidatePath}/`)
    )
      ? "nav-link-active"
      : "";
  };

  /**
   * Cierra la sesión del usuario
   */

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

    // Redireccionar al home usando navigate
    navigate("/home");
  };

  // Equivalente a componentDidMount y componentWillUnmount
  useEffect(() => {
    cargarDatosFacultad();

    // Agregar listener para cerrar el menú de perfil al hacer clic fuera de él
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function (equivalente a componentWillUnmount)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // El array vacío hace que se ejecute solo al montar y desmontar

  // Sincronizar datos del usuario cuando el componente se monte
  useEffect(() => {
    if (usuario && syncUserData) {
      syncUserData();
    }
  }, []); // Solo ejecutar una vez al montar el componente

  if (!usuario) {
    return (
      <nav className="navbar-ae" aria-label="Navegación principal">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo-container">
            <img
              src={logoFacultad}
              alt={`Logo ${acronimoFacultad}`}
              className="navbar-logo-img"
            />
            <span className="navbar-logo-text">{acronimoFacultad}</span>
          </Link>
          <div className="navbar-links">
            <Link to="/home" className={`nav-link-item ${isActive("/home")}`}>
              <span className="nav-link-icon">
                <Home size={18} />
              </span>
              <span>Inicio</span>
            </Link>
            <Link
              to="/public-events"
              className={`nav-link-item ${isActive("/public-events")}`}
            >
              <span className="nav-link-icon">
                <Calendar size={18} />
              </span>
              <span>Eventos</span>
            </Link>
          </div>
        </div>
        <div className="navbar-auth" aria-label="Acciones de autenticación">
          <Link to="/login" className="navbar-auth-btn login-btn">
            Iniciar sesión
          </Link>
          <Link to="/register" className="navbar-auth-btn register-btn">
            Registrarse
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar-ae" aria-label="Navegación principal">
      <div className="navbar-left">
        {usuario.rol_usu === "ADMIN_GLOBAL" && (
          <div className="hamburger-menu-container" ref={hamburgerMenuRef}>
            <button
              className="hamburger-button"
              onClick={toggleHamburgerMenu}
              type="button"
              aria-expanded={showHamburgerMenu}
              aria-haspopup="menu"
              aria-controls="admin-shortcuts-menu"
              aria-label="Abrir accesos rápidos de administración"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
            {showHamburgerMenu && (
              <div
                id="admin-shortcuts-menu"
                className="hamburger-menu"
                role="menu"
                aria-label="Accesos rápidos de administración"
              >
                <Link
                  to="/admin/settings"
                  className={`hamburger-menu-item ${isActive("/admin/settings")}`}
                  onClick={toggleHamburgerMenu}
                  role="menuitem"
                >
                  <span className="hamburger-menu-icon">
                    <Sliders size={18} aria-hidden="true" />
                  </span>
                  <span>MVA</span>
                </Link>
                <Link
                  to="/admin/admins"
                  className={`hamburger-menu-item ${isActive("/admin/admins")}`}
                  onClick={toggleHamburgerMenu}
                  role="menuitem"
                >
                  <span className="hamburger-menu-icon">
                    <UserCheck size={18} aria-hidden="true" />
                  </span>
                  <span>Gestionar Usuarios</span>
                </Link>
              </div>
            )}
          </div>
        )}
        <Link to="/home" className="navbar-logo-container">
          <img
            src={logoFacultad}
            alt={`Logo ${acronimoFacultad}`}
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">{acronimoFacultad}</span>
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
                to="/events"
                className={`nav-link-item ${isActive("/events")}`}
              >
                <span className="nav-link-icon">
                  <Calendar size={18} />
                </span>
                <span>Eventos</span>
              </Link>
              <Link
                to="/enrollments"
                className={`nav-link-item ${isActive("/enrollments")}`}
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
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/events"
                className={`nav-link-item ${isActive("/admin/events")}`}
              >
                {" "}
                <span className="nav-link-icon">
                  <FileText size={18} />
                </span>
                <span>Gestionar eventos</span>
              </Link>
              <Link
                to="/admin/careers"
                className={`nav-link-item ${isActive("/admin/careers")}`}
              >
                <span className="nav-link-icon">
                  <GraduationCap size={18} />
                </span>
                <span>Gestionar carreras</span>
              </Link>
              <Link
                to="/admin/enrollments"
                className={`nav-link-item ${isActive("/admin/enrollments")}`}
              >
                <span className="nav-link-icon">
                  <CheckSquare size={18} />
                </span>
                <span>Validar inscripciones</span>
              </Link>
            </>
          )}
        </div>
      </div>{" "}
      <div className="navbar-right-section">
        <NotificationBell />

        <div className="navbar-profile" ref={profileMenuRef} onKeyDown={handleProfileMenuKeyDown}>
          <button
            type="button"
            className="profile-button"
            onClick={toggleProfileMenu}
            aria-expanded={showProfileMenu}
            aria-haspopup="menu"
            aria-label={`Menú de perfil de ${usuario?.nom_usu || "Usuario"}`}
          >
            <span className="profile-name">{usuario?.nom_usu || "Usuario"}</span>
            <span className="profile-avatar" aria-hidden="true">
              {usuario?.img_per_usu ? (
                <img
                  src={ProfileImageService.getProfileImageUrl(
                    usuario.img_per_usu,
                    true
                  )}
                  alt="Foto de perfil"
                  className="profile-avatar-img-nb"
                  key={usuario.img_per_usu} // Forzar re-render cuando cambie la imagen
                />
              ) : (
                <User size={18} className="profile-icon" />
              )}
            </span>
          </button>
        {showProfileMenu && (
          <div className="profile-dropdown" role="menu" aria-label="Opciones de perfil">
            <Link to="/profile" className="profile-menu-item" role="menuitem">
              <User size={16} aria-hidden="true" />
              <span>Mi Perfil</span>
            </Link>
            <button
              type="button"
              className="profile-menu-item logout"
              onClick={cerrarSesion}
              role="menuitem"
            >
              <LogOut size={16} aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
//Andriu Dex
