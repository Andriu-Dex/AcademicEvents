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
  APROBADO: "estado-aprobado",
  REPROBADO_NOTA: "estado-reprobado-nota",
  REPROBADO_ASISTENCIA: "estado-reprobado-asistencia",
  REPROBADO_TOTAL: "estado-reprobado-total",
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
  const [corrigiendoCupos, setCorrigiendoCupos] = useState(false);

  // Función para determinar el estado final al finalizar una inscripción
  const determinarEstadoFinal = (asistencia, notaFinal, porcentajeMinimo) => {
    // Si la asistencia es menor al porcentaje mínimo requerido
    if (asistencia < porcentajeMinimo) {
      return "REPROBADO_ASISTENCIA";
    }

    // Si es un curso, verificar la nota
    if (inscripcionFinalizar?.evento?.tip_eve === "CURSO") {
      // Obtener la nota mínima desde el curso
      const notaMinima =
        inscripcionFinalizar?.evento?.eventos_curso?.not_min_cur || 7;

      // Si la nota es menor a la mínima, reprobar por nota
      if (notaFinal < notaMinima) {
        return "REPROBADO_NOTA";
      }
    }

    // Si pasó todos los filtros, aprobar
    return "APROBADO";
  };

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
      // Encontrar la inscripción actual
      const inscripcionActual = inscripciones.find((i) => i.id_ins === id_ins);
      if (!inscripcionActual) {
        throw new Error("Inscripción no encontrada");
      }

      // Validar cambios de estado prohibidos
      const estadosFinales = [
        "APROBADO",
        "REPROBADO_NOTA",
        "REPROBADO_ASISTENCIA",
        "REPROBADO_TOTAL",
      ];
      if (
        estadosFinales.includes(inscripcionActual.estado) &&
        estado === "RECHAZADA"
      ) {
        toast.error(
          "No se puede cambiar una inscripción finalizada a RECHAZADA"
        );
        setActualizandoId(null);
        return;
      }

      // Verificar si es un flujo de finalización
      const esFlujoDeFinalizacion =
        estadosFinales.includes(estado) ||
        (estadosFinales.includes(inscripcionActual.estado) &&
          estado === "ACEPTADA");

      console.log("Cambiando estado con los siguientes datos:");
      console.log("ID:", id_ins);
      console.log("Estado:", estado);
      console.log("Es flujo de finalización:", esFlujoDeFinalizacion);
      console.log(
        "URL:",
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/inscripciones/validar/${id_ins}`
      );

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/inscripciones/validar/${id_ins}`,
        {
          est_ins: estado,
          esFlujoFinalizacion: esFlujoDeFinalizacion, // Agregar flag para todos los cambios de estado
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Respuesta del servidor:", response.data);

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

  // Función para verificar y corregir cupos del evento
  const verificarYCorregirCupos = async () => {
    setCorrigiendoCupos(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/eventos/${id}/verificar-cupos`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Respuesta de verificación de cupos:", response.data);

      if (response.data.success) {
        // Si no se requirió corrección
        if (response.data.msg.includes("no se requiere corrección")) {
          toast.success(
            "✅ Los cupos están correctos, no se requiere corrección"
          );
        } else {
          // Si se corrigieron los cupos
          const { cup_dis_eve_anterior, cup_dis_eve_corregido, diferencia } =
            response.data.detalles;

          toast.success(
            `✅ Cupos corregidos exitosamente. Antes: ${cup_dis_eve_anterior}, Ahora: ${cup_dis_eve_corregido} (${
              diferencia > 0 ? `+${diferencia}` : diferencia
            })`,
            { duration: 6000 }
          );
        }

        // Actualizar la información del evento para mostrar los cupos actualizados
        await obtenerNombreEvento();
      }
    } catch (error) {
      console.error("Error al verificar cupos:", error);
      toast.error(
        error.response?.data?.msg || "Error al verificar y corregir cupos"
      );
    } finally {
      setCorrigiendoCupos(false);
    }
  };

  // Función para verificar y corregir todos los cupos
  const verificarYCorregirTodosLosCupos = async () => {
    setCorrigiendoCupos(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/eventos/verificar-todos-cupos`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(
        "Respuesta de verificación de todos los cupos:",
        response.data
      );

      if (response.data.success) {
        const { corregidos, correctos, total } = response.data.resultados;

        if (corregidos > 0) {
          toast.success(
            `✅ Verificación completa: ${corregidos} eventos corregidos, ${correctos} eventos correctos de un total de ${total}`,
            { duration: 6000 }
          );
        } else {
          toast.success(
            `✅ Todos los eventos (${total}) tienen cupos correctos, no se requirió corrección`,
            { duration: 4000 }
          );
        }

        // Actualizar la información del evento para mostrar los cupos actualizados
        await obtenerNombreEvento();
      }
    } catch (error) {
      console.error("Error al verificar todos los cupos:", error);
      toast.error(
        error.response?.data?.msg ||
          "Error al verificar y corregir todos los cupos"
      );
    } finally {
      setCorrigiendoCupos(false);
    }
  };

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

            <div className="cupos-actions">
              <button
                onClick={verificarYCorregirCupos}
                disabled={corrigiendoCupos}
                className="btn-verificar-cupos"
                title="Verificar y corregir los cupos para este evento específico"
              >
                {corrigiendoCupos ? "Verificando..." : "Verificar cupos"}
              </button>

              <button
                onClick={verificarYCorregirTodosLosCupos}
                disabled={corrigiendoCupos}
                className="btn-verificar-todos-cupos"
                title="Verificar y corregir los cupos de todos los eventos"
              >
                {corrigiendoCupos
                  ? "Verificando..."
                  : "Verificar todos los eventos"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="filtros">
        {[
          "TODOS",
          "PENDIENTE",
          "ACEPTADA",
          "RECHAZADA",
          "APROBADO",
          "REPROBADO_NOTA",
          "REPROBADO_ASISTENCIA",
          "REPROBADO_TOTAL",
        ].map((estado) => (
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
                    {inscripcion.estado === "APROBADO" && (
                      <BadgeCheck size={14} />
                    )}
                    {inscripcion.estado === "REPROBADO_NOTA" ||
                    inscripcion.estado === "REPROBADO_ASISTENCIA" ||
                    inscripcion.estado === "REPROBADO_TOTAL" ? (
                      <Ban size={14} />
                    ) : null}
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
                    <>
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

                  {(inscripcion.estado === "REPROBADO_NOTA" ||
                    inscripcion.estado === "REPROBADO_ASISTENCIA" ||
                    inscripcion.estado === "REPROBADO_TOTAL") && (
                    <button
                      onClick={() =>
                        cambiarEstado(inscripcion.id_ins, "ACEPTADA")
                      }
                      disabled={actualizandoId === inscripcion.id_ins}
                      className="btn-accion btn-aceptar"
                    >
                      {actualizandoId === inscripcion.id_ins
                        ? "Actualizando..."
                        : "Volver a Aceptada"}
                    </button>
                  )}

                  {inscripcion.estado === "APROBADO" && (
                    <div className="mensaje-estado-final">
                      <span className="texto-estado-final">
                        Inscripción aprobada finalizada
                      </span>
                    </div>
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
                    console.log(
                      "Finalizando inscripción con los siguientes datos:"
                    );
                    console.log("ID:", inscripcionFinalizar.id_ins);
                    console.log(
                      "URL:",
                      `${
                        import.meta.env.VITE_API_URL
                      }/api/admin/inscripciones/validar/${
                        inscripcionFinalizar.id_ins
                      }`
                    );
                    console.log("Datos:", {
                      est_ins: "APROBADO",
                      asistencia: Number(asistencia),
                      nota_final: Number(notaFinal),
                    });

                    const response = await axios.put(
                      `${
                        import.meta.env.VITE_API_URL
                      }/api/admin/inscripciones/validar/${
                        inscripcionFinalizar.id_ins
                      }`,
                      {
                        est_ins: determinarEstadoFinal(
                          Number(asistencia),
                          Number(notaFinal),
                          inscripcionFinalizar?.evento?.por_min_asi_eve
                        ),
                        asistencia: Number(asistencia),
                        nota_final: Number(notaFinal),
                        esFlujoFinalizacion: true, // Marcar que viene de finalización
                        observacion: "", // Agregar campo vacío para asegurar compatibilidad
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    console.log("Respuesta del servidor:", response.data);
                    toast.success("Inscripción finalizada correctamente");
                    setMostrarFinalizarModal(false);
                    // Actualizar tanto las inscripciones como la información del evento
                    await Promise.all([
                      obtenerInscripciones(),
                      obtenerNombreEvento(), // Esto actualizará los cupos disponibles
                    ]);
                  } catch (err) {
                    console.error(
                      "Error detallado al finalizar inscripción:",
                      err
                    );
                    console.error("Mensaje de error:", err.message);
                    console.error(
                      "Respuesta del servidor:",
                      err.response?.data
                    );
                    console.error("Estado HTTP:", err.response?.status);
                    toast.error(
                      `Error al finalizar: ${
                        err.response?.data?.msg ||
                        err.message ||
                        "Error desconocido"
                      }`
                    );
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
