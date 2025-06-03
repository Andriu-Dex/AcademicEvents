import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CalendarDays, Search, CheckCircle } from "lucide-react";
import "./styles/EventsRoute.css";

// Función para formatear fechas correctamente usando UTC
const formatearFechaUTC = (fechaStr) => {
  if (!fechaStr) return "-";
  try {
    // Primero aseguramos que la fecha esté en formato UTC para evitar ajustes de zona horaria
    const fechaParts = fechaStr.split("T")[0].split("-");
    const year = parseInt(fechaParts[0]);
    const month = parseInt(fechaParts[1]) - 1; // En JS, los meses van de 0 a 11
    const day = parseInt(fechaParts[2]);

    const fecha = new Date(Date.UTC(year, month, day));

    if (isNaN(fecha.getTime())) return "-"; // Verifica si la fecha es válida

    return fecha.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC", // Importante: usar UTC para evitar desplazamientos
    });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "-";
  }
};

const EventsRoute = () => {
  const { usuario, token, loading } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [cartaMotivacion, setCartaMotivacion] = useState("");
  const [inscripciones, setInscripciones] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [exitoVisible, setExitoVisible] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!usuario) return navigate("/login");

    const obtenerEventos = async () => {
      try {
        const res = await axiosInstance.get("/eventos");
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
        const res = await Promise.all(
          eventos.map((ev) =>
            axiosInstance
              .get(`/inscripciones/${ev.id_eve}`)
              .then((r) => ({ eventoId: ev.id_eve, inscrito: true }))
              .catch((err) =>
                err.response?.status === 404
                  ? { eventoId: ev.id_eve, inscrito: false }
                  : null
              )
          )
        );
        const inscritos = res.filter(Boolean).map((r) => r.eventoId);
        setInscripciones(inscritos);
      } catch (error) {
        console.error("Error al verificar inscripciones:", error.message);
      }
    };

    if (usuario) obtenerInscripciones();
  }, [usuario]);
  const inscribirse = async () => {
    if (!archivo) return toast.error("Debes subir un archivo PDF");
    if (archivo.size > 5 * 1024 * 1024)
      return toast.error("El archivo no debe superar los 5MB");
    if (!cartaMotivacion.trim())
      return toast.error("Debes escribir una carta de motivación");

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
    formData.append("carta_motivacion", cartaMotivacion);
    try {
      await axiosInstance.post("/inscripciones", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Inscripción enviada con éxito");
      setEventoSeleccionado(null);
      setArchivo(null);
      setCartaMotivacion("");
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
    (evento) => !inscripciones.includes(evento.id_eve)
  );

  if (loading) return <p className="p-6">Cargando sesión...</p>;

  return (
    <div className="eventos-container">
      <h1 className="eventos-titulo">
        <CalendarDays size={24} />
        Eventos disponibles
      </h1>

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
                {/* Imagen de portada (real o placeholder) */}
                <img
                  src={evento.img_por_eve || "https://i.imgur.com/c6Ry30Z.jpeg"}
                  alt={`Portada de ${evento.nom_eve}`}
                  className="evento-portada"
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0",
                    marginBottom: "0.5rem",
                  }}
                />{" "}
                <h2 className="nombre-evento-er">{evento.nom_eve}</h2>
                <p className="tipo">{evento.tip_eve}</p>
                {/* Precio del evento */}
                <p className="precio-evento">
                  {evento.val_eve === 0
                    ? "Gratuito"
                    : `Precio: $${evento.val_eve.toFixed(2)}`}
                </p>
                {/* Descripción del evento */}
                {evento.des_eve && (
                  <div className="descripcion-evento">
                    <p>
                      {evento.des_eve.length > 150
                        ? `${evento.des_eve.substring(0, 150)}...`
                        : evento.des_eve}
                    </p>
                  </div>
                )}{" "}
                <p className="fecha-evento-er">
                  Fecha: {formatearFechaUTC(evento.fec_ini_eve)} a{" "}
                  {formatearFechaUTC(evento.fec_fin_eve)}
                </p>
                <p className="duracion-evento-er">
                  Duración: {evento.dur_hor_eve} horas
                </p>
                {/* Modalidad si existe */}
                {evento.modalidad && (
                  <p className="modalidad">Modalidad: {evento.modalidad}</p>
                )}
                {/* Público objetivo si existe */}
                {evento.publico_objetivo && (
                  <p className="publico">
                    Dirigido a: {evento.publico_objetivo}
                  </p>
                )}
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
          {" "}
          <div className="modal-contenido">
            <h2>Inscripción a: {eventoSeleccionado.nom_eve}</h2>

            <div className="mt-4 mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carta de motivación:
              </label>
              <textarea
                value={cartaMotivacion}
                onChange={(e) => setCartaMotivacion(e.target.value)}
                placeholder="Escribe aquí por qué quieres participar en este evento..."
                className="w-full p-2 border rounded-md min-h-[120px]"
                required
              />
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprobante de pago o documento de respaldo:
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setArchivo(e.target.files[0])}
              className="modal-input-er"
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
                  if (!cartaMotivacion.trim()) {
                    toast.warning(
                      "Por favor escribe una carta de motivación antes de continuar"
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
                  setCartaMotivacion("");
                }}
                className="btn-cancelar-er"
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
