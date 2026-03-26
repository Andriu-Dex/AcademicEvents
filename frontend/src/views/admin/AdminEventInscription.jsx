import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { BadgeCheck, Clock, Ban, Eye, Loader } from "lucide-react";
import { toast } from "react-toastify";
import InscripcionService from "../../services/InscripcionService";
import ZoomableImage from "../../components/ZoomableImage";
import useDialogAccessibility from "../../hooks/useDialogAccessibility";
import { usePagination } from "../../hooks/usePagination";
import PaginationControls from "../../components/Pagination/PaginationControls";
import "./styles/AdminEventInscription.css";

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

const colores = {
  PENDING: "estado-pendiente-aei",
  ACCEPTED: "estado-aceptada-aei",
  REJECTED: "estado-rechazada-aei",
  APPROVED: "estado-aprobado-aei",
  FAILED_GRADE: "estado-reprobado-nota-aei",
  FAILED_ATTENDANCE: "estado-reprobado-asistencia-aei",
  FAILED_TOTAL: "estado-reprobado-total-aei",
};

const STATUS_OPTIONS = [
  "TODOS",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "APPROVED",
  "FAILED_GRADE",
  "FAILED_ATTENDANCE",
  "FAILED_TOTAL",
];

const STATUS_LABELS = {
  TODOS: "Todos",
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  APPROVED: "Aprobada",
  FAILED_GRADE: "Reprobada por nota",
  FAILED_ATTENDANCE: "Reprobada por asistencia",
  FAILED_TOTAL: "Reprobada total",
};

const getStatusLabel = (status) => STATUS_LABELS[status] || status;

