import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Vistas públicas
import Login from "./views/Login.jsx";
import Register from "./views/Register.jsx";
import Home from "./views/Home.jsx"; // Ruta temporal de prueba

// Vistas privadas (usuario autenticado)
import EventsRoute from "./routes/EventsRoute";
import CertificatesRoute from "./routes/CertificatesRoute";
import MyInscriptions from "./views/MyInscriptions";
import Perfil from "./views/Perfil.jsx";

// Admin (panel de administración)
import AdminDashboard from "./views/admin/AdminDashboard.jsx";
import AdminEvents from "./views/admin/AdminEvents.jsx";
import AdminCarreras from "./views/admin/AdminCarreras.jsx";
import AdminConfiguracion from "./views/admin/AdminConfiguracion";
import AdminInscripciones from "./views/admin/AdminInscripciones";
import CreateEvent from "./views/admin/CreateEvent.jsx";
import EditEvent from "./views/admin/EditEvent.jsx";
import AdminEventInscription from "./views/admin/AdminEventInscription";

// Rutas protegidas
import PrivateRouteAdmin from "./components/PrivateRouteAdmin";
import PrivateLayout from "./layouts/PrivateLayout";

// Toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <>
        <Routes>
          {/* Redirección por defecto a login */}
          <Route path="/" element={<Home />} /> 
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          {/* ✅ Ruta temporal para probar Home con diferentes roles */}
          <Route path="/home" element={<Home />} />
          {/* Rutas privadas (usuario autenticado) */}
          <Route
            path="/eventos"
            element={
              <PrivateLayout>
                <EventsRoute />
              </PrivateLayout>
            }
          />
          <Route
            path="/inscripciones"
            element={
              <PrivateLayout>
                <MyInscriptions />
              </PrivateLayout>
            }
          />{" "}
          <Route
            path="/certificados"
            element={
              <PrivateLayout>
                <CertificatesRoute />
              </PrivateLayout>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateLayout>
                <Perfil />
              </PrivateLayout>
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
                  <AdminConfiguracion />
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
