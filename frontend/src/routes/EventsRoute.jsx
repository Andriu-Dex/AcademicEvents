import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
//import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CalendarDays, Search, CheckCircle } from "lucide-react";
import "./styles/EventsRoute.css";

const EventsRoute = () => {
  const { usuario, token, loading } = useAuth();
  const navigate = useNavigate();

  const [eventos, setEventos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [exitoVisible, setExitoVisible] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!usuario) return navigate("/login");

    const obtenerEventos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/eventos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEventos(res.data);
      } catch {
        toast.error("Error al obtener eventos");
      }
    };

    obtenerEventos();
  }, [usuario, token, loading, navigate]);

  useEffect(() => {
    const obtenerInscripciones = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/inscripciones/${usuario.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInscripciones(res.data);
      } catch (error) {
        console.error("Error al obtener inscripciones:", error.message);
      }
    };

    if (usuario) obtenerInscripciones();
  }, [usuario]);

  const inscribirse = async () => {
    if (!archivo) return toast.error("Debes subir un archivo PDF");
    if (archivo.size > 5 * 1024 * 1024)
      return toast.error("El archivo no debe superar los 5MB");

    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      return toast.error(
        "Tipo de archivo no permitido. Solo PDF o imágenes JPG/PNG/WEBP"
      );
    }

    setSubiendo(true);

    const formData = new FormData();
    formData.append("id_usu", usuario.id);
    formData.append("id_eve", eventoSeleccionado.id_eve);
    formData.append("archivo", archivo);

    try {
      await axios.post("http://localhost:3000/api/inscripciones", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Inscripción enviada con éxito");
      setEventoSeleccionado(null);
      setArchivo(null);
      setExitoVisible(true);
      setTimeout(() => setExitoVisible(false), 2000);
      setSubiendo(false);
    } catch (error) {
      // Mostrar mensaje detallado del backend si existe
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error("Error al inscribirse al evento");
      }
    } finally {
      setSubiendo(false);
    }
  };

  const eventosDisponibles = eventos.filter(
    (evento) => !inscripciones.some((ins) => ins.id_eve === evento.id_eve)
  );

  if (loading) return <p className="p-6">Cargando sesión...</p>;

  return (
    <div className="eventos-container">
      <h1 className="eventos-titulo">
        <CalendarDays size={24} />
        Eventos disponibles
      </h1>

      {/* <input
        type="text"
        placeholder="Buscar por nombre..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="eventos-buscador"
      /> */}

      <div className="buscador-contenedor">
        <Search className="buscador-icono" size={18} />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="eventos-buscador"
        />
      </div>

      {eventosDisponibles.length === 0 ? (
        <p className="text-gray-600">No hay eventos disponibles para ti.</p>
      ) : (
        <div className="eventos-grid">
          {eventosDisponibles
            .filter((ev) =>
              ev.nom_eve.toLowerCase().includes(filtro.toLowerCase())
            )
            .map((evento) => (
              <div key={evento.id_eve} className="evento-card">
                <h2>{evento.nom_eve}</h2>
                <p className="tipo">{evento.tip_eve}</p>
                <p>
                  Fecha:{" "}
                  {new Date(evento.fec_ini_eve).toLocaleDateString("es-EC")} a{" "}
                  {new Date(evento.fec_fin_eve).toLocaleDateString("es-EC")}
                </p>
                <p>Duración: {evento.dur_hrs_eve} horas</p>
                {evento.pagado_eve && <p className="pago">Pagado</p>}
                <button
                  onClick={() => setEventoSeleccionado(evento)}
                  className="btn-inscribirme"
                >
                  Inscribirme
                </button>
              </div>
            ))}
        </div>
      )}

      {eventoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Inscripción a: {eventoSeleccionado.nom_eve}</h2>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setArchivo(e.target.files[0])}
              className="modal-input"
            />

            {archivo && (
              <p className="text-sm text-gray-600 mb-2">
                Archivo seleccionado: <strong>{archivo.name}</strong> (
                {archivo.type})
              </p>
            )}

            <div className="modal-botones">
              <button
                onClick={() => {
                  if (!archivo) {
                    toast.warning(
                      "Por favor selecciona un archivo antes de continuar"
                    );
                    return;
                  }
                  inscribirse();
                }}
                className="btn-inscribirme"
                disabled={subiendo}
              >
                {subiendo ? "Enviando..." : "Enviar inscripción"}
              </button>

              <button
                onClick={() => {
                  setEventoSeleccionado(null);
                  setArchivo(null);
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {exitoVisible && (
        <div className="exito-animacion">
          <CheckCircle size={64} color="#16a34a" />
          <p>¡Inscripción enviada!</p>
        </div>
      )}
    </div>
  );
};

export default EventsRoute;
