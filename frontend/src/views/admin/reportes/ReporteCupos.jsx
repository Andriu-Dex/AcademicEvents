import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosConfig";
import { Users, Download, Filter, ArrowLeft, PieChart } from "lucide-react";
import { toast } from "react-toastify";
import "./styles/ReporteCupos.css";

const ReporteCupos = () => {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  const [tipoEvento, setTipoEvento] = useState("todos");
  const [analisisOcupacion, setAnalisisOcupacion] = useState(null);
  const [eventosMayorDemanda, setEventosMayorDemanda] = useState([]);
  const [optimizacionCupos, setOptimizacionCupos] = useState([]);
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

    const cargarDatosCupos = async () => {
      try {
        setLoading(true);

        // Si se seleccionó un evento específico
        if (eventoSeleccionado) {
          const resOcupacion = await axiosInstance.get(
            `/admin/reportes-cupos/ocupacion/${eventoSeleccionado}`
          );
          setAnalisisOcupacion(resOcupacion.data);
        }

        // Cargar eventos con mayor demanda (por tipo o todos)
        const resDemanda = await axiosInstance.get(
          `/admin/reportes-cupos/demanda`,
          {
            params: { tipo: tipoEvento },
          }
        );
        setEventosMayorDemanda(resDemanda.data);

        // Cargar análisis de optimización de cupos
        const resOptimizacion = await axiosInstance.get(
          `/admin/reportes-cupos/optimizacion`,
          {
            params: { tipo: tipoEvento },
          }
        );
        setOptimizacionCupos(resOptimizacion.data);
      } catch (error) {
        console.error("Error al cargar datos de cupos:", error);
        setAnalisisOcupacion(null);
        setEventosMayorDemanda([]);
        setOptimizacionCupos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosCupos();
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
        `/admin/reportes-cupos/pdf`,
        params,
        { responseType: "blob" }
      );

      // Nombre del archivo
      const nombreArchivo = eventoSeleccionado
        ? `Reporte_Cupos_Evento_${eventoSeleccionado}.pdf`
        : `Reporte_Cupos_${
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
    <div className="reporte-cupos-container">
      <div className="reporte-header">
        <button className="btn-volver" onClick={() => navigate("/admin")}>
          <ArrowLeft size={18} />
          Volver al Dashboard
        </button>
        <h2>
          <Users size={24} className="icon-header" />
          Reportes de Cupos y Capacidad
        </h2>
        <button
          className="btn-descargar"
          onClick={descargarPDF}
          disabled={loadingPDF}
        >
          <Download size={18} />
          {loadingPDF ? "Generando PDF..." : "Descargar Reporte"}
        </button>
      </div>

      <p className="reporte-descripcion">
        Análisis de ocupación, demanda y optimización de cupos por evento
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
          <p>Cargando datos de cupos y capacidad...</p>
        </div>
      ) : (
        <>
          {/* Sección de análisis de ocupación */}
          {eventoSeleccionado && analisisOcupacion && (
            <div className="ocupacion-container">
              <h3>Análisis de Ocupación de Cupos</h3>

              <div className="evento-info">
                <h4>{analisisOcupacion.nombreEvento}</h4>
                <p className="evento-fecha">
                  {new Date(analisisOcupacion.fechaEvento).toLocaleDateString(
                    "es-ES"
                  )}
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Capacidad Total</h4>
                  <div className="stat-value">
                    {analisisOcupacion.capacidadTotal}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Cupos Ocupados</h4>
                  <div className="stat-value">
                    {analisisOcupacion.cuposOcupados}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Cupos Disponibles</h4>
                  <div className="stat-value">
                    {analisisOcupacion.cuposDisponibles}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>% Ocupación</h4>
                  <div className="stat-value ocupacion-porcentaje">
                    {formatearPorcentaje(analisisOcupacion.porcentajeOcupacion)}
                  </div>
                </div>
              </div>

              <div className="barra-ocupacion-container">
                <div className="barra-label">Ocupación de Cupos</div>
                <div className="barra-ocupacion">
                  <div
                    className="barra-ocupacion-fill"
                    style={{
                      width: formatearPorcentaje(
                        analisisOcupacion.porcentajeOcupacion
                      ),
                    }}
                  >
                    {formatearPorcentaje(analisisOcupacion.porcentajeOcupacion)}
                  </div>
                </div>
              </div>

              {analisisOcupacion.distribucionPorCarrera && (
                <div className="distribucion-carrera">
                  <h4>Distribución por Carrera</h4>
                  <div className="distribucion-grid">
                    {analisisOcupacion.distribucionPorCarrera.map(
                      (carrera, index) => (
                        <div className="distribucion-item" key={index}>
                          <div className="distribucion-nombre">
                            {carrera.nombreCarrera}
                          </div>
                          <div className="distribucion-valor">
                            {carrera.cantidadEstudiantes}
                          </div>
                          <div className="distribucion-porcentaje">
                            {formatearPorcentaje(carrera.porcentaje)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sección de eventos con mayor demanda */}
          <div className="demanda-container">
            <h3>Eventos con Mayor Demanda vs Capacidad</h3>

            {eventosMayorDemanda.length > 0 ? (
              <div className="demanda-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Tipo</th>
                      <th>Capacidad</th>
                      <th>Inscripciones</th>
                      <th>% Demanda</th>
                      <th>Lista de Espera</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosMayorDemanda.map((evento) => (
                      <tr key={evento.id_eve}>
                        <td>{evento.nombreEvento}</td>
                        <td>{evento.tipoEvento}</td>
                        <td>{evento.capacidadTotal}</td>
                        <td>{evento.totalInscripciones}</td>
                        <td
                          className={
                            evento.porcentajeDemanda > 1
                              ? "alta-demanda"
                              : evento.porcentajeDemanda >= 0.8
                              ? "media-demanda"
                              : "baja-demanda"
                          }
                        >
                          {formatearPorcentaje(evento.porcentajeDemanda)}
                        </td>
                        <td>{evento.listaEspera}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay datos de demanda disponibles.</p>
            )}
          </div>

          {/* Sección de optimización de cupos */}
          <div className="optimizacion-container">
            <h3>Optimización de Cupos por Tipo de Evento</h3>

            {optimizacionCupos.length > 0 ? (
              <div className="optimizacion-grid">
                {optimizacionCupos.map((tipo, index) => (
                  <div className="optimizacion-card" key={index}>
                    <h4>{tipo.tipoEvento}</h4>
                    <div className="optimizacion-stats">
                      <div>
                        <span>Eventos:</span> {tipo.cantidadEventos}
                      </div>
                      <div>
                        <span>Capacidad Promedio:</span>{" "}
                        {tipo.capacidadPromedio}
                      </div>
                      <div>
                        <span>Ocupación Promedio:</span>{" "}
                        {formatearPorcentaje(tipo.ocupacionPromedio)}
                      </div>
                      <div>
                        <span>Capacidad Óptima Sugerida:</span>{" "}
                        <strong>{tipo.capacidadOptimaSugerida}</strong>
                      </div>
                    </div>

                    <div className="optimizacion-recomendacion">
                      <h5>Recomendación:</h5>
                      <p>{tipo.recomendacion}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay datos de optimización disponibles.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteCupos;
