import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { FileText, XCircle } from "lucide-react";
import ModalCartaMotivacion from "../../components/ModalCartaMotivacion";
import "./styles/AdminInscripciones.css";

const estados = {
  PENDIENTE: "estado-pendiente",
  ACEPTADA: "estado-aceptada",
  RECHAZADA: "estado-rechazada",
  FINALIZADA: "estado-finalizada",
};

const AdminInscripciones = () => {
  const { token } = useAuth();
  const [inscripciones, setInscripciones] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [eventoFiltrado, setEventoFiltrado] = useState("");
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);

  const cargarEventos = async () => {
    try {
      const res = await axiosInstance.get("/eventos");
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
      const res = await axiosInstance.get(
        `/admin/inscripciones/evento/${eventoFiltrado}`
      );
      setInscripciones(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar inscripciones");
      setInscripciones([]);
    }
  };
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axiosInstance.put(`/admin/inscripciones/validar/${id}`, {
        estado: nuevoEstado,
      });
      toast.success(`Inscripción ${nuevoEstado.toLowerCase()}`);
      cargarInscripciones();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al actualizar estado");
    }
  };
  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    cargarInscripciones();
  }, [eventoFiltrado]);

  return (
    <div className="adminins-container">
      <h2 className="adminins-title">Validación de Inscripciones</h2>

      <select
        className="adminins-select"
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

      <table className="adminins-table">
        <thead>
          <tr>
            {" "}
            <th>Estudiante</th>
            <th>Correo</th>
            <th>Evento</th>
            <th>Comprobante</th>
            <th>Carta de Motivación</th>
            <th>Asistencia</th>
            <th>Nota</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inscripciones.map((i) => (
            <tr key={i.id_ins}>
              <td>
                {i.usuario?.nom_usu} {i.usuario?.ape_usu}
              </td>
              <td>{i.usuario?.cor_usu}</td>
              <td>{i.evento?.nom_eve}</td>{" "}
              <td className="adminins-comprobante">
                {i.comprobante ? (
                  <a
                    href={`${import.meta.env.VITE_API_URL}/uploads/${
                      i.comprobante
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="comprobante-link"
                    title="Ver comprobante"
                  >
                    <FileText size={18} />
                  </a>
                ) : (
                  <XCircle
                    size={18}
                    className="comprobante-none"
                    title="No enviado"
                  />
                )}
              </td>{" "}
              <td>
                {i.carta_motivacion ? (
                  <button
                    onClick={() => setCartaSeleccionada(i.carta_motivacion)}
                    className="btn-ver-carta"
                    title="Ver carta de motivación"
                  >
                    Ver carta
                  </button>
                ) : (
                  <span className="no-carta">No enviada</span>
                )}
              </td>
              <td className="text-center">
                {i.asistencia !== null ? `${i.asistencia}%` : "—"}
              </td>
              <td className="text-center">
                {i.nota_final !== null ? i.nota_final.toFixed(1) : "—"}
              </td>
              <td className={`estado-col ${estados[i.estado] || ""}`}>
                {i.estado}
              </td>
              <td>
                <div className="acciones-validacion">
                  {" "}
                  <button
                    onClick={() => cambiarEstado(i.id_ins, "ACEPTADA")}
                    className="btn btn-aceptar"
                    disabled={
                      i.estado === "ACEPTADA" || i.estado === "FINALIZADA"
                    }
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => cambiarEstado(i.id_ins, "RECHAZADA")}
                    className="btn btn-rechazar"
                    disabled={
                      i.estado === "RECHAZADA" || i.estado === "FINALIZADA"
                    }
                  >
                    Rechazar
                  </button>
                </div>{" "}
                <form
                  className="form-finalizar"
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
                      await axiosInstance.put(
                        `/admin/inscripciones/validar/${i.id_ins}`,
                        {
                          estado: "FINALIZADA",
                          nota_final: Number(nota),
                          asistencia: Number(asistencia),
                        }
                      );
                      toast.success("Inscripción finalizada");
                      cargarInscripciones();
                    } catch (error) {
                      toast.error(
                        error.response?.data?.msg || "Error al finalizar"
                      );
                    }
                  }}
                >
                  <div className="form-row">
                    <label>Nota</label>
                    <input
                      type="number"
                      name="nota"
                      min="0"
                      max="10"
                      step="0.1"
                      defaultValue={i.nota_final || ""}
                      onInput={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > 10) e.target.value = 10;
                        if (val < 0) e.target.value = 0;
                      }}
                      className="input-mini"
                    />
                  </div>

                  <div className="form-row">
                    <label>Asist.</label>
                    <input
                      type="number"
                      name="asistencia"
                      min="0"
                      max="100"
                      step="1"
                      defaultValue={i.asistencia || ""}
                      onInput={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > 100) e.target.value = 100;
                        if (val < 0) e.target.value = 0;
                      }}
                      className="input-mini"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-finalizar"
                    disabled={i.estado === "FINALIZADA"}
                  >
                    Finalizar
                  </button>
                </form>
              </td>
            </tr>
          ))}{" "}
        </tbody>
      </table>

      {cartaSeleccionada && (
        <ModalCartaMotivacion
          carta={cartaSeleccionada}
          onClose={() => setCartaSeleccionada(null)}
        />
      )}
    </div>
  );
};

export default AdminInscripciones;
