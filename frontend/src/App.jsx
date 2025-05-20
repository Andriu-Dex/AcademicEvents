import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/Login.jsx";
import CertificatesRoute from "./routes/CertificatesRoute";
import EventsRoute from "./routes/EventsRoute";
import Register from "./views/Register";
import MyInscriptions from "./views/MyInscriptions";
import AdminEventInscription from "./views/admin/AdminEventInscription";
import AdminEvents from "./views/admin/AdminEvents.jsx";
import AdminDashboard from "./views/admin/AdminDashboard.jsx";
import AdminCarreras from "./views/admin/AdminCarreras.jsx";
import PrivateRouteAdmin from "./components/PrivateRouteAdmin";
import AdminConfiguracion from "./views/admin/AdminConfiguracion";
import AdminInscripciones from "./views/admin/AdminInscripciones";

// Importación de ToastContainer y estilos para mostrar notificaciones tipo toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <>
        {/* Definición de rutas de navegación */}
        <Routes>
          {/* Redirige la raíz hacia el login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Página de login */}
          <Route path="/login" element={<Login />} />

          {/* Página de registro */}
          <Route path="/registro" element={<Register />} />

          {/* Certificados disponibles para estudiantes */}
          <Route path="/certificados" element={<CertificatesRoute />} />

          {/* Listado de eventos académicos */}
          <Route path="/eventos" element={<EventsRoute />} />

          {/* Página de inscripciones */}
          <Route path="/inscripciones" element={<MyInscriptions />} />

          {/* Página de administración de eventos */}
          <Route
            path="/admin/eventos"
            element={
              <PrivateRouteAdmin>
                <AdminEvents />
              </PrivateRouteAdmin>
            }
          />

          {/* Página de administración de inscripciones para eventos */}
          <Route
            path="/admin/eventos/:id/inscripciones"
            element={
              <PrivateRouteAdmin>
                <AdminEvents />
              </PrivateRouteAdmin>
            }
          />

          {/* Página de administración */}
          <Route
            path="/admin"
            element={
              <PrivateRouteAdmin>
                <AdminDashboard />
              </PrivateRouteAdmin>
            }
          />

          {/* Página de administración de carreras */}
          <Route
            path="/admin/carreras"
            element={
              <PrivateRouteAdmin>
                <AdminCarreras />
              </PrivateRouteAdmin>
            }
          />

          {/* Página de administración de configuraciones */}
          <Route
            path="/admin/configuracion"
            element={
              <PrivateRouteAdmin>
                <AdminConfiguracion />
              </PrivateRouteAdmin>
            }
          />

          {/* Página de administración de inscripciones */}
          <Route
            path="/admin/inscripciones"
            element={
              <PrivateRouteAdmin>
                <AdminInscripciones />
              </PrivateRouteAdmin>
            }
          />
        </Routes>

        {/* Contenedor global para notificaciones tipo toast */}
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
