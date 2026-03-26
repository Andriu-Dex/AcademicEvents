import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { SOCIAL_ICON_COMPONENTS } from "../constants/socialLinkOptions";
import { useSocket } from "../context/SocketContext";
import { resolveTenantScope } from "../utils/tenantScope";
import {
  normalizeUniversityData,
  normalizeUniversitySocialLink,
} from "../utils/universityData";
import "./styles/Footer.css";

const Footer = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const tenantScopeRef = useRef(resolveTenantScope());
  const reloadTimeoutRef = useRef(null);
  const loadUniversityRef = useRef(null);

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
    socialLinks: [],
  });

  const cargarDatosFacultad = async () => {
    try {
      const response = await axiosInstance.get("/facultad-principal");
      if (response.data) {
        setFacultad((currentFacultad) => ({
          nombre: response.data.nom_fac || currentFacultad.nombre,
          acronimo: response.data.acr_fac || currentFacultad.acronimo,
          logo: response.data.url_log_fac || currentFacultad.logo,
        }));
      }
    } catch (error) {
      console.error("Error al cargar datos de la facultad:", error);
    }
  };

  const cargarDatosUniversidad = async () => {
    try {
      const response = await axiosInstance.get("/universidad-principal");
      if (response.data) {
        const normalizedUniversity = normalizeUniversityData(
          response.data,
          universidad
        );

        setUniversidad((currentUniversidad) => ({
          ...currentUniversidad,
          nombre: normalizedUniversity.nom_uni || currentUniversidad.nombre,
          acronimo:
            normalizedUniversity.acr_uni || currentUniversidad.acronimo,
          logo: normalizedUniversity.url_log_uni || currentUniversidad.logo,
          direccion:
            normalizedUniversity.dir_uni || currentUniversidad.direccion,
          email: normalizedUniversity.cor_uni || currentUniversidad.email,
          telefono:
            normalizedUniversity.tel_uni || currentUniversidad.telefono,
          socialLinks: normalizedUniversity.social_links
            .map((socialLink, index) =>
              normalizeUniversitySocialLink(socialLink, index)
            )
            .filter((socialLink) => socialLink.isActive),
        }));
      }
    } catch (error) {
      console.error("Error al cargar datos de la universidad:", error);
    }
  };

  loadUniversityRef.current = cargarDatosUniversidad;

  useEffect(() => {
    cargarDatosFacultad();
    cargarDatosUniversidad();
  }, []);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleUniversityUpdate = (eventData) => {
      if (!eventData?.data) {
        return;
      }

      if (
        eventData.data.tenantSlug &&
        eventData.data.tenantSlug !== tenantScopeRef.current
      ) {
        return;
      }

      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }

      reloadTimeoutRef.current = setTimeout(() => {
        loadUniversityRef.current?.();
      }, 150);
    };

    socket.on("university-change-hm", handleUniversityUpdate);

    return () => {
      socket.off("university-change-hm", handleUniversityUpdate);

      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
        reloadTimeoutRef.current = null;
      }
    };
  }, [socket]);

  const socialLinks = universidad.socialLinks
    .filter(
      (socialLink) =>
        socialLink.isActive &&
        typeof socialLink.url === "string" &&
        socialLink.url.trim().length > 0
    )
    .sort((leftLink, rightLink) => leftLink.displayOrder - rightLink.displayOrder);

  return (
    <footer className="footer-component-fc" aria-label="Pie de página">
      <div className="footer-container">
        <div className="footer-row">
          <section
            className="footer-col footer-col-4"
            aria-labelledby="footer-brand-title"
          >
            <div className="footer-header">
              <img
                src={facultad.logo}
                alt={`Logo de ${facultad.acronimo}`}
                className="footer-logo-fc"
              />
              <h2 id="footer-brand-title" className="footer-title-fc">
                {facultad.acronimo}
              </h2>
            </div>
            <p className="footer-subtitle-fc">{universidad.nombre}</p>
          </section>

          <nav
            className="footer-col footer-col-2"
            aria-labelledby="footer-academic-title"
          >
            <h3 id="footer-academic-title" className="footer-section-title-fc">
              Académico
            </h3>
            <ul className="footer-list">
              <li className="footer-list-item">
                <Link
                  to="/home#inicio"
                  className="footer-link-fc"
                  onClick={(event) => {
                    event.preventDefault();
                    if (location.pathname !== "/home") {
                      navigate("/home");
                    }
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
                  <Link to="/enrollments" className="footer-link-fc">
                    Inscripciones
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <nav
            className="footer-col footer-col-3"
            aria-labelledby="footer-information-title"
          >
            <h3
              id="footer-information-title"
              className="footer-section-title-fc"
            >
              Información
            </h3>
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
          </nav>

          <nav
            className="footer-col footer-col-3"
            aria-labelledby="footer-audit-title"
          >
            <h3 id="footer-audit-title" className="footer-section-title-fc">
              Auditoría
            </h3>
            <ul className="footer-list">
              <li className="footer-list-item">
                <a
                  href="https://auditoria-academic-events.netlify.app/auditoria.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-fc"
                >
                  Consulta
                </a>
              </li>
            </ul>
          </nav>

          <section
            className="footer-col footer-col-3"
            aria-labelledby="footer-contact-title"
          >
            <h3 id="footer-contact-title" className="footer-section-title-fc">
              Contacto
            </h3>
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
          </section>
        </div>

        <hr className="footer-divider-fc" />

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <small className="footer-copyright-fc">
              &copy; {new Date().getFullYear()} {facultad.acronimo} -
              {universidad.nombre}
            </small>
          </div>

          {socialLinks.length > 0 && (
            <nav
              className="footer-bottom-right"
              aria-label="Redes sociales y enlaces institucionales"
            >
              <div className="footer-social-links">
                {socialLinks.map((socialLink) => {
                  const IconComponent =
                    SOCIAL_ICON_COMPONENTS[socialLink.iconKey] ||
                    SOCIAL_ICON_COMPONENTS.link;
                  const shouldOpenInNewTab = socialLink.opensInNewTab;

                  return (
                    <a
                      key={socialLink.id || `${socialLink.platformKey}-${socialLink.displayOrder}`}
                      href={socialLink.url}
                      className={`footer-social-link-fc footer-social-link-${socialLink.platformKey || "custom"}`}
                      aria-label={`Abrir ${socialLink.label}`}
                      title={socialLink.label}
                      target={shouldOpenInNewTab ? "_blank" : undefined}
                      rel={shouldOpenInNewTab ? "noopener noreferrer" : undefined}
                    >
                      <IconComponent size={18} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
