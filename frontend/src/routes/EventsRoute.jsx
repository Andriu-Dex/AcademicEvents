import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

// Función para formatear fechas correctamente usando UTC
const formatearFechaUTC = (fechaStr) => {
  if (!fechaStr) return "-";
  try {
    // Primero aseguramos que la fecha esté en formato UTC para evitar ajustes de zona horaria
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

    if (isNaN(fecha.getTime())) return "-"; // Verifica si la fecha es válida

    return fecha.toLocaleString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "UTC", // Importante: usar UTC para evitar desplazamientos
    });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "-";
  }
};

const EventsRoute = () => {
  const { usuario, token, loading } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
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
  useEffect(() => {
    if (loading) return;
    if (!usuario) return navigate("/login");

    const obtenerEventos = async () => {
      try {
        // Primero obtenemos el perfil completo con información de carrera
        console.log("🔍 Obteniendo perfil de usuario...");
        const perfilRes = await axiosInstance.get("/perfil");
        const perfilCompleto = perfilRes.data;
        console.log("✅ Perfil obtenido:", perfilCompleto);

        // Luego obtenemos los eventos con un parámetro para evitar caché
        const timestamp = new Date().getTime();
        console.log("🔍 Obteniendo eventos...");
        const eventosRes = await axiosInstance.get(`/eventos?_t=${timestamp}`);

        // Verificar si hay discrepancias entre el cupo calculado y el almacenado
        console.log("Verificando cupos disponibles...");
        try {
          await axiosInstance.get("/eventos-verificar-cupos");
        } catch (verifyError) {
          console.warn("Error al verificar cupos:", verifyError);
          // Continuar con la carga normal aunque falle la verificación
        }

        // Volver a obtener eventos después de verificar cupos
        const eventosActualizadosRes = await axiosInstance.get(
          `/eventos?_t=${new Date().getTime()}`
        );
        setEventos(eventosActualizadosRes.data);

        // Actualizamos el contexto de usuario con la información completa
        if (perfilCompleto && perfilCompleto.carrera) {
          // Aquí deberíamos actualizar el contexto global, pero como no podemos,
          // usaremos el estado local para el filtrado
          setUsuarioConCarrera(perfilCompleto);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al obtener datos");
      }
    };

    obtenerEventos();
  }, [usuario, token, loading, navigate]);
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
  const eventosDisponibles = eventos.filter((evento) => {
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

    // Si el evento es de tipo PUBLICO, está disponible para todos
    if (evento.tip_eve === "PUBLICO") {
      return true;
    }

    // Si el evento no tiene carreras asociadas, significa que es un evento general
    if (evento.eventos_carrera.length === 0) {
      return true;
    }

    // Para estudiantes, filtrar por su carrera
    const usuarioFinal = usuarioConCarrera || usuario;
    if (usuarioFinal?.rol_usu === "ESTUDIANTE") {
      // Si el usuario tiene una carrera asignada
      if (usuarioFinal.carrera) {
        // Verificar si el evento está asociado a la carrera del usuario
        const tieneCarrera = evento.eventos_carrera.some(
          (ec) => ec.id_car_aso === usuarioFinal.carrera.id_car
        );
        return tieneCarrera;
      } else {
        return false;
      }
    }

    // Para administradores, docentes y coordinadores, mostrar todos los eventos
    const tieneRolPermitido = ["ADMIN", "DOCENTE", "COORDINADOR"].includes(
      usuarioFinal?.rol_usu
    );
    return tieneRolPermitido;
  });

  // Función para aplicar filtros
  const aplicarFiltros = (evento) => {
    // Convertir cupos a número para comparaciones
    const cuposDisponibles = parseInt(evento.cup_dis_eve) || 0;

    // CONTROL DE VISIBILIDAD POR CUPOS:
    const hayFiltrosActivos = Object.values(filtros).some((f) => f);

    if (hayFiltrosActivos) {
      // Si el filtro "completo" está activo, mostrar eventos con cupos === 0
      if (filtros.completo) {
        // No aplicar filtro adicional por cupos si está marcado
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

    // Filtro por precio
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

    return true;
  };

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
  };

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
          Mostrando {eventosDisponibles.filter(aplicarFiltros).length} de{" "}
          {eventosDisponibles.length} eventos
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
      {eventosDisponibles.length === 0 ? (
        <p className="text-gray-600">No hay eventos disponibles para ti.</p>
      ) : (
        <div className="eventos-grid-er">
          {eventosDisponibles.filter(aplicarFiltros).map((evento) => (
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
                Fecha: {formatearFechaUTC(evento.fec_ini_eve)} a{" "}
                {formatearFechaUTC(evento.fec_fin_eve)}
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
                <p className="publico">Dirigido a: {evento.publico_objetivo}</p>
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
                  evento.est_eve === "INACTIVO"
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
                  : "Inscribirme"}
              </button>
            </div>
          ))}
        </div>
      )}{" "}
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
