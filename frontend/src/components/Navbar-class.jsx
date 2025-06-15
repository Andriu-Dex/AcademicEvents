import React from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  Home,
  Calendar,
  ClipboardList,
  GraduationCap,
  Settings,
  FileText,
  User,
  CheckSquare,
  Sliders,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosConfig";
import "./styles/Navbar.css";

/**
 * Componente Navbar que muestra la barra de navegación de la aplicación
 * @returns {JSX.Element} El componente Navbar
 */
class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showProfileMenu: false,
      logoFacultad: "https://imgur.com/fch1iy6.png",
      acronimoFacultad: "FISEI",
      usuario: props.usuario,
    };

    this.profileMenuRef = React.createRef();
  }

  componentDidMount() {
    this.cargarDatosFacultad();

    // Agregar listener para cerrar el menú de perfil al hacer clic fuera de él
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    // Remover listener al desmontar el componente
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    // Actualizar usuario cuando cambian las props
    if (prevProps.usuario !== this.props.usuario) {
      this.setState({ usuario: this.props.usuario });
    }
  }

  /**
   * Carga los datos de la facultad desde la API
   */
  cargarDatosFacultad = async () => {
    try {
      const response = await axiosInstance.get("/mva/facultad");
      if (response.data) {
        this.setState({
          logoFacultad: response.data.logo || this.state.logoFacultad,
          acronimoFacultad:
            response.data.acronimo || this.state.acronimoFacultad,
        });
      }
    } catch (error) {
      console.error("Error al cargar datos de la facultad:", error);
    }
  };

  /**
   * Cierra el menú de perfil si se hace clic fuera de él
   */
  handleClickOutside = (event) => {
    if (
      this.profileMenuRef.current &&
      !this.profileMenuRef.current.contains(event.target)
    ) {
      this.setState({ showProfileMenu: false });
    }
  };

  /**
   * Alterna la visibilidad del menú de perfil
   */
  toggleProfileMenu = () => {
    this.setState((prevState) => ({
      showProfileMenu: !prevState.showProfileMenu,
    }));
  };

  /**
   * Determina si un enlace está activo
   * @param {string} path - La ruta a verificar
   * @returns {string} Clase CSS para marcar el enlace como activo
   */
  isActive = (path) => {
    const { location } = this.props;

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

  /**
   * Cierra la sesión del usuario
   */
  handleLogout = () => {
    this.props.logout();

    toast.success("Sesión cerrada correctamente", {
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
    });

    // Redireccionar al home usando el navigate de las props
    this.props.navigate("/home");
  };

  render() {
    const { usuario, logoFacultad, acronimoFacultad, showProfileMenu } =
      this.state;

    if (!usuario) {
      return (
        <nav className="navbar-ae">
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
              <Link
                to="/home"
                className={`nav-link-item ${this.isActive("/home")}`}
              >
                <span className="nav-link-icon">
                  <Home size={18} />
                </span>
                <span>Inicio</span>
              </Link>
              <Link
                to="/eventos-publicos"
                className={`nav-link-item ${this.isActive(
                  "/eventos-publicos"
                )}`}
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
      <nav className="navbar-ae">
        <div className="navbar-left">
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
                <Link
                  to="/home"
                  className={`nav-link-item ${this.isActive("/home")}`}
                >
                  <span className="nav-link-icon">
                    <Home size={18} />
                  </span>
                  <span>Inicio</span>
                </Link>
                <Link
                  to="/eventos"
                  className={`nav-link-item ${this.isActive("/eventos")}`}
                >
                  <span className="nav-link-icon">
                    <Calendar size={18} />
                  </span>
                  <span>Eventos disponibles</span>
                </Link>
                <Link
                  to="/inscripciones"
                  className={`nav-link-item ${this.isActive("/inscripciones")}`}
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
                <Link
                  to="/admin"
                  className={`nav-link-item ${this.isActive("/admin")}`}
                >
                  <span className="nav-link-icon">
                    <Settings size={18} />
                  </span>
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/eventos"
                  className={`nav-link-item ${this.isActive("/admin/eventos")}`}
                >
                  <span className="nav-link-icon">
                    <FileText size={18} />
                  </span>
                  <span>Gestionar eventos</span>
                </Link>
                <Link
                  to="/admin/carreras"
                  className={`nav-link-item ${this.isActive(
                    "/admin/carreras"
                  )}`}
                >
                  <span className="nav-link-icon">
                    <GraduationCap size={18} />
                  </span>
                  <span>Gestionar carreras</span>
                </Link>
                <Link
                  to="/admin/inscripciones"
                  className={`nav-link-item ${this.isActive(
                    "/admin/inscripciones"
                  )}`}
                >
                  <span className="nav-link-icon">
                    <CheckSquare size={18} />
                  </span>
                  <span>Validar inscripciones</span>
                </Link>
                <Link
                  to="/admin/configuracion"
                  className={`nav-link-item ${this.isActive(
                    "/admin/configuracion"
                  )}`}
                >
                  <span className="nav-link-icon">
                    <Sliders size={18} />
                  </span>
                  <span>MVA</span>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="navbar-profile" ref={this.profileMenuRef}>
          <div className="profile-button" onClick={this.toggleProfileMenu}>
            <User size={18} className="profile-icon" />
            <span className="profile-name">
              {usuario?.nom_usu || "Usuario"}
            </span>
          </div>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <Link to="/perfil" className="profile-menu-item">
                <User size={16} />
                <span>Mi Perfil</span>
              </Link>
              <div
                className="profile-menu-item logout"
                onClick={this.handleLogout}
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }
}

// Componente HOC para conectar el Navbar con los hooks de React Router
const NavbarWrapper = (props) => {
  const { usuario, logout, location, navigate } = props;

  return (
    <Navbar
      usuario={usuario}
      logout={logout}
      location={location}
      navigate={navigate}
    />
  );
};

export default NavbarWrapper;
