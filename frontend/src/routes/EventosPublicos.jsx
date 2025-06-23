import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import { useSocket } from "../context/SocketContext";
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
  AlertTriangle,
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
import GestorModales from "../models/GestorModales";
import usePagination from "../hooks/usePagination";
import PaginationControls from "../components/Pagination/PaginationControls";
import "./styles/EventosPublicos.css";
import "./styles/ModalEventosPublicos.css";
import "./styles/animaciones.css";
import "./styles/FiltrosEstado.css";
import "./styles/EventosPublicosPaginacion.css";

// Función para formatear fechas correctamente usando UTC
const formatearFechaUTC = (fechaStr) => {
  if (!fechaStr) return "-";
  try {
    const [datePart, timePart] = fechaStr.split("T");
    const [year, month, day] = datePart.split("-");
    const [hours, minutes] = timePart ? timePart.split(":") : ["00", "00"];

    const fecha = new Date(
      Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      )
    );
    if (isNaN(fecha.getTime())) return "-";

    return fecha.toLocaleString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "-";
  }
};

const EventosPublicos = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [modalEvento, setModalEvento] = useState(null);

  // Crear instancia del gestor de modales
  const gestorModales = useRef(new GestorModales(setModalEvento)).current;

  // Estados para filtros y búsqueda
  const [filtro, setFiltro] = useState("");

  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    software: false,
    industrial: false,
    publico: false,
    gratuito: false,
    pagado: false,
    completo: false,
    modalidad: "",
    finalizado: false,
    cancelado: false,
    suspendido: false,
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Implementación de paginación
  const {
    data: eventos,
    loading: cargando,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    fetchData,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination("/eventos-publicos", 12);

  // Efecto para cargar datos con paginación
  useEffect(() => {
    // Construir objeto de filtros para la API
    const filtrosAPI = {};

    if (filtros.software) filtrosAPI.software = true;
    if (filtros.industrial) filtrosAPI.industrial = true;
    if (filtros.publico) filtrosAPI.publico = true;
    if (filtros.gratuito) filtrosAPI.gratuito = true;
    if (filtros.pagado) filtrosAPI.pagado = true;
    if (filtros.completo) filtrosAPI.completo = true;
    if (filtros.modalidad) filtrosAPI.modalidad = filtros.modalidad;
    if (filtros.finalizado) filtrosAPI.finalizado = true;
    if (filtros.cancelado) filtrosAPI.cancelado = true;
    if (filtros.suspendido) filtrosAPI.suspendido = true;

    // Añadir filtro de búsqueda
    if (filtro.trim() !== "") {
      filtrosAPI.search = filtro;
    }

    // Llamar a fetchData con los filtros
    fetchData(filtrosAPI);
  }, [filtros, filtro, currentPage, fetchData]);

  // Función para aplicar filtros
  const aplicarFiltros = (evento) => {
    // Convertir cupos a número para comparaciones
    const cuposDisponibles = parseInt(evento.cup_dis_eve) || 0;

    // Si algún filtro de estado está activo, mostrar solo eventos con esos estados
    const filtrosEstadoActivos =
      filtros.finalizado || filtros.cancelado || filtros.suspendido;

    if (filtrosEstadoActivos) {
      let cumpleEstado = false;

      if (filtros.finalizado && evento.est_eve === "FINALIZADO") {
        cumpleEstado = true;
      }
      if (filtros.cancelado && evento.est_eve === "CANCELADO") {
        cumpleEstado = true;
      }
      if (filtros.suspendido && evento.est_eve === "SUSPENDIDO") {
        cumpleEstado = true;
      }

      // Si no cumple con ningún estado filtrado, no mostrar
      if (!cumpleEstado) {
        return false;
      }
    } else {
      // Por defecto, no mostrar eventos finalizados, cancelados, suspendidos
      if (
        evento.est_eve === "FINALIZADO" ||
        evento.est_eve === "CANCELADO" ||
        evento.est_eve === "SUSPENDIDO"
      ) {
        return false;
      }
    }

    // CONTROL DE VISIBILIDAD POR CUPOS:
    const hayFiltrosActivos = Object.values(filtros).some((f) => f);

    if (hayFiltrosActivos) {
      // Si el filtro "completo" está activo, mostrar solo eventos con cupos === 0
      if (filtros.completo) {
        if (cuposDisponibles !== 0) return false;
      } else {
        // Para todos los otros filtros, mostrar solo eventos con cupos > 0
        if (cuposDisponibles <= 0) return false;
      }
    } else {
      // Si no hay filtros activos, mostrar solo eventos con cupos > 0 (comportamiento por defecto)
      if (cuposDisponibles <= 0) return false;
    }

    // Filtro por nombre
    const coincideNombre = evento.nom_eve
      .toLowerCase()
      .includes(filtro.toLowerCase());

    if (!coincideNombre) return false;

    // Si no hay filtros específicos activos, mostrar todos los que pasaron el filtro de cupos
    if (!hayFiltrosActivos) return true;

    // Aplicar filtros específicos
    if (filtros.software) {
      const esSoftware = evento.eventos_carrera?.some(
        (ec) =>
          ec.carrera?.nom_car?.toLowerCase().includes("software") ||
          ec.carrera?.nom_car?.toLowerCase().includes("sistemas")
      );
      if (!esSoftware) return false;
    }

    if (filtros.industrial) {
      const esIndustrial = evento.eventos_carrera?.some((ec) =>
        ec.carrera?.nom_car?.toLowerCase().includes("industrial")
      );
      if (!esIndustrial) return false;
    }

    if (filtros.publico) {
      if (evento.tip_eve !== "PUBLICO") return false;
    }

    if (filtros.gratuito) {
      if (evento.val_eve !== 0) return false;
    }

    if (filtros.pagado) {
      if (evento.val_eve === 0) return false;
    }

    // Filtro por modalidad
    if (filtros.modalidad) {
      if (evento.mod_eve !== filtros.modalidad) return false;
    }

    // Nota: El filtro "completo" ya se manejó en el control de visibilidad por cupos arriba

    return true;
  };

  // Función para manejar cambios en filtros
  const manejarCambioFiltro = (tipoFiltro) => {
    setFiltros((prev) => ({
      ...prev,
      [tipoFiltro]: !prev[tipoFiltro],
    }));

    // Añadir efecto de filtrado al grid
    const eventosGrid = document.querySelector(".eventos-grid-ep");
    if (eventosGrid) {
      eventosGrid.classList.add("filtering");
      setTimeout(() => {
        eventosGrid.classList.remove("filtering");
      }, 300);
    }

    // Reiniciar a la primera página cuando cambian los filtros
    goToPage(1);
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
      modalidad: "", // Incluir modalidad
      finalizado: false,
      cancelado: false,
      suspendido: false,
    });

    // Reiniciar a la primera página cuando se limpian los filtros
    goToPage(1);
  };

  // Manejar actualizaciones de eventos en tiempo real
  const handleEventUpdate = useCallback(
    (eventUpdate) => {
      console.log(
        "🔄 EventosPublicos: Evento actualizado via socket:",
        eventUpdate
      );
      if (!eventUpdate || !eventUpdate.action || !eventUpdate.data) return;

      // Cuando se recibe una actualización de evento, recargar los datos
      // para mantener la consistencia con la paginación
      fetchData();

      // Mostrar notificación
      const { action, data } = eventUpdate;
      if (action === "created") {
        toast.info(`¡Nuevo evento disponible: ${data.nom_eve}!`);
      } else if (action === "updated") {
        toast.info(`El evento "${data.nom_eve}" ha sido actualizado.`);
      } else if (action === "deleted") {
        toast.info(`El evento "${data.nom_eve}" ha sido eliminado.`);
      }
    },
    [fetchData]
  );

  // Effect para manejar socket events de manera controlada
  useEffect(() => {
    if (!isConnected || !socket) return;

    // Listener para cambios de eventos
    socket.on("evento-change-hm", handleEventUpdate);

    // Socket listener for cupos changes
    const handleCuposChange = (data) => {
      if (
        !data ||
        typeof data.eventoId === "undefined" ||
        typeof data.cuposDisponibles === "undefined"
      ) {
        return;
      }

      console.log("🔄 EventosPublicos: Cupos actualizados via socket:", data);

      // Recargar los datos para mantener la consistencia con la paginación
      fetchData();
    };

    socket.on("cupos-change-hm", handleCuposChange);

    // Cleanup function
    return () => {
      socket.off("evento-change-hm", handleEventUpdate);
      socket.off("cupos-change-hm", handleCuposChange);
    };
  }, [isConnected, socket, handleEventUpdate, fetchData]);

  // Redirigir a usuarios autenticados a la vista de eventos para usuarios
  useEffect(() => {
    if (usuario) {
      navigate("/eventos");
    }
  }, [usuario, navigate]);
  if (cargando && currentPage === 1) {
    return (
      <>
        <Navbar />
        <div className="eventos-container-ep">
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
      <div className="eventos-container-ep">
        <h1 className="eventos-titulo">
          <CalendarDays size={24} />
          Eventos Públicos
        </h1>

        <div className="buscador-contenedor-ep">
          <div className="buscador-wrapper">
            <Search className="buscador-icono-ep" size={18} />{" "}
            <input
              type="text"
              placeholder="Buscar por nombre del evento..."
              value={filtro}
              onChange={(e) => {
                // Añadir clase de filtrado al grid
                const eventosGrid = document.querySelector(".eventos-grid-ep");
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
        <div
          className={`filtros-contenedor-ep${
            mostrarFiltros ? " filtros-abierto" : ""
          }`}
        >
          <div className="filtros-header-ep">
            <button
              className={`btn-toggle-filtros ${mostrarFiltros ? "activo" : ""}`}
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <Filter size={18} />
              Filtros
              <ChevronDown
                size={16}
                className={`chevron ${mostrarFiltros ? "rotado" : ""}`}
              />
            </button>

            {Object.values(filtros).some((f) => f) && (
              <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
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
                      onChange={() => manejarCambioFiltro("software")}
                    />
                    <span className="checkmark"></span>
                    Software/Sistemas
                  </label>
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.industrial}
                      onChange={() => manejarCambioFiltro("industrial")}
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
                      onChange={() => manejarCambioFiltro("publico")}
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
                      onChange={() => manejarCambioFiltro("gratuito")}
                    />
                    <span className="checkmark"></span>
                    Eventos Gratuitos
                  </label>
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.pagado}
                      onChange={() => manejarCambioFiltro("pagado")}
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
                      onChange={() => manejarCambioFiltro("completo")}
                    />
                    <span className="checkmark"></span>
                    Eventos Llenos (sin cupos)
                  </label>
                </div>
              </div>

              <div className="filtro-categoria">
                <h4>Por Estado</h4>
                <div className="filtros-opciones">
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.finalizado}
                      onChange={() => manejarCambioFiltro("finalizado")}
                    />
                    <span className="checkmark"></span>
                    Eventos Finalizados
                  </label>
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.cancelado}
                      onChange={() => manejarCambioFiltro("cancelado")}
                    />
                    <span className="checkmark"></span>
                    Eventos Cancelados
                  </label>
                  <label className="filtro-opcion">
                    <input
                      type="checkbox"
                      checked={filtros.suspendido}
                      onChange={() => manejarCambioFiltro("suspendido")}
                    />
                    <span className="checkmark"></span>
                    Eventos Suspendidos
                  </label>
                </div>
              </div>

              <div className="filtro-categoria">
                <h4>Por Modalidad</h4>
                <div className="filtros-opciones">
                  <select
                    value={filtros.modalidad}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        modalidad: e.target.value,
                      }))
                    }
                    className="modalidad-select"
                  >
                    <option value="">Todas</option>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="VIRTUAL">Virtual</option>
                    <option value="SEMIPRESENCIAL">Semipresencial</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        {eventos.length === 0 ? (
          <div className="eventos-vacios">
            <p>No hay eventos disponibles en este momento.</p>
            <Link to="/home" className="btn-volver">
              <Home size={18} />
              Volver al inicio
            </Link>
          </div>
        ) : eventos.filter(aplicarFiltros).length === 0 ? (
          <div className="eventos-vacios">
            <p>
              No se encontraron eventos que coincidan con los filtros
              seleccionados.
            </p>
            <button
              className="btn-volver"
              onClick={limpiarFiltros}
              style={{
                background: "#8a1538",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <X size={18} />
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Contador de resultados */}
            <div className="resultados-contador-epp">
              <p>
                Mostrando {eventos.length}{" "}
                {cargando && currentPage > 1 ? "(cargando...)" : ""} de{" "}
                {totalItems} eventos
                {Object.values(filtros).some((f) => f) && (
                  <span className="filtros-activos-badge-epp">
                    ({Object.values(filtros).filter((f) => f).length} filtro
                    {Object.values(filtros).filter((f) => f).length !== 1
                      ? "s"
                      : ""}{" "}
                    activo
                    {Object.values(filtros).filter((f) => f).length !== 1
                      ? "s"
                      : ""}
                    )
                  </span>
                )}
              </p>
            </div>

            <div className="eventos-grid-ep">
              {cargando && currentPage > 1 ? (
                // Mostrar indicador de carga cuando se navega entre páginas
                <div className="loading-overlay-epp">
                  <div className="spinner"></div>
                  <p>Cargando más eventos...</p>
                </div>
              ) : eventos.length === 0 ? (
                // Mostrar mensaje cuando no hay eventos
                <div className="no-eventos-mensaje-epp">
                  <AlertCircle size={36} />
                  <p>No se encontraron eventos con los filtros seleccionados</p>
                  <button onClick={limpiarFiltros} className="btn-limpiar-epp">
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                // Mostrar la lista de eventos
                eventos.map((evento, index) => (
                  <div
                    key={evento.id_eve}
                    className="evento-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {" "}
                    <div className="evento-portada-wrapper">
                      <img
                        src={
                          evento.img_por_eve ||
                          "https://i.imgur.com/c6Ry30Z.jpeg"
                        }
                        alt={`Portada de ${evento.nom_eve}`}
                        className="evento-portada"
                      />

                      {/* Indicador de estado para eventos filtrados */}
                      {evento.est_eve === "FINALIZADO" && (
                        <div className="evento-estado-badge-er evento-estado-finalizado-er">
                          <Clock size={14} />
                          Finalizado
                        </div>
                      )}

                      {evento.est_eve === "CANCELADO" && (
                        <div className="evento-estado-badge-er evento-estado-cancelado-er">
                          <AlertCircle size={14} />
                          Cancelado
                        </div>
                      )}

                      {evento.est_eve === "SUSPENDIDO" && (
                        <div className="evento-estado-badge-er evento-estado-suspendido-er">
                          <AlertTriangle size={14} />
                          Suspendido
                        </div>
                      )}

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
                    <div className="fechas-contenedor-ep">
                      <p className="fecha-inicio-ep">
                        <Calendar size={16} className="inline-icon-ep" />{" "}
                        Inicio: {formatearFechaUTC(evento.fec_ini_eve)}
                      </p>
                      <p className="fecha-fin-ep">
                        <Calendar size={16} className="inline-icon-ep" /> Fin:{" "}
                        {formatearFechaUTC(evento.fec_fin_eve)}
                      </p>
                    </div>{" "}
                    <p
                      className={
                        evento.cup_dis_eve === 0
                          ? "cupos-agotados"
                          : "cupos-disponibles"
                      }
                    >
                      {evento.cup_dis_eve === 0 ? (
                        <>
                          <AlertCircle size={16} className="inline-icon-ep" />{" "}
                          Sin cupos disponibles
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="inline-icon-ep" />{" "}
                          Cupos disponibles: {evento.cup_dis_eve || 0}
                        </>
                      )}
                    </p>{" "}
                    <p className="modalidad-evento-ep">
                      {evento.mod_eve === "PRESENCIAL" && (
                        <>
                          <MapPin size={16} className="inline-icon-ep" />{" "}
                          Modalidad: Presencial
                        </>
                      )}
                      {evento.mod_eve === "VIRTUAL" && (
                        <>
                          <Monitor size={16} className="inline-icon-ep" />{" "}
                          Modalidad: Virtual
                        </>
                      )}
                      {evento.mod_eve === "SEMIPRESENCIAL" && (
                        <>
                          <Laptop size={16} className="inline-icon-ep" />{" "}
                          Modalidad: Semipresencial
                        </>
                      )}
                      {!evento.mod_eve && (
                        <>
                          <Users size={16} className="inline-icon-ep" />{" "}
                          Modalidad: No especificada
                        </>
                      )}
                    </p>
                    <div className="evento-footer-ep">
                      {" "}
                      <div
                        className={`estado-evento-ep ${evento.est_eve?.toLowerCase()}`}
                      >
                        {evento.est_eve === "ACTIVO" ? (
                          <>
                            <Zap size={14} className="inline-icon-ep" /> ACTIVO
                          </>
                        ) : (
                          <>
                            <Pause size={14} className="inline-icon-ep" />{" "}
                            INACTIVO
                          </>
                        )}
                      </div>{" "}
                      <button
                        className="btn-requisitos-ep"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          gestorModales.abrirModal(evento);
                        }}
                      >
                        <Info size={16} /> Ver Requisitos
                      </button>
                      <Link to="/login" className="btn-inscribirme-ep">
                        <LogIn size={16} /> Inscribirme
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="pagination-controls-wrapper-epp">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  hasNextPage={hasNextPage}
                  hasPrevPage={hasPrevPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  loading={cargando}
                  className="variant-public"
                  showInfo={true}
                />
              </div>
            )}
          </>
        )}
      </div>
      {modalEvento && (
        <ModalRequisitos
          evento={modalEvento}
          onClose={() => gestorModales.cerrarModal()}
          overlayClassName="modal-requisitos-overlay-ep"
        />
      )}
    </>
  );
};

export default EventosPublicos;
