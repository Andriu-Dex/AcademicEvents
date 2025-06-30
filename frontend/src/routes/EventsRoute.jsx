import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSocket } from "../context/SocketContext";
import usePagination from "../hooks/usePagination";
import PaginationControls from "../components/Pagination/PaginationControls";
import {
  CalendarDays,
  Search,
  CheckCircle,
  MapPin,
  Monitor,
  Laptop,
  Filter,
  ChevronDown,
  X,
  Clock,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import "./styles/EventsRoute.css";
import "./styles/FiltrosEstado.css";

// Estilos adicionales para paginación
const estilosCss = `
/* Estilos para el estado de carga mientras se navega entre páginas */
.loading-overlay-er {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.no-eventos-mensaje-er {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.no-eventos-mensaje-er svg {
  color: #1e40af;
  margin-bottom: 1rem;
}

.no-eventos-mensaje-er p {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.no-eventos-mensaje-er .btn-limpiar-er {
  padding: 0.75rem 1.5rem;
  background-color: #1e40af;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.no-eventos-mensaje-er .btn-limpiar-er:hover {
  background-color: #1c366b;
}

/* Estilo para la sección de paginación */
.pagination-controls-pc {
  margin: 2rem 0;
}
`;

import { formatUTCForLocalDisplay } from "../utils/dateUtils";

const EventsRoute = () => {
  const { usuario, token, loading } = useAuth();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [filtro, setFiltro] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("");
  const [filtros, setFiltros] = useState({
    gratuito: false,
    pagado: false,
    completo: false,
    modalidad: "",
    finalizado: false,
    cancelado: false,
    suspendido: false,
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [cartaMotivacion, setCartaMotivacion] = useState("");
  const [inscripciones, setInscripciones] = useState([]);
  const [inscripcionesRechazadas, setInscripcionesRechazadas] = useState([]);
  const [eventosAprobados, setEventosAprobados] = useState([]);
  const [eventosReprobados, setEventosReprobados] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [exitoVisible, setExitoVisible] = useState(false);
  const [usuarioConCarrera, setUsuarioConCarrera] = useState(null);

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
  } = usePagination("/eventos-paginados", 12);
  useEffect(() => {
    if (loading) return;
    if (!usuario) return navigate("/login");

    const obtenerPerfilUsuario = async () => {
      try {
        // Obtener el perfil completo con información de carrera
        console.log("🔍 Obteniendo perfil de usuario...");
        const perfilRes = await axiosInstance.get("/perfil");
        const perfilCompleto = perfilRes.data;
        console.log("✅ Perfil obtenido:", perfilCompleto);

        // Verificar cupos disponibles
        console.log("Verificando cupos disponibles...");
        try {
          await axiosInstance.get("/eventos-verificar-cupos");
        } catch (verifyError) {
          console.warn("Error al verificar cupos:", verifyError);
          // Continuar con la carga normal aunque falle la verificación
        }

        // Actualizar el contexto de usuario con la información completa
        if (perfilCompleto && perfilCompleto.carrera) {
          setUsuarioConCarrera(perfilCompleto);
        }
      } catch (error) {
        console.error("Error al obtener perfil:", error);
        toast.error("Error al obtener datos de perfil");
      }
    };

    obtenerPerfilUsuario();
  }, [usuario, token, loading, navigate]);

  // Función para construir filtros API de forma consistente
  const construirFiltrosAPI = useCallback(() => {
    const filtrosAPI = {};

    if (filtros.gratuito) filtrosAPI.gratuito = true;
    if (filtros.pagado) filtrosAPI.pagado = true;
    if (filtros.completo) filtrosAPI.completo = true;
    if (filtros.modalidad || filtroModalidad)
      filtrosAPI.modalidad = filtros.modalidad || filtroModalidad;
    if (filtros.finalizado) filtrosAPI.finalizado = true;
    if (filtros.cancelado) filtrosAPI.cancelado = true;
    if (filtros.suspendido) filtrosAPI.suspendido = true;

    // Añadir filtro de búsqueda
    if (filtro.trim() !== "") {
      filtrosAPI.search = filtro;
    }

    // NO enviar automáticamente la carrera del usuario
    // El backend determina qué eventos mostrar basado en el token/rol del usuario

    return filtrosAPI;
  }, [filtros, filtroModalidad, filtro]);

  // Efecto para cargar datos con paginación
  useEffect(() => {
    if (loading || !usuario) return;

    // Construir objeto de filtros para la API usando la función centralizada
    const filtrosAPI = construirFiltrosAPI();

    // 🐛 DEBUG: Log de filtros que se envían al backend
    console.log("🔍 [FRONTEND] Filtros enviados al backend:", filtrosAPI);

    // Llamar a fetchData con los filtros
    fetchData(filtrosAPI);
  }, [
    filtros,
    filtro,
    filtroModalidad,
    currentPage,
    fetchData,
    loading,
    usuario,
    construirFiltrosAPI,
  ]);
  useEffect(() => {
    const obtenerInscripciones = async () => {
      try {
        // Primero obtenemos las inscripciones propias del usuario
        const insRes = await axiosInstance.get("/inscripciones/propias");

        // Filtramos sólo las inscripciones activas (PENDIENTES, ACEPTADAS o APROBADO)
        const inscripcionesActivas = insRes.data.filter(
          (ins) =>
            ins.est_ins === "PENDIENTE" ||
            ins.est_ins === "ACEPTADA" ||
            ins.est_ins === "APROBADO"
        );

        // Extraemos los ids de los eventos en los que el usuario está inscrito activamente
        const eventosInscritos = inscripcionesActivas.map(
          (ins) => ins.evento.id_eve
        );

        // Obtener eventos aprobados
        const eventosAprobados = insRes.data
          .filter((ins) => ins.est_ins === "APROBADO")
          .map((ins) => ins.evento.id_eve);

        // Guardar los eventos aprobados en el estado
        setEventosAprobados(eventosAprobados);

        // Obtener eventos reprobados (por nota, asistencia o total)
        const eventosReprobados = insRes.data
          .filter(
            (ins) =>
              ins.est_ins === "REPROBADO_NOTA" ||
              ins.est_ins === "REPROBADO_ASISTENCIA" ||
              ins.est_ins === "REPROBADO_TOTAL"
          )
          .map((ins) => ins.evento.id_eve);

        // Guardar los eventos reprobados en el estado
        setEventosReprobados(eventosReprobados);

        // Identificamos las inscripciones rechazadas para mostrar un mensaje especial
        const rechazadas = insRes.data.filter(
          (ins) => ins.est_ins === "RECHAZADA"
        );

        // Almacenar los IDs de eventos con inscripciones rechazadas
        const eventosRechazados = rechazadas.map((ins) => ins.evento.id_eve);
        setInscripcionesRechazadas(eventosRechazados);

        if (rechazadas.length > 0) {
          // Informar al usuario que puede volver a inscribirse
          rechazadas.forEach((ins) => {
            toast.info(
              `Tu inscripción a "${ins.evento.nom_eve}" fue rechazada. Puedes volver a inscribirte.`,
              {
                autoClose: 8000,
                toastId: `rechazada-${ins.id_ins}`, // Evita duplicados
              }
            );
          });
        }

        setInscripciones(eventosInscritos);
      } catch (error) {
        console.error("Error al obtener inscripciones:", error);
        toast.error("Error al verificar tus inscripciones");
      }
    };

    if (usuario) obtenerInscripciones();
  }, [usuario, eventos.length]);
  const inscribirse = async () => {
    // Validación de campos
    if (!cartaMotivacion.trim()) {
      return toast.error("Debes escribir una carta de motivación");
    }

    // ✅ VALIDACIÓN DE CUPOS DISPONIBLES
    if (eventoSeleccionado.cup_dis_eve <= 0) {
      return toast.error("No hay cupos disponibles para este evento");
    }

    // Solo validar archivo para eventos con costo o si se subió un archivo para eventos gratuitos
    if (eventoSeleccionado.val_eve > 0 && !archivo) {
      return toast.error("Debes subir un comprobante de pago");
    }

    if (archivo) {
      // Validar tamaño del archivo
      if (archivo.size > 5 * 1024 * 1024) {
        return toast.error("El archivo no debe superar los 5MB");
      }

      // Validar tipo de archivo (sólo imágenes para Imgur)
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];

      if (!tiposPermitidos.includes(archivo.type)) {
        return toast.error(
          "Tipo de archivo no permitido. Solo imágenes JPG o PNG"
        );
      }
    }

    setSubiendo(true);

    const formData = new FormData();
    // Ya no usamos id_usu, ahora el backend obtiene el ID del token
    formData.append("id_eve", eventoSeleccionado.id_eve);
    formData.append("carta_motivacion", cartaMotivacion);
    if (archivo) {
      formData.append("archivo", archivo);
    }

    console.log("Enviando solicitud de inscripción...");
    console.log(`ID evento: ${eventoSeleccionado.id_eve}`);
    console.log(`Archivo: ${archivo ? archivo.name : "Ninguno"}`);

    try {
      const response = await axiosInstance.post("/inscripciones", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Respuesta del servidor:", response.data);

      // Verificar que la respuesta fue exitosa
      if (response.status === 200 || response.status === 201) {
        toast.success("Inscripción enviada con éxito");

        // Actualizar inmediatamente la lista de inscripciones para deshabilitar el botón
        setInscripciones((prevInscripciones) => [
          ...prevInscripciones,
          eventoSeleccionado.id_eve,
        ]);

        // Si era una reinscripción, eliminarla de las rechazadas
        if (eventoSeleccionado.reinscripcion) {
          setInscripcionesRechazadas((prev) =>
            prev.filter((id) => id !== eventoSeleccionado.id_eve)
          );
        }

        // Refrescar la lista de eventos para actualizar los cupos disponibles
        try {
          const eventosRes = await axiosInstance.get("/eventos");
          setEventos(eventosRes.data);
        } catch (error) {
          console.error("Error al actualizar eventos:", error);
        }

        setEventoSeleccionado(null);
        setArchivo(null);
        setCartaMotivacion("");
        setExitoVisible(true);
        setTimeout(() => setExitoVisible(false), 2000);
      }
    } catch (error) {
      console.error("Error al inscribirse:", error);

      // Información adicional para depuración
      if (error.response) {
        console.error("Respuesta de error del servidor:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      // Mostrar mensaje detallado del backend si existe
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error("Error al inscribirse al evento");
      }
    } finally {
      setSubiendo(false);
    }
  };
  // Los eventos ya vienen filtrados del backend según el rol y permisos del usuario
  // No necesitamos filtrado adicional en el frontend

  // Función para manejar cambios en filtros
  const manejarCambioFiltro = (tipoFiltro) => {
    setFiltros((prev) => ({
      ...prev,
      [tipoFiltro]: !prev[tipoFiltro],
    }));

    // Añadir efecto de filtrado al grid
    const eventosGrid = document.querySelector(".eventos-grid-er");
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
      gratuito: false,
      pagado: false,
      completo: false,
      modalidad: "",
      finalizado: false,
      cancelado: false,
      suspendido: false,
    });
    setFiltro("");

    // Reiniciar a la primera página cuando se limpian los filtros
    goToPage(1);
  };

  // Manejar actualizaciones de eventos en tiempo real
  const handleEventUpdate = useCallback(
    (eventUpdate) => {
      console.log("🔄 Evento actualizado via socket:", eventUpdate);
      if (!eventUpdate || !eventUpdate.action || !eventUpdate.data) return;

      // 🔧 USAR FUNCIÓN CENTRALIZADA PARA CONSTRUIR FILTROS
      const filtrosAPI = construirFiltrosAPI();

      // Recargar datos con los filtros aplicados
      console.log("🔄 Recargando datos con filtros:", filtrosAPI);
      fetchData(filtrosAPI);

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
    [fetchData, construirFiltrosAPI]
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

      console.log("🔄 EventsRoute: Cupos actualizados via socket:", data);

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

  if (loading) return <p className="p-6">Cargando sesión...</p>;

  return (
    <div className="eventos-container-er">
      <h1 className="eventos-titulo">
        <CalendarDays size={24} />
        Eventos disponibles
      </h1>
      <div className="buscador-contenedor-er">
        <div className="buscador-wrapper-er">
          <Search className="buscador-icono-er" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre del evento..."
            value={filtro}
            onChange={(e) => {
              const eventosGrid = document.querySelector(".eventos-grid-er");
              if (eventosGrid) {
                eventosGrid.classList.add("filtering");
                setTimeout(() => {
                  eventosGrid.classList.remove("filtering");
                }, 300);
              }
              setFiltro(e.target.value);
              // Reiniciar a la primera página cuando se realiza una búsqueda
              goToPage(1);
            }}
            className="eventos-buscador-er"
          />
          {filtro && (
            <button
              onClick={() => {
                setFiltro("");
                const eventosGrid = document.querySelector(".eventos-grid-er");
                if (eventosGrid) {
                  eventosGrid.classList.add("filtering");
                  setTimeout(() => {
                    eventosGrid.classList.remove("filtering");
                  }, 300);
                }
                // Reiniciar a la primera página cuando se limpia la búsqueda
                goToPage(1);
              }}
              className="limpiar-buscador-er"
              title="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      {/* Barra de filtros */}
      <div
        className={`filtros-contenedor-er${
          mostrarFiltros ? " filtros-abierto" : ""
        }`}
      >
        <div className="filtros-header-er">
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
      {/* Contador de resultados */}
      <div className="resultados-contador-er">
        <p>
          Mostrando {eventos.length}{" "}
          {cargando && currentPage > 1 ? "(cargando...)" : ""} de {totalItems}{" "}
          eventos
          {Object.values(filtros).some((f) => f) && (
            <span className="filtros-activos-badge-er">
              ({Object.values(filtros).filter((f) => f).length} filtro
              {Object.values(filtros).filter((f) => f).length !== 1
                ? "s"
                : ""}{" "}
              activo
              {Object.values(filtros).filter((f) => f).length !== 1 ? "s" : ""})
            </span>
          )}
        </p>
      </div>
      {cargando ? (
        <div className="loading-overlay-er">
          <p>Cargando eventos...</p>
        </div>
      ) : error ? (
        <div className="no-eventos-mensaje-er">
          <AlertCircle size={40} />
          <h3>Error al cargar eventos</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="btn-limpiar-er">
            Reintentar
          </button>
        </div>
      ) : eventos.length === 0 ? (
        <div className="no-eventos-mensaje-er">
          <AlertTriangle size={40} />
          <h3>No hay eventos disponibles</h3>
          <p>No se encontraron eventos para tu perfil de usuario.</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="no-eventos-mensaje-er">
          <AlertTriangle size={40} />
          <h3>No hay eventos que coincidan</h3>
          <p>
            No se encontraron eventos que coincidan con los criterios de
            búsqueda.
          </p>
          {(filtro || Object.values(filtros).some((f) => f)) && (
            <button onClick={limpiarFiltros} className="btn-limpiar-er">
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="eventos-grid-er">
            {eventos.map((evento) => (
              <div key={evento.id_eve} className="evento-card">
                {/* Imagen de portada (real o placeholder) */}
                <img
                  src={evento.img_por_eve || "https://i.imgur.com/c6Ry30Z.jpeg"}
                  alt={`Portada de ${evento.nom_eve}`}
                  className="evento-portada-er"
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0",
                    marginBottom: "0.5rem",
                  }}
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
                <h2 className="nombre-evento-er">{evento.nom_eve}</h2>
                <p className="tipo">{evento.tip_eve}</p>
                {/* Precio del evento */}
                <p className="precio-evento">
                  {evento.val_eve === 0
                    ? "Gratuito"
                    : `Precio: $${evento.val_eve.toFixed(2)}`}
                </p>
                {/* Descripción del evento */}
                {evento.des_eve && (
                  <div className="descripcion-evento">
                    <p>
                      {evento.des_eve.length > 150
                        ? `${evento.des_eve.substring(0, 150)}...`
                        : evento.des_eve}
                    </p>
                  </div>
                )}{" "}
                <p className="fecha-evento-er">
                  Fecha: {formatUTCForLocalDisplay(evento.fec_ini_eve)} a{" "}
                  {formatUTCForLocalDisplay(evento.fec_fin_eve)}
                </p>{" "}
                <p className="duracion-evento-er">
                  Duración: {evento.dur_hor_eve} horas
                </p>
                {/* Cupos disponibles */}
                <p
                  className={
                    evento.cup_dis_eve === 0
                      ? "cupos-agotados"
                      : "cupos-disponibles"
                  }
                >
                  {evento.cup_dis_eve === 0
                    ? "🚫 Sin cupos disponibles"
                    : `Cupos disponibles: ${evento.cup_dis_eve || 0}`}
                </p>
                {/* Modalidad con ícono */}
                {evento.mod_eve && (
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
                  </p>
                )}
                {/* Público objetivo si existe */}
                {evento.publico_objetivo && (
                  <p className="publico">
                    Dirigido a: {evento.publico_objetivo}
                  </p>
                )}{" "}
                {evento.pagado_eve && <p className="pago">Pagado</p>}{" "}
                <button
                  onClick={() => {
                    // Para reinscripción, marcamos como tal
                    if (
                      inscripcionesRechazadas &&
                      inscripcionesRechazadas.includes(evento.id_eve)
                    ) {
                      const eventoConMarca = { ...evento, reinscripcion: true };
                      setEventoSeleccionado(eventoConMarca);
                    } else {
                      setEventoSeleccionado(evento);
                    }
                  }}
                  className="btn-inscribirme"
                  disabled={
                    inscripciones.includes(evento.id_eve) ||
                    (eventosAprobados &&
                      eventosAprobados.includes(evento.id_eve)) ||
                    (eventosReprobados &&
                      eventosReprobados.includes(evento.id_eve)) ||
                    evento.cup_dis_eve === 0 ||
                    evento.est_eve === "INACTIVO" ||
                    evento.est_eve === "FINALIZADO" ||
                    evento.est_eve === "SUSPENDIDO" ||
                    evento.est_eve === "CANCELADO"
                  }
                >
                  {eventosAprobados && eventosAprobados.includes(evento.id_eve)
                    ? "Evento aprobado"
                    : eventosReprobados &&
                      eventosReprobados.includes(evento.id_eve)
                    ? "Evento reprobado"
                    : inscripciones.includes(evento.id_eve)
                    ? "Ya inscrito"
                    : evento.cup_dis_eve === 0
                    ? "Sin cupos"
                    : evento.est_eve === "INACTIVO"
                    ? "Evento inactivo"
                    : evento.est_eve === "FINALIZADO"
                    ? "Evento finalizado"
                    : evento.est_eve === "SUSPENDIDO"
                    ? "Evento suspendido"
                    : evento.est_eve === "CANCELADO"
                    ? "Evento cancelado"
                    : "Inscribirme"}
                </button>
              </div>
            ))}
          </div>

          {/* Controles de paginación */}
          {totalItems > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}

      {eventoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Inscripción a: {eventoSeleccionado.nom_eve}</h2>

            {/* Mensaje adicional para reinscripciones */}
            {eventoSeleccionado.reinscripcion && (
              <div className="reinscripcion-info">
                <p>
                  Tu inscripción anterior fue rechazada. Puedes volver a enviar
                  tu información.
                </p>
                <p>Asegúrate de revisar las observaciones del administrador.</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Carta de motivación:</label>
              <textarea
                value={cartaMotivacion}
                onChange={(e) => setCartaMotivacion(e.target.value)}
                placeholder="Escribe aquí por qué quieres participar en este evento..."
                className="form-textarea"
                required
              />
            </div>

            {eventoSeleccionado.val_eve > 0 && (
              <div className="form-group">
                <label className="form-label">Comprobante de pago:</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  className="form-input-file"
                />
                <span className="form-help-text">
                  Formatos aceptados: JPG, JPEG, PNG (máx. 5MB)
                </span>
              </div>
            )}

            {archivo && (
              <div className="file-preview">
                <span className="file-preview-name">{archivo.name}</span>
                <span className="file-preview-type">({archivo.type})</span>
              </div>
            )}

            <div className="modal-botones">
              <button
                onClick={() => {
                  setEventoSeleccionado(null);
                  setArchivo(null);
                  setCartaMotivacion("");
                }}
                className="btn-cancelar-modal"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  // Validación personalizada según costo del evento
                  if (eventoSeleccionado.val_eve > 0 && !archivo) {
                    toast.warning(
                      "Por favor selecciona un comprobante de pago antes de continuar"
                    );
                    return;
                  }
                  if (!cartaMotivacion.trim()) {
                    toast.warning(
                      "Por favor escribe una carta de motivación antes de continuar"
                    );
                    return;
                  }
                  inscribirse();
                }}
                className="btn-inscribirme-modal"
                disabled={subiendo}
              >
                {subiendo ? "Enviando..." : "Enviar inscripción"}
              </button>
            </div>
          </div>
        </div>
      )}
      {exitoVisible && (
        <div className="exito-animacion">
          <CheckCircle size={64} color="#16a34a" />
          <p>¡Inscripción enviada!</p>
        </div>
      )}
    </div>
  );
};

export default EventsRoute;
