import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosConfig";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";
import { toast } from "react-toastify";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import {
  formatDateForBackend,
  formatDateForPicker,
  formatDateForReports,
} from "../../../utils/dateUtils";
import "./styles/ReporteIngresosPagos.css";

// Registrar el idioma español
registerLocale("es", es);

/*
LÓGICA DEL SISTEMA DE PAGOS CORREGIDA:
1. Usuario se inscribe a evento de pago
2. Usuario sube comprobante de pago → inscripción pasa a estado "PENDIENTE"
3. Admin revisa y acepta/rechaza el comprobante:
   - Si se acepta: inscripción pasa a "ACEPTADA" (pago confirmado)
   - Si se rechaza: inscripción pasa a "RECHAZADA" (pago no confirmado)
4. Durante/después del evento, el estado puede cambiar a:
   - APROBADO (usuario completó exitosamente → pago ya confirmado)
   - REPROBADO_NOTA (no alcanzó nota mínima → pago ya confirmado)
   - REPROBADO_ASISTENCIA (no cumplió asistencia → pago ya confirmado)
   - REPROBADO_TOTAL (reprobó completamente → pago ya confirmado)

ESTADOS QUE GENERAN INGRESOS CONFIRMADOS:
- ACEPTADA, APROBADO, REPROBADO_NOTA, REPROBADO_ASISTENCIA, REPROBADO_TOTAL

ESTADOS PENDIENTES:
- PENDIENTE (comprobante subido, esperando validación)

ESTADOS SIN INGRESO:
- RECHAZADA (comprobante rechazado por admin)

TASA DE CONVERSIÓN:
- Porcentaje de inscripciones con pagos confirmados vs total de inscripciones
- Indica qué tan efectivo es el proceso de cobro
*/

