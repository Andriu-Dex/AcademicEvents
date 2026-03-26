import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import ActionConfirmModal from "../../components/common/ActionConfirmModal";
import { useConfigurableStats } from "../../hooks/useConfigurableStats";
import {
  Save,
  Plus,
  Trash2,
  Eye,
  User,
  Mail,
  Edit2,
  CheckCircle,
  AlertCircle,
  Home,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Building,
  Briefcase,
  Image,
  AlignLeft,
  Phone,
  MapPin,
  School,
  BarChart,
  University,
  Users,
} from "lucide-react";
import ImageUpload from "../../components/ImageUploadMVA";
import StatisticsConfig from "../../components/admin/StatisticsConfig";
import {
  SOCIAL_ICON_COMPONENTS,
  SOCIAL_ICON_OPTIONS,
  SOCIAL_PLATFORM_DEFAULTS,
  SOCIAL_PLATFORM_OPTIONS,
} from "../../constants/socialLinkOptions";
import { useSocket } from "../../context/SocketContext";
import { resolveTenantScope } from "../../utils/tenantScope";
import {
  normalizeUniversityData,
  normalizeUniversitySocialLink,
} from "../../utils/universityData";
import "./styles/AdminConfiguracionMVA.css";

const UNIVERSITY_SOCKET_EVENT = "university-change-hm";

const EMPTY_UNIVERSITY_STATE = {
  id_uni: "",
  nom_uni: "",
  acr_uni: "",
  url_log_uni: "",
  dir_uni: "",
  tel_uni: "",
  cor_uni: "",
  social_links: [],
};

const normalizeComparableValue = (value) =>
  typeof value === "string" ? value.trim() : value ?? "";

const normalizeSocialLinksForComparison = (socialLinks = []) =>
  socialLinks
    .map((socialLink) => ({
      id: socialLink.id || "",
      label: normalizeComparableValue(socialLink.label),
      url: normalizeComparableValue(socialLink.url),
      iconKey: normalizeComparableValue(socialLink.iconKey),
      platformKey: normalizeComparableValue(socialLink.platformKey || "custom"),
      displayOrder: Number(socialLink.displayOrder) || 0,
      isActive: Boolean(socialLink.isActive),
      opensInNewTab: Boolean(socialLink.opensInNewTab),
    }))
    .sort((leftLink, rightLink) => leftLink.displayOrder - rightLink.displayOrder);

const areUniversityBaseFieldsEqual = (leftUniversity, rightUniversity) =>
  ["nom_uni", "acr_uni", "url_log_uni", "dir_uni", "tel_uni", "cor_uni"].every(
    (field) =>
      normalizeComparableValue(leftUniversity?.[field]) ===
      normalizeComparableValue(rightUniversity?.[field])
  );

const createEmptySocialLink = (displayOrder = 0) => ({
  id: "",
  clientId: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  label: "",
  url: "",
  iconKey: SOCIAL_PLATFORM_DEFAULTS.custom.defaultIconKey,
  platformKey: "custom",
  displayOrder,
  isActive: true,
  opensInNewTab: true,
});

const reorderSocialLinksByClientId = (
  currentSocialLinks,
  draggedClientId,
  targetClientId
) => {
  const draggedIndex = currentSocialLinks.findIndex(
    (socialLink) => socialLink.clientId === draggedClientId
  );
  const targetIndex = currentSocialLinks.findIndex(
    (socialLink) => socialLink.clientId === targetClientId
  );

  if (
    draggedIndex === -1 ||
    targetIndex === -1 ||
    draggedIndex === targetIndex
  ) {
    return currentSocialLinks;
  }

  const nextSocialLinks = [...currentSocialLinks];
  const [draggedSocialLink] = nextSocialLinks.splice(draggedIndex, 1);
  nextSocialLinks.splice(targetIndex, 0, draggedSocialLink);

  return nextSocialLinks.map((socialLink, index) => ({
    ...socialLink,
    displayOrder: index,
  }));
};

const isValidAbsoluteUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const AdminConfiguracionMVA = () => {
  // Hook para manejar estadísticas configurables
  const { updateActiveStats } = useConfigurableStats();
  const { socket } = useSocket();
  const tenantScopeRef = useRef(resolveTenantScope());
  const socialLinksReloadTimeoutRef = useRef(null);
  const externalChangesToastShownRef = useRef(false);
  const hasPendingUniversityChangesRef = useRef(false);
  const loadUniversityDataRef = useRef(null);
  const isPersistingUniversityChangesRef = useRef(false);

  const [form, setForm] = useState({
    mision: "",
    vision: "",
    autoridades: "",
  });

  const [facultad, setFacultad] = useState({
    id_fac: "",
    nom_fac: "",
    acr_fac: "",
    des_fac: "",
    url_log_fac: "",
  });

  const [autoridadesArray, setAutoridadesArray] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFacultad, setLoadingFacultad] = useState(false);
  const [loadingUniversidad, setLoadingUniversidad] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveFacultadSuccess, setSaveFacultadSuccess] = useState(false);
  const [saveUniversidadSuccess, setSaveUniversidadSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    mision: false,
    vision: false,
  });
  const [validationFacultadErrors, setValidationFacultadErrors] = useState({
    nom_fac: false,
  });
  const [validationUniversidadErrors, setValidationUniversidadErrors] =
    useState({
      nom_uni: false,
      dir_uni: false,
    });
  const [socialLinksErrors, setSocialLinksErrors] = useState({});
  const [mvaExpanded, setMvaExpanded] = useState(false);
  const [facultadExpanded, setFacultadExpanded] = useState(false);
  const [universidadExpanded, setUniversidadExpanded] = useState(false);
  const [statisticsExpanded, setStatisticsExpanded] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [initialSocialLinks, setInitialSocialLinks] = useState([]);
  const [loadingSocialLinks, setLoadingSocialLinks] = useState(false);
  const [saveSocialLinksSuccess, setSaveSocialLinksSuccess] = useState(false);
  const [draggedSocialLinkId, setDraggedSocialLinkId] = useState(null);
  const [dragOverSocialLinkId, setDragOverSocialLinkId] = useState(null);
  const [initialUniversidad, setInitialUniversidad] =
    useState(EMPTY_UNIVERSITY_STATE);
  const [socialLinkPendingDeletion, setSocialLinkPendingDeletion] =
    useState(null);

  const [universidad, setUniversidad] = useState(EMPTY_UNIVERSITY_STATE);

  const defaultAutoridad = {
    cargo: "",
    nombre: "",
    imagen: "",
    email: "",
  };

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/mva");
      if (res.data) {
        const data = res.data;

        // Verificamos si autoridades es un string JSON y lo parseamos
        let autoridadesData = [];
        if (data.autoridades) {
          try {
            autoridadesData = JSON.parse(data.autoridades);
            setAutoridadesArray(autoridadesData);
          } catch (error) {
            console.error("Error al parsear autoridades:", error);
            setAutoridadesArray([]);
          }
        }

        setForm({
          mision: data.mision || "",
          vision: data.vision || "",
          autoridades: data.autoridades || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar información MVA:", error);
      toast.error(
        "Error al cargar la información de Misión, Visión y Autoridades"
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarFacultad = async () => {
    try {
      setLoadingFacultad(true);
      const res = await axiosInstance.get("/facultad-principal");
      if (res.data) {
        const data = res.data;
        setFacultad({
          id_fac: data.id_fac || "",
          nom_fac: data.nom_fac || "",
          acr_fac: data.acr_fac || "",
          des_fac: data.des_fac || "",
          url_log_fac: data.url_log_fac || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar información de la Facultad:", error);
      toast.error("Error al cargar la información de la Facultad");
    } finally {
      setLoadingFacultad(false);
    }
  };

  // Cargar datos de la universidad
  const cargarUniversidad = async () => {
    try {
      setLoadingUniversidad(true);
      const universityResponse = await axiosInstance.get("/universidad-principal");
      if (!universityResponse.data) {
        return;
      }

      const normalizedUniversity = normalizeUniversityData(
        universityResponse.data,
        EMPTY_UNIVERSITY_STATE
      );

      let normalizedSocialLinks = [];

      if (normalizedUniversity.id_uni) {
        const socialLinksResponse = await axiosInstance.get(
          `/universidad/${normalizedUniversity.id_uni}/social-links`
        );

        normalizedSocialLinks = (socialLinksResponse.data?.socialLinks || [])
          .map((socialLink, index) => ({
            ...normalizeUniversitySocialLink(socialLink, index),
            clientId: socialLink.id || `social-${index}`,
          }))
          .sort(
            (leftLink, rightLink) => leftLink.displayOrder - rightLink.displayOrder
          );
      }

      const universityState = {
        ...normalizedUniversity,
        social_links: normalizedSocialLinks,
      };

      setUniversidad(universityState);
      setInitialUniversidad(universityState);
      setSocialLinks(normalizedSocialLinks);
      setInitialSocialLinks(normalizedSocialLinks);
      setSocialLinksErrors({});
    } catch (error) {
      console.error("Error al cargar información de la Universidad:", error);
      toast.error("Error al cargar la información de la Universidad");
    } finally {
      setLoadingUniversidad(false);
    }
  };

  loadUniversityDataRef.current = cargarUniversidad;

  const guardar = async () => {
    try {
      // Validar que misión y visión no estén vacíos
      const errors = {
        mision: !form.mision.trim(),
        vision: !form.vision.trim(),
      };

      setValidationErrors(errors);

      // Si hay errores, mostrar mensaje y detener el guardado
      if (errors.mision || errors.vision) {
        toast.error("Los campos de Misión y Visión no pueden estar vacíos");
        return;
      }

      setLoading(true);
      setSaveSuccess(false);

      // Actualizar el campo autoridades con el arreglo actual
      const formToSend = {
        ...form,
        autoridades: JSON.stringify(autoridadesArray),
      };

      await axiosInstance.put("/mva", formToSend);
      toast.success(
        "Información de Misión, Visión y Autoridades actualizada correctamente"
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Recargar la información para mostrar los cambios actualizados
      cargar();
    } catch (error) {
      console.error("Error al guardar información MVA:", error);
      toast.error(
        "Error al guardar la información de Misión, Visión y Autoridades"
      );
    } finally {
      setLoading(false);
    }
  };

  const guardarFacultad = async () => {
    try {
      // Validar que el nombre no esté vacío
      const errors = {
        nom_fac: !facultad.nom_fac.trim(),
      };

      setValidationFacultadErrors(errors);

      // Si hay errores, mostrar mensaje y detener el guardado
      if (errors.nom_fac) {
        toast.error("El nombre de la facultad no puede estar vacío");
        return;
      }

      setLoadingFacultad(true);
      setSaveFacultadSuccess(false);

      await axiosInstance.put(`/facultades/${facultad.id_fac}/datos-basicos`, {
        nom_fac: facultad.nom_fac,
        acr_fac: facultad.acr_fac,
        des_fac: facultad.des_fac,
        url_log_fac: facultad.url_log_fac,
      });

      toast.success("Datos de la Facultad actualizados correctamente");

      setSaveFacultadSuccess(true);
      setTimeout(() => setSaveFacultadSuccess(false), 3000);

      // Recargar la información para mostrar los cambios actualizados
      cargarFacultad();
    } catch (error) {
      console.error("Error al guardar información de la Facultad:", error);
      toast.error("Error al guardar la información de la Facultad");
    } finally {
      setLoadingFacultad(false);
    }
  };

  // Guardar datos de la universidad
  const guardarUniversidad = async () => {
    try {
      // Validar que nombre y dirección no estén vacíos
      const errors = {
        nom_uni: !universidad.nom_uni.trim(),
        dir_uni: !universidad.dir_uni.trim(),
      };

      setValidationUniversidadErrors(errors);

      // Si hay errores, mostrar mensaje y detener el guardado
      if (errors.nom_uni || errors.dir_uni) {
        toast.error(
          "El nombre y la dirección de la universidad no pueden estar vacíos"
        );
        return;
      }

      setLoadingUniversidad(true);
      setSaveUniversidadSuccess(false);
      isPersistingUniversityChangesRef.current = true;

      await axiosInstance.put(`/universidad/${universidad.id_uni}`, {
        nom_uni: universidad.nom_uni,
        acr_uni: universidad.acr_uni,
        url_log_uni: universidad.url_log_uni,
        dir_uni: universidad.dir_uni,
        tel_uni: universidad.tel_uni,
        cor_uni: universidad.cor_uni,
      });

      toast.success("Datos de la Universidad actualizados correctamente");

      setSaveUniversidadSuccess(true);
      setTimeout(() => setSaveUniversidadSuccess(false), 3000);

      // Recargar la información para mostrar los cambios actualizados
      cargarUniversidad();
    } catch (error) {
      console.error("Error al guardar información de la Universidad:", error);
      toast.error("Error al guardar la información de la Universidad");
    } finally {
      isPersistingUniversityChangesRef.current = false;
      setLoadingUniversidad(false);
    }
  };

  const actualizarSocialLink = (clientId, field, value) => {
    setSocialLinks((currentSocialLinks) =>
      currentSocialLinks.map((socialLink) => {
        if (socialLink.clientId !== clientId) {
          return socialLink;
        }

        if (field === "platformKey") {
          const selectedPlatform =
            SOCIAL_PLATFORM_DEFAULTS[value] || SOCIAL_PLATFORM_DEFAULTS.custom;

          return {
            ...socialLink,
            platformKey: value,
            iconKey:
              value === "custom" ? socialLink.iconKey : selectedPlatform.defaultIconKey,
            label:
              !socialLink.label ||
              socialLink.label ===
                (SOCIAL_PLATFORM_DEFAULTS[socialLink.platformKey]?.label || "")
                ? selectedPlatform.label
                : socialLink.label,
          };
        }

        return {
          ...socialLink,
          [field]: value,
        };
      })
    );

    setSocialLinksErrors((currentErrors) => {
      if (!currentErrors[clientId]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [clientId]: {
          ...currentErrors[clientId],
          [field]: false,
        },
      };
    });
  };

  const agregarSocialLink = () => {
    setSocialLinks((currentSocialLinks) => [
      ...currentSocialLinks,
      createEmptySocialLink(currentSocialLinks.length),
    ]);
  };

  const eliminarSocialLink = (clientId) => {
    if (draggedSocialLinkId === clientId) {
      setDraggedSocialLinkId(null);
      setDragOverSocialLinkId(null);
    }

    setSocialLinks((currentSocialLinks) =>
      currentSocialLinks.filter((socialLink) => socialLink.clientId !== clientId)
    );

    setSocialLinksErrors((currentErrors) => {
      if (!currentErrors[clientId]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[clientId];
      return nextErrors;
    });
  };

  const solicitarEliminacionSocialLink = (socialLink) => {
    setSocialLinkPendingDeletion(socialLink);
  };

  const cerrarModalEliminacionSocialLink = () => {
    setSocialLinkPendingDeletion(null);
  };

  const confirmarEliminacionSocialLink = () => {
    if (!socialLinkPendingDeletion?.clientId) {
      return;
    }

    eliminarSocialLink(socialLinkPendingDeletion.clientId);
    cerrarModalEliminacionSocialLink();
  };

  const handleSocialLinkDragStart = (event, clientId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", clientId);
    setDraggedSocialLinkId(clientId);
  };

  const handleSocialLinkDragOver = (event, clientId) => {
    if (!draggedSocialLinkId || draggedSocialLinkId === clientId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverSocialLinkId(clientId);
  };

  const handleSocialLinkDrop = (event, targetClientId) => {
    event.preventDefault();

    const droppedClientId =
      event.dataTransfer.getData("text/plain") || draggedSocialLinkId;

    if (!droppedClientId || droppedClientId === targetClientId) {
      setDragOverSocialLinkId(null);
      return;
    }

    setSocialLinks((currentSocialLinks) =>
      reorderSocialLinksByClientId(
        currentSocialLinks,
        droppedClientId,
        targetClientId
      )
    );

    setDragOverSocialLinkId(null);
    setDraggedSocialLinkId(null);
  };

  const handleSocialLinkDragEnd = () => {
    setDraggedSocialLinkId(null);
    setDragOverSocialLinkId(null);
  };

  const moverSocialLink = (clientId, direction) => {
    setSocialLinks((currentSocialLinks) => {
      const currentIndex = currentSocialLinks.findIndex(
        (socialLink) => socialLink.clientId === clientId
      );

      if (currentIndex === -1) {
        return currentSocialLinks;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= currentSocialLinks.length) {
        return currentSocialLinks;
      }

      const nextSocialLinks = [...currentSocialLinks];
      [nextSocialLinks[currentIndex], nextSocialLinks[targetIndex]] = [
        nextSocialLinks[targetIndex],
        nextSocialLinks[currentIndex],
      ];

      return nextSocialLinks.map((socialLink, index) => ({
        ...socialLink,
        displayOrder: index,
      }));
    });
  };

  const validarSocialLinks = () => {
    const nextErrors = {};

    socialLinks.forEach((socialLink) => {
      nextErrors[socialLink.clientId] = {
        label: !socialLink.label.trim(),
        url:
          !socialLink.url.trim() || !isValidAbsoluteUrl(socialLink.url.trim()),
        iconKey: !socialLink.iconKey.trim(),
      };
    });

    setSocialLinksErrors(nextErrors);

    return !Object.values(nextErrors).some((error) =>
      Object.values(error).some(Boolean)
    );
  };

  const guardarSocialLinks = async () => {
    if (!universidad.id_uni) {
      toast.error("No se encontró la universidad para guardar los enlaces");
      return;
    }

    if (!validarSocialLinks()) {
      toast.error("Revisa los enlaces institucionales antes de guardar");
      return;
    }

    try {
      setLoadingSocialLinks(true);
      setSaveSocialLinksSuccess(false);
      isPersistingUniversityChangesRef.current = true;

      const normalizedSocialLinks = socialLinks.map((socialLink, index) => ({
        ...socialLink,
        label: socialLink.label.trim(),
        url: socialLink.url.trim(),
        iconKey: socialLink.iconKey.trim(),
        platformKey: socialLink.platformKey || "custom",
        displayOrder: index,
      }));

      const currentIds = new Set(
        normalizedSocialLinks.filter((socialLink) => socialLink.id).map((socialLink) => socialLink.id)
      );
      const deletedSocialLinks = initialSocialLinks.filter(
        (socialLink) => socialLink.id && !currentIds.has(socialLink.id)
      );

      await Promise.all(
        deletedSocialLinks.map((socialLink) =>
          axiosInstance.delete(
            `/universidad/${universidad.id_uni}/social-links/${socialLink.id}`
          )
        )
      );

      await Promise.all(
        normalizedSocialLinks.map((socialLink) => {
          const payload = {
            label: socialLink.label,
            url: socialLink.url,
            iconKey: socialLink.iconKey,
            platformKey: socialLink.platformKey,
            displayOrder: socialLink.displayOrder,
            isActive: socialLink.isActive,
            opensInNewTab: socialLink.opensInNewTab,
          };

          if (socialLink.id) {
            return axiosInstance.put(
              `/universidad/${universidad.id_uni}/social-links/${socialLink.id}`,
              payload
            );
          }

          return axiosInstance.post(
            `/universidad/${universidad.id_uni}/social-links`,
            payload
          );
        })
      );

      toast.success("Enlaces institucionales actualizados correctamente");
      setSaveSocialLinksSuccess(true);
      setTimeout(() => setSaveSocialLinksSuccess(false), 3000);
      await cargarUniversidad();
    } catch (error) {
      console.error("Error al guardar enlaces institucionales:", error);
      toast.error(
        error.response?.data?.message ||
          "Error al guardar los enlaces institucionales"
      );
    } finally {
      isPersistingUniversityChangesRef.current = false;
      setLoadingSocialLinks(false);
    }
  };

  const agregarAutoridad = () => {
    setAutoridadesArray([...autoridadesArray, { ...defaultAutoridad }]);
  };

  const eliminarAutoridad = (index) => {
    const nuevasAutoridades = autoridadesArray.filter((_, i) => i !== index);
    setAutoridadesArray(nuevasAutoridades);
  };

  const actualizarAutoridad = (index, campo, valor) => {
    const nuevasAutoridades = [...autoridadesArray];
    nuevasAutoridades[index] = {
      ...nuevasAutoridades[index],
      [campo]: valor,
    };
    setAutoridadesArray(nuevasAutoridades);
  };

  const hasPendingUniversityBaseChanges = !areUniversityBaseFieldsEqual(
    universidad,
    initialUniversidad
  );

  const hasPendingSocialLinksChanges =
    JSON.stringify(normalizeSocialLinksForComparison(socialLinks)) !==
    JSON.stringify(normalizeSocialLinksForComparison(initialSocialLinks));

  useEffect(() => {
    hasPendingUniversityChangesRef.current =
      hasPendingUniversityBaseChanges || hasPendingSocialLinksChanges;

    if (!hasPendingUniversityChangesRef.current) {
      externalChangesToastShownRef.current = false;
    }
  }, [hasPendingSocialLinksChanges, hasPendingUniversityBaseChanges]);

  useEffect(() => {
    cargar();
    cargarFacultad();
    cargarUniversidad();
  }, []);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleUniversityChange = (eventData) => {
      if (!eventData?.data) {
        return;
      }

      if (
        eventData.data.tenantSlug &&
        eventData.data.tenantSlug !== tenantScopeRef.current
      ) {
        return;
      }

      if (isPersistingUniversityChangesRef.current) {
        return;
      }

      if (hasPendingUniversityChangesRef.current) {
        if (!externalChangesToastShownRef.current) {
          toast.info(
            "Se detectaron cambios externos en la universidad. Guarda tus cambios o recarga la sección para sincronizarla."
          );
          externalChangesToastShownRef.current = true;
        }

        return;
      }

      if (socialLinksReloadTimeoutRef.current) {
        clearTimeout(socialLinksReloadTimeoutRef.current);
      }

      socialLinksReloadTimeoutRef.current = setTimeout(() => {
        loadUniversityDataRef.current?.();
      }, 150);
    };

    socket.on(UNIVERSITY_SOCKET_EVENT, handleUniversityChange);

    return () => {
      socket.off(UNIVERSITY_SOCKET_EVENT, handleUniversityChange);

      if (socialLinksReloadTimeoutRef.current) {
        clearTimeout(socialLinksReloadTimeoutRef.current);
        socialLinksReloadTimeoutRef.current = null;
      }
    };
  }, [socket]);

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const toggleMvaSection = () => {
    setMvaExpanded(!mvaExpanded);
  };

  const toggleFacultadSection = () => {
    setFacultadExpanded(!facultadExpanded);
  };

  const toggleUniversidadSection = () => {
    setUniversidadExpanded(!universidadExpanded);
  };

  const toggleStatisticsSection = () => {
    setStatisticsExpanded(!statisticsExpanded);
  };

  return (
    <>
      {/* Botón para volver al home */}
      <Link to="/home" className="home-button-acmva">
        <Home size={22} color="white" />
      </Link>

      <div className="adminconfig-container-acmva">
        {/* Sección Datos Universidad */}
        <div
          className="adminconfig-collapsible-header-acmva"
          onClick={toggleUniversidadSection}
        >
          <h2 className="adminconfig-title-acmva">
            <University size={20} /> Datos Universidad
          </h2>
          <button
            className="adminconfig-collapse-btn-acmva"
            aria-label={
              universidadExpanded ? "Colapsar sección" : "Expandir sección"
            }
          >
            {universidadExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>

        {universidadExpanded && (
          <>
            <p className="adminconfig-description-acmva">
              Desde aquí puedes editar la información básica de la universidad,
              como su nombre, logo, dirección y datos de contacto. También
              puedes administrar los enlaces institucionales que se mostrarán
              en el footer del sistema.
            </p>

            <div className="adminconfig-section-acmva">
              <div className="adminconfig-form-acmva">
                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <Image size={14} /> Logo de la Universidad:
                    </span>
                    <ImageUpload
                      currentImage={universidad.url_log_uni}
                      onImageChange={(url) =>
                        setUniversidad({ ...universidad, url_log_uni: url })
                      }
                      placeholder="Subir logo de la universidad"
                    />
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <School size={14} /> Nombre de la Universidad *:
                    </span>
                    <input
                      type="text"
                      className={`adminconfig-input-acmva ${
                        validationUniversidadErrors.nom_uni
                          ? "error-input-acmva"
                          : ""
                      }`}
                      value={universidad.nom_uni}
                      onChange={(e) => {
                        setUniversidad({
                          ...universidad,
                          nom_uni: e.target.value,
                        });
                        if (e.target.value.trim()) {
                          setValidationUniversidadErrors({
                            ...validationUniversidadErrors,
                            nom_uni: false,
                          });
                        }
                      }}
                      placeholder="Nombre completo de la universidad"
                    />
                    {validationUniversidadErrors.nom_uni && (
                      <p className="validation-error-message-acmva">
                        Este campo es obligatorio
                      </p>
                    )}
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <Building size={14} /> Acrónimo de la Universidad:
                    </span>
                    <input
                      type="text"
                      className="adminconfig-input-acmva"
                      value={universidad.acr_uni || ""}
                      onChange={(e) =>
                        setUniversidad({
                          ...universidad,
                          acr_uni: e.target.value,
                        })
                      }
                      placeholder="Ejemplo: UTA"
                    />
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <MapPin size={14} /> Dirección *:
                    </span>
                    <input
                      type="text"
                      className={`adminconfig-input-acmva ${
                        validationUniversidadErrors.dir_uni
                          ? "error-input-acmva"
                          : ""
                      }`}
                      value={universidad.dir_uni}
                      onChange={(e) => {
                        setUniversidad({
                          ...universidad,
                          dir_uni: e.target.value,
                        });
                        if (e.target.value.trim()) {
                          setValidationUniversidadErrors({
                            ...validationUniversidadErrors,
                            dir_uni: false,
                          });
                        }
                      }}
                      placeholder="Dirección completa de la universidad"
                    />
                    {validationUniversidadErrors.dir_uni && (
                      <p className="validation-error-message-acmva">
                        Este campo es obligatorio
                      </p>
                    )}
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <Phone size={14} /> Teléfono:
                    </span>
                    <input
                      type="text"
                      className="adminconfig-input-acmva"
                      value={universidad.tel_uni || ""}
                      onChange={(e) =>
                        setUniversidad({
                          ...universidad,
                          tel_uni: e.target.value,
                        })
                      }
                      placeholder="Número de teléfono"
                    />
                  </label>
                </div>

                <div className="adminconfig-form-group-acmva">
                  <label>
                    <span>
                      <Mail size={14} /> Correo Electrónico:
                    </span>
                    <input
                      type="email"
                      className="adminconfig-input-acmva"
                      value={universidad.cor_uni || ""}
                      onChange={(e) =>
                        setUniversidad({
                          ...universidad,
                          cor_uni: e.target.value,
                        })
                      }
                      placeholder="correo@universidad.edu.ec"
                    />
                  </label>
                </div>
              </div>

              <div className="adminconfig-actions-acmva">
                <button
                  onClick={guardarUniversidad}
                  className={`adminconfig-btn-acmva ${
                    loadingUniversidad ? "loading-acmva" : ""
                  } ${saveUniversidadSuccess ? "success-acmva" : ""}`}
                  disabled={loadingUniversidad}
                >
                  {loadingUniversidad ? (
                    <>Guardando...</>
                  ) : saveUniversidadSuccess ? (
                    <>
                      <CheckCircle size={18} /> Guardado
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="adminconfig-section-acmva">
              <div className="adminconfig-social-header-acmva">
                <div>
                  <h3 className="adminconfig-section-title-acmva">
                    Enlaces institucionales
                  </h3>
                  <p className="adminconfig-info-acmva">
                    Configura los enlaces que se mostrarán en el footer. Puedes
                    elegir plataforma, icono, orden de aparición y si estarán
                    visibles.
                  </p>
                </div>

                <button
                  type="button"
                  className="autoridad-add-btn-acmva"
                  onClick={agregarSocialLink}
                >
                  <Plus size={18} /> Agregar enlace
                </button>
              </div>

              {socialLinks.length > 0 ? (
                <div className="adminconfig-social-links-acmva">
                  {socialLinks.map((socialLink, index) => {
                    const IconPreview =
                      SOCIAL_ICON_COMPONENTS[socialLink.iconKey] ||
                      SOCIAL_ICON_COMPONENTS.link;
                    const socialLinkError =
                      socialLinksErrors[socialLink.clientId] || {};

                    return (
                      <div
                        key={socialLink.clientId}
                        className={`adminconfig-social-card-acmva ${
                          socialLink.isActive
                            ? ""
                            : "adminconfig-social-card-inactive-acmva"
                        } ${
                          draggedSocialLinkId === socialLink.clientId
                            ? "adminconfig-social-card-dragging-acmva"
                            : ""
                        } ${
                          dragOverSocialLinkId === socialLink.clientId
                            ? "adminconfig-social-card-drop-target-acmva"
                            : ""
                        }`}
                        onDragOver={(event) =>
                          handleSocialLinkDragOver(event, socialLink.clientId)
                        }
                        onDrop={(event) =>
                          handleSocialLinkDrop(event, socialLink.clientId)
                        }
                      >
                        <div className="adminconfig-social-card-header-acmva">
                          <div className="adminconfig-social-card-title-acmva">
                            <span className="autoridad-numero-acmva">
                              Enlace {index + 1}
                            </span>
                            <span className="adminconfig-social-visibility-badge-acmva">
                              {socialLink.isActive ? "Visible" : "Oculto"}
                            </span>
                            <span className="adminconfig-social-icon-preview-acmva">
                              <IconPreview size={18} aria-hidden="true" />
                            </span>
                          </div>

                          <div className="adminconfig-social-card-actions-acmva">
                            <button
                              type="button"
                              className="adminconfig-social-drag-handle-acmva"
                              draggable
                              onDragStart={(event) =>
                                handleSocialLinkDragStart(
                                  event,
                                  socialLink.clientId
                                )
                              }
                              onDragEnd={handleSocialLinkDragEnd}
                              aria-label="Arrastrar para reordenar"
                              title="Arrastrar para reordenar"
                            >
                              <GripVertical size={16} />
                            </button>
                            <button
                              type="button"
                              className="adminconfig-social-order-btn-acmva"
                              onClick={() =>
                                moverSocialLink(socialLink.clientId, "up")
                              }
                              disabled={index === 0}
                              aria-label="Mover enlace hacia arriba"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              type="button"
                              className="adminconfig-social-order-btn-acmva"
                              onClick={() =>
                                moverSocialLink(socialLink.clientId, "down")
                              }
                              disabled={index === socialLinks.length - 1}
                              aria-label="Mover enlace hacia abajo"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <button
                              type="button"
                              className="autoridad-delete-btn-acmva"
                              onClick={() =>
                                solicitarEliminacionSocialLink(socialLink)
                              }
                              aria-label="Eliminar enlace institucional"
                              title="Eliminar enlace institucional"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="adminconfig-social-grid-acmva">
                          <div className="adminconfig-form-group-acmva">
                            <label>
                              <span>Plataforma:</span>
                              <select
                                className="adminconfig-input-acmva"
                                value={socialLink.platformKey}
                                onChange={(event) =>
                                  actualizarSocialLink(
                                    socialLink.clientId,
                                    "platformKey",
                                    event.target.value
                                  )
                                }
                              >
                                {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <div className="adminconfig-form-group-acmva">
                            <label>
                              <span>Icono:</span>
                              <select
                                className={`adminconfig-input-acmva ${
                                  socialLinkError.iconKey
                                    ? "error-input-acmva"
                                    : ""
                                }`}
                                value={socialLink.iconKey}
                                onChange={(event) =>
                                  actualizarSocialLink(
                                    socialLink.clientId,
                                    "iconKey",
                                    event.target.value
                                  )
                                }
                              >
                                {SOCIAL_ICON_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              {socialLinkError.iconKey && (
                                <p className="validation-error-message-acmva">
                                  Selecciona un icono
                                </p>
                              )}
                            </label>
                          </div>

                          <div className="adminconfig-form-group-acmva">
                            <label>
                              <span>Etiqueta:</span>
                              <input
                                type="text"
                                className={`adminconfig-input-acmva ${
                                  socialLinkError.label ? "error-input-acmva" : ""
                                }`}
                                value={socialLink.label}
                                onChange={(event) =>
                                  actualizarSocialLink(
                                    socialLink.clientId,
                                    "label",
                                    event.target.value
                                  )
                                }
                                placeholder="Ejemplo: Facebook oficial"
                              />
                              {socialLinkError.label && (
                                <p className="validation-error-message-acmva">
                                  La etiqueta es obligatoria
                                </p>
                              )}
                            </label>
                          </div>

                          <div className="adminconfig-form-group-acmva">
                            <label>
                              <span>URL:</span>
                              <input
                                type="url"
                                inputMode="url"
                                autoComplete="url"
                                className={`adminconfig-input-acmva ${
                                  socialLinkError.url ? "error-input-acmva" : ""
                                }`}
                                value={socialLink.url}
                                onChange={(event) =>
                                  actualizarSocialLink(
                                    socialLink.clientId,
                                    "url",
                                    event.target.value
                                  )
                                }
                                placeholder="https://ejemplo.com"
                              />
                              {socialLinkError.url && (
                                <p className="validation-error-message-acmva">
                                  Ingresa una URL válida
                                </p>
                              )}
                            </label>
                          </div>
                        </div>

                        <div className="adminconfig-social-flags-acmva">
                          <label className="adminconfig-social-flag-acmva">
                            <input
                              type="checkbox"
                              checked={socialLink.isActive}
                              onChange={(event) =>
                                actualizarSocialLink(
                                  socialLink.clientId,
                                  "isActive",
                                  event.target.checked
                                )
                              }
                            />
                            <span>Visible en footer</span>
                          </label>

                          <label className="adminconfig-social-flag-acmva">
                            <input
                              type="checkbox"
                              checked={socialLink.opensInNewTab}
                              onChange={(event) =>
                                actualizarSocialLink(
                                  socialLink.clientId,
                                  "opensInNewTab",
                                  event.target.checked
                                )
                              }
                            />
                            <span>Abrir en nueva pestaña</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state-acmva">
                  <AlertCircle size={36} color="#94a3b8" />
                  <p>No se han agregado enlaces institucionales.</p>
                </div>
              )}

              <div className="adminconfig-actions-acmva">
                <button
                  type="button"
                  onClick={guardarSocialLinks}
                  className={`adminconfig-btn-acmva ${
                    loadingSocialLinks ? "loading-acmva" : ""
                  } ${saveSocialLinksSuccess ? "success-acmva" : ""}`}
                  disabled={loadingSocialLinks}
                >
                  {loadingSocialLinks ? (
                    <>Guardando...</>
                  ) : saveSocialLinksSuccess ? (
                    <>
                      <CheckCircle size={18} /> Guardado
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Guardar enlaces
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Sección Datos de la Facultad */}
        <div
          className="adminconfig-collapsible-header-acmva"
          onClick={toggleFacultadSection}
        >
          <h2 className="adminconfig-title-acmva">
            <Building size={20} /> Datos de la Facultad
          </h2>
          <button
            className="adminconfig-collapse-btn-acmva"
            aria-label={
              facultadExpanded ? "Colapsar sección" : "Expandir sección"
            }
          >
            {facultadExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>

        {facultadExpanded && (
          <>
            <p className="adminconfig-description-acmva">
              Desde aquí puedes editar la información básica de la facultad,
              como su nombre, acrónimo y logo. Estos datos aparecerán en todas
              las secciones del sistema.
            </p>

            <div className="adminconfig-section-acmva">
              <div className="facultad-form-acmva">
                <div className="facultad-form-group-acmva">
                  <label>
                    <span>
                      <Image size={14} /> Logo de la Facultad:
                    </span>
                    <ImageUpload
                      currentImage={facultad.url_log_fac}
                      onImageChange={(url) =>
                        setFacultad({ ...facultad, url_log_fac: url })
                      }
                      placeholder="Subir logo de la facultad"
                    />
                  </label>
                </div>

                <div className="facultad-form-group-acmva">
                  <label>
                    <span>
                      <Building size={14} /> Nombre de la Facultad:
                    </span>
                    <input
                      type="text"
                      className={`facultad-input-acmva ${
                        validationFacultadErrors.nom_fac
                          ? "error-input-acmva"
                          : ""
                      }`}
                      value={facultad.nom_fac}
                      onChange={(e) => {
                        setFacultad({ ...facultad, nom_fac: e.target.value });
                        if (e.target.value.trim()) {
                          setValidationFacultadErrors({
                            ...validationFacultadErrors,
                            nom_fac: false,
                          });
                        }
                      }}
                      placeholder="Nombre completo de la facultad"
                    />
                    {validationFacultadErrors.nom_fac && (
                      <p className="validation-error-message-acmva">
                        Este campo es obligatorio
                      </p>
                    )}
                  </label>
                </div>

                <div className="facultad-form-group-acmva">
                  <label>
                    <span>
                      <Briefcase size={14} /> Acrónimo de la Facultad:
                    </span>
                    <input
                      type="text"
                      className="facultad-input-acmva"
                      value={facultad.acr_fac || ""}
                      onChange={(e) =>
                        setFacultad({ ...facultad, acr_fac: e.target.value })
                      }
                      placeholder="Ejemplo: FISEI"
                    />
                  </label>
                </div>

                <div className="facultad-form-group-acmva">
                  <label>
                    <span>
                      <AlignLeft size={14} /> Descripción de la Facultad:
                    </span>
                    <textarea
                      rows={4}
                      className="facultad-input-acmva textarea-acmva"
                      value={facultad.des_fac || ""}
                      onChange={(e) =>
                        setFacultad({ ...facultad, des_fac: e.target.value })
                      }
                      placeholder="Breve descripción de la facultad"
                    />
                  </label>
                </div>
              </div>

              <div className="adminconfig-actions-acmva">
                <button
                  onClick={guardarFacultad}
                  className={`adminconfig-btn-acmva ${
                    loadingFacultad ? "loading-acmva" : ""
                  } ${saveFacultadSuccess ? "success-acmva" : ""}`}
                  disabled={loadingFacultad}
                >
                  {loadingFacultad ? (
                    <>Guardando...</>
                  ) : saveFacultadSuccess ? (
                    <>
                      <CheckCircle size={18} /> Guardado
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Sección MVA */}
        <div
          className="adminconfig-collapsible-header-acmva"
          onClick={toggleMvaSection}
        >
          <h2 className="adminconfig-title-acmva">
            <Users size={20} /> Misión, Visión y Autoridades
          </h2>
          <button
            className="adminconfig-collapse-btn-acmva"
            aria-label={mvaExpanded ? "Colapsar sección" : "Expandir sección"}
          >
            {mvaExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {mvaExpanded && (
          <>
            <div className="adminconfig-header-acmva">
              <button
                className="adminconfig-preview-btn-acmva"
                onClick={togglePreviewMode}
                title={previewMode ? "Modo edición" : "Vista previa"}
              >
                {previewMode ? <Edit2 size={18} /> : <Eye size={18} />}
                {previewMode ? " Editar" : " Vista previa"}
              </button>
            </div>

            <p className="adminconfig-description-acmva">
              Desde aquí puedes editar la información que se muestra en la
              página principal. Los cambios se reflejarán inmediatamente en la
              sección institucional.
            </p>

            <div className="adminconfig-section-acmva">
              <h3 className="adminconfig-section-title-acmva">Misión</h3>
              {previewMode ? (
                <div className="adminconfig-preview-box-acmva">
                  {form.mision ? (
                    <p>{form.mision}</p>
                  ) : (
                    <p className="text-muted-acmva">
                      No se ha definido una misión.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    rows={4}
                    className={`adminconfig-textarea-acmva ${
                      validationErrors.mision ? "error-input-acmva" : ""
                    }`}
                    value={form.mision}
                    onChange={(e) => {
                      setForm({ ...form, mision: e.target.value });
                      if (e.target.value.trim()) {
                        setValidationErrors({
                          ...validationErrors,
                          mision: false,
                        });
                      }
                    }}
                    placeholder="Ingrese la misión de la facultad"
                  />
                  {validationErrors.mision && (
                    <p className="validation-error-message-acmva">
                      Este campo es obligatorio
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="adminconfig-section-acmva">
              <h3 className="adminconfig-section-title-acmva">Visión</h3>
              {previewMode ? (
                <div className="adminconfig-preview-box-acmva">
                  {form.vision ? (
                    <p>{form.vision}</p>
                  ) : (
                    <p className="text-muted-acmva">
                      No se ha definido una visión.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    rows={4}
                    className={`adminconfig-textarea-acmva ${
                      validationErrors.vision ? "error-input-acmva" : ""
                    }`}
                    value={form.vision}
                    onChange={(e) => {
                      setForm({ ...form, vision: e.target.value });
                      if (e.target.value.trim()) {
                        setValidationErrors({
                          ...validationErrors,
                          vision: false,
                        });
                      }
                    }}
                    placeholder="Ingrese la visión de la facultad"
                  />
                  {validationErrors.vision && (
                    <p className="validation-error-message-acmva">
                      Este campo es obligatorio
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="adminconfig-section-acmva">
              <h3 className="adminconfig-section-title-acmva">Autoridades</h3>
              <p className="adminconfig-info-acmva">
                {previewMode
                  ? "Vista previa de las autoridades configuradas."
                  : "Agregue hasta 5 autoridades de la facultad. Las dos primeras se considerarán como Decano y Subdecano respectivamente."}
              </p>

              {previewMode ? (
                <div className="adminconfig-autoridades-preview-acmva">
                  {autoridadesArray.length > 0 ? (
                    autoridadesArray.map((autoridad, index) => (
                      <div key={index} className="autoridad-card-acmva">
                        <div className="autoridad-imagen-acmva">
                          <img
                            src={
                              autoridad.imagen ||
                              "https://via.placeholder.com/150?text=Sin+Imagen"
                            }
                            alt={autoridad.nombre || "Autoridad"}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=Sin+Imagen";
                            }}
                          />
                        </div>
                        <div className="autoridad-info-acmva">
                          <h4>{autoridad.cargo || "Sin cargo asignado"}</h4>
                          <h5>
                            {autoridad.nombre || "Sin nombre especificado"}
                          </h5>
                          {autoridad.email && (
                            <p>
                              <Mail size={14} /> {autoridad.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state-acmva">
                      <AlertCircle size={36} color="#94a3b8" />
                      <p>No se han definido autoridades.</p>
                      <button
                        className="adminconfig-preview-btn-acmva small-acmva"
                        onClick={togglePreviewMode}
                      >
                        <Edit2 size={14} /> Configurar autoridades
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="adminconfig-autoridades-container-acmva">
                  {autoridadesArray.map((autoridad, index) => (
                    <div key={index} className="autoridad-form-acmva">
                      <div className="autoridad-form-header-acmva">
                        <span className="autoridad-numero-acmva">
                          {index === 0
                            ? "Decano"
                            : index === 1
                            ? "Subdecano"
                            : `Autoridad ${index + 1}`}
                        </span>
                        <button
                          className="autoridad-delete-btn-acmva"
                          onClick={() => eliminarAutoridad(index)}
                          title="Eliminar autoridad"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="autoridad-form-group-acmva">
                        <label>
                          <span>Cargo:</span>
                          <input
                            type="text"
                            value={autoridad.cargo}
                            onChange={(e) =>
                              actualizarAutoridad(
                                index,
                                "cargo",
                                e.target.value
                              )
                            }
                            placeholder={
                              index === 0
                                ? "Decano"
                                : index === 1
                                ? "Subdecano"
                                : "Cargo"
                            }
                            className="autoridad-input-acmva"
                          />
                        </label>
                      </div>
                      <div className="autoridad-form-group-acmva">
                        <label>
                          <span>
                            <User size={14} /> Nombre completo:
                          </span>
                          <input
                            type="text"
                            value={autoridad.nombre}
                            onChange={(e) =>
                              actualizarAutoridad(
                                index,
                                "nombre",
                                e.target.value
                              )
                            }
                            placeholder="Nombre y apellido"
                            className="autoridad-input-acmva"
                          />
                        </label>
                      </div>
                      <div className="autoridad-form-group-acmva">
                        <label>
                          <span>
                            <Mail size={14} /> Correo electrónico:
                          </span>
                          <input
                            type="email"
                            value={autoridad.email}
                            onChange={(e) =>
                              actualizarAutoridad(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                            placeholder="correo@uta.edu.ec"
                            className="autoridad-input-acmva"
                          />
                        </label>
                      </div>
                      <div className="autoridad-form-group-acmva">
                        <label>
                          <span>Imagen de perfil:</span>
                          <ImageUpload
                            currentImage={autoridad.imagen}
                            onImageChange={(url) =>
                              actualizarAutoridad(index, "imagen", url)
                            }
                            placeholder="Subir foto de la autoridad"
                          />
                        </label>
                      </div>
                    </div>
                  ))}

                  {autoridadesArray.length < 5 && (
                    <button
                      className="autoridad-add-btn-acmva"
                      onClick={agregarAutoridad}
                      disabled={loading}
                    >
                      <Plus size={18} /> Agregar autoridad
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="adminconfig-actions-acmva">
              <button
                onClick={guardar}
                className={`adminconfig-btn-acmva ${
                  loading ? "loading-acmva" : ""
                } ${saveSuccess ? "success-acmva" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>Guardando...</>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle size={18} /> Guardado
                  </>
                ) : (
                  <>
                    <Save size={18} /> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Sección de Estadísticas */}
        <div
          className="adminconfig-collapsible-header-acmva"
          onClick={toggleStatisticsSection}
        >
          <h2 className="adminconfig-title-acmva">
            <BarChart size={20} /> Estadísticas del Home
          </h2>
          <button
            className="adminconfig-collapse-btn-acmva"
            aria-label={
              statisticsExpanded ? "Colapsar sección" : "Expandir sección"
            }
          >
            {statisticsExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>

        {statisticsExpanded && (
          <>
            <div className="adminconfig-section-acmva">
              <StatisticsConfig
                loading={loading}
                onSave={(selectedStats) => {
                  console.log("Estadísticas seleccionadas:", selectedStats);
                  // Cuando se implemente el backend, aquí se manejará el guardado
                }}
                onStatsUpdate={(selectedStats) => {
                  // Actualizar las estadísticas en tiempo real
                  updateActiveStats(selectedStats);
                }}
              />
            </div>
          </>
        )}
      </div>

      <ActionConfirmModal
        isOpen={Boolean(socialLinkPendingDeletion)}
        title="Confirmar eliminación de enlace"
        description={`Se quitará "${
          socialLinkPendingDeletion?.label || "este enlace institucional"
        }" de la lista actual. El cambio se aplicará en el sistema cuando guardes los enlaces.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        onClose={cerrarModalEliminacionSocialLink}
        onConfirm={confirmarEliminacionSocialLink}
      />
    </>
  );
};

export default AdminConfiguracionMVA;
