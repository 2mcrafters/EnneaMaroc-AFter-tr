import { useEffect } from "react";

const BASE_URL = "https://enneamaroc.com";
const SITE_NAME = "EnnéaMaroc";
const DEFAULT_IMAGE = "https://enneamaroc.com/assets/images/logo/lgbanner.png";
const LOGO = "https://enneamaroc.com/assets/images/logo/lgbanner.png";
const ORGANIZATION_NAME = "Ennéa Maroc";

const pageMetadata = {
  home: {
    title:
      "EnnéaMaroc : École de Coaching & Formation Ennéagramme Certifiante au Maroc",
    description:
      "Devenez expert en Ennéagramme. Formation certifiante, coaching professionnel et développement du leadership à Tanger, Casablanca et partout au Maroc. Testez votre profil.",
    keywords: [
      "Ennéagramme Maroc",
      "Formation Ennéagramme Certifiante",
      "Coaching Professionnel Maroc",
      "Développement Personnel Tanger",
      "Leadership et Management",
      "École de Coaching Maroc",
      "Certification Maître Praticien",
    ],
    image: DEFAULT_IMAGE,
    type: "website",
    event: {
      name: "Atelier Découverte Ennéagramme Tanger",
      description:
        "Session immersive de coaching pour expérimenter les bases de l'ennéagramme avec les coachs EnnéaMaroc.",
      startDate: "2025-12-06T09:00:00+01:00",
      endDate: "2025-12-06T16:30:00+01:00",
      location: "EnnéaMaroc, Tanger",
    },
  },
  contact: {
    title:
      "Contactez EnnéaMaroc | Rendez-vous Coaching & Inscription Formation",
    description:
      "Prenez rendez-vous pour un bilan gratuit. Nos experts à Tanger et en ligne vous accompagnent dans votre parcours de certification et coaching personnel.",
    keywords: [
      "Contact EnnéaMaroc",
      "Rendez-vous Coaching",
      "Inscription Formation Ennéagramme",
      "Coach de vie Tanger",
      "Accompagnement Professionnel",
    ],
    image: DEFAULT_IMAGE,
    type: "website",
    event: {
      name: "Session conseil coaching Ennéagramme",
      description:
        "Un entretien avec les coachs EnnéaMaroc pour aligner votre projet personnel ou professionnel en intelligence émotionnelle.",
      startDate: "2025-12-15T18:00:00+01:00",
      endDate: "2025-12-15T19:30:00+01:00",
      location: "EnnéaMaroc, Tanger",
    },
  },
  decouvrir: {
    title: "EnnéaMaroc – Programme Ennéagramme Découvrir",
    description:
      "Le cycle Découvrir est une formation enneagramme immersive à Tanger, idéale pour initier votre développement personnel via nos cycles de formation et ateliers enneagramme.",
    keywords: [
      "formation enneagramme",
      "programme enneagramme",
      "cycles de formation",
      "coaching enneagramme",
      "ateliers enneagramme",
    ],
    image: DEFAULT_IMAGE,
    type: "article",
    event: {
      name: "Cycle Découvrir – Formation Ennéagramme",
      description:
        "6 modules intensifs pour explorer les 27 visages de la personnalité et poser les bases d'un coaching de vie durable.",
      startDate: "2025-11-26T09:00:00+01:00",
      endDate: "2025-12-07T17:30:00+01:00",
      location: "EnnéaMaroc, Tanger",
    },
  },
  approfondir: {
    title:
      "EnnéaMaroc – Approfondir l'Ennéagramme – Formation & croissance personnelle",
    description:
      "Approfondissez vos compétences en intelligence émotionnelle, croissance personnelle et coaching de vie avec le programme Ennéagramme conçu pour managers et passionnés.",
    keywords: [
      "intelligence émotionnelle",
      "croissance personnelle",
      "formation enneagramme",
      "programme enneagramme",
      "coaching de vie",
    ],
    image: DEFAULT_IMAGE,
    type: "article",
    event: {
      name: "Cycle Approfondir – Développement Ennéagramme",
      description:
        "Un parcours expérientiel qui conjugue panels vivants, travail instinctif et supervision pour transformer vos relations.",
      startDate: "2025-01-10T09:00:00+01:00",
      endDate: "2025-01-25T17:30:00+01:00",
      location: "EnnéaMaroc, Tanger",
    },
  },
  transmettre: {
    title:
      "EnnéaMaroc – Transmettre l'Ennéagramme – Coaching professionnel & leadership conscient",
    description:
      "Préparez-vous à transmettre l'ennéagramme dans vos équipes avec un parcours de coaching professionnel, leadership consciente et management humain à Tanger.",
    keywords: [
      "coaching professionnel",
      "management humain",
      "leadership consciente",
      "formation enneagramme",
      "coaching Maroc",
    ],
    image: DEFAULT_IMAGE,
    type: "article",
    event: {
      name: "Retraite Transmettre – Leadership et supervision",
      description:
        "5 jours intensifs pour maîtriser la facilitation, l'entretien typologique et la certification HRH.",
      startDate: "2025-02-14T09:00:00+01:00",
      endDate: "2025-02-18T17:30:00+01:00",
      location: "EnnéaMaroc, Tanger",
    },
  },
  ecole: {
    title:
      "EnnéaMaroc – École Ennéagramme Maroc – Formation professionnelle et accompagnement",
    description:
      "L'École EnnéaMaroc offre des formations professionnelles Maroc en Ennéagramme, mêlant coaching enneagramme et accompagnement individuel pour coachs et entreprises.",
    keywords: [
      "école enneagramme Maroc",
      "formation professionnelle Maroc",
      "programme enneagramme",
      "coaching enneagramme",
      "accompagnement individuel",
    ],
    image: DEFAULT_IMAGE,
    type: "article",
    event: {
      name: "Journée portes ouvertes – École EnnéaMaroc",
      description:
        "Rencontrez l'équipe pédagogique, échangez sur les cursus et vivez une démonstration de panels et constellations familiales.",
      startDate: "2025-12-20T10:00:00+01:00",
      endDate: "2025-12-20T17:00:00+01:00",
      location: "EnnéaMaroc, Tanger",
    },
  },
  solution: {
    title:
      "EnnéaMaroc – Solutions coaching Maroc – Leadership conscient et management humain",
    description:
      "Nos solutions EnnéaMaroc pour entreprises combinent coaching Maroc, management humain et leadership consciente, avec des cycles de formation adaptés aux équipes en transformation.",
    keywords: [
      "coaching Maroc",
      "management humain",
      "leadership consciente",
      "cycles de formation",
      "formation professionnelle Maroc",
    ],
    image: DEFAULT_IMAGE,
    type: "article",
    event: {
      name: "Table ronde Leadership conscient",
      description:
        "Échanges entre coachs et dirigeants sur l'intelligence émotionnelle appliquée au management humain.",
      startDate: "2025-11-28T18:30:00+01:00",
      endDate: "2025-11-28T20:30:00+01:00",
      location: "EnnéaMaroc, Tanger",
    },
  },
  agenda: {
    title:
      "EnnéaMaroc – Agenda Ennéagramme Tanger – Ateliers, retraites et constellations familiales",
    description:
      "Consultez l'agenda des ateliers enneagramme, retraites et constellations familiales à Tanger, avec des cycles de formation certifiants répartis sur 14 mois.",
    keywords: [
      "ateliers enneagramme",
      "retraites et constellations familiales",
      "cycles de formation",
      "coaching professionnel",
      "coaching Maroc",
    ],
    image: DEFAULT_IMAGE,
    type: "article",
    event: {
      name: "Calendrier ateliers EnnéaMaroc",
      description:
        "Programme continu des modules, ateliers et retraites pour les 3 niveaux de formation.",
      startDate: "2025-11-01T09:00:00+01:00",
      endDate: "2026-12-31T17:00:00+01:00",
      location: "EnnéaMaroc, Tanger",
    },
  },
  pageinfo: {
    title: "EnnéaMaroc – Espace membre coaching & formation enneagramme",
    description:
      "Accédez à l’espace membre pour suivre vos parcours coaching de vie, votre formation enneagramme et rester informé des sessions de coaching Maroc.",
    keywords: [
      "coaching de vie",
      "accompagnement individuel",
      "formation enneagramme",
      "programme enneagramme",
      "coaching Maroc",
    ],
    image: DEFAULT_IMAGE,
    type: "website",
    event: {
      name: "Session privée EnnéaMaroc",
      description:
        "Webinaire dédié à l'organisation et au suivi des parcours, avec focus sur l'accompagnement individuel et les retraites.",
      startDate: "2025-12-01T09:00:00+01:00",
      endDate: "2025-12-01T11:00:00+01:00",
      location: "EnnéaMaroc, Tanger",
    },
  },
};

