import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout(); // Limpiar token y usuario
    navigate("/login"); // Redirigir al login
  };
  //====================================================
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Panel de Administración</h2>

      <ul className="space-y-2">
        <li>
          <Link to="/admin/inscripciones" className="text-blue-600 underline">
            Validar Inscripciones
          </Link>
        </li>
        <li>
          <Link to="/admin/eventos" className="text-blue-600 underline">
            Crear/Editar Eventos
          </Link>
        </li>
        <li>
          <Link to="/admin/carreras" className="text-blue-600 underline">
            Gestionar Carreras
          </Link>
        </li>
        <li>
          <Link to="/admin/configuracion" className="text-blue-600 underline">
            Configuración institucional
          </Link>
        </li>
      </ul>

      <button
        onClick={cerrarSesion}
        className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default AdminDashboard;
