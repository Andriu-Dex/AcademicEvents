import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BadgeCheck, Clock, Ban, Eye, Download, Loader } from "lucide-react";
import { toast } from "react-toastify";
import "./styles/AdminEventInscription.css";

const colores = {
  PENDIENTE: "estado-pendiente",
  ACEPTADA: "estado-aceptada",
  RECHAZADA: "estado-rechazada",
  FINALIZADA: "estado-finalizada",
};

const AdminEventInscription = () => {
  const { id } = useParams();
  const [inscripciones, setInscripciones] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [nombreEvento, setNombreEvento] = useState("");
  const [actualizandoId, setActualizandoId] = useState(null);

  const [mostrarFinalizarModal, setMostrarFinalizarModal] = useState(false);
  const [inscripcionFinalizar, setInscripcionFinalizar] = useState(null);
  const [asistencia, setAsistencia] = useState("");
  const [notaFinal, setNotaFinal] = useState("");
  const [enviandoFinalizacion, setEnviandoFinalizacion] = useState(false);
  const [eventoInfo, setEventoInfo] = useState(null);

  const obtenerInscripciones = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/inscripciones/evento/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInscripciones(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar las inscripciones");
    } finally {
      setLoading(false);
    }
  }, [id]);
  const obtenerNombreEvento = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/eventos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNombreEvento(res.data.nom_eve);
      setEventoInfo(res.data); // Guardar información completa del evento
    } catch (err) {
      console.error("Error al obtener nombre del evento", err);
      toast.error("Error al obtener nombre del evento");
    }
  }, [id]);
  const cambiarEstado = async (id_ins, estado) => {
    setActualizandoId(id_ins);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/inscripciones/validar/${id_ins}`,
        { est_ins: estado }, // Corregido: usar est_ins en lugar de estado
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar tanto las inscripciones como la información del evento
      await Promise.all([
        obtenerInscripciones(),
        obtenerNombreEvento(), // Esto actualizará los cupos disponibles
      ]);

      // Mensaje de éxito base
      toast.success(`Inscripción ${estado.toLowerCase()} exitosamente`);

      // 🚨 ALERTA ESPECIAL: Si se aceptó una inscripción, verificar cupos restantes
      if (estado === "ACEPTADA") {
        // Obtener información actualizada del evento
        const token = localStorage.getItem("token");
        const eventoRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/eventos/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const cuposRestantes = eventoRes.data.cup_dis_eve;

        if (cuposRestantes === 0) {
          // 🚫 ALERTA CRÍTICA: Cupos agotados
          toast.warning(
            `🚫 ¡ATENCIÓN! Los cupos para este evento se han AGOTADO. No se pueden aceptar más inscripciones.`,
            {
              duration: 8000,
              position: "top-center",
              style: {
                background: "#fef3c7",
                color: "#92400e",
                border: "2px solid #f59e0b",
                fontWeight: "600",
                fontSize: "14px",
              },
            }
          );
        } else if (cuposRestantes <= 3) {
          // ⚠️ ALERTA DE ADVERTENCIA: Pocos cupos restantes
          toast.info(
            `⚠️ ADVERTENCIA: Solo quedan ${cuposRestantes} cupo${
              cuposRestantes > 1 ? "s" : ""
            } disponible${cuposRestantes > 1 ? "s" : ""} para este evento.`,
            {
              duration: 6000,
              position: "top-center",
              style: {
                background: "#dbeafe",
                color: "#1e40af",
                border: "2px solid #3b82f6",
                fontWeight: "600",
                fontSize: "14px",
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error(
        error.response?.data?.msg || "No se pudo actualizar el estado"
      );
    } finally {
      setActualizandoId(null);
    }
  };

  const listaFiltrada =
    filtro === "TODOS"
      ? inscripciones
      : inscripciones.filter((i) => i.estado === filtro);

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    Promise.all([obtenerInscripciones(), obtenerNombreEvento()]);
  }, [id, obtenerInscripciones, obtenerNombreEvento]);

  return (
    <div className="admininscription-container">
      <div className="evento-header">
        <h2 className="admininscription-title">
          Inscripciones para:{" "}
          <span className="nombre-evento">{nombreEvento}</span>
        </h2>{" "}
        {eventoInfo && (
          <div className="cupos-info">
            <span
              className={`cupos-disponibles ${
                eventoInfo.cup_dis_eve === 0
                  ? "cupos-agotados"
                  : eventoInfo.cup_dis_eve <= 3
                  ? "cupos-pocos"
                  : ""
              }`}
            >
              {eventoInfo.cup_dis_eve === 0
                ? "🚫 Sin cupos disponibles"
                : eventoInfo.cup_dis_eve <= 3
                ? `⚠️ Pocos cupos: ${eventoInfo.cup_dis_eve} de ${eventoInfo.cup_max_eve}`
                : `📍 Cupos disponibles: ${eventoInfo.cup_dis_eve} de ${eventoInfo.cup_max_eve}`}
            </span>
          </div>
        )}
      </div>

      <div className="filtros">
        {["TODOS", "PENDIENTE", "ACEPTADA", "RECHAZADA", "FINALIZADA"].map(
          (estado) => (
            <button
              key={estado}
              className={`filtro-btn ${
                filtro === estado ? "filtro-activo" : ""
              }`}
              onClick={() => setFiltro(estado)}
            >
              {estado}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="loader">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="grid-inscripciones">
          {listaFiltrada.length === 0 ? (
            <p className="mensaje-vacio">
              No hay inscripciones con este filtro.
            </p>
          ) : (
            listaFiltrada.map((inscripcion) => (
              <div key={inscripcion.id_ins} className="card-inscripcion">
                <div className="flex-header">
                  <div>
                    <p className="nombre-usuario">
                      {inscripcion.usuario?.nom_usu}{" "}
                      {inscripcion.usuario?.ape_usu}
                    </p>
                    <p className="card-correo">
                      {inscripcion.usuario?.cor_usu}
                    </p>
                    <p className="card-asistencia">
                      Asistencia: {inscripcion.asistencia ?? "-"}% | Nota:{" "}
                      {inscripcion.nota_final ?? "-"}
                    </p>
                  </div>

                  <span
                    className={`estado-badge ${colores[inscripcion.estado]}`}
                  >
                    {inscripcion.estado === "PENDIENTE" && <Clock size={14} />}
                    {inscripcion.estado === "ACEPTADA" && (
                      <BadgeCheck size={14} />
                    )}
                    {inscripcion.estado === "RECHAZADA" && <Ban size={14} />}
                    {inscripcion.estado === "FINALIZADA" && (
                      <Download size={14} />
                    )}
                    {inscripcion.estado}
                  </span>
                </div>

                {inscripcion.comprobante && (
                  <div className="mt-2">
                    <a
                      href={`${import.meta.env.VITE_API_URL}/uploads/${
                        inscripcion.comprobante
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-comprobante"
                    >
                      <Eye size={14} />
                      Ver comprobante
                    </a>
                  </div>
                )}

                <div className="acciones-inscripcion">
                  {inscripcion.estado === "PENDIENTE" && (
                    <>
                      <button
                        onClick={() =>
                          cambiarEstado(inscripcion.id_ins, "ACEPTADA")
                        }
                        disabled={actualizandoId === inscripcion.id_ins}
                        className="btn-accion btn-aceptar"
                      >
                        {actualizandoId === inscripcion.id_ins
                          ? "Actualizando..."
                          : "Aceptar"}
                      </button>

                      <button
                        onClick={() =>
                          cambiarEstado(inscripcion.id_ins, "RECHAZADA")
                        }
                        disabled={actualizandoId === inscripcion.id_ins}
                        className="btn-accion btn-rechazar"
                      >
                        {actualizandoId === inscripcion.id_ins
                          ? "Actualizando..."
                          : "Rechazar"}
                      </button>
                    </>
                  )}

                  {inscripcion.estado === "ACEPTADA" && (
                    <button
                      onClick={() => {
                        setInscripcionFinalizar(inscripcion);
                        setMostrarFinalizarModal(true);
                        setNotaFinal("");
                        setAsistencia("");
                      }}
                      className="btn-accion btn-finalizar"
                    >
                      Finalizar inscripción
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {mostrarFinalizarModal && (
        <div className="finalizar-modal-overlay">
          <div className="finalizar-modal-content">
            <h2 className="modal-title-aei">
              Finalizar inscripción de {inscripcionFinalizar?.usuario?.nom_usu}{" "}
              {inscripcionFinalizar?.usuario?.ape_usu}
            </h2>

            <label className="modal-label">Asistencia (%)</label>
            <input
              type="number"
              value={asistencia}
              onChange={(e) => setAsistencia(e.target.value)}
              className="modal-input-ae"
              min={0}
              max={100}
            />

            <label className="modal-label">Nota final (0–10)</label>
            <input
              type="number"
              value={notaFinal}
              onChange={(e) => setNotaFinal(e.target.value)}
              className="modal-input-ae"
              min={0}
              max={10}
              step="0.1"
            />

            <div className="modal-actions">
              <button
                onClick={() => setMostrarFinalizarModal(false)}
                className="btn-accion btn-cancelar-aei"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setEnviandoFinalizacion(true);
                  try {
                    if (
                      isNaN(Number(asistencia)) ||
                      isNaN(Number(notaFinal)) ||
                      asistencia === "" ||
                      notaFinal === ""
                    ) {
                      toast.error("Debe ingresar asistencia y nota válidas");
                      setEnviandoFinalizacion(false);
                      return;
                    }
                    const token = localStorage.getItem("token");
                    await axios.put(
                      `${
                        import.meta.env.VITE_API_URL
                      }/api/inscripciones/validar/${
                        inscripcionFinalizar.id_ins
                      }`,
                      {
                        estado: "FINALIZADA",
                        asistencia: Number(asistencia),
                        nota_final: Number(notaFinal),
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success("Inscripción finalizada correctamente");
                    setMostrarFinalizarModal(false);
                    // Actualizar tanto las inscripciones como la información del evento
                    await Promise.all([
                      obtenerInscripciones(),
                      obtenerNombreEvento(), // Esto actualizará los cupos disponibles
                    ]);
                  } catch (err) {
                    console.error(err);
                    toast.error("Error al finalizar");
                  } finally {
                    setEnviandoFinalizacion(false);
                  }
                }}
                disabled={enviandoFinalizacion}
                className="btn-accion btn-finalizar-envio"
              >
                {enviandoFinalizacion ? "Enviando..." : "Finalizar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventInscription;