const upsertMeta = (attr, value, content) => {
  if (!content) return;
  const selector = `meta[${attr}="${value}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, value);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const setCanonical = (href) => {
  if (!href) return;
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", href);
};

const ensureJsonLd = (data) => {
  if (!data || !data.length) return;
  let script = document.getElementById("seo-json-ld");
  if (!script) {
    script = document.createElement("script");
    script.setAttribute("id", "seo-json-ld");
    script.setAttribute("type", "application/ld+json");
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
};

const buildStructuredData = (config, canonicalUrl) => {
  const commonUrl = canonicalUrl || BASE_URL;
  const location = {
    "@type": "Place",
    name: ORGANIZATION_NAME,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tanger",
      addressRegion: "Tanger-Tétouan-Al Hoceima",
      addressCountry: "MA",
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION_NAME,
    url: BASE_URL,
    logo: LOGO,
    founder: "Chafik Harti",
    description:
      "EnnéaMaroc est une école de coaching, formation et accompagnement basé à Tanger, dédiée à l'ennéagramme et à la transformation humaine.",
    sameAs: [BASE_URL],
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: ORGANIZATION_NAME,
    url: BASE_URL,
    image: LOGO,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tanger",
      addressRegion: "Tanger-Tétouan-Al Hoceima",
      addressCountry: "MA",
    },
  priceRange: "MAD",
  };

  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: config.title,
    description: config.description,
    provider: {
      "@type": "Organization",
      name: ORGANIZATION_NAME,
      url: BASE_URL,
    },
    keywords: config.keywords.join(", "),
    url: commonUrl,
  };

  const event = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: config.event?.name ?? `${config.title} – EnnéaMaroc`,
    description:
      config.event?.description ?? config.description ?? ORGANIZATION_NAME,
    startDate: config.event?.startDate,
    endDate: config.event?.endDate,
    location,
    organizer: {
      "@type": "Organization",
      name: ORGANIZATION_NAME,
      url: BASE_URL,
    },
    url: commonUrl,
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: config.title,
    description: config.description,
    url: commonUrl,
    author: {
      "@type": "Person",
      name: "Chafik Harti",
    },
    publisher: organization,
    datePublished: "2025-01-05",
    image: config.image,
    keywords: config.keywords.join(", "),
  };

  return [organization, localBusiness, course, event, article];
};

const Seo = ({ page = "home", path = "/" }) => {
  const config = pageMetadata[page] ?? pageMetadata.home;
  useEffect(() => {
    const route = path || (typeof window !== "undefined" ? window.location.pathname : "/");
    const canonicalUrl = new URL(route, BASE_URL).href;

    document.title = config.title;
    upsertMeta("name", "description", config.description);
    upsertMeta("name", "keywords", config.keywords.join(", "));
    upsertMeta("name", "robots", "index, follow");
    upsertMeta("property", "og:title", config.title);
    upsertMeta("property", "og:description", config.description);
    upsertMeta("property", "og:type", config.type);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:image", config.image);
    upsertMeta("property", "og:locale", "fr_FR");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", config.title);
    upsertMeta("name", "twitter:description", config.description);
    upsertMeta("name", "twitter:image", config.image);

    setCanonical(canonicalUrl);
    ensureJsonLd(buildStructuredData(config, canonicalUrl));
  }, [page, path, config]);

  return null;
};

export default Seo;
