import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  Pencil,
  Eye,
  Trash2,
  CalendarClock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const getEstadoEventoUI = (estado) => {
  switch (estado) {
    case "ACTIVO":
      return { icon: <CheckCircle size={14} className="text-green-500" />, text: "Activo", color: "text-green-600" };
    case "INACTIVO":
      return { icon: <XCircle size={14} className="text-gray-400" />, text: "Inactivo", color: "text-gray-400" };
    case "FINALIZADO":
      return { icon: <XCircle size={14} className="text-red-500" />, text: "Finalizado", color: "text-red-600" };
    case "CANCELADO":
      return { icon: <XCircle size={14} className="text-red-700" />, text: "Cancelado", color: "text-red-700" };
    case "SUSPENDIDO":
      return { icon: <XCircle size={14} className="text-yellow-500" />, text: "Suspendido", color: "text-yellow-500" };
    default:
      return { icon: <XCircle size={14} />, text: "Desconocido", color: "text-gray-400" };
  }
};

const AdminEvents = () => {
  const [eventos, setEventos] = useState([]);
  const navigate = useNavigate();

  const cargarEventos = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/eventos");
      console.log("Respuesta de eventos:", res.data);
      setEventos(res.data);
    } catch (error) {
      console.error("Error al cargar eventos", error);
      toast.error("No se pudieron cargar los eventos");
    }
  }, []);

  const handleEditEvent = (eventoId) => {
    navigate(`/admin/eventos/editar/${eventoId}`);
  };

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const fechaActual = new Date();

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Gestión de Eventos
      </h2>

      {eventos.length === 0 ? (
        <p className="text-gray-600">No hay eventos creados aún.</p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((eve) => {
            const esCurso = eve.tip_eve === "CURSO";
            const esFinalizado = esCurso && eve.eventos_curso?.fec_fin_cur
              ? new Date(eve.eventos_curso.fec_fin_cur) < fechaActual
              : false;
            return (
              <div
                key={eve.id_eve}
                className="bg-white rounded-xl border p-4 shadow hover:shadow-lg transition"
              >                {/* Imagen de portada si existe */}
                {eve.img_por_eve && (
                  <div className="mb-3">
                    <img
                      src={eve.img_por_eve}
                      alt={`Portada de ${eve.nom_eve}`}
                      className="w-full h-48 object-cover rounded-lg"
                      style={{ maxHeight: '192px', height: '192px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {eve.nom_eve}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {eve.des_eve}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${eve.pagado_eve
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                      }`}
                  >
                    {eve.val_eve == 0 ? "Gratuito" : "Valor: $" + eve.val_eve}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1">{eve.tip_eve}</p>

                <div className="text-sm text-gray-700 mt-2 space-y-1">
                  <p>
                    <CalendarClock size={14} className="inline mr-1" />
                    {new Date(eve.fec_ini_eve).toLocaleDateString(
                      "es-EC"
                    )}
                    {esCurso && eve.eventos_curso?.fec_fin_cur
                      ? ` – ${new Date(eve.eventos_curso.fec_fin_cur).toLocaleDateString("es-EC")}`
                      : ""}
                  </p>
                  {esCurso && (
                    <p>
                      <strong>Duración:</strong>{" "}
                      {eve.eventos_curso?.dur_hor_cur
                        ? `${eve.eventos_curso.dur_hor_cur} horas`
                        : "-"}
                    </p>
                  )}

                  {/* Nota mínima (solo cursos) */}
                  {esCurso && (
                    <p>
                      <strong>Nota mínima:</strong>{" "}
                      {eve.eventos_curso?.not_min_cur ?? "-"}
                    </p>
                  )}

                  {/* Porcentaje de asistencia (solo cursos) */}
                  {esCurso && (
                    <p>
                      <strong>Asistencia mínima:</strong>{" "}
                      {eve.eventos_curso?.por_min_asi_cur
                        ? `${eve.eventos_curso.por_min_asi_cur}%`
                        : "-"}
                    </p>
                  )}
                  <p>
                    <strong>Carrera/s:</strong>{" "}
                    {eve.eventos_carrera && eve.eventos_carrera.length > 0
                      ? eve.eventos_carrera.map((ec) => ec.carrera.nom_car).join(", ")
                      : "Aun no asignado"}
                  </p>
                  {(() => {
                    const estadoUI = getEstadoEventoUI(eve.est_eve);
                    return (
                      <p className={`flex items-center gap-1 text-xs ${estadoUI.color}`}>
                        {estadoUI.icon}
                        {estadoUI.text}
                      </p>
                    );
                  })()}
                </div>

                <div className="mt-4 flex gap-3">                  <button
                  title="Editar evento"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  onClick={() => handleEditEvent(eve.id_eve)}
                >
                  <Pencil size={14} />
                  Editar
                </button>

                  <button
                    title="Ver inscripciones"
                    className="text-sm text-gray-700 hover:underline flex items-center gap-1"
                    onClick={() =>
                      navigate(`/admin/eventos/${eve.id_eve}/inscripciones`)
                    }
                  >
                    <Eye size={14} />
                    Ver inscritos
                  </button>

                  <button
                    title="Eliminar evento"
                    className="text-sm text-red-600 hover:underline flex items-center gap-1"
                    onClick={() =>
                      console.log("Eliminar o desactivar", eve.id_eve)
                    }
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
