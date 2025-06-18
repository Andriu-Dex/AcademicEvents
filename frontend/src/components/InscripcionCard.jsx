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
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";
import "./styles/InscripcionCard.css";
import "./styles/InscripcionCard-estados.css";

const InscripcionCard = ({ inscripcion, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nota, setNota] = useState(
    inscripcion.nota_final === -1 ? "" : inscripcion.nota_final || ""
  );
  const [asistencia, setAsistencia] = useState(
    inscripcion.por_asi_fin_usu || ""
  );
  const [observacion, setObservacion] = useState(inscripcion.observacion || "");
  const [mostrarComprobante, setMostrarComprobante] = useState(false);

  // Verificar si el evento está en un estado que no permite validación
  const estadosNoValidables = ["FINALIZADO", "CANCELADO", "SUSPENDIDO"];
  const eventoNoValidable = estadosNoValidables.includes(
    inscripcion.evento?.est_eve
  );

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleToggleComprobante = (e) => {
    e.preventDefault();
    setMostrarComprobante(!mostrarComprobante);
  };

  const cambiarEstado = async (nuevoEstado) => {
    // Verificar si el evento está en un estado que no permite validación
    if (eventoNoValidable) {
      toast.error(
        `No se puede validar inscripciones de un evento ${inscripcion.evento?.est_eve.toLowerCase()}`
      );
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(
        `/admin/inscripciones/validar/${inscripcion.id_ins}`,
        {
          est_ins: nuevoEstado,
          observacion: observacion,
        }
      );
      toast.success(`Inscripción ${nuevoEstado.toLowerCase()}`);
      if (onUpdate) onUpdate();
    } catch (error) {
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
        `No se puede finalizar inscripciones de un evento ${inscripcion.evento?.est_eve.toLowerCase()}`
      );
      return;
    }

    if (isNaN(asistencia) || asistencia < 0 || asistencia > 100) {
      toast.error("Asistencia inválida (0–100)");
      return;
    }

    // Solo validar la nota si es un curso
    const esCurso = inscripcion.evento?.tip_eve === "CURSO";
    if (esCurso && (isNaN(nota) || nota < 0 || nota > 10)) {
      toast.error("Nota inválida (0–10)");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(
        `/admin/inscripciones/validar/${inscripcion.id_ins}`,
        {
          est_ins: "APROBADO",
          nota_final: esCurso ? Number(nota) : null,
          asistencia: Number(asistencia),
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
    switch (inscripcion.estado) {
      case "PENDIENTE":
        return "estado-pendiente-ic";
      case "ACEPTADA":
        return "estado-aceptada-ic";
      case "RECHAZADA":
        return "estado-rechazada-ic";
      case "FINALIZADA":
        return "estado-finalizada-ic";
      case "APROBADO":
        return "estado-aprobado-ic";
      case "REPROBADO_NOTA":
        return "estado-reprobado-nota-ic";
      case "REPROBADO_ASISTENCIA":
        return "estado-reprobado-asistencia-ic";
      case "REPROBADO_TOTAL":
        return "estado-reprobado-total-ic";
      default:
        return "";
    }
  };

  // Función para renderizar el icono correcto según el estado del evento
  const getEventoEstadoIcono = () => {
    switch (inscripcion.evento?.est_eve) {
      case "FINALIZADO":
        return <CheckCircle size={14} />;
      case "CANCELADO":
        return <Ban size={14} />;
      case "SUSPENDIDO":
        return <AlertTriangle size={14} />;
      case "ACTIVO":
        return <Zap size={14} />;
      case "INACTIVO":
        return <AlertCircle size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className={`inscripcion-card ${getEstadoClase()}`}>
      <div className="inscripcion-card-header" onClick={handleToggleExpand}>
        <div className="inscripcion-card-title">
          <h3>
            {inscripcion.usuario?.nom_usu} {inscripcion.usuario?.ape_usu}
          </h3>
          <span className={`inscripcion-estado ${getEstadoClase()}`}>
            {inscripcion.estado}
          </span>
        </div>
        <div className="inscripcion-card-subtitle">
          <div className="inscripcion-info-item">
            <User size={14} />
            <span>{inscripcion.evento?.nom_eve}</span>
            {inscripcion.evento?.est_eve &&
              inscripcion.evento.est_eve !== "ACTIVO" && (
                <span
                  className={`evento-estado-badge-ic evento-estado-${inscripcion.evento.est_eve.toLowerCase()}-ic`}
                >
                  {getEventoEstadoIcono()}
                  {inscripcion.evento.est_eve}
                </span>
              )}
          </div>
          <div className="inscripcion-info-item">
            <Mail size={14} />
            <span>{inscripcion.usuario?.cor_usu}</span>
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
              {inscripcion.evento?.val_eve > 0 ? (
                inscripcion.comprobante ? (
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
                        {inscripcion.comprobante.startsWith("http") ? (
                          <img
                            src={inscripcion.comprobante}
                            alt="Comprobante de pago"
                            className="comprobante-imagen"
                          />
                        ) : (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/uploads/${
                              inscripcion.comprobante
                            }`}
                            alt="Comprobante de pago"
                            className="comprobante-imagen"
                          />
                        )}
                        <a
                          href={
                            inscripcion.comprobante.startsWith("http")
                              ? inscripcion.comprobante
                              : `${import.meta.env.VITE_API_URL}/uploads/${
                                  inscripcion.comprobante
                                }`
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
              {inscripcion.usuario?.com_usu ? (
                <a
                  href={
                    inscripcion.usuario.com_usu.startsWith("http")
                      ? inscripcion.usuario.com_usu
                      : `${import.meta.env.VITE_API_URL}${
                          inscripcion.usuario.com_usu
                        }`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doc-link"
                  title="Ver documentos del perfil"
                >
                  <FileText size={18} /> Ver documentos
                </a>
              ) : (
                <span className="doc-missing">
                  <XCircle size={18} /> No enviado
                </span>
              )}
            </div>
            <div className="inscripcion-doc-item">
              <span>Carta de motivación:</span>
              {inscripcion.carta_motivacion ? (
                <button
                  onClick={() =>
                    inscripcion.onVerCarta(inscripcion.carta_motivacion)
                  }
                  className="btn-ver-carta"
                  title="Ver carta de motivación"
                >
                  <FileText size={18} /> Ver carta
                </button>
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
            {inscripcion.estado === "FINALIZADA" ? (
              <>
                <div className="inscripcion-stat-item">
                  <span>Asistencia:</span>
                  <span className="stat-value">
                    {inscripcion.asistencia !== null
                      ? `${inscripcion.asistencia}%`
                      : "—"}
                  </span>
                </div>
                <div className="inscripcion-stat-item">
                  <span>Nota Final:</span>
                  <span className="stat-value">
                    {inscripcion.nota_final !== null
                      ? inscripcion.nota_final.toFixed(1)
                      : "—"}
                  </span>
                </div>
              </>
            ) : inscripcion.estado === "ACEPTADA" ? (
              <div className="inscripcion-mensaje-info">
                Ingrese las notas y asistencia para finalizar esta inscripción.
              </div>
            ) : inscripcion.estado === "RECHAZADA" ? (
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
              <label htmlFor={`observacion-${inscripcion.id_ins}`}>
                Observación:
              </label>
              <textarea
                id={`observacion-${inscripcion.id_ins}`}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Escriba una observación sobre esta inscripción..."
                className="inscripcion-textarea"
                rows="2"
              />
            </div>
            <div className="inscripcion-buttons">
              <button
                onClick={() => cambiarEstado("ACEPTADA")}
                className="btn btn-aceptar"
                disabled={
                  inscripcion.estado === "ACEPTADA" ||
                  inscripcion.estado === "FINALIZADA" ||
                  loading ||
                  eventoNoValidable
                }
              >
                <CheckCircle size={16} /> Aceptar
              </button>
              <button
                onClick={() => cambiarEstado("RECHAZADA")}
                className="btn btn-rechazar"
                disabled={
                  inscripcion.estado === "RECHAZADA" ||
                  inscripcion.estado === "FINALIZADA" ||
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
              {inscripcion.estado === "ACEPTADA" && !eventoNoValidable && (
                <div className="inscripcion-form-row">
                  {inscripcion.evento?.tip_eve === "CURSO" && (
                    <div className="inscripcion-form-group">
                      <label htmlFor={`nota-${inscripcion.id_ins}`}>
                        Nota (mín:{" "}
                        {inscripcion.evento?.eventos_curso?.not_min_cur || "0"}
                        ):
                      </label>
                      <input
                        id={`nota-${inscripcion.id_ins}`}
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
                    <label htmlFor={`asistencia-${inscripcion.id_ins}`}>
                      Asistencia (mín:{" "}
                      {inscripcion.evento?.por_min_asi_eve || "0"}%):
                    </label>
                    <input
                      id={`asistencia-${inscripcion.id_ins}`}
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
              {eventoNoValidable && inscripcion.estado === "ACEPTADA" && (
                <div className="inscripcion-evento-no-validable-mensaje-ic">
                  <AlertTriangle size={16} />
                  No se puede finalizar inscripciones de un evento{" "}
                  {inscripcion.evento?.est_eve.toLowerCase()}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-finalizar"
                disabled={
                  inscripcion.estado !== "ACEPTADA" ||
                  loading ||
                  eventoNoValidable
                }
                style={{
                  display: inscripcion.estado === "ACEPTADA" ? "flex" : "none",
                }}
              >
                <Clock size={16} /> Finalizar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscripcionCard;
