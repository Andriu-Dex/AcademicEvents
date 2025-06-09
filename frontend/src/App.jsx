import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Vistas públicas
import Login from "./views/Login.jsx";
import Register from "./views/Register.jsx";
import Home from "./views/Home.jsx"; // Ruta temporal de prueba
import EventosPublicos from "./routes/EventosPublicos";

// Vistas privadas (usuario autenticado)
import EventsRoute from "./routes/EventsRoute";
import CertificatesRoute from "./routes/CertificatesRoute";
import MyInscriptions from "./views/MyInscriptions";
import Perfil from "./views/Perfil.jsx";

// Admin (panel de administración)
import AdminDashboard from "./views/admin/AdminDashboard.jsx";
import AdminReporteDetalle from "./views/admin/AdminReporteDetalle.jsx";
import AdminReporteMes from "./views/admin/AdminReporteMes.jsx";
import AdminEvents from "./views/admin/AdminEvents.jsx";
import AdminCarreras from "./views/admin/AdminCarreras.jsx";
import AdminConfiguracionMVA from "./views/admin/AdminConfiguracionMVA.jsx";
import AdminInscripciones from "./views/admin/AdminInscripciones";
import CreateEvent from "./views/admin/CreateEvent.jsx";
import EditEvent from "./views/admin/EditEvent.jsx";
import AdminEventInscription from "./views/admin/AdminEventInscription";

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
