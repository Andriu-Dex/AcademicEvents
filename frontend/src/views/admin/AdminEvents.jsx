import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Eye,
  Trash2,
  CalendarClock,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BookOpen,
  GraduationCap,
  Target,
  Users,
  FileText,
  Tag,
  Plus,
  Star,
  UserCheck,
  MapPin,
  Monitor,
  Laptop,
} from "lucide-react";
import "./styles/AdminEvents.css";

const getEstadoEventoUI = (estado) => {
  switch (estado) {
    case "ACTIVO":
      return {
        icon: <CheckCircle size={16} />,
        text: "Activo",
        cssClass: "estado-activo-ae"
      };
    case "INACTIVO":
      return {
        icon: <XCircle size={16} />,
        text: "Inactivo",
        cssClass: "estado-inactivo-ae"
      };
    case "FINALIZADO":
      return {
        icon: <XCircle size={16} />,
        text: "Finalizado",
        cssClass: "estado-finalizado-ae"
      };
    case "CANCELADO":
      return {
        icon: <XCircle size={16} />,
        text: "Cancelado",
        cssClass: "estado-cancelado-ae"
      };
    case "SUSPENDIDO":
      return {
        icon: <XCircle size={16} />,
        text: "Suspendido",
        cssClass: "estado-suspendido-ae"
      };
    default:
      return {
        icon: <XCircle size={16} />,
        text: "Desconocido",
        cssClass: "estado-default-ae"
      };
  }
};

// Función para obtener icono según tipo de evento
const getTipoEventoIcon = (tipo) => {
  switch (tipo) {
    case "CURSO":
      return <GraduationCap size={18} />;
    case "CONGRESO":
      return <Users size={18} />;
    case "WEBINAR":
      return <BookOpen size={18} />;
    case "CHARLA":
      return <FileText size={18} />;
    case "SOCIALIZACION":
      return <Users size={18} />;
    case "PUBLICO":
      return <Target size={18} />;
    default:
      return <Tag size={18} />;
  }
};

// Función para obtener el estilo y clase CSS de la modalidad del evento
const getModalidadUI = (modalidad) => {
  switch (modalidad) {
    case "PRESENCIAL":
      return {
        icon: <MapPin size={16} />,
        text: "Presencial",
        cssClass: "modalidad-presencial-ae"
      };
    case "VIRTUAL":
      return {
        icon: <Monitor size={16} />,
        text: "Virtual",
        cssClass: "modalidad-virtual-ae"
      };
    case "SEMIPRESENCIAL":
      return {
        icon: <Laptop size={16} />,
        text: "Semipresencial",
        cssClass: "modalidad-semipresencial-ae"
      };
    default:
      return {
        icon: <Users size={16} />,
        text: "No especificada",
        cssClass: "modalidad-default-ae"
      };
  }
};

