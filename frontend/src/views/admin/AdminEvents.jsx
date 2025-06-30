import { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { formatUTCForLocalDisplay } from "../../utils/dateUtils";
import HistoryEditEvents from "../../utils/HistoryEditEvents";
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
  Edit3,
} from "lucide-react";
import "./styles/AdminEvents.css";
import "./styles/EventosDestacados.css";
import BotonEstrella from "../../components/admin/BotonEstrella";
import { usePagination } from "../../hooks/usePagination";
import PaginationControls from "../../components/Pagination/PaginationControls";

const getEstadoEventoUI = (estado) => {
  switch (estado) {
    case "ACTIVO":
      return {
        icon: <CheckCircle size={16} />,
        text: "Activo",
        cssClass: "estado-activo-ae",
      };
    case "INACTIVO":
      return {
        icon: <XCircle size={16} />,
        text: "Inactivo",
        cssClass: "estado-inactivo-ae",
      };
    case "FINALIZADO":
      return {
        icon: <XCircle size={16} />,
        text: "Finalizado",
        cssClass: "estado-finalizado-ae",
      };
    case "CANCELADO":
      return {
        icon: <XCircle size={16} />,
        text: "Cancelado",
        cssClass: "estado-cancelado-ae",
      };
    case "SUSPENDIDO":
      return {
        icon: <XCircle size={16} />,
        text: "Suspendido",
        cssClass: "estado-suspendido-ae",
      };
    default:
      return {
        icon: <XCircle size={16} />,
        text: "Desconocido",
        cssClass: "estado-default-ae",
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
        cssClass: "modalidad-presencial-ae",
      };
    case "VIRTUAL":
      return {
        icon: <Monitor size={16} />,
        text: "Virtual",
        cssClass: "modalidad-virtual-ae",
      };
    case "SEMIPRESENCIAL":
      return {
        icon: <Laptop size={16} />,
        text: "Semipresencial",
        cssClass: "modalidad-semipresencial-ae",
      };
    default:
      return {
        icon: <Users size={16} />,
        text: "No especificada",
        cssClass: "modalidad-default-ae",
      };
  }
};

