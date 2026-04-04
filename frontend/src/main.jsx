// Estilos globales
import "bootstrap/dist/css/bootstrap.min.css";
// Importamos nuestros estilos personalizados después de Bootstrap
import "./assets/custom-bootstrap.css";
import "./index.css";
import "./i18n/config";

// React core
import React from "react";
import ReactDOM from "react-dom/client";

// Accessibility testing in development mode
if (import.meta.env.DEV) {
  const axe = await import("@axe-core/react");
  axe.default(React, ReactDOM, 1000);
}
import axios from "axios";

// App principal
import App from "./App";

// Contextos
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";

const tenantSlugCandidate =
  import.meta.env.VITE_TENANT_SLUG ||
  import.meta.env.VITE_TENANT_ID ||
  localStorage.getItem("tenantSlug") ||
  "uta";

const tenantSlug = (() => {
  const slug = String(tenantSlugCandidate || "").trim().toLowerCase();
  if (!slug) return "uta";
  if (slug.includes("tenant")) return "uta";
  if (/^\d+$/.test(slug)) return "uta";
  if (!/^[a-z0-9-]+$/.test(slug)) return "uta";
  return slug;
})();
axios.defaults.headers.common["X-Tenant-ID"] = tenantSlug;

// Montaje de la aplicación con contextos y modo estricto
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
