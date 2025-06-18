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
    <footer className="bg-dark text-light py-4 mt-auto w-100 shadow-lg footer-component-fc">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <div className="d-flex align-items-center mb-3">
              <img
                src={facultad.logo}
                alt="Logo"
                className="me-2 footer-logo-fc"
                style={{ width: "40px", height: "40px" }}
              />
              <h5 className="mb-0 footer-title-fc">{facultad.acronimo}</h5>
            </div>{" "}
            <p className="small mb-0 footer-subtitle-fc">
              {universidad.nombre}
            </p>
          </div>
          <div className="col-md-2 mb-3 mb-md-0">
            <h6 className="mb-3 footer-section-title-fc">Académico</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link
                  to="/home#inicio"
                  className="text-white text-decoration-none small footer-link-fc"
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
                <li className="mb-2">
                  <Link
                    to="/inscripciones"
                    className="text-white text-decoration-none small footer-link-fc"
                  >
                    Inscripciones
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div className="col-md-3 mb-3 mb-md-0">
            <h6 className="mb-3 footer-section-title-fc">Información</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <a
                  href="#autoridades"
                  className="text-white text-decoration-none small footer-link-fc"
                >
                  Autoridades
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#carreras"
                  className="text-white text-decoration-none small footer-link-fc"
                >
                  Carreras
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#mision-vision"
                  className="text-white text-decoration-none small footer-link-fc"
                >
                  Misión y Visión
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="mb-3 footer-section-title-fc">Contacto</h6>
            <ul className="list-unstyled mb-0">
              {" "}
              <li className="mb-2 small footer-contact-item-fc">
                <MapPin size={14} className="me-2" /> {universidad.direccion}
              </li>
              <li className="mb-2 small footer-contact-item-fc">
                <Mail size={14} className="me-2" /> {universidad.email}
              </li>
              <li className="mb-2 small footer-contact-item-fc">
                <Phone size={14} className="me-2" /> {universidad.telefono}
              </li>
            </ul>
          </div>
        </div>
        <hr
          className="my-3 footer-divider-fc"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <small className="footer-copyright-fc">
              {" "}
              &copy; {new Date().getFullYear()} {facultad.acronimo} -
              {universidad.nombre}
            </small>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <div className="d-flex justify-content-center justify-content-md-end">
              <a href="#" className="text-white me-3 footer-social-link-fc">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white me-3 footer-social-link-fc">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-white me-3 footer-social-link-fc">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-white footer-social-link-fc">
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
