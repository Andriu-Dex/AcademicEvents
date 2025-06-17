import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosConfig";
import {
  GraduationCap,
  Download,
  Filter,
  ArrowLeft,
  PieChart,
} from "lucide-react";
import { toast } from "react-toastify";
import "./styles/ReporteCarrera.css";

const ReporteCarrera = () => {
  const [carreras, setCarreras] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState("");
  const [datosEstadisticos, setDatosEstadisticos] = useState(null);
  const [eventosPorCarrera, setEventosPorCarrera] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const navigate = useNavigate();

  // Cargar la lista de carreras disponibles
  useEffect(() => {
    const cargarCarreras = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/admin/carreras");
        setCarreras(res.data);
        // Si hay carreras, seleccionar la primera por defecto
        if (res.data && res.data.length > 0) {
          setCarreraSeleccionada(res.data[0].id_car);
        }
      } catch (error) {
        console.error("Error al cargar carreras:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarCarreras();
  }, []);

  // Cargar datos cuando se selecciona una carrera
  useEffect(() => {
    if (!carreraSeleccionada) return;

    const cargarDatosCarrera = async () => {
      try {
        setLoading(true);
        // Endpoint para datos estadísticos de participación por carrera
        const resEstadisticas = await axiosInstance.get(
          `/admin/reportes-carrera/estadisticas/${carreraSeleccionada}`
        );
        setDatosEstadisticos(resEstadisticas.data);

        // Endpoint para eventos populares por carrera
        const resEventos = await axiosInstance.get(
          `/admin/reportes-carrera/eventos/${carreraSeleccionada}`
        );
        setEventosPorCarrera(resEventos.data);
      } catch (error) {
        console.error("Error al cargar datos de la carrera:", error);
        setDatosEstadisticos(null);
        setEventosPorCarrera([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosCarrera();
  }, [carreraSeleccionada]);

  // Función para descargar el reporte en PDF
  const descargarPDF = async () => {
    if (!carreraSeleccionada) return;

    try {
      setLoadingPDF(true);
      document.body.style.cursor = "wait";

      const res = await axiosInstance.get(
        `/admin/reportes-carrera/pdf/${carreraSeleccionada}`,
        { responseType: "blob" }
      );

      // Obtener el nombre de la carrera para el archivo
      const carreraActual = carreras.find(
        (c) => c.id_car === carreraSeleccionada
      );
      const nombreCarrera = carreraActual ? carreraActual.nom_car : "Carrera";

      // Crear el nombre del archivo
      const nombreArchivo = `Reporte_${nombreCarrera.replace(/\s+/g, "_")}.pdf`;

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
  return (
    <div className="reporte-carrera-container">
      <div className="reporte-header-rc">
        <h2>
          <GraduationCap size={24} className="icon-header" />
          Reportes por Carrera
        </h2>
      </div>

      <p className="reporte-descripcion">
        Análisis detallado de la participación de estudiantes por carrera
        académica
      </p>

      {/* Selector de carrera */}
      <div className="filtro-container">
        <div className="selector-container">
          <label htmlFor="carrera-select">Seleccione una Carrera:</label>
          <select
            id="carrera-select"
            className="select-carrera-list"
            value={carreraSeleccionada}
            onChange={(e) => setCarreraSeleccionada(e.target.value)}
            disabled={loading}
          >
            {carreras.map((carrera) => (
              <option key={carrera.id_car} value={carrera.id_car}>
                {carrera.nom_car}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn-descargar"
          onClick={descargarPDF}
          disabled={loadingPDF || !carreraSeleccionada}
        >
          {loadingPDF ? "Generando PDF..." : "Descargar Reporte PDF"}
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Cargando datos de la carrera...</p>
        </div>
      ) : (
        <>
          {/* Sección de estadísticas de participación */}
          <div className="estadisticas-container">
            <h3>Estadísticas de Participación</h3>

            {datosEstadisticos ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Estudiantes</h4>{" "}
                  <div className="stat-value">
                    {datosEstadisticos.totalEstudiantes || 0}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Inscripciones Totales</h4>{" "}
                  <div className="stat-value">
                    {datosEstadisticos.totalInscripciones || 0}{" "}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Eventos Participados</h4>
                  <div className="stat-value">
                    {datosEstadisticos.eventosParticipados || 0}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>% de Participación</h4>{" "}
                  <div className="stat-value">
                    {Math.round(datosEstadisticos.porcentajeParticipacion) || 0}
                    %
                  </div>
                </div>
              </div>
            ) : (
              <p>No hay estadísticas disponibles para esta carrera.</p>
            )}
          </div>
          {/* Sección de eventos populares */}
          <div className="eventos-populares-container">
            <h3>Eventos Más Populares</h3>

            {eventosPorCarrera.length > 0 ? (
              <div className="eventos-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Fecha</th>
                      <th>Inscripciones</th>
                      <th>Asistencias</th>
                      <th>% Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosPorCarrera.map((evento) => (
                      <tr key={evento.id_eve}>
                        <td>{evento.nom_eve}</td>{" "}
                        <td>
                          {new Date(evento.fec_ini_eve).toLocaleDateString(
                            "es-ES"
                          )}
                        </td>{" "}
                        <td>{evento.totalInscritos || 0}</td>
                        <td>{evento.totalAsistieron || 0}</td>
                        <td>{evento.porcentajeAsistencia || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay eventos registrados para esta carrera.</p>
            )}
          </div>{" "}
          {/* Sección de comparativa con otras carreras */}
          <div className="comparativa-carreras-container">
            <h3>Comparativa con otras carreras</h3>

            {datosEstadisticos && datosEstadisticos.comparativaCarreras ? (
              <div className="comparativa-grid">
                {datosEstadisticos.comparativaCarreras.map((carrera) => (
                  <div
                    className={`comparativa-card ${
                      carrera.id_car === carreraSeleccionada ? "selected" : ""
                    }`}
                    key={carrera.id_car}
                  >
                    <h4>{carrera.nom_car}</h4>
                    <div className="comparativa-stats">
                      <div>
                        <span>Estudiantes:</span> {carrera.totalEstudiantes}
                      </div>
                      <div>
                        <span>Inscripciones:</span> {carrera.totalInscripciones}
                      </div>
                      <div>
                        <span>Participación:</span>{" "}
                        {carrera.porcentajeParticipacion}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay datos comparativos disponibles con otras carreras.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteCarrera;
