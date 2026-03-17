import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";
import { lanzarConfetti } from "../utils/confetti";
import "./styles/MyInscriptions.css";
import CertificateViewer from "../components/CertificateViewer";

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
  Filter,
  X,
} from "lucide-react";

const LEGACY_REG_STATUS_TO_DB = {
  PENDIENTE: "PENDING",
  ACEPTADA: "ACCEPTED",
  RECHAZADA: "REJECTED",
  APROBADO: "APPROVED",
  REPROBADO_NOTA: "FAILED_GRADE",
  REPROBADO_ASISTENCIA: "FAILED_ATTENDANCE",
  REPROBADO_TOTAL: "FAILED_TOTAL",
};

const toDbStatus = (status) => LEGACY_REG_STATUS_TO_DB[status] || status;

const normalizeInscripcion = (item) => {
  const event = item.event || item.evento || {};
  const rawObservation = item.observation ?? item.observacion ?? null;

  return {
    id: item.id || item.id_ins,
    status: toDbStatus(item.status || item.est_ins),
    event: {
      id: event.id || event.id_eve,
      name: event.name || event.nom_eve || "Evento sin nombre",
      type: event.type || event.tip_eve || "N/A",
      startDate: event.startDate || event.fec_ini_eve,
      endDate: event.endDate || event.fec_fin_eve,
    },
    observation:
      typeof rawObservation === "string"
        ? rawObservation
        : rawObservation?.observation || rawObservation?.obs_ins || null,
  };
};

const estadoLabel = {
  PENDING: {
    text: "Pendiente",
    icon: <Clock size={16} />,
    color: "estado-pendiente",
  },
  ACCEPTED: {
    text: "Aceptada",
    icon: <BadgeCheck size={16} />,
    color: "estado-aceptada",
  },
  REJECTED: {
    text: "Rechazada",
    icon: <Ban size={16} />,
    color: "estado-rechazada",
  },
  APPROVED: {
    text: "Aprobado",
    icon: <BadgeCheck size={16} />,
    color: "estado-aprobado",
  },
  FAILED_GRADE: {
    text: "Reprobado por nota",
    icon: <AlertCircle size={16} />,
    color: "estado-reprobado-nota",
  },
  FAILED_ATTENDANCE: {
    text: "Reprobado por asistencia",
    icon: <AlertCircle size={16} />,
    color: "estado-reprobado-asistencia",
  },
  FAILED_TOTAL: {
    text: "Reprobado por completo",
    icon: <AlertCircle size={16} />,
    color: "estado-reprobado-total",
  },
};

