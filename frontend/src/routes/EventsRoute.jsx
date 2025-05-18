import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CalendarDays } from "lucide-react";

const EventsRoute = () => {
  const { usuario, token, loading } = useAuth(); // Contexto de autenticación
  const navigate = useNavigate();

  const [eventos, setEventos] = useState([]);
  const [filtro, setFiltro] = useState("");

  // Validación de sesión y obtención de eventos
  useEffect(() => {
    if (loading) return; // Esperar a que termine de cargar la sesión

    if (!usuario) {
      navigate("/login");
      return;
    }

    // Función para consultar eventos
    const obtenerEventos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/eventos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEventos(res.data);
      } catch (error) {
        toast.error("Error al obtener eventos");
      }
    };

    obtenerEventos(); // Llamada a la función
  }, [usuario, token, loading, navigate]);

  // Filtro en tiempo real
  const eventosFiltrados = eventos.filter((ev) =>
    ev.nom_eve.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <p className="p-6">Cargando sesión...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4 inline-flex items-center gap-2">
        <CalendarDays size={24} />
        Eventos disponibles
      </h1>

      {/* Campo de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="p-2 border rounded w-full mb-4"
      />

      {/* Resultado */}
      {eventosFiltrados.length === 0 ? (
        <p>No hay eventos disponibles.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventosFiltrados.map((evento) => (
            <div
              key={evento.id_eve}
              className="border rounded p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{evento.nom_eve}</h2>
              <p className="text-sm text-gray-600">{evento.tip_eve}</p>
              <p className="text-sm">
                Fecha: {new Date(evento.fec_ini_eve).toLocaleDateString()} a{" "}
                {new Date(evento.fec_fin_eve).toLocaleDateString()}
              </p>
              <p className="text-sm">Duración: {evento.dur_hrs_eve} horas</p>
              {evento.pagado_eve && (
                <p className="text-sm text-red-600 font-semibold">Pagado</p>
              )}

              <button
                onClick={() => toast.info("Pronto: inscripción")}
                className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Inscribirme
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsRoute;
