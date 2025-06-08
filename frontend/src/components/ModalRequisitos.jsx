import React from "react";
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
import "./styles/ModalRequisitos.css";

// Función para formatear fechas correctamente usando UTC
const formatearFechaUTC = (fechaStr) => {
  if (!fechaStr) return "-";
  try {
    const fechaParts = fechaStr.split("T")[0].split("-");
    const fecha = new Date(
      Date.UTC(
        parseInt(fechaParts[0]),
        parseInt(fechaParts[1]) - 1,
        parseInt(fechaParts[2])
      )
    );
    return fecha.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "-";
  }
};

const ModalRequisitos = ({ evento, onClose }) => {
  if (!evento) return null;

  return (
    <div className="modal-requisitos-overlay" onClick={onClose}>
      <div
        className="modal-requisitos-contenido"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-requisitos-header">
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <h3>{evento.nom_eve}</h3>
            <span
              className={`badge badge-estado ${evento.est_eve?.toLowerCase() === "activo"
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
            <span className="badge badge-tipo">{evento.tip_eve}</span>
          </div>
          <button className="modal-requisitos-cerrar" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-requisitos-cuerpo">
          <div className="seccion-requisitos">
            <h4>
              <Calendar size={18} /> Fechas del Evento
            </h4>
            <div className="info-item">
              <span className="info-label">Inicio:</span>
              <span className="info-value">
                {formatearFechaUTC(evento.fec_ini_eve)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Finalización:</span>
              <span className="info-value">
                {formatearFechaUTC(evento.fec_fin_eve)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Duración:</span>
              <span className="info-value">{evento.dur_hor_eve} horas</span>
            </div>
            <div className="info-item">
              <span className="info-label">Asistencia mín.:</span>
              <span className="info-value">{evento.por_min_asi_eve}%</span>
            </div>
          </div>

          <div className="seccion-requisitos">
            <h4>
              <Users size={18} /> Modalidad y Participación
            </h4>
            <div className="info-item modalidad-item">
              <span className="info-label">Modalidad:</span>
              <span className="info-value">
                {evento.mod_eve === "PRESENCIAL" && (
                  <span className="modalidad-badge"><MapPin size={16} /> Presencial</span>
                )}
                {evento.mod_eve === "VIRTUAL" && (
                  <span className="modalidad-badge virtual"><Monitor size={16} /> Virtual</span>
                )}
                {evento.mod_eve === "SEMIPRESENCIAL" && (
                  <span className="modalidad-badge semi"><Laptop size={16} /> Semipresencial</span>
                )}
                {!evento.mod_eve && "No especificada"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Cupos:</span>
              <span className="info-value enfasis">
                {evento.cup_dis_eve} disponibles
                <small style={{ marginLeft: "0.5rem", color: "#6b7280" }}>
                  de {evento.cup_max_eve}
                </small>
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Costo:</span>
              <span className="info-value enfasis">
                {evento.val_eve === 0
                  ? "Gratuito"
                  : `$${evento.val_eve.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="seccion-requisitos">
            <h4>
              <FileText size={18} /> Descripción del Evento
            </h4>
            <p className="descripcion-evento">{evento.des_eve || "No hay descripción disponible."}</p>
          </div>

          <div className="seccion-requisitos">
            <div className="requisitos-grid">
              <div className="seccion-participantes">
                <h5 className="requisito-subtitulo">
                  <Users size={16} /> Dirigido a
                </h5>
                <div className="grupos-participantes">
                  <div className="grupo-participante">
                    <span className={`usuario-item ${evento.dirigido_estudiantes ? 'dirigido' : 'no-dirigido'}`}>
                      <Users size={14} /> Estudiantes
                    </span>
                  </div>
                  <div className="grupo-participante">
                    <span className={`usuario-item ${evento.dirigido_docentes ? 'dirigido' : 'no-dirigido'}`}>
                      <Users size={14} /> Docentes
                    </span>
                  </div>
                  <div className="grupo-participante">
                    <span className={`usuario-item ${evento.dirigido_publico ? 'dirigido' : 'no-dirigido'}`}>
                      <Users size={14} /> Público General
                    </span>
                  </div>
                </div>
              </div>

              <div className="seccion-carreras">
                <h5 className="requisito-subtitulo">
                  <FileText size={16} /> Carreras asociadas
                </h5>
                {evento.eventos_carrera && evento.eventos_carrera.length > 0 ? (
                  <div className="carreras-contenedor">
                    {evento.eventos_carrera.map((carreraEvento) => (
                      <div key={carreraEvento.id_eve_car} className="carrera-item">
                        <FileText size={14} />
                        <span className="carrera-nombre">
                          {carreraEvento.carrera?.nom_car || "Carrera no especificada"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="todas-carreras">
                    <FileText size={16} />
                    <span>Este evento está abierto a todas las carreras de la universidad</span>
                  </div>
                )}
              </div>
            </div>

            {evento.eventos_curso && (
              <div className="requisito-seccion curso-requisitos">
                <h5 className="requisito-subtitulo">
                  <AlertCircle size={16} /> Requisitos del curso
                </h5>
                <div className="info-item">
                  <span className="info-label">Nota mínima:</span>
                  <span className="info-value enfasis">
                    {evento.eventos_curso.not_min_cur}
                  </span>
                </div>
              </div>
            )}
          </div>

          {evento.datos_extra && (
            <div className="seccion-requisitos">
              <h4>
                <AlertCircle size={18} /> Información Adicional
              </h4>
              <p>{evento.datos_extra}</p>
            </div>
          )}

          <div
            style={{ marginTop: "1rem", textAlign: "center", color: "#6b7280" }}
          >
            <p>
              Para inscribirse en este evento, inicie sesión o regístrese en la
              plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalRequisitos;
