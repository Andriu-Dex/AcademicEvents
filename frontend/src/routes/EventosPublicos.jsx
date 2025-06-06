import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import { CalendarDays, Search, Home } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "./styles/EventosPublicos.css";

// Función para formatear fechas correctamente usando UTC
const formatearFechaUTC = (fechaStr) => {
    if (!fechaStr) return "-";
    try {
        const fechaParts = fechaStr.split("T")[0].split("-");
        const year = parseInt(fechaParts[0]);
        const month = parseInt(fechaParts[1]) - 1;
        const day = parseInt(fechaParts[2]);

        const fecha = new Date(Date.UTC(year, month, day));
        if (isNaN(fecha.getTime())) return "-";

        return fecha.toLocaleDateString("es-EC", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC",
        });
    } catch (error) {
        console.error("Error al formatear fecha:", error);
        return "-";
    }
};

const EventosPublicos = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [cargando, setCargando] = useState(true);
    useEffect(() => {
        // Si el usuario está autenticado, redirigir a la vista de eventos para usuarios registrados
        if (usuario) {
            navigate("/eventos");
            return;
        }

        const obtenerEventos = async () => {
            try {
                const eventosRes = await axiosInstance.get("/eventos");
                // Filtramos solo los eventos públicos y activos
                const eventosPublicos = eventosRes.data.filter(
                    (evento) => evento.tip_eve === "PUBLICO" && evento.est_eve === "ACTIVO"
                );
                // Ordenar eventos por fecha de inicio, los más próximos primero
                const eventosOrdenados = eventosPublicos.sort((a, b) => {
                    const fechaA = new Date(a.fec_ini_eve);
                    const fechaB = new Date(b.fec_ini_eve);
                    return fechaA - fechaB;
                });
                setEventos(eventosOrdenados);
            } catch (error) {
                console.error("Error al cargar eventos:", error);
                toast.error("Error al cargar los eventos. Por favor, intente más tarde.");
            } finally {
                setCargando(false);
            }
        };

        obtenerEventos();
    }, []); if (cargando) {
        return (
            <>
                <Navbar />
                <div className="eventos-container">
                    <div className="eventos-cargando">
                        <div className="spinner"></div>
                        <p>Cargando eventos públicos disponibles...</p>
                    </div>
                </div>
            </>
        );
    }
    return (
        <>
            <Navbar />
            <div className="eventos-container">
                <h1 className="eventos-titulo">
                    <CalendarDays size={24} />
                    Eventos Públicos
                </h1>
                <div className="buscador-contenedor">
                    <div className="buscador-wrapper">
                        <Search className="buscador-icono" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre del evento..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="eventos-buscador"
                        />
                    </div>
                </div>                {eventos.length === 0 ? (
                    <div className="eventos-vacios">
                        <p>No hay eventos públicos disponibles en este momento.</p>
                        <Link to="/home" className="btn-volver">
                            <Home size={18} />
                            Volver al inicio
                        </Link>
                    </div>
                ) : (
                    <div className="eventos-grid">
                        {eventos
                            .filter((ev) =>
                                ev.nom_eve.toLowerCase().includes(filtro.toLowerCase())
                            )
                            .map((evento) => (
                                <div key={evento.id_eve} className="evento-card">
                                    <img
                                        src={evento.img_por_eve || "https://i.imgur.com/c6Ry30Z.jpeg"}
                                        alt={`Portada de ${evento.nom_eve}`}
                                        className="evento-portada"
                                    />
                                    <h2 className="nombre-evento-er">{evento.nom_eve}</h2>
                                    <p className="tipo">{evento.tip_eve}</p>
                                    <p className="precio-evento">
                                        {evento.val_eve === 0
                                            ? "Gratuito"
                                            : `Precio: $${evento.val_eve.toFixed(2)}`}
                                    </p>
                                    {evento.des_eve && (
                                        <div className="descripcion-evento">
                                            <p>
                                                {evento.des_eve.length > 150
                                                    ? `${evento.des_eve.substring(0, 150)}...`
                                                    : evento.des_eve}
                                            </p>
                                        </div>
                                    )}
                                    <p className="fecha-evento-er">
                                        Fecha: {formatearFechaUTC(evento.fec_ini_eve)} a{" "}
                                        {formatearFechaUTC(evento.fec_fin_eve)}
                                    </p>
                                    <p className="duracion-evento-er">
                                        Duración: {evento.dur_hor_eve} horas
                                    </p>
                                    <p
                                        className={
                                            evento.cupo_dis_eve === 0
                                                ? "cupos-agotados"
                                                : "cupos-disponibles"
                                        }
                                    >
                                        {evento.cupo_dis_eve === 0
                                            ? "🚫 Sin cupos disponibles"
                                            : `Cupos disponibles: ${evento.cupo_dis_eve || 0}`}
                                    </p>
                                    {evento.modalidad && (
                                        <p className="modalidad">Modalidad: {evento.modalidad}</p>
                                    )}
                                    {evento.publico_objetivo && (
                                        <p className="publico">
                                            Dirigido a: {evento.publico_objetivo}
                                        </p>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default EventosPublicos;
