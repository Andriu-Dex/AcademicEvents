# Implementación Modal de Confirmación para Descarga de Reportes

## 📋 **Objetivo**

Implementar un sistema de confirmación mediante modal antes de descargar reportes, mejorando la experiencia de usuario y evitando descargas accidentales.

## 🏗️ **Arquitectura de la Solución**

### 1. **Componente Modal Reutilizable**

- **Ubicación**: `src/components/Modals/DownloadConfirmModal.jsx`
- **Principio**: Single Responsibility - Solo maneja la confirmación de descarga
- **Reutilización**: Utilizable en todos los componentes de reportes

### 2. **Hook Personalizado de Descarga**

- **Ubicación**: `src/hooks/useDownloadReport.js`
- **Principio**: Separation of Concerns - Lógica de descarga separada de UI
- **Patrón**: Custom Hook para estado y funcionalidades reutilizables

### 3. **Clase Manager de Descarga**

- **Ubicación**: `src/services/DownloadManager.js`
- **Principio**: Encapsulation - Encapsula lógica de descarga de archivos
- **Patrón**: Service Layer para operaciones de red

## 🔧 **Paso 1: Crear el Service Manager**

### `src/services/DownloadManager.js`

```javascript
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";

/**
 * Clase para manejar descargas de reportes
 * Implementa el patrón Service Layer para operaciones de descarga
 */
class DownloadManager {
  /**
   * Descargar archivo mediante GET request
   * @param {string} endpoint - URL del endpoint
   * @param {string} fileName - Nombre del archivo a descargar
   * @returns {Promise<boolean>} - True si la descarga fue exitosa
   */
  static async downloadViaGet(endpoint, fileName) {
    try {
      const response = await axiosInstance.get(endpoint, {
        responseType: "blob",
      });

      return this._createDownloadLink(response.data, fileName);
    } catch (error) {
      console.error("Error en descarga GET:", error);
      toast.error("Error al descargar el reporte");
      return false;
    }
  }

  /**
   * Descargar archivo mediante POST request
   * @param {string} endpoint - URL del endpoint
   * @param {Object} data - Datos a enviar en el POST
   * @param {string} fileName - Nombre del archivo a descargar
   * @returns {Promise<boolean>} - True si la descarga fue exitosa
   */
  static async downloadViaPost(endpoint, data, fileName) {
    try {
      const response = await axiosInstance.post(endpoint, data, {
        responseType: "blob",
      });

      return this._createDownloadLink(response.data, fileName);
    } catch (error) {
      console.error("Error en descarga POST:", error);
      toast.error("Error al descargar el reporte");
      return false;
    }
  }

  /**
   * Crear y ejecutar enlace de descarga
   * @private
   * @param {Blob} data - Datos del archivo
   * @param {string} fileName - Nombre del archivo
   * @returns {boolean} - True si la descarga fue exitosa
   */
  static _createDownloadLink(data, fileName) {
    try {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Reporte descargado exitosamente");
      return true;
    } catch (error) {
      console.error("Error al crear enlace de descarga:", error);
      toast.error("Error al procesar la descarga");
      return false;
    }
  }

  /**
   * Generar nombre de archivo con timestamp
   * @param {string} baseName - Nombre base del archivo
   * @param {string} extension - Extensión del archivo (default: 'pdf')
   * @returns {string} - Nombre del archivo con timestamp
   */
  static generateFileName(baseName, extension = "pdf") {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    return `${baseName}_${timestamp}.${extension}`;
  }
}

export default DownloadManager;
```

## 🎯 **Paso 2: Crear el Hook Personalizado**

### `src/hooks/useDownloadReport.js`

