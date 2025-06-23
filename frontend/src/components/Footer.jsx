import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import "./styles/Footer.css";

/**
 * Componente Footer que muestra el pie de página de la aplicación
 * @returns {JSX.Element} El componente Footer
 */
const Footer = ({ isAuthenticated }) => {
  const [facultad, setFacultad] = useState({
    nombre: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
    acronimo: "FISEI",
    logo: "https://imgur.com/fch1iy6.png",
  });

  const [universidad, setUniversidad] = useState({
    nombre: "Universidad Técnica de Ambato",
    acronimo: "UTA",
    logo: "",
    direccion: "Av. de los Chasquis, Ambato",
    email: "info@uta.edu.ec",
    telefono: "(03) 252-1081",
  });

  /**
   * Carga los datos de la facultad desde la API
   */
  const cargarDatosFacultad = async () => {
    try {
      const response = await axiosInstance.get("/facultad-principal");
      if (response.data) {
        setFacultad({
          nombre: response.data.nom_fac || facultad.nombre,
          acronimo: response.data.acr_fac || facultad.acronimo,
          logo: response.data.url_log_fac || facultad.logo,
        });
      }
    } catch (error) {
      console.error("Error al cargar datos de la facultad:", error);
    }
  };

  /**
   * Carga los datos de la universidad desde la API
   */
  const cargarDatosUniversidad = async () => {
    try {
      const response = await axiosInstance.get("/universidad-principal");
      if (response.data) {
        setUniversidad({
          nombre: response.data.nom_uni || universidad.nombre,
          acronimo: response.data.acr_uni || universidad.acronimo,
          logo: response.data.url_log_uni || universidad.logo,
          direccion: response.data.dir_uni || universidad.direccion,
          email: response.data.cor_uni || universidad.email,
          telefono: response.data.tel_uni || universidad.telefono,
        });
      }
    } catch (error) {
      console.error("Error al cargar datos de la universidad:", error);
    }
  };

  // Equivalente a componentDidMount
  useEffect(() => {
    cargarDatosFacultad();
    cargarDatosUniversidad();
  }, []); // El array vacío hace que se ejecute solo al montar el componente

  return (
    <footer className="footer-component-fc">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-col footer-col-4">
            <div className="footer-header">
              <img src={facultad.logo} alt="Logo" className="footer-logo-fc" />
              <h5 className="footer-title-fc">{facultad.acronimo}</h5>
            </div>
            <p className="footer-subtitle-fc">{universidad.nombre}</p>
          </div>

          <div className="footer-col footer-col-2">
            <h6 className="footer-section-title-fc">Académico</h6>
            <ul className="footer-list">
              <li className="footer-list-item">
                <Link
                  to="/home#inicio"
                  className="footer-link-fc"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navegar al home y luego hacer scroll al inicio
                    window.location.href = "/home";
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Facultad
                </Link>
              </li>
              {isAuthenticated && (
                <li className="footer-list-item">
                  <Link to="/inscripciones" className="footer-link-fc">
                    Inscripciones
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="footer-col footer-col-3">
            <h6 className="footer-section-title-fc">Información</h6>
            <ul className="footer-list">
              <li className="footer-list-item">
                <a href="#autoridades" className="footer-link-fc">
                  Autoridades
                </a>
              </li>
              <li className="footer-list-item">
                <a href="#carreras" className="footer-link-fc">
                  Carreras
                </a>
              </li>
              <li className="footer-list-item">
                <a href="#mision-vision" className="footer-link-fc">
                  Misión y Visión
                </a>
              </li>
            </ul>
          </div>

          {/* Auditoria */}
          <div className="footer-col footer-col-3">
            <h6 className="footer-section-title-fc">Auditoria</h6>
            <ul className="footer-list">
              <li className="footer-list-item">
                <a
                  href="https://auditoria-academic-events.netlify.app/auditoria.html"
                  target="_blank"
                  className="footer-link-fc"
                >
                  Consulta
                </a>
              </li>
            </ul>
          </div>
          {/* Fin auditoria */}

          <div className="footer-col footer-col-3">
            <h6 className="footer-section-title-fc">Contacto</h6>
            <ul className="footer-list">
              <li className="footer-contact-item-fc">
                <MapPin size={14} className="footer-contact-icon" />
                {universidad.direccion}
              </li>
              <li className="footer-contact-item-fc">
                <Mail size={14} className="footer-contact-icon" />
                {universidad.email}
              </li>
              <li className="footer-contact-item-fc">
                <Phone size={14} className="footer-contact-icon" />
                {universidad.telefono}
              </li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider-fc" />

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <small className="footer-copyright-fc">
              &copy; {new Date().getFullYear()} {facultad.acronimo} -
              {universidad.nombre}
            </small>
          </div>
          <div className="footer-bottom-right">
            <div className="footer-social-links">
              <a href="#" className="footer-social-link-fc">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="footer-social-link-fc">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="footer-social-link-fc">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="footer-social-link-fc">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
