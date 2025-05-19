import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Pencil,
  Eye,
  Trash2,
  CalendarClock,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";

const AdminEvents = () => {
  const [eventos, setEventos] = useState([]);

  const cargarEventos = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/eventos`
      );
      setEventos(res.data);
    } catch (error) {
      console.error("Error al cargar eventos", error);
      toast.error("No se pudieron cargar los eventos");
    }
  }, []);

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
            const esFinalizado = new Date(eve.fec_fin_eve) < fechaActual;

            return (
              <div
                key={eve.id_eve}
                className="bg-white rounded-xl border p-4 shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {eve.nom_eve}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      eve.pagado_eve
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {eve.pagado_eve ? "Pagado" : "Gratuito"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1">{eve.tip_eve}</p>

                <div className="text-sm text-gray-700 mt-2 space-y-1">
                  <p>
                    <CalendarClock size={14} className="inline mr-1" />
                    {new Date(eve.fec_ini_eve).toLocaleDateString(
                      "es-EC"
                    )} – {new Date(eve.fec_fin_eve).toLocaleDateString("es-EC")}
                  </p>
                  <p>
                    <strong>Duración:</strong> {eve.dur_hrs_eve} horas
                  </p>
                  <p>
                    <strong>Carrera:</strong>{" "}
                    {eve.carrera?.nom_car || "General"}
                  </p>
                  <p className="flex items-center gap-1 text-xs">
                    {esFinalizado ? (
                      <>
                        <XCircle size={14} className="text-gray-400" />
                        Finalizado
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} className="text-green-500" />
                        Activo
                      </>
                    )}
                  </p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    title="Editar evento"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    onClick={() => console.log("Editar", eve.id_eve)}
                  >
                    <Pencil size={14} />
                    Editar
                  </button>

                  <button
                    title="Ver inscripciones"
                    className="text-sm text-gray-700 hover:underline flex items-center gap-1"
                    onClick={() => console.log("Ver inscripciones", eve.id_eve)}
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
