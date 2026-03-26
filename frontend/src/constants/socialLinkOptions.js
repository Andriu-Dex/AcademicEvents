import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Link2,
  Music2,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";

export const SOCIAL_ICON_COMPONENTS = {
  globe: Globe,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  send: Send,
  linkedin: Linkedin,
  music2: Music2,
  twitter: Twitter,
  link: Link2,
};

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "website", label: "Página web oficial", defaultIconKey: "globe" },
  { value: "facebook", label: "Facebook", defaultIconKey: "facebook" },
  { value: "instagram", label: "Instagram", defaultIconKey: "instagram" },
  { value: "youtube", label: "YouTube", defaultIconKey: "youtube" },
  { value: "telegram", label: "Telegram", defaultIconKey: "send" },
  { value: "linkedin", label: "LinkedIn", defaultIconKey: "linkedin" },
  { value: "tiktok", label: "TikTok", defaultIconKey: "music2" },
  { value: "x", label: "X", defaultIconKey: "twitter" },
  { value: "custom", label: "Personalizado", defaultIconKey: "link" },
];

export const SOCIAL_ICON_OPTIONS = [
  { value: "globe", label: "Globo" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "send", label: "Telegram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "music2", label: "TikTok" },
  { value: "twitter", label: "X" },
  { value: "link", label: "Enlace genérico" },
];

export const SOCIAL_PLATFORM_DEFAULTS = SOCIAL_PLATFORM_OPTIONS.reduce(
  (accumulator, option) => ({
    ...accumulator,
    [option.value]: option,
  }),
  {}
);
