import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
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
      </ul>
    </div>
  );
};

export default AdminDashboard;
