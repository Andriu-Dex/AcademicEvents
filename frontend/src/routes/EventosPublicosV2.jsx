import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import {
    CalendarDays,
    Search,
    Home,
    Info,
    LogIn,
    Clock,
    BadgeDollarSign,
    Calendar,
    Users,
    CheckCircle,
    Target,
    FileText,
    AlertCircle,
    Zap,
    Pause
} from "lucide-react";
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

const EventosPublicosV2 = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (usuario) {
            navigate("/eventos");
            return;
        }

        const obtenerEventos = async () => {
            try {
                // Utilizamos el endpoint que incluye las relaciones con carreras y cursos
                const eventosRes = await axiosInstance.get("/eventos");

                // Filtramos los eventos que tienen cupos disponibles
                const eventosPublicos = eventosRes.data.filter(evento => {
                    // Convertimos a número para asegurar comparación correcta
                    const cuposDisponibles = parseInt(evento.cupo_dis_eve) || 0;
                    return cuposDisponibles > 0;
                });

                // Para cada evento, cargamos sus detalles completos incluyendo carreras asociadas
                const eventosConDetalles = await Promise.all(
                    eventosPublicos.map(async evento => {
                        try {
                            const detallesEvento = await axiosInstance.get(`/eventos/${evento.id_eve}`);
                            return detallesEvento.data;
                        } catch (err) {
                            console.error(`Error al cargar detalles del evento ${evento.id_eve}:`, err);
                            return evento; // Devolvemos el evento original si falla la carga de detalles
                        }
                    })
                );

                // Ordenar por fecha de inicio
                const eventosOrdenados = eventosConDetalles.sort((a, b) => {
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
    }, [usuario, navigate]);

    if (cargando) {
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
                </div>

                {eventos.length === 0 ? (
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
                            .filter((ev) => {
                                const coincideNombre = ev.nom_eve.toLowerCase().includes(filtro.toLowerCase());
                                return coincideNombre;
                            })
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
                                        <BadgeDollarSign size={16} />
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
                                        <Calendar size={16} className="inline-icon" /> Fecha: {formatearFechaUTC(evento.fec_ini_eve)} a{" "}
                                        {formatearFechaUTC(evento.fec_fin_eve)}
                                    </p>                                    <p className="duracion-evento-er">
                                        <Clock size={16} className="inline-icon" /> Duración: {evento.dur_hor_eve} horas
                                    </p><p
                                        className={
                                            evento.cupo_dis_eve === 0
                                                ? "cupos-agotados"
                                                : "cupos-disponibles"
                                        }
                                    >
                                        {evento.cupo_dis_eve === 0
                                            ? <><AlertCircle size={16} className="inline-icon" /> Sin cupos disponibles</>
                                            : <><CheckCircle size={16} className="inline-icon" /> Cupos disponibles: {evento.cupo_dis_eve || 0}</>}
                                    </p>                                    <p className="modalidad">
                                        <Users size={16} className="inline-icon" /> Modalidad: {evento.modalidad || "No especificada"}
                                    </p>
                                    <div className="evento-footer">                                        <div className={`estado-evento ${evento.est_eve?.toLowerCase()}`}>
                                        {evento.est_eve === "ACTIVO" ? <><Zap size={14} className="inline-icon" /> ACTIVO</> : <><Pause size={14} className="inline-icon" /> INACTIVO</>}
                                    </div>
                                        <button
                                            className="btn-requisitos"
                                            onClick={() => {
                                                // Mostramos un mensaje en pantalla indicando que se están cargando los requisitos
                                                toast.info("Cargando requisitos del evento...", {
                                                    position: "top-center",
                                                    autoClose: 800,
                                                    hideProgressBar: false,
                                                });

                                                // Pequeña pausa para mejor experiencia de usuario
                                                setTimeout(() => {
                                                    toast.info(
                                                        <div className="detalle-evento-toast">
                                                            <div className="toast-header">
                                                                <h3 className="toast-titulo">{evento.nom_eve}</h3>                                                                <div className="toast-badges">
                                                                    <span className={`toast-estado-badge ${evento.est_eve?.toLowerCase()}`}>
                                                                        {evento.est_eve === "ACTIVO" ?
                                                                            <><Zap size={14} className="inline-icon" /> {evento.est_eve}</> :
                                                                            <><Pause size={14} className="inline-icon" /> {evento.est_eve}</>
                                                                        }
                                                                    </span>
                                                                    <span className="toast-tipo-badge">
                                                                        {evento.tip_eve}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="toast-grid">
                                                                <div className="toast-seccion">
                                                                    <h4><Calendar size={18} className="inline-icon" /> Fechas del Evento</h4>
                                                                    <div className="toast-contenido">
                                                                        <div className="toast-info-item">
                                                                            <span className="toast-label">Inicio:</span>
                                                                            <span className="toast-value">{formatearFechaUTC(evento.fec_ini_eve)}</span>
                                                                        </div>
                                                                        <div className="toast-info-item">
                                                                            <span className="toast-label">Finalización:</span>
                                                                            <span className="toast-value">{formatearFechaUTC(evento.fec_fin_eve)}</span>
                                                                        </div>
                                                                        <div className="toast-info-item">
                                                                            <span className="toast-label">Duración:</span>
                                                                            <span className="toast-value">{evento.dur_hor_eve} horas</span>
                                                                        </div>
                                                                        <div className="toast-info-item">
                                                                            <span className="toast-label">Asistencia mín.:</span>
                                                                            <span className="toast-value">{evento.por_min_asi_eve}%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="toast-seccion">
                                                                    <h4><Users size={18} className="inline-icon" /> Detalles de Participación</h4>
                                                                    <div className="toast-contenido">
                                                                        <div className="toast-info-item">
                                                                            <span className="toast-label">Modalidad:</span>
                                                                            <span className="toast-value">{evento.modalidad || "No especificada"}</span>
                                                                        </div>
                                                                        <div className="toast-info-item">
                                                                            <span className="toast-label">Cupos:</span>
                                                                            <span className="toast-value emphasized">
                                                                                {evento.cupo_dis_eve} disponibles
                                                                                <span className="total-cupos">de {evento.cupo_max_eve}</span>
                                                                            </span>
                                                                        </div>
                                                                        <div className="toast-info-item">
                                                                            <span className="toast-label">Costo:</span>
                                                                            <span className={`toast-value ${evento.val_eve === 0 ? 'gratuito' : 'pago'}`}>
                                                                                {evento.val_eve === 0 ? "Gratuito" : `$${evento.val_eve.toFixed(2)}`}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="toast-seccion">
                                                                <h4><FileText size={18} className="inline-icon" /> Descripción del Evento</h4>
                                                                <p className="toast-descripcion">{evento.des_eve || "No hay descripción disponible."}</p>
                                                            </div>

                                                            <div className="toast-seccion">
                                                                <h4><Target size={18} className="inline-icon" /> Objetivos del Evento</h4>
                                                                <p className="toast-descripcion">{evento.objetivos || "No se han especificado objetivos."}</p>
                                                            </div>

                                                            <div className="toast-seccion requisitos-seccion">
                                                                <h4><CheckCircle size={18} className="inline-icon" /> Requisitos para Inscripción</h4>
                                                                <div className="requisitos-contenido">
                                                                    {/* Requisitos generales */}
                                                                    <p className="toast-descripcion">{evento.requisitos || "No se han especificado requisitos generales."}</p>

                                                                    {/* Requisitos por tipo de usuario */}                                                                    <div className="usuario-requisitos">
                                                                        <h5>Tipos de usuarios elegibles:</h5>
                                                                        <div className="usuarios-lista">
                                                                            <span className="usuario-item"><Users size={14} className="inline-icon" /> ESTUDIANTES</span>
                                                                            <span className="usuario-item"><Users size={14} className="inline-icon" /> DOCENTES</span>
                                                                            <span className="usuario-item"><Users size={14} className="inline-icon" /> PÚBLICO GENERAL</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Carreras elegibles */}
                                                                    {evento.eventos_carrera && evento.eventos_carrera.length > 0 ? (
                                                                        <div className="carreras-elegibles">
                                                                            <h5>Carreras elegibles:</h5>
                                                                            <ul className="carreras-lista">                                                                                {evento.eventos_carrera.map((carreraEvento) => (
                                                                                <li key={carreraEvento.id_eve_car} className="carrera-item">
                                                                                    <FileText size={14} className="inline-icon" /> {carreraEvento.carrera?.nom_car || "Carrera no especificada"}
                                                                                </li>
                                                                            ))}
                                                                            </ul>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="carreras-elegibles">
                                                                            <h5>Carreras elegibles:</h5>
                                                                            <p className="toast-info">Este evento está disponible para todas las carreras.</p>
                                                                        </div>
                                                                    )}

                                                                    {/* Requisitos específicos para cursos */}
                                                                    {evento.eventos_curso && (
                                                                        <div className="curso-requisitos">
                                                                            <h5>Requisitos del curso:</h5>
                                                                            <div className="toast-info-item">
                                                                                <span className="toast-label">Nota mínima:</span>
                                                                                <span className="toast-value">{evento.eventos_curso.not_min_cur}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {evento.datos_extra && (
                                                                <div className="toast-seccion">
                                                                    <h4><AlertCircle size={18} className="inline-icon" /> Información Adicional</h4>
                                                                    <p className="toast-descripcion">{evento.datos_extra}</p>
                                                                </div>
                                                            )}

                                                            <div className="toast-footer">
                                                                <p className="toast-nota">Para inscribirse en este evento, inicie sesión o regístrese en la plataforma.</p>
                                                            </div>
                                                        </div>,
                                                        {
                                                            position: "top-center",
                                                            autoClose: false,
                                                            hideProgressBar: false,
                                                            closeOnClick: true,
                                                            pauseOnHover: true,
                                                            draggable: true,
                                                            progress: undefined,
                                                            className: "toast-detalle-evento"
                                                        }
                                                    );
                                                }, 800);
                                            }}
                                        >
                                            <Info size={16} /> Ver Requisitos
                                        </button>
                                        <Link to="/login" className="btn-inscribirme">
                                            <LogIn size={16} /> Inscribirme
                                        </Link>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default EventosPublicosV2;
