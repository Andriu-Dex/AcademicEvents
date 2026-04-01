const LEGACY_NOTIFICATION_LINKS = {
  "/mis-inscripciones": "/enrollments",
  "/inscripciones": "/enrollments",
  "/eventos": "/events",
  "/certificados": "/certificates",
  "/admin/inscripciones": "/admin/enrollments",
};

const replaceLegacyPatterns = (path) => {
  // /eventos/:id -> /events
  if (/^\/eventos\/[^/]+\/?$/i.test(path)) {
    return "/events";
  }

  // /certificados/:id -> /certificates
  if (/^\/certificados\/[^/]+\/?$/i.test(path)) {
    return "/certificates";
  }

  // /admin/eventos/:id/inscripciones -> /admin/events/:id/enrollments
  const adminLegacyMatch = path.match(/^\/admin\/eventos\/([^/]+)\/inscripciones\/?$/i);
  if (adminLegacyMatch) {
    return `/admin/events/${adminLegacyMatch[1]}/enrollments`;
  }

  return path;
};

export const isExternalNotificationLink = (link) => /^https?:\/\//i.test(link || "");

export const normalizeNotificationLink = (rawLink) => {
  if (typeof rawLink !== "string") return null;

  const trimmed = rawLink.trim();
  if (!trimmed) return null;

  if (isExternalNotificationLink(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  if (LEGACY_NOTIFICATION_LINKS[normalizedPath]) {
    return LEGACY_NOTIFICATION_LINKS[normalizedPath];
  }

  return replaceLegacyPatterns(normalizedPath);
};
