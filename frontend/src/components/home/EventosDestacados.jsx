import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Monitor,
} from "lucide-react";
import EventoService from "../../services/EventoService";
import GestorEventosDestacados from "../../models/GestorEventosDestacados";
import GestorModales from "../../models/GestorModales";
import EventoDestacado from "../../models/EventoDestacado";
import ModalRequisitos from "../ModalRequisitos";
import "./styles/EventosDestacados.css";
import "./styles/ModalEventosDestacados.css";

/**
 * @component EventosDestacados
 * @description Componente que muestra los eventos destacados en el Home
 * @param {Object} eventUpdate - Actualización de evento desde socket
 */
const EventosDestacados = ({ eventUpdate }) => {
  // Configuración para carrusel infinito (declarar primero)
  const ELEMENTOS_VISIBLES = 3; // Elementos visibles simultáneamente

  // Estados del componente
  const [eventosDestacados, setEventosDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [modalEvento, setModalEvento] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Referencias para evitar re-creaciones
  const carouselRef = useRef(null);
  const gestorEventos = useRef(
    new GestorEventosDestacados(EventoService)
  ).current;
  const gestorModales = useRef(new GestorModales(setModalEvento)).current;

  // Cálculos memorizados para rendimiento
  const shouldUseCarousel = useMemo(
    () => eventosDestacados.length > 3,
    [eventosDestacados.length]
  );

  // Callbacks para navegación del carrusel
  const nextSlide = useCallback(() => {
    if (!shouldUseCarousel) return;
    setCurrentSlide((prev) => prev + 1);
  }, [shouldUseCarousel]);

  const prevSlide = useCallback(() => {
    if (!shouldUseCarousel) return;
    setCurrentSlide((prev) => prev - 1);
  }, [shouldUseCarousel]);

  const goToSlide = useCallback(
    (index) => {
      if (!shouldUseCarousel) return;
      setCurrentSlide(index + ELEMENTOS_VISIBLES);
    },
    [shouldUseCarousel, ELEMENTOS_VISIBLES]
  );

  // Manejador para abrir el modal de detalles
  const handleVerDetalles = useCallback(
    (evento) => {
      // Convertir evento destacado al formato compatible con el modal
      const eventoParaModal = {
        id_eve: evento.id,
        nom_eve: evento.titulo,
        des_eve: evento.descripcion,
        fec_ini_eve: evento.fechaInicio.toISOString(),
        fec_fin_eve: evento.fechaFin.toISOString(),
        mod_eve: evento.modalidad,
        val_eve: evento.valor,
        tip_eve: evento.tipo,
        dur_hor_eve: evento.duracionHoras,
        cup_dis_eve: evento.cuposDisponibles,
        cup_max_eve: evento.cuposMaximos,
        est_eve: evento.estado,
        img_por_eve: evento.imagen,
      };

      gestorModales.abrirModal(eventoParaModal);
    },
    [gestorModales]
  );

  // Efecto para cargar eventos destacados (solo se ejecuta una vez)
  useEffect(() => {
    const cargarEventosDestacados = async () => {
      try {
        setCargando(true);
        setError(null);

        await gestorEventos.obtenerEventosDestacados();
        setEventosDestacados(gestorEventos.eventosDestacados);
      } catch (error) {
        console.error("Error al cargar eventos destacados:", error);
        setError(
          "No pudimos cargar los eventos destacados. Intenta más tarde."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarEventosDestacados();

    // Configurar el callback para actualizaciones en tiempo real (solo una vez)
    gestorEventos.setOnEventoDestacadoChange((nuevosEventosDestacados) => {
      console.log(
        "🔄 Actualizando lista de eventos destacados:",
        nuevosEventosDestacados
      );
      setEventosDestacados([...nuevosEventosDestacados]);
    });
  }, []);

  // Efecto para manejar actualizaciones de eventos destacados desde socket
  useEffect(() => {
    if (
      eventUpdate &&
      eventUpdate.data &&
      eventUpdate.data.tipo === "destacado"
    ) {
      console.log(
        "🔄 EventosDestacados: Recibida actualización de evento destacado:",
        eventUpdate
      );

      const { evento, esDestacado } = eventUpdate.data;

      if (esDestacado) {
        // Evento marcado como destacado - agregar si no existe
        setEventosDestacados((prev) => {
          const exists = prev.find((e) => e.id === evento.id_eve);
          if (!exists) {
            console.log("➕ Agregando evento destacado:", evento.nom_eve);
            // Transformar el evento usando la clase EventoDestacado
            const eventoTransformado = new EventoDestacado(evento);
            return [...prev, eventoTransformado];
          }
          return prev;
        });
      } else {
        // Evento desmarcado como destacado - remover
        setEventosDestacados((prev) => {
          const filtered = prev.filter((e) => e.id !== evento.id_eve);
          console.log("➖ Removiendo evento destacado:", evento.nom_eve);
          return filtered;
        });
      }
    }
  }, [eventUpdate]);

  // Efecto separado para el carrusel automático
  useEffect(() => {
    let carouselInterval;

    if (shouldUseCarousel && eventosDestacados.length > 1 && isInitialized) {
      // Carrusel siempre en movimiento, pero se detiene cuando hay hover
      if (!isHovering) {
        carouselInterval = setInterval(() => {
          nextSlide();
        }, 4000); // 4 segundos sin hover
      }
    }

    return () => {
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
    };
  }, [
    isHovering,
    shouldUseCarousel,
    nextSlide,
    eventosDestacados.length,
    isInitialized,
  ]);

  // Efecto para inicializar la posición del carrusel infinito
  useEffect(() => {
    if (!isInitialized && shouldUseCarousel && eventosDestacados.length > 0) {
      setCurrentSlide(ELEMENTOS_VISIBLES);
      setIsInitialized(true);
    }
  }, [
    eventosDestacados.length,
    shouldUseCarousel,
    isInitialized,
    ELEMENTOS_VISIBLES,
  ]);

  // Efecto para reiniciar posición del carrusel cuando cambian los eventos destacados
  useEffect(() => {
    if (eventosDestacados.length > 0 && shouldUseCarousel) {
      setCurrentSlide(ELEMENTOS_VISIBLES);
      setIsInitialized(true);
    } else if (eventosDestacados.length > 0) {
      setCurrentSlide(0);
    }
  }, [eventosDestacados.length, shouldUseCarousel, ELEMENTOS_VISIBLES]);

  // Efecto para manejar el bucle infinito suave
  useEffect(() => {
    if (!shouldUseCarousel || eventosDestacados.length === 0 || !isInitialized)
      return;

    // Reset suave al final del array
    if (currentSlide >= eventosDestacados.length + ELEMENTOS_VISIBLES) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentSlide(ELEMENTOS_VISIBLES);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 500);
    }
    // Reset suave al inicio del array
    else if (currentSlide < 0) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentSlide(eventosDestacados.length - 1 + ELEMENTOS_VISIBLES);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 500);
    }
  }, [
    currentSlide,
    eventosDestacados.length,
    shouldUseCarousel,
    isInitialized,
    ELEMENTOS_VISIBLES,
  ]);

  // Extender eventos para carrusel infinito suave
  const extendedEventos = useMemo(
    () =>
      shouldUseCarousel && eventosDestacados.length > 0
        ? [
            ...eventosDestacados.slice(-ELEMENTOS_VISIBLES), // Últimos elementos al inicio
            ...eventosDestacados, // Array original
            ...eventosDestacados.slice(0, ELEMENTOS_VISIBLES), // Primeros elementos al final
          ]
        : eventosDestacados,
    [eventosDestacados, shouldUseCarousel, ELEMENTOS_VISIBLES]
  );

  // Obtener ícono según modalidad
  const getModalidadIcon = useCallback((modalidad) => {
    switch (modalidad) {
      case "PRESENCIAL":
        return <MapPin size={16} className="evento-icon-ed" />;
      case "VIRTUAL":
        return <Monitor size={16} className="evento-icon-ed" />;
      case "SEMIPRESENCIAL":
        return <Monitor size={16} className="evento-icon-ed" />;
      default:
        return <MapPin size={16} className="evento-icon-ed" />;
    }
  }, []);

  // Formatear fecha en español
  const formatFecha = useCallback((fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  // Renderizados condicionales
  if (cargando) {
    return (
      <section className="eventos-destacados-section-ed">
        <div className="eventos-destacados-header-ed">
          <h2 className="eventos-destacados-title-ed">Eventos Destacados</h2>
          <div className="eventos-destacados-loading-ed">
            <div className="spinner-ed"></div>
            <p>Cargando eventos destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="eventos-destacados-section-ed">
        <div className="eventos-destacados-header-ed">
          <h2 className="eventos-destacados-title-ed">Eventos Destacados</h2>
          <p className="eventos-destacados-error-ed">{error}</p>
        </div>
      </section>
    );
  }

  if (eventosDestacados.length === 0) {
    return null; // No mostrar la sección si no hay eventos destacados
  }

  // Renderizado principal
  return (
    <section className="eventos-destacados-section-ed" id="eventos-destacados">
      <div className="eventos-destacados-header-ed">
        <h2 className="eventos-destacados-title-ed">Eventos Destacados</h2>
        <p className="eventos-destacados-subtitle-ed">
          Conoce nuestras propuestas más relevantes
        </p>
      </div>
      <div
        className={
          shouldUseCarousel ? "carousel-container-ed" : "static-container-ed"
        }
        onMouseEnter={shouldUseCarousel ? () => setIsHovering(true) : undefined}
        onMouseLeave={
          shouldUseCarousel ? () => setIsHovering(false) : undefined
        }
      >
        {shouldUseCarousel && (
          <button
            className="carousel-btn-ed carousel-btn-prev-ed"
            onClick={prevSlide}
            aria-label="Anterior evento destacado"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="carousel-window-ed">
          <div
            className={
              shouldUseCarousel ? "eventos-carousel-ed" : "eventos-static-ed"
            }
            ref={carouselRef}
            style={
              shouldUseCarousel
                ? {
                    transform: `translateX(-${currentSlide * (330 + 24)}px)`, // 330px width + 1.5rem gap
                    transition: isTransitioning
                      ? "none"
                      : "transform 0.5s ease-in-out",
                  }
                : {}
            }
          >
            {extendedEventos.map((evento, index) => (
              <article
                className="evento-card-ed carousel-item-ed"
                key={`evento-${evento.id}-${index}`}
              >
                <div className="evento-image-container-ed">
                  <img
                    src={evento.imagen}
                    alt={evento.titulo}
                    className="evento-image-ed"
                  />
                  <span className="evento-badge-destacado-ed">
                    ⭐ Destacado
                  </span>
                </div>

                <div className="evento-content-ed">
                  <h3 className="evento-titulo-ed">{evento.titulo}</h3>

                  <div className="evento-detalles-ed">
                    <div className="evento-fecha-ed">
                      <Calendar size={16} className="evento-icon-ed" />
                      <span>{formatFecha(evento.fechaInicio)}</span>
                    </div>

                    <div className="evento-duracion-ed">
                      <Clock size={16} className="evento-icon-ed" />
                      <span>{evento.duracionHoras || 0} horas</span>
                    </div>

                    <div className="evento-modalidad-ed">
                      {getModalidadIcon(evento.modalidad)}
                      <span>
                        {evento.modalidad?.toLowerCase() || "Sin modalidad"}
                      </span>
                    </div>
                  </div>

                  <div className="evento-footer-ed">
                    <span
                      className={`evento-valor-ed ${
                        (evento.valor || 0) === 0
                          ? "evento-gratuito-ed"
                          : "evento-pago-ed"
                      }`}
                    >
                      {(evento.valor || 0) === 0
                        ? "Gratuito"
                        : `$${(evento.valor || 0).toFixed(2)}`}
                    </span>

                    <button
                      onClick={() => handleVerDetalles(evento)}
                      className="evento-ver-mas-ed"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {shouldUseCarousel && (
          <button
            className="carousel-btn-ed carousel-btn-next-ed"
            onClick={nextSlide}
            aria-label="Siguiente evento destacado"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
      {shouldUseCarousel && eventosDestacados.length > 1 && (
        <div className="carousel-indicators-ed">
          {eventosDestacados.map((_, index) => (
            <button
              key={`indicator-${index}`}
              className={`carousel-indicator-ed ${
                index ===
                (currentSlide - ELEMENTOS_VISIBLES) % eventosDestacados.length
                  ? "active-ed"
                  : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al evento destacado ${index + 1}`}
            />
          ))}
        </div>
      )}{" "}
      {modalEvento && (
        <ModalRequisitos
          evento={modalEvento}
          onClose={() => gestorModales.cerrarModal()}
          overlayClassName="modal-requisitos-overlay-ed"
        />
      )}
    </section>
  );
};

export default EventosDestacados;
