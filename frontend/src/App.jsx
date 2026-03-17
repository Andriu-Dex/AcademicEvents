import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

// Hook para sincronización de datos de usuario
import useUserSync from "./hooks/useUserSync.js";

// Vistas públicas
import Login from "./views/Login.jsx";
import Register from "./views/Register.jsx";
import ForgotPassword from "./views/ForgotPassword.jsx";
import RecoveryInstructionsPage from "./views/RecoveryInstructions.jsx";
import ResetPassword from "./views/ResetPassword.jsx";
import Home from "./views/Home.jsx"; // Ruta temporal de prueba
import EventosPublicos from "./routes/EventosPublicos";
import VerifyEmail from "./views/VerifyEmail.jsx";
import VerificationPending from "./views/VerificationPendingPage.jsx";
import CorrectEmail from "./views/CorrectEmail.jsx";

// Vistas privadas (usuario autenticado)
import EventsRoute from "./routes/EventsRoute";
import CertificatesRoute from "./routes/CertificatesRoute";
import MyInscriptions from "./views/MyInscriptions";
import Perfil from "./views/Perfil.jsx";

// Admin (panel de administración)
import AdminDashboard from "./views/admin/AdminDashboard.jsx";
import AdminReporteDetalle from "./views/admin/reportes/AdminReporteDetalle.jsx";
import AdminReporteMes from "./views/admin/reportes/AdminReporteMes.jsx";
import AdminEvents from "./views/admin/AdminEvents.jsx";
import AdminCarreras from "./views/admin/AdminCarreras.jsx";
import AdminConfiguracionMVA from "./views/admin/AdminConfiguracionMVA.jsx";
import AdminInscripciones from "./views/admin/AdminInscripciones";
import AdminGestion from "./views/admin/AdminGestion.jsx"; // Nuevo componente de gestión de administradores
import CreateEvent from "./views/admin/CreateEvent.jsx";
import EditEvent from "./views/admin/EditEvent.jsx";
import AdminEventInscription from "./views/admin/AdminEventInscription";

// Reportes específicos
import ReporteCarrera from "./views/admin/reportes/ReporteCarrera.jsx";
import ReporteInscripciones from "./views/admin/reportes/ReporteInscripciones.jsx";
import ReporteAsistencia from "./views/admin/reportes/ReporteAsistencia.jsx";
import ReporteCertificados from "./views/admin/reportes/ReporteCertificados.jsx";
import ReporteIngresosPagos from "./views/admin/reportes/ReporteIngresosPagos.jsx";

// Rutas protegidas
import PrivateRouteAdmin from "./components/PrivateRouteAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateLayout from "./layouts/PrivateLayout";

// Componente para refrescar estilos en cambios de ruta
import StyleRefresher from "./components/StyleRefresher";

// Toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPasswordLegacyRedirect() {
  const { token } = useParams();
  return <Navigate to={`/reset-password/${token}`} replace />;
}

function VerifyEmailLegacyRedirect() {
  const { token } = useParams();
  return <Navigate to={`/verify-email/${token}`} replace />;
}

function AdminEditEventLegacyRedirect() {
  const { id } = useParams();
  return <Navigate to={`/admin/events/edit/${id}`} replace />;
}

function AdminEventEnrollmentsLegacyRedirect() {
  const { id } = useParams();
  return <Navigate to={`/admin/events/${id}/enrollments`} replace />;
}

function AdminReporteEventoLegacyRedirect() {
  const { id_eve } = useParams();
  return <Navigate to={`/admin/reports/event/${id_eve}`} replace />;
}

