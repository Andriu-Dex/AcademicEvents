import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Eye,
  Trash2,
  CalendarClock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "../styles/AdminEvents.css"; 

const AdminEvents = () => {
  const [eventos, setEventos] = useState([]);
  const navigate = useNavigate();

  const cargarEventos = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/eventos`);
      setEventos(res.data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los eventos");
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const fechaActual = new Date();

  return (
    <div className="admin-events-container">
      <h2 className="admin-events-title">Gestión de Eventos</h2>

      {eventos.length === 0 ? (
        <p className="admin-events-empty">No hay eventos creados aún.</p>
      ) : (
        <div className="admin-events-grid">
          {eventos.map((eve) => {
            const esFinalizado = new Date(eve.fec_fin_eve) < fechaActual;

            return (
              <div key={eve.id_eve} className="admin-event-card">
                <div className="admin-event-header">
                  <h3 className="admin-event-name">{eve.nom_eve}</h3>
                  <span
                    className={`admin-event-label ${
                      eve.pagado_eve ? "evento-pagado" : "evento-gratuito"
                    }`}
                  >
                    {eve.pagado_eve ? "Pagado" : "Gratuito"}
                  </span>
                </div>

                <p className="admin-event-type">{eve.tip_eve}</p>

                <div className="admin-event-details">
                  <p>
                    <CalendarClock size={14} className="icon-inline" />
                    {new Date(eve.fec_ini_eve).toLocaleDateString("es-EC")} –{" "}
                    {new Date(eve.fec_fin_eve).toLocaleDateString("es-EC")}
                  </p>
                  <p>
                    <strong>Duración:</strong> {eve.dur_hrs_eve} horas
                  </p>
                  <p>
                    <strong>Carrera:</strong> {eve.carrera?.nom_car || "General"}
                  </p>
                  <p className="admin-event-status">
                    {esFinalizado ? (
                      <>
                        <XCircle size={14} className="text-muted" />
                        Finalizado
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} className="text-active" />
                        Activo
                      </>
                    )}
                  </p>
                </div>

                <div className="admin-event-actions">
                  <button
                    title="Editar evento"
                    className="admin-event-btn edit"
                    onClick={() => console.log("Editar", eve.id_eve)}
                  >
                    <Pencil size={14} />
                    Editar
                  </button>

                  <button
                    title="Ver inscripciones"
                    className="admin-event-btn view"
                    onClick={() =>
                      navigate(`/admin/eventos/${eve.id_eve}/inscripciones`)
                    }
                  >
                    <Eye size={14} />
                    Ver inscritos
                  </button>

                  <button
                    title="Eliminar evento"
                    className="admin-event-btn delete"
                    onClick={() => console.log("Eliminar", eve.id_eve)}
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
