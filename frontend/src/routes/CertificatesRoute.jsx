import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle, MailCheck, MailWarning, XCircle } from "lucide-react";
import axiosInstance from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import "./styles/CertificatesRoute.css";

const CERTIFICATE_ELIGIBLE_STATUSES = new Set([
  "APPROVED",
  "APROBADO",
  "FINALIZADA",
  "FINISHED",
]);

const normalizeCertificateItem = (item) => {
  const event = item.event || item.evento || {};
  const status = item.status || item.est_ins || "";

  return {
    id: item.id || item.id_ins,
    eventName: event.name || event.nom_eve || "Sin nombre",
    eventType: event.type || event.tip_eve || "-",
    status,
    certSent: Boolean(item.certificate || item.certificado || item.cert_enviado),
  };
};

const CertificatesRoute = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reenviando, setReenviando] = useState(null);

  useDocumentTitle("Certificados");

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }

    const obtenerInscripciones = async () => {
      try {
        const res = await axiosInstance.get("/inscripciones/propias");
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const normalizadas = data.map(normalizeCertificateItem);
        const finalizadas = normalizadas.filter((item) =>
          CERTIFICATE_ELIGIBLE_STATUSES.has(item.status)
        );

        setCertificados(finalizadas);
      } catch (error) {
        console.error("Error al obtener certificados:", error);
        toast.error(
          <span className="inline-flex items-center gap-2 text-red-600">
            <XCircle size={18} /> Error al obtener certificados
          </span>
        );
      } finally {
        setLoading(false);
      }
    };

    obtenerInscripciones();
  }, [usuario, navigate]);

  const descargar = (registrationId) => {
    const baseUrl =
      axiosInstance.defaults.baseURL || "http://localhost:3000/api";
    window.open(`${baseUrl}/certificados/${registrationId}`, "_blank");
  };

  const reenviar = async (registrationId) => {
    setReenviando(registrationId);

    try {
      await axiosInstance.get(`/certificados/enviar/${registrationId}`);
      toast.success(
        <span className="inline-flex items-center gap-2 text-green-600">
          <MailCheck size={18} /> Certificado reenviado con éxito
        </span>
      );
    } catch (error) {
      toast.error(
        <span className="inline-flex items-center gap-2 text-red-600">
          <MailWarning size={18} /> Error al reenviar el certificado
        </span>
      );
    } finally {
      setReenviando(null);
    }
  };

  if (loading) {
    return <p>Cargando certificados...</p>;
  }

  return (
    <div className="cert-container">
      <h1 className="cert-title">Certificados Disponibles</h1>
      {certificados.length === 0 ? (
        <p className="no-cert-msg">No tienes certificados aún.</p>
      ) : (
        <table className="cert-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {certificados.map((inscripcion) => (
              <tr key={inscripcion.id}>
                <td data-label="Evento">{inscripcion.eventName}</td>
                <td data-label="Tipo">{inscripcion.eventType}</td>
                <td data-label="Estado">
                  {inscripcion.certSent ? (
                    <span className="estado enviado">
                      <CheckCircle size={18} /> Enviado
                    </span>
                  ) : (
                    <span className="estado no-enviado">
                      <XCircle size={18} /> No enviado
                    </span>
                  )}
                </td>
                <td className="acciones" data-label="Acciones">
                  <button
                    type="button"
                    onClick={() => descargar(inscripcion.id)}
                    className="btn-descargar-cr"
                  >
                    Descargar
                  </button>
                  <button
                    type="button"
                    disabled={reenviando === inscripcion.id}
                    onClick={() => reenviar(inscripcion.id)}
                    className="btn-reenviar-cr"
                  >
                    {reenviando === inscripcion.id ? "Reenviando..." : "Reenviar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CertificatesRoute;
