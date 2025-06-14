import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosConfig";
import { ClipboardList, Download, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import {
  formatDateForBackend,
  formatDateForPicker,
  formatDateForReports,
} from "../../../utils/dateUtils";
import "./styles/ReporteInscripciones.css";

// Registrar el idioma
registerLocale("es", es);

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const ReporteInscripciones = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [estadisticas, setEstadisticas] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [validaciones, setValidaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const fechaActual = new Date();
    const fechaFinDate = new Date(fechaActual);

    const fechaInicioDate = new Date(fechaActual);
    fechaInicioDate.setMonth(fechaInicioDate.getMonth() - 1);

    setFechaInicio(fechaInicioDate);
    setFechaFin(fechaFinDate);
  }, []);

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    if (!fechaInicio || !fechaFin) return;

    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Formatear fechas para el backend usando la función específica para reportes
        const fechaInicioStr = formatDateForReports(fechaInicio);
        const fechaFinStr = formatDateForReports(fechaFin);

        // Cargar estadísticas generales
        const resEstadisticas = await axiosInstance.get(
          `/admin/reportes-inscripciones/estadisticas`,
          {
            params: {
              fechaInicio: fechaInicioStr,
              fechaFin: fechaFinStr,
              estado: estadoFiltro,
            },
          }
        );
        setEstadisticas(resEstadisticas.data);

        // Cargar tendencias por período
        const resTendencias = await axiosInstance.get(
          `/admin/reportes-inscripciones/tendencias`,
          {
            params: { fechaInicio: fechaInicioStr, fechaFin: fechaFinStr },
          }
        );
        setTendencias(resTendencias.data);

        // Cargar análisis de validaciones
        const resValidaciones = await axiosInstance.get(
          `/admin/reportes-inscripciones/validaciones`,
          {
            params: { fechaInicio: fechaInicioStr, fechaFin: fechaFinStr },
          }
        );
        setValidaciones(resValidaciones.data);
      } catch (error) {
        console.error("Error al cargar datos de inscripciones:", error);
        setEstadisticas(null);
        setTendencias([]);
        setValidaciones([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [fechaInicio, fechaFin, estadoFiltro]);

  // Función para descargar el reporte en PDF
  const descargarPDF = async () => {
    if (!fechaInicio || !fechaFin) return;

    try {
      setLoadingPDF(true);
      document.body.style.cursor = "wait";

      // Formatear fechas para el backend usando la función específica para reportes
      const fechaInicioStr = formatDateForReports(fechaInicio);
      const fechaFinStr = formatDateForReports(fechaFin);

      const res = await axiosInstance.post(
        `/admin/reportes-inscripciones/pdf`,
        {
          fechaInicio: fechaInicioStr,
          fechaFin: fechaFinStr,
          estado: estadoFiltro,
        },
        { responseType: "blob" }
      );

      // Crear nombre del archivo
      const nombreArchivo = `Reporte_Inscripciones_${fechaInicioStr}_al_${fechaFinStr}.pdf`;

      // Descargar el archivo
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      alert("No se pudo descargar el reporte. Intente nuevamente.");
    } finally {
      setLoadingPDF(false);
      document.body.style.cursor = "default";
    }
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return `${fecha.getDate()} de ${
      MESES[fecha.getMonth()]
    } de ${fecha.getFullYear()}`;
  };
  return (
    <div className="reporte-inscripciones-container-ri">
      <div className="reporte-header-ri">
        <h2>
          <ClipboardList size={24} className="icon-header-ri" />
          Reportes de Inscripciones
        </h2>
      </div>
      <p className="reporte-descripcion-ri">
        Análisis de estados, tendencias y validaciones de inscripciones
      </p>{" "}
      {/* Filtros */}
      <div className="filtros-container-ri">
        {/* Fila 1: Período de fechas */}
        <div className="filtros-row-ri">
          <div className="periodo-grupo-ri">
            <label>Período:</label>
            <div className="fecha-inputs-ri">
              <div className="fecha-input-wrapper-ri">
                <span>Desde:</span>
                <div className="input-with-icon-ri date-picker-container-ri">
                  <Calendar size={18} />
                  <DatePicker
                    selected={fechaInicio}
                    onChange={(date) => {
                      if (date) {
                        date.setHours(0, 0, 0, 0);
                        setFechaInicio(date);
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    placeholderText="Seleccionar fecha"
                    className="date-picker-input-ri"
                    maxDate={fechaFin}
                  />
                </div>
              </div>
              <div className="fecha-input-wrapper-ri">
                <span>Hasta:</span>
                <div className="input-with-icon-ri date-picker-container-ri">
                  <Calendar size={18} />
                  <DatePicker
                    selected={fechaFin}
                    onChange={(date) => {
                      if (date) {
                        date.setHours(23, 59, 59, 999);
                        setFechaFin(date);
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    placeholderText="Seleccionar fecha"
                    className="date-picker-input-ri"
                    minDate={fechaInicio}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2: Estado y botón de descarga */}
        <div className="filtros-row-ri">
          <div className="filtro-grupo-ri">
            <label>Estado:</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ACEPTADA">Aceptada</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="REPROBADO_ASISTENCIA">
                Reprobado por Asistencia
              </option>
              <option value="REPROBADO_NOTA">Reprobado por Nota</option>
              <option value="REPROBADO_TOTAL">Reprobado Total</option>
            </select>
          </div>
          <button
            className="btn-descargar-ri"
            onClick={descargarPDF}
            disabled={loadingPDF || !fechaInicio || !fechaFin}
          >
            {loadingPDF ? "Generando PDF..." : "Descargar Reporte PDF"}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="loading-container-ri">
          <p>Cargando datos de inscripciones...</p>
        </div>
      ) : (
        <>
          {/* Sección de estadísticas de estado */}
          <div className="estadisticas-container-ri">
            <h3>Estado de Inscripciones</h3>

            {estadisticas ? (
              <div className="stats-grid-ri">
                <div className="stat-card-ri">
                  <h4>Total Inscripciones</h4>
                  <div className="stat-value-ri">{estadisticas.total}</div>
                </div>
                <div className="stat-card-ri pendientes-ri">
                  <h4>Pendientes</h4>
                  <div className="stat-value-ri">{estadisticas.pendientes}</div>
                  <div className="stat-percentage-ri">
                    {estadisticas.total > 0
                      ? Math.round(
                          (estadisticas.pendientes / estadisticas.total) * 100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className="stat-card-ri aceptadas-ri">
                  <h4>Aceptadas</h4>
                  <div className="stat-value-ri">
                    {estadisticas.aceptadas || 0}
                  </div>
                  <div className="stat-percentage-ri">
                    {estadisticas.total > 0
                      ? Math.round(
                          ((estadisticas.aceptadas || 0) / estadisticas.total) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className="stat-card-ri aprobadas-ri">
                  <h4>Aprobadas</h4>
                  <div className="stat-value-ri">
                    {estadisticas.aprobadas || 0}
                  </div>
                  <div className="stat-percentage-ri">
                    {estadisticas.total > 0
                      ? Math.round(
                          ((estadisticas.aprobadas || 0) / estadisticas.total) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className="stat-card-ri rechazadas-ri">
                  <h4>Rechazadas</h4>
                  <div className="stat-value-ri">
                    {estadisticas.rechazadas || 0}
                  </div>
                  <div className="stat-percentage-ri">
                    {estadisticas.total > 0
                      ? Math.round(
                          ((estadisticas.rechazadas || 0) /
                            estadisticas.total) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className="stat-card-ri reprobadas-ri">
                  <h4>Reprobadas</h4>
                  <div className="stat-value-ri">
                    {estadisticas.reprobadas || 0}
                  </div>
                  <div className="stat-percentage-ri">
                    {estadisticas.total > 0
                      ? Math.round(
                          ((estadisticas.reprobadas || 0) /
                            estadisticas.total) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>
            ) : (
              <p>No hay estadísticas disponibles para este período.</p>
            )}
          </div>

          {/* Sección de tendencias */}
          <div className="tendencias-container-ri">
            <h3>Tendencias de Inscripción por Período</h3>

            {tendencias.length > 0 ? (
              <div className="tendencias-tabla-ri">
                <table>
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Total</th>
                      <th>Pendientes</th>
                      <th>Aceptadas</th>
                      <th>Aprobadas</th>
                      <th>Rechazadas</th>
                      <th>Reprobadas</th>
                      <th>Variación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tendencias.map((item, index) => (
                      <tr key={index}>
                        <td>{item.periodo}</td>
                        <td>{item.total}</td>
                        <td>{item.pendientes || 0}</td>
                        <td>{item.aceptadas || 0}</td>
                        <td>{item.aprobadas || 0}</td>
                        <td>{item.rechazadas || 0}</td>
                        <td>{item.reprobadas || 0}</td>
                        <td
                          className={
                            item.variacion > 0
                              ? "aumento-ri"
                              : item.variacion < 0
                              ? "disminucion-ri"
                              : ""
                          }
                        >
                          {item.variacion > 0
                            ? `+${item.variacion}%`
                            : item.variacion < 0
                            ? `${item.variacion}%`
                            : "0%"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay datos de tendencias disponibles para este período.</p>
            )}
          </div>

          {/* Sección de análisis de validaciones */}
          <div className="validaciones-container-ri">
            <h3>Análisis de Validaciones Realizadas</h3>

            {validaciones.length > 0 ? (
              <div className="validaciones-grid-ri">
                {validaciones.map((item, index) => (
                  <div className="validacion-card-ri" key={index}>
                    <h4>
                      <span className="validador-title-ri">Validador:</span>{" "}
                      {item.responsable}
                    </h4>
                    <div className="validacion-stats-ri">
                      <div className="validacion-stat-ri">
                        <span>Total Validadas:</span>
                        <strong>{item.totalValidadas}</strong>
                      </div>
                      <div className="validacion-stat-ri">
                        <span>Aceptadas:</span>
                        <strong>{item.aceptadas || 0}</strong>
                      </div>
                      <div className="validacion-stat-ri">
                        <span>Aprobadas:</span>
                        <strong>{item.aprobadas || 0}</strong>
                      </div>
                      <div className="validacion-stat-ri">
                        <span>Rechazadas:</span>
                        <strong>{item.rechazadas || 0}</strong>
                      </div>
                      <div className="validacion-stat-ri">
                        <span>Reprobadas:</span>
                        <strong>{item.reprobadas || 0}</strong>
                      </div>
                      <div className="validacion-stat-ri">
                        <span>Tiempo Promedio:</span>
                        <strong>{item.tiempoPromedio} hrs</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay datos de validaciones disponibles para este período.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteInscripciones;
