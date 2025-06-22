import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";
import AvatarEditor from "react-avatar-editor";
import ProfileImageService from "../services/ProfileImageService";
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Upload,
  GraduationCap,
  Edit,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  FileUp,
  IdCard,
  Ticket,
  GraduationCap as Certificate,
  Eye,
  Camera,
  Image,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
import "./styles/Perfil.css";

const Perfil = () => {
  const { usuario, updateProfileImage, syncUserData } = useAuth();
  const [perfilData, setPerfilData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviandoArchivo, setEnviandoArchivo] = useState(false);
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState({
    cedula: null,
    papeleta: null,
    matricula: null,
  });
  const [previewDoc, setPreviewDoc] = useState(null);
  const [mostrarPreview, setMostrarPreview] = useState(false);

  // Estado para el editor de imagen de perfil
  const [mostrarModalImagen, setMostrarModalImagen] = useState(false);
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [escalaImagen, setEscalaImagen] = useState(1);
  const [rotacionImagen, setRotacionImagen] = useState(0);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (usuario) {
      cargarPerfil();
    }
  }, [usuario]);

  const cargarPerfil = async () => {
    try {
      setCargando(true);
      const res = await axiosInstance.get("/perfil");
      setPerfilData(res.data);
    } catch (error) {
      toast.error("Error al cargar datos del perfil");
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleDocumentoChange = (tipo, archivo) => {
    if (archivo) {
      // Validar tamaño (máximo 2MB)
      if (archivo.size > 5 * 1024 * 1024) {
        toast.error(`El archivo ${archivo.name} excede el tamaño máximo (5MB)`);
        return;
      }

      // Validar tipo (PDF o imágenes)
      const tiposPermitidos = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];

      if (!tiposPermitidos.includes(archivo.type)) {
        toast.error(`Solo se aceptan archivos PDF o imágenes (JPG, PNG, GIF)`);
        return;
      }
    }

    setDocumentosSeleccionados({
      ...documentosSeleccionados,
      [tipo]: archivo,
    });
  };

  const abrirPreview = (archivo) => {
    setPreviewDoc(archivo);
    setMostrarPreview(true);
  };

  const getTipoDocumentoLabel = (tipo) => {
    switch (tipo) {
      case "cedula":
        return "Cédula";
      case "papeleta":
        return "Papeleta de votación";
      case "matricula":
        return "Certificado de matrícula";
      default:
        return tipo;
    }
  };

  const getIconoDocumento = (tipo) => {
    switch (tipo) {
      case "cedula":
        return <IdCard size={18} />;
      case "papeleta":
        return <Ticket size={18} />;
      case "matricula":
        return <Certificate size={18} />;
      default:
        return <FileText size={18} />;
    }
  };
  const getDocumentosRequeridos = () => {
    if (perfilData?.rol_usu === "ESTUDIANTE") {
      return ["cedula", "papeleta", "matricula"];
    } else {
      // Para usuarios generales, no se requiere certificado de matrícula
      return ["cedula", "papeleta"];
    }
  };

  const hayDocumentosSeleccionados = () => {
    const requeridos = getDocumentosRequeridos();
    return requeridos.some((tipo) => documentosSeleccionados[tipo] !== null);
  };

  const todosDocumentosRequeridosSeleccionados = () => {
    const requeridos = getDocumentosRequeridos();
    return requeridos.every((tipo) => documentosSeleccionados[tipo] !== null);
  };

  const resetearDocumentos = () => {
    setDocumentosSeleccionados({
      cedula: null,
      papeleta: null,
      matricula: null,
    });
  };

  const actualizarDocumentos = async () => {
    if (!hayDocumentosSeleccionados()) {
      toast.error("Debes seleccionar al menos un documento");
      return;
    }

    try {
      setEnviandoArchivo(true);
      const formData = new FormData();

      const requeridos = getDocumentosRequeridos();
      requeridos.forEach((tipo) => {
        if (documentosSeleccionados[tipo]) {
          formData.append(tipo, documentosSeleccionados[tipo]);
        }
      });

      await axiosInstance.put("/perfil/documentos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Documentos actualizados correctamente");
      setMostrarModal(false);
      resetearDocumentos();
      await cargarPerfil();
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Error al actualizar los documentos"
      );
    } finally {
      setEnviandoArchivo(false);
    }
  };

  // Manejo de la imagen de perfil
  const handleImagenPerfilChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const archivo = e.target.files[0];

      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        toast.error(`La imagen excede el tamaño máximo (5MB)`);
        return;
      }

      // Validar tipo (solo imágenes)
      const tiposPermitidos = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];

      if (!tiposPermitidos.includes(archivo.type)) {
        toast.error(`Solo se aceptan imágenes (JPG, PNG, GIF)`);
        return;
      }

      setImagenPerfil(archivo);
      setMostrarModalImagen(true);
    }
  };

  const guardarImagenPerfil = async () => {
    if (!editorRef.current || !imagenPerfil) {
      toast.error("No se ha seleccionado ninguna imagen");
      return;
    }

    try {
      setSubiendoImagen(true);

      // Obtener el canvas con la imagen recortada
      const canvas = editorRef.current.getImageScaledToCanvas();

      // Convertir a blob
      canvas.toBlob(async (blob) => {
        // Crear un objeto File a partir del Blob
        const file = new File([blob], imagenPerfil.name, {
          type: imagenPerfil.type,
        });

        // Crear FormData para enviar al servidor
        const formData = new FormData();
        formData.append("imagen", file);

        // Enviar al servidor
        const response = await axiosInstance.put("/perfil/imagen", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Imagen de perfil actualizada correctamente");
        setMostrarModalImagen(false);
        setImagenPerfil(null);

        // Actualizar los datos del perfil para mostrar la nueva imagen
        await cargarPerfil();

        // Actualizar la imagen de perfil en el contexto de autenticación
        if (response.data && response.data.imagenUrl) {
          updateProfileImage(response.data.imagenUrl);
        }

        // Sincronizar datos del usuario para asegurar persistencia
        if (syncUserData) {
          await syncUserData();
        }
      }, imagenPerfil.type);
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Error al actualizar la imagen de perfil"
      );
    } finally {
      setSubiendoImagen(false);
    }
  };

  const aumentarZoom = () => setEscalaImagen((prev) => Math.min(prev + 0.1, 3));
  const disminuirZoom = () =>
    setEscalaImagen((prev) => Math.max(prev - 0.1, 1));
  const rotarImagen = () => setRotacionImagen((prev) => prev + 90);

  if (cargando) {
    return (
      <div className="perfil-loading">
        <div className="perfil-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!perfilData) {
    return (
      <div className="perfil-error">
        <XCircle size={48} />
        <h2>Error al cargar el perfil</h2>
        <p>No se pudo obtener la información del perfil.</p>
        <button className="btn-reintentar" onClick={cargarPerfil}>
          Reintentar
        </button>
      </div>
    );
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "No disponible";
    return new Date(fecha).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="perfil-container">
      <h1 className="perfil-titulo">Mi Perfil</h1>{" "}
      <div className="perfil-card">
        <div className="perfil-header">
          <div
            className="perfil-avatar"
            onClick={() =>
              document.getElementById("subir-imagen-perfil").click()
            }
            title="Haz clic para cambiar tu foto de perfil"
          >
            {perfilData.img_per_usu ? (
              <img
                src={ProfileImageService.getProfileImageUrl(
                  perfilData.img_per_usu,
                  true
                )}
                alt="Foto de perfil"
                className="perfil-imagen"
                key={perfilData.img_per_usu} // Forzar re-render cuando cambie la imagen
              />
            ) : (
              <User size={48} />
            )}
            <div className="perfil-avatar-overlay">
              <Camera size={16} />
            </div>
            <input
              type="file"
              id="subir-imagen-perfil"
              accept="image/jpeg,image/png,image/gif"
              style={{ display: "none" }}
              onChange={handleImagenPerfilChange}
            />
          </div>
          <div className="perfil-nombre">
            <h2>
              {perfilData.nom_usu} {perfilData.ape_usu}
            </h2>{" "}
            <span className={`perfil-rol ${perfilData.rol_usu.toLowerCase()}`}>
              {perfilData.rol_usu === "ESTUDIANTE"
                ? "Estudiante"
                : perfilData.rol_usu === "ADMIN_GLOBAL" ||
                  perfilData.rol_usu === "ADMIN_GENERAL"
                ? "Administrador"
                : "Usuario General"}
            </span>
          </div>
        </div>

        <div className="perfil-info">
          <div className="perfil-grupo">
            <div className="perfil-etiqueta">
              <FileText size={18} />
              <span>Cédula:</span>
            </div>
            <div className="perfil-valor">{perfilData.ced_usu}</div>
          </div>
          <div className="perfil-grupo">
            <div className="perfil-etiqueta">
              <Mail size={18} />
              <span>Correo:</span>
            </div>
            <div className="perfil-valor">{perfilData.cor_usu}</div>
          </div>
          <div className="perfil-grupo">
            <div className="perfil-etiqueta">
              <Phone size={18} />
              <span>Teléfono:</span>
            </div>
            <div className="perfil-valor">{perfilData.cel_usu}</div>
          </div>
          <div className="perfil-grupo">
            <div className="perfil-etiqueta">
              <GraduationCap size={18} />
              <span>Carrera:</span>
            </div>
            <div className="perfil-valor">
              {perfilData.carrera ? perfilData.carrera.nom_car : "No aplica"}
            </div>
          </div>
          <div className="perfil-grupo">
            <div className="perfil-etiqueta">
              <Calendar size={18} />
              <span>Fecha de registro:</span>
            </div>
            <div className="perfil-valor">
              {formatearFecha(perfilData.fec_cre_usu)}
            </div>
          </div>
          <div className="perfil-grupo documento-grupo">
            <div className="perfil-etiqueta">
              <FileText size={18} />
              <span>Documentos:</span>
            </div>
            <div className="perfil-valor documento-valor">
              {" "}
              {perfilData.com_usu ? (
                <div className="documento-info">
                  {" "}
                  <button
                    className="btn-ver-documento"
                    onClick={() => {
                      const url = `${import.meta.env.VITE_API_URL}${
                        perfilData.com_usu
                      }`;
                      // Abrir directamente en el navegador
                      window.open(url, "_blank");
                    }}
                  >
                    <Eye size={16} />
                    Ver documento
                  </button>
                  <button
                    className="btn-actualizar-documento"
                    onClick={() => setMostrarModal(true)}
                  >
                    <Edit size={16} />
                    Actualizar
                  </button>
                  <div className="documento-status">
                    <small>
                      Documento cargado: {perfilData.com_usu.split("/").pop()}
                    </small>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className="btn-subir-documento"
                    onClick={() => setMostrarModal(true)}
                  >
                    <Upload size={16} />
                    Subir documentos
                  </button>
                  <div className="documento-status">
                    <small>
                      No has subido ningún documento aún.
                      {perfilData.rol_usu === "ESTUDIANTE"
                        ? " Debes subir tu cédula, papeleta de votación y certificado de matrícula."
                        : " Debes subir tu cédula y papeleta de votación."}
                    </small>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="perfil-inscripciones">
        <h2 className="inscripciones-titulo">Mis Inscripciones Recientes</h2>
        {perfilData.inscripciones.length === 0 ? (
          <p className="sin-inscripciones">
            No tienes inscripciones registradas.
          </p>
        ) : (
          <div className="inscripciones-lista">
            {perfilData.inscripciones.slice(0, 3).map((inscripcion) => (
              <div key={inscripcion.id_ins} className="inscripcion-item">
                <div className="inscripcion-nombre">
                  {inscripcion.evento.nom_eve}
                </div>
                <div className="inscripcion-fecha">
                  {formatearFecha(inscripcion.fec_ins)}
                </div>
                <div
                  className={`inscripcion-estado ${inscripcion.est_ins.toLowerCase()}`}
                >
                  {inscripcion.est_ins === "PENDIENTE" && <Clock size={14} />}
                  {inscripcion.est_ins === "ACEPTADA" && (
                    <CheckCircle size={14} />
                  )}
                  {inscripcion.est_ins === "RECHAZADA" && <XCircle size={14} />}
                  {inscripcion.est_ins === "APROBADO" && <FileText size={14} />}
                  {inscripcion.est_ins === "APROBADO" && (
                    <BadgeCheck size={14} />
                  )}
                  {inscripcion.est_ins === "REPROBADO_NOTA" && (
                    <AlertCircle size={14} />
                  )}
                  {inscripcion.est_ins === "REPROBADO_ASISTENCIA" && (
                    <AlertCircle size={14} />
                  )}
                  {inscripcion.est_ins === "REPROBADO_TOTAL" && (
                    <AlertCircle size={14} />
                  )}
                  {inscripcion.est_ins}
                </div>
              </div>
            ))}
            <a href="/inscripciones" className="ver-todas">
              Ver todas mis inscripciones
            </a>
          </div>
        )}
      </div>
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-documentos">
            {" "}
            <h2 className="modal-title">
              {perfilData.com_usu
                ? "Actualizar documentos"
                : "Subir documentos"}
            </h2>
            <div className="documentos-container">
              {getDocumentosRequeridos().map((tipo) => (
                <div key={tipo} className="documento-item">
                  <div className="documento-header">
                    {getIconoDocumento(tipo)}
                    <span className="documento-tipo">
                      {getTipoDocumentoLabel(tipo)}
                    </span>
                  </div>

                  <div className="documento-content">
                    <input
                      type="file"
                      id={`archivo-${tipo}`}
                      className="input-archivo"
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      onChange={(e) =>
                        handleDocumentoChange(tipo, e.target.files[0])
                      }
                    />

                    <div className="documento-upload">
                      <label htmlFor={`archivo-${tipo}`} className="btn-subir">
                        <FileUp size={16} style={{ marginRight: 6 }} />{" "}
                        Seleccionar
                      </label>

                      {documentosSeleccionados[tipo] ? (
                        <div className="documento-preview">
                          <span className="documento-nombre">
                            {documentosSeleccionados[tipo].name}
                          </span>
                          <button
                            className="btn-preview"
                            onClick={() =>
                              abrirPreview(documentosSeleccionados[tipo])
                            }
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="placeholder-archivo">
                          Ningún archivo seleccionado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>{" "}
            <div className="info-documentos">
              <p>
                <strong>Nota:</strong> Los documentos no deben superar los 5MB
                cada uno.{" "}
                {!todosDocumentosRequeridosSeleccionados() && (
                  <span className="documentos-faltantes">
                    {" "}
                    Debes subir todos los documentos requeridos para completar
                    tu perfil.
                  </span>
                )}
              </p>
            </div>
            <div className="modal-botones">
              <button
                className="btn-guardar-p"
                onClick={actualizarDocumentos}
                disabled={enviandoArchivo || !hayDocumentosSeleccionados()}
              >
                {enviandoArchivo ? (
                  <>
                    <div className="spinner-small"></div> Enviando...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Guardar
                  </>
                )}
              </button>
              <button
                className="btn-cancelar"
                onClick={() => {
                  setMostrarModal(false);
                  resetearDocumentos();
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrarPreview && previewDoc && (
        <div className="modal-overlay" onClick={() => setMostrarPreview(false)}>
          <div className="modal-preview" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>Vista previa: {previewDoc.name}</h3>
              <button
                className="btn-cerrar-preview"
                onClick={() => setMostrarPreview(false)}
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="preview-content">
              <iframe
                src={URL.createObjectURL(previewDoc)}
                width="100%"
                height="100%"
                title="Vista previa del documento"
              />
            </div>
          </div>
        </div>
      )}
      {/* Modal de edición de imagen de perfil */}
      {mostrarModalImagen && imagenPerfil && (
        <div className="modal-overlay">
          <div className="modal-content modal-imagen-perfil">
            <h2 className="modal-title">Editar imagen de perfil</h2>
            <p className="modal-descripcion">
              Ajusta, recorta y rota tu imagen de perfil
            </p>

            <div className="editor-container">
              <AvatarEditor
                ref={editorRef}
                image={imagenPerfil}
                width={250}
                height={250}
                border={50}
                borderRadius={125}
                color={[0, 0, 0, 0.6]} // Color del área fuera del círculo
                scale={escalaImagen}
                rotate={rotacionImagen}
              />

              <div className="editor-controles">
                <button
                  className="btn-control"
                  onClick={disminuirZoom}
                  title="Disminuir zoom"
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  className="btn-control"
                  onClick={aumentarZoom}
                  title="Aumentar zoom"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  className="btn-control"
                  onClick={rotarImagen}
                  title="Rotar imagen"
                >
                  <RotateCw size={20} />
                </button>
              </div>
            </div>

            <div className="modal-botones">
              <button
                className="btn-guardar-p"
                onClick={guardarImagenPerfil}
                disabled={subiendoImagen}
              >
                {subiendoImagen ? (
                  <>
                    <div className="spinner-small"></div> Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Guardar
                  </>
                )}
              </button>
              <button
                className="btn-cancelar"
                onClick={() => {
                  setMostrarModalImagen(false);
                  setImagenPerfil(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
