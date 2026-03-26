import React, { useState, useRef } from "react";
import { Upload, X, Edit3, AlertCircle, CheckCircle } from "lucide-react";
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";
import "./styles/ImageUploadMVA.css";

const ImageUpload = ({
  currentImage,
  onImageChange,
  placeholder = "Subir imagen",
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validar tipo de archivo (sincronizado con el backend y Imgur)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Solo se permiten archivos JPEG, PNG, GIF, BMP o PDF");
      toast.error("Solo se permiten archivos JPEG, PNG, GIF, BMP o PDF", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("El archivo debe ser menor a 5MB");
      toast.error("El archivo debe ser menor a 5MB", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append("imagen", file);

      const response = await axiosInstance.post("/upload/imagen", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.imagenUrl) {
        onImageChange(response.data.imagenUrl);
        setUploadSuccess(true);
        toast.success("Imagen subida correctamente", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);

      // Mensaje de error predeterminado
      let errorMessage = "Error al subir la imagen. Intenta nuevamente.";

      // Intentar obtener un mensaje más específico del error
      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === "string") {
            // Si la respuesta es directamente un string, verificar si contiene HTML
            const responseText = error.response.data;

            // Si contiene HTML, intentar extraer solo el mensaje de error
            if (
              responseText.includes("<html>") ||
              responseText.includes("<body>")
            ) {
              // Buscar el mensaje real en el HTML
              const errorMatch = responseText.match(/Error: ([^<]*)/);
              if (errorMatch && errorMatch[1]) {
                errorMessage = errorMatch[1].trim();
              }
            } else {
              errorMessage = responseText;
            }
          } else if (error.response.data.msg) {
            // Si la respuesta tiene un campo msg
            errorMessage = error.response.data.msg;
          } else if (error.response.data.message) {
            // Si la respuesta tiene un campo message
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            // Si la respuesta tiene un campo error
            errorMessage = error.response.data.error;
          }
        }
      } else if (error.message) {
        // Si es un error de red u otro tipo
        errorMessage = error.message;
      }

      setUploadError(errorMessage);

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
    // Limpiar el input para permitir seleccionar el mismo archivo
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDeleteImage = () => {
    onImageChange("");
    setUploadError(null);
    setUploadSuccess(false);
    toast.info("Imagen eliminada", {
      position: "top-right",
      autoClose: 3000,
    });
  };
  const openFileDialog = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    fileInputRef.current?.click();
  };

  return (
    <div className={`autoridad-imagen-upload ${className}`}>
      {currentImage && !isUploading ? (
        <div className="autoridad-upload-preview">
          <img
            src={currentImage}
            alt="Vista previa"
            className="logo-preview-mva"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/120?text=Error";
            }}
          />
          <div
            className="autoridad-upload-overlay"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="autoridad-upload-actions">
              {" "}
              <button
                type="button"
                className="autoridad-upload-action replace"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog(e);
                }}
                title="Cambiar imagen"
                aria-label="Cambiar imagen"
              >
                <Edit3 size={16} />
              </button>
              <button
                type="button"
                className="autoridad-upload-action delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage();
                }}
                title="Eliminar imagen"
                aria-label="Eliminar imagen"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`autoridad-upload-container ${
            isDragOver ? "dragover" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={(e) => openFileDialog(e)}
        >
          {" "}
          {isUploading ? (
            <div className="autoridad-upload-loading">
              <div className="autoridad-upload-spinner"></div>
              <span className="autoridad-upload-progress">
                Subiendo imagen...
              </span>
            </div>
          ) : (
            <div className="autoridad-upload-content">
              <Upload size={24} className="autoridad-upload-icon" />
              <p className="autoridad-upload-text">{placeholder}</p>
              <p className="autoridad-upload-hint">
                Arrastra una imagen o haz clic para seleccionar
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,application/pdf"
        onChange={handleFileInputChange}
      />

      {uploadError && (
        <div className="autoridad-upload-error">
          <AlertCircle size={16} />
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="autoridad-upload-success">
          <CheckCircle size={16} />
          Imagen subida correctamente
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
