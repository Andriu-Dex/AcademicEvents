import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosConfig";
import { Award, Download } from "lucide-react";
import { toast } from "react-toastify";
import "./styles/ReporteCertificados.css";

const ReporteCertificados = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [resumenCertificados, setResumenCertificados] = useState(null);
  const [descargasPorPeriodo, setDescargasPorPeriodo] = useState([]);
  const [eventosCertificados, setEventosCertificados] = useState([]);
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

  // Cargar datos cuando cambian las fechas
  useEffect(() => {
    if (!fechaInicio || !fechaFin) return;

    const cargarDatosCertificados = async () => {
      try {
        setLoading(true);

        // Cargar resumen de certificados
        const resResumen = await axiosInstance.get(
          `/admin/reportes-certificados/resumen`,
          {
            params: { fechaInicio, fechaFin },
          }
        );
        setResumenCertificados(resResumen.data);

        // Cargar estadísticas de descargas por período
        const resDescargas = await axiosInstance.get(
          `/admin/reportes-certificados/descargas`,
          {
            params: { fechaInicio, fechaFin },
          }
        );
        setDescargasPorPeriodo(resDescargas.data);

        // Cargar eventos con mayor emisión de certificados
        const resEventos = await axiosInstance.get(
          `/admin/reportes-certificados/eventos`,
          {
            params: { fechaInicio, fechaFin },
          }
        );
        setEventosCertificados(resEventos.data);
      } catch (error) {
        console.error("Error al cargar datos de certificados:", error);
        setResumenCertificados(null);
        setDescargasPorPeriodo([]);
        setEventosCertificados([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosCertificados();
  }, [fechaInicio, fechaFin]);

  // Función para descargar el reporte en PDF
  const descargarPDF = async () => {
    if (!fechaInicio || !fechaFin) return;

    try {
      setLoadingPDF(true);
      document.body.style.cursor = "wait";

      const res = await axiosInstance.post(
        `/admin/reportes-certificados/pdf`,
        {
          fechaInicio,
          fechaFin,
        },
        { responseType: "blob" }
      );

      // Nombre del archivo
      const nombreArchivo = `Reporte_Certificados_${fechaInicio}_al_${fechaFin}.pdf`;

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
    return fecha.toLocaleDateString("es-ES");
  };
  return (
    <div className="reporte-certificados-container-rc">
      <div className="reporte-header-rc">
        <h2>
          <Award size={24} className="icon-header-rc" />
          Reportes de Certificados
        </h2>
      </div>

      <p className="reporte-descripcion-rc">
        Análisis de emisión y descarga de certificados por período
      </p>

      {/* Filtros */}
      <div className="filtros-container-rc">
        <div className="filtro-grupo-rc">
          <label>Período:</label>
          <div className="fecha-inputs-rc">
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
        </div>

        <button
          className="btn-descargar-rc"
          onClick={descargarPDF}
          disabled={loadingPDF || !fechaInicio || !fechaFin}
        >
          {loadingPDF ? "Generando PDF..." : "Descargar Reporte PDF"}
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Cargando datos de certificados...</p>
        </div>
      ) : (
        <>
          {/* Sección de resumen de certificados */}
          <div className="resumen-container">
            <h3>Certificados Emitidos por Período</h3>

            {resumenCertificados ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Certificados</h4>
                  <div className="stat-value">
                    {resumenCertificados.totalCertificados}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Certificados Descargados</h4>
                  <div className="stat-value">
                    {resumenCertificados.certificadosDescargados}
                  </div>
                  <div className="stat-percentage">
                    {Math.round(
                      (resumenCertificados.certificadosDescargados /
                        resumenCertificados.totalCertificados) *
                        100
                    )}
                    %
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Eventos con Certificados</h4>
                  <div className="stat-value">
                    {resumenCertificados.eventosConCertificados}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Promedio por Evento</h4>
                  <div className="stat-value">
                    {Math.round(
                      resumenCertificados.promedioCertificadosPorEvento
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>No hay datos de certificados disponibles para este período.</p>
            )}
          </div>

          {/* Sección de estadísticas de descarga */}
          <div className="descargas-container">
            <h3>Estadísticas de Descarga de Certificados</h3>

            {descargasPorPeriodo.length > 0 ? (
              <div className="descargas-grid">
                {descargasPorPeriodo.map((periodo, index) => (
                  <div className="descarga-card" key={index}>
                    <h4>{periodo.periodo}</h4>
                    <div className="descarga-stats">
                      <div className="descarga-stat">
                        <span>Certificados Emitidos:</span>
                        <strong>{periodo.certificadosEmitidos}</strong>
                      </div>
                      <div className="descarga-stat">
                        <span>Certificados Descargados:</span>
                        <strong>{periodo.certificadosDescargados}</strong>
                      </div>
                      <div className="descarga-stat">
                        <span>Porcentaje de Descarga:</span>
                        <strong>
                          {Math.round(periodo.porcentajeDescarga * 100)}%
                        </strong>
                      </div>
                    </div>
                    <div className="barra-descarga">
                      <div
                        className="barra-descarga-fill"
                        style={{
                          width: `${Math.round(
                            periodo.porcentajeDescarga * 100
                          )}%`,
                        }}
                      >
                        {Math.round(periodo.porcentajeDescarga * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay datos de descargas disponibles para este período.</p>
            )}
          </div>

          {/* Sección de eventos con mayor emisión */}
          <div className="eventos-certificados-container">
            <h3>Eventos con Mayor Emisión de Certificados</h3>

            {eventosCertificados.length > 0 ? (
              <div className="eventos-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Certificados Emitidos</th>
                      <th>Certificados Descargados</th>
                      <th>% Descarga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosCertificados.map((evento) => (
                      <tr key={evento.id_eve}>
                        <td>{evento.nombreEvento}</td>
                        <td>{evento.tipoEvento}</td>
                        <td>{formatearFecha(evento.fechaEvento)}</td>
                        <td>{evento.certificadosEmitidos}</td>
                        <td>{evento.certificadosDescargados}</td>
                        <td>
                          {Math.round(
                            (evento.certificadosDescargados /
                              evento.certificadosEmitidos) *
                              100
                          )}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>
                No hay datos de eventos con certificados disponibles para este
                período.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteCertificados;
