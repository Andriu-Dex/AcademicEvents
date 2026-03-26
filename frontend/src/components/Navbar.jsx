import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckSquare,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Settings,
  Sliders,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosConfig";
import ProfileImageService from "../services/ProfileImageService";
import { NotificationBell } from "./notifications";
import "./styles/Navbar.css";

const getMenuItems = (menuContainer) =>
  Array.from(menuContainer?.querySelectorAll('[role="menuitem"]') || []);

const focusMenuItem = (menuContainer, targetIndex) => {
  const items = getMenuItems(menuContainer);

  if (items.length === 0) {
    return;
  }

  const normalizedIndex =
    ((targetIndex % items.length) + items.length) % items.length;

  items[normalizedIndex]?.focus();
};

const focusAdjacentMenuItem = (menuContainer, currentElement, direction) => {
  const items = getMenuItems(menuContainer);

  if (items.length === 0) {
    return;
  }

  const currentIndex = items.indexOf(currentElement);
  const fallbackIndex = direction === "next" ? 0 : items.length - 1;
  const nextIndex =
    currentIndex === -1
      ? fallbackIndex
      : direction === "next"
      ? currentIndex + 1
      : currentIndex - 1;

  focusMenuItem(menuContainer, nextIndex);
};

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
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const hamburgerMenuRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

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

  const openProfileMenu = ({
    focusFirstItem = false,
    focusLastItem = false,
  } = {}) => {
    setShowProfileMenu(true);

    if (focusFirstItem || focusLastItem) {
      requestAnimationFrame(() => {
        focusMenuItem(profileMenuRef.current, focusLastItem ? -1 : 0);
      });
    }
  };

  const closeProfileMenu = ({ focusTrigger = false } = {}) => {
    setShowProfileMenu(false);

    if (focusTrigger) {
      requestAnimationFrame(() => {
        profileButtonRef.current?.focus();
      });
    }
  };

  const openHamburgerMenu = ({
    focusFirstItem = false,
    focusLastItem = false,
  } = {}) => {
    setShowHamburgerMenu(true);

    if (focusFirstItem || focusLastItem) {
      requestAnimationFrame(() => {
        focusMenuItem(hamburgerMenuRef.current, focusLastItem ? -1 : 0);
      });
    }
  };

  const closeHamburgerMenu = ({ focusTrigger = false } = {}) => {
    setShowHamburgerMenu(false);

    if (focusTrigger) {
      requestAnimationFrame(() => {
        hamburgerButtonRef.current?.focus();
      });
    }
  };

  const toggleProfileMenu = () => {
    if (showProfileMenu) {
      closeProfileMenu();
      return;
    }

    openProfileMenu();
  };

  const toggleHamburgerMenu = () => {
    if (showHamburgerMenu) {
      closeHamburgerMenu();
      return;
    }

    openHamburgerMenu();
  };

  const handleMenuNavigation = ({
    event,
    isOpen,
    openMenu,
    closeMenu,
    menuRef,
  }) => {
    switch (event.key) {
      case "Escape":
        if (!isOpen) {
          return;
        }

        event.preventDefault();
        closeMenu({ focusTrigger: true });
        break;
      case "ArrowDown":
        event.preventDefault();

        if (!isOpen) {
          openMenu({ focusFirstItem: true });
          return;
        }

        focusAdjacentMenuItem(menuRef.current, event.target, "next");
        break;
      case "ArrowUp":
        event.preventDefault();

        if (!isOpen) {
          openMenu({ focusLastItem: true });
          return;
        }

        focusAdjacentMenuItem(menuRef.current, event.target, "previous");
        break;
      case "Home":
        if (!isOpen) {
          return;
        }

        event.preventDefault();
        focusMenuItem(menuRef.current, 0);
        break;
      case "End":
        if (!isOpen) {
          return;
        }

        event.preventDefault();
        focusMenuItem(menuRef.current, -1);
        break;
      default:
        break;
    }
  };

  const handleProfileButtonKeyDown = (event) => {
    handleMenuNavigation({
      event,
      isOpen: showProfileMenu,
      openMenu: openProfileMenu,
      closeMenu: closeProfileMenu,
      menuRef: profileMenuRef,
    });
  };

  const handleProfileMenuKeyDown = (event) => {
    handleMenuNavigation({
      event,
      isOpen: showProfileMenu,
      openMenu: openProfileMenu,
      closeMenu: closeProfileMenu,
      menuRef: profileMenuRef,
    });
  };

  const handleHamburgerButtonKeyDown = (event) => {
    handleMenuNavigation({
      event,
      isOpen: showHamburgerMenu,
      openMenu: openHamburgerMenu,
      closeMenu: closeHamburgerMenu,
      menuRef: hamburgerMenuRef,
    });
  };

  const handleHamburgerMenuKeyDown = (event) => {
    handleMenuNavigation({
      event,
      isOpen: showHamburgerMenu,
      openMenu: openHamburgerMenu,
      closeMenu: closeHamburgerMenu,
      menuRef: hamburgerMenuRef,
    });
  };

  const handleClickOutside = (event) => {
    if (
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target)
    ) {
      closeProfileMenu();
    }

    if (
      hamburgerMenuRef.current &&
      !hamburgerMenuRef.current.contains(event.target)
    ) {
      closeHamburgerMenu();
    }
  };

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

  const cerrarSesion = () => {
    const nombreUsuario = usuario?.nom_usu || "Usuario";

    logout();

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

    navigate("/home");
  };

  useEffect(() => {
    cargarDatosFacultad();
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (usuario && syncUserData) {
      syncUserData();
    }
  }, []);

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
              ref={hamburgerButtonRef}
              className="hamburger-button"
              onClick={toggleHamburgerMenu}
              onKeyDown={handleHamburgerButtonKeyDown}
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
                onKeyDown={handleHamburgerMenuKeyDown}
              >
                <Link
                  to="/admin/settings"
                  className={`hamburger-menu-item ${isActive("/admin/settings")}`}
                  onClick={() => closeHamburgerMenu()}
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
                  onClick={() => closeHamburgerMenu()}
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
        </Link>

        <div className="navbar-links">
          {(usuario.rol_usu === "ESTUDIANTE" ||
            usuario.rol_usu === "GENERAL") && (
            <>
              <Link to="/home" className={`nav-link-item ${isActive("/home")}`}>
                <span className="nav-link-icon">
                  <Home size={18} />
                </span>
                <span>Inicio</span>
              </Link>
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
          )}

          {(usuario.rol_usu === "ADMIN_GLOBAL" ||
            usuario.rol_usu === "ADMIN_GENERAL") && (
            <>
              <Link to="/admin" className={`nav-link-item ${isActive("/admin")}`}>
                <span className="nav-link-icon">
                  <Settings size={18} />
                </span>
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/events"
                className={`nav-link-item ${isActive("/admin/events")}`}
              >
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
      </div>

      <div className="navbar-right-section">
        <NotificationBell />

        <div className="navbar-profile" ref={profileMenuRef}>
          <button
            ref={profileButtonRef}
            type="button"
            className="profile-button"
            onClick={toggleProfileMenu}
            onKeyDown={handleProfileButtonKeyDown}
            aria-expanded={showProfileMenu}
            aria-haspopup="menu"
            aria-controls="profile-menu"
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
                  key={usuario.img_per_usu}
                />
              ) : (
                <User size={18} className="profile-icon" />
              )}
            </span>
          </button>

          {showProfileMenu && (
            <div
              id="profile-menu"
              className="profile-dropdown"
              role="menu"
              aria-label="Opciones de perfil"
              onKeyDown={handleProfileMenuKeyDown}
            >
              <Link
                to="/profile"
                className="profile-menu-item"
                role="menuitem"
                onClick={() => closeProfileMenu()}
              >
                <User size={16} aria-hidden="true" />
                <span>Mi Perfil</span>
              </Link>
              <button
                type="button"
                className="profile-menu-item logout"
                onClick={() => {
                  closeProfileMenu();
                  cerrarSesion();
                }}
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
