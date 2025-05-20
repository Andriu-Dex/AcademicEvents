import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
const { token } = useAuth();

const estados = {
  PENDIENTE: "bg-yellow-200",
  ACEPTADA: "bg-green-200",
  RECHAZADA: "bg-red-200",
};

const AdminInscripciones = () => {
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
        `http://localhost:3000/api/inscripciones/evento/${eventoFiltrado}`,
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
      await axios.put(`http://localhost:3000/api/inscripciones/${id}`, {
        estado: nuevoEstado,
      });
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
              <td className="border p-2">{i.usuario?.correo}</td>
              <td className="border p-2">{i.evento?.nom_eve}</td>
              <td className={`border p-2 ${estados[i.estado] || ""}`}>
                {i.estado}
              </td>
              <td className="border p-2 space-x-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInscripciones;
