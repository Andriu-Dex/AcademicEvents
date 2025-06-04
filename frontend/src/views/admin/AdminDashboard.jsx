import { Link } from "react-router-dom";
import "./styles/AdminDashboardNew.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Panel de Administración</h2>
        <p className="dashboard-subtitle">
          Sistema de Gestión de Eventos Académicos
        </p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-info-panel">
          <h3>Panel de Control</h3>
          <p>
            Bienvenido al panel de administración del sistema de gestión de
            eventos académicos. Este espacio está reservado para futuros
            reportes y estadísticas.
          </p>

          <div className="dashboard-placeholder">
            <div className="placeholder-icon"></div>
            <h4>Reportes en desarrollo</h4>
            <p>
              Los reportes y estadísticas estarán disponibles en futuras
              actualizaciones del sistema.
            </p>
          </div>

          <div className="dashboard-note">
            <p>
              Use la barra de navegación en la parte superior para acceder a
              todas las funciones de administración del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
