import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../../api/axiosConfig";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { downloadBlobFile } from "../../../utils/fileDownload";
import "./styles/AdminReporteDetalle.css";

const DEFAULT_EVENT_IMAGE =
  "https://via.placeholder.com/320x90?text=Sin+Imagen";

const AdminReporteDetalle = () => {
  const { id_eve } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useDocumentTitle("Reporte Detallado de Evento");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/admin/reports/event/${id_eve}`);
        setReport(response.data ?? null);
      } catch (error) {
        console.error("Error al cargar el reporte detallado:", error);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id_eve]);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      document.body.style.cursor = "wait";

      const response = await axiosInstance.get(`/admin/reports/event/pdf/${id_eve}`);
      const eventName = response.data?.nom_eve || "evento";
      const encodedPdf = response.data?.pdf;

      if (!encodedPdf) {
        throw new Error("El reporte PDF no está disponible.");
      }

      const byteCharacters = atob(encodedPdf);
      const byteNumbers = Array.from(byteCharacters, (character) =>
        character.charCodeAt(0)
      );
      const byteArray = new Uint8Array(byteNumbers);

      await downloadBlobFile(
        byteArray,
        `Reporte ${eventName}.pdf`,
        "application/pdf"
      );
      toast.success("Reporte PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar el reporte detallado:", error);
      toast.error("No se pudo descargar el reporte PDF. Intente nuevamente.");
    } finally {
      setDownloadingPdf(false);
      document.body.style.cursor = "default";
    }
  };

  if (loading) {
    return <div className="reporte-loading">Cargando reporte...</div>;
  }

  if (!report) {
    return <div className="reporte-error">No se pudo cargar el reporte.</div>;
  }

  const eventHeader = report?.cab_eve ?? {};
  const enrollments = Array.isArray(report?.det_ins) ? report.det_ins : [];
  const eventCreator = eventHeader?.cre_eve ?? {};
  const eventType = eventHeader?.tip_eve ?? "";
  const eventName = eventHeader?.nom_eve ?? "Evento sin nombre";
  const eventImage = eventHeader?.img_por_eve || DEFAULT_EVENT_IMAGE;
  const startDate = eventHeader?.fec_ini_eve?.slice?.(0, 10) ?? "-";
  const endDate = eventHeader?.fec_fin_eve?.slice?.(0, 10) ?? "-";

  return (
    <div className="reporte-detalle-container">
      <button
        type="button"
        className="reporte-btn-volver"
        onClick={() => navigate("/admin/reports/events")}
      >
        &larr; Volver a Reportes
      </button>

      <div className="reporte-cabecera">
        <div className="reporte-info">
          <h2 className="reporte-titulo">{eventName}</h2>
          <div className="info-evento-detalle">
            <div>
              <p>
                <b>Creador:</b> {eventCreator?.nom_usu ?? "-"}{" "}
                {eventCreator?.ape_usu ?? ""}
              </p>
            </div>
            <div>
              <p>
                <b>Duración:</b> {eventHeader?.dur_hor_eve ?? 0} horas
              </p>
            </div>
            <div>
              <p>
                <b>Fecha inicio:</b> {startDate}
              </p>
            </div>
            <div>
              <p>
                <b>Fecha fin:</b> {endDate}
              </p>
            </div>
          </div>
        </div>
        <div className="reporte-img-box">
          <img src={eventImage} alt={eventName} />
        </div>
      </div>

      <div className="reporte-participantes">
        <h3>Detalle de los inscritos al evento</h3>
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Asistencia (%)</th>
              {eventType === "CURSO" && <th>Nota</th>}
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment, index) => (
              <tr key={`${enrollment?.ced_usu || "ins"}-${index}`}>
                <td>{index + 1}</td>
                <td>{enrollment?.ced_usu ?? "-"}</td>
                <td>{enrollment?.nom_usu ?? "-"}</td>
                <td>{enrollment?.ape_usu ?? "-"}</td>
                <td>{enrollment?.por_asi_fin_usu ?? "-"}</td>
                {eventType === "CURSO" && (
                  <td>{enrollment?.not_fin_usu ?? "-"}</td>
                )}
                <td>{enrollment?.est_ins ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="reporte-btn-descargar"
        onClick={handleDownloadPdf}
        disabled={downloadingPdf}
        style={{
          opacity: downloadingPdf ? 0.7 : 1,
          pointerEvents: downloadingPdf ? "none" : "auto",
        }}
      >
        {downloadingPdf ? "Generando PDF..." : "Descargar PDF"}
      </button>
    </div>
  );
};

export default AdminReporteDetalle;
