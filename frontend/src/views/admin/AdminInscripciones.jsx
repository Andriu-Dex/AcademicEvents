import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { Search } from "lucide-react";
import InscripcionCard from "../../components/InscripcionCard";
import ModalCartaMotivacion from "../../components/ModalCartaMotivacion";
import "./styles/AdminInscripciones.css";
import { usePagination } from "../../hooks/usePagination";
import PaginationControls from "../../components/Pagination/PaginationControls";

const AdminInscripciones = () => {
  const { token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [eventos, setEventos] = useState([]);
  const [eventoFiltrado, setEventoFiltrado] = useState("");
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Hook de paginación
  const {
    data: inscripciones,
    loading: cargando,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    fetchData,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination(
    eventoFiltrado
      ? `/admin/inscripciones-paginadas/evento/${eventoFiltrado}`
      : "/admin/inscripciones-paginadas",
    20
  );

  const cargarEventos = async () => {
    try {
      const res = await axiosInstance.get("/eventos");
      setEventos(res.data);
    } catch {
      toast.error("Error al cargar eventos");
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  // Cargar inscripciones cuando cambia el evento filtrado
  useEffect(() => {
    const filtrosActivos = {};

    if (busqueda) {
      filtrosActivos.search = busqueda;
    }

    fetchData(filtrosActivos);
  }, [eventoFiltrado, fetchData, busqueda]);

  // Efecto para escuchar eventos de socket y actualizar estado local
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Configurar listeners para eventos de inscripciones
    const handleInscriptionChange = (data) => {
      if (data.action === "updated" || data.action === "created") {
        // Recargar datos para obtener los cambios más recientes
        fetchData();
      }
    };

    const handleValidationChange = (data) => {
      if (
        data.action === "status_changed" ||
        data.action === "new_inscription"
      ) {
        // Recargar datos para obtener los cambios más recientes
        fetchData();
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
  }, [socket, isConnected, fetchData]);

  // Aplicar el filtro de búsqueda por el lado del cliente para la búsqueda en tiempo real
  const inscripcionesFiltradas = busqueda.trim()
    ? inscripciones.filter((i) => {
        const busquedaLower = busqueda.toLowerCase();
        const nombreCompleto = i.cuenta?.usuario
          ? `${i.cuenta.usuario.nom_usu} ${i.cuenta.usuario.ape_usu}`.toLowerCase()
          : "";
        const correo = i.cuenta?.cor_usu?.toLowerCase() || "";
        const evento = i.evento?.nom_eve?.toLowerCase() || "";
        const cedula = i.cuenta?.usuario?.ced_usu?.toLowerCase() || "";

        return (
          nombreCompleto.includes(busquedaLower) ||
          correo.includes(busquedaLower) ||
          evento.includes(busquedaLower) ||
          cedula.includes(busquedaLower)
        );
      })
    : inscripciones;

  const handleBusquedaChange = useCallback((valor) => {
    setBusqueda(valor);
    // No necesitamos resetear la página aquí porque el effect se encargará de recargar los datos
  }, []);

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
            onChange={(e) => handleBusquedaChange(e.target.value)}
            className="adminins-busqueda-input"
          />
          <Search size={18} className="adminins-busqueda-icono" />
        </div>
      </div>

      {cargando ? (
        <div className="adminins-cargando">Cargando inscripciones...</div>
      ) : (
        <>
          {inscripcionesFiltradas.length === 0 ? (
            <div className="adminins-sin-datos">
              {eventoFiltrado
                ? busqueda
                  ? "No se encontraron resultados para la búsqueda"
                  : "No hay inscripciones para este evento"
                : "Selecciona un evento para ver las inscripciones"}
            </div>
          ) : (
            <div className="adminins-cards-container">
              {inscripcionesFiltradas.map((inscripcion) => (
                <InscripcionCard
                  key={inscripcion.id_ins}
                  inscripcion={inscripcion}
                  onUpdate={() => fetchData()}
                  onVerCarta={(carta) => setCartaSeleccionada(carta)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          loading={cargando}
          className="variant-admin"
          showInfo={true}
          showNumbers={true}
        />
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
