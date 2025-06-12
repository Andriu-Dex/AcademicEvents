import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosConfig";
import { ClipboardList, Download } from "lucide-react";
import { toast } from "react-toastify";
import "./styles/ReporteInscripciones.css";

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
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [estadisticas, setEstadisticas] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [validaciones, setValidaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const fechaActual = new Date();
    const fechaFinStr = fechaActual.toISOString().split("T")[0];

    fechaActual.setMonth(fechaActual.getMonth() - 1);
    const fechaInicioStr = fechaActual.toISOString().split("T")[0];

    setFechaInicio(fechaInicioStr);
    setFechaFin(fechaFinStr);
  }, []);

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    if (!fechaInicio || !fechaFin) return;

    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Cargar estadísticas generales
        const resEstadisticas = await axiosInstance.get(
          `/admin/reportes-inscripciones/estadisticas`,
          {
            params: { fechaInicio, fechaFin, estado: estadoFiltro },
          }
        );
        setEstadisticas(resEstadisticas.data);

        // Cargar tendencias por período
        const resTendencias = await axiosInstance.get(
          `/admin/reportes-inscripciones/tendencias`,
          {
            params: { fechaInicio, fechaFin },
          }
        );
        setTendencias(resTendencias.data);

        // Cargar análisis de validaciones
        const resValidaciones = await axiosInstance.get(
          `/admin/reportes-inscripciones/validaciones`,
          {
            params: { fechaInicio, fechaFin },
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

      const res = await axiosInstance.post(
        `/admin/reportes-inscripciones/pdf`,
        {
          fechaInicio,
          fechaFin,
          estado: estadoFiltro,
        },
        { responseType: "blob" }
      );

      // Crear nombre del archivo
      const nombreArchivo = `Reporte_Inscripciones_${fechaInicio}_al_${fechaFin}.pdf`;

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
        <div className="filtro-grupo-ri">
          <label>Período:</label>
          <div className="fecha-inputs-ri">
            <div>
              <span>Desde:</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                max={fechaFin}
              />
            </div>
            <div>
              <span>Hasta:</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio}
              />
            </div>
          </div>
        </div>{" "}
        <div className="filtro-grupo-ri">
          <label>Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
        </div>{" "}
        <button
          className="btn-descargar-ri"
          onClick={descargarPDF}
          disabled={loadingPDF || !fechaInicio || !fechaFin}
        >
          {loadingPDF ? "Generando PDF..." : "Descargar Reporte PDF"}
        </button>
      </div>
      {loading ? (
        <div className="loading-container">
          <p>Cargando datos de inscripciones...</p>
        </div>
      ) : (
        <>
          {/* Sección de estadísticas de estado */}
          <div className="estadisticas-container">
            <h3>Estado de Inscripciones</h3>

            {estadisticas ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Inscripciones</h4>
                  <div className="stat-value">{estadisticas.total}</div>
                </div>
                <div className="stat-card pendientes">
                  <h4>Pendientes</h4>
                  <div className="stat-value">{estadisticas.pendientes}</div>
                  <div className="stat-percentage">
                    {Math.round(
                      (estadisticas.pendientes / estadisticas.total) * 100
                    )}
                    %
                  </div>
                </div>
                <div className="stat-card aprobadas">
                  <h4>Aprobadas</h4>
                  <div className="stat-value">{estadisticas.aprobadas}</div>
                  <div className="stat-percentage">
                    {Math.round(
                      (estadisticas.aprobadas / estadisticas.total) * 100
                    )}
                    %
                  </div>
                </div>
                <div className="stat-card rechazadas">
                  <h4>Rechazadas</h4>
                  <div className="stat-value">{estadisticas.rechazadas}</div>
                  <div className="stat-percentage">
                    {Math.round(
                      (estadisticas.rechazadas / estadisticas.total) * 100
                    )}
                    %
                  </div>
                </div>
              </div>
            ) : (
              <p>No hay estadísticas disponibles para este período.</p>
            )}
          </div>

          {/* Sección de tendencias */}
          <div className="tendencias-container">
            <h3>Tendencias de Inscripción por Período</h3>

            {tendencias.length > 0 ? (
              <div className="tendencias-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Total Inscripciones</th>
                      <th>Pendientes</th>
                      <th>Aprobadas</th>
                      <th>Rechazadas</th>
                      <th>Variación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tendencias.map((item, index) => (
                      <tr key={index}>
                        <td>{item.periodo}</td>
                        <td>{item.total}</td>
                        <td>{item.pendientes}</td>
                        <td>{item.aprobadas}</td>
                        <td>{item.rechazadas}</td>
                        <td
                          className={
                            item.variacion > 0
                              ? "aumento"
                              : item.variacion < 0
                              ? "disminucion"
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
          <div className="validaciones-container">
            <h3>Análisis de Validaciones Realizadas</h3>

            {validaciones.length > 0 ? (
              <div className="validaciones-grid">
                {validaciones.map((item, index) => (
                  <div className="validacion-card" key={index}>
                    <h4>{item.responsable}</h4>
                    <div className="validacion-stats">
                      <div className="validacion-stat">
                        <span>Total Validadas:</span>
                        <strong>{item.totalValidadas}</strong>
                      </div>
                      <div className="validacion-stat">
                        <span>Aprobadas:</span>
                        <strong>{item.aprobadas}</strong>
                      </div>
                      <div className="validacion-stat">
                        <span>Rechazadas:</span>
                        <strong>{item.rechazadas}</strong>
                      </div>
                      <div className="validacion-stat">
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
