// Constants used throughout the application
export const APP_CONFIG = {
  // Contact information
  CONTACT: {
    EMAIL: "contact@enneamaroc.com",
    PHONE_PRIMARY: "+212662062032",
    PHONE_SECONDARY: "+212661246647",
    LOCATION: "Maroc"
  },

  // Social media links
  SOCIAL_LINKS: {
    FACEBOOK: "https://www.facebook.com/enneamaroc",
    TWITTER: "https://twitter.com/enneamaroc", 
    LINKEDIN: "https://www.linkedin.com/company/ennea-maroc/",
    INSTAGRAM: "https://www.instagram.com/ennea_maroc/"
  },

  // API endpoints (for future use)
  API: {
    BASE_URL: import.meta.env.VITE_API_URL || "/api",
    TIMEOUT: 10000
  },

  // App metadata
  APP_NAME: "Ennéagramme Maroc",
  APP_DESCRIPTION: "Centre de formation spécialisé dans l'ennéagramme",
  VERSION: "1.0.0"
};

// CSS class constants
export const CSS_CLASSES = {
  // Header classes
  HEADER: {
    STICKY: "cs-gescout_sticky",
    STICKY_SHOW: "cs-gescout_show cs-gescout_sticky",
    SITE_HEADER: "cs_site_header",
    STYLE_1: "cs_style_1",
    STICKY_HEADER: "cs_sticky_header",
    FULL_WIDTH: "cs_site_header_full_width",
    MOBILE_ACTIVE: "cs_mobile_toggle_active",
    MOBILE_TOGGLE: "cs-munu_toggle",
    MOBILE_TOGGLE_ACTIVE: "cs-munu_toggle cs_teggle_active"
  },

  // Common utility classes
  COMMON: {
    ACTIVE: "active",
    DISABLED: "disabled",
    HIDDEN: "hidden",
    VISIBLE: "visible"
  }
};

// Route paths
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  SERVICES: "/service",
  BLOG: "/blog",
  PRICING: "/pricing",
  TEAM: "/team",
  GALLERY: "/gallery",
  TESTIMONIAL: "/testimonial",
  FAQ: "/faq",
  PARCOURS: "/parcours",
  DECOUVRIR: "/Découvrir",
  APPROFONDIR: "/Approfondir",
  TRANSMETTRE: "/Transmettre",
  PROFILE: "/profile",
  PROJECT: "/project"
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "Ce champ est obligatoire",
  EMAIL_INVALID: "Veuillez saisir une adresse email valide",
  PHONE_INVALID: "Veuillez saisir un numéro de téléphone valide",
  PASSWORD_MIN_LENGTH: "Le mot de passe doit contenir au moins 8 caractères",
  PASSWORDS_NOT_MATCH: "Les mots de passe ne correspondent pas"
};

// Local storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: "userToken",
  USER_DATA: "userData",
  PREFERENCES: "userPreferences",
  CART: "cart"
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erreur de connexion au serveur",
  SERVER_ERROR: "Une erreur est survenue côté serveur",
  UNAUTHORIZED: "Accès non autorisé",
  NOT_FOUND: "Ressource non trouvée",
  VALIDATION_ERROR: "Erreur de validation des données",
  UNKNOWN_ERROR: "Une erreur inconnue est survenue"
};
