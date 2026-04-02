import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../api/axiosConfig";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { downloadBlobFile } from "../../../utils/fileDownload";
import "./styles/AdminReporteMes.css";

const MONTHS = [
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

const getCurrentYear = () => new Date().getFullYear();

const AdminReporteMes = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(getCurrentYear());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useDocumentTitle("Reporte Mensual de Eventos");

  const years = useMemo(() => {
    const availableYears = [];

    for (let current = getCurrentYear() - 3; current <= getCurrentYear() + 2; current += 1) {
      availableYears.push(current);
    }

    return availableYears;
  }, []);

  useEffect(() => {
    const loadMonthlyReport = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.post("/admin/reports/month", {
          anio: year,
          mes: month,
        });

        setEvents(Array.isArray(response.data?.eve) ? response.data.eve : []);
        setMonthlyTotal(response.data?.tot_tod_eve ?? 0);
      } catch (error) {
        console.error("Error al cargar el reporte mensual:", error);
        setEvents([]);
        setMonthlyTotal(0);
        toast.error("No se pudo cargar el reporte mensual. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    loadMonthlyReport();
  }, [month, year]);

  const handleDownloadMonthlyPdf = async () => {
    try {
      setLoadingPdf(true);
      document.body.style.cursor = "wait";

      const response = await axiosInstance.post(
        "/admin/reports/month/pdf",
        { anio: year, mes: month },
        { responseType: "blob" }
      );

      await downloadBlobFile(
        response.data,
        `Reporte_Mensual_${MONTHS[month - 1]}_${year}.pdf`,
        "application/pdf"
      );

      toast.success("Reporte PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar el reporte mensual:", error);
      toast.error("No se pudo descargar el reporte PDF. Intente nuevamente.");
    } finally {
      setLoadingPdf(false);
      document.body.style.cursor = "default";
    }
  };

  return (
    <div className="reporte-mes-container">
      <h2 className="reporte-mes-title">Reporte Mensual de Eventos</h2>

      <div className="reporte-mes-filtros">
        <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
          {MONTHS.map((label, index) => (
            <option key={label} value={index + 1}>
              {label}
            </option>
          ))}
        </select>

        <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
          {years.map((optionYear) => (
            <option key={optionYear} value={optionYear}>
              {optionYear}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="reporte-mes-loading">Cargando reporte...</div>
      ) : (
        <table className="reporte-mes-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre del Evento</th>
              <th>Valor ($)</th>
              <th>Tipo</th>
              <th>Fecha Fin</th>
              <th>Inscritos</th>
              <th>Creador</th>
              <th>Total Evento ($)</th>
            </tr>
          </thead>

          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={8} className="reporte-mes-empty">
                  No hay eventos para este mes y año.
                </td>
              </tr>
            ) : (
              events.map((eventItem, index) => (
                <tr key={`${eventItem?.id_eve || eventItem?.nom_eve || "evento"}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{eventItem?.nom_eve ?? "-"}</td>
                  <td>{eventItem?.val_eve ?? 0}</td>
                  <td>{eventItem?.tip_eve ?? "-"}</td>
                  <td>{eventItem?.fec_fin_eve?.split?.("T")?.[0] ?? "-"}</td>
                  <td>{eventItem?.can_ins ?? 0}</td>
                  <td>{`${eventItem?.nom_cre ?? "-"} ${eventItem?.ape_cre ?? ""}`.trim()}</td>
                  <td>{eventItem?.tot_eve ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>

          {events.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={7} className="reporte-mes-total-label">
                  Total del mes:
                </td>
                <td className="reporte-mes-total-value">{monthlyTotal}</td>
              </tr>
            </tfoot>
          )}
        </table>
      )}

      {events.length > 0 && (
        <button
          type="button"
          className="reporte-btn-descargar"
          onClick={handleDownloadMonthlyPdf}
          disabled={loadingPdf}
        >
          {loadingPdf ? "Generando PDF..." : "Descargar Reporte PDF"}
        </button>
      )}
    </div>
  );
};

export default AdminReporteMes;
