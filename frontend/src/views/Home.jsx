import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventosDestacados from "../components/home/EventosDestacados";
import { useAuth } from "../hooks/useAuth";
import { useHomeSocket } from "../hooks/useHomeSocket";
import { useConfigurableStats } from "../hooks/useConfigurableStats";
import useDocumentTitle from "../hooks/useDocumentTitle";
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
  CalendarX,
  CalendarCheck,
  Award,
  ClipboardCheck,
  UserPlus,
  Star,
  Info,
  BarChart,
  Bell,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Wifi,
  WifiOff,
} from "lucide-react";
import "./styles/Home.css";

/**
 * Componente principal de la página Home
 * @returns {JSX.Element} Componente React
 */
function Home() {
  useDocumentTitle("Inicio");

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

  // Hook para estadísticas configurables
  const { activeStatsData, loading: loadingStats } = useConfigurableStats();

  // Verificar si hay estadísticas configuradas
  const hasConfiguredStats = Object.keys(activeStatsData).length > 0;

  // Estados y referencias para carruseles
  const [currentAutoridad, setCurrentAutoridad] = useState(0);
  const [currentCarrera, setCurrentCarrera] = useState(0);
  const [isHoveringAutoridades, setIsHoveringAutoridades] = useState(false);
  const [isHoveringCarreras, setIsHoveringCarreras] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const autoridadesRef = useRef(null);
  const carrerasRef = useRef(null);

  // Estado para controlar la visibilidad del navbar
  const [showNavbar, setShowNavbar] = useState(false);

  // Referencia para detectar el área superior
  const topAreaRef = useRef(null);

  // Configuración de elementos visibles y duplicados para carrusel infinito
  const ELEMENTOS_VISIBLES_AUTORIDADES = 3; // Elementos visibles simultáneamente
  const ELEMENTOS_VISIBLES_CARRERAS = 3;

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

  // Crear arrays extendidos para carrusel infinito suave
  const extendedAutoridades =
    shouldUseCarouselAutoridades && autoridades.length > 0
      ? [
          ...autoridades.slice(-ELEMENTOS_VISIBLES_AUTORIDADES), // Últimos elementos al inicio
          ...autoridades, // Array original
          ...autoridades.slice(0, ELEMENTOS_VISIBLES_AUTORIDADES), // Primeros elementos al final
        ]
      : autoridades;

  const extendedCarreras =
    shouldUseCarouselCarreras && carreras.length > 0
      ? [
          ...carreras.slice(-ELEMENTOS_VISIBLES_CARRERAS), // Últimos elementos al inicio
          ...carreras, // Array original
          ...carreras.slice(0, ELEMENTOS_VISIBLES_CARRERAS), // Primeros elementos al final
        ]
      : carreras;

  // Función para obtener el icono correspondiente según el nombre del icono
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

  // 🔌 Estados y hook para Socket.IO - Actualizaciones en tiempo real
  const [notifications, setNotifications] = useState([]);
  const [realtimeUpdates, setRealtimeUpdates] = useState({
    events: 0,
    inscriptions: 0,
    cupos: 0,
  });
  const [eventosDestacadosUpdate, setEventosDestacadosUpdate] = useState(null);

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

      // Manejar específicamente cambios de eventos destacados
      if (eventUpdate.data && eventUpdate.data.tipo === "destacado") {
        setEventosDestacadosUpdate(eventUpdate);
        return;
      }

      // Mostrar notificación temporal solo para otros tipos de cambios
      const eventName = eventUpdate.data.name || eventUpdate.data.nom_eve || "Sin nombre";
      const message =
        eventUpdate.action === "created"
          ? `Nuevo evento: ${eventName}`
          : eventUpdate.action === "updated"
          ? `Evento actualizado: ${eventName}`
          : `Evento eliminado: ${eventName}`;

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
              setEstadisticasHome((prevStats) => ({
                ...prevStats,
                carreras: prevStats.carreras + 1,
              }));
              return [...prev, carreraActualizada];
            }
          } else {
            // Carrera está inactiva
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

    onSystemNotification: () => {
      // showTemporaryNotification(notification.message, notification.type); // Comentado para evitar notificaciones de socket
    },
  });

  // Función para mostrar notificaciones temporales
  const showTemporaryNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    const newNotification = { id, message, type, timestamp: new Date() };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 5000);
  }, []);

  // Función para remover notificación manualmente
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} />;
      case "warning":
        return <CircleAlert size={18} />;
      case "error":
        return <CircleX size={18} />;
      case "info":
      default:
        return <Bell size={18} />;
    }
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

  // Efecto para inicializar posiciones del carrusel infinito
  useEffect(() => {
    if (
      !isInitialized &&
      (shouldUseCarouselAutoridades || shouldUseCarouselCarreras)
    ) {
      // Establecer posiciones iniciales para que empiecen en el primer elemento real (no duplicado)
      if (shouldUseCarouselAutoridades && autoridades.length > 0) {
        setCurrentAutoridad(ELEMENTOS_VISIBLES_AUTORIDADES);
      }
      if (shouldUseCarouselCarreras && carreras.length > 0) {
        setCurrentCarrera(ELEMENTOS_VISIBLES_CARRERAS);
      }
      setIsInitialized(true);
    }
  }, [
    autoridades.length,
    carreras.length,
    shouldUseCarouselAutoridades,
    shouldUseCarouselCarreras,
    isInitialized,
    ELEMENTOS_VISIBLES_AUTORIDADES,
    ELEMENTOS_VISIBLES_CARRERAS,
  ]);

  // Facultad actual (ahora usando datos dinámicos)
  const facultadActual = {
    nombre: facultadInfo.nombre,
    nombreCompleto: facultadInfo.nombreCompleto,
    logo: facultadInfo.logo,
    descripcion: facultadInfo.descripcion,
  };

  // Mapeo de estadísticas a sus componentes UI
  const statsMapping = {
    carreras: {
      label: "Carreras",
      icon: <GraduationCap size={36} />,
      value: (data) => data.toString(),
    },
    eventosActivos: {
      label: "Eventos Activos",
      icon: <Calendar size={36} />,
      value: (data) => data.toString(),
    },
    usuariosRegistrados: {
      label: "Usuarios Registrados",
      icon: <Users size={36} />,
      value: (data) => data.toString(),
    },
    tasaParticipacion: {
      label: "Participación de Usuarios",
      icon: <TrendingUp size={36} />,
      value: (data) => data,
    },
    eventosCancelados: {
      label: "Eventos Cancelados",
      icon: <CalendarX size={36} />,
      value: (data) => data.toString(),
    },
    eventosFinalizados: {
      label: "Eventos Finalizados",
      icon: <CalendarCheck size={36} />,
      value: (data) => data.toString(),
    },
    certificadosEmitidos: {
      label: "Certificados Emitidos",
      icon: <Award size={36} />,
      value: (data) => data.toString(),
    },
    inscripcionesActivas: {
      label: "Inscripciones Activas",
      icon: <ClipboardCheck size={36} />,
      value: (data) => data.toString(),
    },
    cuposDisponibles: {
      label: "Cupos Disponibles",
      icon: <UserPlus size={36} />,
      value: (data) => data.toString(),
    },
    eventosPresenciales: {
      label: "Eventos Presenciales",
      icon: <MapPin size={36} />,
      value: (data) => data.toString(),
    },
    eventosVirtuales: {
      label: "Eventos Virtuales",
      icon: <Laptop size={36} />,
      value: (data) => data.toString(),
    },
    eventosDestacados: {
      label: "Eventos Destacados",
      icon: <Star size={36} />,
      value: (data) => data.toString(),
    },
  };

  // Construir el array de estadísticas a mostrar basado en la configuración
  // Si no hay estadísticas configuradas, no mostrar nada
  const stats = hasConfiguredStats
    ? Object.entries(activeStatsData).map(([key, value]) => {
        const statConfig = statsMapping[key] || {
          label: key,
          icon: <Info size={36} />,
          value: (data) => data.toString(),
        };

        return {
          number: statConfig.value(value),
          label: statConfig.label,
          icon: statConfig.icon,
        };
      })
    : [];

  // Funciones para carrusel infinito (solo activas si hay más de 3 elementos)
  const nextAutoridad = useCallback(() => {
    if (shouldUseCarouselAutoridades && autoridades.length > 0) {
      setCurrentAutoridad((prev) => prev + 1);
    }
  }, [shouldUseCarouselAutoridades, autoridades.length]);

  const prevAutoridad = useCallback(() => {
    if (shouldUseCarouselAutoridades && autoridades.length > 0) {
      setCurrentAutoridad((prev) => prev - 1);
    }
  }, [shouldUseCarouselAutoridades, autoridades.length]);

  const nextCarrera = useCallback(() => {
    if (shouldUseCarouselCarreras && carreras.length > 0) {
      setCurrentCarrera((prev) => prev + 1);
    }
  }, [shouldUseCarouselCarreras, carreras.length]);

  const prevCarrera = useCallback(() => {
    if (shouldUseCarouselCarreras && carreras.length > 0) {
      setCurrentCarrera((prev) => prev - 1);
    }
  }, [shouldUseCarouselCarreras, carreras.length]);

  // Efectos para manejar el bucle infinito suave
  useEffect(() => {
    if (!shouldUseCarouselAutoridades || !isInitialized) return;

    // Reset suave al final del array
    if (
      currentAutoridad >=
      autoridades.length + ELEMENTOS_VISIBLES_AUTORIDADES
    ) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentAutoridad(ELEMENTOS_VISIBLES_AUTORIDADES);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 500); // Esperar a que termine la transición actual
    }
    // Reset suave al inicio del array
    else if (currentAutoridad < 0) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentAutoridad(
          autoridades.length - 1 + ELEMENTOS_VISIBLES_AUTORIDADES
        );
        setTimeout(() => setIsTransitioning(false), 50);
      }, 500);
    }
  }, [
    currentAutoridad,
    autoridades.length,
    shouldUseCarouselAutoridades,
    isInitialized,
    ELEMENTOS_VISIBLES_AUTORIDADES,
  ]);

  useEffect(() => {
    if (!shouldUseCarouselCarreras || !isInitialized) return;

    // Reset suave al final del array
    if (currentCarrera >= carreras.length + ELEMENTOS_VISIBLES_CARRERAS) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentCarrera(ELEMENTOS_VISIBLES_CARRERAS);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 500); // Esperar a que termine la transición actual
    }
    // Reset suave al inicio del array
    else if (currentCarrera < 0) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentCarrera(carreras.length - 1 + ELEMENTOS_VISIBLES_CARRERAS);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 500);
    }
  }, [
    currentCarrera,
    carreras.length,
    shouldUseCarouselCarreras,
    isInitialized,
    ELEMENTOS_VISIBLES_CARRERAS,
  ]);

  // Funciones para indicadores (ajustadas para carrusel infinito)
  const goToAutoridad = useCallback(
    (index) => {
      if (shouldUseCarouselAutoridades) {
        setCurrentAutoridad(index + ELEMENTOS_VISIBLES_AUTORIDADES);
      } else {
        setCurrentAutoridad(index);
      }
    },
    [shouldUseCarouselAutoridades, ELEMENTOS_VISIBLES_AUTORIDADES]
  );

  const goToCarrera = useCallback(
    (index) => {
      if (shouldUseCarouselCarreras) {
        setCurrentCarrera(index + ELEMENTOS_VISIBLES_CARRERAS);
      } else {
        setCurrentCarrera(index);
      }
    },
    [shouldUseCarouselCarreras, ELEMENTOS_VISIBLES_CARRERAS]
  );

  // Auto-play para los carruseles (siempre en movimiento, pero se detienen cuando el mouse está sobre ellos)
  useEffect(() => {
    let autoridadesInterval;
    let carrerasInterval;

    if (
      !isHoveringAutoridades &&
      shouldUseCarouselAutoridades &&
      autoridades.length > 1 &&
      isInitialized
    ) {
      autoridadesInterval = setInterval(() => {
        nextAutoridad();
      }, 3000); // 3 segundos para movimiento automático suave
    }

    if (
      !isHoveringCarreras &&
      shouldUseCarouselCarreras &&
      carreras.length > 1 &&
      isInitialized
    ) {
      carrerasInterval = setInterval(() => {
        nextCarrera();
      }, 3000); // 3 segundos para movimiento automático suave
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
    isInitialized,
    nextAutoridad,
    nextCarrera,
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
    <div className="d-flex flex-column home-page">
      {/* Área de detección superior */}
      <div ref={topAreaRef} className="top-detection-area-h" aria-hidden="true"></div>

      {/* Header/Navbar con clase condicional para visibilidad */}
      <header
        className={`navbar-container-h ${
          showNavbar ? "navbar-visible-h" : "navbar-hidden-h"
        }`}
      >
        <Navbar usuario={usuario} />
      </header>

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
      <header
        className="contenedor-principal-home hero-section-home"
        aria-labelledby="home-hero-title"
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 text-white py-4">
              <h1
                id="home-hero-title"
                className="display-4 fw-bold mb-3 animate__animated animate__fadeInUp"
              >
                {facultadActual.nombreCompleto}
              </h1>
              <p className="lead mb-4 animate__animated animate__fadeInUp">
                {facultadActual.descripcion ||
                  "Formando profesionales líderes con visión humanista y pensamiento crítico para responder a las necesidades tecnológicas del país."}
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link
                  to={isAuthenticated ? "/eventos" : "/eventos-publicos"}
                  className="btn btn-light fw-bold animate__animated animate__fadeInUp hero-button-primary"
                >
                  <Calendar size={18} className="me-2" />
                  {isAuthenticated
                    ? "Explorar eventos"
                    : "Explorar eventos públicos"}
                </Link>{" "}
                <a
                  href="#carreras"
                  className="btn btn-outline-light fw-bold animate__animated animate__fadeInUp hero-button-secondary"
                >
                  <GraduationCap size={18} className="me-2" /> Ver carreras
                </a>
              </div>
            </div>
            <div className="col-lg-6">
              {/* Estadísticas en el hero */}
              {hasConfiguredStats ? (
                <div className="row g-3">
                  {stats.map((stat, index) => (
                    <div className="col-6" key={index}>
                      <div className="card hero-stats-card text-center p-3 h-100">
                        <div className="display-6">{stat.icon}</div>
                        <h3 className="fw-bold mb-1 hero-stat-number">
                          {stat.number}
                        </h3>
                        <small className="text-muted">{stat.label}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card hero-stats-card text-center p-4 h-100">
                  <div className="display-6 text-muted mb-3">
                    <BarChart size={48} />
                  </div>
                  <h5 className="text-muted mb-2">
                    Estadísticas no configuradas
                  </h5>
                  <p className="text-muted small mb-0">
                    El administrador puede configurar las estadísticas a mostrar
                    desde el panel de administración.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Eventos Destacados */}
      <EventosDestacados eventUpdate={eventosDestacadosUpdate} />

      {/* Autoridades - Carrusel */}
      <section
        className="autoridades-section-h"
        id="autoridades"
        aria-labelledby="authorities-section-title"
      >
        <div className="autoridades-header-h">
          <h2 id="authorities-section-title" className="autoridades-title-h">
            Autoridades de la Facultad
          </h2>
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
                  index ===
                  (currentAutoridad - ELEMENTOS_VISIBLES_AUTORIDADES) %
                    autoridades.length
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
      <section
        className="container mb-5"
        id="carreras"
        aria-labelledby="careers-section-title"
      >
        <div className="row justify-content-center mb-4">
          <div className="col-lg-6 text-center">
            <h2 id="careers-section-title" className="fw-bold home-section-title">
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
                      <h5 className="card-title fw-bold home-section-title">
                        {carrera.nom_car}
                      </h5>
                      <p className="card-text small text-muted mb-3">
                        {carrera.des_car}
                      </p>
                      <div className="mb-3">
                        <span className="badge career-badge me-2">
                          <Clock size={14} className="me-1" />{" "}
                          {carrera.dur_sem_car} semestres
                        </span>
                        <span className="badge career-badge">
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
                  index ===
                  (currentCarrera - ELEMENTOS_VISIBLES_CARRERAS) %
                    carreras.length
                    ? "active-h"
                    : ""
                }`}
                onClick={() => goToCarrera(index)}
              />
            ))}
          </div>
        )}
      </section>
      {/* Misión y Visión */}
      <section
        className="container mb-5"
        id="mision-vision"
        aria-labelledby="identity-section-title"
      >
        <div className="row justify-content-center mb-4">
          <div className="col-lg-6 text-center">
            <h2 id="identity-section-title" className="fw-bold home-section-title">
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
                    <h3 className="card-title fw-bold mb-0 home-section-title">
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
      </section>
      {/* Sección de contacto */}
      <section
        className="container mb-5"
        id="contacto"
        aria-labelledby="contact-section-title"
      >
        <div className="card border-0 shadow-lg p-4 contact-section contact-card-home">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2 id="contact-section-title" className="fw-bold mb-3 home-section-title">
                <MessageSquare
                  size={24}
                  className="me-2"
                  style={{ verticalAlign: "middle" }}
                />{" "}
                ¿Necesitas información adicional?
              </h2>
              <p className="mb-md-0">
                Nuestro equipo de atención está disponible para resolver todas
                tus dudas sobre inscripciones, carreras y procesos académicos.
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <a
                href="https://fisei.uta.edu.ec/v4.0/index.php/facultad/historia-facultad"
                target="_blank"
                rel="noreferrer"
                className="btn fw-bold btn-lg me-2 mb-2 contact-link-primary"
              >
                <Mail size={18} className="me-2" /> Contáctanos
              </a>
              <a
                href="https://fisei.uta.edu.ec/v4.0/index.php/facultad/directorio-telefonico"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary fw-bold btn-lg mb-2 contact-link-secondary"
              >
                <Phone size={18} className="me-2" /> Llamar
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer isAuthenticated={usuario?.id ? true : false} />
    </div>
  );
}

export default Home;
