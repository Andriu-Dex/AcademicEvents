// Importa hooks y librerías necesarias
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom"; // Hook para redirección
import { toast } from "react-toastify"; // Notificaciones tipo toast
import { CheckCircle, XCircle, MailCheck, MailWarning } from "lucide-react";
import "./styles/CertificatesRoute.css";

// Componente principal para la ruta de certificados
const CertificatesRoute = () => {
  // Extrae información del usuario autenticado y token desde el hook de auth
  const { usuario, token } = useAuth();
  const navigate = useNavigate(); // Hook para navegación
  const [certificados, setCertificados] = useState([]); // Lista de certificados obtenidos
  const [loading, setLoading] = useState(true); // Estado de carga
  const [reenviando, setReenviando] = useState(null); // Estado para saber si se está reenviando un certificado

  // useEffect para ejecutar lógica al cargar el componente
  useEffect(() => {
    // Verifica si el usuario está autenticado
    console.log("Usuario autenticado:", usuario);

    // Si no hay usuario, redirige al login
    if (!usuario) return navigate("/login");

    // Si no hay token, redirige al login
    if (!usuario.id) {
      console.warn("El usuario no tiene ID, evitando llamada a la API");
      return;
    }    // Función asíncrona para obtener inscripciones del usuario
    const obtenerInscripciones = async () => {
      try {
        // Llamada al backend para obtener inscripciones del usuario
        const res = await axiosInstance.get("/inscripciones/propias");

        // Filtra solo las inscripciones que están finalizadas
        const finalizadas = res.data.filter((i) => i.estado === "FINALIZADA");
        setCertificados(finalizadas); // Guarda en estado
      } catch (error) {
        // Muestra error en consola si falla la solicitud
        console.error("Error al obtener certificados:", error);
        toast.error(
          <span className="inline-flex items-center gap-2 text-red-600">
            <XCircle size={18} /> Error al obtener certificados
          </span>
        );
      } finally {
        setLoading(false); // Desactiva la carga independientemente del resultado
      }
    };

    // Llama a la función de obtención de inscripciones
    obtenerInscripciones();
  }, [usuario]); // Se ejecuta cuando el usuario cambia
  // Función para abrir el certificado PDF en una nueva pestaña
  const descargar = (id_ins) => {
    window.open(
      `http://localhost:3001/api/certificados/${id_ins}`,
      "_blank"
    );
  };

  // Función para reenviar certificado por correo
  const reenviar = async (id_ins) => {
    setReenviando(id_ins); // Marca el certificado que se está reenviando
    try {      // Solicitud para reenviar el certificado
      await axiosInstance.get(`/certificados/enviar/${id_ins}`);
      // Muestra notificación de éxito
      toast.success(
        <span className="inline-flex items-center gap-2 text-green-600">
          <MailCheck size={18} /> Certificado reenviado con éxito
        </span>
      );
    } catch (error) {
      // Muestra notificación de error si falla
      toast.error(
        <span className="inline-flex items-center gap-2 text-red-600">
          <MailWarning size={18} /> Error al reenviar el certificado
        </span>
      );
    } finally {
      setReenviando(null); // Resetea el estado de reenviando
    }
  };

  // Muestra mensaje de carga si aún se están obteniendo los certificados
  if (loading) return <p>Cargando certificados...</p>;

  // Retorna la interfaz de usuario
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
            {certificados.map((insc) => (
              <tr key={insc.id_ins}>
                <td data-label="Evento">{insc.evento.nom_eve}</td>
                <td data-label="Tipo">{insc.evento.tip_eve}</td>
                <td data-label="Estado">
                  {insc.cert_enviado ? (
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
                    onClick={() => descargar(insc.id_ins)}
                    className="btn-descargar-cr"
                  >
                    Descargar
                  </button>
                  <button
                    disabled={reenviando === insc.id_ins}
                    onClick={() => reenviar(insc.id_ins)}
                    className="btn-reenviar-cr"
                  >
                    {reenviando === insc.id_ins ? "Reenviando..." : "Reenviar"}
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
// Exporta el componente como default
export default CertificatesRoute;
