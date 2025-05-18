// Importa el componente Link de React Router
import { Link } from "react-router-dom";

const MiComponente = ({ usuario }) => {
  // Verifica si el usuario tiene rol de estudiante
  const esEstudiante = usuario?.rol_usu === "ESTUDIANTE";

  return (
    <nav>
      <ul className="space-y-2">
        {/* Renderiza solo si es estudiante */}
        {esEstudiante && (
          <li>
            <Link
              to="/certificados"
              className="hover:underline text-sm text-blue-600 font-medium"
            >
              Certificados
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default MiComponente;
