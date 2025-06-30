import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Calendar,
  Users,
  CheckCircle,
  Target,
  FileText,
  AlertCircle,
  Zap,
  Pause,
  MapPin,
  Monitor,
  Laptop,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { formatUTCForLocalDisplay } from "../utils/dateUtils";
import "./styles/ModalRequisitos.css";

/**
 * @component ModalRequisitos
 * @description Muestra los detalles y requisitos de un evento en un modal
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.evento - Datos del evento a mostrar
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} [props.overlayClassName="modal-requisitos-overlay-mr"] - Clase CSS para el overlay del modal
 */
const ModalRequisitos = ({
  evento,
  onClose,
  overlayClassName = "modal-requisitos-overlay-mr",
}) => {
  // Obtener información de autenticación
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Verificar si el usuario está autenticado
  const isAuthenticated = !!usuario;

  const handleInscripcion = () => {
    onClose(); // Primero cerramos el modal
    // Redirigir al usuario a la página correspondiente
    if (isAuthenticated) {
      navigate("/eventos"); // Si está autenticado, va a EventsRoute
    } else {
      navigate("/eventos-publicos"); // Si no está autenticado, va a EventosPublicos
    }
  };

  if (!evento) return null;

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div
        className="modal-requisitos-contenido-mr"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-requisitos-header-mr">
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <h3>{evento.nom_eve}</h3>
            <span
              className={`badge-mr badge-estado-mr ${
                evento.est_eve?.toLowerCase() === "activo"
                  ? "activo"
                  : "inactivo"
              }`}
            >
              {evento.est_eve === "ACTIVO" ? (
                <>
                  <Zap size={14} /> ACTIVO
                </>
              ) : (
                <>
                  <Pause size={14} /> INACTIVO
                </>
              )}
            </span>
            <span className="badge-tipo-mr">{evento.tip_eve}</span>
          </div>

          <button className="modal-requisitos-cerrar-mr" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-requisitos-cuerpo-mr">
          <div className="seccion-requisitos-mr">
            <h4>
              <Calendar size={18} /> Fechas del Evento
            </h4>
            <div className="info-item-mr">
              <span className="info-label-mr">Inicio:</span>
              <span className="info-value-mr">
                {formatUTCForLocalDisplay(evento.fec_ini_eve)}
              </span>
            </div>
            <div className="info-item-mr">
              <span className="info-label-mr">Finalización:</span>
              <span className="info-value-mr">
                {formatUTCForLocalDisplay(evento.fec_fin_eve)}
              </span>
            </div>
            <div className="info-item-mr">
              <span className="info-label-mr">Duración:</span>
              <span className="info-value-mr">{evento.dur_hor_eve} horas</span>
            </div>
            <div className="info-item-mr">
              <span className="info-label-mr">Asistencia mín.:</span>
              <span className="info-value-mr">{evento.por_min_asi_eve}%</span>
            </div>
          </div>

          <div className="seccion-requisitos-mr">
            <h4>
              <Users size={18} /> Modalidad y Participación
            </h4>
            <div className="info-item-mr modalidad-item-mr">
              <span className="info-label-mr">Modalidad:</span>
              <span className="info-value-mr">
                {evento.mod_eve === "PRESENCIAL" && (
                  <span className="modalidad-badge-mr">
                    <MapPin size={16} /> Presencial
                  </span>
                )}
                {evento.mod_eve === "VIRTUAL" && (
                  <span className="modalidad-badge-mr virtual">
                    <Monitor size={16} /> Virtual
                  </span>
                )}
                {evento.mod_eve === "SEMIPRESENCIAL" && (
                  <span className="modalidad-badge-mr semi">
                    <Laptop size={16} /> Semipresencial
                  </span>
                )}
                {!evento.mod_eve && "No especificada"}
              </span>
            </div>
            <div className="info-item-mr">
              <span className="info-label-mr">Cupos:</span>
              <span className="info-value-mr enfasis">
                {evento.cup_dis_eve} disponibles
                <small style={{ marginLeft: "0.5rem", color: "#6b7280" }}>
                  de {evento.cup_max_eve}
                </small>
              </span>
            </div>
            <div className="info-item-mr">
              <span className="info-label-mr">Costo:</span>
              <span className="info-value-mr enfasis">
                {evento.val_eve === 0
                  ? "Gratuito"
                  : `$${evento.val_eve.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="seccion-requisitos-mr">
            <h4>
              <FileText size={18} /> Descripción del Evento
            </h4>
            <p className="descripcion-evento">
              {evento.des_eve || "No hay descripción disponible."}
            </p>
          </div>

          <div className="seccion-requisitos-mr">
            <div className="requisitos-grid">
              <div className="seccion-participantes-mr">
                <h5 className="requisito-subtitulo">
                  <Users size={16} /> Dirigido a
                </h5>
                <div className="grupos-participantes-mr">
                  <div className="grupo-participante-mr">
                    <span
                      className={`usuario-item-mr ${
                        evento.dirigido_estudiantes ? "dirigido" : "no-dirigido"
                      }`}
                    >
                      <Users size={14} /> Estudiantes
                    </span>
                  </div>
                  <div className="grupo-participante-mr">
                    <span
                      className={`usuario-item-mr ${
                        evento.dirigido_docentes ? "dirigido" : "no-dirigido"
                      }`}
                    >
                      <Users size={14} /> Docentes
                    </span>
                  </div>
                  <div className="grupo-participante-mr">
                    <span
                      className={`usuario-item-mr ${
                        evento.dirigido_publico ? "dirigido" : "no-dirigido"
                      }`}
                    >
                      <Users size={14} /> Público General
                    </span>
                  </div>
                </div>
              </div>

              <div className="seccion-carreras-mr">
                <h5 className="requisito-subtitulo">
                  <FileText size={16} /> Carreras asociadas
                </h5>
                {evento.eventos_carrera && evento.eventos_carrera.length > 0 ? (
                  <div className="carreras-contenedor-mr">
                    {evento.eventos_carrera.map((carreraEvento) => (
                      <div
                        key={carreraEvento.id_eve_car}
                        className="carrera-item-mr"
                      >
                        <FileText size={14} />
                        <span className="carrera-nombre-mr">
                          {carreraEvento.carrera?.nom_car ||
                            "Carrera no especificada"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="todas-carreras-mr">
                    <FileText size={16} />
                    <span>
                      Este evento está abierto a todas las carreras de la
                      universidad
                    </span>
                  </div>
                )}
              </div>
            </div>

            {evento.eventos_curso && (
              <div className="requisito-seccion curso-requisitos">
                <h5 className="requisito-subtitulo">
                  <AlertCircle size={16} /> Requisitos del curso
                </h5>
                <div className="info-item-mr">
                  <span className="info-label-mr">Nota mínima:</span>
                  <span className="info-value-mr enfasis">
                    {evento.eventos_curso.not_min_cur}
                  </span>
                </div>
              </div>
            )}
          </div>

          {evento.datos_extra && (
            <div className="seccion-requisitos-mr">
              <h4>
                <AlertCircle size={18} /> Información Adicional
              </h4>
              <p>{evento.datos_extra}</p>
            </div>
          )}

          <div
            className="seccion-inscripcion-mr"
            style={{ marginTop: "1rem", textAlign: "center", color: "#6b7280" }}
          >
            {isAuthenticated ? (
              <div>
                <p>¿Quieres inscribirte en este evento?</p>
                <button
                  onClick={handleInscripcion}
                  className="btn-inscripcion-mr"
                >
                  Ver en eventos
                </button>
              </div>
            ) : (
              <p>
                Para inscribirse en este evento,{" "}
                <Link
                  to="/login"
                  style={{ color: "#8a1538", textDecoration: "underline" }}
                >
                  inicie sesión
                </Link>{" "}
                o{" "}
                <Link
                  to="/registro"
                  style={{ color: "#8a1538", textDecoration: "underline" }}
                >
                  regístrese
                </Link>{" "}
                en la plataforma.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalRequisitos;
