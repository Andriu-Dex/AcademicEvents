import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosConfig";
import { Award, Download, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import { formatDateForReports } from "../../../utils/dateUtils";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { downloadBlobFile } from "../../../utils/fileDownload";
import "./styles/ReporteCertificados.css";

// Registrar el idioma
registerLocale("es", es);

const ReporteCertificados = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumenCertificados, setResumenCertificados] = useState(null);
  const [descargasPorPeriodo, setDescargasPorPeriodo] = useState([]);
  const [eventosCertificados, setEventosCertificados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  useDocumentTitle("Reporte de Certificados");

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const fechaActual = new Date();
    const fechaFinDate = new Date(fechaActual);

    const fechaInicioDate = new Date(fechaActual);
    fechaInicioDate.setMonth(fechaInicioDate.getMonth() - 1);

    setFechaInicio(fechaInicioDate);
    setFechaFin(fechaFinDate);
  }, []);

  // Cargar datos cuando cambian las fechas
  useEffect(() => {
    if (!fechaInicio || !fechaFin) return;

    const cargarDatosCertificados = async () => {
      try {
        setLoading(true);

        // Formatear fechas para el backend usando la función específica para reportes
        const fechaInicioStr = formatDateForReports(fechaInicio);
        const fechaFinStr = formatDateForReports(fechaFin);

        // Cargar resumen de certificados
        const resResumen = await axiosInstance.get(
          `/admin/reports/certificates/summary`,
          {
            params: { fechaInicio: fechaInicioStr, fechaFin: fechaFinStr },
          }
        );
        setResumenCertificados(resResumen.data);

        // Cargar estadísticas de descargas por período
        const resDescargas = await axiosInstance.get(
          `/admin/reports/certificates/downloads`,
          {
            params: { fechaInicio: fechaInicioStr, fechaFin: fechaFinStr },
          }
        );
        setDescargasPorPeriodo(resDescargas.data);

        // Cargar eventos con mayor emisión de certificados
        const resEventos = await axiosInstance.get(
          `/admin/reports/certificates/events`,
          {
            params: { fechaInicio: fechaInicioStr, fechaFin: fechaFinStr },
          }
        );
        setEventosCertificados(resEventos.data);
      } catch (error) {
        console.error("Error al cargar datos de certificados:", error);
        toast.error("Error al cargar los datos de certificados");
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

      // Formatear fechas para el backend usando la función específica para reportes
      const fechaInicioStr = formatDateForReports(fechaInicio);
      const fechaFinStr = formatDateForReports(fechaFin);

      const res = await axiosInstance.post(
        `/admin/reports/certificates/pdf`,
        {
          fechaInicio: fechaInicioStr,
          fechaFin: fechaFinStr,
        },
        { responseType: "blob" }
      );

      // Nombre del archivo
      const nombreArchivo = `Reporte_Certificados_${fechaInicioStr}_al_${fechaFinStr}.pdf`;

      // Descargar el archivo
      await downloadBlobFile(res.data, nombreArchivo, "application/pdf");

      toast.success("Reporte PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      toast.error("No se pudo descargar el reporte. Intente nuevamente.");
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
        <div className="periodo-grupo-rc">
          <label>Período:</label>
          <div className="fecha-inputs-rc">
            <div className="fecha-input-wrapper-rc">
              <span>Desde:</span>
              <div className="input-with-icon-rc date-picker-container-rc">
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
                  className="date-picker-input-rc"
                  maxDate={fechaFin}
                />
              </div>
            </div>
            <div className="fecha-input-wrapper-rc">
              <span>Hasta:</span>
              <div className="input-with-icon-rc date-picker-container-rc">
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
                  className="date-picker-input-rc"
                  minDate={fechaInicio}
                />
              </div>
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
        <div className="loading-container-rc">
          <p>Cargando datos de certificados...</p>
        </div>
      ) : (
        <>
          {/* Sección de resumen de certificados */}
          <div className="resumen-container-rc">
            <h3>Certificados Emitidos por Período</h3>

            {resumenCertificados ? (
              <div className="stats-grid-rc">
                <div className="stat-card-rc">
                  <h4>Total Certificados</h4>
                  <div className="stat-value-rc">
                    {resumenCertificados.totalCertificados}
                  </div>
                </div>
                <div className="stat-card-rc">
                  <h4>Certificados Descargados</h4>
                  <div className="stat-value-rc">
                    {resumenCertificados.certificadosDescargados}
                  </div>
                  <div className="stat-percentage-rc">
                    {Math.round(
                      (resumenCertificados.certificadosDescargados /
                        resumenCertificados.totalCertificados) *
                        100 || 0
                    )}
                    %
                  </div>
                </div>
                <div className="stat-card-rc">
                  <h4>Eventos con Certificados</h4>
                  <div className="stat-value-rc">
                    {resumenCertificados.eventosConCertificados}
                  </div>
                </div>
                <div className="stat-card-rc">
                  <h4>Promedio por Evento</h4>
                  <div className="stat-value-rc">
                    {Math.round(
                      resumenCertificados.promedioCertificadosPorEvento || 0
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>No hay datos de certificados disponibles para este período.</p>
            )}
          </div>

          {/* Sección de estadísticas de descarga */}
          <div className="descargas-container-rc">
            <h3>Estadísticas de Descarga de Certificados</h3>

            {descargasPorPeriodo.length > 0 ? (
              <div className="descargas-grid-rc">
                {descargasPorPeriodo.map((periodo, index) => (
                  <div className="descarga-card-rc" key={index}>
                    <h4>{periodo.periodo}</h4>
                    <div className="descarga-stats-rc">
                      <div className="descarga-stat-rc">
                        <span>Certificados Emitidos:</span>
                        <strong>{periodo.certificadosEmitidos}</strong>
                      </div>
                      <div className="descarga-stat-rc">
                        <span>Certificados Descargados:</span>
                        <strong>{periodo.certificadosDescargados}</strong>
                      </div>
                      <div className="descarga-stat-rc">
                        <span>Porcentaje de Descarga:</span>
                        <strong>
                          {Math.round(periodo.porcentajeDescarga * 100)}%
                        </strong>
                      </div>
                    </div>
                    <div className="barra-descarga-rc">
                      <div
                        className="barra-descarga-fill-rc"
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
          <div className="eventos-certificados-container-rc">
            <h3>Eventos con Mayor Emisión de Certificados</h3>

            {eventosCertificados.length > 0 ? (
              <div className="eventos-tabla-rc">
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
                              100 || 0
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
