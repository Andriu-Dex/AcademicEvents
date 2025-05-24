import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BadgeCheck, Clock, Ban, Eye, Download, Loader } from "lucide-react";
import { toast } from "react-toastify";
import "../styles/AdminEventInscription.css";

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

  const obtenerInscripciones = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/inscripciones/evento/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInscripciones(res.data);
    } catch (err) {
      console.err(err);
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
    } catch (err) {
      console.error("Error al obtener nombre del evento", err);
    }
  }, [id]);

  useEffect(() => {
    obtenerInscripciones();
    obtenerNombreEvento();
  }, [obtenerInscripciones, obtenerNombreEvento]);

  const cambiarEstado = async (id_ins, estado) => {
    const token = localStorage.getItem("token");
    setActualizandoId(id_ins);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/inscripciones/validar/${id_ins}`,
        { estado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await obtenerInscripciones();
    } catch {
      toast.error("No se pudo actualizar el estado");
    } finally {
      setActualizandoId(null);
    }
  };

  const listaFiltrada =
    filtro === "TODOS"
      ? inscripciones
      : inscripciones.filter((i) => i.estado === filtro);

  return (
    <div className="admininscription-container">
      <h2 className="admininscription-title">
        Inscripciones para:{" "}
        <span className="nombre-evento">{nombreEvento}</span>
      </h2>

      <div className="filtros">
        {["TODOS", "PENDIENTE", "ACEPTADA", "RECHAZADA", "FINALIZADA"].map((estado) => (
          <button
            key={estado}
            className={`filtro-btn ${filtro === estado ? "filtro-activo" : ""}`}
            onClick={() => setFiltro(estado)}
          >
            {estado}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="grid-inscripciones">
          {listaFiltrada.length === 0 ? (
            <p className="mensaje-vacio">No hay inscripciones con este filtro.</p>
          ) : (
            listaFiltrada.map((inscripcion) => (
              <div key={inscripcion.id_ins} className="card-inscripcion">
                <div className="flex-header">
                  <div>
                    <p className="nombre-usuario">
                      {inscripcion.usuario?.nom_usu} {inscripcion.usuario?.ape_usu}
                    </p>
                    <p className="card-correo">{inscripcion.usuario?.cor_usu}</p>
                    <p className="card-asistencia">
                      Asistencia: {inscripcion.asistencia ?? "-"}% | Nota:{" "}
                      {inscripcion.nota_final ?? "-"}
                    </p>
                  </div>

                  <span className={`estado-badge ${colores[inscripcion.estado]}`}>
                    {inscripcion.estado === "PENDIENTE" && <Clock size={14} />}
                    {inscripcion.estado === "ACEPTADA" && <BadgeCheck size={14} />}
                    {inscripcion.estado === "RECHAZADA" && <Ban size={14} />}
                    {inscripcion.estado === "FINALIZADA" && <Download size={14} />}
                    {inscripcion.estado}
                  </span>
                </div>

                {inscripcion.comprobante && (
                  <div className="mt-2">
                    <a
                      href={`${import.meta.env.VITE_API_URL}/uploads/${inscripcion.comprobante}`}
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
                        onClick={() => cambiarEstado(inscripcion.id_ins, "ACEPTADA")}
                        disabled={actualizandoId === inscripcion.id_ins}
                        className="btn-accion btn-aceptar"
                      >
                        {actualizandoId === inscripcion.id_ins
                          ? "Actualizando..."
                          : "Aceptar"}
                      </button>

                      <button
                        onClick={() => cambiarEstado(inscripcion.id_ins, "RECHAZADA")}
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
            <h2 className="modal-title">
              Finalizar inscripción de {inscripcionFinalizar?.usuario?.nom_usu}{" "}
              {inscripcionFinalizar?.usuario?.ape_usu}
            </h2>

            <label className="modal-label">Asistencia (%)</label>
            <input
              type="number"
              value={asistencia}
              onChange={(e) => setAsistencia(e.target.value)}
              className="modal-input"
              min={0}
              max={100}
            />

            <label className="modal-label">Nota final (0–10)</label>
            <input
              type="number"
              value={notaFinal}
              onChange={(e) => setNotaFinal(e.target.value)}
              className="modal-input"
              min={0}
              max={10}
              step="0.1"
            />

            <div className="modal-actions">
              <button
                onClick={() => setMostrarFinalizarModal(false)}
                className="btn-accion btn-cancelar"
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

                    await axios.put(
                      `${import.meta.env.VITE_API_URL}/api/inscripciones/validar/${inscripcionFinalizar.id_ins}`,
                      {
                        estado: "FINALIZADA",
                        asistencia: Number(asistencia),
                        nota_final: Number(notaFinal),
                      }
                    );

                    toast.success("Inscripción finalizada correctamente");
                    setMostrarFinalizarModal(false);
                    await obtenerInscripciones();
                  } catch (err) {
                    console.err(err);
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