```javascript
import { useState } from "react";
import DownloadManager from "../services/DownloadManager";

/**
 * Hook personalizado para manejar descargas de reportes con confirmación
 * Implementa el patrón State Management para modal y descarga
 */
export const useDownloadReport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadConfig, setDownloadConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Iniciar proceso de descarga (abre modal)
   * @param {Object} config - Configuración de descarga
   * @param {string} config.endpoint - URL del endpoint
   * @param {string} config.fileName - Nombre del archivo
   * @param {string} config.reportType - Tipo de reporte
   * @param {string} config.description - Descripción del reporte
   * @param {string} config.method - Método HTTP ('GET' | 'POST')
   * @param {Object} config.data - Datos para POST (opcional)
   */
  const initiateDownload = (config) => {
    const validatedConfig = {
      method: "GET",
      ...config,
      // Validaciones
      endpoint: config.endpoint || "",
      fileName: config.fileName || "reporte.pdf",
      reportType: config.reportType || "Reporte",
      description: config.description || "Archivo de reporte",
    };

    setDownloadConfig(validatedConfig);
    setIsModalOpen(true);
  };

  /**
   * Ejecutar descarga confirmada
   */
  const executeDownload = async () => {
    if (!downloadConfig) return;

    try {
      setLoading(true);

      let success = false;

      if (downloadConfig.method === "POST") {
        success = await DownloadManager.downloadViaPost(
          downloadConfig.endpoint,
          downloadConfig.data || {},
          downloadConfig.fileName
        );
      } else {
        success = await DownloadManager.downloadViaGet(
          downloadConfig.endpoint,
          downloadConfig.fileName
        );
      }

      if (success) {
        setIsModalOpen(false);
        setDownloadConfig(null);
      }
    } catch (error) {
      console.error("Error en executeDownload:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancelar descarga
   */
  const cancelDownload = () => {
    setIsModalOpen(false);
    setDownloadConfig(null);
    setLoading(false);
  };

  return {
    // Estados
    isModalOpen,
    downloadConfig,
    loading,

    // Métodos
    initiateDownload,
    executeDownload,
    cancelDownload,
  };
};
```

## 🎨 **Paso 3: Crear el Componente Modal**

### `src/components/Modals/DownloadConfirmModal.jsx`

```jsx
import { Dialog } from "@headlessui/react";
import { Download, X, FileText, Calendar, AlertCircle } from "lucide-react";
import "./styles/DownloadConfirmModal.css";

/**
 * Componente Modal para confirmación de descarga de reportes
 * Implementa el patrón Presentation Component - Solo UI, sin lógica de negocio
 */
const DownloadConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  reportType = "Reporte",
  fileName = "reporte.pdf",
  description = "Archivo de reporte",
  size = "medium", // small | medium | large
}) => {
  // Validación de props
  if (!isOpen) return null;

  const modalSizeClass = `download-modal-${size}-dcm`;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="download-modal-container-dcm"
    >
      <div className="modal-overlay-dcm">
        <Dialog.Panel
          className={`download-modal-content-dcm ${modalSizeClass}`}
        >
          {/* Header del Modal */}
          <div className="modal-header-dcm">
            <div className="modal-icon-dcm">
              <FileText size={24} />
            </div>
            <Dialog.Title className="modal-title-dcm">
              Confirmar Descarga de Reporte
            </Dialog.Title>
            <button
              onClick={onClose}
              className="modal-close-button-dcm"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>

          {/* Cuerpo del Modal */}
          <div className="modal-body-dcm">
            <div className="report-info-dcm">
              <div className="info-item-dcm">
                <strong>Tipo de Reporte:</strong>
                <span>{reportType}</span>
              </div>

              <div className="info-item-dcm">
                <strong>Nombre del Archivo:</strong>
                <span className="file-name-dcm">{fileName}</span>
              </div>

              <div className="info-item-dcm">
                <strong>Descripción:</strong>
                <span>{description}</span>
              </div>
            </div>

            <div className="download-warning-dcm">
              <AlertCircle size={16} />
              <span>El archivo se descargará en formato PDF</span>
            </div>
          </div>

          {/* Footer con Acciones */}
          <div className="modal-actions-dcm">
            <button
              onClick={onClose}
              className="btn-cancel-dcm"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="btn-download-dcm"
            >
              {loading ? (
                <>
                  <div className="loading-spinner-dcm"></div>
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Descargar Reporte
                </>
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DownloadConfirmModal;
```

## 🎨 **Paso 4: Crear los Estilos CSS**

### `src/components/Modals/styles/DownloadConfirmModal.css`