const AdminEvents = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Fecha actual para calcular estados de eventos
  const fechaActual = new Date();

  // Usar axiosInstance para la API con interceptores de token
  const cargarEventos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/eventos");
      console.log("Eventos cargados:", res.data);
      setEventos(res.data);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      toast.error("No se pudieron cargar los eventos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // Eliminar evento con confirmación y alertas
  const eliminarEvento = async (eventoId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este evento?"))
      return;
    try {
      await axiosInstance.delete(`/eventos/${eventoId}`);
      toast.success("Evento eliminado correctamente");
      cargarEventos();
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      toast.error(error.response?.data?.msg || "No se pudo eliminar el evento");
    }
  }; // Formato de fecha personalizado
  const formatearFecha = (fechaStr) => {
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

  // Función para obtener la fecha de fin apropiada según el tipo de evento
  const obtenerFechaFin = (evento) => {
    const esCurso = evento.tip_eve === "CURSO";

    // Para cursos, usar fecha específica de fin de curso
    if (esCurso && evento.fec_fin_eve) {
      return formatearFecha(evento.fec_fin_eve); // Utiliza fec_fin_eve del evento directamente
    }

    // Para eventos no-curso, verificar si hay fecha de fin explícita
    if (evento.fec_fin_eve) {
      return formatearFecha(evento.fec_fin_eve);
    }

    // Si no hay fecha de fin, pero hay fecha de inicio y duración
    if (evento.fec_ini_eve && evento.dur_hrs_eve) {
      const fechaInicio = new Date(evento.fec_ini_eve);
      if (!isNaN(fechaInicio.getTime())) {
        // Eventos cortos (menos de 24h) terminan el mismo día
        if (evento.dur_hrs_eve <= 24) {
          return formatearFecha(fechaInicio);
        }

        // Eventos largos, calcular días (asumiendo 8h por día)
        const diasAdicionales = Math.ceil(evento.dur_hrs_eve / 8);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + diasAdicionales - 1);
        return formatearFecha(fechaFin);
      }
    }

    // Si todo falla, mostrar la misma fecha de inicio
    return formatearFecha(evento.fec_ini_eve);
  };

  // Determinar si un evento está finalizado basado en su fecha de fin
  const esEventoFinalizado = (evento) => {
    const esCurso = evento.tip_eve === "CURSO";

    if (esCurso && evento.eventos_curso?.fec_fin_cur) {
      return new Date(evento.eventos_curso.fec_fin_cur) < fechaActual;
    } else if (evento.fec_fin_eve) {
      return new Date(evento.fec_fin_eve) < fechaActual;
    }

    return evento.est_eve === "FINALIZADO" || evento.est_eve === "CANCELADO";
  };

  const handleCrearEvento = () => {
    navigate("/admin/eventos/crear");
  };

  const handleEditEvent = (eventoId) => {
    navigate(`/admin/eventos/editar/${eventoId}`);
  };

  return (
    <div className="admin-events-container">
      <div className="admin-events-header">
        <h2 className="admin-events-title">Gestión de Eventos</h2>
        <button className="admin-events-create-btn" onClick={handleCrearEvento}>
          <Plus size={16} />
          Crear nuevo evento
        </button>
      </div>

      {loading ? (
        <div className="admin-events-loading">
          <div className="spinner"></div>
          <p>Cargando eventos...</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="admin-events-empty">
          <CalendarClock size={48} className="text-muted" />
          <p>No hay eventos creados aún.</p>
          <button
            className="admin-events-create-btn"
            onClick={handleCrearEvento}
          >
            <Plus size={16} />
            Crear mi primer evento
          </button>
        </div>
      ) : (
        <div className="admin-events-grid">
          {eventos.map((eve) => {
            const esCurso = eve.tip_eve === "CURSO";
            const estadoEvento = esEventoFinalizado(eve)
              ? "FINALIZADO"
              : eve.est_eve;
            const estadoUI = getEstadoEventoUI(estadoEvento);
            const modalidadUI = getModalidadUI(eve.mod_eve);

            return (
              <div key={eve.id_eve} className="admin-event-card">
                {/* Imagen de portada */}
                {eve.img_por_eve && (
                  <div className="admin-event-image">
                    <img src={eve.img_por_eve} alt={eve.nom_eve} />
                  </div>
                )}

                <div className="admin-event-header">
                  <h3 className="admin-event-name">{eve.nom_eve}</h3>
                  <span
                    className={`admin-event-label ${eve.val_eve === 0 ? "valor-gratuito-ae" : "valor-pago-ae"}`}
                  >
                    {eve.val_eve === 0
                      ? "Gratuito"
                      : `$${eve.val_eve.toFixed(2)}`}
                  </span>
                </div>

                <div className="admin-event-type-badge">
                  {getTipoEventoIcon(eve.tip_eve)}
                  {eve.tip_eve}
                </div>

                {/* Descripción del evento */}
                {eve.des_eve && (
                  <div className="admin-event-description">
                    <p>
                      {eve.des_eve.length > 100
                        ? `${eve.des_eve.substring(0, 100)}...`
                        : eve.des_eve}
                    </p>
                  </div>
                )}

                <div className="admin-event-details">
                  {" "}
                  <div className="detail-item">
                    <CalendarClock size={16} className="icon-inline" />
                    <span>
                      {formatearFecha(eve.fec_ini_eve)}
                      {" – "}
                      {obtenerFechaFin(eve)}
                    </span>
                  </div>{" "}
                  <div className="detail-item">
                    <Clock size={16} className="icon-inline" />
                    <span>
                      <strong>Duración:</strong> {`${eve.dur_hor_eve} horas`}
                    </span>
                  </div>{" "}
                  {/* Cupos disponibles */}
                  <div
                    className={`detail-item ${eve.cup_dis_eve === 0
                      ? "cupos-agotados-admin"
                      : "cupos-disponibles-admin"
                      }`}
                  >
                    <UserCheck size={16} className="icon-inline" />
                    <span>
                      <strong>
                        {eve.cup_dis_eve === 0
                          ? "🚫 AGOTADO"
                          : "Cupos disponibles:"}
                      </strong>{" "}
                      {eve.cup_dis_eve === 0
                        ? ` (0 de ${eve.cup_max_eve})`
                        : ` ${eve.cup_dis_eve || 0} de ${eve.cup_max_eve}`}
                    </span>
                  </div>
                  {/* Información exclusiva de cursos */}
                  {esCurso && (
                    <>
                      <div className="detail-item">
                        <Star size={16} className="icon-inline" />
                        <span>
                          <strong>Nota mínima:</strong>{" "}
                          {eve.eventos_curso?.not_min_cur ?? "-"}
                        </span>
                      </div>

                      <div className="detail-item">
                        <Users size={16} className="icon-inline" />
                        <span>
                          <strong>Asistencia mínima:</strong>{" "}
                          {eve.por_min_asi_eve
                            ? `${eve.por_min_asi_eve}%`
                            : "-"}
                        </span>
                      </div>
                    </>
                  )}
                  {/* Carreras asociadas */}
                  <div className="detail-item">
                    <GraduationCap size={16} className="icon-inline" />
                    <span>
                      <strong>
                        Carrera{eve.eventos_carrera?.length !== 1 ? "s" : ""}:
                      </strong>{" "}
                      {eve.eventos_carrera && eve.eventos_carrera.length > 0
                        ? eve.eventos_carrera
                          .map((ec) => ec.carrera.nom_car)
                          .join(", ")
                        : "General"}
                    </span>
                  </div>
                  {/* Contenedor para estado y modalidad uno al lado del otro */}
                  <div className="detail-item">
                    <div className="estado-modalidad-container-ae">
                      {/* Estado del evento */}
                      <div className={`admin-event-status ${estadoUI.cssClass}`}>
                        {estadoUI.icon}
                        <span>{estadoUI.text}</span>
                      </div>

                      {/* Modalidad del evento con ícono correspondiente */}
                      <div className={`modalidad-badge-ae ${modalidadUI.cssClass}`}>
                        {modalidadUI.icon}
                        {modalidadUI.text}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-event-actions">
                  <button
                    title="Editar evento"
                    className="admin-event-btn edit"
                    onClick={() => handleEditEvent(eve.id_eve)}
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    title="Eliminar evento"
                    className="admin-event-btn delete"
                    onClick={() => eliminarEvento(eve.id_eve)}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
                <button
                  title="Ver inscripciones"
                  className="admin-event-btn view"
                  onClick={() =>
                    navigate(`/admin/eventos/${eve.id_eve}/inscripciones`)
                  }
                >
                  <Eye size={14} />
                  Ver inscritos
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
