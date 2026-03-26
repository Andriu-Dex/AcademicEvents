const { prisma } = require("../config/db");
const socketService = require("../services/socket.service");
const { createTenantScoped } = require("../utils/tenantScope");

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue === "" ? null : trimmedValue;
};

const resolveRequiredString = (incomingValue, currentValue) => {
  if (typeof incomingValue !== "string") {
    return currentValue;
  }

  const trimmedValue = incomingValue.trim();
  return trimmedValue === "" ? currentValue : trimmedValue;
};

const resolveOptionalString = (incomingValue, currentValue) => {
  const normalizedValue = normalizeOptionalString(incomingValue);

  if (normalizedValue === undefined) {
    return currentValue;
  }

  return normalizedValue;
};

const isValidAbsoluteUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const findUniversityById = async (scoped, universityId) =>
  scoped.findFirst("university", {
    where: {
      id: universityId,
    },
    include: {
      socialLinks: {
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

const ensureStandardPlatformIsUnique = async ({
  scoped,
  universityId,
  platformKey,
  currentLinkId,
}) => {
  if (!platformKey || platformKey === "custom") {
    return null;
  }

  const duplicatedLink = await scoped.findFirst("universitySocialLink", {
    where: {
      universityId,
      platformKey,
      isActive: true,
      ...(currentLinkId
        ? {
            id: {
              not: currentLinkId,
            },
          }
        : {}),
    },
  });

  return duplicatedLink;
};

const emitUniversitySocketUpdate = ({
  tenantId,
  tenantSlug,
  universityId,
  action,
  scope,
  university = null,
  socialLink = null,
  socialLinks = null,
  deletedSocialLinkId = null,
}) => {
  socketService.notifyUniversityChange(action, {
    tenantId,
    tenantSlug,
    universityId,
    scope,
    university,
    socialLink,
    socialLinks,
    deletedSocialLinkId,
  });
};

const getUniversidadPrincipal = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const universidad = await scoped.findFirst("university", {
      where: {
        isActive: true,
      },
      include: {
        socialLinks: {
          where: {
            isActive: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    if (!universidad) {
      return res.status(404).json({
        message: "No se encontró información de la universidad",
      });
    }

    return res.status(200).json(universidad);
  } catch (error) {
    console.error("Error al obtener universidad:", error);
    return res.status(500).json({
      message: "Error al obtener información de la universidad",
      error: error.message,
    });
  }
};

const getUniversitySocialLinks = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { id_uni: universityId } = req.params;

    if (!universityId) {
      return res.status(400).json({
        message: "Se requiere el ID de la universidad",
      });
    }

    const universidad = await scoped.findFirst("university", {
      where: {
        id: universityId,
      },
      select: {
        id: true,
      },
    });

    if (!universidad) {
      return res.status(404).json({
        message: "Universidad no encontrada",
      });
    }

    const socialLinks = await scoped.findMany("universitySocialLink", {
      where: {
        universityId,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    return res.status(200).json({
      socialLinks,
    });
  } catch (error) {
    console.error("Error al obtener enlaces institucionales:", error);
    return res.status(500).json({
      message: "Error al obtener los enlaces institucionales",
      error: error.message,
    });
  }
};

const updateUniversidadDatos = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { id_uni: universityId } = req.params;
    const { nom_uni, acr_uni, url_log_uni, dir_uni, tel_uni, cor_uni } = req.body;

    if (!universityId) {
      return res.status(400).json({
        message: "Se requiere el ID de la universidad",
      });
    }

    const universidadExistente = await scoped.findFirst("university", {
      where: {
        id: universityId,
      },
    });

    if (!universidadExistente) {
      return res.status(404).json({
        message: "Universidad no encontrada",
      });
    }

    await scoped.updateMany("university", {
      where: {
        id: universityId,
      },
      data: {
        name: resolveRequiredString(nom_uni, universidadExistente.name),
        acronym: resolveOptionalString(acr_uni, universidadExistente.acronym),
        logoUrl: resolveOptionalString(url_log_uni, universidadExistente.logoUrl),
        address: resolveRequiredString(dir_uni, universidadExistente.address),
        phone: resolveOptionalString(tel_uni, universidadExistente.phone),
        email: resolveOptionalString(cor_uni, universidadExistente.email),
      },
    });

    const universidadActualizada = await findUniversityById(scoped, universityId);

    emitUniversitySocketUpdate({
      tenantId: req.tenantId,
      tenantSlug: req.tenantSlug,
      universityId,
      action: "details-updated",
      scope: "details",
      university: universidadActualizada,
    });

    return res.status(200).json({
      message: "Datos de la universidad actualizados correctamente",
      universidad: universidadActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar universidad:", error);
    return res.status(500).json({
      message: "Error al actualizar información de la universidad",
      error: error.message,
    });
  }
};

const createUniversitySocialLink = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { id_uni: universityId } = req.params;
    const {
      label,
      url,
      iconKey,
      platformKey,
      displayOrder,
      isActive = true,
      opensInNewTab = true,
    } = req.body;

    const trimmedLabel = typeof label === "string" ? label.trim() : "";
    const trimmedUrl = typeof url === "string" ? url.trim() : "";
    const trimmedIconKey = typeof iconKey === "string" ? iconKey.trim() : "";
    const normalizedPlatformKey =
      typeof platformKey === "string" && platformKey.trim() !== ""
        ? platformKey.trim()
        : null;

    if (!trimmedLabel || !trimmedUrl || !trimmedIconKey) {
      return res.status(400).json({
        message: "Label, URL e iconKey son obligatorios",
      });
    }

    if (!isValidAbsoluteUrl(trimmedUrl)) {
      return res.status(400).json({
        message: "La URL del enlace institucional no es válida",
      });
    }

    const universidadExistente = await scoped.findFirst("university", {
      where: {
        id: universityId,
      },
    });

    if (!universidadExistente) {
      return res.status(404).json({
        message: "Universidad no encontrada",
      });
    }

    const duplicatedLink = await ensureStandardPlatformIsUnique({
      scoped,
      universityId,
      platformKey: normalizedPlatformKey,
    });

    if (duplicatedLink) {
      return res.status(409).json({
        message: "Ya existe un enlace activo para esa plataforma",
      });
    }

    const createdLink = await scoped.create("universitySocialLink", {
      data: {
        universityId,
        label: trimmedLabel,
        url: trimmedUrl,
        iconKey: trimmedIconKey,
        platformKey: normalizedPlatformKey,
        displayOrder: Number.isInteger(displayOrder)
          ? displayOrder
          : Number(displayOrder) || 0,
        isActive: Boolean(isActive),
        opensInNewTab: Boolean(opensInNewTab),
      },
    });

    emitUniversitySocketUpdate({
      tenantId: req.tenantId,
      tenantSlug: req.tenantSlug,
      universityId,
      action: "social-link-created",
      scope: "social-links",
      socialLink: createdLink,
    });

    return res.status(201).json({
      message: "Enlace institucional creado correctamente",
      socialLink: createdLink,
    });
  } catch (error) {
    console.error("Error al crear enlace institucional:", error);
    return res.status(500).json({
      message: "Error al crear el enlace institucional",
      error: error.message,
    });
  }
};

const updateUniversitySocialLink = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { id_uni: universityId, id: socialLinkId } = req.params;
    const {
      label,
      url,
      iconKey,
      platformKey,
      displayOrder,
      isActive,
      opensInNewTab,
    } = req.body;

    const existingLink = await scoped.findFirst("universitySocialLink", {
      where: {
        id: socialLinkId,
        universityId,
      },
    });

    if (!existingLink) {
      return res.status(404).json({
        message: "Enlace institucional no encontrado",
      });
    }

    const resolvedLabel = resolveRequiredString(label, existingLink.label);
    const resolvedUrl = resolveRequiredString(url, existingLink.url);
    const resolvedIconKey = resolveRequiredString(iconKey, existingLink.iconKey);
    const normalizedPlatformKey =
      typeof platformKey === "string"
        ? normalizeOptionalString(platformKey)
        : existingLink.platformKey;

    if (!resolvedLabel || !resolvedUrl || !resolvedIconKey) {
      return res.status(400).json({
        message: "Label, URL e iconKey son obligatorios",
      });
    }

    if (!isValidAbsoluteUrl(resolvedUrl)) {
      return res.status(400).json({
        message: "La URL del enlace institucional no es válida",
      });
    }

    const nextIsActive =
      typeof isActive === "boolean" ? isActive : existingLink.isActive;

    if (nextIsActive) {
      const duplicatedLink = await ensureStandardPlatformIsUnique({
        scoped,
        universityId,
        platformKey: normalizedPlatformKey,
        currentLinkId: socialLinkId,
      });

      if (duplicatedLink) {
        return res.status(409).json({
          message: "Ya existe un enlace activo para esa plataforma",
        });
      }
    }

    await scoped.updateMany("universitySocialLink", {
      where: {
        id: socialLinkId,
        universityId,
      },
      data: {
        label: resolvedLabel,
        url: resolvedUrl,
        iconKey: resolvedIconKey,
        platformKey: normalizedPlatformKey,
        displayOrder: Number.isInteger(displayOrder)
          ? displayOrder
          : displayOrder !== undefined
          ? Number(displayOrder) || 0
          : existingLink.displayOrder,
        isActive: nextIsActive,
        opensInNewTab:
          typeof opensInNewTab === "boolean"
            ? opensInNewTab
            : existingLink.opensInNewTab,
      },
    });

    const updatedLink = await scoped.findFirst("universitySocialLink", {
      where: {
        id: socialLinkId,
        universityId,
      },
    });

    emitUniversitySocketUpdate({
      tenantId: req.tenantId,
      tenantSlug: req.tenantSlug,
      universityId,
      action: "social-link-updated",
      scope: "social-links",
      socialLink: updatedLink,
    });

    return res.status(200).json({
      message: "Enlace institucional actualizado correctamente",
      socialLink: updatedLink,
    });
  } catch (error) {
    console.error("Error al actualizar enlace institucional:", error);
    return res.status(500).json({
      message: "Error al actualizar el enlace institucional",
      error: error.message,
    });
  }
};

const deleteUniversitySocialLink = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { id_uni: universityId, id: socialLinkId } = req.params;

    const existingLink = await scoped.findFirst("universitySocialLink", {
      where: {
        id: socialLinkId,
        universityId,
      },
    });

    if (!existingLink) {
      return res.status(404).json({
        message: "Enlace institucional no encontrado",
      });
    }

    await scoped.deleteMany("universitySocialLink", {
      where: {
        id: socialLinkId,
        universityId,
      },
    });

    emitUniversitySocketUpdate({
      tenantId: req.tenantId,
      tenantSlug: req.tenantSlug,
      universityId,
      action: "social-link-deleted",
      scope: "social-links",
      deletedSocialLinkId: socialLinkId,
      socialLink: existingLink,
    });

    return res.status(200).json({
      message: "Enlace institucional eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar enlace institucional:", error);
    return res.status(500).json({
      message: "Error al eliminar el enlace institucional",
      error: error.message,
    });
  }
};

const reorderUniversitySocialLinks = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { id_uni: universityId } = req.params;
    const { socialLinks } = req.body;

    if (!Array.isArray(socialLinks) || socialLinks.length === 0) {
      return res.status(400).json({
        message: "Se requiere una lista válida de enlaces para reordenar",
      });
    }

    const existingLinks = await scoped.findMany("universitySocialLink", {
      where: {
        universityId,
      },
      select: {
        id: true,
      },
    });

    const existingIds = new Set(existingLinks.map((link) => link.id));
    const hasInvalidIds = socialLinks.some((link) => !existingIds.has(link.id));

    if (hasInvalidIds) {
      return res.status(400).json({
        message: "La lista contiene enlaces institucionales inválidos",
      });
    }

    await Promise.all(
      socialLinks.map((socialLink, index) =>
        scoped.updateMany("universitySocialLink", {
          where: {
            id: socialLink.id,
            universityId,
          },
          data: {
            displayOrder:
              Number.isInteger(socialLink.displayOrder) &&
              socialLink.displayOrder >= 0
                ? socialLink.displayOrder
                : index,
          },
        })
      )
    );

    const orderedLinks = await scoped.findMany("universitySocialLink", {
      where: {
        universityId,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    emitUniversitySocketUpdate({
      tenantId: req.tenantId,
      tenantSlug: req.tenantSlug,
      universityId,
      action: "social-links-reordered",
      scope: "social-links",
      socialLinks: orderedLinks,
    });

    return res.status(200).json({
      message: "Orden de enlaces institucionales actualizado correctamente",
      socialLinks: orderedLinks,
    });
  } catch (error) {
    console.error("Error al reordenar enlaces institucionales:", error);
    return res.status(500).json({
      message: "Error al reordenar los enlaces institucionales",
      error: error.message,
    });
  }
};

module.exports = {
  getUniversidadPrincipal,
  getUniversitySocialLinks,
  updateUniversidadDatos,
  createUniversitySocialLink,
  updateUniversitySocialLink,
  deleteUniversitySocialLink,
  reorderUniversitySocialLinks,
};
