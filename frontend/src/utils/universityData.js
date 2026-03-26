const pickFirstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const normalizeUniversityData = (data = {}, fallback = {}) => ({
  id_uni: pickFirstValue(data.id_uni, data.id, fallback.id_uni, fallback.id, ""),
  nom_uni: pickFirstValue(data.nom_uni, data.name, fallback.nom_uni, fallback.name, ""),
  acr_uni: pickFirstValue(
    data.acr_uni,
    data.acronym,
    fallback.acr_uni,
    fallback.acronym,
    ""
  ),
  url_log_uni: pickFirstValue(
    data.url_log_uni,
    data.logoUrl,
    fallback.url_log_uni,
    fallback.logoUrl,
    ""
  ),
  dir_uni: pickFirstValue(
    data.dir_uni,
    data.address,
    fallback.dir_uni,
    fallback.address,
    ""
  ),
  tel_uni: pickFirstValue(data.tel_uni, data.phone, fallback.tel_uni, fallback.phone, ""),
  cor_uni: pickFirstValue(data.cor_uni, data.email, fallback.cor_uni, fallback.email, ""),
  social_links: Array.isArray(data.social_links)
    ? data.social_links
    : Array.isArray(data.socialLinks)
    ? data.socialLinks
    : Array.isArray(fallback.social_links)
    ? fallback.social_links
    : [],
});

export const normalizeUniversitySocialLink = (socialLink = {}, index = 0) => ({
  id: socialLink.id || "",
  label: socialLink.label || "",
  url: socialLink.url || "",
  iconKey: socialLink.iconKey || "link",
  platformKey: socialLink.platformKey || "custom",
  displayOrder:
    Number.isInteger(socialLink.displayOrder) && socialLink.displayOrder >= 0
      ? socialLink.displayOrder
      : index,
  isActive:
    typeof socialLink.isActive === "boolean" ? socialLink.isActive : true,
  opensInNewTab:
    typeof socialLink.opensInNewTab === "boolean"
      ? socialLink.opensInNewTab
      : true,
});
