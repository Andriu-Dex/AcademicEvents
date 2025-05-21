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
  const [actualizandoId, setActualizandoId] = useState(null);

  const [mostrarFinalizarModal, setMostrarFinalizarModal] = useState(false);
  const [inscripcionFinalizar, setInscripcionFinalizar] = useState(null);
  const [asistencia, setAsistencia] = useState("");
  const [notaFinal, setNotaFinal] = useState("");
  const [enviandoFinalizacion, setEnviandoFinalizacion] = useState(false);

  const obtenerInscripciones = useCallback(async () => {
    try {
      const token = localStorage.getItem("token"); // o como lo estés guardando

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/inscripciones/evento/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/eventos/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await obtenerInscripciones();
    } catch (err) {
      console.error("Error al actualizar estado", err);
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

                  {/* <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${
                      colores[inscripcion.estado]
                    }`}
                  >
                    {inscripcion.estado}
                  </span> */}
                  <span
                    className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded ${
                      colores[inscripcion.estado]
                    }`}
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
                      href={`http://localhost:3000/uploads/${inscripcion.comprobante}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 flex items-center gap-1 text-sm hover:underline"
                    >
                      <Eye size={14} />
                      Ver comprobante
                    </a>
                  </div>
                )}

                <div className="mt-4 flex gap-2 flex-wrap text-sm">
                  {inscripcion.estado === "PENDIENTE" && (
                    <>
                      <button
                        onClick={() =>
                          cambiarEstado(inscripcion.id_ins, "ACEPTADA")
                        }
                        disabled={actualizandoId === inscripcion.id_ins}
                        className={`px-3 py-1 bg-green-100 text-green-700 font-medium rounded transition ${
                          actualizandoId === inscripcion.id_ins
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-green-200"
                        }`}
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
                        className={`px-3 py-1 bg-red-100 text-red-700 font-medium rounded transition ${
                          actualizandoId === inscripcion.id_ins
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-red-200"
                        }`}
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
                      className="px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 transition"
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
      {/* Aquí debes colocar el modal */}
      {mostrarFinalizarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              Finalizar inscripción de {inscripcionFinalizar?.usuario?.nom_usu}{" "}
              {inscripcionFinalizar?.usuario?.ape_usu}
            </h2>

            <label className="block mb-2 text-sm font-medium">
              Asistencia (%)
            </label>
            <input
              type="number"
              value={asistencia}
              onChange={(e) => setAsistencia(e.target.value)}
              min={0}
              max={100}
              className="w-full border rounded px-3 py-1 mb-4"
            />

            <label className="block mb-2 text-sm font-medium">
              Nota final (0–10)
            </label>
            <input
              type="number"
              value={notaFinal}
              onChange={(e) => setNotaFinal(e.target.value)}
              min={0}
              max={10}
              step="0.1"
              className="w-full border rounded px-3 py-1 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarFinalizarModal(false)}
                className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
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
                      `${
                        import.meta.env.VITE_API_URL
                      }/api/inscripciones/validar/${
                        inscripcionFinalizar.id_ins
                      }`,
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
                    toast.error(
                      err.response?.data?.msg || "Error al finalizar"
                    );
                  } finally {
                    setEnviandoFinalizacion(false);
                  }
                }}
                disabled={enviandoFinalizacion}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
