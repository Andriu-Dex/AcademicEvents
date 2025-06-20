import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosConfig";
import { CheckSquare, Download, BarChart } from "lucide-react";
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

  // Cargar lista de eventos
  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/admin/reportes-evento");

        // Asegurar que res.data sea un array
        const eventosData = Array.isArray(res.data) ? res.data : [];
        setEventos(eventosData);

        // Seleccionar el primer evento por defecto si existe
        if (eventosData.length > 0) {
          setEventoSeleccionado(eventosData[0].id_eve);
        }
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        toast.error("Error al cargar la lista de eventos");
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
        const comparativaData = Array.isArray(resComparativa.data)
          ? resComparativa.data
          : [];
        setComparativaEventos(comparativaData);

        // Cargar análisis de no-shows
        const resNoShows = await axiosInstance.get(
          `/admin/reportes-asistencia/no-shows`,
          {
            params: { tipo: tipoEvento },
          }
        );
        const noShowsData = Array.isArray(resNoShows.data)
          ? resNoShows.data
          : [];
        setNoShowsAnalisis(noShowsData);
      } catch (error) {
        console.error("Error al cargar datos de asistencia:", error);
        toast.error("Error al cargar datos de asistencia");
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
    <div className="reporte-asistencia-container-ra">
      <div className="reporte-header-ra">
        <h2>
          <CheckSquare size={24} className="icon-header-ra" />
          Reportes de Asistencia
        </h2>
      </div>
      <p className="reporte-descripcion-ra">
        Análisis comparativo de asistencia vs inscripciones en eventos
      </p>
      <p className="reporte-subdescripcion-ra">
        Análisis de asistencia, comparativas entre eventos y análisis de
        no-shows
      </p>
      {/* Filtros */}
      <div className="filtros-container-ra">
        <div className="filtros-grupo-ra">
          <div className="filtro-grupo-ra">
            <label>Evento:</label>
            <select
              value={eventoSeleccionado}
              onChange={(e) => setEventoSeleccionado(e.target.value)}
              disabled={loading}
              className="select-control-ra"
            >
              <option value="">Todos los eventos</option>
              {Array.isArray(eventos) &&
                eventos.map((evento) => (
                  <option key={evento.id_eve} value={evento.id_eve}>
                    {evento.nom_eve}
                  </option>
                ))}
            </select>
          </div>

          <div className="filtro-grupo-ra">
            <label>Tipo de Evento:</label>
            <select
              value={tipoEvento}
              onChange={(e) => setTipoEvento(e.target.value)}
              disabled={loading || eventoSeleccionado !== ""}
              className="select-control-ra"
            >
              <option value="todos">Todos los tipos</option>
              <option value="CURSO">Curso</option>
              <option value="CONGRESO">Congreso</option>
              <option value="WEBINAR">Webinar</option>
              <option value="CHARLA">Charla</option>
              <option value="SOCIALIZACION">Socialización</option>
            </select>
          </div>
        </div>

        <button
          className="btn-descargar-ra"
          onClick={descargarPDF}
          disabled={loadingPDF}
        >
          <Download size={16} className="icon-btn-ra" />
          {loadingPDF ? "Generando PDF..." : "Descargar Reporte PDF"}
        </button>
      </div>
      {loading ? (
        <div className="loading-container-ra">
          <div className="spinner-ra"></div>
          <p className="loading-text-ra">Cargando datos de asistencia...</p>
        </div>
      ) : (
        <>
          {/* Sección de porcentajes de asistencia */}
          {eventoSeleccionado && datosAsistencia && (
            <div className="asistencia-container-ra">
              <h3 className="seccion-titulo-ra">
                <CheckSquare size={18} className="icon-seccion-ra" />
                Porcentaje de Asistencia vs Inscripciones
              </h3>

              <div className="evento-info-ra">
                <h4>{datosAsistencia.nombreEvento}</h4>
                <p className="evento-fecha-ra">
                  {new Date(datosAsistencia.fechaEvento).toLocaleDateString(
                    "es-ES"
                  )}
                </p>
              </div>

              <div className="stats-grid-ra">
                <div className="stat-card-ra">
                  <h4>Total Inscripciones</h4>
                  <div className="stat-value-ra">
                    {datosAsistencia.totalInscritos}
                  </div>
                </div>
                <div className="stat-card-ra">
                  <h4>Total Asistencias</h4>
                  <div className="stat-value-ra">
                    {datosAsistencia.totalAsistencias}
                  </div>
                </div>
                <div className="stat-card-ra">
                  <h4>No Asistieron</h4>
                  <div className="stat-value-ra">
                    {datosAsistencia.totalNoAsistieron}
                  </div>
                </div>
                <div className="stat-card-ra">
                  <h4>% Asistencia</h4>
                  <div className="stat-value-ra asistencia-porcentaje-ra">
                    {formatearPorcentaje(datosAsistencia.porcentajeAsistencia)}
                  </div>
                </div>
              </div>

              <div className="barra-asistencia-container-ra">
                <div className="barra-label-ra">Proporción de Asistencia</div>
                <div className="barra-asistencia-ra">
                  <div
                    className="barra-asistencia-fill-ra"
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
          <div className="comparativa-container-ra">
            <h3 className="seccion-titulo-ra">
              <BarChart size={18} className="icon-seccion-ra" />
              Comparativa de Asistencia entre Eventos
            </h3>

            {comparativaEventos.length > 0 ? (
              <div className="comparativa-tabla-ra">
                <table className="tabla-datos-ra">
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
                    {Array.isArray(comparativaEventos) &&
                      comparativaEventos.map((evento) => (
                        <tr key={evento.id_eve}>
                          <td className="nombre-evento-ra">
                            {evento.nombreEvento}
                          </td>
                          <td className="tipo-evento-ra">
                            {evento.tipoEvento}
                          </td>
                          <td className="fecha-evento-ra">
                            {new Date(evento.fechaEvento).toLocaleDateString(
                              "es-ES"
                            )}
                          </td>
                          <td className="valor-numerico-ra">
                            {evento.totalInscritos}
                          </td>
                          <td className="valor-numerico-ra">
                            {evento.totalAsistencias}
                          </td>
                          <td
                            className={
                              evento.porcentajeAsistencia >= 0.8
                                ? "alta-asistencia-ra"
                                : evento.porcentajeAsistencia >= 0.5
                                ? "media-asistencia-ra"
                                : "baja-asistencia-ra"
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
              <p className="mensaje-sin-datos-ra">
                No hay datos comparativos disponibles.
              </p>
            )}
          </div>

          {/* Sección de análisis de no-shows */}
          <div className="noshows-container-ra">
            <h3 className="seccion-titulo-ra">
              <CheckSquare size={18} className="icon-seccion-ra" />
              Análisis de No-Shows por Tipo de Evento
            </h3>

            {Array.isArray(noShowsAnalisis) && noShowsAnalisis.length > 0 ? (
              <div className="noshows-grid-ra">
                {noShowsAnalisis.map((tipo, index) => (
                  <div className="noshow-card-ra" key={index}>
                    <h4 className="tipo-evento-titulo-ra">{tipo.tipoEvento}</h4>
                    <div className="noshow-stats-ra">
                      <div className="stat-item-ra">
                        <span className="stat-label-ra">Eventos:</span>
                        <span className="stat-valor-ra">
                          {tipo.cantidadEventos}
                        </span>
                      </div>
                      <div className="stat-item-ra">
                        <span className="stat-label-ra">
                          Total Inscripciones:
                        </span>
                        <span className="stat-valor-ra">
                          {tipo.totalInscritos}
                        </span>
                      </div>
                      <div className="stat-item-ra">
                        <span className="stat-label-ra">No-Shows:</span>
                        <span className="stat-valor-ra">
                          {tipo.totalNoShows}
                        </span>
                      </div>
                      <div className="stat-item-ra">
                        <span className="stat-label-ra">% No-Shows:</span>
                        <span className="stat-valor-destacado-ra">
                          {formatearPorcentaje(tipo.porcentajeNoShows)}
                        </span>
                      </div>
                    </div>
                    <div className="barra-noshow-ra">
                      <div
                        className="barra-noshow-fill-ra"
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
              <p className="mensaje-sin-datos-ra">
                No hay datos de análisis de no-shows disponibles.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteAsistencia;