function App() {
  // Usar el hook para sincronizar datos del usuario automáticamente
  useUserSync();

  return (
    <BrowserRouter>
      <>
        {/* Componente para refrescar estilos en cambios de ruta */}
        <StyleRefresher />

        <Routes>
          {/* Redirección por defecto a home */}
          <Route path="/" element={<Navigate to="/home" />} />
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registro" element={<Navigate to="/register" replace />} />
          {/* Rutas de recuperación de contraseña */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/recovery-instructions"
            element={<RecoveryInstructionsPage />}
          />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/restablecer-contrasena/:token"
            element={<ResetPasswordLegacyRedirect />}
          />
          {/* Rutas de verificación de correo */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route
            path="/verificar-correo/:token"
            element={<VerifyEmailLegacyRedirect />}
          />
          <Route
            path="/verification-pending"
            element={<VerificationPending />}
          />
          <Route
            path="/verificacion-pendiente"
            element={<Navigate to="/verification-pending" replace />}
          />
          <Route path="/correct-email" element={<CorrectEmail />} />
          <Route
            path="/corregir-correo"
            element={<Navigate to="/correct-email" replace />}
          />
          {/* ✅ Ruta temporal para probar Home con diferentes roles */}
          <Route path="/home" element={<Home />} />
          {/* Ruta pública para eventos públicos */}
          <Route path="/public-events" element={<EventosPublicos />} />
          <Route
            path="/eventos-publicos"
            element={<Navigate to="/public-events" replace />}
          />
          {/* Rutas privadas (usuario autenticado) */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <EventsRoute />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/eventos" element={<Navigate to="/events" replace />} />
          <Route
            path="/enrollments"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <MyInscriptions />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/inscripciones"
            element={<Navigate to="/enrollments" replace />}
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <CertificatesRoute />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificados"
            element={<Navigate to="/certificates" replace />}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <Perfil />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/perfil" element={<Navigate to="/profile" replace />} />
          {/* Rutas protegidas para ADMIN */}
          <Route
            path="/admin"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminDashboard />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/events"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminEvents />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/eventos"
            element={<Navigate to="/admin/events" replace />}
          />
          <Route
            path="/admin/events/create"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <CreateEvent />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/eventos/crear"
            element={<Navigate to="/admin/events/create" replace />}
          />
          <Route
            path="/admin/events/edit/:id"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <EditEvent />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/eventos/editar/:id"
            element={<AdminEditEventLegacyRedirect />}
          />
          <Route
            path="/admin/events/:id/enrollments"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminEventInscription />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/eventos/:id/inscripciones"
            element={<AdminEventEnrollmentsLegacyRedirect />}
          />
          <Route
            path="/admin/careers"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminCarreras />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/carreras"
            element={<Navigate to="/admin/careers" replace />}
          />
          <Route
            path="/admin/settings"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminConfiguracionMVA />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/configuracion"
            element={<Navigate to="/admin/settings" replace />}
          />
          <Route
            path="/admin/admins"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminGestion />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/gestion-admins"
            element={<Navigate to="/admin/admins" replace />}
          />
          <Route
            path="/admin/reports/events"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminDashboard />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes-evento"
            element={<Navigate to="/admin/reports/events" replace />}
          />
          <Route
            path="/admin/reports/event/:id_eve"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminReporteDetalle />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes-evento/:id_eve"
            element={<AdminReporteEventoLegacyRedirect />}
          />
          <Route
            path="/admin/reports/month"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminReporteMes />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes-mes"
            element={<Navigate to="/admin/reports/month" replace />}
          />
          {/* Nuevas rutas para reportes específicos */}
          <Route
            path="/admin/reports/career"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteCarrera />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes/carrera"
            element={<Navigate to="/admin/reports/career" replace />}
          />
          <Route
            path="/admin/reports/enrollments"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteInscripciones />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes/inscripciones"
            element={<Navigate to="/admin/reports/enrollments" replace />}
          />
          <Route
            path="/admin/reports/attendance"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteAsistencia />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes/asistencia"
            element={<Navigate to="/admin/reports/attendance" replace />}
          />
          <Route
            path="/admin/reports/certificates"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteCertificados />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes/certificados"
            element={<Navigate to="/admin/reports/certificates" replace />}
          />
          <Route
            path="/admin/reports/revenue"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteIngresosPagos />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes/ingresos"
            element={<Navigate to="/admin/reports/revenue" replace />}
          />
          <Route
            path="/admin/enrollments"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminInscripciones />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/inscripciones"
            element={<Navigate to="/admin/enrollments" replace />}
          />
          <Route
            path="/admin/management"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminGestion />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/gestion"
            element={<Navigate to="/admin/management" replace />}
          />
        </Routes>

        {/* Toast global para notificaciones */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </>
    </BrowserRouter>
  );
}

export default App;
