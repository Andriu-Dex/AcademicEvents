import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/Login.jsx";
import CertificatesRoute from "./routes/CertificatesRoute";
import EventsRoute from "./routes/EventsRoute";
import Register from "./views/Register";
import MyInscriptions from "./views/MyInscriptions";
import AdminEventInscription from "./views/admin/AdminEventInscription";

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

          {/* Página de administración de inscripciones para eventos */}
          <Route
            path="/admin/eventos/:id/inscripciones"
            element={<AdminEventInscription />}
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
