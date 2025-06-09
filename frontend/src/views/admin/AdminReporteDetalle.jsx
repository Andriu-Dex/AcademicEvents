import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import "./styles/AdminReporteDetalle.css";

const AdminReporteDetalle = () => {
    const { id_eve } = useParams();
    const navigate = useNavigate();
    const [reporte, setReporte] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReporte = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/admin/reportes/${id_eve}`);
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
            <button className="reporte-btn-volver" onClick={() => navigate("/admin/reportes")}>
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
        </div>
    );
};

export default AdminReporteDetalle;