```css
/* Modal de Confirmación de Descarga - Download Confirm Modal (dcm) */

.download-modal-container-dcm {
  position: relative;
  z-index: 50;
}

.modal-overlay-dcm {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  animation: fadeIn-dcm 0.2s ease-out;
}

.download-modal-content-dcm {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
  animation: slideIn-dcm 0.3s ease-out;
  overflow: hidden;
}

/* Tamaños del modal */
.download-modal-small-dcm {
  max-width: 400px;
}

.download-modal-medium-dcm {
  max-width: 500px;
}

.download-modal-large-dcm {
  max-width: 600px;
}

/* Header */
.modal-header-dcm {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #8a1538 0%, #a91d47 100%);
  color: white;
}

.modal-icon-dcm {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
}

.modal-title-dcm {
  flex: 1;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-close-button-dcm {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.modal-close-button-dcm:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.modal-close-button-dcm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Cuerpo */
.modal-body-dcm {
  padding: 1.5rem;
}

.report-info-dcm {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item-dcm {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item-dcm strong {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.info-item-dcm span {
  color: #6b7280;
  font-size: 0.875rem;
}

.file-name-dcm {
  font-family: "Courier New", monospace;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem !important;
}

.download-warning-dcm {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.875rem;
}

/* Acciones */
.modal-actions-dcm {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
  background: #f9fafb;
}

.btn-cancel-dcm,
.btn-download-dcm {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.btn-cancel-dcm {
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
}

.btn-cancel-dcm:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-download-dcm {
  background: linear-gradient(135deg, #8a1538 0%, #a91d47 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(138, 21, 56, 0.2);
}

.btn-download-dcm:hover:not(:disabled) {
  background: linear-gradient(135deg, #761230 0%, #8b1a3d 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(138, 21, 56, 0.3);
}

.btn-cancel-dcm:disabled,
.btn-download-dcm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Loading Spinner */
.loading-spinner-dcm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin-dcm 1s linear infinite;
}

/* Animaciones */
@keyframes fadeIn-dcm {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn-dcm {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin-dcm {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .download-modal-content-dcm {
    width: 95%;
    margin: 1rem;
  }

  .modal-header-dcm,
  .modal-body-dcm,
  .modal-actions-dcm {
    padding: 1rem;
  }

  .modal-actions-dcm {
    flex-direction: column;
  }

  .btn-cancel-dcm,
  .btn-download-dcm {
    width: 100%;
  }
}
```

## 🔧 **Paso 5: Implementar en ReporteCarrera**

### Modificaciones en `src/views/admin/reportes/ReporteCarrera.jsx`

```jsx
// Agregar imports
import { useDownloadReport } from "../../../hooks/useDownloadReport";
import DownloadConfirmModal from "../../../components/Modals/DownloadConfirmModal";

const ReporteCarrera = () => {
  // ...existing state...

  // Hook de descarga
  const {
    isModalOpen,
    downloadConfig,
    loading: downloadLoading,
    initiateDownload,
    executeDownload,
    cancelDownload,
  } = useDownloadReport();

  // Reemplazar función descargarPDF
  const handleDownloadClick = () => {
    if (!carreraSeleccionada) return;

    const carreraActual = carreras.find(
      (c) => c.id_car === carreraSeleccionada
    );
    const nombreCarrera = carreraActual?.nom_car || "Carrera";

    initiateDownload({
      endpoint: `/admin/reportes-carrera/pdf/${carreraSeleccionada}`,
      fileName: `Reporte_${nombreCarrera.replace(/\s+/g, "_")}.pdf`,
      reportType: "Reporte por Carrera",
      description: `Estadísticas de participación de la carrera ${nombreCarrera}`,
      method: "GET",
    });
  };

  return (
    <div className="reporte-carrera-container">
      {/* ...existing JSX... */}

      <button
        className="btn-descargar"
        onClick={handleDownloadClick}
        disabled={!carreraSeleccionada}
      >
        Descargar Reporte PDF
      </button>

      {/* Modal de confirmación */}
      <DownloadConfirmModal
        isOpen={isModalOpen}
        onClose={cancelDownload}
        onConfirm={executeDownload}
        loading={downloadLoading}
        reportType={downloadConfig?.reportType}
        fileName={downloadConfig?.fileName}
        description={downloadConfig?.description}
      />

      {/* ...rest of JSX... */}
    </div>
  );
};
```

## 🔧 **Paso 6: Implementar en AdminReporteMes**

### Modificaciones en `src/views/admin/reportes/AdminReporteMes.jsx`

```jsx
// Agregar imports
import { useDownloadReport } from "../../../hooks/useDownloadReport";
import DownloadConfirmModal from "../../../components/Modals/DownloadConfirmModal";

const AdminReporteMes = () => {
  // ...existing state...

  // Hook de descarga
  const {
    isModalOpen,
    downloadConfig,
    loading: downloadLoading,
    initiateDownload,
    executeDownload,
    cancelDownload,
  } = useDownloadReport();

  // Reemplazar función descargarPDFMensual
  const handleDownloadClick = () => {
    const nombreArchivo = `Reporte_Mensual_${MESES[mes - 1]}_${anio}.pdf`;

    initiateDownload({
      endpoint: "/admin/reportes-mes/pdf",
      fileName: nombreArchivo,
      reportType: "Reporte Mensual de Eventos",
      description: `Reporte de eventos del mes ${MESES[mes - 1]} de ${anio}`,
      method: "POST",
      data: { anio, mes },
    });
  };

  return (
    <div className="reporte-mes-container">
      {/* ...existing JSX... */}

      {eventos.length > 0 && (
        <>
          <button
            className="reporte-btn-descargar"
            onClick={handleDownloadClick}
            disabled={loading}
          >
            Descargar PDF
          </button>

          {/* Modal de confirmación */}
          <DownloadConfirmModal
            isOpen={isModalOpen}
            onClose={cancelDownload}
            onConfirm={executeDownload}
            loading={downloadLoading}
            reportType={downloadConfig?.reportType}
            fileName={downloadConfig?.fileName}
            description={downloadConfig?.description}
          />
        </>
      )}
    </div>
  );
};
```

