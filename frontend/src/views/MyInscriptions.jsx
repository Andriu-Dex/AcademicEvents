import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

import {
  BadgeCheck,
  Clock,
  Ban,
  FileText,
  Download,
  Upload,
} from "lucide-react";

const estadoLabel = {
  PENDIENTE: {
    text: "Pendiente",
    icon: <Clock size={16} />,
    color: "text-yellow-600",
  },
  ACEPTADA: {
    text: "Aceptada",
    icon: <BadgeCheck size={16} />,
    color: "text-green-600",
  },
  RECHAZADA: {
    text: "Rechazada",
    icon: <Ban size={16} />,
    color: "text-red-600",
  },
  FINALIZADA: {
    text: "Finalizada",
    icon: <FileText size={16} />,
    color: "text-blue-600",
  },
};

const MyInscriptions = () => {
  const { usuario, token } = useAuth();

  const [inscripciones, setInscripciones] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState(null);
  const [nuevoArchivo, setNuevoArchivo] = useState(null);
  const [reenviando, setReenviando] = useState(false);

  const obtenerInscripciones = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/inscripciones/${usuario.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInscripciones(res.data);
    } catch (error) {
      console.error("Error al obtener inscripciones:", error);
      toast.error("Error al cargar inscripciones");
    }
  };

  useEffect(() => {
    if (usuario) {
      obtenerInscripciones();
    }
  }, [usuario]);

  const reenviarComprobante = async () => {
    if (!nuevoArchivo) {
      toast.error("Debes seleccionar un archivo para reenviar.");
      return;
    }

    if (nuevoArchivo.size > 5 * 1024 * 1024) {
      toast.error("El archivo no debe superar los 5MB.");
      return;
    }

    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(nuevoArchivo.type)) {
      toast.error("Archivo no permitido. Solo PDF o imágenes JPG/PNG/WEBP");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", nuevoArchivo);

    try {
      setReenviando(true);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/inscripciones/reenviar/${
          inscripcionSeleccionada.id_ins
        }`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Comprobante reenviado correctamente");
      await obtenerInscripciones();
      setMostrarModal(false);
      setNuevoArchivo(null);
      setInscripcionSeleccionada(null);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al reenviar comprobante");
    } finally {
      setReenviando(false);
    }
  };

  const inscripcionesOrdenadas = [...inscripciones].sort(
    (a, b) => new Date(a.evento.fec_ini_eve) - new Date(b.evento.fec_ini_eve)
  );

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Mis inscripciones</h2>

      {inscripciones.length === 0 ? (
        <p className="text-gray-600">Aún no estás inscrito en ningún evento.</p>
      ) : (
        <div className="grid gap-5">
          {inscripcionesOrdenadas.map((ins) => (
            <div
              key={ins.id_ins}
              className="border rounded-lg shadow-sm p-4 bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {ins.evento.nom_eve}
                </h3>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    estadoLabel[ins.estado].color
                  }`}
                >
                  {estadoLabel[ins.estado].icon}
                  {estadoLabel[ins.estado].text}
                </span>
              </div>

              <p className="text-sm text-gray-600">
                Tipo: {ins.evento.tip_eve} | Fecha:{" "}
                {new Date(ins.evento.fec_ini_eve).toLocaleDateString("es-EC")} –{" "}
                {new Date(ins.evento.fec_fin_eve).toLocaleDateString("es-EC")}
              </p>

              {ins.estado === "FINALIZADA" && (
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() =>
                      window.open(`/api/certificados/${ins.id_ins}`, "_blank")
                    }
                    className="inline-flex items-center gap-2 text-sm text-blue-700 font-medium hover:underline"
                  >
                    <Download size={16} />
                    Descargar certificado
                  </button>

                  {ins.cert_enviado ? (
                    <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                      <BadgeCheck size={14} /> Enviado
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Clock size={14} /> No enviado
                    </span>
                  )}
                </div>
              )}

              {(ins.estado === "RECHAZADA" || ins.estado === "PENDIENTE") && (
                <button
                  className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black"
                  onClick={() => {
                    setInscripcionSeleccionada(ins);
                    setMostrarModal(true);
                  }}
                >
                  <Upload size={16} />
                  Reenviar comprobante
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">
              Reenviar comprobante para:{" "}
              {inscripcionSeleccionada.evento.nom_eve}
            </h2>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setNuevoArchivo(e.target.files[0])}
              className="modal-input"
            />

            {nuevoArchivo && (
              <p className="text-sm text-gray-600 mt-1">
                Archivo: <strong>{nuevoArchivo.name}</strong>
              </p>
            )}

            <div className="modal-botones mt-4 flex gap-3">
              <button
                className="btn-inscribirme"
                onClick={reenviarComprobante}
                disabled={reenviando}
              >
                {reenviando ? "Enviando..." : "Enviar"}
              </button>
              <button
                className="btn-cancelar"
                onClick={() => {
                  setMostrarModal(false);
                  setNuevoArchivo(null);
                  setInscripcionSeleccionada(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInscriptions;