const AdminEvents = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carreras, setCarreras] = useState([]);
  const navigate = useNavigate();

  // Instanciar HistoryEditEvents (Singleton)
  const historialManager = useMemo(
    () =>
      HistoryEditEvents.getInstance({
        MAX_EVENTOS: 80, // Máximo eventos en historial
        DIAS_EXPIRACION: 7, // Días de vida útil
      }),
    []
  );

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
    eventosLlenos: false,
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState({
    campo: "fec_cre_eve", // Cambiar por defecto a fecha de creación
    direccion: "desc", // Más recientes primero
  });

  // Hook de paginación
  const {
    data: eventosFiltrados,
    loading: cargandoPaginacion,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    fetchData,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination("/admin/eventos", 15);

  // Fecha actual para calcular estados de eventos (useMemo para evitar recreación en cada render)
  const fechaActual = useMemo(() => new Date(), []);

  // Limpiar historial al cargar componente
  useEffect(() => {
    historialManager.limpiarHistorial();
  }, [historialManager]); // Aplicar ordenamiento híbrido con eventos editados recientemente
  const eventosConOrdenamientoHibrido = useMemo(() => {
    if (!eventosFiltrados || eventosFiltrados.length === 0) return [];

    console.log("🔄 [AdminEvents] Aplicando ordenamiento híbrido:");
    console.log(
      "📊 [AdminEvents] Eventos originales:",
      eventosFiltrados.length
    );
    console.log("📊 [AdminEvents] Criterio de ordenamiento:", ordenamiento);

    const eventosOrdenados = historialManager.ordenarEventosConPaginacion(
      eventosFiltrados,
      ordenamiento,
      currentPage
    );

    console.log(
      "📊 [AdminEvents] Eventos después del ordenamiento:",
      eventosOrdenados.length
    );

    // Mostrar los primeros 3 eventos para debugging
    if (eventosOrdenados.length > 0) {
      console.log(
        "📊 [AdminEvents] Primeros 3 eventos:",
        eventosOrdenados.slice(0, 3).map((e) => ({
          id: e.id_eve,
          nombre: e.nom_eve,
          editadoRecientemente: historialManager.esEventoEditadoRecientemente(
            e.id_eve
          ),
        }))
      );
    }

    return eventosOrdenados;
  }, [eventosFiltrados, ordenamiento, currentPage, historialManager]);

  // Cargar carreras para el filtro
  const cargarCarreras = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/carreras");
      setCarreras(res.data);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
    }
  }, []);

  // Cargar eventos con filtros
  const cargarEventosConFiltros = useCallback(() => {
    // Convertir filtros a formato adecuado para API
    const filtrosParaAPI = {
      search: filtros.busqueda || undefined,
      tipoEvento: filtros.tipoEvento || undefined,
      estado: filtros.estado || undefined,
      fechaInicio: filtros.fechaInicio || undefined,
      fechaFin: filtros.fechaFin || undefined,
      carrera: filtros.carrera || undefined,
      modalidad: filtros.modalidad || undefined,
      capacidadMin: filtros.capacidadMin || undefined,
      capacidadMax: filtros.capacidadMax || undefined,
      valorMin: filtros.valorMin || undefined,
      valorMax: filtros.valorMax || undefined,
      asistenciaMin: filtros.asistenciaMin || undefined,
      esGratuito: filtros.esGratuito || undefined,
      esPago: filtros.esPago || undefined,
      eventosLlenos: filtros.eventosLlenos || undefined,
      sortBy: ordenamiento.campo || "fec_cre_eve",
      sortOrder: ordenamiento.direccion || "desc",
    };

    // Eliminar propiedades undefined
    Object.keys(filtrosParaAPI).forEach(
      (key) => filtrosParaAPI[key] === undefined && delete filtrosParaAPI[key]
    );

    fetchData(filtrosParaAPI);
  }, [filtros, ordenamiento, fetchData]);

  useEffect(() => {
    cargarCarreras();
  }, [cargarCarreras]);

  // Efecto para aplicar filtros
  useEffect(() => {
    cargarEventosConFiltros();
  }, [filtros, ordenamiento, cargarEventosConFiltros]);

  // Eliminar evento with confirmación y alertas
  const eliminarEvento = async (eventoId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este evento?"))
      return;
    try {
      await axiosInstance.delete(`/eventos/${eventoId}`);
      toast.success("Evento eliminado correctamente");
      cargarEventosConFiltros(); // Recargar eventos con paginación
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      toast.error(error.response?.data?.msg || "No se pudo eliminar el evento");
    }
  };

  // Manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => {
      let nuevosFiltros = {
        ...prev,
        [campo]: valor,
      };

      // Lógica para filtros mutuamente excluyentes
      if (campo === "esGratuito" && valor === true) {
        nuevosFiltros.esPago = false;
      } else if (campo === "esPago" && valor === true) {
        nuevosFiltros.esGratuito = false;
      }

      return nuevosFiltros;
    });
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
      eventosLlenos: false,
    });
    setOrdenamiento({
      campo: "fec_cre_eve", // Fecha de creación por defecto
      direccion: "desc", // Más recientes primero
    });
  };

  // Manejar cambios en ordenamiento
  const handleOrdenamientoChange = (campo) => {
    setOrdenamiento((prev) => ({
      campo,
      direccion:
        prev.campo === campo && prev.direccion === "asc" ? "desc" : "asc",
    }));
  };

  // Función para obtener la fecha de fin apropiada según el tipo de evento
  const obtenerFechaFin = (evento) => {
    const esCurso = evento.tip_eve === "CURSO";

    // Para cursos, usar fecha específica de fin de curso
    if (esCurso && evento.fec_fin_eve) {
      return formatUTCForLocalDisplay(evento.fec_fin_eve); // Utiliza fec_fin_eve del evento directamente
    }

    // Para eventos no-curso, verificar si hay fecha de fin explícita
    if (evento.fec_fin_eve) {
      return formatUTCForLocalDisplay(evento.fec_fin_eve);
    }

    // Si no hay fecha de fin, pero hay fecha de inicio y duración
    if (evento.fec_ini_eve && evento.dur_hrs_eve) {
      const [datePart, timePart] = evento.fec_ini_eve.split("T");
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart ? timePart.split(":") : ["00", "00"];

      const fechaInicio = new Date(
        Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        )
      );

      if (!isNaN(fechaInicio.getTime())) {
        // Eventos cortos (menos de 24h) terminan el mismo día
        if (evento.dur_hrs_eve <= 24) {
          return formatUTCForLocalDisplay(fechaInicio.toISOString());
        }

        // Eventos largos, calcular días (asumiendo 8h por día)
        const diasAdicionales = Math.ceil(evento.dur_hrs_eve / 8);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setUTCDate(fechaFin.getUTCDate() + diasAdicionales - 1);
        return formatUTCForLocalDisplay(fechaFin);
      }
    }

    // Si todo falla, mostrar la misma fecha de inicio
    return formatUTCForLocalDisplay(evento.fec_ini_eve);
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
    // Navegar a la página de edición
    navigate(`/admin/eventos/editar/${eventoId}`);
  };

  // Función para registrar evento editado (se llamará desde la página de edición)
  const registrarEventoEditado = useCallback(
    (eventoId) => {
      console.log("📝 [AdminEvents] Registrando evento editado:", eventoId);
      const exito = historialManager.registrarEventoEditado(eventoId);
      console.log("📝 [AdminEvents] Resultado del registro:", exito);

      if (exito) {
        console.log("📝 [AdminEvents] Recargando eventos...");
        // Recargar eventos para mostrar el nuevo ordenamiento
        cargarEventosConFiltros();
      }
      return exito;
    },
    [historialManager, cargarEventosConFiltros]
  );

  // Exponer la función globalmente para que pueda ser llamada desde otras páginas
  useEffect(() => {
    console.log(
      "🌐 [AdminEvents] Registrando función global registrarEventoEditado"
    );
    window.registrarEventoEditado = registrarEventoEditado;

    // Cleanup
    return () => {
      delete window.registrarEventoEditado;
    };
  }, [registrarEventoEditado]);

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
          <button
            className="admin-events-create-btn"
            onClick={handleCrearEvento}
          >
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
                onChange={(e) =>
                  handleFiltroChange("tipoEvento", e.target.value)
                }
              >
                <option value="">Todos los tipos</option>
                <option value="CURSO">Curso</option>
                <option value="CONGRESO">Congreso</option>
                <option value="WEBINAR">Webinar</option>
                <option value="CHARLA">Charla</option>
                <option value="SOCIALIZACION">Socialización</option>
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
                onChange={(e) =>
                  handleFiltroChange("fechaInicio", e.target.value)
                }
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
                {carreras.map((carrera) => (
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
                onChange={(e) =>
                  handleFiltroChange("modalidad", e.target.value)
                }
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
                onChange={(e) =>
                  handleFiltroChange("capacidadMin", e.target.value)
                }
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
                onChange={(e) =>
                  handleFiltroChange("capacidadMax", e.target.value)
                }
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
                onChange={(e) =>
                  handleFiltroChange("asistenciaMin", e.target.value)
                }
              />
            </div>

            {/* Checkboxes para filtros especiales */}
            <div className="filter-group checkbox-group">
              <label className="checkbox-label-ae">
                <input
                  type="checkbox"
                  checked={filtros.esGratuito}
                  onChange={(e) =>
                    handleFiltroChange("esGratuito", e.target.checked)
                  }
                />
                <span className="labels-check-ae">Solo eventos gratuitos</span>
              </label>
            </div>

            <div className="filter-group checkbox-group">
              <label className="checkbox-label-ae">
                <input
                  type="checkbox"
                  checked={filtros.esPago}
                  onChange={(e) =>
                    handleFiltroChange("esPago", e.target.checked)
                  }
                />
                <span className="labels-check-ae">Solo eventos de pago</span>
              </label>
            </div>

            <div className="filter-group checkbox-group">
              <label className="checkbox-label-ae">
                <input
                  type="checkbox"
                  checked={filtros.eventosLlenos}
                  onChange={(e) =>
                    handleFiltroChange("eventosLlenos", e.target.checked)
                  }
                />
                <span className="labels-check-ae">
                  Eventos llenos (sin cupos)
                </span>
              </label>
            </div>
          </div>

          {/* Opciones de ordenamiento */}
          <div className="sorting-section">
            <h4>Ordenar por:</h4>
            <div className="sorting-options">
              <button
                className={`sort-btn ${
                  ordenamiento.campo === "fec_cre_eve" ? "active" : ""
                }`}
                onClick={() => handleOrdenamientoChange("fec_cre_eve")}
              >
                <Calendar size={14} />
                Fecha de Creación{" "}
                {ordenamiento.campo === "fec_cre_eve" &&
                  (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${
                  ordenamiento.campo === "nom_eve" ? "active" : ""
                }`}
                onClick={() => handleOrdenamientoChange("nom_eve")}
              >
                <ArrowUpDown size={14} />
                Nombre{" "}
                {ordenamiento.campo === "nom_eve" &&
                  (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${
                  ordenamiento.campo === "fec_ini_eve" ? "active" : ""
                }`}
                onClick={() => handleOrdenamientoChange("fec_ini_eve")}
              >
                <ArrowUpDown size={14} />
                Fecha{" "}
                {ordenamiento.campo === "fec_ini_eve" &&
                  (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${
                  ordenamiento.campo === "val_eve" ? "active" : ""
                }`}
                onClick={() => handleOrdenamientoChange("val_eve")}
              >
                <ArrowUpDown size={14} />
                Precio{" "}
                {ordenamiento.campo === "val_eve" &&
                  (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${
                  ordenamiento.campo === "cup_max_eve" ? "active" : ""
                }`}
                onClick={() => handleOrdenamientoChange("cup_max_eve")}
              >
                <ArrowUpDown size={14} />
                Capacidad{" "}
                {ordenamiento.campo === "cup_max_eve" &&
                  (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`sort-btn ${
                  ordenamiento.campo === "cup_dis_eve" ? "active" : ""
                }`}
                onClick={() => handleOrdenamientoChange("cup_dis_eve")}
              >
                <ArrowUpDown size={14} />
                Disponibles{" "}
                {ordenamiento.campo === "cup_dis_eve" &&
                  (ordenamiento.direccion === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="results-count">
            <span>
              Mostrando{" "}
              {totalItems > 0 ? `1-${Math.min(itemsPerPage, totalItems)}` : "0"}{" "}
              de {totalItems} eventos
            </span>
          </div>
        </div>
      )}

      {cargandoPaginacion ? (
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
        <div className="admin-events-grid-ae">
          {eventosConOrdenamientoHibrido.map((eve) => {
            const esCurso = eve.tip_eve === "CURSO";
            const estadoEvento = esEventoFinalizado(eve)
              ? "FINALIZADO"
              : eve.est_eve;
            const estadoUI = getEstadoEventoUI(estadoEvento);
            const modalidadUI = getModalidadUI(eve.mod_eve);

            return (
              <div
                key={eve.id_eve}
                className={`admin-event-card ${
                  eve.eve_des ? "card-evento-destacado-ge" : ""
                } ${
                  historialManager.esEventoEditadoRecientemente(eve.id_eve, 24)
                    ? "card-evento-editado-recientemente"
                    : ""
                }`}
              >
                {/* Badge para eventos editados recientemente */}
                {historialManager.esEventoEditadoRecientemente(
                  eve.id_eve,
                  24
                ) && (
                  <div className="badge-editado-recientemente">
                    <Edit3 size={12} />
                    Editado recientemente
                  </div>
                )}
                {/* Imagen de portada */}
                {eve.img_por_eve && (
                  <div className="admin-event-image">
                    <img src={eve.img_por_eve} alt={eve.nom_eve} />
                  </div>
                )}

                <div className="admin-event-header">
                  <div className="admin-event-title-container-ae">
                    <h3 className="admin-event-name">{eve.nom_eve}</h3>
                  </div>
                  <span
                    className={`admin-event-label ${
                      eve.val_eve === 0 ? "valor-gratuito-ae" : "valor-pago-ae"
                    }`}
                  >
                    {eve.val_eve === 0
                      ? "Gratuito"
                      : `$${eve.val_eve.toFixed(2)}`}
                  </span>
                </div>
                <div className="contenedor-tipo-estrella-ae">
                  <div className="admin-event-type-badge">
                    {getTipoEventoIcon(eve.tip_eve)}
                    {eve.tip_eve}
                  </div>
                  <div className="contenedor-estrella-ae">
                    <BotonEstrella
                      idEvento={eve.id_eve}
                      estadoInicial={eve.eve_des || false}
                      onToggle={(esDestacado) => {
                        const nombreEvento = eve.nom_eve || "Evento";
                        toast.success(
                          esDestacado
                            ? `"${nombreEvento}" marcado como destacado`
                            : `"${nombreEvento}" ya no se mostrará en destacados`
                        );
                      }}
                    />
                  </div>
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
                      {formatUTCForLocalDisplay(eve.fec_ini_eve)}
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
                    className={`detail-item ${
                      eve.cup_dis_eve === 0
                        ? "cupos-agotados-admin"
                        : "cupos-disponibles-admin"
                    }`}
                  >
                    <UserCheck size={16} className="icon-inline" />
                    <span>
                      <strong>
                        {eve.cup_dis_eve === 0
                          ? "🚫 CUPOS AGOTADOS"
                          : "Cupos disponibles:"}
                      </strong>{" "}
                      {eve.cup_dis_eve === 0
                        ? ` (0 de ${eve.cup_max_eve})`
                        : ` ${eve.cup_dis_eve || 0} de ${eve.cup_max_eve}`}
                    </span>
                    {/* Badge adicional para eventos sin cupos cuando se muestra filtro eventos llenos */}
                    {eve.cup_dis_eve === 0 && filtros.eventosLlenos && (
                      <span className="badge-cupos-agotados">🚫 SIN CUPOS</span>
                    )}
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
                  {/* Información para eventos que NO son cursos */}
                  {!esCurso && (
                    <div className="detail-item">
                      <Users size={16} className="icon-inline" />
                      <span>
                        <strong>Asistencia mínima:</strong>{" "}
                        {eve.por_min_asi_eve ? `${eve.por_min_asi_eve}%` : "-"}
                      </span>
                    </div>
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
                      <div
                        className={`admin-event-status ${estadoUI.cssClass}`}
                      >
                        {estadoUI.icon}
                        <span>{estadoUI.text}</span>
                      </div>

                      {/* Modalidad del evento con ícono correspondiente */}
                      <div
                        className={`modalidad-badge-ae ${modalidadUI.cssClass}`}
                      >
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

      {/* Paginación */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          loading={cargandoPaginacion}
          className="variant-admin"
          showInfo={true}
          showNumbers={true}
        />
      )}
    </div>
  );
};

export default AdminEvents;
