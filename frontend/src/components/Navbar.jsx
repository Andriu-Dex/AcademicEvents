import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut, Home, Calendar, ClipboardList, GraduationCap, Settings, FileText, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./styles/Navbar.css";

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout(); // Limpiar token y usuario
    navigate("/login"); // Redirigir al login
  }; if (!usuario) {
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
        </Link>

        <div className="navbar-links">
          {usuario.rol_usu === "ESTUDIANTE" && (
            <>              <Link to="/home" className="nav-link-item">
              <span className="nav-link-icon"><Home size={18} /></span>
              <span>Inicio</span>
            </Link>
              <Link to="/eventos" className="nav-link-item">
                <span className="nav-link-icon"><Calendar size={18} /></span>
                <span>Eventos</span>
              </Link>
              <Link to="/inscripciones" className="nav-link-item">
                <span className="nav-link-icon"><ClipboardList size={18} /></span>
                <span>Mis inscripciones</span>
              </Link>
              <Link to="/certificados" className="nav-link-item">
                <span className="nav-link-icon"><GraduationCap size={18} /></span>
                <span>Certificados</span>
              </Link>
            </>
          )}{usuario.rol_usu === "ADMIN" && (
            <>              <Link to="/admin" className="nav-link-item">
              <span className="nav-link-icon"><Settings size={18} /></span>
              <span>Panel Admin</span>
            </Link>
              <Link to="/admin/eventos" className="nav-link-item">
                <span className="nav-link-icon"><FileText size={18} /></span>
                <span>Gestionar eventos</span>
              </Link>
              <Link to="/admin/eventos/crear" className="nav-link-item">
                <span className="nav-link-icon"><PlusCircle size={18} /></span>
                <span>Crear evento</span>
              </Link>
              <Link to="/admin/carreras" className="nav-link-item">
                <span className="nav-link-icon"><GraduationCap size={18} /></span>
                <span>Gestionar carreras</span>
              </Link>
            </>
          )}
        </div>
      </div>      <button className="navbar-logout" onClick={cerrarSesion}>
        <LogOut size={18} />
        <span>Cerrar sesión</span>
      </button>
    </nav>
  );
};

export default Navbar;
//Andriu Dex