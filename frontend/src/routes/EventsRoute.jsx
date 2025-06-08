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
} from "lucide-react";
import "./styles/EventsRoute.css";

// Función para formatear fechas correctamente usando UTC
const formatearFechaUTC = (fechaStr) => {
  if (!fechaStr) return "-";
  try {
    // Primero aseguramos que la fecha esté en formato UTC para evitar ajustes de zona horaria
    const fechaParts = fechaStr.split("T")[0].split("-");
    const year = parseInt(fechaParts[0]);
    const month = parseInt(fechaParts[1]) - 1; // En JS, los meses van de 0 a 11
    const day = parseInt(fechaParts[2]);

    const fecha = new Date(Date.UTC(year, month, day));

    if (isNaN(fecha.getTime())) return "-"; // Verifica si la fecha es válida

    return fecha.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [cartaMotivacion, setCartaMotivacion] = useState("");
  const [inscripciones, setInscripciones] = useState([]);
  const [inscripcionesRechazadas, setInscripcionesRechazadas] = useState([]);
  const [eventosAprobados, setEventosAprobados] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [exitoVisible, setExitoVisible] = useState(false);
  const [usuarioConCarrera, setUsuarioConCarrera] = useState(null);
  useEffect(() => {
    if (loading) return;
    if (!usuario) return navigate("/login");

    const obtenerEventos = async () => {
      try {
        // Primero obtenemos el perfil completo con información de carrera
        const perfilRes = await axiosInstance.get("/perfil");
        const perfilCompleto = perfilRes.data;

        // Luego obtenemos los eventos
        const eventosRes = await axiosInstance.get("/eventos");
        setEventos(eventosRes.data);

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

  if (loading) return <p className="p-6">Cargando sesión...</p>;

  return (
    <div className="eventos-container">
      <h1 className="eventos-titulo">
        <CalendarDays size={24} />
        Eventos disponibles
      </h1>
      <div className="buscador-contenedor-er">
        <Search className="buscador-icono-er" size={18} />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="eventos-buscador"
        />
      </div>
      {eventosDisponibles.length === 0 ? (
        <p className="text-gray-600">No hay eventos disponibles para ti.</p>
      ) : (
        <div className="eventos-grid">
          {eventosDisponibles
            .filter((ev) =>
              ev.nom_eve.toLowerCase().includes(filtro.toLowerCase())
            )
            .map((evento) => (
              <div key={evento.id_eve} className="evento-card">
                {/* Imagen de portada (real o placeholder) */}
                <img
                  src={evento.img_por_eve || "https://i.imgur.com/c6Ry30Z.jpeg"}
                  alt={`Portada de ${evento.nom_eve}`}
                  className="evento-portada"
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0",
                    marginBottom: "0.5rem",
                  }}
                />{" "}
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
                    evento.cup_dis_eve === 0
                  }
                >
                  {eventosAprobados && eventosAprobados.includes(evento.id_eve)
                    ? "Evento aprobado"
                    : inscripciones.includes(evento.id_eve)
                    ? "Ya inscrito"
                    : evento.cup_dis_eve === 0
                    ? "Sin cupos"
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