## 📋 **Paso 7: Aplicar a Otros Reportes**

Aplicar el mismo patrón a:

- `ReporteInscripciones.jsx`
- `ReporteAsistencia.jsx`
- `ReporteCertificados.jsx`
- `ReporteCupos.jsx`

### Patrón General:

```jsx
// 1. Importar hook y modal
import { useDownloadReport } from "../../../hooks/useDownloadReport";
import DownloadConfirmModal from "../../../components/Modals/DownloadConfirmModal";

// 2. Usar hook
const {
  isModalOpen,
  downloadConfig,
  loading,
  initiateDownload,
  executeDownload,
  cancelDownload,
} = useDownloadReport();

// 3. Crear handler
const handleDownloadClick = () => {
  initiateDownload({
    endpoint: "URL_DEL_ENDPOINT",
    fileName: "NOMBRE_DEL_ARCHIVO.pdf",
    reportType: "TIPO_DE_REPORTE",
    description: "DESCRIPCIÓN_DEL_REPORTE",
    method: "GET", // o 'POST'
    // data: {} // si es POST
  });
};

// 4. Agregar modal al JSX
<DownloadConfirmModal
  isOpen={isModalOpen}
  onClose={cancelDownload}
  onConfirm={executeDownload}
  loading={loading}
  reportType={downloadConfig?.reportType}
  fileName={downloadConfig?.fileName}
  description={downloadConfig?.description}
/>;
```

## ✅ **Beneficios de esta Implementación**

### 🏗️ **Arquitectura**

- **Separación de Responsabilidades**: UI, lógica de negocio y servicios separados
- **Reutilización**: Un modal y hook para todos los reportes
- **Mantenibilidad**: Cambios centralizados en Service Layer
- **Testabilidad**: Cada capa puede probarse independientemente

### 🎯 **Experiencia de Usuario**

- **Confirmación**: Usuario puede revisar antes de descargar
- **Información**: Detalles claros del archivo a descargar
- **Feedback**: Estados de loading y mensajes de éxito/error
- **Cancelación**: Opción de cancelar en cualquier momento

### 🔧 **Aspectos Técnicos**

- **Gestión de Estados**: Estados centralizados y predecibles
- **Manejo de Errores**: Consistent error handling con toast notifications
- **Performance**: Lazy loading del modal, optimizaciones de re-render
- **Accesibilidad**: Modal accesible con HeadlessUI

### 🎨 **Estilos**

- **Consistencia**: Mismos estilos en toda la aplicación
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Animaciones**: Transiciones suaves y professional
- **Themeable**: Fácil personalización de colores y espaciado

## 🚀 **Orden de Implementación Recomendado**

1. ✅ Crear `DownloadManager.js`
2. ✅ Crear `useDownloadReport.js`
3. ✅ Crear `DownloadConfirmModal.jsx` y sus estilos
4. ✅ Implementar en `AdminReporteMes.jsx` (ya tiene descarga)
5. ✅ Implementar en `ReporteCarrera.jsx`
6. ✅ Aplicar a resto de reportes
7. ✅ Pruebas y refinamientos

## 🧪 **Testing**

### Tests Unitarios Sugeridos:

```javascript
// DownloadManager.test.js
describe("DownloadManager", () => {
  test("should download file via GET");
  test("should download file via POST");
  test("should handle download errors");
});

// useDownloadReport.test.js
describe("useDownloadReport", () => {
  test("should open modal when initiateDownload is called");
  test("should execute download when confirmed");
  test("should cancel download properly");
});

// DownloadConfirmModal.test.js
describe("DownloadConfirmModal", () => {
  test("should render with correct information");
  test("should call onConfirm when download button is clicked");
  test("should call onClose when cancel button is clicked");
});
```

Esta implementación sigue las mejores prácticas de POO, separación de responsabilidades, y proporciona una experiencia de usuario consistente y profesional en toda la aplicación.