const MyInscriptions = () => {
  const navigate = useNavigate();
  const { usuario, token } = useAuth();
  const { socket, isConnected } = useSocket();

  const [inscripciones, setInscripciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState(null);
  const [nuevoArchivo, setNuevoArchivo] = useState(null);
  const [reenviando, setReenviando] = useState(false);
  const [mostrarCertificado, setMostrarCertificado] = useState(false);
  const [certificadoUrl, setCertificadoUrl] = useState("");
  const [certificadoFileName, setCertificadoFileName] = useState("");

  // Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const inscripcionesPorPagina = 6; // Número de inscripciones por página

  const obtenerInscripciones = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axiosInstance.get("/inscripciones/propias");

      const data = Array.isArray(res.data) ? res.data : [];
      setInscripciones(data.map(normalizeInscripcion));
      setPaginaActual(1); // Reiniciar a la primera página al obtener nuevas inscripciones
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

  // Escuchar cambios de inscripciones en tiempo real
  useEffect(() => {
    if (!socket || !isConnected || !usuario) return;

    // Escuchar actualizaciones de inscripciones específicas para este usuario
    socket.on("user-inscription-update", (data) => {
      // Verificar que la actualización es para este usuario (por ID o por email)
      if (data.userId === usuario.id || data.userId === usuario.email) {
        // Actualizar la inscripción específica en el estado local
        setInscripciones((prevInscripciones) =>
          prevInscripciones.map((ins) =>
            ins.id === (data.data?.id || data.data?.id_ins)
              ? {
                  ...ins,
                  status: toDbStatus(
                    data.data?.status || data.data?.estadoNuevo
                  ),
                  observation:
                    data.data?.observation || data.data?.observacion || null,
                }
              : ins
          )
        );

        // Mostrar notificación al usuario sobre el cambio de estado
        const nuevoEstado = toDbStatus(
          data.data?.status || data.data?.estadoNuevo
        );
        const mensaje = `Tu inscripción ha sido ${
          estadoLabel[nuevoEstado]?.text.toLowerCase() ||
          nuevoEstado.toLowerCase()
        }`;

        toast.info(mensaje, {
          icon: estadoLabel[nuevoEstado]?.icon,
          className: `toast-${estadoLabel[nuevoEstado]?.color || "default"}-mi`,
        });

        // Mostrar confeti para estados positivos
        if (nuevoEstado === "ACCEPTED" || nuevoEstado === "APPROVED") {
          lanzarConfetti();
        }
      }
    });

    return () => {
      socket.off("user-inscription-update");
    };
  }, [socket, isConnected, usuario]);

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

      const response = await axiosInstance.put(
        `/reenviar/${inscripcionSeleccionada.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
    (a, b) => new Date(a.event.startDate) - new Date(b.event.startDate)
  );

  const inscripcionesFiltradas =
    filtroEstado === "TODOS"
      ? inscripcionesOrdenadas
      : inscripcionesOrdenadas.filter((ins) => ins.status === filtroEstado);

  // Cálculos para la paginación
  const indexUltimaInscripcion = paginaActual * inscripcionesPorPagina;
  const indexPrimeraInscripcion =
    indexUltimaInscripcion - inscripcionesPorPagina;
  const inscripcionesActuales = inscripcionesFiltradas.slice(
    indexPrimeraInscripcion,
    indexUltimaInscripcion
  );
  const totalPaginas = Math.ceil(
    inscripcionesFiltradas.length / inscripcionesPorPagina
  );

  // Función para cambiar de página
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    // Hacer scroll hacia arriba suavemente al cambiar de página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            onClick={() => navigate("/events")}
          >
            <Search size={16} />
            Explorar eventos disponibles
          </button>
        </div>
      ) : (
        <>
          <div className="myins-filter-container">
            <div className="myins-filter-header">
              <Filter size={18} />
              <span>Filtrar por estado:</span>
            </div>
            <div className="myins-filter-options">
              <button
                className={`myins-filter-btn ${
                  filtroEstado === "TODOS" ? "active" : ""
                }`}
                onClick={() => {
                  setFiltroEstado("TODOS");
                  setPaginaActual(1); // Reiniciar a la primera página al cambiar el filtro
                }}
              >
                Todos
              </button>
              <button
                className={`myins-filter-btn estado-pendiente ${
                  filtroEstado === "PENDING" ? "active" : ""
                }`}
                onClick={() => {
                  setFiltroEstado("PENDING");
                  setPaginaActual(1); // Reiniciar a la primera página al cambiar el filtro
                }}
              >
                <Clock size={16} />
                Pendientes
              </button>
              <button
                className={`myins-filter-btn estado-aceptada ${
                  filtroEstado === "ACCEPTED" ? "active" : ""
                }`}
                onClick={() => {
                  setFiltroEstado("ACCEPTED");
                  setPaginaActual(1); // Reiniciar a la primera página al cambiar el filtro
                }}
              >
                <BadgeCheck size={16} />
                Aceptadas
              </button>
              <button
                className={`myins-filter-btn estado-rechazada ${
                  filtroEstado === "REJECTED" ? "active" : ""
                }`}
                onClick={() => {
                  setFiltroEstado("REJECTED");
                  setPaginaActual(1); // Reiniciar a la primera página al cambiar el filtro
                }}
              >
                <Ban size={16} />
                Rechazadas
              </button>
              <button
                className={`myins-filter-btn estado-aprobado ${
                  filtroEstado === "APPROVED" ? "active" : ""
                }`}
                onClick={() => {
                  setFiltroEstado("APPROVED");
                  setPaginaActual(1); // Reiniciar a la primera página al cambiar el filtro
                }}
              >
                <BadgeCheck size={16} />
                Aprobados
              </button>
              {filtroEstado !== "TODOS" && (
                <button
                  className="myins-filter-clear"
                  onClick={() => {
                    setFiltroEstado("TODOS");
                    setPaginaActual(1); // Reiniciar a la primera página al limpiar el filtro
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="myins-grid">
            {inscripcionesActuales.map((ins) => (
              <div key={ins.id} className="myins-card">
                <div className="myins-header">
                  <h3 className="myins-event-name">{ins.event.name}</h3>
                </div>
                <span
                  className={`myins-estado ${
                    estadoLabel[ins.status]?.color || "estado-pendiente"
                  }`}
                >
                  {estadoLabel[ins.status]?.icon || <Clock size={16} />}
                  {estadoLabel[ins.status]?.text || ins.status}
                </span>
                <p className="myins-datos">
                  Tipo: {ins.event.type} <br /> Fecha:{" "}
                  {new Date(ins.event.startDate).toLocaleDateString("es-EC")}{" "}
                  –{" "}
                  {new Date(ins.event.endDate).toLocaleDateString("es-EC")}
                </p>{" "}
                {/* Mostrar observación del administrador si existe */}
                {ins.observation && (
                  <div className="myins-observacion">
                    <div className="observacion-header">
                      <AlertCircle size={16} />
                      <span>Observación del administrador:</span>
                    </div>
                    <p className="observacion-texto">{ins.observation}</p>
                  </div>
                )}{" "}
                {ins.status === "APPROVED" && (
                  <div className="myins-certificado">
                    {" "}
                    <button
                      onClick={async () => {
                        try {
                          toast.info("Preparando certificado...");
                          // Hacer la petición a través de axios para que incluya el token
                          const response = await axiosInstance.get(
                            `/certificados/${ins.id}`,
                            {
                              responseType: "blob", // Importante para manejar PDF
                            }
                          );

                          // Crear un blob URL para el PDF
                          const blob = new Blob([response.data], {
                            type: "application/pdf",
                          });
                          const url = window.URL.createObjectURL(blob);

                          // Guardar la URL y mostrar el modal
                          setCertificadoUrl(url);
                          setCertificadoFileName(
                            `certificado_${ins.event.name
                              .replace(/\s+/g, "_")
                              .toLowerCase()}.pdf`
                          );
                          setMostrarCertificado(true);
                        } catch (error) {
                          console.error(
                            "Error al descargar certificado:",
                            error
                          );
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
                      className="btn-descargar-mi"
                    >
                      <Download size={16} />
                      Descargar certificado
                    </button>{" "}
                    <button
                      onClick={async () => {
                        try {
                          toast.info("Enviando certificado a tu correo...");
                          const response = await axiosInstance.post(
                            `/certificados/enviar/${ins.id}`
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
                {ins.status === "ACCEPTED" && (
                  <button
                    className="btn-felicitaciones"
                    onClick={() => lanzarConfetti()}
                  >
                    ¡Felicitaciones!
                  </button>
                )}{" "}
                {ins.status === "REJECTED" && (
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
                        navigate("/events");
                      }}
                    >
                      <Upload size={16} />
                      Volver a inscribirme
                    </button>
                  </div>
                )}
                {ins.status === "PENDING" && (
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

          <div className="myins-pagination-container">
            {/* Controles de paginación */}
            {totalPaginas > 1 && (
              <div className="myins-pagination">
                <button
                  className="myins-pagination-btn"
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  &laquo; Anterior
                </button>

                <div className="myins-pagination-numbers">
                  {Array.from({ length: totalPaginas }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`myins-pagination-number ${
                        paginaActual === i + 1 ? "active" : ""
                      }`}
                      onClick={() => cambiarPagina(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="myins-pagination-btn"
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente &raquo;
                </button>
              </div>
            )}

            {/* Contador de inscripciones */}
            {inscripcionesFiltradas.length > 0 && (
              <div className="myins-counter">
                Mostrando {indexPrimeraInscripcion + 1} -{" "}
                {Math.min(
                  indexUltimaInscripcion,
                  inscripcionesFiltradas.length
                )}{" "}
                de {inscripcionesFiltradas.length} inscripciones
                {filtroEstado !== "TODOS" &&
                  ` (filtrado por: ${
                    estadoLabel[filtroEstado]?.text || filtroEstado
                  })`}
              </div>
            )}
          </div>
        </>
      )}

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title-mi">
              Reenviar comprobante para: <br />
              {inscripcionSeleccionada.event.name}
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

      {/* Modal de visualización de certificado */}
      {mostrarCertificado && (
        <CertificateViewer
          pdfUrl={certificadoUrl}
          fileName={certificadoFileName}
          onClose={() => {
            setMostrarCertificado(false);
            // Revocar la URL del blob cuando ya no se necesita para liberar memoria
            URL.revokeObjectURL(certificadoUrl);
            setCertificadoUrl("");
          }}
        />
      )}
    </div>
  );
};

export default MyInscriptions;
