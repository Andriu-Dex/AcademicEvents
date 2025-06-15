import React, { useState, useEffect, useRef } from "react";
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
import "./styles/EventosDestacados.css";

/**
 * @component EventosDestacados
 * @description Componente que muestra los eventos destacados en el Home
 */
const EventosDestacados = () => {
  const [eventosDestacados, setEventosDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const carouselRef = useRef(null);
  const gestorEventos = useRef(
    new GestorEventosDestacados(EventoService)
  ).current;

  // Determinar si se debe usar carrusel (más de 3 eventos)
  const shouldUseCarousel = eventosDestacados.length > 3;

  // Cargar eventos destacados al montar el componente
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

    // Iniciar carrusel automático si hay suficientes eventos
    let carouselInterval;

    if (shouldUseCarousel && !isHovering) {
      carouselInterval = setInterval(() => {
        nextSlide();
      }, 5000); // Cambiar cada 5 segundos
    }

    return () => {
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
    };
  }, [isHovering, shouldUseCarousel]);

  // Extender eventos para carrusel infinito
  const extendedEventos = shouldUseCarousel
    ? [...eventosDestacados, ...eventosDestacados.slice(0, 3)]
    : eventosDestacados;

  // Funciones para controlar el carrusel
  const nextSlide = () => {
    if (!shouldUseCarousel) return;

    const nextIndex = currentSlide + 1;

    // Si llegamos al final, reiniciamos sin animación
    if (nextIndex >= eventosDestacados.length) {
      setIsTransitioning(true);
      setCurrentSlide(0);

      // Restaurar la transición después
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    } else {
      setCurrentSlide(nextIndex);
    }
  };

  const prevSlide = () => {
    if (!shouldUseCarousel) return;

    if (currentSlide === 0) {
      // Ir al final sin transición
      setIsTransitioning(true);
      setCurrentSlide(eventosDestacados.length - 1);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    } else {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    if (!shouldUseCarousel) return;
    setCurrentSlide(index);
  };

  // Obtener ícono según modalidad
  const getModalidadIcon = (modalidad) => {
    switch (modalidad) {
      case "PRESENCIAL":
        return <MapPin size={16} className="evento-icon-h" />;
      case "VIRTUAL":
        return <Monitor size={16} className="evento-icon-h" />;
      case "SEMIPRESENCIAL":
        return <Laptop size={16} className="evento-icon-h" />;
      default:
        return <MapPin size={16} className="evento-icon-h" />;
    }
  };

  // Formatear fecha en español
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Renderizar el componente
  if (cargando) {
    return (
      <section className="eventos-destacados-section-h">
        <div className="eventos-destacados-header-h">
          <h2 className="eventos-destacados-title-h">Eventos Destacados</h2>
          <div className="eventos-destacados-loading-h">
            <div className="spinner-h"></div>
            <p>Cargando eventos destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="eventos-destacados-section-h">
        <div className="eventos-destacados-header-h">
          <h2 className="eventos-destacados-title-h">Eventos Destacados</h2>
          <p className="eventos-destacados-error-h">{error}</p>
        </div>
      </section>
    );
  }

  if (eventosDestacados.length === 0) {
    return null; // No mostrar la sección si no hay eventos destacados
  }

  return (
    <section className="eventos-destacados-section-h" id="eventos-destacados">
      <div className="eventos-destacados-header-h">
        <h2 className="eventos-destacados-title-h">Eventos Destacados</h2>
        <p className="eventos-destacados-subtitle-h">
          Conoce nuestras propuestas más relevantes
        </p>
      </div>

      <div
        className={
          shouldUseCarousel ? "carousel-container-h" : "static-container-h"
        }
        onMouseEnter={shouldUseCarousel ? () => setIsHovering(true) : undefined}
        onMouseLeave={
          shouldUseCarousel ? () => setIsHovering(false) : undefined
        }
      >
        {shouldUseCarousel && (
          <button
            className="carousel-btn-h carousel-btn-prev-h"
            onClick={prevSlide}
            aria-label="Anterior evento destacado"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="carousel-window-h">
          <div
            className={
              shouldUseCarousel ? "eventos-carousel-h" : "eventos-static-h"
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
              <article className="evento-card-h carousel-item-h" key={index}>
                <div className="evento-image-container-h">
                  <img
                    src={evento.imagen}
                    alt={evento.titulo}
                    className="evento-image-h"
                  />
                  <span className="evento-badge-destacado-h">⭐ Destacado</span>
                </div>

                <div className="evento-content-h">
                  <h3 className="evento-titulo-h">{evento.titulo}</h3>

                  <div className="evento-detalles-h">
                    <div className="evento-fecha-h">
                      <Calendar size={16} className="evento-icon-h" />
                      <span>{formatFecha(evento.fechaInicio)}</span>
                    </div>

                    <div className="evento-duracion-h">
                      <Clock size={16} className="evento-icon-h" />
                      <span>{evento.duracionHoras} horas</span>
                    </div>

                    <div className="evento-modalidad-h">
                      {getModalidadIcon(evento.modalidad)}
                      <span>{evento.modalidad.toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="evento-footer-h">
                    <span
                      className={`evento-valor-h ${
                        evento.valor === 0
                          ? "evento-gratuito-h"
                          : "evento-pago-h"
                      }`}
                    >
                      {evento.valor === 0
                        ? "Gratuito"
                        : `$${evento.valor.toFixed(2)}`}
                    </span>

                    <Link
                      to={`/eventos/${evento.id}`}
                      className="evento-ver-mas-h"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {shouldUseCarousel && (
          <button
            className="carousel-btn-h carousel-btn-next-h"
            onClick={nextSlide}
            aria-label="Siguiente evento destacado"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {shouldUseCarousel && eventosDestacados.length > 1 && (
        <div className="carousel-indicators-h">
          {eventosDestacados.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator-h ${
                index === currentSlide % eventosDestacados.length
                  ? "active-h"
                  : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al evento destacado ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default EventosDestacados;
