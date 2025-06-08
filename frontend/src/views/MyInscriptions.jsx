import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
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
  CalendarPlus,
  Search,
  AlertCircle,
  Mail,
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
  APROBADO: {
    text: "Aprobado",
    icon: <BadgeCheck size={16} />,
    color: "estado-finalizada",
  },
  REPROBADO_NOTA: {
    text: "Reprobado por nota",
    icon: <AlertCircle size={16} />,
    color: "estado-rechazada",
  },
  REPROBADO_ASISTENCIA: {
    text: "Reprobado por asistencia",
    icon: <AlertCircle size={16} />,
    color: "estado-rechazada",
  },
  REPROBADO_TOTAL: {
    text: "Reprobado",
    icon: <AlertCircle size={16} />,
    color: "estado-rechazada",
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
      const token = localStorage.getItem("token");

      const res = await axiosInstance.get("/inscripciones/propias");

      setInscripciones(res.data);
    } catch (error) {
      console.error("Error al obtener inscripciones:", error);
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
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

    const tiposPermitidos = ["image/jpeg", "image/png", "image/jpg"];
    if (!tiposPermitidos.includes(nuevoArchivo.type)) {
      toast.error("Archivo no permitido. Solo se permiten imágenes JPG o PNG.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", nuevoArchivo);
    try {
      setReenviando(true);
      console.log(
        `Enviando comprobante para inscripción ID: ${inscripcionSeleccionada.id_ins}`
      );

      const response = await axiosInstance.put(
        `/reenviar/${inscripcionSeleccionada.id_ins}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);
      toast.success("Comprobante reenviado correctamente");
      await obtenerInscripciones();
      setMostrarModal(false);
      setNuevoArchivo(null);
      setInscripcionSeleccionada(null);
    } catch (error) {
      console.error("Error al reenviar comprobante:", error);
      const errorMsg =
        error.response?.data?.msg || "Error al reenviar comprobante";
      toast.error(errorMsg);
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
        <div className="myins-empty-container">
          <div className="myins-empty-icon">
            <CalendarPlus size={60} color="#8a1538" />
          </div>
          <h3 className="myins-empty-title">No tienes inscripciones activas</h3>
          <p className="myins-empty-text">
            Aún no te has inscrito en ningún evento académico. ¡Descubre los
            eventos disponibles y empieza a construir tu trayectoria académica!
          </p>
          <button
            className="myins-empty-button"
            onClick={() => (window.location.href = "/eventos")}
          >
            <Search size={16} />
            Explorar eventos disponibles
          </button>
        </div>
      ) : (
        <div className="myins-grid">
          {inscripcionesOrdenadas.map((ins) => (
            <div key={ins.id_ins} className="myins-card">
              <div className="myins-header">
                {" "}
                <h3 className="myins-event-name">{ins.evento.nom_eve}</h3>
                <span
                  className={`myins-estado ${
                    estadoLabel[ins.est_ins]?.color || "estado-pendiente"
                  }`}
                >
                  {estadoLabel[ins.est_ins]?.icon || <Clock size={16} />}
                  {estadoLabel[ins.est_ins]?.text || ins.est_ins}
                </span>
              </div>
              <p className="myins-datos">
                Tipo: {ins.evento.tip_eve} <br /> Fecha:{" "}
                {new Date(ins.evento.fec_ini_eve).toLocaleDateString("es-EC")} –{" "}
                {new Date(ins.evento.fec_fin_eve).toLocaleDateString("es-EC")}
              </p>{" "}
              {/* Mostrar observación del administrador si existe */}
              {ins.observacion && (
                <div className="myins-observacion">
                  <div className="observacion-header">
                    <AlertCircle size={16} />
                    <span>Observación del administrador:</span>
                  </div>
                  <p className="observacion-texto">{ins.observacion}</p>
                </div>
              )}{" "}
              {ins.est_ins === "FINALIZADA" && (
                <div className="myins-certificado">
                  {" "}
                  <button
                    onClick={async () => {
                      try {
                        toast.info("Preparando certificado...");
                        // Hacer la petición a través de axios para que incluya el token
                        const response = await axiosInstance.get(
                          `/certificados/${ins.id_ins}`,
                          {
                            responseType: "blob", // Importante para manejar PDF
                          }
                        );

                        // Crear un blob URL para el PDF
                        const blob = new Blob([response.data], {
                          type: "application/pdf",
                        });
                        const url = window.URL.createObjectURL(blob);

                        // Abrir en una nueva pestaña
                        window.open(url, "_blank");
                      } catch (error) {
                        console.error("Error al descargar certificado:", error);
                        if (error.response?.status === 401) {
                          toast.error(
                            "Error de autenticación. Por favor vuelva a iniciar sesión"
                          );
                        } else {
                          toast.error(
                            "Error al descargar el certificado: " +
                              (error.response?.data?.msg || error.message)
                          );
                        }
                      }
                    }}
                    className="btn-descargar"
                  >
                    <Download size={16} />
                    Descargar certificado
                  </button>{" "}
                  <button
                    onClick={async () => {
                      try {
                        toast.info("Enviando certificado a tu correo...");
                        const response = await axiosInstance.post(
                          `/certificados/enviar/${ins.id_ins}`
                        );
                        toast.success(
                          "Certificado enviado a tu correo electrónico"
                        );
                      } catch (error) {
                        console.error(
                          "Error detallado:",
                          error.response?.data || error
                        );
                        toast.error(
                          `Error al enviar el certificado: ${
                            error.response?.data?.msg || error.message
                          }`
                        );
                      }
                    }}
                    className="btn-enviar-email"
                  >
                    <Mail size={16} />
                    Recibir por email
                  </button>
                </div>
              )}{" "}
              {ins.est_ins === "ACEPTADA" && (
                <button
                  className="btn-felicitaciones"
                  onClick={() => lanzarConfetti()}
                >
                  ¡Felicitaciones!
                </button>
              )}{" "}
              {ins.est_ins === "RECHAZADA" && (
                <div>
                  <button
                    className="btn-reenviar"
                    onClick={() => {
                      toast.info(
                        "Redirigiendo a eventos disponibles donde podrás volver a inscribirte",
                        {
                          autoClose: 3000,
                        }
                      );
                      window.location.href = "/eventos";
                    }}
                  >
                    <Upload size={16} />
                    Volver a inscribirme
                  </button>
                </div>
              )}
              {ins.est_ins === "PENDIENTE" && (
                <div className="myins-pendiente">
                  <Clock size={18} />
                  <p>
                    Tu inscripción está siendo revisada por el administrador
                  </p>
                </div>
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
