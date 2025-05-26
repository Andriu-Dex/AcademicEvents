// Importa las dependencias necesarias
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ usuario }) => {
  // Verifica si el usuario tiene rol de estudiante
  const esEstudiante = usuario?.rol_usu === "ESTUDIANTE";
  const esAdministrador = usuario?.rol_usu === "ADMINISTRADOR";
  const correoUTA = usuario?.email?.endsWith("@uta.edu.ec");

  // Estado para controlar el submenu de inscripciones
  const [showInscripcionesSubmenu, setShowInscripcionesSubmenu] = useState(false);

  // Simulación de autenticación 
  const isAuthenticated = usuario ? true : false;

  // Determinar la carrera del estudiante (simulada para este ejemplo)
  const obtenerCarreraEstudiante = () => {
    // Esto sería reemplazado por datos reales del usuario
    if (esEstudiante) {
      // Suponiendo que el usuario tiene un campo carrera_id o similar
      if (usuario?.carrera === "SOFTWARE" || usuario?.carrera_id === 1) {
        return "Software";
      } else if (usuario?.carrera === "TI" || usuario?.carrera_id === 2) {
        return "TI";
      } else if (usuario?.carrera === "INDUSTRIAL" || usuario?.carrera_id === 3) {
        return "Industrial";
      }
    }
    return null;
  };

  // Obtener la carrera del estudiante
  const carreraEstudiante = obtenerCarreraEstudiante();

  // Facultad actual (dependiendo del tipo de usuario)
  const facultadActual = {
    nombre: esEstudiante && carreraEstudiante
      ? `FISEI - ${carreraEstudiante}`
      : "FISEI",
    nombreCompleto: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
    logo: "https://imgur.com/fch1iy6.png",
  };
  // Opciones del menú de navegación
  const navLinks = [
    { to: "/", label: "Inicio", hasSubmenu: false, icon: "🏠" },
    {
      to: "/inscripciones",
      label: "Inscripciones",
      hasSubmenu: true,
      icon: "📝",
      submenu: [
        { to: "/eventos", label: "📅 Eventos Académicos", description: "Conferencias, talleres y seminarios" },
        { to: "/cursos", label: "📚 Cursos Especializados", description: "Capacitaciones técnicas y certificaciones" }
      ]
    },
    { to: "/certificados", label: "Certificados", hasSubmenu: false, icon: "🏆", requiereEstudiante: true },
    { to: "/cursos", label: "Cursos en marcha", hasSubmenu: false, icon: "📚" },
    { to: "/eventos", label: "Eventos", hasSubmenu: false, icon: "📅" },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" style={{ background: "#8A1538" }}>
      <div className="container">
        <div className="d-flex align-items-center gap-2">
          <img
            src={facultadActual.logo}
            alt="Logo Facultad"
            style={{ width: 60, height: 60, objectFit: "contain" }}
            className="d-inline-block align-text-top"
          />
          <div className="d-flex flex-column">
            <span className="navbar-brand fw-bold mb-0" style={{ letterSpacing: "0.5px", fontSize: "1.3rem" }}>
              {facultadActual.nombre}
            </span>
            {!carreraEstudiante && (
              <small className="text-light opacity-75 d-none d-sm-inline-block">
                {facultadActual.nombreCompleto}
              </small>
            )}
          </div>
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {navLinks.map((link) => {
              // No mostrar enlaces que requieren ser estudiante si el usuario no lo es
              if (link.requiereEstudiante && !esEstudiante) {
                return null;
              }

              return (
                <li className={`nav-item ${link.hasSubmenu ? 'dropdown position-relative' : ''}`} key={link.to}>
                  {link.hasSubmenu ? (
                    <>
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        onMouseEnter={() => setShowInscripcionesSubmenu(true)}
                        onMouseLeave={() => setShowInscripcionesSubmenu(false)}
                        style={{
                          color: "#fff",
                          fontWeight: 500,
                          fontSize: "1.08rem",
                        }}
                      >
                        {link.label}
                      </a>
                      <div
                        className={`dropdown-menu p-0 border-0 shadow-lg ${showInscripcionesSubmenu ? 'show' : ''}`}
                        style={{ minWidth: "350px", marginTop: "0" }}
                        onMouseEnter={() => setShowInscripcionesSubmenu(true)}
                        onMouseLeave={() => setShowInscripcionesSubmenu(false)}
                      >
                        <div className="p-3" style={{ background: "linear-gradient(135deg, #8A1538 0%, #b23a5b 100%)" }}>
                          <h6 className="text-white fw-bold mb-1">Inscripciones Disponibles</h6>
                          <small className="text-white opacity-75">Selecciona el tipo de inscripción</small>
                        </div>
                        {link.submenu.map((subItem, index) => (
                          <div key={subItem.to} className="p-0">
                            <Link
                              className="dropdown-item p-3 border-0"
                              to={subItem.to}
                              onClick={() => setShowInscripcionesSubmenu(false)}
                              style={{
                                background: index % 2 === 0 ? "#f8f9fa" : "#fff",
                                transition: "all 0.3s ease"
                              }}
                            >
                              <div className="d-flex align-items-start">
                                <div className="flex-grow-1">
                                  <h6 className="mb-1 fw-bold" style={{ color: "#8A1538" }}>
                                    {subItem.label}
                                  </h6>
                                  <small className="text-muted">{subItem.description}</small>
                                </div>
                                <i className="fas fa-arrow-right ms-2 mt-1" style={{ color: "#8A1538", fontSize: "0.8rem" }}></i>
                              </div>
                            </Link>
                          </div>
                        ))}
                        <div className="p-3 bg-light text-center">
                          <small className="text-muted">¿Necesitas ayuda? <a href="#contacto" className="text-decoration-none" style={{ color: "#8A1538" }}>Contáctanos</a></small>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      className="nav-link"
                      to={link.to}
                      style={{
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: "1.08rem",
                        marginRight: 10,
                      }}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <Link to="/logout" className="btn btn-outline-light fw-bold ms-2">
                Cerrar sesión
              </Link>
            ) : (
              <Link to="/login" className="btn btn-light fw-bold ms-2" style={{ color: "#8A1538" }}>
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Estilos adicionales para efectos hover en el dropdown */}
      <style jsx>{`
            .dropdown-menu {
                margin-top: 0;
                border: none;
                border-radius: 10px;
                overflow: hidden;
            }
            .dropdown-item:hover {
                background: linear-gradient(135deg, #8A1538 0%, #b23a5b 100%) !important;
                color: white !important;
            }
            .dropdown-item:hover h6,
            .dropdown-item:hover small {
                color: white !important;
            }
            .dropdown-item:hover i {
                color: white !important;
            }
        `}</style>
    </nav>
  );
};

export default Navbar;
