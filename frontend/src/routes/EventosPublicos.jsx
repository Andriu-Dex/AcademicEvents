import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import {
  CalendarDays,
  Search,
  Home,
  Info,
  LogIn,
  Clock,
  BadgeDollarSign,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Zap,
  Pause,
  Star,
  MapPin,
  Monitor,
  Laptop,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import ModalRequisitos from "../components/ModalRequisitos";
import "./styles/EventosPublicos.css";
import "./styles/animaciones.css";

// Función para formatear fechas correctamente usando UTC
const formatearFechaUTC = (fechaStr) => {
  if (!fechaStr) return "-";
  try {
    const fechaParts = fechaStr.split("T")[0].split("-");
    const year = parseInt(fechaParts[0]);
    const month = parseInt(fechaParts[1]) - 1;
    const day = parseInt(fechaParts[2]);

    const fecha = new Date(Date.UTC(year, month, day));
    if (isNaN(fecha.getTime())) return "-";

    return fecha.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch (error) {
    console.error("", error);
    return "-";
  }
};

const EventosPublicos = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalEvento, setModalEvento] = useState(null);
  
  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    software: false,
    industrial: false,
    publico: false,
    gratuito: false,
    pagado: false,
    completo: false,
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Función para aplicar filtros
  const aplicarFiltros = (evento) => {
    // Filtro por nombre
    const coincideNombre = evento.nom_eve
      .toLowerCase()
      .includes(filtro.toLowerCase());
    
    if (!coincideNombre) return false;

    // Si no hay filtros activos, mostrar todos
    const hayFiltrosActivos = Object.values(filtros).some(f => f);
    if (!hayFiltrosActivos) return true;

    // Aplicar filtros específicos
    if (filtros.software) {
      const esSoftware = evento.eventos_carrera?.some(ec => 
        ec.carrera?.nom_car?.toLowerCase().includes('software') ||
        ec.carrera?.nom_car?.toLowerCase().includes('sistemas')
      );
      if (!esSoftware) return false;
    }

    if (filtros.industrial) {
      const esIndustrial = evento.eventos_carrera?.some(ec => 
        ec.carrera?.nom_car?.toLowerCase().includes('industrial')
      );
      if (!esIndustrial) return false;
    }

    if (filtros.publico) {
      if (evento.tip_eve !== 'PUBLICO') return false;
    }

    if (filtros.gratuito) {
      if (evento.val_eve !== 0) return false;
    }

    if (filtros.pagado) {
      if (evento.val_eve === 0) return false;
    }

    if (filtros.completo) {
      if (evento.cup_dis_eve !== 0) return false;
    }

    return true;
  };

  // Función para manejar cambios en filtros
  const manejarCambioFiltro = (tipoFiltro) => {
    setFiltros(prev => ({
      ...prev,
      [tipoFiltro]: !prev[tipoFiltro]
    }));

    // Añadir efecto de filtrado al grid
    const eventosGrid = document.querySelector(".eventos-grid");
    if (eventosGrid) {
      eventosGrid.classList.add("filtering");
      setTimeout(() => {
        eventosGrid.classList.remove("filtering");
      }, 300);
    }
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      software: false,
      industrial: false,
      publico: false,
      gratuito: false,
      pagado: false,
      completo: false,
    });
  };

  useEffect(() => {
    if (usuario) {
      navigate("/eventos");
      return;
    }

    const obtenerEventos = async () => {
      try {
        // Utilizamos el endpoint que incluye las relaciones con carreras y cursos
        const eventosRes = await axiosInstance.get("/eventos");

        // Filtramos los eventos que tienen cupos disponibles
        const eventosPublicos = eventosRes.data.filter((evento) => {
          // Convertimos a número para asegurar comparación correcta
          const cuposDisponibles = parseInt(evento.cup_dis_eve) || 0;
          return cuposDisponibles > 0;
        });

        // Para cada evento, cargamos sus detalles completos incluyendo carreras asociadas
        const eventosConDetalles = await Promise.all(
          eventosPublicos.map(async (evento) => {
            try {
              const detallesEvento = await axiosInstance.get(
                `/eventos/${evento.id_eve}`
              );
              return detallesEvento.data;
            } catch (err) {
              console.error(
                `Error al cargar detalles del evento ${evento.id_eve}:`,
                err
              );
              return evento; // Devolvemos el evento original si falla la carga de detalles
            }
          })
        );

        // Ordenar por fecha de inicio
        const eventosOrdenados = eventosConDetalles.sort((a, b) => {
          const fechaA = new Date(a.fec_ini_eve);
          const fechaB = new Date(b.fec_ini_eve);
          return fechaA - fechaB;
        });

        setEventos(eventosOrdenados);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        toast.error(
          "Error al cargar los eventos. Por favor, intente más tarde."
        );
      } finally {
        setCargando(false);
      }
    };

    obtenerEventos();
  }, [usuario, navigate]);
  if (cargando) {
    return (
      <>
        <Navbar />
        <div className="eventos-container">
          <div className="eventos-cargando">
            <div className="spinner"></div>
            <p>Cargando eventos públicos disponibles...</p>
            <div className="spinner-stars">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  size={i === 0 ? 14 : i === 1 ? 18 : 12}
                  className={`star-icon star-${i + 1}`}
                  fill="#8a1538"
                  color="#8a1538"
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="eventos-container">
        <h1 className="eventos-titulo">
          <CalendarDays size={24} />
          Eventos Públicos
        </h1>

        <div className="buscador-contenedor">
          <div className="buscador-wrapper">
            <Search className="buscador-icono" size={18} />{" "}
            <input
              type="text"
              placeholder="Buscar por nombre del evento..."
              value={filtro}
              onChange={(e) => {
                // Añadir clase de filtrado al grid
                const eventosGrid = document.querySelector(".eventos-grid");
                if (eventosGrid) {
                  eventosGrid.classList.add("filtering");
                  // Quitar la clase después de la animación
                  setTimeout(() => {
                    eventosGrid.classList.remove("filtering");
                  }, 300);
                }
                setFiltro(e.target.value);
              }}
              className="eventos-buscador-ep"
            />
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="filtros-contenedor">
          <div className="filtros-header">
            <button
              className={`btn-toggle-filtros ${mostrarFiltros ? 'activo' : ''}`}
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <Filter size={18} />
              Filtros
              <ChevronDown 
                size={16} 
                className={`chevron ${mostrarFiltros ? 'rotado' : ''}`}
              />
            </button>
            
            {Object.values(filtros).some(f => f) && (
              <button
                className="btn-limpiar-filtros"
                onClick={limpiarFiltros}
              >
                <X size={16} />
                Limpiar filtros
              </button>
            )}
          </div>

          {mostrarFiltros && (
            <div className="filtros-grid">
              <div className="filtro-categoria">
                <h4>Por Carrera</h4>
                <div className="filtros-opciones">
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.software}
                      onChange={() => manejarCambioFiltro('software')}
                    />
                    <span className="checkmark"></span>
                    Software/Sistemas
                  </label>
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.industrial}
                      onChange={() => manejarCambioFiltro('industrial')}
                    />
                    <span className="checkmark"></span>
                    Industrial
                  </label>
                </div>
              </div>

              <div className="filtro-categoria">
                <h4>Por Tipo</h4>
                <div className="filtros-opciones">
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.publico}
                      onChange={() => manejarCambioFiltro('publico')}
                    />
                    <span className="checkmark"></span>
                    Eventos Públicos
                  </label>
                </div>
              </div>

              <div className="filtro-categoria">
                <h4>Por Precio</h4>
                <div className="filtros-opciones">
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.gratuito}
                      onChange={() => manejarCambioFiltro('gratuito')}
                    />
                    <span className="checkmark"></span>
                    Eventos Gratuitos
                  </label>
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.pagado}
                      onChange={() => manejarCambioFiltro('pagado')}
                    />
                    <span className="checkmark"></span>
                    Eventos de Pago
                  </label>
                </div>
              </div>

              <div className="filtro-categoria">
                <h4>Por Disponibilidad</h4>
                <div className="filtros-opciones">
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.completo}
                      onChange={() => manejarCambioFiltro('completo')}
                    />
                    <span className="checkmark"></span>
                    Eventos Completos
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {eventos.length === 0 ? (
          <div className="eventos-vacios">
            <p>No hay eventos públicos disponibles en este momento.</p>
            <Link to="/home" className="btn-volver">
              <Home size={18} />
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            {/* Contador de resultados */}
            <div className="resultados-contador">
              <p>
                Mostrando {eventos.filter(aplicarFiltros).length} de {eventos.length} eventos
                {Object.values(filtros).some(f => f) && (
                  <span className="filtros-activos-badge">
                    ({Object.values(filtros).filter(f => f).length} filtro{Object.values(filtros).filter(f => f).length !== 1 ? 's' : ''} activo{Object.values(filtros).filter(f => f).length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
            
            <div className="eventos-grid">
              {eventos
                .filter(aplicarFiltros)
                .map((evento, index) => (
                <div
                  key={evento.id_eve}
                  className="evento-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {" "}
                  <div className="evento-portada-wrapper">
                    <img
                      src={
                        evento.img_por_eve || "https://i.imgur.com/c6Ry30Z.jpeg"
                      }
                      alt={`Portada de ${evento.nom_eve}`}
                      className="evento-portada"
                      onLoad={(e) => {
                        e.target.classList.add("loaded");
                      }}
                    />
                    <div className="portada-overlay"></div>
                  </div>
                  <h2 className="nombre-evento-ep">{evento.nom_eve}</h2>
                  <p className="tipo-ep">{evento.tip_eve}</p>
                  <p className="precio-evento">
                    <BadgeDollarSign size={16} />
                    {evento.val_eve === 0
                      ? "Gratuito"
                      : `Precio: $${evento.val_eve.toFixed(2)}`}
                  </p>
                  {evento.des_eve && (
                    <div className="descripcion-evento">
                      <p>
                        {evento.des_eve.length > 150
                          ? `${evento.des_eve.substring(0, 150)}...`
                          : evento.des_eve}
                      </p>
                    </div>
                  )}
                  <p className="fecha-evento-ep">
                    <Calendar size={16} className="inline-icon" /> Fecha:{" "}
                    {formatearFechaUTC(evento.fec_ini_eve)} a{" "}
                    {formatearFechaUTC(evento.fec_fin_eve)}
                  </p>{" "}
                  <p className="duracion-evento-ep">
                    <Clock size={16} className="inline-icon" /> Duración:{" "}
                    {evento.dur_hor_eve} horas
                  </p>
                  <p
                    className={
                      evento.cup_dis_eve === 0
                        ? "cupos-agotados"
                        : "cupos-disponibles"
                    }
                  >
                    {evento.cup_dis_eve === 0 ? (
                      <>
                        <AlertCircle size={16} className="inline-icon" /> Sin
                        cupos disponibles
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="inline-icon" /> Cupos
                        disponibles: {evento.cup_dis_eve || 0}
                      </>
                    )}
                  </p>{" "}
                  <p className="modalidad-evento">
                    {evento.mod_eve === "PRESENCIAL" && (
                      <>
                        <MapPin size={16} className="inline-icon" /> Modalidad:
                        Presencial
                      </>
                    )}
                    {evento.mod_eve === "VIRTUAL" && (
                      <>
                        <Monitor size={16} className="inline-icon" /> Modalidad:
                        Virtual
                      </>
                    )}
                    {evento.mod_eve === "SEMIPRESENCIAL" && (
                      <>
                        <Laptop size={16} className="inline-icon" /> Modalidad:
                        Semipresencial
                      </>
                    )}
                    {!evento.mod_eve && (
                      <>
                        <Users size={16} className="inline-icon" /> Modalidad:
                        No especificada
                      </>
                    )}
                  </p>
                  <div className="evento-footer">
                    {" "}
                    <div
                      className={`estado-evento ${evento.est_eve?.toLowerCase()}`}
                    >
                      {evento.est_eve === "ACTIVO" ? (
                        <>
                          <Zap size={14} className="inline-icon" /> ACTIVO
                        </>
                      ) : (
                        <>
                          <Pause size={14} className="inline-icon" /> INACTIVO
                        </>
                      )}
                    </div>{" "}
                    <button
                      className="btn-requisitos"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setModalEvento(evento);

                        // Añadir efecto ripple al botón
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        const ripple = document.createElement("span");
                        ripple.className = "ripple-effect";
                        ripple.style.left = `${x}px`;
                        ripple.style.top = `${y}px`;

                        e.currentTarget.appendChild(ripple);

                        setTimeout(() => {
                          if (ripple && ripple.parentNode) {
                            ripple.remove();
                          }
                        }, 600);
                      }}
                    >
                      <Info size={16} /> Ver Requisitos
                    </button>
                    <Link
                      to="/login"
                      className="btn-inscribirme"
                      onClick={(e) => {
                        // Añadir efecto ripple al botón
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        const ripple = document.createElement("span");
                        ripple.className = "ripple-effect";
                        ripple.style.left = `${x}px`;
                        ripple.style.top = `${y}px`;

                        e.currentTarget.appendChild(ripple);

                        setTimeout(() => {
                          ripple.remove();
                        }, 600);
                      }}
                    >
                      <LogIn size={16} /> Inscribirme
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {modalEvento && (
        <ModalRequisitos
          evento={modalEvento}
          onClose={() => setModalEvento(null)}
        />
      )}
    </>
  );
};

export default EventosPublicos;
