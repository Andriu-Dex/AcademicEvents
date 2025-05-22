// Importa hooks y librerías necesarias
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
//import { useAuth } from "../context/AuthContext"; // Contexto de autenticación
import { useNavigate } from "react-router-dom"; // Hook para redirección
import { toast } from "react-toastify"; // Notificaciones tipo toast

// Íconos para representar el estado del certificado
import { CheckCircle, XCircle, MailCheck, MailWarning } from "lucide-react";

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
    }

    // Función asíncrona para obtener inscripciones del usuario
    const obtenerInscripciones = async () => {
      try {
        // Llamada al backend para obtener inscripciones del usuario
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/inscripciones/propias`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
      `${import.meta.env.VITE_API_URL}/api/certificados/${id_ins}`,
      "_blank"
    );
  };

  // Función para reenviar certificado por correo
  const reenviar = async (id_ins) => {
    setReenviando(id_ins); // Marca el certificado que se está reenviando
    try {
      // Solicitud para reenviar el certificado
      await axios.get(
        `${import.meta.env.VITE_API_URL}/api/certificados/enviar/${id_ins}`,

        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Certificados disponibles</h1>

      {/* Si no hay certificados, muestra mensaje */}
      {certificados.length === 0 ? (
        <p>No tienes certificados aún.</p>
      ) : (
        // Si hay certificados, muestra tabla con datos
        <table className="w-full border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Evento</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Itera sobre los certificados */}
            {certificados.map((insc) => (
              <tr key={insc.id_ins} className="border-t">
                <td className="p-2">{insc.evento.nom_eve}</td>
                <td className="p-2">{insc.evento.tip_eve}</td>
                <td className="p-2">
                  {/* Muestra si fue enviado o no con ícono y color */}
                  {insc.cert_enviado ? (
                    <span className="text-green-600 inline-flex items-center gap-1">
                      <CheckCircle size={18} /> Enviado
                    </span>
                  ) : (
                    <span className="text-red-600 inline-flex items-center gap-1">
                      <XCircle size={18} /> No enviado
                    </span>
                  )}
                </td>
                <td className="p-2 space-x-2">
                  {/* Botón para descargar el certificado */}
                  <button
                    onClick={() => descargar(insc.id_ins)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Descargar
                  </button>
                  {/* Botón para reenviar el certificado */}
                  <button
                    disabled={reenviando === insc.id_ins} // Desactiva si se está reenviando ese mismo certificado
                    onClick={() => reenviar(insc.id_ins)}
                    className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
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
