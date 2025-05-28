import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { lanzarConfetti } from "../utils/confetti";
import "./styles/MyInscriptions.css";

import {
  BadgeCheck,
  Clock,
  Ban,
  FileText,
  Download,
  Upload,
  FileUp,
} from "lucide-react";

const estadoLabel = {
  PENDIENTE: {
    text: "Pendiente",
    icon: <Clock size={16} />,
    color: "estado-pendiente",
  },
  ACEPTADA: {
    text: "Aceptada",
    icon: <BadgeCheck size={16} />,
    color: "estado-aceptada",
  },
  RECHAZADA: {
    text: "Rechazada",
    icon: <Ban size={16} />,
    color: "estado-rechazada",
  },
  FINALIZADA: {
    text: "Finalizada",
    icon: <FileText size={16} />,
    color: "estado-finalizada",
  },
};

const MyInscriptions = () => {
  const { usuario, token } = useAuth();

  const [inscripciones, setInscripciones] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState(null);
  const [nuevoArchivo, setNuevoArchivo] = useState(null);
  const [reenviando, setReenviando] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState(
    "Ningún archivo seleccionado"
  );

  const obtenerInscripciones = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/inscripciones/propias`,
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
    if (usuario) obtenerInscripciones();
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
    if (!tiposPermitidos.includes(nuevoArchivo.type))
      return toast.error("Archivo no permitido. Solo PDF o imágenes.");

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
    <div className="myins-container">
      <h2 className="myins-title">Mis inscripciones</h2>

      {inscripciones.length === 0 ? (
        <p className="myins-empty">Aún no estás inscrito en ningún evento.</p>
      ) : (
        <div className="myins-grid">
          {inscripcionesOrdenadas.map((ins) => (
            <div key={ins.id_ins} className="myins-card">
              <div className="myins-header">
                <h3 className="myins-event-name">{ins.evento.nom_eve}</h3>
                <span
                  className={`myins-estado ${estadoLabel[ins.estado].color}`}
                >
                  {estadoLabel[ins.estado].icon}
                  {estadoLabel[ins.estado].text}
                </span>
              </div>

              <p className="myins-datos">
                Tipo: {ins.evento.tip_eve} <br />
                Fecha:{" "}
                {new Date(ins.evento.fec_ini_eve).toLocaleDateString(
                  "es-EC"
                )} –{" "}
                {new Date(ins.evento.fec_fin_eve).toLocaleDateString("es-EC")}
              </p>

              {ins.estado === "FINALIZADA" && (
                <div className="myins-certificado">
                  <button
                    onClick={() =>
                      window.open(`/api/certificados/${ins.id_ins}`, "_blank")
                    }
                    className="btn-descargar"
                  >
                    <Download size={16} />
                    Descargar certificado
                  </button>

                  {ins.cert_enviado ? (
                    <span className="cert-enviado">
                      <BadgeCheck size={14} /> Enviado
                    </span>
                  ) : (
                    <span className="cert-pendiente">
                      <Clock size={14} /> No enviado
                    </span>
                  )}
                </div>
              )}

              {ins.estado === "ACEPTADA" && (
                <button
                  className="btn-felicitaciones"
                  onClick={() => lanzarConfetti()}
                >
                  ¡Felicitaciones!
                </button>
              )}

              {(ins.estado === "RECHAZADA" || ins.estado === "PENDIENTE") && (
                <button
                  className="btn-reenviar"
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title-mi">
              Reenviar comprobante para: <br />
              {inscripcionSeleccionada.evento.nom_eve}
            </h2>

            <div className="archivo-container">
              <input
                type="file"
                id="archivo"
                className="input-archivo"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setNuevoArchivo(e.target.files[0])}
              />

              <div className="archivo-subida">
                <label htmlFor="archivo" className="btn-subir">
                  <FileUp size={16} style={{ marginRight: 6 }} /> Seleccionar
                  archivo
                </label>

                {!nuevoArchivo && (
                  <span className="placeholder-archivo">
                    Ningún archivo seleccionado
                  </span>
                )}
              </div>

              {nuevoArchivo && (
                <div className="archivo-info">
                  <span className="archivo-nombre">
                    <strong>Archivo:</strong> {nuevoArchivo.name}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-botones">
              <button
                className="btn-enviar"
                onClick={reenviarComprobante}
                disabled={reenviando}
              >
                {reenviando ? "Enviando..." : "Enviar"}
              </button>
              <button
                className="btn-cancelar-mi"
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
// Andriu 3 Dex
