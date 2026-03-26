const rateLimit = require("express-rate-limit");

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isProduction = process.env.NODE_ENV === "production";

const apiLimiter = rateLimit({
  windowMs: toPositiveInt(
    process.env.RATE_LIMIT_WINDOW_MS,
    isProduction ? 15 * 60 * 1000 : 5 * 60 * 1000
  ),
  max: toPositiveInt(
    process.env.RATE_LIMIT_MAX_REQUESTS,
    isProduction ? 300 : 5000
  ),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas solicitudes. Intenta nuevamente en unos minutos.",
  },
});

const authLimiter = rateLimit({
  windowMs: toPositiveInt(
    process.env.RATE_LIMIT_AUTH_WINDOW_MS,
    15 * 60 * 1000
  ),
  max: toPositiveInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS, 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiados intentos en autenticación. Intenta más tarde.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
