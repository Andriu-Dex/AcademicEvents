import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { Search } from "lucide-react";
import InscripcionCard from "../../components/InscripcionCard";
import ModalCartaMotivacion from "../../components/ModalCartaMotivacion";
import "./styles/AdminInscripciones.css";

const AdminInscripciones = () => {
  const { token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [inscripciones, setInscripciones] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [eventoFiltrado, setEventoFiltrado] = useState("");
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargarEventos = async () => {
    try {
      const res = await axiosInstance.get("/eventos");
      setEventos(res.data);
    } catch {
      toast.error("Error al cargar eventos");
    }
  };
  const cargarInscripciones = async () => {
    setCargando(true);
    try {
      // Si no hay evento seleccionado, cargamos todas las inscripciones
      if (!eventoFiltrado) {
        const inscripcionesRes = await axiosInstance.get(
          "/admin/inscripciones"
        );
        const inscripcionesEnriquecidas = inscripcionesRes.data.map(
          (inscripcion) => ({
            ...inscripcion,
            onVerCarta: (carta) => setCartaSeleccionada(carta),
          })
        );
        setInscripciones(inscripcionesEnriquecidas);
      } else {
        // Obtener primero la información completa del evento seleccionado
        const eventoRes = await axiosInstance.get(`/eventos/${eventoFiltrado}`);
        const eventoInfo = eventoRes.data;

        // Ahora obtener las inscripciones
        const inscripcionesRes = await axiosInstance.get(
          `/admin/inscripciones/evento/${eventoFiltrado}`
        );

        // Enriquecer las inscripciones con la información completa del evento
        const inscripcionesEnriquecidas = inscripcionesRes.data.map(
          (inscripcion) => ({
            ...inscripcion,
            evento: {
              ...inscripcion.evento,
              val_eve: eventoInfo.val_eve, // Agregar el valor/costo del evento
            },
            onVerCarta: (carta) => setCartaSeleccionada(carta),
          })
        );

        setInscripciones(inscripcionesEnriquecidas);
      }
    } catch (error) {
      toast.error("Error al cargar inscripciones");
      setInscripciones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    cargarInscripciones();
  }, [eventoFiltrado]);

  // Efecto para escuchar eventos de socket y actualizar estado local
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Configurar listeners para eventos de inscripciones
    const handleInscriptionChange = (data) => {
      console.log("📡 Cambio en inscripción recibido:", data);

      // Solo actualizar si la inscripción pertenece al evento filtrado o no hay filtro
      if (data.action === "updated" && data.inscripcion) {
        setInscripciones((prevInscripciones) => {
          return prevInscripciones.map((inscripcion) => {
            if (inscripcion.id_ins === data.id_ins) {
              // Actualizar solo la inscripción específica
              return {
                ...inscripcion,
                ...data.inscripcion,
                onVerCarta: (carta) => setCartaSeleccionada(carta),
              };
            }
            return inscripcion;
          });
        });
      } else if (data.action === "created") {
        // Solo recargar para nuevas inscripciones para asegurar datos completos
        setTimeout(() => {
          cargarInscripciones();
        }, 500);
      }
    };

    const handleValidationChange = (data) => {
      console.log("📡 Cambio en validación recibido:", data);

      // Actualizar estado local para cambios de validación
      if (data.action === "status_changed" && data.data) {
        setInscripciones((prevInscripciones) => {
          return prevInscripciones.map((inscripcion) => {
            if (inscripcion.id_ins === data.data.id) {
              return {
                ...inscripcion,
                est_ins: data.data.estadoNuevo,
                onVerCarta: (carta) => setCartaSeleccionada(carta),
              };
            }
            return inscripcion;
          });
        });
      } else if (data.action === "new_inscription") {
        // Solo recargar para nuevas inscripciones
        setTimeout(() => {
          cargarInscripciones();
        }, 500);
      }
    };

    // Registrar listeners
    socket.on("inscripcion-change-hm", handleInscriptionChange);
    socket.on("inscription-validation-change", handleValidationChange);

    // Cleanup
    return () => {
      socket.off("inscripcion-change-hm", handleInscriptionChange);
      socket.off("inscription-validation-change", handleValidationChange);
    };
  }, [socket, isConnected]);

  // Filtro de inscripciones basado en búsqueda
  const inscripcionesFiltradas = inscripciones.filter((i) => {
    if (!busqueda.trim()) return true;

    const busquedaLower = busqueda.toLowerCase();
    const nombreCompleto =
      `${i.usuario?.nom_usu} ${i.usuario?.ape_usu}`.toLowerCase();
    const correo = i.usuario?.cor_usu?.toLowerCase() || "";
    const evento = i.evento?.nom_eve?.toLowerCase() || "";

    return (
      nombreCompleto.includes(busquedaLower) ||
      correo.includes(busquedaLower) ||
      evento.includes(busquedaLower)
    );
  });

  return (
    <div className="adminins-container">
      <h2 className="adminins-title">Validación de Inscripciones</h2>

      <div className="adminins-filtros">
        <select
          className="adminins-select"
          value={eventoFiltrado}
          onChange={(e) => setEventoFiltrado(e.target.value)}
        >
          <option value="">-- Seleccionar evento --</option>
          {eventos.map((ev) => (
            <option key={ev.id_eve} value={ev.id_eve}>
              {ev.nom_eve}
            </option>
          ))}
        </select>

        <div className="adminins-busqueda">
          <input
            type="text"
            placeholder="Buscar por nombre, correo o evento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="adminins-busqueda-input"
          />
          <Search size={18} className="adminins-busqueda-icono" />
        </div>
      </div>

      {cargando ? (
        <div className="adminins-cargando">Cargando inscripciones...</div>
      ) : (
        <>
          {inscripciones.length === 0 ? (
            <div className="adminins-sin-datos">
              {eventoFiltrado
                ? "No hay inscripciones para este evento"
                : "Selecciona un evento para ver las inscripciones"}
            </div>
          ) : inscripcionesFiltradas.length === 0 ? (
            <div className="adminins-sin-datos">
              No se encontraron resultados para la búsqueda
            </div>
          ) : (
            <div className="adminins-cards-container">
              {inscripcionesFiltradas.map((inscripcion) => (
                <InscripcionCard
                  key={inscripcion.id_ins}
                  inscripcion={inscripcion}
                  onUpdate={cargarInscripciones}
                />
              ))}
            </div>
          )}
        </>
      )}

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
