import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import { usePagination } from "../../hooks/usePagination";
import PaginationControls from "../../components/Pagination/PaginationControls";
import {
  GraduationCap,
  ClipboardList,
  CheckSquare,
  Award,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import "./styles/AdminDashboard.css";
import "./styles/reportes-options.css";

const normalizeDashboardEvent = (evento, index = 0) => ({
  id_eve: evento?.id_eve || evento?.id || `evento-${index}`,
  nom_eve: evento?.nom_eve || evento?.name || `Evento ${index + 1}`,
  img_por_eve:
    evento?.img_por_eve ||
    evento?.coverImage ||
    evento?.coverImageUrl ||
    "https://via.placeholder.com/320x90?text=Sin+Imagen",
});

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Usar el hook de paginación para los eventos recientes
  const {
    data: eventos,
    loading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    fetchData,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination("/admin/reports/events-paginated", 10);

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const eventosNormalizados = useMemo(
    () => (Array.isArray(eventos) ? eventos : []).map(normalizeDashboardEvent),
    [eventos]
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Panel de Administración</h2>
      </div>

      {/* Sección de opciones de reportes */}
      <div className="reportes-options">
        <h3>Seleccione un tipo de reporte</h3>
        <div className="reportes-cards">
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reports/career")}
          >
            <div className="reporte-icon">
              <GraduationCap size={32} />
            </div>
            <h4>Reportes por Carrera</h4>
            <p>Estadísticas de participación por carrera académica</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reports/enrollments")}
          >
            <div className="reporte-icon">
              <ClipboardList size={32} />
            </div>
            <h4>Reportes de Inscripciones</h4>
            <p>Estado y tendencias de inscripciones en eventos</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reports/attendance")}
          >
            <div className="reporte-icon">
              <CheckSquare size={32} />
            </div>
            <h4>Reportes de Asistencia</h4>
            <p>Análisis de asistencia vs inscripciones</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reports/certificates")}
          >
            <div className="reporte-icon">
              <Award size={32} />
            </div>
            <h4>Reportes de Certificados</h4>
            <p>Estadísticas de emisión y descarga de certificados</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reports/revenue")}
          >
            <div className="reporte-icon">
              <DollarSign size={32} />
            </div>
            <h4>Reportes de Ingresos y Pagos</h4>
            <p>Análisis de ingresos, pagos y eventos rentables</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reports/month")}
          >
            <div className="reporte-icon">
              <CalendarDays size={32} />
            </div>
            <h4>Reportes por Mes</h4>
            <p>Estadísticas y datos agrupados por mes</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="dashboard-loading">Cargando eventos...</div>
        ) : (
          <div className="eventos-recent">
            <h3>Eventos Recientes</h3>
            <div className="eventos-grid">
              {eventosNormalizados.length === 0 ? (
                <p>No hay eventos disponibles.</p>
              ) : (
                eventosNormalizados.map((evento, index) => (
                  <div
                    className="evento-card-ad"
                    key={`${evento.id_eve}-${index}`}
                    onClick={() =>
                      navigate(`/admin/reports/event/${evento.id_eve}`)
                    }
                  >
                    <img
                      src={evento.img_por_eve}
                      alt={evento.nom_eve}
                      className="evento-imagen-ad"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/320x90?text=Sin+Imagen")
                      }
                    />
                    <h4 className="evento-titulo-ad">{evento.nom_eve}</h4>
                  </div>
                ))
              )}
            </div>

            {/* Controles de paginación estándar */}
            {totalPages > 1 && (
              <div className="pagination-controls-wrapper-ad">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  hasNextPage={hasNextPage}
                  hasPrevPage={hasPrevPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  loading={loading}
                  className="variant-admin"
                  showInfo={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
