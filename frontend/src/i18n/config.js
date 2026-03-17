import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import common from "./locales/es/common.json";
import auth from "./locales/es/auth.json";
import events from "./locales/es/events.json";
import errors from "./locales/es/errors.json";

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    es: {
      common,
      auth,
      events,
      errors,
    },
  },
  lng: "es",
  fallbackLng: "es",
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
