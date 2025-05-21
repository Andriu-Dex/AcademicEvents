import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { FileText, XCircle } from "lucide-react";

const estados = {
  PENDIENTE: "bg-yellow-200",
  ACEPTADA: "bg-green-200",
  RECHAZADA: "bg-red-200",
};

const AdminInscripciones = () => {
  const { token } = useAuth();

  const [inscripciones, setInscripciones] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [eventoFiltrado, setEventoFiltrado] = useState("");

  const cargarEventos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/eventos");
      setEventos(res.data);
    } catch {
      toast.error("Error al cargar eventos");
    }
  };

  const cargarInscripciones = async () => {
    if (!eventoFiltrado) {
      setInscripciones([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3000/api/admin/inscripciones/evento/${eventoFiltrado}`,

        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInscripciones(res.data);
    } catch (error) {
      console.error("Error al obtener inscripciones:", error);
      toast.error("Error al cargar inscripciones");
      setInscripciones([]);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(
        `http://localhost:3000/api/admin/inscripciones/evento/${eventoFiltrado}`,

        {
          estado: nuevoEstado,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Inscripción ${nuevoEstado.toLowerCase()}`);
      cargarInscripciones();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  useEffect(() => {
    cargarEventos();
    cargarInscripciones();
  }, []);

  useEffect(() => {
    cargarInscripciones();
  }, [eventoFiltrado]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Validación de Inscripciones</h2>

      <select
        className="border p-2 mb-4"
        value={eventoFiltrado}
        onChange={(e) => setEventoFiltrado(e.target.value)}
      >
        <option value="">-- Ver todas --</option>
        {eventos.map((ev) => (
          <option key={ev.id_eve} value={ev.id_eve}>
            {ev.nom_eve}
          </option>
        ))}
      </select>

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Estudiante</th>
            <th className="border p-2">Correo</th>
            <th className="border p-2">Evento</th>
            <th className="border p-2">Comprobante</th>
            <th className="border p-2">Asistencia</th>
            <th className="border p-2">Nota</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inscripciones.map((i) => (
            <tr key={i.id_ins}>
              <td className="border p-2">
                {i.usuario?.nom_usu} {i.usuario?.ape_usu}
              </td>
              <td className="border p-2">{i.usuario?.cor_usu}</td>
              <td className="border p-2">{i.evento?.nom_eve}</td>

              {/* 📄 Enlace al comprobante */}
              <td className="border p-2 text-center">
                {i.comprobante ? (
                  <a
                    href={`http://localhost:3000/uploads/${i.comprobante}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    title="Ver comprobante"
                  >
                    <FileText size={18} />
                  </a>
                ) : (
                  <XCircle
                    size={18}
                    className="text-gray-400 mx-auto"
                    title="No enviado"
                  />
                )}
              </td>
              <td className="border p-2 text-center">
                {i.asistencia !== null ? `${i.asistencia}%` : "—"}
              </td>
              <td className="border p-2 text-center">
                {i.nota_final !== null ? i.nota_final.toFixed(1) : "—"}
              </td>

              <td className={`border p-2 ${estados[i.estado] || ""}`}>
                {i.estado}
              </td>

              <td className="border p-2 space-y-1 text-center">
                {/* Botones básicos */}
                <div className="flex justify-center gap-2 mb-2">
                  <button
                    onClick={() => cambiarEstado(i.id_ins, "ACEPTADA")}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => cambiarEstado(i.id_ins, "RECHAZADA")}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Rechazar
                  </button>
                </div>

                {/* Finalizar inscripción si es curso */}
                <form
                  className="space-y-1 text-xs"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const nota = parseFloat(e.target.nota.value);
                    const asistencia = parseFloat(e.target.asistencia.value);

                    if (isNaN(nota) || nota < 0 || nota > 10) {
                      toast.error("Nota inválida (0–10)");
                      return;
                    }

                    if (
                      isNaN(asistencia) ||
                      asistencia < 0 ||
                      asistencia > 100
                    ) {
                      toast.error("Asistencia inválida (0–100)");
                      return;
                    }

                    try {
                      await axios.put(
                        `http://localhost:3000/api/inscripciones/${i.id_ins}`,
                        {
                          estado: "FINALIZADA",
                          nota_final: nota,
                          asistencia: asistencia,
                        },
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      toast.success("Inscripción finalizada");
                      cargarInscripciones();
                    } catch (error) {
                      const msg =
                        error.response?.data?.msg || "Error al finalizar";
                      toast.error(msg);
                    }
                  }}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <label>Nota</label>
                    <input
                      type="number"
                      name="nota"
                      min="0"
                      max="10"
                      step="0.1"
                      defaultValue={i.nota_final || ""}
                      className="border px-1 py-0.5 w-14 text-center"
                    />
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <label>Asist.</label>
                    <input
                      type="number"
                      name="asistencia"
                      min="0"
                      max="100"
                      step="1"
                      defaultValue={i.asistencia || ""}
                      className="border px-1 py-0.5 w-14 text-center"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-2 py-1 rounded w-full mt-1"
                  >
                    Finalizar
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInscripciones;
