// Importaciones necesarias desde React Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importación de vistas para usuarios
import Login from "./views/Login.jsx";
import CertificatesRoute from "./routes/CertificatesRoute";
import EventsRoute from "./routes/EventsRoute";
import Register from "./views/Register";
import MyInscriptions from "./views/MyInscriptions";

// Importación de vistas del panel de administración
import AdminEventInscription from "./views/admin/AdminEventInscription";
import AdminEvents from "./views/admin/AdminEvents.jsx";
import AdminDashboard from "./views/admin/AdminDashboard.jsx";
import AdminCarreras from "./views/admin/AdminCarreras.jsx";
import AdminConfiguracion from "./views/admin/AdminConfiguracion";
import AdminInscripciones from "./views/admin/AdminInscripciones";

// Componentes para proteger rutas
import PrivateRouteAdmin from "./components/PrivateRouteAdmin"; // Protege rutas para administradores
import PrivateLayout from "./layouts/PrivateLayout"; // Layout común para rutas privadas

// Importación del sistema de notificaciones (toasts)
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <>
        <Routes>
          {/* Ruta raíz: redirecciona automáticamente a la página de login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Rutas públicas accesibles sin autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          {/* Rutas privadas accesibles solo por usuarios autenticados (estudiantes) */}
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
          />
          <Route
            path="/certificados"
            element={
              <PrivateLayout>
                <CertificatesRoute />
              </PrivateLayout>
            }
          />

          {/* Rutas privadas para administradores, protegidas por PrivateRouteAdmin */}
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

        {/* Contenedor global para mostrar notificaciones tipo "toast" en pantalla */}
        <ToastContainer
          position="top-right" // Posición de la notificación
          autoClose={3000} // Cierre automático a los 3 segundos
          hideProgressBar={false} // Mostrar barra de progreso
          newestOnTop={false} // No ordenar por más reciente
          closeOnClick // Cierre al hacer clic
          pauseOnHover // Pausar cierre si se pasa el cursor
          theme="colored" // Tema de colores vivos
        />
      </>
    </BrowserRouter>
  );
}

export default App;