const ReporteIngresosPagos = () => {
  // Estados para almacenar datos del reporte
  const [metricsGenerales, setMetricsGenerales] = useState(null);
  const [ingresosPorTipo, setIngresosPorTipo] = useState([]);
  const [eventosRentables, setEventosRentables] = useState([]);
  const [tendenciasPeriodo, setTendenciasPeriodo] = useState([]);
  const [comprobantesRechazados, setComprobantesRechazados] = useState([]);
  // Estados para los filtros
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [filtros, setFiltros] = useState({
    tipoEvento: "todos",
    estadoPago: "todos",
  }); // Estados para carga
  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  // Efecto para establecer fechas por defecto
  useEffect(() => {
    const fechaActual = new Date();
    const fechaFinDate = new Date(fechaActual);
    const fechaInicioDate = new Date(fechaActual);
    fechaInicioDate.setMonth(fechaInicioDate.getMonth() - 1);

    setFechaInicio(fechaInicioDate);
    setFechaFin(fechaFinDate);
  }, []);

  // Efecto para cargar datos cuando cambien filtros o fechas
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarDatosReporte();
    }
  }, [filtros, fechaInicio, fechaFin]); // Función para cargar todos los datos del reporte
  // Los parámetros enviados al backend deben interpretarse así:
  // - estadoPago: "CONFIRMADO" = estados con pago confirmado (ACEPTADA, APROBADO, REPROBADO_*)
  // - estadoPago: "PENDIENTE" = comprobantes esperando validación
  // - estadoPago: "RECHAZADO" = comprobantes rechazados por admin
  const cargarDatosReporte = async () => {
    try {
      setLoading(true);

      // Construir parámetros con fechas y filtros
      const params = {
        ...filtros,
        fechaDesde: fechaInicio ? formatDateForBackend(fechaInicio) : "",
        fechaHasta: fechaFin ? formatDateForBackend(fechaFin) : "",
      };

      // Cargar métricas generales
      const resMetricas = await axiosInstance.get(
        "/admin/reportes-ingresos/metricas-generales",
        { params }
      );
      setMetricsGenerales(resMetricas.data);

      // Cargar ingresos por tipo de evento
      const resIngresosTipo = await axiosInstance.get(
        "/admin/reportes-ingresos/ingresos-por-tipo",
        { params }
      );
      setIngresosPorTipo(resIngresosTipo.data);

      // Cargar eventos más rentables
      const resEventosRentables = await axiosInstance.get(
        "/admin/reportes-ingresos/eventos-rentables",
        { params }
      );
      setEventosRentables(resEventosRentables.data);

      // Cargar tendencias por período
      const resTendencias = await axiosInstance.get(
        "/admin/reportes-ingresos/tendencias-periodo",
        { params }
      );
      setTendenciasPeriodo(resTendencias.data);

      // Cargar comprobantes rechazados
      const resComprobantes = await axiosInstance.get(
        "/admin/reportes-ingresos/comprobantes-rechazados",
        { params }
      );
      setComprobantesRechazados(resComprobantes.data);
    } catch (error) {
      console.error("Error al cargar datos del reporte:", error);
      toast.error("Error al cargar el reporte. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  // Manejador para cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  // Formatear moneda
  const formatearMoneda = (valor) => {
    return `$${valor.toFixed(2)}`;
  };
  // Formatear porcentaje
  const formatearPorcentaje = (valor) => {
    return `${Math.round(valor * 100)}%`;
  };
  // Función para descargar el reporte en PDF
  const descargarPDF = async () => {
    if (!fechaInicio || !fechaFin) return;

    try {
      setLoadingPDF(true);
      document.body.style.cursor = "wait";

      // Formatear fechas para el backend
      const fechaInicioStr = formatDateForReports(fechaInicio);
      const fechaFinStr = formatDateForReports(fechaFin);

      // Petición al endpoint del PDF
      const res = await axiosInstance.post(
        "/admin/reportes-ingresos/pdf",
        {
          ...filtros,
          fechaDesde: fechaInicioStr,
          fechaHasta: fechaFinStr,
        },
        { responseType: "blob" }
      );

      // Nombre personalizado para el archivo
      const nombreArchivo = `Reporte_Ingresos_${fechaInicioStr}_al_${fechaFinStr}.pdf`;

      // Descargar el blob como archivo
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
      toast.error("No se pudo descargar el reporte. Intente nuevamente.");
    } finally {
      setLoadingPDF(false);
      document.body.style.cursor = "default";
    }
  };

  return (
    <div className="reporte-ingresos-container-rip">
      <div className="reporte-header-rip">
        <h2>
          <DollarSign size={24} className="icon-header-rip" />
          Reportes de Ingresos y Pagos Realizados
        </h2>
      </div>
      <p className="reporte-descripcion-rip">
        Análisis financiero de eventos, ingresos por tipo y tendencias de pagos
      </p>{" "}
      {/* Filtros */}
      <div className="filtros-container-rip">
        {/* Fila 1: Período de fechas */}
        <div className="filtros-row-rip">
          <div className="periodo-grupo-rip">
            <label>Período:</label>
            <div className="fecha-inputs-rip">
              <div className="fecha-input-wrapper-rip">
                <span>Desde:</span>
                <div className="input-with-icon-rip date-picker-container-rip">
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
                    className="date-picker-input-rip"
                    maxDate={fechaFin}
                  />
                </div>
              </div>
              <div className="fecha-input-wrapper-rip">
                <span>Hasta:</span>
                <div className="input-with-icon-rip date-picker-container-rip">
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
                    className="date-picker-input-rip"
                    minDate={fechaInicio}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2: Otros filtros */}
        <div className="filtros-row-rip">
          <div className="filtro-grupo-rip">
            <label>Tipo de Evento:</label>
            <select
              name="tipoEvento"
              value={filtros.tipoEvento}
              className="select-tipo-evento-rip"
              onChange={handleFiltroChange}
              disabled={loading}
            >
              <option value="todos">Todos los tipos</option>
              <option value="CURSO">Curso</option>
              <option value="CONGRESO">Congreso</option>
              <option value="WEBINAR">Webinar</option>
              <option value="CHARLA">Charla</option>
              <option value="SOCIALIZACION">Socialización</option>
            </select>
          </div>{" "}
          <div className="filtro-grupo-rip">
            <label>Estado de Pago:</label>
            <select
              name="estadoPago"
              className="select-estado-pago-rip"
              value={filtros.estadoPago}
              onChange={handleFiltroChange}
              disabled={loading}
            >
              <option value="todos">Todos los estados</option>
              <option value="CONFIRMADO">Pagos Confirmados</option>
              <option value="PENDIENTE">Pagos Pendientes</option>
              <option value="RECHAZADO">Pagos Rechazados</option>
            </select>
          </div>{" "}
          <button
            className="btn-descargar-rip"
            onClick={descargarPDF}
            disabled={loadingPDF || loading || !fechaInicio || !fechaFin}
            style={{
              opacity: loadingPDF ? 0.7 : 1,
              pointerEvents: loadingPDF ? "none" : "auto",
            }}
          >
            <Download size={16} />
            {loadingPDF ? "Generando PDF..." : "Descargar Reporte PDF"}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="loading-container-rip">
          <p>Cargando datos de ingresos y pagos...</p>
        </div>
      ) : (
        <>
          {/* Sección de métricas generales */}
          {metricsGenerales && (
            <div className="metricas-container-rip">
              <h3>Métricas Financieras Generales</h3>{" "}
              <div className="stats-grid-rip">
                <div className="stat-card-rip">
                  <h4>Ingresos Totales</h4>
                  <div className="stat-value-rip">
                    {formatearMoneda(metricsGenerales.revenueTotal)}
                  </div>
                </div>
                <div className="stat-card-rip">
                  <h4>Pagos Confirmados</h4>
                  <div className="stat-value-rip">
                    {formatearMoneda(metricsGenerales.pagosConfirmados)}
                  </div>
                </div>
                <div className="stat-card-rip">
                  <h4>Pagos Pendientes</h4>
                  <div className="stat-value-rip">
                    {formatearMoneda(metricsGenerales.pagosPendientes)}
                  </div>
                </div>
                <div className="stat-card-rip">
                  <h4>Tasa de Conversión</h4>
                  <div className="stat-value-rip">
                    {formatearPorcentaje(metricsGenerales.tasaConversion)}
                  </div>
                </div>
              </div>
              <div className="metricas-adicionales-rip">
                <div>
                  <span>Total Inscripciones:</span>{" "}
                  {metricsGenerales.totalInscripciones}
                </div>
                <div>
                  <span>Comprobantes Rechazados:</span>{" "}
                  {metricsGenerales.comprobantesRechazados}
                </div>
              </div>
            </div>
          )}

          {/* Sección de ingresos por tipo de evento */}
          <div className="ingresos-tipo-container-rip">
            <h3>Ingresos por Tipo de Evento</h3>

            {ingresosPorTipo.length > 0 ? (
              <div className="ingresos-tabla-rip">
                <table>
                  {" "}
                  <thead>
                    <tr>
                      <th>Tipo de Evento</th>
                      <th>Eventos</th>
                      <th>Inscripciones</th>
                      <th>Ingresos Totales</th>
                      <th>Ingresos Confirmados</th>
                      <th>Ingresos Pendientes</th>
                      <th>Promedio por Evento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresosPorTipo.map((tipo, index) => (
                      <tr key={index}>
                        <td>{tipo.tipoEvento}</td>
                        <td>{tipo.cantidadEventos}</td>
                        <td>{tipo.inscripcionesTotales}</td>
                        <td>{formatearMoneda(tipo.revenueTotal)}</td>
                        <td>{formatearMoneda(tipo.revenueConfirmado)}</td>
                        <td>{formatearMoneda(tipo.revenuePendiente)}</td>
                        <td>
                          {formatearMoneda(tipo.promedioRevenuePorEvento)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay datos de ingresos disponibles.</p>
            )}
          </div>

          {/* Sección de eventos más rentables */}
          <div className="eventos-rentables-container-rip">
            <h3>Top 10 Eventos Más Rentables</h3>

            {eventosRentables.length > 0 ? (
              <div className="rentables-tabla-rip">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Tipo</th> <th>Valor</th>
                      <th>Inscripciones</th>
                      <th>Pagos Confirmados</th>
                      <th>Ingresos Totales</th>
                      <th>Tasa Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosRentables.map((evento) => (
                      <tr key={evento.id_eve}>
                        <td>{evento.nombreEvento}</td>
                        <td>{evento.tipoEvento}</td>
                        <td>{formatearMoneda(evento.valorEvento)}</td>
                        <td>{evento.inscripcionesTotales}</td>
                        <td>{evento.inscripcionesConfirmadas}</td>
                        <td>{formatearMoneda(evento.revenueTotal)}</td>
                        <td
                          className={
                            evento.tasaConversion > 0.9
                              ? "alta-conversion-rip"
                              : evento.tasaConversion > 0.7
                              ? "media-conversion-rip"
                              : "baja-conversion-rip"
                          }
                        >
                          {formatearPorcentaje(evento.tasaConversion)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay datos de eventos rentables disponibles.</p>
            )}
          </div>

          {/* Sección de tendencias por período */}
          <div className="tendencias-container-rip">
            <h3>Tendencias de Ingresos por Período</h3>

            {tendenciasPeriodo.length > 0 ? (
              <div className="tendencias-grid-rip">
                <div className="tendencias-grafico-rip">
                  <h4>Evolución de Ingresos</h4>
                  <div className="grafico-barras-rip">
                    {tendenciasPeriodo.map((periodo, index) => (
                      <div className="barra-container-rip" key={index}>
                        <div className="barra-label-rip">{periodo.periodo}</div>
                        <div className="barra-valor-rip">
                          {formatearMoneda(periodo.revenueTotal)}
                        </div>
                        <div className="barra-grafico-rip">
                          <div
                            className="barra-confirmado-rip"
                            style={{
                              width: `${
                                (periodo.revenueConfirmado /
                                  periodo.revenueTotal) *
                                100
                              }%`,
                            }}
                          ></div>
                          <div
                            className="barra-pendiente-rip"
                            style={{
                              width: `${
                                (periodo.revenuePendiente /
                                  periodo.revenueTotal) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="leyenda-grafico-rip">
                    <div className="leyenda-item-rip">
                      <div className="color-muestra confirmado-rip"></div>
                      <span>Confirmado</span>
                    </div>
                    <div className="leyenda-item-rip">
                      <div className="color-muestra pendiente-rip"></div>
                      <span>Pendiente</span>
                    </div>
                  </div>
                </div>

                <div className="tendencias-tabla-rip">
                  <table>
                    <thead>
                      <tr>
                        {" "}
                        <th>Período</th>
                        <th>Eventos</th>
                        <th>Inscripciones</th>
                        <th>Ingresos</th>
                        <th>Tasa Conversión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tendenciasPeriodo.map((periodo, index) => (
                        <tr key={index}>
                          <td>{periodo.periodo}</td>
                          <td>{periodo.cantidadEventos}</td>
                          <td>{periodo.inscripcionesTotales}</td>
                          <td>{formatearMoneda(periodo.revenueTotal)}</td>
                          <td>{formatearPorcentaje(periodo.tasaConversion)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p>No hay datos de tendencias disponibles.</p>
            )}
          </div>

          {/* Sección de comprobantes rechazados */}
          <div className="rechazados-container-rip">
            <h3>Análisis de Comprobantes Rechazados</h3>

            {comprobantesRechazados.length > 0 ? (
              <div className="rechazados-grid-rip">
                {comprobantesRechazados.map((periodo, index) => (
                  <div className="rechazos-card-rip" key={index}>
                    <h4>{periodo.fechaPeriodo}</h4>
                    <div className="rechazos-stats-rip">
                      <div className="rechazo-principal-rip">
                        <span>Total Rechazados:</span> {periodo.totalRechazados}
                      </div>{" "}
                      <div className="rechazo-impacto-rip">
                        <span>Impacto Financiero:</span>{" "}
                        {formatearMoneda(periodo.impactoRevenue)}
                      </div>
                    </div>

                    <div className="motivos-rechazo-rip">
                      <h5>Motivos de Rechazo:</h5>
                      <ul>
                        {periodo.motivosRechazo.map((motivo, i) => (
                          <li key={i}>
                            <span>{motivo.motivo}:</span> {motivo.cantidad}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay datos de comprobantes rechazados disponibles.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteIngresosPagos;
