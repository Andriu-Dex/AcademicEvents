import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BadgeCheck, Clock, Ban, Eye, Download, Loader } from "lucide-react";
import { toast } from "react-toastify";

const colores = {
  PENDIENTE: "text-yellow-700 bg-yellow-100",
  ACEPTADA: "text-green-700 bg-green-100",
  RECHAZADA: "text-red-700 bg-red-100",
  FINALIZADA: "text-blue-700 bg-blue-100",
};

const AdminEventInscription = () => {
  const { id } = useParams(); // id del evento
  const [inscripciones, setInscripciones] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [nombreEvento, setNombreEvento] = useState("");

  const obtenerInscripciones = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/inscripciones/${id}`
      );
      setInscripciones(res.data);
    } catch (err) {
      console.error("Error cargando inscripciones", err);
      toast.error("Error al cargar las inscripciones");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const obtenerNombreEvento = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/eventos/${id}`
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
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/inscripciones/validar/${id_ins}`,
        { estado }
      );
      await obtenerInscripciones();
    } catch (err) {
      console.error("Error al actualizar estado", err);
    }
  };

  const listaFiltrada =
    filtro === "TODOS"
      ? inscripciones
      : inscripciones.filter((i) => i.estado === filtro);

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold mb-4">
        Inscripciones para:{" "}
        <span className="text-blue-700">{nombreEvento}</span>
      </h2>

      <div className="flex gap-2 flex-wrap mb-4">
        {["TODOS", "PENDIENTE", "ACEPTADA", "RECHAZADA", "FINALIZADA"].map(
          (estado) => (
            <button
              key={estado}
              className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${
                filtro === estado
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setFiltro(estado)}
            >
              {estado}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="flex justify-center mt-10 text-gray-500">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {listaFiltrada.length === 0 ? (
            <p className="text-gray-500">
              No hay inscripciones con este filtro.
            </p>
          ) : (
            listaFiltrada.map((inscripcion) => (
              <div
                key={inscripcion.id_ins}
                className="p-4 border rounded bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {inscripcion.usuario?.nom_usu}{" "}
                      {inscripcion.usuario?.ape_usu}
                    </p>
                    <p className="text-sm text-gray-600">
                      {inscripcion.usuario?.cor_usu}
                    </p>

                    <p className="text-sm mt-1">
                      Asistencia: {inscripcion.asistencia ?? "-"}% | Nota:{" "}
                      {inscripcion.nota_final ?? "-"}
                    </p>
                  </div>

                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${
                      colores[inscripcion.estado]
                    }`}
                  >
                    {inscripcion.estado}
                  </span>
                </div>

                {inscripcion.comprobante && (
                  <div className="mt-2">
                    <a
                      href={`/uploads/${inscripcion.comprobante}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 flex items-center gap-1 text-sm hover:underline"
                    >
                      <Eye size={14} />
                      Ver comprobante
                    </a>
                  </div>
                )}

                {inscripcion.estado === "PENDIENTE" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() =>
                        cambiarEstado(inscripcion.id_ins, "ACEPTADA")
                      }
                      className="text-green-700 font-medium hover:underline text-sm"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() =>
                        cambiarEstado(inscripcion.id_ins, "RECHAZADA")
                      }
                      className="text-red-600 font-medium hover:underline text-sm"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminEventInscription;
