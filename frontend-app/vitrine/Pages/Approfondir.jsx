import React, { useEffect, useRef, useState } from "react";
import Seo from "../Components/Seo/Seo";
import * as FaIcons from "react-icons/fa";
import { 
  FaCompass, FaUsers, FaMoon, FaLightbulb, FaGem, FaPrayingHands,
  FaCheckCircle, FaMapMarkerAlt, FaClock, FaCheck, FaCalendarAlt
} from "react-icons/fa";
import { parcoursService } from "../services/parcoursService";
import { formatPrice } from "../../utils/formatPrice";
import AccordionItem from "../Components/Accordion/AccordionItem";
import ParcoursDiagram from "../Components/ParcoursDiagram";
import "../assets/accordion.css";

const Approfondir = () => {
  const [parcoursData, setParcoursData] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const PROGRAM_SUBTITLE =
    "Niveau 2 – Voyage intérieur : Mécanismes, ombres et potentiels";

  const [modules, setModules] = useState([
    {
      id: 1,
      title: "Ressemblance et confusion",
      duration: "2 JOURS",
      subtitle: PROGRAM_SUBTITLE,
      description:
        "Ce module traite des confusions typologiques fréquentes entre profils proches. Il affine la capacité de discernement en allant au-delà des comportements visibles pour accéder aux motivations profondes. Les participants développent une lecture plus fine de soi et des autres, réduisant les erreurs d’identification et les projections.",
      details:
        "Ce module traite des confusions typologiques fréquentes entre profils proches. Il affine la capacité de discernement en allant au-delà des comportements visibles pour accéder aux motivations profondes. Les participants développent une lecture plus fine de soi et des autres, réduisant les erreurs d’identification et les projections.",
      icon: <FaCompass />,
      price_ht: "3500 MAD",
      price_ttc: "4200 MAD",
      place: "Casablanca",
      date: "À définir",
      prerequis: "Niveau D",
      reference: "V1",
    },
    {
      id: 2,
      title: "Relations en Ennéagramme",
      duration: "2 JOURS",
      subtitle: PROGRAM_SUBTITLE,
      description:
        "Ce module explore les dynamiques relationnelles entre les différents types. Il met en lumière les mécanismes d’attraction, de conflit, de complémentarité et de dépendance. Les participants apprennent à ajuster leur communication et à améliorer la qualité de leurs relations personnelles et professionnelles.",
      details:
        "Ce module explore les dynamiques relationnelles entre les différents types. Il met en lumière les mécanismes d’attraction, de conflit, de complémentarité et de dépendance. Les participants apprennent à ajuster leur communication et à améliorer la qualité de leurs relations personnelles et professionnelles.",
      icon: <FaUsers />,
      price_ht: "3500 MAD",
      price_ttc: "4200 MAD",
      place: "Casablanca",
      date: "À définir",
      prerequis: "V1",
      reference: "V2",
    },
    {
      id: 3,
      title: "Pathologie et ombres",
      duration: "2 JOURS",
      subtitle: PROGRAM_SUBTITLE,
      description:
        "Ce module approfondit les déséquilibres psychiques, les fixations et les mécanismes pathologiques possibles de chaque type. Il permet de reconnaître les signaux de désalignement, les zones de rigidité et les risques de dérive. L’approche reste non médicale et orientée vers la prévention, la conscience et la transformation.",
      details:
        "Ce module approfondit les déséquilibres psychiques, les fixations et les mécanismes pathologiques possibles de chaque type. Il permet de reconnaître les signaux de désalignement, les zones de rigidité et les risques de dérive. L’approche reste non médicale et orientée vers la prévention, la conscience et la transformation.",
      icon: <FaMoon />,
      price_ht: "3500 MAD",
      price_ttc: "4200 MAD",
      place: "Casablanca",
      date: "À définir",
      prerequis: "V1",
      reference: "V3",
    },
    {
      id: 4,
      title: "Grand Panel & pistes de développement",
      duration: "2 JOURS",
      subtitle: PROGRAM_SUBTITLE,
      description:
        "Ce module synthétise l’ensemble des connaissances acquises à travers un grand panel comparatif des types. Il met l’accent sur les pistes de développement, les mouvements d’intégration et de régression, ainsi que les leviers de transformation. Il permet une vision globale et structurée de l’Ennéagramme en action.",
      details:
        "Ce module synthétise l’ensemble des connaissances acquises à travers un grand panel comparatif des types. Il met l’accent sur les pistes de développement, les mouvements d’intégration et de régression, ainsi que les leviers de transformation. Il permet une vision globale et structurée de l’Ennéagramme en action.",
      icon: <FaLightbulb />,
      price_ht: "3500 MAD",
      price_ttc: "4200 MAD",
      place: "Casablanca",
      date: "À définir",
      prerequis: "V2 – V3",
      reference: "V4",
    },
    {
      id: 5,
      title: "Intégration : Ennéagramme et profils jungiens",
      duration: "2 JOURS",
      subtitle: PROGRAM_SUBTITLE,
      description:
        "Ce module établit des ponts entre l’Ennéagramme et les typologies jungiennes. Il enrichit la compréhension de la personnalité en croisant les approches et en offrant une lecture multidimensionnelle de la psyché. Cette intégration renforce la pertinence de l’outil dans les contextes d’accompagnement et de formation.",
      details:
        "Ce module établit des ponts entre l’Ennéagramme et les typologies jungiennes. Il enrichit la compréhension de la personnalité en croisant les approches et en offrant une lecture multidimensionnelle de la psyché. Cette intégration renforce la pertinence de l’outil dans les contextes d’accompagnement et de formation.",
      icon: <FaGem />,
      price_ht: "3500 MAD",
      price_ttc: "4200 MAD",
      place: "Casablanca",
      date: "À définir",
      prerequis: "V2",
      reference: "V5",
    },
    {
      id: 6,
      title: "Retraite ennéagrammiste",
      duration: "5 JOURS",
      subtitle: PROGRAM_SUBTITLE,
      description:
        "Ce module expérientiel propose une immersion profonde dans le travail intérieur. Il favorise l’intégration corporelle, émotionnelle et symbolique des apprentissages. La retraite permet un ralentissement, une introspection guidée et un ancrage durable des transformations vécues.",
      details:
        "Ce module expérientiel propose une immersion profonde dans le travail intérieur. Il favorise l’intégration corporelle, émotionnelle et symbolique des apprentissages. La retraite permet un ralentissement, une introspection guidée et un ancrage durable des transformations vécues.",
      icon: <FaPrayingHands />,
      price_ht: "3500 MAD",
      price_ttc: "4200 MAD",
      place: "Casablanca",
      date: "À définir",
      prerequis: "D4 – V2 – V3",
      reference: "V6",
    },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await parcoursService.getBySlug("approfondir");
        setParcoursData(data);
        if (data.modules && data.modules.length > 0) {
          setModules(
            data.modules.map((m) => {
              let dates = [];
              if (m.sessions && m.sessions.length > 0) {
                const upcoming = m.sessions.sort(
                  (a, b) => new Date(a.start_date) - new Date(b.start_date)
                );

                dates = upcoming.map((s) => {
                  const d = new Date(s.start_date);
                  const month = d
                    .toLocaleDateString("fr-FR", { month: "short" })
                    .replace(".", "")
                    .toUpperCase();
                  const year = d.getFullYear();
                  return `${month}-${year}`;
                });
              }

              // Safe icon resolution
              let IconComponent = <FaCompass />;
              if (m.icon && FaIcons[m.icon]) {
                IconComponent = React.createElement(FaIcons[m.icon]);
              }

              return {
                ...m,
                icon: IconComponent,
                price_ht: m.price_ht
                  ? `${m.price_ht} MAD`
                  : m.price
                  ? `${m.price} MAD`
                  : null,
                price_ttc: m.price_ttc ? `${m.price_ttc} MAD` : null,
                place: m.place || "Ferme J'nan Lemonie",
                date: dates.length > 0 ? null : "À définir",
                dates: dates,
                horaires: m.horaires || "9h-17h",
              };
            })
          );
        }
      } catch (error) {
        console.error("Failed to load parcours data", error);
      }
    };
    loadData();
  }, []);

  const INCLUDED = [
    "La formation",
    "Le livre sur les 9 bases",
    "Les pauses café",
  ];

  // ---------- THEME ----------
  const C = { white: "#fff", black: "#000", red: "#e13734", blue: "#0a83ca" };

  // Media
  const heroImg = `/assets/imgss001/${encodeURIComponent("coaching (53).jpg")}`;
  const OVERLAY_ALPHA = 0.82;
  const IMAGE_OPACITY = 0.7;

  // ---------- HELPERS ----------
  const card = {
    background: C.white,
    border: "1px solid rgba(0,0,0,0.10)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    height: "100%",
  };
  const pill = (bg, color) => ({
    background: bg,
    color,
    padding: "6px 12px",
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  });
  const btn = (bg, color) => ({
    ...pill(bg, color),
    padding: "10px 16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
  });
  const h1 = { fontWeight: 800, letterSpacing: "-0.3px" };
  const h2 = { fontWeight: 800, letterSpacing: "-0.2px" };

  // ---------- (Optional) header measure leftover ----------
  const headerWrapRef = useRef(null);
  const [headerH, setHeaderH] = useState(0);
  useEffect(() => {
    const measure = () =>
      setHeaderH(
        headerWrapRef.current ? headerWrapRef.current.offsetHeight : 0
      );
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const [heroOk, setHeroOk] = useState(true);

  // ---------- COMPUTED ----------
  const TOTAL_DAYS = modules.reduce((acc, m) => {
    const d = parseInt((m.duration || "0").replace(/\D/g, ""), 10);
    return acc + (isNaN(d) ? 0 : d);
  }, 0); // 2*5 + 5 = 15

  return (
    <main role="main">
      <Seo page="approfondir" path="/approfondir" />
      <div
        className="details-page"
        style={{ background: C.white, color: C.black }}
      >
        {/* preload image */}
        <img
          src={heroImg}
          alt="Préchargement fond atelier Approfondir"
          style={{ display: "none" }}
          onError={() => setHeroOk(false)}
          onLoad={() => setHeroOk(true)}
        />

        {/* ===== Global transitions + hover colors ===== */}
        <style>{`
        :root {
          --c-white: ${C.white};
          --c-black: ${C.black};
          --c-blue: ${C.blue};
          --c-blue-hover: #096fb0;
          --c-blue-active: #065c93;
          --c-red: ${C.red};
          --c-red-hover: #c62f2c;
          --c-red-active: #a82826;
          --shadow-sm: 0 2px 8px rgba(0,0,0,.08);
          --shadow-md: 0 10px 28px rgba(0,0,0,.18);
          --shadow-lg: 0 16px 40px rgba(0,0,0,.22);
          --radius: 16px;
          --ease: cubic-bezier(.2,.7,.2,1);
          --t-fast: .18s var(--ease);
          --t: .25s var(--ease);
        }
        .details-page * {
          transition:
            background-color var(--t),
            color var(--t),
            border-color var(--t),
            box-shadow var(--t),
            transform var(--t),
            opacity var(--t),
            filter var(--t);
        }
        @media (prefers-reduced-motion: reduce) { .details-page * { transition: none !important; } }

        .hover-card { will-change: transform, box-shadow; }
        .hover-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(0,0,0,.14);
        }

        .btn {
          transition:
            transform var(--t-fast),
            box-shadow var(--t),
            background-color var(--t),
            color var(--t),
            border-color var(--t);
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.18); }
        .btn:active { transform: translateY(0); box-shadow: 0 4px 12px rgba(0,0,0,.12); }
        .btn:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 3px; }

        .btn--blue:hover {
          background-color: var(--c-blue) !important;
          color: #fff !important;
          border-color: var(--c-blue) !important;
        }
        .btn--blue:active {
          background-color: var(--c-blue-active) !important;
          border-color: var(--c-blue-active) !important;
        }
        .btn--white-blue { border: 2px solid rgba(10,131,202,.15); }
        .btn--white-blue:hover {
          background-color: var(--c-blue) !important;
          color: #fff !important;
          border-color: var(--c-blue) !important;
        }

        .pill { box-shadow: var(--shadow-sm); }
        .pill:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,.16);
        }

        .details-page a:not(.btn) { color: var(--c-blue); }
        .details-page a:not(.btn):hover { color: var(--c-blue-hover); text-decoration: underline; }

        .hover-card:hover i[class^="fa-"], .hover-card:hover i[class*=" fa-"] {
          color: var(--c-blue);
        }
      `}</style>

        {/* ============ HERO ============ */}
        <section
          style={{
            position: "relative",
            color: C.white,
            padding: "clamp(200px, 20vh, 300px) 0px clamp(140px, 15vh, 220px)",
            overflow: "hidden",
            backgroundColor: heroOk ? "transparent" : C.blue,
          }}
        >
          {heroOk && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url("${heroImg}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: IMAGE_OPACITY,
                zIndex: 0,
              }}
            />
          )}

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(rgba(10,131,202,${OVERLAY_ALPHA}), rgba(10,131,202,${OVERLAY_ALPHA}))`,
              zIndex: 0,
            }}
          />

          <div
            className="container"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div className="row align-items-center">
              <div className="col-lg-10 mx-auto text-center">
                <ParcoursDiagram />
                <div className="mb-2">
                  <span
                    className="pill"
                    style={pill("rgba(255,255,255,0.18)", C.white)}
                  >
                    Cycle – Certificat
                  </span>
                </div>
                <h1
                  className="mb-2"
                  style={{
                    ...h1,
                    color: C.white,
                    textShadow: "0 3px 12px rgba(0,0,0,.35)",
                  }}
                >
                  {PROGRAM_SUBTITLE}
                </h1>
                <p className="mb-4" style={{ color: C.white }}>
                  Six modules pour une exploration profonde des mécanismes,
                  ombres et potentiels.
                </p>

                <div
                  className="d-flex justify-content-center flex-wrap"
                  style={{ gap: 18 }}
                >
                  {[
                    { n: `${modules.length}`, t: "Modules" },
                    { n: `${TOTAL_DAYS}`, t: "Jours" },
                    { n: "100%", t: "Pratique" },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div
                        className="pill"
                        style={{
                          ...pill("rgba(255,255,255,0.12)", C.white),
                          padding: "10px 14px",
                        }}
                      >
                        <span style={{ fontWeight: 800, marginRight: 8 }}>
                          {s.n}
                        </span>
                        <span>{s.t}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section style={{ padding: "56px 0 8px" }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-9 mx-auto text-center">
                <span style={{ color: C.blue, fontWeight: 700 }}>
                  FORMATION COMPLÈTE
                </span>
                <h2 className="mt-1" style={h2}>
                  Programme de Formation en Ennéagramme
                </h2>
                <p className="mt-3" style={{ color: C.black }}>
                  Un parcours d’approfondissement qui conjugue théorie vivante,
                  panels, exercices expérientiels et auto-observation, pour une
                  transformation durable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MODULES */}
        <section style={{ padding: "24px 0 56px" }}>
          <div className="container">
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              {modules.map((m, idx) => (
                <AccordionItem
                  key={m.id}
                  module={m}
                  index={idx}
                  isOpen={openIndex === idx}
                  onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* INFO + PRICING */}
        <section
          style={{ background: "#f7f7f7", padding: "56px 0", display: "none" }}
        >
          <div className="container">
            {/* Row 1: Informations + Lieu */}
            <div className="row g-4 align-items-start">
              {/* LEFT: Informations pratiques */}
              <div className="col-lg-6" style={{ display: "none" }}>
                <span style={{ color: C.red, fontWeight: 700 }}>
                  INFORMATIONS PRATIQUES
                </span>
                <h2 className="mt-1" style={h2}>
                  Ce qui est inclus
                </h2>

                <ul
                  className="mt-3"
                  style={{ paddingLeft: 0, listStyle: "none" }}
                >
                  {["Formation", "Livre 9 bases", "Pauses café"].map((t, i) => (
                    <li
                      key={i}
                      className="d-flex align-items-start"
                      style={{ gap: 10, marginBottom: 8 }}
                    >
                      <FaCheckCircle style={{ color: C.red, marginTop: 2 }} />
                      <span style={{ color: C.black }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RIGHT: Lieu & Horaires */}
              <div className="col-lg-6">
                <div className="hover-card" style={{ ...card, padding: 16 }}>
                  <h4
                    className="mb-2"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <FaMapMarkerAlt style={{ color: C.blue }} />
                    Lieu & Horaires
                  </h4>
                  <p
                    className="mb-1"
                    style={{ fontWeight: 700, color: C.black }}
                  >
                    {parcoursData?.lieu || "Ferme J'nan Lemonie — Sidi Yamani"}
                  </p>
                  <p
                    style={{
                      color: C.black,
                      marginBottom: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaClock style={{ marginRight: 6 }} />
                    {parcoursData?.horaires || "9H – 17H"}
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Pricing cards */}
            <div className="row g-4 mt-4">
              {/* Card 1 */}
              <div className="col-12 col-md-6">
                <div
                  className="hover-card"
                  style={{
                    ...card,
                    position: "relative",
                    paddingTop: 20,
                    paddingBottom: 16,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 12,
                      background: C.red,
                    }}
                  />
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ paddingLeft: 16 }}
                  >
                    <h3 className="mb-1" style={{ fontWeight: 800 }}>
                      Particuliers
                    </h3>
                    <span className="pill" style={pill(C.red, C.white)}>
                      TTC
                    </span>
                  </div>

                  <div
                    style={{
                      margin: "10px 0 14px",
                      padding: "14px 18px",
                      border: "2px dashed rgba(0,0,0,.18)",
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      justifyContent: "center",
                      background: C.white,
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>DH</span>
                    <span
                      style={{
                        fontSize: 40,
                        fontWeight: 800,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {formatPrice(parcoursData?.price ?? "2600")}
                    </span>
                    <span
                      style={{ fontSize: 16, fontWeight: 600, marginLeft: 5 }}
                    >
                      {" "}
                      / Module
                    </span>
                  </div>

                  <ul
                    className="mt-2"
                    style={{ paddingLeft: 0, listStyle: "none" }}
                  >
                    {["Formation", "Livre 9 bases", "Pauses café"].map(
                      (t, i) => (
                        <li
                          key={i}
                          style={{
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <FaCheck style={{ color: C.blue, marginRight: 8 }} />
                          <span style={{ color: C.black }}>{t}</span>
                        </li>
                      )
                    )}
                  </ul>

                  <a
                    href={parcoursData?.cta_link || "/app/#/course/30"}
                    className="btn"
                    style={{
                      ...btn(C.red, C.white),
                      width: "100%",
                      marginTop: 8,
                    }}
                  >
                    S'inscrire maintenant
                  </a>
                </div>
              </div>

              {/* Card 2 */}
              <div className="col-12 col-md-6" style={{ display: "none" }}>
                <div
                  className="hover-card"
                  style={{
                    ...card,
                    position: "relative",
                    paddingTop: 20,
                    paddingBottom: 16,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 12,
                      background: C.blue,
                    }}
                  />
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ paddingLeft: 16 }}
                  >
                    <h3 className="mb-1" style={{ fontWeight: 800 }}>
                      Formateurs & Entreprises
                    </h3>
                    <span className="pill" style={pill(C.blue, C.white)}>
                      HTVA
                    </span>
                  </div>

                  <div
                    style={{
                      margin: "10px 0 14px",
                      padding: "14px 18px",
                      border: "2px dashed rgba(0,0,0,.18)",
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      justifyContent: "center",
                      background: C.white,
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>DH</span>
                    <span
                      style={{
                        fontSize: 40,
                        fontWeight: 800,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {formatPrice(parcoursData?.price_ht ?? "3200")}
                    </span>
                  </div>

                  <ul
                    className="mt-2"
                    style={{ paddingLeft: 0, listStyle: "none" }}
                  >
                    {["Formation", "Livre 9 bases", "Pauses café"].map(
                      (t, i) => (
                        <li
                          key={i}
                          style={{
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <FaCheck style={{ color: C.black, marginRight: 8 }} />
                          <span style={{ color: C.black }}>{t}</span>
                        </li>
                      )
                    )}
                  </ul>

                  <a
                    href={parcoursData?.cta_link || "/app/#/course/30"}
                    className="btn btn--blue"
                    style={{
                      ...btn(C.blue, C.white),
                      width: "100%",
                      marginTop: 8,
                    }}
                  >
                    S'inscrire maintenant
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA + MAP */}
        <section
          style={{
            background: C.white,
            padding: "56px 0",
            position: "relative",
            display: "none",
          }}
        >
          <div className="container">
            <div className="row g-4 align-items-stretch">
              {/* LEFT: PLANNING */}
              <div className="col-12 col-md-6">
                <div
                  className="hover-card"
                  style={{
                    background: C.white,
                    color: C.black,
                    borderRadius: 18,
                    boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    padding: 16,
                    height: "100%",
                  }}
                >
                  <h3
                    className="mb-3"
                    style={{
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <FaCalendarAlt style={{ color: C.blue }} />
                    Planning
                  </h3>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "400px",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src="/assets/imgss001/parcours planing.png"
                      alt="Planning Parcours"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: MAP */}
              <div className="col-12 col-md-6">
                <div
                  className="hover-card"
                  style={{
                    background: C.white,
                    color: C.black,
                    borderRadius: 18,
                    boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    padding: 16,
                    height: "100%",
                  }}
                >
                  <h3
                    className="mb-3"
                    style={{
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <FaMapMarkerAlt style={{ color: C.blue }} />
                    Localisation — {parcoursData?.lieu || "Jnan Lemonie"}
                  </h3>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "400px",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5305.228879516067!2d-6.009267787231853!3d35.347562472582915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0bbf3da3ad8c9f%3A0x73ff61050e168005!2sJnan%20Lemonie!5e1!3m2!1sfr!2sma!4v1756569486248!5m2!1sfr!2sma"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                      }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Jnan Lemonie - Google Map"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Approfondir;
