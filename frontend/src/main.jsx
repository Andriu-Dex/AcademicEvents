// Estilos globales
import "bootstrap/dist/css/bootstrap.min.css";
// Importamos nuestros estilos personalizados después de Bootstrap
import "./assets/custom-bootstrap.css";
import "./index.css";

// React core
import React from "react";
import ReactDOM from "react-dom/client";

// App principal
import App from "./App";

// Contextos
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

// Montaje de la aplicación con contextos y modo estricto
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
