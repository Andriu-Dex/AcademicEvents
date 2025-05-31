import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Users,
  Microscope,
  TrendingUp,
  Laptop,
  Wrench,
  Zap,
  Factory,
  Target,
  Telescope,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  MapPin,
  Calendar,
  GraduationCap,
} from "lucide-react";
import "./styles/Home.css";

function Home() {
  // Simulación de usuario (puede ser null, estudiante o usuario general)
  // Para probar diferentes interfaces, descomentar una de estas opciones y comentar las otras

  // OPCIÓN 1: Sin usuario (público general)
  //const [usuario, setUsuario] = useState(null);

  // OPCIÓN 2: Usuario Estudiante - Software
  const [usuario, setUsuario] = useState({
    id: 1,
    nombre: "Juan Pérez",
    email: "jperez@uta.edu.ec",
    rol_usu: "ESTUDIANTE",
    carrera: "SOFTWARE",
  });

  // Facultad actual (para contenido de la página)
  const facultadActual = {
    nombre: "FISEI",
    nombreCompleto:
      "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
    logo: "https://imgur.com/fch1iy6.png",
  };

  // Estadísticas de la facultad
  const stats = [
    {
      number: "1,200+",
      label: "Estudiantes",
      icon: <GraduationCap size={36} />,
    },
    { number: "45", label: "Docentes", icon: <Users size={36} /> },
    { number: "8", label: "Laboratorios", icon: <Microscope size={36} /> },
    { number: "95%", label: "Empleabilidad", icon: <TrendingUp size={36} /> },
  ];

  // Autoridades de la facultad (actualizado con 5 autoridades y fotos reales)
  const autoridades = [
    {
      cargo: "Decano",
      nombre: "Dr. Franklin Mayorga Mogollón",
      imagen: "https://i.imgur.com/hYBsxIf.png",
      email: "fmayorga@uta.edu.ec",
    },
    {
      cargo: "Subdecano",
      nombre: "Dr. Javier Sánchez Torres",
      imagen: "https://i.imgur.com/JIQy6Fa.png",
      email: "j.sanchez@uta.edu.ec",
    },
    {
      cargo:
        "Coordinador de las Carrera de Software y Tecnologías de la Información",
      nombre: "Ing. Mg. Marco Guachimboza",
      imagen: "https://i.imgur.com/XDFrTBI.png",
      email: "marcovguachimboza@uta.edu.ec",
    },
    {
      cargo:
        "Coordinador de las Carrera de Automatización y Robótica y Telecomunicaciones",
      nombre: "Ing. Mg. Freddy Robalino",
      imagen: "https://i.imgur.com/daKWf7d.png",
      email: "r.morales@uta.edu.ec",
    },
    {
      cargo: "Coordinador de las Carrera Ingeniería Industrial",
      nombre: "Ing. Mg. César Rosero",
      imagen: "https://i.imgur.com/d4hRu17.png",
      email: "cesararosero@uta.edu.ec",
    },
  ];

  // Carreras disponibles
  const carreras = [
    {
      nombre: "Ingeniería en Software",
      descripcion: "Desarrollo de aplicaciones y sistemas informáticos",
      duracion: "9 semestres",
      modalidad: "Presencial",
      icon: <Laptop size={36} />,
    },
    {
      nombre: "Ingeniería en Sistemas",
      descripcion: "Administración y gestión de sistemas tecnológicos",
      duracion: "9 semestres",
      modalidad: "Presencial",
      icon: <Wrench size={36} />,
    },
    {
      nombre: "Ingeniería Electrónica",
      descripcion: "Diseño y desarrollo de dispositivos electrónicos",
      duracion: "9 semestres",
      modalidad: "Presencial",
      icon: <Zap size={36} />,
    },
    {
      nombre: "Ingeniería Industrial",
      descripcion: "Optimización de procesos y sistemas productivos",
      duracion: "9 semestres",
      modalidad: "Presencial",
      icon: <Factory size={36} />,
    },
  ];

  // Info cards para misión y visión
  const infoCardsPorCarrera = {
    GENERAL: [
      {
        title: "Misión",
        content:
          "Formar profesionales líderes competentes, con visión humanista y pensamiento crítico, a través de la Docencia, la Investigación y la Vinculación, que apliquen, promuevan y difundan el conocimiento respondiendo a las necesidades del país.",
        icon: <Target size={36} />,
      },
      {
        title: "Visión",
        content:
          "La Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato por sus niveles de excelencia, se constituirá como un centro de formación superior con liderazgo y proyección nacional e internacional.",
        icon: <Telescope size={36} />,
      },
    ],
  };

  // Seleccionar los infoCards según el tipo de usuario y su carrera
  const infoCards = infoCardsPorCarrera.GENERAL;

  // Cargar Bootstrap dinámicamente si no está presente
  useEffect(() => {
    const id = "bootstrap-css";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
      document.head.appendChild(link);
    }
  }, []);

  // Determina si el usuario está autenticado
  const isAuthenticated = usuario ? true : false;

  return (
    <div
      className="d-flex flex-column"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(135deg, #f4f6fb 60%, #e3e8f0 100%)",
      }}
    >
      {/* Header/Navbar */}
      <Navbar usuario={usuario} />
      {/* Hero Section */}
      <div
        className="container-fluid py-5 mb-4"
        style={{
          background:
            "linear-gradient(rgba(138, 21, 56, 0.85), rgba(138, 21, 56, 0.9)), url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover no-repeat",
          minHeight: "400px",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 text-white py-4">
              <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeInUp">
                {usuario?.rol_usu === "ESTUDIANTE"
                  ? `Facultad de Ingeniería en ${
                      usuario?.carrera === "SOFTWARE"
                        ? "Software"
                        : usuario?.carrera === "TI"
                        ? "Tecnologías de la Información"
                        : usuario?.carrera === "INDUSTRIAL"
                        ? "Industrial"
                        : "Sistemas, Electrónica e Industrial"
                    }`
                  : "Facultad de Ingeniería en Sistemas, Electrónica e Industrial"}
              </h1>
              <p className="lead mb-4 animate__animated animate__fadeInUp">
                Formando profesionales líderes con visión humanista y
                pensamiento crítico para responder a las necesidades
                tecnológicas del país.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link
                  to="/eventos"
                  className="btn btn-light fw-bold animate__animated animate__fadeInUp"
                  style={{
                    color: "#8A1538",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    padding: "12px 24px",
                  }}
                >
                  <Calendar size={18} className="me-2" /> Explorar eventos
                </Link>
                <Link
                  to="/carreras"
                  className="btn btn-outline-light fw-bold animate__animated animate__fadeInUp"
                  style={{
                    borderRadius: "8px",
                    fontSize: "1rem",
                    padding: "12px 24px",
                  }}
                >
                  <GraduationCap size={18} className="me-2" /> Ver carreras
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              {/* Estadísticas en el hero */}
              <div className="row g-3">
                {stats.map((stat, index) => (
                  <div className="col-6" key={index}>
                    <div className="card bg-white bg-opacity-90 text-center p-3 h-100">
                      <div className="display-6">{stat.icon}</div>
                      <h3 className="fw-bold mb-1" style={{ color: "#8A1538" }}>
                        {stat.number}
                      </h3>
                      <small className="text-muted">{stat.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Autoridades */}
      <div className="container mb-5" id="autoridades">
        <div className="row justify-content-center mb-4">
          <div className="col-lg-6 text-center">
            <h2 className="fw-bold" style={{ color: "#8A1538" }}>
              Autoridades de la Facultad
            </h2>
            <p className="text-muted">Conoce a nuestro equipo directivo</p>
          </div>
        </div>
        <div className="row g-4 justify-content-center">
          {autoridades.map((autoridad, index) => (
            <div className="col-md-4" key={index}>
              <div className="card text-center h-100 shadow-sm border-0 hover-card">
                <div className="card-body p-4">
                  <img
                    src={autoridad.imagen}
                    alt={autoridad.nombre}
                    className="rounded-circle mb-3"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  <h5
                    className="card-title fw-bold"
                    style={{ color: "#8A1538" }}
                  >
                    {autoridad.nombre}
                  </h5>
                  <p className="text-muted fw-semibold">{autoridad.cargo}</p>
                  <a
                    href={`mailto:${autoridad.email}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <Mail size={14} className="me-1" /> Contactar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Carreras Disponibles */}
      <div className="container mb-5" id="carreras">
        <div className="row justify-content-center mb-4">
          <div className="col-lg-6 text-center">
            <h2 className="fw-bold" style={{ color: "#8A1538" }}>
              Nuestras Carreras
            </h2>
            <p className="text-muted">
              Descubre las opciones académicas que tenemos para ti
            </p>
          </div>
        </div>
        <div className="row g-4">
          {carreras.map((carrera, index) => (
            <div className="col-md-6 col-lg-3" key={index}>
              <div className="card h-100 shadow-sm border-0 hover-card">
                <div className="card-body text-center p-4">
                  <div className="display-4 mb-3">{carrera.icon}</div>
                  <h5
                    className="card-title fw-bold"
                    style={{ color: "#8A1538" }}
                  >
                    {carrera.nombre}
                  </h5>
                  <p className="card-text small text-muted mb-3">
                    {carrera.descripcion}
                  </p>
                  <div className="mb-3">
                    <span className="badge bg-light text-dark me-2">
                      <Clock size={14} className="me-1" /> {carrera.duracion}
                    </span>
                    <span className="badge bg-light text-dark">
                      <MapPin size={14} className="me-1" /> {carrera.modalidad}
                    </span>
                  </div>
                  <Link
                    to="/carreras"
                    className="btn btn-sm"
                    style={{ background: "#8A1538", color: "white" }}
                  >
                    Más información
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Misión y Visión */}
      <div className="container mb-5" id="mision-vision">
        <div className="row justify-content-center mb-4">
          <div className="col-lg-6 text-center">
            <h2 className="fw-bold" style={{ color: "#8A1538" }}>
              {usuario?.rol_usu === "ESTUDIANTE"
                ? `Carrera de ${
                    usuario?.carrera === "SOFTWARE"
                      ? "Ingeniería en Software"
                      : usuario?.carrera === "TI"
                      ? "Tecnologías de la Información"
                      : usuario?.carrera === "INDUSTRIAL"
                      ? "Ingeniería Industrial"
                      : "Ingeniería en Sistemas"
                  }`
                : "Nuestra Identidad"}
            </h2>
            <p className="text-muted">
              {usuario?.rol_usu === "ESTUDIANTE"
                ? "Principios y objetivos de tu carrera"
                : "Los principios que nos guían"}
            </p>
          </div>
        </div>
        <div className="row g-4">
          {infoCards.map((card, index) => (
            <div className="col-md-6" key={index}>
              <div className="card h-100 shadow-sm border-0 hover-card">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="display-5 me-3">{card.icon}</span>
                    <h3
                      className="card-title fw-bold mb-0"
                      style={{ color: "#8A1538" }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p className="card-text" style={{ textAlign: "justify" }}>
                    {card.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Sección de contacto */}
      <div className="container mb-5" id="contacto">
        <div
          className="card border-0 shadow-lg p-4"
          style={{
            borderRadius: "15px",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderTop: "4px solid #8A1538",
          }}
        >
          <div className="row align-items-center">
            <div className="col-md-8">
              <h3 className="fw-bold mb-3" style={{ color: "#8A1538" }}>
                <MessageSquare
                  size={24}
                  className="me-2"
                  style={{ verticalAlign: "middle" }}
                />{" "}
                ¿Necesitas información adicional?
              </h3>
              <p className="mb-md-0">
                Nuestro equipo de atención está disponible para resolver todas
                tus dudas sobre inscripciones, carreras y procesos académicos.
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <a
                href="mailto:info@uta.edu.ec"
                className="btn fw-bold btn-lg me-2 mb-2"
                style={{
                  background: "#8A1538",
                  color: "#fff",
                  borderRadius: "8px",
                }}
              >
                <Mail size={18} className="me-2" /> Contáctanos
              </a>
              <a
                href="tel:032521081"
                className="btn btn-outline-secondary fw-bold btn-lg mb-2"
                style={{ borderRadius: "8px" }}
              >
                <Phone size={18} className="me-2" /> Llamar
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-auto w-100 shadow-lg">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="d-flex align-items-center mb-3">
                <img
                  src={facultadActual.logo}
                  alt="Logo"
                  className="me-2"
                  style={{ width: "40px", height: "40px" }}
                />
                <h5 className="mb-0">{facultadActual.nombre}</h5>
              </div>
              <p className="small mb-0">Universidad Técnica de Ambato</p>
              <p className="small text-muted">
                Formando el futuro tecnológico del Ecuador
              </p>
            </div>
            <div className="col-md-2 mb-3 mb-md-0">
              <h6 className="mb-3">Académico</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <Link
                    to="/carreras"
                    className="text-white text-decoration-none small"
                  >
                    Carreras
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/inscripciones"
                    className="text-white text-decoration-none small"
                  >
                    Inscripciones
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/certificados"
                    className="text-white text-decoration-none small"
                  >
                    Certificados
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <h6 className="mb-3">Información</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <a
                    href="#autoridades"
                    className="text-white text-decoration-none small"
                  >
                    Autoridades
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#carreras"
                    className="text-white text-decoration-none small"
                  >
                    Carreras
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#mision-vision"
                    className="text-white text-decoration-none small"
                  >
                    Misión y Visión
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6 className="mb-3">Contacto</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2 small">
                  <MapPin size={14} className="me-2" /> Av. de los Chasquis,
                  Ambato
                </li>
                <li className="mb-2 small">
                  <Mail size={14} className="me-2" /> info@uta.edu.ec
                </li>
                <li className="mb-2 small">
                  <Phone size={14} className="me-2" /> (03) 252-1081
                </li>
              </ul>
            </div>
          </div>
          <hr
            className="my-3"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <small>
                &copy; {new Date().getFullYear()} {facultadActual.nombre} -
                Universidad Técnica de Ambato
              </small>
            </div>
            <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
              <div className="d-flex justify-content-center justify-content-md-end">
                <a href="#" className="text-white me-3">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="text-white me-3">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="text-white me-3">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="text-white">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* Estilos adicionales para efectos hover */}
      <style>{`
        .hover-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(138, 21, 56, 0.15) !important;
          border-bottom: 3px solid #8a1538;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate__animated.animate__fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        html {
          scroll-behavior: smooth;
        }
        :target {
          scroll-margin-top: 80px;
        }
      `}</style>
    </div>
  );
}

export default Home;
