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
import { useHomeSocket } from "../../hooks/useHomeSocket";
import ModalRequisitos from "../ModalRequisitos";
import "./styles/EventosDestacados.css";

/**
 * @component EventosDestacados
 * @description Componente que muestra los eventos destacados en el Home
 */
const EventosDestacados = () => {
  // Estados del componente
  const [eventosDestacados, setEventosDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [modalEvento, setModalEvento] = useState(null);

  // Referencias para evitar re-creaciones
  const carouselRef = useRef(null);
  const gestorEventos = useRef(
    new GestorEventosDestacados(EventoService)
  ).current;
  const gestorModales = useRef(new GestorModales(setModalEvento)).current;

  // Callbacks para evitar re-renderizados
  const handleEventUpdate = useCallback(
    (updateData) => {
      if (
        updateData.action === "updated" &&
        updateData.data.tipo === "destacado"
      ) {
        console.log("Actualizando evento destacado:", updateData.data);
        gestorEventos.actualizarEventoDestacado(updateData.data);
      }
    },
    [gestorEventos]
  );

  // Hook para sockets con callback estable
  const { eventUpdates } = useHomeSocket({
    onEventUpdate: handleEventUpdate,
  });

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
      setCurrentSlide(index);
    },
    [shouldUseCarousel]
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

  // Efecto separado para el carrusel automático
  useEffect(() => {
    let carouselInterval;

    if (shouldUseCarousel && eventosDestacados.length > 1) {
      const intervalTime = isHovering ? 2000 : 5000;

      carouselInterval = setInterval(() => {
        nextSlide();
      }, intervalTime);
    }

    return () => {
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
    };
  }, [isHovering, shouldUseCarousel, nextSlide, eventosDestacados.length]);

  // Actualizar eventos cuando hay cambios desde el socket
  useEffect(() => {
    if (
      eventUpdates &&
      eventUpdates.action === "updated" &&
      eventUpdates.data.tipo === "destacado"
    ) {
      console.log(
        "🔄 EventoDestacado: Procesando actualización de socket:",
        eventUpdates.data
      );
    }
  }, [eventUpdates]);

  // Efecto para reiniciar posición del carrusel cuando cambian los eventos destacados
  useEffect(() => {
    if (eventosDestacados.length > 0) {
      setCurrentSlide(0);
    }
  }, [eventosDestacados.length]);

  // Efecto para manejar el bucle infinito
  useEffect(() => {
    if (!shouldUseCarousel || eventosDestacados.length === 0) return;

    if (currentSlide === eventosDestacados.length) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentSlide(0);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 500);
    } else if (currentSlide < 0) {
      setTimeout(() => {
        setIsTransitioning(true);
        setCurrentSlide(eventosDestacados.length - 1);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 500);
    }
  }, [currentSlide, eventosDestacados.length, shouldUseCarousel]);

  // Extender eventos para carrusel infinito (como valor memorizado)
  const extendedEventos = useMemo(
    () =>
      shouldUseCarousel
        ? [...eventosDestacados, ...eventosDestacados.slice(0, 3)]
        : eventosDestacados,
    [eventosDestacados, shouldUseCarousel]
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
                      <span>{evento.duracionHoras} horas</span>
                    </div>

                    <div className="evento-modalidad-ed">
                      {getModalidadIcon(evento.modalidad)}
                      <span>{evento.modalidad.toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="evento-footer-ed">
                    <span
                      className={`evento-valor-ed ${
                        evento.valor === 0
                          ? "evento-gratuito-ed"
                          : "evento-pago-ed"
                      }`}
                    >
                      {evento.valor === 0
                        ? "Gratuito"
                        : `$${evento.valor.toFixed(2)}`}
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
                index === currentSlide % eventosDestacados.length
                  ? "active-ed"
                  : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al evento destacado ${index + 1}`}
            />
          ))}
        </div>
      )}

      {modalEvento && (
        <ModalRequisitos
          evento={modalEvento}
          onClose={() => gestorModales.cerrarModal()}
        />
      )}
    </section>
  );
};

export default EventosDestacados;
