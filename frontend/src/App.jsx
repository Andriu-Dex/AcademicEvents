import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Vistas públicas
import Login from "./views/Login.jsx";
import Register from "./views/Register.jsx";
import Home from "./views/Home.jsx"; // Ruta temporal de prueba
import EventosPublicos from "./routes/EventosPublicos";
import VerifyEmail from "./views/VerifyEmail.jsx";
import VerificationPending from "./views/VerificationPending.jsx";
import CorrectEmail from "./views/CorrectEmail.jsx";

// Vistas privadas (usuario autenticado)
import EventsRoute from "./routes/EventsRoute";
import CertificatesRoute from "./routes/CertificatesRoute";
import MyInscriptions from "./views/MyInscriptions";
import Perfil from "./views/Perfil.jsx";

// Admin (panel de administración)
import AdminDashboard from "./views/admin/AdminDashboard.jsx";
import AdminReporteDetalle from "./views/admin/Reportes/AdminReporteDetalle.jsx";
import AdminReporteMes from "./views/admin/Reportes/AdminReporteMes.jsx";
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
import ReporteCupos from "./views/admin/reportes/ReporteCupos.jsx";

// Rutas protegidas
import PrivateRouteAdmin from "./components/PrivateRouteAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateLayout from "./layouts/PrivateLayout";

// Componente para refrescar estilos en cambios de ruta
import StyleRefresher from "./components/StyleRefresher";

// Toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
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
          <Route path="/registro" element={<Register />} />
          {/* Rutas de verificación de correo */}
          <Route path="/verificar-correo/:token" element={<VerifyEmail />} />
          <Route
            path="/verificacion-pendiente"
            element={<VerificationPending />}
          />
          <Route path="/corregir-correo" element={<CorrectEmail />} />
          {/* ✅ Ruta temporal para probar Home con diferentes roles */}
          <Route path="/home" element={<Home />} />
          {/* Ruta pública para eventos públicos */}
          <Route path="/eventos-publicos" element={<EventosPublicos />} />
          {/* Rutas privadas (usuario autenticado) */}
          <Route
            path="/eventos"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <EventsRoute />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inscripciones"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <MyInscriptions />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/certificados"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <CertificatesRoute />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <Perfil />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
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
            path="/admin/eventos"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminEvents />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/eventos/crear"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <CreateEvent />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/eventos/editar/:id"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <EditEvent />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/eventos/:id/inscripciones"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminEventInscription />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/carreras"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminCarreras />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/configuracion"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminConfiguracionMVA />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/gestion-admins"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminGestion />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes-evento"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminDashboard />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes-evento/:id_eve"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminReporteDetalle />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes-mes"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminReporteMes />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          {/* Nuevas rutas para reportes específicos */}
          <Route
            path="/admin/reportes/carrera"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteCarrera />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes/inscripciones"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteInscripciones />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes/asistencia"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteAsistencia />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes/certificados"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteCertificados />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/reportes/cupos"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <ReporteCupos />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/inscripciones"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminInscripciones />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/admin/gestion"
            element={
              <PrivateRouteAdmin>
                <PrivateLayout>
                  <AdminGestion />
                </PrivateLayout>
              </PrivateRouteAdmin>
            }
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
