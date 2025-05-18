import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/Login.jsx";
import CertificatesRoute from "./routes/CertificatesRoute";

// Importación de ToastContainer y sus estilos para mostrar notificaciones tipo toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <>
        {/* Definición de las rutas principales */}
        <Routes>
          {/* Redirecciona la ruta raíz hacia /login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Ruta para el formulario de inicio de sesión */}
          <Route path="/login" element={<Login />} />

          {/* Ruta para mostrar los certificados disponibles del usuario */}
          <Route path="/certificados" element={<CertificatesRoute />} />
        </Routes>

        {/* Componente que permite mostrar notificaciones tipo toast en cualquier parte de la app */}
        <ToastContainer
          position="top-right" // Posición en la pantalla
          autoClose={3000} // Duración automática de cierre (3 segundos)
          hideProgressBar={false} // Mostrar barra de progreso
          newestOnTop={false} // Notificaciones nuevas al final
          closeOnClick // Cierra al hacer clic
          pauseOnHover // Pausa al pasar el mouse
          theme="colored" // Tema con colores diferenciados por tipo (éxito, error, etc.)
        />
      </>
    </BrowserRouter>
  );
}

export default App;
