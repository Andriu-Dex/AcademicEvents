import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import "./styles/AdminReporteDetalle.css";

const AdminReporteDetalle = () => {
    const { id_eve } = useParams();
    const navigate = useNavigate();
    const [reporte, setReporte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    const descargarPDF = async () => {
        setDownloadingPDF(true);
        document.body.style.cursor = "wait"; // Cambia el cursor a "cargando"
        try {
            const response = await axiosInstance.get(`/admin/reportes-evento/pdf/${id_eve}`);
            const { nom_eve, pdf } = response.data;
            const byteCharacters = atob(pdf);
            const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const fileName = `Reporte ${nom_eve}.pdf`;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            alert("No se pudo descargar el reporte PDF.\n" + error.message);
            console.error(error);
        } finally {
            setDownloadingPDF(false);
            document.body.style.cursor = "default"; // Regresa el cursor a normal
        }
    };

    useEffect(() => {
        const fetchReporte = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/admin/reportes-evento/${id_eve}`);
                setReporte(res.data);
            } catch {
                setReporte(null);
            } finally {
                setLoading(false);
            }
        };
        fetchReporte();
    }, [id_eve]);

    if (loading) {
        return <div className="reporte-loading">Cargando reporte...</div>;
    }
    if (!reporte) {
        return <div className="reporte-error">No se pudo cargar el reporte.</div>;
    }

    const { cab_eve, det_ins } = reporte;

    return (
        <div className="reporte-detalle-container">
            {/* Volver */}
            <button className="reporte-btn-volver" onClick={() => navigate("/admin/reportes-evento")}>
                &larr; Volver a Reportes
            </button>

            {/* Cabecera evento */}
            <div className="reporte-cabecera">
                <div className="reporte-info">
                    <h2 className="reporte-titulo">{cab_eve.nom_eve}</h2>
                    <div className="info-evento-detalle">
                        <div>
                            <p><b>Creador:</b> {cab_eve.cre_eve.nom_usu} {cab_eve.cre_eve.ape_usu}</p>
                        </div>
                        <div>
                            <p><b>Duración:</b> {cab_eve.dur_hor_eve} horas</p>
                        </div>
                        <div>
                            <p><b>Fecha inicio:</b> {cab_eve.fec_ini_eve.slice(0, 10)}</p>
                        </div>
                        <div>
                            <p><b>Fecha fin:</b> {cab_eve.fec_fin_eve.slice(0, 10)}</p>
                        </div>
                    </div>
                </div>
                <div className="reporte-img-box">
                    <img src={cab_eve.img_por_eve} alt="img evento" />
                </div>
            </div>

            {/* Participantes */}
            <div className="reporte-participantes">
                <h3>Detalle de los Inscritos al evento</h3>
                <table>
                    <thead>
                        <tr>
                            <th>N°</th> {/* Nueva columna */}
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Asistencia (%)</th>
                            {cab_eve.tip_eve === "CURSO" && <th>Nota</th>}
                            <th>Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {det_ins.map((ins, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td> {/* Número de fila comenzando en 1 */}
                                <td>{ins.ced_usu}</td>
                                <td>{ins.nom_usu}</td>
                                <td>{ins.ape_usu}</td>
                                <td>{ins.por_asi_fin_usu ?? '-'}</td>
                                {cab_eve.tip_eve === "CURSO" && (
                                    <td>{ins.not_fin_usu ?? '-'}</td>
                                )}
                                <td>{ins.est_ins}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                className="reporte-btn-descargar"
                onClick={descargarPDF}
                disabled={downloadingPDF}
                style={{ opacity: downloadingPDF ? 0.7 : 1, pointerEvents: downloadingPDF ? "none" : "auto" }}
            >
                {downloadingPDF ? "Generando PDF..." : "Descargar PDF"}
            </button>
        </div>
    );
};

export default AdminReporteDetalle;