const AdminEventInscription = () => {
  const { id } = useParams();
  const [filtro, setFiltro] = useState("TODOS");
  const [nombreEvento, setNombreEvento] = useState("");
  const [actualizandoId, setActualizandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [mostrarFinalizarModal, setMostrarFinalizarModal] = useState(false);
  const [inscripcionFinalizar, setInscripcionFinalizar] = useState(null);
  const [asistencia, setAsistencia] = useState("");
  const [notaFinal, setNotaFinal] = useState("");
  const [enviandoFinalizacion, setEnviandoFinalizacion] = useState(false);
  const [eventoInfo, setEventoInfo] = useState(null);
  const [corrigiendoCupos, setCorrigiendoCupos] = useState(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);
  const finalizationModalRef = useRef(null);
  const finalizationCancelButtonRef = useRef(null);
  const receiptModalRef = useRef(null);
  const receiptCloseButtonRef = useRef(null);

  // Hook de paginación
  const {
    data: inscripciones,
    loading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    fetchData,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination(`/admin/inscripciones-paginadas/evento/${id}`, 25);

  // Función para determinar el estado final al finalizar una inscripción
  const determinarEstadoFinal = (asistencia, notaFinal, porcentajeMinimo) => {
    // Si la asistencia es menor al porcentaje mínimo requerido
    if (asistencia < porcentajeMinimo) {
      return "FAILED_ATTENDANCE";
    }

    const finalizationEvent =
      inscripcionFinalizar?.event || inscripcionFinalizar?.evento || {};

    // Si es un curso, verificar la nota
    if ((finalizationEvent.type || finalizationEvent.tip_eve) === "CURSO") {
      // Obtener la nota mínima desde el curso
      const notaMinima =
        finalizationEvent?.eventos_curso?.minPassingGrade ||
        finalizationEvent?.eventos_curso?.not_min_cur ||
        7;

      // Si la nota es menor a la mínima, reprobar por nota
      if (notaFinal < notaMinima) {
        return "FAILED_GRADE";
      }
    }

    // Si pasó todos los filtros, aprobar
    return "APPROVED";
  };

  const obtenerNombreEvento = useCallback(async () => {
    try {
      const eventoData = await InscripcionService.obtenerEvento(id);
      setNombreEvento(eventoData.name || eventoData.nom_eve);
      setEventoInfo(eventoData);
    } catch (err) {
      console.error("Error al obtener evento:", err);
      // Fallback al método original
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/eventos/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNombreEvento(res.data.name || res.data.nom_eve);
        setEventoInfo(res.data);
      } catch (fallbackErr) {
        console.error("Error al obtener evento en fallback:", fallbackErr);
        toast.error("Error al obtener nombre del evento");
      }
    }
  }, [id]);

  const closeFinalizationModal = useCallback(() => {
    setMostrarFinalizarModal(false);
    setInscripcionFinalizar(null);
    setAsistencia("");
    setNotaFinal("");
  }, []);

  const closeReceiptModal = useCallback(() => {
    setComprobanteSeleccionado(null);
  }, []);

  useDialogAccessibility({
    isOpen: mostrarFinalizarModal,
    onClose: closeFinalizationModal,
    containerRef: finalizationModalRef,
    initialFocusRef: finalizationCancelButtonRef,
  });

  useDialogAccessibility({
    isOpen: Boolean(comprobanteSeleccionado),
    onClose: closeReceiptModal,
    containerRef: receiptModalRef,
    initialFocusRef: receiptCloseButtonRef,
  });

  const cambiarEstado = async (registrationId, estado) => {
    setActualizandoId(registrationId);
    try {
      // Encontrar la inscripción actual
      const inscripcionActual = inscripciones.find(
        (i) => (i.id || i.id_ins) === registrationId
      );
      if (!inscripcionActual) {
        throw new Error("Inscripción no encontrada");
      }

      // Validar cambios de estado prohibidos
      const estadosFinales = [
        "APPROVED",
        "FAILED_GRADE",
        "FAILED_ATTENDANCE",
        "FAILED_TOTAL",
      ];
      const estadoActual = toDbStatus(
        inscripcionActual.status || inscripcionActual.est_ins
      );
      if (estadosFinales.includes(estadoActual) && estado === "REJECTED") {
        toast.error("No se puede cambiar una inscripción finalizada a rechazada");
        setActualizandoId(null);
        return;
      }

      // Verificar si es un flujo de finalización
      const esFlujoDeFinalizacion =
        estadosFinales.includes(estado) ||
        (estadosFinales.includes(estadoActual) && estado === "ACCEPTED");

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/inscripciones/validar/${registrationId}`,
        {
          status: estado,
          esFlujoFinalizacion: esFlujoDeFinalizacion, // Agregar flag para todos los cambios de estado
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar tanto las inscripciones como la información del evento
      await Promise.all([
        fetchData(), // Usar fetchData en lugar de obtenerInscripciones
        obtenerNombreEvento(), // Esto actualizará los cupos disponibles
      ]);

      // Mensaje de éxito base
      toast.success(`Inscripción ${getStatusLabel(estado).toLowerCase()} exitosamente`);

      // 🚨 ALERTA ESPECIAL: Si se aceptó una inscripción, verificar cupos restantes
      if (estado === "ACCEPTED") {
        // Obtener información actualizada del evento
        const token = localStorage.getItem("token");
        const eventoRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/eventos/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const cuposRestantes =
          eventoRes.data.availableSlots ?? eventoRes.data.cup_dis_eve;

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

  // Aplicar filtros en la paginación
  useEffect(() => {
    const filtrosActivos = {};

    if (busqueda) {
      filtrosActivos.search = busqueda;
    }

    if (filtro !== "TODOS") {
      filtrosActivos.estado = filtro;
    }

    fetchData(filtrosActivos);
  }, [filtro, fetchData, busqueda]);

  // Cargar datos iniciales
  useEffect(() => {
    obtenerNombreEvento();
  }, [id, obtenerNombreEvento]);

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
                (eventoInfo.availableSlots ?? eventoInfo.cup_dis_eve) === 0
                  ? "cupos-agotados"
                  : (eventoInfo.availableSlots ?? eventoInfo.cup_dis_eve) <= 3
                  ? "cupos-pocos"
                  : ""
              }`}
            >
              {(eventoInfo.availableSlots ?? eventoInfo.cup_dis_eve) === 0
                ? "🚫 Sin cupos disponibles"
                : (eventoInfo.availableSlots ?? eventoInfo.cup_dis_eve) <= 3
                ? `⚠️ Pocos cupos: ${
                    eventoInfo.availableSlots ?? eventoInfo.cup_dis_eve
                  } de ${eventoInfo.maxCapacity ?? eventoInfo.cup_max_eve}`
                : `📍 Cupos disponibles: ${
                    eventoInfo.availableSlots ?? eventoInfo.cup_dis_eve
                  } de ${eventoInfo.maxCapacity ?? eventoInfo.cup_max_eve}`}
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
        {STATUS_OPTIONS.map((estado) => (
          <button
            key={estado}
            className={`filtro-btn ${filtro === estado ? "filtro-activo" : ""}`}
            onClick={() => setFiltro(estado)}
          >
            {getStatusLabel(estado)}
          </button>
        ))}

        <div className="busqueda-container">
          <input
            type="text"
            placeholder="Buscar por nombre, correo o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="busqueda-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loader">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="grid-inscripciones">
          {inscripciones.length === 0 ? (
            <p className="mensaje-vacio">
              No hay inscripciones con estos criterios.
            </p>
          ) : (
            inscripciones.map((inscripcion) => {
              const registrationId = inscripcion.id || inscripcion.id_ins;
              const status = toDbStatus(inscripcion.status || inscripcion.est_ins);
              const account = inscripcion.account || inscripcion.cuenta || {};
              const user = account.user || account.usuario || {};
              const attendance =
                inscripcion.finalAttendancePercent ?? inscripcion.por_asi_fin_usu;
              const grade =
                inscripcion.finalGrade ?? inscripcion.inscripcion_curso?.not_fin_usu;
              const paymentReceipts =
                inscripcion.paymentReceipts || inscripcion.comprobantes_pago || [];

              return (
                <div key={registrationId} className="card-inscripcion">
                  <div className="flex-header">
                    <div>
                      <p className="nombre-usuario">
                        {user.firstName || user.nom_usu} {user.lastName || user.ape_usu}
                      </p>
                      <p className="card-correo">{account.email || account.cor_usu}</p>
                      <p className="card-asistencia">
                        Asistencia: {attendance ?? "-"}% | Nota: {grade ?? "-"}
                      </p>
                    </div>

                    <span className={`estado-badge ${colores[status]}`}>
                      {status === "PENDING" && <Clock size={14} />}
                      {status === "ACCEPTED" && <BadgeCheck size={14} />}
                      {status === "REJECTED" && <Ban size={14} />}
                      {status === "APPROVED" && <BadgeCheck size={14} />}
                      {status === "FAILED_GRADE" ||
                      status === "FAILED_ATTENDANCE" ||
                      status === "FAILED_TOTAL" ? (
                        <Ban size={14} />
                      ) : null}
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  {paymentReceipts[0] && (
                    <div className="mt-2">
                      <button
                        onClick={() =>
                          setComprobanteSeleccionado(
                            paymentReceipts[0].url || paymentReceipts[0].url_com_pag
                          )
                        }
                        className="link-comprobante"
                      >
                        <Eye size={14} />
                        Ver comprobante
                      </button>
                    </div>
                  )}

                  <div className="acciones-inscripcion">
                    {status === "PENDING" && (
                      <>
                        <button
                          onClick={() => cambiarEstado(registrationId, "ACCEPTED")}
                          disabled={actualizandoId === registrationId}
                          className="btn-accion btn-aceptar"
                        >
                          {actualizandoId === registrationId
                            ? "Actualizando..."
                            : "Aceptar"}
                        </button>

                        <button
                          onClick={() => cambiarEstado(registrationId, "REJECTED")}
                          disabled={actualizandoId === registrationId}
                          className="btn-accion btn-rechazar"
                        >
                          {actualizandoId === registrationId
                            ? "Actualizando..."
                            : "Rechazar"}
                        </button>
                      </>
                    )}

                    {status === "ACCEPTED" && (
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
                          onClick={() => cambiarEstado(registrationId, "REJECTED")}
                          disabled={actualizandoId === registrationId}
                          className="btn-accion btn-rechazar"
                        >
                          {actualizandoId === registrationId
                            ? "Actualizando..."
                            : "Rechazar"}
                        </button>
                      </>
                    )}

                    {(status === "FAILED_GRADE" ||
                      status === "FAILED_ATTENDANCE" ||
                      status === "FAILED_TOTAL") && (
                      <button
                        onClick={() => cambiarEstado(registrationId, "ACCEPTED")}
                        disabled={actualizandoId === registrationId}
                        className="btn-accion btn-aceptar"
                      >
                        {actualizandoId === registrationId
                          ? "Actualizando..."
                          : "Volver a Aceptada"}
                      </button>
                    )}

                    {status === "APPROVED" && (
                      <div className="mensaje-estado-final">
                        <span className="texto-estado-final">
                          Inscripción aprobada finalizada
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="paginacion-container">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            loading={loading}
            className="variant-admin"
            showInfo={true}
            showNumbers={true}
          />
        </div>
      )}

      {mostrarFinalizarModal && (
        <div
          className="finalizar-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeFinalizationModal();
            }
          }}
          role="presentation"
        >
          <div
            className="finalizar-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="finalize-inscription-title"
            aria-describedby="finalize-inscription-description"
            tabIndex={-1}
            ref={finalizationModalRef}
          >
            <h2 className="modal-title-aei" id="finalize-inscription-title">
              Finalizar inscripción de{" "}
              {inscripcionFinalizar?.account?.user?.firstName ||
                inscripcionFinalizar?.cuenta?.usuario?.nom_usu}{" "}
              {inscripcionFinalizar?.account?.user?.lastName ||
                inscripcionFinalizar?.cuenta?.usuario?.ape_usu}
            </h2>

            <p id="finalize-inscription-description" className="sr-only">
              Ingresa la asistencia final y, si el evento es un curso, la nota
              final para determinar el estado de la inscripción.
            </p>
            <label className="modal-label">
              Asistencia (mín: {eventoInfo?.minAttendancePercent ?? eventoInfo?.por_min_asi_eve ?? 0}%)
            </label>
            <input
              type="number"
              value={asistencia}
              onChange={(e) => setAsistencia(e.target.value)}
              className="modal-input-ae"
              min={0}
              max={100}
            />

            {(eventoInfo?.type || eventoInfo?.tip_eve) === "CURSO" && (
              <>
                <label className="modal-label">
                  Nota final (mín: {eventoInfo?.eventos_curso?.minPassingGrade ?? eventoInfo?.eventos_curso?.not_min_cur ?? 0}
                  )
                </label>
                <input
                  type="number"
                  value={notaFinal}
                  onChange={(e) => setNotaFinal(e.target.value)}
                  className="modal-input-ae"
                  min={0}
                  max={10}
                  step="0.1"
                />
              </>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={closeFinalizationModal}
                className="btn-accion btn-cancelar-aei"
                ref={finalizationCancelButtonRef}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  setEnviandoFinalizacion(true);
                  try {
                    const eventoFinalizacion =
                      inscripcionFinalizar?.event || inscripcionFinalizar?.evento || {};
                    const requiereNota =
                      (eventoFinalizacion.type || eventoFinalizacion.tip_eve) ===
                      "CURSO";

                    if (isNaN(Number(asistencia)) || asistencia === "") {
                      toast.error("Debe ingresar una asistencia valida");
                      setEnviandoFinalizacion(false);
                      return;
                    }

                    if (requiereNota && (isNaN(Number(notaFinal)) || notaFinal === "")) {
                      toast.error("Debe ingresar una nota valida");
                      setEnviandoFinalizacion(false);
                      return;
                    }

                    const token = localStorage.getItem("token");

                    await axios.put(
                      `${
                        import.meta.env.VITE_API_URL
                      }/api/admin/inscripciones/validar/${
                        inscripcionFinalizar.id || inscripcionFinalizar.id_ins
                      }`,
                      {
                        status: determinarEstadoFinal(
                          Number(asistencia),
                          Number(notaFinal),
                          inscripcionFinalizar?.event?.minAttendancePercent ??
                            inscripcionFinalizar?.evento?.por_min_asi_eve
                        ),
                        finalAttendancePercent: Number(asistencia),
                        finalGrade: notaFinal === "" ? null : Number(notaFinal),
                        esFlujoFinalizacion: true, // Marcar que viene de finalización
                        observacion: "", // Agregar campo vacío para asegurar compatibilidad
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    toast.success("Inscripción finalizada correctamente");
                    closeFinalizationModal();
                    // Actualizar tanto las inscripciones como la información del evento
                    await Promise.all([
                      fetchData(), // Usar fetchData en lugar de obtenerInscripciones
                      obtenerNombreEvento(), // Esto actualizará los cupos disponibles
                    ]);
                  } catch (err) {
                    console.error("Error al finalizar inscripción:", err);
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

      {/* Modal para mostrar el comprobante con zoom */}
      {comprobanteSeleccionado && (
        <div
          className="comprobante-modal-overlay-aei"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeReceiptModal();
            }
          }}
          role="presentation"
        >
          <div
            className="comprobante-modal-content-aei"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-receipt-title"
            aria-describedby="payment-receipt-description"
            tabIndex={-1}
            ref={receiptModalRef}
          >
            <button
              type="button"
              className="cerrar-modal-aei"
              onClick={closeReceiptModal}
              aria-label="Cerrar comprobante de pago"
              ref={receiptCloseButtonRef}
            >
              ×
            </button>
            <h3 className="comprobante-modal-title-aei" id="payment-receipt-title">
              Comprobante de Pago
            </h3>
            <p id="payment-receipt-description" className="sr-only">
              Revisa el comprobante y usa Tab para navegar o Escape para cerrar
              este visor.
            </p>
            <div className="comprobante-contenedor-aei">
              {comprobanteSeleccionado.startsWith("http") ? (
                <ZoomableImage
                  src={comprobanteSeleccionado}
                  alt="Comprobante de pago"
                  className="comprobante-zoom-aei"
                />
              ) : (
                <ZoomableImage
                  src={`${
                    import.meta.env.VITE_API_URL
                  }/uploads/${comprobanteSeleccionado}`}
                  alt="Comprobante de pago"
                  className="comprobante-zoom-aei"
                />
              )}
              <div className="comprobante-instrucciones-aei">
                Pase el cursor sobre la imagen para hacer zoom
              </div>
              <a
                href={
                  comprobanteSeleccionado.startsWith("http")
                    ? comprobanteSeleccionado
                    : `${
                        import.meta.env.VITE_API_URL
                      }/uploads/${comprobanteSeleccionado}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="abrir-comprobante-aei"
              >
                Abrir en nueva ventana
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventInscription;
