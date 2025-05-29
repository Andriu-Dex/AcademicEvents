import { Link } from "react-router-dom";
import './styles/AdminDashboard.css';

const AdminDashboard = () => {  //====================================================
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Panel de Administración</h2>
        <p className="dashboard-subtitle">Sistema de Gestión de Eventos Académicos</p>
      </div>

      <div className="dashboard-content">
        <div className="admin-cards">
          <div className="admin-card">
            <div className="card-icon inscripciones-icon"></div>
            <h3>Inscripciones</h3>
            <p>Administra y valida inscripciones de estudiantes</p>
            <Link to="/admin/inscripciones" className="admin-btn">
              Validar Inscripciones
            </Link>
          </div>

          <div className="admin-card">
            <div className="card-icon eventos-icon"></div>
            <h3>Eventos</h3>
            <p>Gestiona todos los eventos académicos</p>
            <Link to="/admin/eventos" className="admin-btn">
              Gestionar Eventos
            </Link>
          </div>

          <div className="admin-card">
            <div className="card-icon crear-icon"></div>
            <h3>Nuevo Evento</h3>
            <p>Crea y programa nuevos eventos</p>
            <Link to="/admin/eventos/crear" className="admin-btn">
              Crear Nuevo Evento
            </Link>
          </div>

          <div className="admin-card">
            <div className="card-icon carreras-icon"></div>
            <h3>Carreras</h3>
            <p>Administra las carreras disponibles</p>
            <Link to="/admin/carreras" className="admin-btn">
              Gestionar Carreras
            </Link>
          </div>

          <div className="admin-card">
            <div className="card-icon config-icon"></div>
            <h3>Configuración</h3>
            <p>Ajusta parámetros institucionales</p>
            <Link to="/admin/configuracion" className="admin-btn">
              Configuración Institucional
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
