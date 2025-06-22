import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import { usePagination } from "../../hooks/usePagination";
import PaginationControls from "../../components/Pagination/PaginationControls";
import {
  Calendar,
  FileText,
  BarChart,
  GraduationCap,
  ClipboardList,
  CheckSquare,
  Award,
  Users,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import "./styles/AdminDashboard.css";
import "./styles/reportes-options.css";

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
  } = usePagination("/admin/reportes-evento-paginados", 10);

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            onClick={() => navigate("/admin/reportes/carrera")}
          >
            <div className="reporte-icon">
              <GraduationCap size={32} />
            </div>
            <h4>Reportes por Carrera</h4>
            <p>Estadísticas de participación por carrera académica</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reportes/inscripciones")}
          >
            <div className="reporte-icon">
              <ClipboardList size={32} />
            </div>
            <h4>Reportes de Inscripciones</h4>
            <p>Estado y tendencias de inscripciones en eventos</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reportes/asistencia")}
          >
            <div className="reporte-icon">
              <CheckSquare size={32} />
            </div>
            <h4>Reportes de Asistencia</h4>
            <p>Análisis de asistencia vs inscripciones</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reportes/certificados")}
          >
            <div className="reporte-icon">
              <Award size={32} />
            </div>
            <h4>Reportes de Certificados</h4>
            <p>Estadísticas de emisión y descarga de certificados</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reportes/ingresos")}
          >
            <div className="reporte-icon">
              <DollarSign size={32} />
            </div>
            <h4>Reportes de Ingresos y Pagos</h4>
            <p>Análisis de ingresos, pagos y eventos rentables</p>
          </div>
          <div
            className="reporte-card"
            onClick={() => navigate("/admin/reportes-mes")}
          >
            <div className="reporte-icon">
              <BarChart size={32} />
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
              {eventos.length === 0 ? (
                <p>No hay eventos disponibles.</p>
              ) : (
                eventos.map((evento) => (
                  <div
                    className="evento-card-ad"
                    key={evento.id_eve}
                    onClick={() =>
                      navigate(`/admin/reportes-evento/${evento.id_eve}`)
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
