import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import "./styles/AdminDashboardNew.css";

const AdminDashboard = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/admin/reportes");
        setEventos(res.data.eve);
      } catch (error) {
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Eventos</h2>
      </div>
      <div className="dashboard-content">
        {loading ? (
          <div className="dashboard-loading">Cargando eventos...</div>
        ) : (
          <div className="eventos-grid">
            {eventos.length === 0 ? (
              <p>No hay eventos disponibles.</p>
            ) : (
              eventos.map((evento) => (
                <div
                  className="evento-card"
                  key={evento.id_eve}
                  onClick={() => navigate(`/admin/reportes/${evento.id_eve}`)}
                  style={{
                    cursor: "pointer",
                    border: "1px solid #ececec",
                    borderRadius: "16px",
                    padding: "1.5rem 1rem",
                    background: "#fff",
                    boxShadow: "0 2px 8px #00000012",
                    textAlign: "center",
                    width: "320px",            // <-- Más ancho
                    height: "180px",           // <-- Más bajo
                    transition: "box-shadow .2s, transform .2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <img
                    src={evento.img_por_eve}
                    alt={evento.nom_eve}
                    style={{
                      width: "100%",
                      height: "90px",          // <-- Más bajo
                      objectFit: "contain",    // <-- Mejor para logos rectangulares
                      borderRadius: "10px",
                      marginBottom: "0.5rem",
                      background: "#f9f9f9",
                    }}
                    onError={e => e.target.src = "https://via.placeholder.com/320x90?text=Sin+Imagen"}
                  />
                  <h4 style={{
                    margin: "0 0 0.5rem 0",
                    color: "#8a1538",
                    fontWeight: "bold"
                  }}>
                    {evento.nom_eve}
                  </h4>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
