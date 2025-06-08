import React, { useState, useRef } from "react";
import { Upload, X, Edit3, AlertCircle, CheckCircle } from "lucide-react";
import axiosInstance from "../api/axiosConfig";

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

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Solo se permiten archivos de imagen (JPG, PNG, GIF)");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("El archivo debe ser menor a 5MB");
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
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      setUploadError("Error al subir la imagen. Intenta nuevamente.");
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
        accept="image/*"
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
