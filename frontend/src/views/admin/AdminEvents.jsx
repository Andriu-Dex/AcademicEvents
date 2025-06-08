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
  Search,
  Filter,
  X,
  ChevronDown,
  ArrowUpDown,
  Calendar,
  Hash,
  Percent,
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
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carreras, setCarreras] = useState([]);
  const navigate = useNavigate();
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipoEvento: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
    carrera: "",
    modalidad: "",
    capacidadMin: "",
    capacidadMax: "",
    valorMin: "",
    valorMax: "",
    asistenciaMin: "",
    esGratuito: false,
    esPago: false,
  });
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState({
    campo: "fec_ini_eve",
    direccion: "asc"
  });
  
  // Fecha actual para calcular estados de eventos
  const fechaActual = new Date();

  // Usar axiosInstance para la API con interceptores de token
  const cargarEventos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/eventos");
      console.log("Eventos cargados:", res.data);
      setEventos(res.data);
      setEventosFiltrados(res.data);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      toast.error("No se pudieron cargar los eventos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar carreras para el filtro
  const cargarCarreras = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/carreras");
      setCarreras(res.data);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
    cargarCarreras();
  }, [cargarEventos, cargarCarreras]);

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
  };

  // Función para aplicar filtros
  const aplicarFiltros = useCallback(() => {
    let eventosFiltrados = [...eventos];

    // Filtro por búsqueda (nombre)
    if (filtros.busqueda) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.nom_eve.toLowerCase().includes(filtros.busqueda.toLowerCase())
      );
    }

    // Filtro por tipo de evento
    if (filtros.tipoEvento) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.tip_eve === filtros.tipoEvento
      );
    }

    // Filtro por estado
    if (filtros.estado) {
      eventosFiltrados = eventosFiltrados.filter(evento => {
        const esEventoFinalizado = (evento) => {
          const esCurso = evento.tip_eve === "CURSO";
          if (esCurso && evento.eventos_curso?.fec_fin_cur) {
            return new Date(evento.eventos_curso.fec_fin_cur) < fechaActual;
          } else if (evento.fec_fin_eve) {
            return new Date(evento.fec_fin_eve) < fechaActual;
          }
          return evento.est_eve === "FINALIZADO" || evento.est_eve === "CANCELADO";
        };

        const estadoCalculado = esEventoFinalizado(evento) ? "FINALIZADO" : evento.est_eve;
        return estadoCalculado === filtros.estado;
      });
    }

    // Filtro por fecha de inicio
    if (filtros.fechaInicio) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        new Date(evento.fec_ini_eve) >= new Date(filtros.fechaInicio)
      );
    }

    // Filtro por fecha de fin
    if (filtros.fechaFin) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        new Date(evento.fec_ini_eve) <= new Date(filtros.fechaFin)
      );
    }

    // Filtro por carrera
    if (filtros.carrera) {
      eventosFiltrados = eventosFiltrados.filter(evento => {
        if (filtros.carrera === "GENERAL") {
          return !evento.eventos_carrera || evento.eventos_carrera.length === 0;
        }
        return evento.eventos_carrera?.some(ec => ec.carrera.id_car === filtros.carrera);
      });
    }

    // Filtro por modalidad
    if (filtros.modalidad) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.mod_eve === filtros.modalidad
      );
    }

    // Filtro por capacidad mínima
    if (filtros.capacidadMin) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.cup_max_eve >= parseInt(filtros.capacidadMin)
      );
    }

    // Filtro por capacidad máxima
    if (filtros.capacidadMax) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.cup_max_eve <= parseInt(filtros.capacidadMax)
      );
    }

    // Filtro por valor mínimo
    if (filtros.valorMin) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.val_eve >= parseFloat(filtros.valorMin)
      );
    }

    // Filtro por valor máximo
    if (filtros.valorMax) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.val_eve <= parseFloat(filtros.valorMax)
      );
    }

    // Filtro por asistencia mínima
    if (filtros.asistenciaMin) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.por_min_asi_eve >= parseInt(filtros.asistenciaMin)
      );
    }

    // Filtro por eventos gratuitos
    if (filtros.esGratuito) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.val_eve === 0
      );
    }

    // Filtro por eventos de pago
    if (filtros.esPago) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.val_eve > 0
      );
    }

    // Aplicar ordenamiento
    eventosFiltrados.sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenamiento.campo) {
        case "nom_eve":
          valorA = a.nom_eve.toLowerCase();
          valorB = b.nom_eve.toLowerCase();
          break;
        case "fec_ini_eve":
          valorA = new Date(a.fec_ini_eve);
          valorB = new Date(b.fec_ini_eve);
          break;
        case "val_eve":
          valorA = a.val_eve;
          valorB = b.val_eve;
          break;
        case "cup_max_eve":
          valorA = a.cup_max_eve;
          valorB = b.cup_max_eve;
          break;
        case "cup_dis_eve":
          valorA = a.cup_dis_eve;
          valorB = b.cup_dis_eve;
          break;
        default:
          valorA = a[ordenamiento.campo];
          valorB = b[ordenamiento.campo];
      }

      if (ordenamiento.direccion === "asc") {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    setEventosFiltrados(eventosFiltrados);
  }, [eventos, filtros, ordenamiento, fechaActual]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  // Manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      tipoEvento: "",
      estado: "",
      fechaInicio: "",
      fechaFin: "",
      carrera: "",
      modalidad: "",
      capacidadMin: "",
      capacidadMax: "",
      valorMin: "",
      valorMax: "",
      asistenciaMin: "",
      esGratuito: false,
      esPago: false,
    });
    setOrdenamiento({
      campo: "fec_ini_eve",
      direccion: "asc"
    });
  };

  // Manejar cambios en ordenamiento
  const handleOrdenamientoChange = (campo) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === "asc" ? "desc" : "asc"
    }));
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
        <div className="admin-events-actions">
          <button 
            className="admin-events-filter-toggle"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Filter size={16} />
            {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
          <button className="admin-events-create-btn" onClick={handleCrearEvento}>
            <Plus size={16} />
            Crear nuevo evento
          </button>
        </div>
      </div>

      {/* Panel de Filtros */}
      {mostrarFiltros && (
        <div className="admin-events-filters">
          <div className="filters-header">
            <h3>Filtros Avanzados</h3>
            <button className="clear-filters-btn" onClick={limpiarFiltros}>
              <X size={16} />
              Limpiar Filtros
            </button>
          </div>
          
          <div className="filters-grid">
            {/* Búsqueda por nombre */}
            <div className="filter-group">
              <label>
                <Search size={16} />
                Buscar por nombre
              </label>
              <input
                type="text"
                placeholder="Nombre del evento..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
              />
            </div>

            {/* Tipo de evento */}
            <div className="filter-group">
              <label>
                <Tag size={16} />
                Tipo de evento
              </label>
              <select
                value={filtros.tipoEvento}
                onChange={(e) => handleFiltroChange("tipoEvento", e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="CURSO">Curso</option>
                <option value="CONGRESO">Congreso</option>
                <option value="WEBINAR">Webinar</option>
                <option value="CHARLA">Charla</option>
                <option value="SOCIALIZACION">Socialización</option>
                <option value="PUBLICO">Público</option>
              </select>
            </div>

            {/* Estado */}
            <div className="filter-group">
              <label>
                <CheckCircle size={16} />
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange("estado", e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="SUSPENDIDO">Suspendido</option>
              </select>
            </div>

            {/* Fecha de inicio */}
            <div className="filter-group">
              <label>
                <Calendar size={16} />
                Fecha inicio desde
              </label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
              />
            </div>

            {/* Fecha de fin */}
            <div className="filter-group">
              <label>
                <Calendar size={16} />
                Fecha inicio hasta
              </label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
              />
            </div>

            {/* Carrera */}
            <div className="filter-group">
              <label>
                <GraduationCap size={16} />
                Carrera asociada
              </label>
              <select
                value={filtros.carrera}
                onChange={(e) => handleFiltroChange("carrera", e.target.value)}
              >
                <option value="">Todas las carreras</option>
                <option value="GENERAL">Eventos generales</option>
                {carreras.map(carrera => (
                  <option key={carrera.id_car} value={carrera.id_car}>
                    {carrera.nom_car}
                  </option>
                ))}
              </select>
            </div>

            {/* Modalidad */}
            <div className="filter-group">
              <label>
                <Monitor size={16} />
                Modalidad
              </label>
              <select
                value={filtros.modalidad}
                onChange={(e) => handleFiltroChange("modalidad", e.target.value)}
              >
                <option value="">Todas las modalidades</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIRTUAL">Virtual</option>
                <option value="SEMIPRESENCIAL">Semipresencial</option>
              </select>
            </div>

            {/* Capacidad mínima */}
            <div className="filter-group">
              <label>
                <Users size={16} />
                Capacidad mínima
              </label>
              <input
                type="number"
                placeholder="Ej: 20"
                value={filtros.capacidadMin}
                onChange={(e) => handleFiltroChange("capacidadMin", e.target.value)}
              />
            </div>

            {/* Capacidad máxima */}
            <div className="filter-group">
              <label>
                <Users size={16} />
                Capacidad máxima
              </label>
              <input
                type="number"
                placeholder="Ej: 100"
                value={filtros.capacidadMax}
                onChange={(e) => handleFiltroChange("capacidadMax", e.target.value)}
              />
            </div>

            {/* Valor mínimo */}
            <div className="filter-group">
              <label>
                <DollarSign size={16} />
                Precio mínimo
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej: 10.00"
                value={filtros.valorMin}
                onChange={(e) => handleFiltroChange("valorMin", e.target.value)}
              />
            </div>

            {/* Valor máximo */}
            <div className="filter-group">
              <label>
                <DollarSign size={16} />
                Precio máximo
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej: 50.00"
                value={filtros.valorMax}
                onChange={(e) => handleFiltroChange("valorMax", e.target.value)}
              />
            </div>

            {/* Asistencia mínima */}
            <div className="filter-group">
              <label>
                <Percent size={16} />
                Asistencia mínima (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Ej: 80"
                value={filtros.asistenciaMin}
                onChange={(e) => handleFiltroChange("asistenciaMin", e.target.value)}
              />
            </div>

            {/* Checkboxes para filtros especiales */}
            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filtros.esGratuito}
                  onChange={(e) => handleFiltroChange("esGratuito", e.target.checked)}
                />
                Solo eventos gratuitos
              </label>
            </div>

            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filtros.esPago}
                  onChange={(e) => handleFiltroChange("esPago", e.target.checked)}
                />
                Solo eventos de pago
              </label>
            </div>
          </div>

          {/* Opciones de ordenamiento */}
          <div className="sorting-section">
            <h4>Ordenar por:</h4>
            <div className="sorting-options">
              <button
                className={`sort-btn ${ordenamiento.campo === "nom_eve" ? "active" : ""}`}
                onClick={() => handleOrdenamientoChange("nom_eve")}
              >
                <ArrowUpDown size={14} />
                Nombre {ordenamiento.campo === "nom_eve" && (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${ordenamiento.campo === "fec_ini_eve" ? "active" : ""}`}
                onClick={() => handleOrdenamientoChange("fec_ini_eve")}
              >
                <ArrowUpDown size={14} />
                Fecha {ordenamiento.campo === "fec_ini_eve" && (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${ordenamiento.campo === "val_eve" ? "active" : ""}`}
                onClick={() => handleOrdenamientoChange("val_eve")}
              >
                <ArrowUpDown size={14} />
                Precio {ordenamiento.campo === "val_eve" && (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${ordenamiento.campo === "cup_max_eve" ? "active" : ""}`}
                onClick={() => handleOrdenamientoChange("cup_max_eve")}
              >
                <ArrowUpDown size={14} />
                Capacidad {ordenamiento.campo === "cup_max_eve" && (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${ordenamiento.campo === "cup_dis_eve" ? "active" : ""}`}
                onClick={() => handleOrdenamientoChange("cup_dis_eve")}
              >
                <ArrowUpDown size={14} />
                Disponibles {ordenamiento.campo === "cup_dis_eve" && (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="results-count">
            <span>
              Mostrando {eventosFiltrados.length} de {eventos.length} eventos
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-events-loading">
          <div className="spinner"></div>
          <p>Cargando eventos...</p>
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="admin-events-empty">
          <CalendarClock size={48} className="text-muted" />
          {eventos.length === 0 ? (
            <>
              <p>No hay eventos creados aún.</p>
              <button
                className="admin-events-create-btn"
                onClick={handleCrearEvento}
              >
                <Plus size={16} />
                Crear mi primer evento
              </button>
            </>
          ) : (
            <>
              <p>No se encontraron eventos con los filtros aplicados.</p>
              <button
                className="admin-events-create-btn secondary"
                onClick={limpiarFiltros}
              >
                <X size={16} />
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="admin-events-grid">
          {eventosFiltrados.map((eve) => {
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
