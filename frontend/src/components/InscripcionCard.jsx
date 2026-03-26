import {
  FileText,
  XCircle,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XOctagon,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  Ban,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";
import ZoomableImage from "./ZoomableImage";
import DocumentViewer from "./DocumentViewer";
import "./styles/InscripcionCard.css";
import "./styles/InscripcionCard-estados.css";

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

const LEGACY_EVENT_STATUS_TO_DB = {
  ACTIVO: "ACTIVE",
  INACTIVO: "INACTIVE",
  FINALIZADO: "FINISHED",
  CANCELADO: "CANCELLED",
  SUSPENDIDO: "SUSPENDED",
};

const toDbEventStatus = (status) => LEGACY_EVENT_STATUS_TO_DB[status] || status;

const InscripcionCard = ({ inscripcion, onUpdate, onVerCarta }) => {
  const registrationId = inscripcion.id || inscripcion.id_ins;
  const status = toDbStatus(inscripcion.status || inscripcion.est_ins);
  const event = inscripcion.event || inscripcion.evento || {};
  const eventStatus = toDbEventStatus(event.status || event.est_eve);
  const account = inscripcion.account || inscripcion.cuenta || {};
  const user =
    inscripcion.user ||
    inscripcion.usuario ||
    account.user ||
    account.usuario ||
    {};
  const paymentReceipt =
    inscripcion.paymentReceipt ||
    inscripcion.comprobante ||
    inscripcion.paymentReceipts?.[0]?.url ||
    inscripcion.comprobantes_pago?.[0]?.url_com_pag ||
    null;

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nota, setNota] = useState(() => {
    // Manejo de ambas estructuras: mapeada (nota_final) y directa de Prisma (inscripcion_curso.not_fin_usu)
    const notaValue =
      inscripcion.finalGrade !== undefined
        ? inscripcion.finalGrade
        : inscripcion.nota_final !== undefined
        ? inscripcion.nota_final
        : inscripcion.inscripcion_curso?.not_fin_usu;
    return notaValue === -1 ? "" : notaValue || "";
  });
  const [asistencia, setAsistencia] = useState(() => {
    // Manejo de ambas estructuras: mapeada (asistencia) y directa de Prisma (por_asi_fin_usu)
    const asistenciaValue =
      inscripcion.finalAttendancePercent !== undefined
        ? inscripcion.finalAttendancePercent
        : inscripcion.asistencia !== undefined
        ? inscripcion.asistencia
        : inscripcion.por_asi_fin_usu;
    return asistenciaValue === -1 ? "" : asistenciaValue || "";
  });
  const [observacion, setObservacion] = useState(
    inscripcion.observation || inscripcion.observacion?.obs_ins || ""
  );
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [mostrarDocumento, setMostrarDocumento] = useState(false);
  const [documentoUrl, setDocumentoUrl] = useState("");
  const [documentoTitulo, setDocumentoTitulo] = useState("");

  // Verificar si el evento está en un estado que no permite validación
  const estadosNoValidables = ["FINISHED", "CANCELLED", "SUSPENDED"];
  const eventoNoValidable = estadosNoValidables.includes(eventStatus);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleToggleComprobante = (e) => {
    e.preventDefault();
    setMostrarComprobante(!mostrarComprobante);
  };

  const handleVerDocumento = (e) => {
    e.preventDefault();
    const userDocumentsUrl = user.documentsUrl || user.com_usu;
    if (!userDocumentsUrl) {
      toast.error("El usuario no tiene documentos cargados");
      return;
    }

    const url = userDocumentsUrl.startsWith("http")
      ? userDocumentsUrl
      : `${import.meta.env.VITE_API_URL}${userDocumentsUrl}`;

    setDocumentoUrl(url);
    setDocumentoTitulo(
      `Documentos de ${user.firstName || user.nom_usu} ${
        user.lastName || user.ape_usu
      }`
    );
    setMostrarDocumento(true);
  };

  const cambiarEstado = async (nuevoEstado) => {
    console.log(`🔄 [INSCRIPCION_CARD] Iniciando cambio de estado:`, {
      inscripcionId: registrationId,
      estadoActual: status,
      nuevoEstado,
      eventoEstado: eventStatus,
      observacion,
    });

    // Verificar si el evento está en un estado que no permite validación
    if (eventoNoValidable) {
      console.log(`❌ [INSCRIPCION_CARD] Evento no validable:`, {
        estadoEvento: eventStatus,
        eventoNoValidable,
      });
      toast.error(
        `No se puede validar inscripciones de un evento ${eventStatus.toLowerCase()}`
      );
      return;
    }

    setLoading(true);
    try {
      console.log(`📤 [INSCRIPCION_CARD] Enviando petición de validación...`);

      const response = await axiosInstance.put(
        `/admin/inscripciones/validar/${registrationId}`,
        {
          status: nuevoEstado,
          observacion: observacion,
        }
      );

      console.log(
        `✅ [INSCRIPCION_CARD] Respuesta del servidor:`,
        response.data
      );
      toast.success(`Inscripción ${nuevoEstado.toLowerCase()}`);

      if (onUpdate) {
        console.log(`🔄 [INSCRIPCION_CARD] Ejecutando callback onUpdate`);
        onUpdate();
      }
    } catch (error) {
      console.error(`❌ [INSCRIPCION_CARD] Error al cambiar estado:`, {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.msg || "Error al actualizar estado");
    } finally {
      setLoading(false);
    }
  };
  const handleFinalizar = async (e) => {
    e.preventDefault();

    // Verificar si el evento está en un estado que no permite validación
    if (eventoNoValidable) {
      toast.error(
        `No se puede finalizar inscripciones de un evento ${eventStatus.toLowerCase()}`
      );
      return;
    }

    if (isNaN(asistencia) || asistencia < 0 || asistencia > 100) {
      toast.error("Asistencia inválida (0–100)");
      return;
    }

    // Solo validar la nota si es un curso
    const esCurso = (event.type || event.tip_eve) === "CURSO";
    if (esCurso && (isNaN(nota) || nota < 0 || nota > 10)) {
      toast.error("Nota inválida (0–10)");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(
        `/admin/inscripciones/validar/${registrationId}`,
        {
          status: "APPROVED",
          finalGrade: esCurso ? Number(nota) : null,
          finalAttendancePercent: Number(asistencia),
          observacion: observacion,
        }
      );
      toast.success("Inscripción finalizada");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al finalizar");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoClase = () => {
    switch (status) {
      case "PENDING":
        return "estado-pendiente-ic";
      case "ACCEPTED":
        return "estado-aceptada-ic";
      case "REJECTED":
        return "estado-rechazada-ic";
      case "APPROVED":
        return "estado-aprobado-ic";
      case "FAILED_GRADE":
        return "estado-reprobado-nota-ic";
      case "FAILED_ATTENDANCE":
        return "estado-reprobado-asistencia-ic";
      case "FAILED_TOTAL":
        return "estado-reprobado-total-ic";
      default:
        return "";
    }
  };

  // Función para renderizar el icono correcto según el estado del evento
  const getEventoEstadoIcono = () => {
    switch (eventStatus) {
      case "FINISHED":
        return <CheckCircle size={14} />;
      case "CANCELLED":
        return <Ban size={14} />;
      case "SUSPENDED":
        return <AlertTriangle size={14} />;
      case "ACTIVE":
        return <Zap size={14} />;
      case "INACTIVE":
        return <AlertCircle size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className={`inscripcion-card ${getEstadoClase()}`}>
      <div
        className="inscripcion-card-header"
        onClick={handleToggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggleExpand();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Contraer" : "Expandir"} detalles de inscripción de ${user?.firstName || user?.nom_usu} ${user?.lastName || user?.ape_usu}`}
      >
        <div className="inscripcion-card-title">
          <h3>{`${user?.firstName || user?.nom_usu} ${user?.lastName || user?.ape_usu}`}</h3>
          <span className={`inscripcion-estado ${getEstadoClase()}`}>
            {status}
          </span>
        </div>
        <div className="inscripcion-card-subtitle">
          <div className="inscripcion-info-item">
            <User size={14} />
            <span>{event.name || event.nom_eve}</span>
            {eventStatus &&
              eventStatus !== "ACTIVE" && (
                <span
                  className={`evento-estado-badge-ic evento-estado-${eventStatus.toLowerCase()}-ic`}
                >
                  {getEventoEstadoIcono()}
                  {eventStatus}
                </span>
              )}
          </div>
          <div className="inscripcion-info-item">
            <Mail size={14} />
            <span>{user?.email || user?.cor_usu || account?.email || account?.cor_usu}</span>
          </div>
        </div>
      </div>

      <div className={`inscripcion-card-body ${expanded ? "expanded" : ""}`}>
        <div className="inscripcion-section">
          <h4>Documentación</h4>
          <div className="inscripcion-docs">
            {" "}
            <div className="inscripcion-doc-item">
              <span>Comprobante:</span>
              {(event.price || event.val_eve || 0) > 0 ? (
                paymentReceipt ? (
                  <div className="doc-preview-container">
                    <button
                      onClick={handleToggleComprobante}
                      className="doc-link"
                      title={
                        mostrarComprobante
                          ? "Ocultar comprobante"
                          : "Ver comprobante"
                      }
                    >
                      <FileText size={18} />
                      Ver comprobante
                      {mostrarComprobante ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>

                    {mostrarComprobante && (
                      <div className="doc-preview">
                        {paymentReceipt.startsWith("http") ? (
                          <ZoomableImage
                            src={paymentReceipt}
                            alt="Comprobante de pago"
                            className="comprobante-imagen"
                          />
                        ) : (
                          <ZoomableImage
                            src={`${import.meta.env.VITE_API_URL}/uploads/${paymentReceipt}`}
                            alt="Comprobante de pago"
                            className="comprobante-imagen"
                          />
                        )}
                        <a
                          href={
                            paymentReceipt.startsWith("http")
                              ? paymentReceipt
                              : `${import.meta.env.VITE_API_URL}/uploads/${paymentReceipt}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="abrir-nueva-ventana"
                        >
                          Abrir en nueva ventana
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="doc-missing">
                    <XCircle size={18} /> No enviado
                  </span>
                )
              ) : (
                <span className="evento-gratuito">Gratuito</span>
              )}
            </div>{" "}
            <div className="inscripcion-doc-item">
              <span>Documentos personales:</span>
              {user?.documentsUrl || user?.com_usu ? (
                <button
                  onClick={handleVerDocumento}
                  className="doc-link"
                  title="Ver documentos del perfil"
                >
                  <FileText size={18} /> Ver documentos
                </button>
              ) : (
                <span className="doc-missing">
                  <XCircle size={18} /> No enviado
                </span>
              )}
            </div>
            <div className="inscripcion-doc-item">
              <span>Carta de motivación:</span>
              {inscripcion.motivationLetter || inscripcion.carta_motivacion ? (
                onVerCarta ? (
                  <button
                    onClick={() =>
                      onVerCarta(inscripcion.motivationLetter || inscripcion.carta_motivacion)
                    }
                    className="btn-ver-carta"
                    title="Ver carta de motivación"
                  >
                    <FileText size={18} /> Ver carta
                  </button>
                ) : (
                  <span className="doc-available">
                    <FileText size={18} /> Enviada
                  </span>
                )
              ) : (
                <span className="doc-missing">
                  <XCircle size={18} /> No enviada
                </span>
              )}
            </div>
          </div>
        </div>{" "}
        <div className="inscripcion-section">
          <h4>Calificaciones</h4>
          <div className="inscripcion-stats">
            {status === "APPROVED" ? (
              <>
                <div className="inscripcion-stat-item">
                  <span>Asistencia:</span>
                  <span className="stat-value">
                    {(() => {
                      const asistenciaValue =
                        inscripcion.asistencia !== undefined
                          ? inscripcion.asistencia
                          : inscripcion.por_asi_fin_usu;
                      return asistenciaValue !== null &&
                        asistenciaValue !== undefined
                        ? `${asistenciaValue}%`
                        : "—";
                    })()}
                  </span>
                </div>
                <div className="inscripcion-stat-item">
                  <span>Nota Final:</span>
                  <span className="stat-value">
                    {(() => {
                      const notaValue =
                        inscripcion.nota_final !== undefined
                          ? inscripcion.nota_final
                          : inscripcion.inscripcion_curso?.not_fin_usu;
                      return notaValue !== null && notaValue !== undefined
                        ? notaValue.toFixed(1)
                        : "—";
                    })()}
                  </span>
                </div>
              </>
            ) : status === "ACCEPTED" ? (
              <div className="inscripcion-mensaje-info">
                Ingrese las notas y asistencia para finalizar esta inscripción.
              </div>
            ) : status === "REJECTED" ? (
              <div className="inscripcion-mensaje-rechazado">
                Inscripción rechazada. No se pueden ingresar calificaciones.
              </div>
            ) : (
              <div className="inscripcion-mensaje-pendiente">
                Valide primero la inscripción para ingresar calificaciones.
              </div>
            )}
          </div>
        </div>{" "}
        <div className="inscripcion-section">
          <h4>Acciones</h4>
          <div className="inscripcion-actions">
            <div className="inscripcion-form-group full-width">
              <label htmlFor={`observacion-${registrationId}`}>Observación:</label>
              <textarea
                id={`observacion-${registrationId}`}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Escriba una observación sobre esta inscripción..."
                className="inscripcion-textarea"
                rows="2"
              />
            </div>
            <div className="inscripcion-buttons">
              <button
                onClick={() => cambiarEstado("ACCEPTED")}
                className="btn btn-aceptar"
                disabled={
                  status === "ACCEPTED" ||
                  status === "APPROVED" ||
                  loading ||
                  eventoNoValidable
                }
              >
                <CheckCircle size={16} /> Aceptar
              </button>
              <button
                onClick={() => cambiarEstado("REJECTED")}
                className="btn btn-rechazar"
                disabled={
                  status === "REJECTED" ||
                  status === "APPROVED" ||
                  loading ||
                  eventoNoValidable
                }
              >
                <XOctagon size={16} /> Rechazar
              </button>
            </div>{" "}
            <form
              className="inscripcion-finalizar-form"
              onSubmit={handleFinalizar}
            >
              {status === "ACCEPTED" && !eventoNoValidable && (
                <div className="inscripcion-form-row">
                  {(event.type || event.tip_eve) === "CURSO" && (
                    <div className="inscripcion-form-group">
                      <label htmlFor={`nota-${registrationId}`}>
                        Nota (mín: {event?.eventos_curso?.minPassingGrade ?? event?.eventos_curso?.not_min_cur ?? "0"}
                        ):
                      </label>
                      <input
                        id={`nota-${registrationId}`}
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={nota}
                        onChange={(e) => {
                          let val = parseFloat(e.target.value);
                          if (val > 10) val = 10;
                          if (val < 0) val = 0;
                          setNota(val);
                        }}
                        className="inscripcion-input"
                      />
                    </div>
                  )}
                  <div className="inscripcion-form-group">
                    <label htmlFor={`asistencia-${registrationId}`}>
                      Asistencia (mín: {event?.minAttendancePercent ?? event?.por_min_asi_eve ?? "0"}%):
                    </label>
                    <input
                      id={`asistencia-${registrationId}`}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={asistencia}
                      onChange={(e) => {
                        let val = parseFloat(e.target.value);
                        if (val > 100) val = 100;
                        if (val < 0) val = 0;
                        setAsistencia(val);
                      }}
                      className="inscripcion-input"
                    />
                  </div>
                </div>
              )}{" "}
              {eventoNoValidable && status === "ACCEPTED" && (
                <div className="inscripcion-evento-no-validable-mensaje-ic">
                  <AlertTriangle size={16} />
                  No se puede finalizar inscripciones de un evento{" "}
                  {eventStatus.toLowerCase()}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-finalizar"
                disabled={
                  status !== "ACCEPTED" ||
                  loading ||
                  eventoNoValidable
                }
                style={{
                  display: status === "ACCEPTED" ? "flex" : "none",
                }}
              >
                <Clock size={16} /> Finalizar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal para ver documentos - Renderizado en document.body */}
      {mostrarDocumento &&
        createPortal(
          <DocumentViewer
            documentUrl={documentoUrl}
            title={documentoTitulo}
            onClose={() => setMostrarDocumento(false)}
          />,
          document.body
        )}
    </div>
  );
};

export default InscripcionCard;
