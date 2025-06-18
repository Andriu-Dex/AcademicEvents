import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventosDestacados from "../components/home/EventosDestacados";
import { useAuth } from "../hooks/useAuth";
import { useHomeSocket } from "../hooks/useHomeSocket";
import axiosInstance from "../api/axiosConfig";
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
  BookOpen,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./styles/Home.css";

/**
 * Componente principal de la página Home
 * @returns {JSX.Element} Componente React
 */
function Home() {
  // Usar el usuario real del contexto de autenticación
  const { usuario } = useAuth();
  // Estado para almacenar las carreras
  const [carreras, setCarreras] = useState([]);
  // Estado para almacenar la información MVA
  const [mvaInfo, setMvaInfo] = useState({
    mision: "",
    vision: "",
    autoridades: [],
  });

  // Estado para almacenar la información de la facultad
  const [facultadInfo, setFacultadInfo] = useState({
    nombre: "",
    nombreCompleto: "",
    acronimo: "",
    descripcion: "",
    logo: "",
  });

  // Estado para almacenar las estadísticas dinámicas
  const [estadisticasHome, setEstadisticasHome] = useState({
    carreras: 0,
    eventosActivos: 0,
    usuariosRegistrados: 0,
    tasaParticipacion: "0%",
  });

  // Estados y referencias para carruseles
  const [currentAutoridad, setCurrentAutoridad] = useState(0);
  const [currentCarrera, setCurrentCarrera] = useState(0);
  const [isHoveringAutoridades, setIsHoveringAutoridades] = useState(false);
  const [isHoveringCarreras, setIsHoveringCarreras] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoridadesRef = useRef(null);
  const carrerasRef = useRef(null);

  // Estado para controlar la visibilidad del navbar
  const [showNavbar, setShowNavbar] = useState(false);

  // Referencia para detectar el área superior
  const topAreaRef = useRef(null);

  // 🔌 Estados y hook para Socket.IO - Actualizaciones en tiempo real
  const [notifications, setNotifications] = useState([]);
  const [realtimeUpdates, setRealtimeUpdates] = useState({
    events: 0,
    inscriptions: 0,
    cupos: 0,
  });

  // Hook personalizado para manejar actualizaciones del Home
  const {
    isConnected,
    hasNewUpdates,
    systemNotifications,
    removeSystemNotification,
  } = useHomeSocket({
    onEventUpdate: (eventUpdate) => {
      // Incrementar contador de actualizaciones de eventos
      setRealtimeUpdates((prev) => ({
        ...prev,
        events: prev.events + 1,
      }));

      // No mostrar notificación para cambios de eventos destacados
      // ya que se maneja con toast en AdminEvents
      if (eventUpdate.data && eventUpdate.data.tipo === "destacado") {
        return;
      }

      // Mostrar notificación temporal solo para otros tipos de cambios
      const message =
        eventUpdate.action === "created"
          ? `Nuevo evento: ${eventUpdate.data.nom_eve || "Sin nombre"}`
          : eventUpdate.action === "updated"
          ? `Evento actualizado: ${eventUpdate.data.nom_eve || "Sin nombre"}`
          : `Evento eliminado: ${eventUpdate.data.nom_eve || "Sin nombre"}`;

      // showTemporaryNotification(message, "info"); // Comentado para evitar notificaciones repetidas
    },

    onInscriptionUpdate: (inscriptionUpdate) => {
      setRealtimeUpdates((prev) => ({
        ...prev,
        inscriptions: prev.inscriptions + 1,
      }));
    },

    onCuposUpdate: (cuposUpdate) => {
      setRealtimeUpdates((prev) => ({
        ...prev,
        cupos: prev.cupos + 1,
      }));
    },

    onCarreraUpdate: (carreraUpdate) => {
      // Actualizar la lista de carreras según la acción
      if (carreraUpdate.action === "created") {
        // Agregar nueva carrera solo si está activa
        if (carreraUpdate.data.est_car) {
          console.log("🏠 Home: Agregando nueva carrera activa");
          setCarreras((prev) => [...prev, carreraUpdate.data]);
          // Actualizar contador de estadísticas
          setEstadisticasHome((prev) => ({
            ...prev,
            carreras: prev.carreras + 1,
          }));
        } else {
          // Nueva carrera creada pero está inactiva, no se agrega al Home
        }
      } else if (carreraUpdate.action === "updated") {
        // Manejar actualización de carrera
        const carreraActualizada = carreraUpdate.data;

        setCarreras((prev) => {
          const carreraExiste = prev.find(
            (c) => c.id_car === carreraActualizada.id_car
          );

          if (carreraActualizada.est_car) {
            // Carrera está activa
            if (carreraExiste) {
              // Actualizar carrera existente
              return prev.map((carrera) =>
                carrera.id_car === carreraActualizada.id_car
                  ? carreraActualizada
                  : carrera
              );
            } else {
              // Agregar carrera que se acaba de activar
              console.log("🏠 Home: Agregando carrera recién activada");
              setEstadisticasHome((prevStats) => ({
                ...prevStats,
                carreras: prevStats.carreras + 1,
              }));
              return [...prev, carreraActualizada];
            }
          } else {
            // Carrera está inactiva
            console.log("🏠 Home: Carrera está inactiva");
            if (carreraExiste) {
              // Remover carrera que se desactivó
              setEstadisticasHome((prevStats) => ({
                ...prevStats,
                carreras: prevStats.carreras - 1,
              }));
              return prev.filter(
                (carrera) => carrera.id_car !== carreraActualizada.id_car
              );
            } else {
              // La carrera ya no estaba en la lista
              return prev;
            }
          }
        });
      } else if (carreraUpdate.action === "deleted") {
        // Manejar desactivación temporal (marcada como inactiva)
        setCarreras((prev) =>
          prev.filter((carrera) => carrera.id_car !== carreraUpdate.data.id_car)
        );
        // Actualizar contador de estadísticas
        setEstadisticasHome((prev) => ({
          ...prev,
          carreras: prev.carreras - 1,
        }));
      } else if (carreraUpdate.action === "permanentlyDeleted") {
        // Manejar eliminación permanente
        setCarreras((prev) =>
          prev.filter((carrera) => carrera.id_car !== carreraUpdate.data.id_car)
        );
        // Actualizar contador de estadísticas
        setEstadisticasHome((prev) => ({
          ...prev,
          carreras: prev.carreras - 1,
        }));
      }
    },

    onSystemNotification: (notification) => {
      console.log("🏠 Home: Notificación del sistema", notification);
      // showTemporaryNotification(notification.message, notification.type); // Comentado para evitar notificaciones de socket
    },
  });

  // Función para mostrar notificaciones temporales
  const showTemporaryNotification = (message, type = "info") => {
    const id = Date.now();
    const newNotification = { id, message, type, timestamp: new Date() };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 5000);
  };

  // Función para remover notificación manualmente
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Cargar carreras y MVA desde la API
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar carreras activas únicamente
        const resCarreras = await axiosInstance.get("/carreras");
        // Filtrar solo carreras activas como medida de seguridad adicional
        const carrerasActivas = resCarreras.data.filter(
          (carrera) => carrera.est_car
        );
        setCarreras(carrerasActivas);

        // Cargar información MVA
        const resMVA = await axiosInstance.get("/mva");

        // Parsear el JSON de autoridades si existe
        let autoridades = [];
        if (resMVA.data && resMVA.data.autoridades) {
          try {
            autoridades = JSON.parse(resMVA.data.autoridades);
            console.log("Autoridades cargadas:", autoridades);
          } catch (error) {
            console.error("Error al parsear autoridades:", error);
          }
        }

        setMvaInfo({
          mision: resMVA.data?.mision || "",
          vision: resMVA.data?.vision || "",
          autoridades: autoridades,
        });

        // Cargar información de la facultad
        const resFacultad = await axiosInstance.get("/facultad-principal");
        if (resFacultad.data) {
          setFacultadInfo({
            nombre:
              resFacultad.data.nombre ||
              "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
            nombreCompleto:
              resFacultad.data.nombre ||
              "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
            acronimo: resFacultad.data.acronimo || "FISEI",
            descripcion: resFacultad.data.descripcion || "",
            logo: resFacultad.data.logo || "https://imgur.com/fch1iy6.png",
          });
        }

        // Cargar estadísticas dinámicas
        const resEstadisticas = await axiosInstance.get("/estadisticas/home");
        if (resEstadisticas.data) {
          setEstadisticasHome({
            carreras: resEstadisticas.data.carreras || 0,
            eventosActivos: resEstadisticas.data.eventosActivos || 0,
            usuariosRegistrados: resEstadisticas.data.usuariosRegistrados || 0,
            tasaParticipacion: resEstadisticas.data.tasaParticipacion || "0%",
          });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        // showTemporaryNotification(
        //   "Error al cargar datos del sistema. Por favor, inténtalo de nuevo más tarde.",
        //   "error"
        // ); // Comentado para evitar notificaciones automáticas
      }
    };

    cargarDatos();
  }, []);

  // Facultad actual (ahora usando datos dinámicos)
  const facultadActual = {
    nombre: facultadInfo.nombre,
    nombreCompleto: facultadInfo.nombreCompleto,
    logo: facultadInfo.logo,
    descripcion: facultadInfo.descripcion,
  };

  // Estadísticas dinámicas de la facultad
  const stats = [
    {
      number: estadisticasHome.carreras.toString(),
      label: "Carreras",
      icon: <GraduationCap size={36} />,
    },
    {
      number: estadisticasHome.eventosActivos.toString(),
      label: "Eventos Activos",
      icon: <Calendar size={36} />,
    },
    {
      number: estadisticasHome.usuariosRegistrados.toString(),
      label: "Usuarios Registrados",
      icon: <Users size={36} />,
    },
    {
      number: estadisticasHome.tasaParticipacion,
      label: "Tasa de Participación",
      icon: <TrendingUp size={36} />,
    },
  ];

  // Usar las autoridades de la API, o las autoridades predeterminadas si no hay datos
  const autoridades =
    mvaInfo.autoridades.length > 0
      ? mvaInfo.autoridades
      : [
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

  // Determinar si se debe usar carrusel (solo si hay más de 3 elementos)
  const shouldUseCarouselAutoridades = autoridades.length > 3;
  const shouldUseCarouselCarreras = carreras.length > 3;

  // Crear arrays extendidos para carrusel infinito (solo si se usa carrusel)
  const extendedAutoridades =
    shouldUseCarouselAutoridades && autoridades.length > 0
      ? [...autoridades, ...autoridades.slice(0, 2)]
      : autoridades;
  const extendedCarreras =
    shouldUseCarouselCarreras && carreras.length > 0
      ? [...carreras, ...carreras.slice(0, 3)] // Asegurar que se dupliquen al menos 3 elementos
      : carreras;

  // Función para obtener el icono correspondiente
  const getIconComponent = (iconName, size = 36) => {
    switch (iconName) {
      case "laptop":
        return <Laptop size={size} />;
      case "wrench":
        return <Wrench size={size} />;
      case "zap":
        return <Zap size={size} />;
      case "factory":
        return <Factory size={size} />;
      case "book":
        return <BookOpen size={size} />;
      case "monitor":
        return <Monitor size={size} />;
      default:
        return <GraduationCap size={size} />;
    }
  };

  // Funciones para carrusel infinito (solo activas si hay más de 3 elementos)
  const nextAutoridad = () => {
    if (shouldUseCarouselAutoridades && autoridades.length > 0) {
      setCurrentAutoridad((prev) => prev + 1);
    }
  };

  const prevAutoridad = () => {
    if (shouldUseCarouselAutoridades && autoridades.length > 0) {
      setCurrentAutoridad((prev) => prev - 1);
    }
  };

  const nextCarrera = () => {
    if (shouldUseCarouselCarreras && carreras.length > 0) {
      setCurrentCarrera((prev) => prev + 1);
    }
  };

  const prevCarrera = () => {
    if (shouldUseCarouselCarreras && carreras.length > 0) {
      setCurrentCarrera((prev) => prev - 1);
    }
  };

  // Efectos para manejar el bucle infinito (solo si el carrusel está activo)
  useEffect(() => {
    if (
      shouldUseCarouselAutoridades &&
      currentAutoridad === autoridades.length &&
      autoridades.length > 0
    ) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentAutoridad(0);
        setTimeout(() => setIsTransitioning(false), 20);
      }, 300); // Reducir tiempo para transición más rápida
    } else if (
      shouldUseCarouselAutoridades &&
      currentAutoridad < 0 &&
      autoridades.length > 0
    ) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentAutoridad(autoridades.length - 1);
        setTimeout(() => setIsTransitioning(false), 20);
      }, 300);
    }
  }, [currentAutoridad, autoridades.length, shouldUseCarouselAutoridades]);

  useEffect(() => {
    if (
      shouldUseCarouselCarreras &&
      currentCarrera === carreras.length &&
      carreras.length > 0
    ) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentCarrera(0);
        setTimeout(() => setIsTransitioning(false), 50); // Aumentado el tiempo para que sea más estable
      }, 500); // Aumentado para dar tiempo a la transición
    } else if (
      shouldUseCarouselCarreras &&
      currentCarrera < 0 &&
      carreras.length > 0
    ) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentCarrera(carreras.length - 1);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 500);
    }
  }, [currentCarrera, carreras.length, shouldUseCarouselCarreras]);

  // Funciones para indicadores
  const goToAutoridad = (index) => {
    setCurrentAutoridad(index);
  };

  const goToCarrera = (index) => {
    setCurrentCarrera(index);
  };

  // Auto-play para los carruseles (solo cuando el mouse está sobre ellos y hay más de 3 elementos)
  useEffect(() => {
    let autoridadesInterval;
    let carrerasInterval;

    if (
      isHoveringAutoridades &&
      shouldUseCarouselAutoridades &&
      autoridades.length > 1
    ) {
      autoridadesInterval = setInterval(() => {
        nextAutoridad();
      }, 2000);
    }

    if (
      isHoveringCarreras &&
      shouldUseCarouselCarreras &&
      carreras.length > 1
    ) {
      carrerasInterval = setInterval(() => {
        nextCarrera();
      }, 2000);
    }

    return () => {
      if (autoridadesInterval) clearInterval(autoridadesInterval);
      if (carrerasInterval) clearInterval(carrerasInterval);
    };
  }, [
    autoridades.length,
    carreras.length,
    isHoveringAutoridades,
    isHoveringCarreras,
    shouldUseCarouselAutoridades,
    shouldUseCarouselCarreras,
  ]);

  // Info cards para misión y visión obtenidas de la API
  const infoCardsPorCarrera = {
    GENERAL: [
      {
        title: "Misión",
        content:
          mvaInfo.mision ||
          "Formar profesionales líderes competentes, con visión humanista y pensamiento crítico, a través de la Docencia, la Investigación y la Vinculación, que apliquen, promuevan y difundan el conocimiento respondiendo a las necesidades del país.",
        icon: <Target size={36} />,
      },
      {
        title: "Visión",
        content:
          mvaInfo.vision ||
          "La Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato por sus niveles de excelencia, se constituirá como un centro de formación superior con liderazgo y proyección nacional e internacional.",
        icon: <Telescope size={36} />,
      },
    ],
  };

  // Seleccionar los infoCards según el tipo de usuario y su carrera
  const infoCards = infoCardsPorCarrera.GENERAL;

  // Cargar Bootstrap dinámicamente si no está presente (se mantiene por compatibilidad con otras secciones)
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

  // Efecto para controlar la visibilidad del navbar
  useEffect(() => {
    // Variable para almacenar el timer
    let timer;

    const handleMouseMove = (e) => {
      // Si el mouse está en los primeros 80px de la pantalla o sobre el navbar cuando está visible
      if (e.clientY <= 80) {
        setShowNavbar(true);
        // Limpiar el timer si existe
        if (timer) clearTimeout(timer);
      } else if (showNavbar) {
        // Si el mouse sale de la zona y el navbar está visible, iniciamos un timer para ocultarlo
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          setShowNavbar(false);
        }, 500); // Esperar 1 segundo antes de ocultar
      }
    };

    // Agregar event listener al documento
    document.addEventListener("mousemove", handleMouseMove);

    // Limpiar event listener al desmontar el componente
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (timer) clearTimeout(timer);
    };
  }, [showNavbar]);

  return (
    <div
      className="d-flex flex-column"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(135deg, #f4f6fb 60%, #e3e8f0 100%)",
      }}
    >
      {/* Área de detección superior */}
      <div ref={topAreaRef} className="top-detection-area-h"></div>

      {/* Header/Navbar con clase condicional para visibilidad */}
      <div
        className={`navbar-container-h ${
          showNavbar ? "navbar-visible-h" : "navbar-hidden-h"
        }`}
      >
        <Navbar usuario={usuario} />
      </div>

      {/* 🔌 Componente de notificaciones en tiempo real */}
      {notifications.length > 0 && (
        <div className="notificaciones-tiempo-real-hm">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notificacion-item-hm notificacion-${notif.type}-hm`}
              onClick={() => removeNotification(notif.id)}
            >
              <span className="notificacion-icono-hm">
                {notif.type === "info" && "📢"}
                {notif.type === "success" && "✅"}
                {notif.type === "warning" && "⚠️"}
                {notif.type === "error" && "❌"}
              </span>
              <span className="notificacion-mensaje-hm">{notif.message}</span>
              <span className="notificacion-cerrar-hm">×</span>
            </div>
          ))}
        </div>
      )}

      {/* 🔌 Indicador de conexión Socket.IO (solo en desarrollo) */}
      {import.meta.env.DEV && (
        <div className="socket-status-hm">
          <span
            className={`socket-indicator-hm ${
              isConnected ? "connected-hm" : "disconnected-hm"
            }`}
          >
            {isConnected ? "🟢" : "🔴"} Socket
          </span>
        </div>
      )}

      {/* Hero Section */}
      <div
        className="contenedor-principal-home"
        style={{
          background:
            "linear-gradient(rgba(138, 21, 56, 0.85), rgba(138, 21, 56, 0.9)), url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover no-repeat",
          minHeight: "400px",
          marginTop: "0", // Ajustado para compensar el navbar oculto
          paddingTop: "70px", // Agregar padding para compensar el espacio del navbar
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 text-white py-4">
              <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeInUp">
                {facultadActual.nombreCompleto}
              </h1>
              <p className="lead mb-4 animate__animated animate__fadeInUp">
                {facultadActual.descripcion ||
                  "Formando profesionales líderes con visión humanista y pensamiento crítico para responder a las necesidades tecnológicas del país."}
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link
                  to={isAuthenticated ? "/eventos" : "/eventos-publicos"}
                  className="btn btn-light fw-bold animate__animated animate__fadeInUp"
                  style={{
                    color: "#8A1538",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    padding: "12px 24px",
                  }}
                >
                  <Calendar size={18} className="me-2" />
                  {isAuthenticated
                    ? "Explorar eventos"
                    : "Explorar eventos públicos"}
                </Link>{" "}
                <a
                  href="#carreras"
                  className="btn btn-outline-light fw-bold animate__animated animate__fadeInUp"
                  style={{
                    borderRadius: "8px",
                    fontSize: "1rem",
                    padding: "12px 24px",
                  }}
                >
                  <GraduationCap size={18} className="me-2" /> Ver carreras
                </a>
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

      {/* Eventos Destacados */}
      <EventosDestacados />

      {/* Autoridades - Carrusel */}
      <section className="autoridades-section-h" id="autoridades">
        <div className="autoridades-header-h">
          <h2 className="autoridades-title-h">Autoridades de la Facultad</h2>
          <p className="autoridades-subtitle-h">
            Conoce a nuestro equipo directivo
          </p>
        </div>
        <div
          className={
            shouldUseCarouselAutoridades
              ? "carousel-container-h"
              : "static-container-h"
          }
          onMouseEnter={
            shouldUseCarouselAutoridades
              ? () => setIsHoveringAutoridades(true)
              : undefined
          }
          onMouseLeave={
            shouldUseCarouselAutoridades
              ? () => setIsHoveringAutoridades(false)
              : undefined
          }
        >
          {shouldUseCarouselAutoridades && (
            <button
              className="carousel-btn-h carousel-btn-prev-h"
              onClick={prevAutoridad}
              style={{ position: "absolute", left: "-25px", zIndex: 20 }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className="carousel-window-h">
            <div
              className={
                shouldUseCarouselAutoridades
                  ? "autoridades-carousel-h"
                  : "autoridades-static-h"
              }
              ref={autoridadesRef}
              style={
                shouldUseCarouselAutoridades
                  ? {
                      transform: `translateX(-${
                        currentAutoridad * (300 + 32)
                      }px)`, // 300px width + 2rem gap
                      transition: isTransitioning
                        ? "none"
                        : "transform 0.5s ease-in-out",
                    }
                  : {}
              }
            >
              {extendedAutoridades.map((autoridad, index) => (
                <article
                  className="autoridad-card-h carousel-item-h"
                  key={index}
                >
                  <div className="autoridad-content-h">
                    <img
                      src={autoridad.imagen}
                      alt={autoridad.nombre}
                      className="autoridad-image-h"
                    />
                    <h3 className="autoridad-name-h">{autoridad.nombre}</h3>
                    <p className="autoridad-cargo-h">{autoridad.cargo}</p>
                    <a
                      href={`mailto:${autoridad.email}`}
                      className="autoridad-contact-h"
                    >
                      <Mail size={14} className="autoridad-icon-h" /> Contactar
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {shouldUseCarouselAutoridades && (
            <button
              className="carousel-btn-h carousel-btn-next-h"
              onClick={nextAutoridad}
              style={{ position: "absolute", right: "-25px", zIndex: 20 }}
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Indicadores del carrusel (solo si el carrusel está activo) */}
        {shouldUseCarouselAutoridades && autoridades.length > 1 && (
          <div className="carousel-indicators-h">
            {autoridades.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator-h ${
                  index === currentAutoridad % autoridades.length
                    ? "active-h"
                    : ""
                }`}
                onClick={() => goToAutoridad(index)}
              />
            ))}
          </div>
        )}
      </section>
      {/* Carreras Disponibles - Carrusel */}
      <div className="container mb-5" id="carreras">
        <div className="row justify-content-center mb-4">
          <div className="col-lg-6 text-center">
            <h2 className="fw-bold" style={{ color: "#8A1538" }}>
              Nuestras Carreras
            </h2>
            <p className="opciones-academicas-h">
              Descubre las opciones académicas que tenemos para ti
            </p>
          </div>
        </div>

        <div
          className={
            shouldUseCarouselCarreras
              ? "carousel-container-h"
              : "static-container-h"
          }
          onMouseEnter={
            shouldUseCarouselCarreras
              ? () => setIsHoveringCarreras(true)
              : undefined
          }
          onMouseLeave={
            shouldUseCarouselCarreras
              ? () => setIsHoveringCarreras(false)
              : undefined
          }
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {shouldUseCarouselCarreras && (
            <button
              className="carousel-btn-h carousel-btn-prev-h"
              onClick={prevCarrera}
              style={{ position: "absolute", left: "-25px", zIndex: 20 }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className="carousel-window-h">
            <div
              className={
                shouldUseCarouselCarreras
                  ? "carreras-carousel-h"
                  : "carreras-static-h"
              }
              ref={carrerasRef}
              style={
                shouldUseCarouselCarreras
                  ? {
                      transform: `translateX(-${
                        currentCarrera * (280 + 32)
                      }px)`, // 280px width + 2rem gap
                      transition: isTransitioning
                        ? "none"
                        : "transform 0.5s ease-in-out",
                      width: "max-content", // Asegurar que el ancho se ajuste al contenido
                    }
                  : {}
              }
            >
              {extendedCarreras.map((carrera, index) => (
                <div
                  className="carrera-card-h carousel-item-h"
                  key={`carrera-${index}`}
                >
                  <div className="card h-100 shadow-sm border-0 hover-card">
                    <div className="card-body text-center p-4">
                      <div className="display-4 mb-3">
                        {getIconComponent(carrera.ico_car)}
                      </div>
                      <h5
                        className="card-title fw-bold"
                        style={{ color: "#8A1538" }}
                      >
                        {carrera.nom_car}
                      </h5>
                      <p className="card-text small text-muted mb-3">
                        {carrera.des_car}
                      </p>
                      <div className="mb-3">
                        <span className="badge bg-light text-dark me-2">
                          <Clock size={14} className="me-1" />{" "}
                          {carrera.dur_sem_car} semestres
                        </span>
                        <span className="badge bg-light text-dark">
                          <MapPin size={14} className="me-1" />{" "}
                          {carrera.mod_car}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {shouldUseCarouselCarreras && (
            <button
              className="carousel-btn-h carousel-btn-next-h"
              onClick={nextCarrera}
              style={{ position: "absolute", right: "-25px", zIndex: 20 }}
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Indicadores del carrusel (solo si el carrusel está activo) */}
        {shouldUseCarouselCarreras && carreras.length > 1 && (
          <div className="carousel-indicators-h">
            {carreras.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator-h ${
                  index === currentCarrera % carreras.length ? "active-h" : ""
                }`}
                onClick={() => goToCarrera(index)}
              />
            ))}
          </div>
        )}
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
            <p className="mision-vision-h">
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
                href="https://fisei.uta.edu.ec/v4.0/index.php/facultad/historia-facultad"
                target="_blank"
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
                href="https://fisei.uta.edu.ec/v4.0/index.php/facultad/directorio-telefonico"
                target="_blank"
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
      <Footer isAuthenticated={usuario?.id ? true : false} />
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
