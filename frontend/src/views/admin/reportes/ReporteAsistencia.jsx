import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosConfig";
import {
  CheckSquare,
  Download,
  Filter,
  ArrowLeft,
  BarChart2,
} from "lucide-react";
import { toast } from "react-toastify";
import "./styles/ReporteAsistencia.css";

const ReporteAsistencia = () => {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  const [tipoEvento, setTipoEvento] = useState("todos");
  const [datosAsistencia, setDatosAsistencia] = useState(null);
  const [comparativaEventos, setComparativaEventos] = useState([]);
  const [noShowsAnalisis, setNoShowsAnalisis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const navigate = useNavigate();

  // Cargar lista de eventos
  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/admin/eventos");
        setEventos(res.data);

        // Seleccionar el primer evento por defecto si existe
        if (res.data && res.data.length > 0) {
          setEventoSeleccionado(res.data[0].id_eve);
        }
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, []);

  // Cargar datos cuando cambia el evento seleccionado o tipo de evento
  useEffect(() => {
    if (!eventoSeleccionado && tipoEvento === "todos") return;

    const cargarDatosAsistencia = async () => {
      try {
        setLoading(true);

        // Si se seleccionó un evento específico
        if (eventoSeleccionado) {
          const resAsistencia = await axiosInstance.get(
            `/admin/reportes-asistencia/evento/${eventoSeleccionado}`
          );
          setDatosAsistencia(resAsistencia.data);
        }

        // Cargar comparativa entre eventos (por tipo o todos)
        const resComparativa = await axiosInstance.get(
          `/admin/reportes-asistencia/comparativa`,
          {
            params: { tipo: tipoEvento },
          }
        );
        setComparativaEventos(resComparativa.data);

        // Cargar análisis de no-shows
        const resNoShows = await axiosInstance.get(
          `/admin/reportes-asistencia/no-shows`,
          {
            params: { tipo: tipoEvento },
          }
        );
        setNoShowsAnalisis(resNoShows.data);
      } catch (error) {
        console.error("Error al cargar datos de asistencia:", error);
        setDatosAsistencia(null);
        setComparativaEventos([]);
        setNoShowsAnalisis([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosAsistencia();
  }, [eventoSeleccionado, tipoEvento]);

  // Función para descargar el reporte en PDF
  const descargarPDF = async () => {
    try {
      setLoadingPDF(true);
      document.body.style.cursor = "wait";

      const params = eventoSeleccionado
        ? { evento: eventoSeleccionado }
        : { tipo: tipoEvento };

      const res = await axiosInstance.post(
        `/admin/reportes-asistencia/pdf`,
        params,
        { responseType: "blob" }
      );

      // Nombre del archivo
      const nombreArchivo = eventoSeleccionado
        ? `Reporte_Asistencia_Evento_${eventoSeleccionado}.pdf`
        : `Reporte_Asistencia_${
            tipoEvento !== "todos" ? tipoEvento : "General"
          }.pdf`;

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

  // Formatear porcentaje
  const formatearPorcentaje = (valor) => {
    return `${Math.round(valor * 100)}%`;
  };
  return (
    <div className="reporte-asistencia-container">
      <div className="reporte-header">
        <button className="btn-volver" onClick={() => navigate("/admin")}>
          <ArrowLeft size={18} />
          Volver al Dashboard
        </button>
        <h2>
          <CheckSquare size={24} className="icon-header" />
          Reportes de Asistencia
        </h2>
        <button
          className="btn-descargar"
          onClick={descargarPDF}
          disabled={loadingPDF}
        >
          <Download size={18} />
          {loadingPDF ? "Generando PDF..." : "Descargar Reporte"}
        </button>{" "}
      </div>

      <p className="reporte-descripcion">
        Análisis comparativo de asistencia vs inscripciones en eventos
      </p>
      <p>
        Análisis de asistencia, comparativas entre eventos y análisis de
        no-shows
      </p>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-grupo">
          <label>Evento:</label>
          <select
            value={eventoSeleccionado}
            onChange={(e) => setEventoSeleccionado(e.target.value)}
            disabled={loading}
          >
            <option value="">Todos los eventos</option>
            {eventos.map((evento) => (
              <option key={evento.id_eve} value={evento.id_eve}>
                {evento.nom_eve}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Tipo de Evento:</label>
          <select
            value={tipoEvento}
            onChange={(e) => setTipoEvento(e.target.value)}
            disabled={loading || eventoSeleccionado !== ""}
          >
            <option value="todos">Todos los tipos</option>
            <option value="CONGRESO">Congreso</option>
            <option value="SEMINARIO">Seminario</option>
            <option value="TALLER">Taller</option>
            <option value="CONFERENCIA">Conferencia</option>
            <option value="CURSO">Curso</option>
          </select>
        </div>

        <button
          className="btn-descargar"
          onClick={descargarPDF}
          disabled={loadingPDF}
        >
          {loadingPDF ? "Generando PDF..." : "Descargar Reporte PDF"}
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Cargando datos de asistencia...</p>
        </div>
      ) : (
        <>
          {/* Sección de porcentajes de asistencia */}
          {eventoSeleccionado && datosAsistencia && (
            <div className="asistencia-container">
              <h3>Porcentaje de Asistencia vs Inscripciones</h3>

              <div className="evento-info">
                <h4>{datosAsistencia.nombreEvento}</h4>
                <p className="evento-fecha">
                  {new Date(datosAsistencia.fechaEvento).toLocaleDateString(
                    "es-ES"
                  )}
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Inscripciones</h4>
                  <div className="stat-value">
                    {datosAsistencia.totalInscritos}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Total Asistencias</h4>
                  <div className="stat-value">
                    {datosAsistencia.totalAsistencias}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>No Asistieron</h4>
                  <div className="stat-value">
                    {datosAsistencia.totalNoAsistieron}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>% Asistencia</h4>
                  <div className="stat-value asistencia-porcentaje">
                    {formatearPorcentaje(datosAsistencia.porcentajeAsistencia)}
                  </div>
                </div>
              </div>

              <div className="barra-asistencia-container">
                <div className="barra-label">Proporción de Asistencia</div>
                <div className="barra-asistencia">
                  <div
                    className="barra-asistencia-fill"
                    style={{
                      width: formatearPorcentaje(
                        datosAsistencia.porcentajeAsistencia
                      ),
                    }}
                  >
                    {formatearPorcentaje(datosAsistencia.porcentajeAsistencia)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección de comparativa entre eventos */}
          <div className="comparativa-container">
            <h3>Comparativa de Asistencia entre Eventos</h3>

            {comparativaEventos.length > 0 ? (
              <div className="comparativa-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Inscripciones</th>
                      <th>Asistencias</th>
                      <th>% Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparativaEventos.map((evento) => (
                      <tr key={evento.id_eve}>
                        <td>{evento.nombreEvento}</td>
                        <td>{evento.tipoEvento}</td>
                        <td>
                          {new Date(evento.fechaEvento).toLocaleDateString(
                            "es-ES"
                          )}
                        </td>
                        <td>{evento.totalInscritos}</td>
                        <td>{evento.totalAsistencias}</td>
                        <td
                          className={
                            evento.porcentajeAsistencia >= 0.8
                              ? "alta-asistencia"
                              : evento.porcentajeAsistencia >= 0.5
                              ? "media-asistencia"
                              : "baja-asistencia"
                          }
                        >
                          {formatearPorcentaje(evento.porcentajeAsistencia)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay datos comparativos disponibles.</p>
            )}
          </div>

          {/* Sección de análisis de no-shows */}
          <div className="noshows-container">
            <h3>Análisis de No-Shows por Tipo de Evento</h3>

            {noShowsAnalisis.length > 0 ? (
              <div className="noshows-grid">
                {noShowsAnalisis.map((tipo, index) => (
                  <div className="noshow-card" key={index}>
                    <h4>{tipo.tipoEvento}</h4>
                    <div className="noshow-stats">
                      <div>
                        <span>Eventos:</span> {tipo.cantidadEventos}
                      </div>
                      <div>
                        <span>Total Inscripciones:</span> {tipo.totalInscritos}
                      </div>
                      <div>
                        <span>No-Shows:</span> {tipo.totalNoShows}
                      </div>
                      <div>
                        <span>% No-Shows:</span>{" "}
                        {formatearPorcentaje(tipo.porcentajeNoShows)}
                      </div>
                    </div>
                    <div className="barra-noshow">
                      <div
                        className="barra-noshow-fill"
                        style={{
                          width: formatearPorcentaje(tipo.porcentajeNoShows),
                        }}
                      >
                        {formatearPorcentaje(tipo.porcentajeNoShows)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay datos de análisis de no-shows disponibles.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteAsistencia;
