// Estilos globales
import "bootstrap/dist/css/bootstrap.min.css";
// Importamos nuestros estilos personalizados después de Bootstrap
import "./assets/custom-bootstrap.css";
import "./index.css";
import "./i18n/config";

// React core
import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";

// App principal
import App from "./App";

// Contextos
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

const tenantSlug =
  localStorage.getItem("tenantSlug") ||
  import.meta.env.VITE_TENANT_SLUG ||
  import.meta.env.VITE_TENANT_ID ||
  "uta";
axios.defaults.headers.common["X-Tenant-ID"] = tenantSlug;

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
