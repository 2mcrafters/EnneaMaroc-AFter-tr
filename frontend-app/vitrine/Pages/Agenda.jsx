import React, { useState, useEffect, useRef } from "react";
import Seo from "../Components/Seo/Seo";
import { Link } from "react-router-dom";
import { FaLayerGroup, FaArrowRight, FaCircle, FaArrowLeft, FaCheck } from "react-icons/fa";
import { FaCalendarDays, FaPeopleArrows } from "react-icons/fa6";
import { parcoursService } from "../../services/parcoursService";
import { formatPrice } from "../../utils/formatPrice";

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value)
    .replace(/€/g, "")
    .replace(/\bEUR\b/gi, "")
    .replace(/\bMAD\b/gi, "")
    .replace(/[^0-9.,\s-]/g, "")
    .trim();

  if (!s) return 0;

  // Remove spaces as thousands separators then parse
  const normalized = s.replace(/\s+/g, "").replace(",", ".");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
};

const colors = {
  blue: "#ff7d2d",
  deepBlue: "#0776bb",
  red: "#64508d",
  softBlue: "#e8f4fd",
  softWhite: "#f5fbff",
  slate: "#1d1c1a",
  gray: "#5b6a75",
  lightGray: "#dde7f1",
  // parcours brand colors
  teal: "#2d969a",
  purple: "#64508d",
  orange: "#ff7d2d",
};

const PARCOURS_COLORS = ["#2d969a", "#64508d", "#ff7d2d"];
const PARCOURS_GRADIENTS = [
  "linear-gradient(135deg, #2d969a 0%, #1d7275 100%)",
  "linear-gradient(135deg, #64508d 0%, #4e3d73 100%)",
  "linear-gradient(135deg, #ff7d2d 0%, #e06020 100%)",
];
const PARCOURS_SOFT = ["#e0f5f6", "#ede9f7", "#fff0e6"];
const PARCOURS_DARK = ["#1d7275", "#4e3d73", "#e06020"];

const tabLabels = ["Découvrir", "Approfondir", "À la maîtrise"];

const highlights = [
  {
    icon: <FaLayerGroup />,
    title: "3 niveaux certifiants",
    text: "Retrouvez les parcours Découvrir, Approfondir et Transmettre, tels que détaillés sur nos pages dédiées, avec leurs 18 modules cumulés.",
  },
  {
    icon: <FaCalendarDays />,
    title: "Calendrier continu",
    text: "Un planning de 14 mois couvrant chaque module, de novembre à décembre de l’année suivante, directement relié aux données des tableaux ci-dessous.",
  },
  {
    icon: <FaPeopleArrows />,
    title: "Accompagnement sur mesure",
    text: "Construisez des parcours intra-entreprise en combinant les modules des niveaux et les formats décrits sur les pages Solution et École.",
  },
];

// Static fallback – used when the backend API is unreachable
const STATIC_FALLBACK_MONTHS = [
  "nov-25","déc-25","janv-26","fév-26","mars-26","avr-26",
  "mai-26","juin-26","juil-26","août-26","sept-26","oct-26",
  "nov-26","déc-26",
];

const STATIC_FALLBACK_LEVELS = [
  {
    id: "decouvrir",
    title: "Découvrir – Niveau 1",
    route: "/découvrir",
    codePrefix: "D",
    totalDays: 12,
    totalCost: "21 000 MAD",
    modules: [
      {
        code: "D1", reference: "D1",
        name: "Initiation et Découverte",
        days: 2, hours: "9h – 17h", prereq: "Aucun", price: "3 500 MAD",
        sessions: [{ monthLabel:"nov-25", monthKey:"2025-11", start_date:"2025-11-15", end_date:"2025-11-16" }],
      },
      {
        code: "D2", reference: "D2",
        name: "Centres d'intelligence",
        days: 2, hours: "9h – 17h", prereq: "D1", price: "3 500 MAD",
        sessions: [{ monthLabel:"déc-25", monthKey:"2025-12", start_date:"2025-12-13", end_date:"2025-12-14" }],
      },
      {
        code: "D3", reference: "D3",
        name: "Instincts",
        days: 2, hours: "9h – 17h", prereq: "D1", price: "3 500 MAD",
        sessions: [{ monthLabel:"janv-26", monthKey:"2026-01", start_date:"2026-01-17", end_date:"2026-01-18" }],
      },
      {
        code: "D4", reference: "D4",
        name: "Lumière : Conscience claire de nos mécanismes inconscients",
        days: 2, hours: "9h – 17h", prereq: "D2 – D3", price: "3 500 MAD",
        sessions: [{ monthLabel:"fév-26", monthKey:"2026-02", start_date:"2026-02-14", end_date:"2026-02-15" }],
      },
      {
        code: "D5", reference: "D5",
        name: "Ombre : Se libérer des fardeaux de l'ego",
        days: 2, hours: "9h – 17h", prereq: "D3", price: "3 500 MAD",
        sessions: [{ monthLabel:"mars-26", monthKey:"2026-03", start_date:"2026-03-14", end_date:"2026-03-15" }],
      },
      {
        code: "D6", reference: "D6",
        name: "Profondeur : Être autonome dans le chemin d'évolution",
        days: 2, hours: "9h – 17h", prereq: "D3", price: "3 500 MAD",
        sessions: [{ monthLabel:"avr-26", monthKey:"2026-04", start_date:"2026-04-18", end_date:"2026-04-19" }],
      },
    ],
  },
  {
    id: "approfondir",
    title: "Approfondir – Niveau 2",
    route: "/approfondir",
    codePrefix: "V",
    totalDays: 15,
    totalCost: "21 000 MAD",
    modules: [
      {
        code: "V1", reference: "V1",
        name: "Ressemblance et confusion",
        days: 2, hours: "9h – 17h", prereq: "Niveau D", price: "3 500 MAD",
        sessions: [{ monthLabel:"nov-25", monthKey:"2025-11", start_date:"2025-11-22", end_date:"2025-11-23" }],
      },
      {
        code: "V2", reference: "V2",
        name: "Relations en Ennéagramme",
        days: 2, hours: "9h – 17h", prereq: "V1", price: "3 500 MAD",
        sessions: [{ monthLabel:"janv-26", monthKey:"2026-01", start_date:"2026-01-24", end_date:"2026-01-25" }],
      },
      {
        code: "V3", reference: "V3",
        name: "Pathologie et ombres",
        days: 2, hours: "9h – 17h", prereq: "V1", price: "3 500 MAD",
        sessions: [{ monthLabel:"fév-26", monthKey:"2026-02", start_date:"2026-02-21", end_date:"2026-02-22" }],
      },
      {
        code: "V4", reference: "V4",
        name: "Grand Panel & pistes de développement",
        days: 2, hours: "9h – 17h", prereq: "V2 – V3", price: "3 500 MAD",
        sessions: [{ monthLabel:"mars-26", monthKey:"2026-03", start_date:"2026-03-21", end_date:"2026-03-22" }],
      },
      {
        code: "V5", reference: "V5",
        name: "Intégration : Ennéagramme et profils jungiens",
        days: 2, hours: "9h – 17h", prereq: "V2", price: "3 500 MAD",
        sessions: [{ monthLabel:"mai-26", monthKey:"2026-05", start_date:"2026-05-16", end_date:"2026-05-17" }],
      },
      {
        code: "V6", reference: "V6",
        name: "Retraite ennéagrammiste",
        days: 5, hours: "9h – 17h", prereq: "D4 – V2 – V3", price: "3 500 MAD",
        sessions: [{ monthLabel:"juin-26", monthKey:"2026-06", start_date:"2026-06-15", end_date:"2026-06-19" }],
      },
    ],
  },
  {
    id: "transmettre",
    title: "À la maîtrise – Niveau 3",
    route: "/transmettre",
    codePrefix: "M",
    totalDays: 20,
    totalCost: "26 000 MAD",
    modules: [
      {
        code: "M1", reference: "M1",
        name: "Conduite et animation de panels",
        days: 3, hours: "9h – 17h", prereq: "Niveau V", price: "4 000 MAD",
        sessions: [{ monthLabel:"déc-25", monthKey:"2025-12", start_date:"2025-12-20", end_date:"2025-12-22" }],
      },
      {
        code: "M2", reference: "M2",
        name: "Devenir profileur : Processus de l'entretien typologique",
        days: 3, hours: "9h – 17h", prereq: "M1", price: "4 000 MAD",
        sessions: [{ monthLabel:"fév-26", monthKey:"2026-02", start_date:"2026-02-28", end_date:"2026-03-02" }],
      },
      {
        code: "M3", reference: "M3",
        name: "Superviser, co-développer : 5 cas pratiques filmés",
        days: 3, hours: "9h – 17h", prereq: "M2", price: "4 000 MAD",
        sessions: [{ monthLabel:"avr-26", monthKey:"2026-04", start_date:"2026-04-25", end_date:"2026-04-27" }],
      },
      {
        code: "M4", reference: "M4",
        name: "En croisant l'Ennéagramme et la thérapie brève",
        days: 3, hours: "9h – 17h", prereq: "D – V", price: "4 000 MAD",
        sessions: [{ monthLabel:"juin-26", monthKey:"2026-06", start_date:"2026-06-27", end_date:"2026-06-29" }],
      },
      {
        code: "M5", reference: "M5",
        name: "Certification à la méthode Ennea-Pro HRH",
        days: 3, hours: "9h – 17h", prereq: "M2 – M4", price: "4 000 MAD",
        sessions: [{ monthLabel:"sept-26", monthKey:"2026-09", start_date:"2026-09-12", end_date:"2026-09-14" }],
      },
      {
        code: "M6", reference: "M6",
        name: "Projet : Ancrer une approche adaptée à son public avec soutenance",
        days: 5, hours: "9h – 17h", prereq: "M4", price: "6 000 MAD",
        sessions: [{ monthLabel:"nov-26", monthKey:"2026-11", start_date:"2026-11-07", end_date:"2026-11-11" }],
      },
    ],
  },
];

function Agenda() {
  const [scheduleLevels, setScheduleLevels] = useState([]);
  const [agendaMonths, setAgendaMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [editingHeaderIndex, setEditingHeaderIndex] = useState(null);
  const tableScrollRef = useRef(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    const fetchData = async () => {
      // Use static fallback data directly (backend not available in this environment)
      setScheduleLevels(STATIC_FALLBACK_LEVELS);
      setAgendaMonths(STATIC_FALLBACK_MONTHS);
      setViewStartDate(new Date(2025, 10, 1)); // November 2025
      setLoading(false);
    };
    fetchData();
  }, []);

  // Regenerate agendaMonths whenever the viewStartDate changes (prev/next or header edit)
  useEffect(() => {
    const monthsList = [];
    const monthNames = [
      "janv",
      "fév",
      "mars",
      "avr",
      "mai",
      "juin",
      "juil",
      "août",
      "sept",
      "oct",
      "nov",
      "déc",
    ];
    for (let i = 0; i < 14; i++) {
      const d = new Date(
        viewStartDate.getFullYear(),
        viewStartDate.getMonth() + i,
        1
      );
      monthsList.push(
        `${monthNames[d.getMonth()]}-${d.getFullYear().toString().slice(2)}`
      );
    }
    setAgendaMonths(monthsList);
  }, [viewStartDate]);

  const handlePrevDate = () => {
    const d = new Date(viewStartDate);
    d.setMonth(d.getMonth() - 1);
    setViewStartDate(d);
  };

  const handleNextDate = () => {
    const d = new Date(viewStartDate);
    d.setMonth(d.getMonth() + 1);
    setViewStartDate(d);
  };

  const handleHeaderDateChange = (index, dateValue) => {
    if (!dateValue) return;
    const [year, month] = dateValue.split("-").map(Number);
    // Make the selected header (index) match the chosen month by adjusting viewStartDate
    const newStart = new Date(year, month - 1 - index, 1);
    setViewStartDate(newStart);
    setEditingHeaderIndex(null);
  };

  const handlePointerDown = (event) => {
    if (!tableScrollRef.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragState.current.isDown = true;
    dragState.current.startX = event.clientX;
    dragState.current.scrollLeft = tableScrollRef.current.scrollLeft;
    tableScrollRef.current.style.cursor = "grabbing";
    tableScrollRef.current.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragState.current.isDown || !tableScrollRef.current) return;
    event.preventDefault();
    const walk = event.clientX - dragState.current.startX;
    tableScrollRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handlePointerUp = (event) => {
    if (!dragState.current.isDown || !tableScrollRef.current) return;
    dragState.current.isDown = false;
    tableScrollRef.current.style.cursor = "grab";
    tableScrollRef.current.releasePointerCapture?.(event.pointerId);
  };

  const [activeTab, setActiveTab] = React.useState(0);

  const levelRoutes = ["/découvrir", "/approfondir", "/transmettre"];

  const levelMeta = scheduleLevels.map((level, index) => {
    const moduleCount = level.modules.length;
    const firstCode = level.modules[0]?.reference ?? "";
    const lastCode =
      level.modules[level.modules.length - 1]?.reference ?? firstCode;
    const uniqueDurations = Array.from(
      new Set(level.modules.map((module) => module.days))
    ).sort((a, b) => a - b);

    return {
      index,
      label: tabLabels[index] ?? level.title,
      modules: moduleCount,
      totalDays: level.totalDays,
      totalCost: level.totalCost,
      codeRange:
        firstCode === lastCode ? firstCode : `${firstCode} – ${lastCode}`,
      durationsLabel: uniqueDurations
        .map((day) => `${day} jour${day > 1 ? "s" : ""}`)
        .join(" • "),
      route: levelRoutes[index] ?? "/agenda",
    };
  });

  const thematicTracks = levelMeta.map((meta) => ({
    title: scheduleLevels[meta.index]?.title ?? meta.label,
    slots: [
      `${meta.modules} modules du ${meta.codeRange}`,
      `${meta.totalDays} jours cumulés (${meta.durationsLabel})`,
      `Investissement indicatif : ${meta.totalCost}`,
    ],
    route: meta.route,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7d2d]"></div>
      </div>
    );
  }

  return (
    <main role="main">
      <Seo page="agenda" path="/agenda" />
      <div style={{ fontFamily: "system-ui, sans-serif", color: colors.slate }}>
        <style>
          {`
          @media (max-width: 768px) {
            .hero-section {
              padding: 100px 15px 60px !important;
            }
            .hero-title {
              font-size: 32px !important;
              line-height: 1.2 !important;
            }
            .hero-description {
              font-size: 16px !important;
            }
            .hero-buttons {
              flex-direction: column !important;
              width: 100%;
            }
            .hero-buttons a {
              width: 100% !important;
              justify-content: center !important;
            }
            .section-title {
              font-size: 28px !important;
            }
            .highlight-cards {
              padding: 24px 20px !important;
            }
            .level-header {
              padding: 16px 20px !important;
            }
            .level-title {
              font-size: 18px !important;
              flex: 1 1 100% !important;
            }
            .level-info {
              flex: 1 1 100% !important;
              justify-content: flex-start !important;
            }
            .tab-button {
              padding: 12px 20px !important;
              font-size: 12px !important;
            }
            .tab-button-text {
              font-size: 12px !important;
            }
            .nav-button {
              min-width: 140px !important;
              padding: 12px 20px !important;
              font-size: 12px !important;
            }
            .nav-text-full {
              display: none !important;
            }
            .nav-text-short {
              display: inline !important;
            }
            .thematic-card {
              padding: 24px 20px !important;
            }
            .thematic-title {
              font-size: 18px !important;
            }
          }
          
          @media (min-width: 769px) {
            .nav-text-full {
              display: inline !important;
            }
            .nav-text-short {
              display: none !important;
            }
          }
          
          @media (max-width: 480px) {
            .hero-section {
              padding: 80px 10px 40px !important;
            }
            .hero-title {
              font-size: 28px !important;
            }
            .tab-separator {
              display: none !important;
            }
            .level-header {
              padding: 12px 16px !important;
            }
            .level-title {
              font-size: 16px !important;
            }
            .nav-button {
              min-width: 120px !important;
              padding: 10px 16px !important;
            }
          }
        `}
        </style>
        <style>{`
          .agenda-hero {
            padding: clamp(240px, 28vh, 360px) 20px clamp(90px, 13vh, 130px);
            background-image: linear-gradient(rgba(100, 80, 141, 0.88), rgba(100, 80, 141, 0.9)), url('/assets/imgss001/freid (2).jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            color: #fff;
            min-height: 520px;
          }
          @media (max-width: 768px) {
            .agenda-hero { padding-top: 340px; padding-bottom: 130px; min-height: 560px; }
            .table-scroll-hint { display: block; }
          }
        `}</style>
        <section className="hero-section agenda-hero">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-lg-9">
                <h1
                  className="hero-title"
                  style={{
                    margin: "26px 0 20px",
                    fontSize: "clamp(28px, 6vw, 56px)",
                    fontWeight: 600,
                    flexWrap: "wrap",
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  Calendrier des parcours EnnéaMaroc
                </h1>
                <p
                  className="hero-description"
                  style={{
                    margin: "0 auto 38px",
                    maxWidth: "550px",
                    fontSize: "16px",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.92)",
                    textAlign: "justify",
                    textAlignLast: "center",
                  }}
                >
                  Explorez en un coup d'oeil les dates confirmées pour nos
                  parcours certifiants. Chaque niveau renvoie vers les contenus
                  détaillés des pages Découvrir, Approfondir et Transmettre.
                </p>
                <div
                  className="hero-buttons"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to="/découvrir"
                    style={{
                      border: "2px solid rgba(255,255,255,0.6)",
                      color: "#fff",
                      padding: "16px 36px",
                      borderRadius: 10,
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    Voir le détail des niveaux
                    <FaLayerGroup />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "80px 20px", background: colors.softWhite }}>
          <div className="container">
            <div className="row text-center mb-5">
              <div className="col-lg-10 mx-auto">
                <h2
                  className="section-title"
                  style={{
                    fontSize: "clamp(28px, 5vw, 36px)",
                    fontWeight: 800,
                    color: colors.blue,
                    marginBottom: 12,
                  }}
                >
                  Les essentiels du calendrier des niveaux
                </h2>
                <p
                  style={{
                    fontSize: "clamp(16px, 3vw, 18px)",
                    color: colors.gray,
                    margin: "0 auto",
                    maxWidth: 760,
                    textAlign: "justify",
                    textAlignLast: "justify",
                  }}
                >
                  Une lecture synthétique des niveaux Découvrir, Approfondir et
                  Transmettre, fidèle aux contenus des pages programmes et aux
                  données chiffrées des tableaux qui suivent.
                </p>
              </div>
            </div>
            <div className="row g-4">
              {highlights.map((item, hi) => (
                <div key={item.title} className="col-lg-4 col-md-6">
                  <div
                    className="highlight-cards"
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: "36px 30px",
                      height: "100%",
                      boxShadow: "0 18px 45px rgba(8, 68, 120, 0.08)",
                      borderTop: `3px solid ${PARCOURS_COLORS[hi]}`,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 14,
                        background: `${PARCOURS_COLORS[hi]}18`,
                        color: PARCOURS_COLORS[hi],
                        fontSize: 26,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 18,
                      }}
                    >
                      {item.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 15,
                        color: colors.gray,
                        lineHeight: 1.7,
                        textAlign: "justify",
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "80px 20px", background: colors.softWhite }}>
          <div className="container">
            <div className="row mb-5">
              <div className="col-lg-9">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 18px",
                    borderRadius: 999,
                    background: colors.softBlue,
                    color: colors.blue,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Parcours certifiants
                </div>
                <h2
                  className="section-title"
                  style={{
                    fontSize: "clamp(28px, 5vw, 36px)",
                    fontWeight: 800,
                    margin: "0 0 14px",
                    color: colors.blue,
                  }}
                >
                  Calendrier 2025 – 2026 par niveaux
                </h2>
                <p
                  style={{
                    maxWidth: "850px",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: colors.gray,
                    marginBottom: 12,
                    textAlign: "justify",
                    textAlignLast: "justify",
                  }}
                >
                  Les tableaux ci-dessous reprennent les modules issus des
                  niveaux Découvrir, Approfondir et Transmettre. Ils peuvent
                  être affichés sur mobile&nbsp;: faites simplement glisser
                  horizontalement pour consulter toutes les dates proposées.
                </p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div style={{ marginBottom: 48 }}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flexWrap: "wrap",
                }}
                className="tabs-container"
              >
                {scheduleLevels.map((level, index) => {
                  const tabColor = PARCOURS_COLORS[index] || colors.blue;
                  return (
                    <React.Fragment key={level.id}>
                      <button
                        onClick={() => setActiveTab(index)}
                        className="tab-button"
                        style={{
                          padding: "16px 32px",
                          background:
                            activeTab === index
                              ? tabColor
                              : "#fff",
                          border:
                            activeTab === index
                              ? `2px solid ${tabColor}`
                              : `2px solid ${colors.lightGray}`,
                          borderRadius: 8,
                          color: activeTab === index ? "#fff" : colors.slate,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          transition: "all 0.3s ease",
                          boxShadow:
                            activeTab === index
                              ? `0 4px 16px ${tabColor}40`
                              : "0 2px 6px rgba(0, 0, 0, 0.06)",
                          transform:
                            activeTab === index ? "translateY(-1px)" : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (activeTab !== index) {
                            e.currentTarget.style.borderColor = colors.blue;
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.boxShadow =
                              "0 3px 12px rgba(10, 131, 202, 0.15)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeTab !== index) {
                            e.currentTarget.style.borderColor =
                              colors.lightGray;
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow =
                              "0 2px 6px rgba(0, 0, 0, 0.06)";
                          }
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span
                            className="tab-button-text"
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              opacity: 0.85,
                            }}
                          >
                            Niveau {index + 1}
                          </span>
                          <span
                            className="tab-button-text"
                            style={{ fontSize: 14, fontWeight: 500 }}
                          >
                            {tabLabels[index]}
                          </span>
                        </div>
                      </button>
                      {index < scheduleLevels.length - 1 && (
                        <FaCircle
                          className="tab-separator"
                          style={{
                            color: colors.lightGray,
                            fontSize: 6,
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {scheduleLevels.map((level, index) => {
              if (activeTab !== index) return null;
              const tabColor = PARCOURS_COLORS[index] || "#2d969a";
              const tabGradient = PARCOURS_GRADIENTS[index] || PARCOURS_GRADIENTS[0];
              const tabSoft = PARCOURS_SOFT[index] || "#e0f5f6";
              const tabDark = PARCOURS_DARK[index] || "#1d7275";
              return (
                <div
                  id={level.id}
                  key={level.id}
                  style={{
                    marginBottom: 64,
                    animation: "fadeIn 0.4s ease-in",
                  }}
                >
                  <div
                    className="level-header"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 18,
                      alignItems: "baseline",
                      marginBottom: 24,
                      padding: "20px 24px",
                      background: tabGradient,
                      borderRadius: 14,
                      border: `1px solid ${tabDark}55`,
                      boxShadow: `0 6px 20px ${tabColor}33`,
                    }}
                  >
                    <h3
                      className="level-title"
                      style={{
                        margin: 0,
                        fontSize: "clamp(18px, 4vw, 22px)",
                        fontWeight: 800,
                        color: "#fff",
                        flex: "1 1 340px",
                      }}
                    >
                      {level.title}
                    </h3>
                    <div
                      className="level-info"
                      style={{
                        display: "flex",
                        gap: 20,
                        fontSize: 14,
                        color: "#fff",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <FaCalendarDays style={{ color: "#fff" }} />
                        <strong style={{ color: "#fff" }}>
                          {level.totalDays} jours
                        </strong>
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <strong style={{ color: "#fff" }}>
                          {level.totalCost}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={handlePrevDate}
                      className="nav-button"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: `1px solid ${colors.lightGray}`,
                        background: "#fff",
                      }}
                    >
                      ◀︎ Préc.
                    </button>
                    <button
                      type="button"
                      onClick={handleNextDate}
                      className="nav-button"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: `1px solid ${colors.lightGray}`,
                        background: "#fff",
                      }}
                    >
                      Suiv. ▶︎
                    </button>
                  </div>

                  <div
                    ref={tableScrollRef}
                    className="table-scroll-wrapper"
                    style={{
                      overflowX: "auto",
                      WebkitOverflowScrolling: "touch",
                      touchAction: "pan-x pinch-zoom",
                      overscrollBehaviorX: "contain",
                      borderRadius: 18,
                      boxShadow: "0 18px 40px rgba(9, 83, 143, 0.08)",
                      background: "#fff",
                      border: `1px solid ${colors.lightGray}`,
                      maxWidth: "100%",
                      paddingBottom: 6,
                      cursor: "grab",
                      userSelect: "none",
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  >
                    <div
                      className="table-scroll-hint"
                      style={{
                        display: "none",
                        fontSize: 13,
                        color: colors.blue,
                        padding: "0 14px 6px",
                        fontWeight: 600,
                      }}
                    >
                      Glissez horizontalement pour voir toutes les colonnes →
                    </div>

                    <table
                      style={{
                        width: "100%",
                        minWidth: 1200,
                        borderCollapse: "separate",
                        borderSpacing: 0,
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            "SESSION",
                            "JOURS",
                            "HORAIRES",
                            "PRÉREQUIS",
                            "TARIF",
                            ...agendaMonths,
                          ].map((header, idx) => {
                            // compute the real date for this header from viewStartDate
                            const headerDate = new Date(
                              viewStartDate.getFullYear(),
                              viewStartDate.getMonth() + idx,
                              1
                            );
                            const headerKey = `${headerDate.getFullYear()}-${String(
                              headerDate.getMonth() + 1
                            ).padStart(2, "0")}`;
                            return (
                              <th
                                key={headerKey}
                                style={{
                                  background:
                                    idx === 0 ? tabColor : tabSoft,
                                  color: idx === 0 ? "#fff" : tabDark,
                                  fontSize: idx === 0 ? 13 : 11,
                                  fontWeight: 700,
                                  letterSpacing: "0.08em",
                                  textTransform: "uppercase",
                                  padding:
                                    idx === 0 ? "16px 20px" : "12px 14px",
                                  borderBottom: `1px solid ${colors.lightGray}`,
                                  borderRight: `1px solid ${colors.lightGray}`,
                                  whiteSpace: "nowrap",
                                  textAlign: idx === 0 ? "left" : "center",
                                  minWidth: idx === 0 ? 260 : idx < 5 ? 90 : 80,
                                }}
                              >
                                {editingHeaderIndex === idx ? (
                                  <input
                                    type="month"
                                    className="w-full text-xs p-1 border rounded"
                                    value={`${headerDate.getFullYear()}-${String(
                                      headerDate.getMonth() + 1
                                    ).padStart(2, "0")}`}
                                    onChange={(e) =>
                                      handleHeaderDateChange(
                                        idx,
                                        e.target.value
                                      )
                                    }
                                    onBlur={() => setEditingHeaderIndex(null)}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <span
                                    onClick={() => setEditingHeaderIndex(idx)}
                                    className="cursor-pointer hover:text-[#ff7d2d] hover:underline block w-full h-full"
                                    title="Cliquez pour changer le mois"
                                  >
                                    {header}
                                  </span>
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {level.modules.map((module, idx) => (
                          <tr key={module.code}>
                            <td
                              style={{
                                padding: "18px 20px",
                                borderRight: `2px solid ${colors.lightGray}`,
                                borderBottom: `1px solid ${colors.lightGray}`,
                                minWidth: 260,
                                textAlign: "left",
                                color: colors.slate,
                                fontWeight: 600,
                                background: "#fff",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 12,
                                  color: tabColor,
                                  marginBottom: 8,
                                  fontWeight: 700,
                                  letterSpacing: "0.08em",
                                }}
                              >
                                {module.reference
                                  ? `${module.reference}`
                                  : `Module ${idx + 1}`}{" "}
                                {module.subtitle ? ` • ${module.subtitle}` : ""}
                              </div>
                              <div
                                style={{
                                  fontSize: 15,
                                  fontWeight: 700,
                                  lineHeight: 1.4,
                                  marginBottom: 4,
                                }}
                              >
                                {module.name}
                              </div>
                            </td>
                            {[
                              module.days,
                              module.hours,
                              module.prereq,
                              module.price,
                            ].map((value, index) => (
                              <td
                                key={`${module.code}-meta-${index}`}
                                style={{
                                  padding: "16px 14px",
                                  borderRight: `1px solid ${colors.lightGray}`,
                                  borderBottom: `1px solid ${colors.lightGray}`,
                                  fontSize: 13,
                                  color: colors.gray,
                                  textAlign: "center",
                                  whiteSpace: "nowrap",
                                  fontWeight:
                                    index === 0 || index === 3 ? 700 : 400,
                                  background:
                                    index === 3 ? colors.softBlue : "#fff",
                                }}
                              >
                                {value}
                              </td>
                            ))}
                            {agendaMonths.map((month, idx) => {
                              // Calculate the key for this column based on viewStartDate + index
                              const colDate = new Date(
                                viewStartDate.getFullYear(),
                                viewStartDate.getMonth() + idx,
                                1
                              );
                              const colKey = `${colDate.getFullYear()}-${String(
                                colDate.getMonth() + 1
                              ).padStart(2, "0")}`;

                              // Find session matching this column
                              const session = module.sessions.find(
                                (s) => s.monthKey === colKey
                              );
                              const hasSession = !!session;

                              return (
                                <td
                                  key={`${module.code}-${colKey}`}
                                  style={{
                                    padding: "14px 12px",
                                    borderRight: `1px solid ${colors.lightGray}`,
                                    borderBottom: `1px solid ${colors.lightGray}`,
                                    background: hasSession
                                      ? `${tabColor}33`
                                      : "#fff",
                                    color: hasSession ? tabColor : "#ddd",
                                    fontWeight: hasSession ? 700 : 400,
                                    textAlign: "center",
                                    fontSize: 16,
                                    minWidth: 80,
                                    whiteSpace: "nowrap",
                                    cursor: hasSession ? "pointer" : "default",
                                  }}
                                  title={
                                    hasSession
                                      ? `Session du ${new Date(
                                          session.start_date
                                        ).toLocaleDateString()} au ${new Date(
                                          session.end_date
                                        ).toLocaleDateString()}`
                                      : ""
                                  }
                                  onClick={() => {
                                    if (hasSession) {
                                      console.log("Selected session:", session);
                                      // TODO: Navigate to subscription or open modal
                                    }
                                  }}
                                >
                                  {hasSession ? "✓" : "—"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            colSpan={5 + agendaMonths.length}
                            style={{
                              padding: "20px",
                              borderTop: `2px solid ${colors.lightGray}`,
                              background: "#fff",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                padding: "16px 20px",
                                background: tabSoft,
                                borderRadius: 12,
                                border: `1px solid ${tabColor}44`,
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: colors.slate,
                                    marginBottom: 4,
                                  }}
                                >
                                  <strong style={{ color: tabColor }}>
                                    Parcours complet
                                  </strong>
                                  &nbsp;: {level.totalDays} jours –{" "}
                                  <span style={{ color: tabDark }}>
                                    {level.totalCost}
                                  </span>
                                </div>
                                <div
                                  style={{ fontSize: 13, color: colors.gray }}
                                >
                                  Planning modulable sur demande (intra ou
                                  inter-entreprises).
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div
                    className="agenda-level-navigation"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "nowrap",
                      marginTop: 24,
                      width: "100%",
                      overflowX: "auto",
                      paddingBottom: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab(Math.max(index - 1, 0))}
                      disabled={index === 0}
                      className="nav-button"
                      style={{
                        flex: "0 0 auto",
                        padding: "14px 28px",
                        borderRadius: 12,
                        border: `2px solid ${tabColor}`,
                        background:
                          index === 0 ? `${tabColor}14` : "#fff",
                        color:
                          index === 0 ? `${tabColor}66` : tabColor,
                        fontSize: 14,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: index === 0 ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        minWidth: 180,
                        transition: "all 0.3s ease",
                        boxShadow:
                          index === 0
                            ? "none"
                            : `0 8px 20px ${tabColor}26`,
                      }}
                      aria-label="Voir le niveau précédent"
                    >
                      <FaArrowLeft />
                      <span className="nav-text-full">Niveau précédent</span>
                      <span className="nav-text-short">Précédent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          Math.min(index + 1, scheduleLevels.length - 1)
                        )
                      }
                      disabled={index === scheduleLevels.length - 1}
                      className="nav-button"
                      style={{
                        flex: "0 0 auto",
                        padding: "14px 28px",
                        borderRadius: 12,
                        border:
                          index === scheduleLevels.length - 1
                            ? `2px solid ${tabColor}33`
                            : "2px solid transparent",
                        background:
                          index === scheduleLevels.length - 1
                            ? `${tabColor}26`
                            : tabGradient,
                        color:
                          index === scheduleLevels.length - 1
                            ? "rgba(255,255,255,0.7)"
                            : "#fff",
                        fontSize: 14,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor:
                          index === scheduleLevels.length - 1
                            ? "not-allowed"
                            : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        minWidth: 180,
                        transition: "all 0.3s ease",
                        boxShadow:
                          index === scheduleLevels.length - 1
                            ? "none"
                            : `0 10px 24px ${tabColor}4d`,
                      }}
                      aria-label="Voir le niveau suivant"
                    >
                      <span className="nav-text-full">Niveau suivant</span>
                      <span className="nav-text-short">Suivant</span>
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <style>
            {`
            /* Bold red scrollbar styling */
            .table-scroll-wrapper::-webkit-scrollbar {
              height: 14px;
            }
            
            .table-scroll-wrapper::-webkit-scrollbar-track {
              background: rgba(225, 55, 52, 0.15);
              border-radius: 8px;
            }
            
            .table-scroll-wrapper::-webkit-scrollbar-thumb {
              background: #64508d;
              border-radius: 8px;
              border: 3px solid rgba(255, 255, 255, 0.4);
            }
            
            .table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
              background: #4e3a72;
            }
            
            /* Firefox */
            .table-scroll-wrapper {
              scrollbar-width: auto;
              scrollbar-color: #64508d rgba(225, 55, 52, 0.15);
            }

            /* Mobile center tabs */
            @media (max-width: 768px) {
              .tabs-container {
                justify-content: center !important;
              }
              .agenda-level-navigation {
                justify-content: flex-start !important;
              }
            }

            @media (max-width: 568px) {
              .agenda-level-navigation button {
                padding: 12px 20px !important;
                min-width: 150px !important;
                font-size: 12px !important;
                border-radius: 10px !important;
              }
            }
          `}
          </style>
        </section>

        <section
          style={{
            padding: "100px 20px",
            background: "linear-gradient(135deg, #ff7d2d 0%, #d95e14 100%)",
          }}
        >
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-lg-8">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  Parcours thématiques
                </div>
                <h2
                  className="section-title"
                  style={{
                    fontSize: "clamp(28px, 5vw, 34px)",
                    fontWeight: 800,
                    margin: "18px 0 12px",
                    color: "#fff",
                  }}
                >
                  Des trajectoires pour chaque public
                </h2>
                <p
                  style={{
                    maxWidth: "850px",
                    margin: "0 auto",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "14px",
                    textAlign: "justify",
                    textAlignLast: "justify",
                  }}
                >
                  Ces cartes reprennent les grandes lignes des niveaux présentés
                  dans les pages Découvrir, Approfondir et Transmettre. Elles
                  vous aident à sélectionner rapidement le bloc le plus adapté à
                  vos équipes.
                </p>
              </div>
            </div>

            <div className="row g-4">
              {thematicTracks.map((track, ti) => {
                const tc = PARCOURS_COLORS[ti] || colors.blue;
                return (
                <div key={track.title} className="col-lg-4 col-md-6">
                  <div
                    className="thematic-card"
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: "32px 28px",
                      boxShadow: "0 24px 46px rgba(5, 46, 82, 0.18)",
                      borderTop: `3px solid ${tc}`,
                      height: "100%",
                    }}
                  >
                    <h3
                      className="thematic-title"
                      style={{
                        fontSize: "clamp(18px, 4vw, 20px)",
                        fontWeight: 800,
                        color: tc,
                        marginBottom: 20,
                      }}
                    >
                      {track.title}
                    </h3>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "grid",
                        gap: 14,
                      }}
                    >
                      {track.slots.map((slot) => (
                        <li
                          key={slot}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            color: colors.gray,
                          }}
                        >
                          <span
                            style={{
                              color: tc,
                              fontSize: 16,
                              marginTop: 2,
                            }}
                          >
                            •
                          </span>
                          <span
                            style={{ lineHeight: 1.6, textAlign: "justify" }}
                          >
                            {slot}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={track.route}
                      style={{
                        marginTop: 20,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        fontWeight: 700,
                        color: tc,
                        textDecoration: "none",
                      }}
                    >
                      Consulter la page programme
                      <FaArrowRight />
                    </Link>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          style={{
            position: "relative",
            padding: "96px 20px",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          <div className="container" style={{ position: "relative" }}>
            <div
              style={{
                background: colors.softBlue,
                border: `1px solid ${colors.lightGray}`,
                borderRadius: 24,
                padding: "48px 40px",
                boxShadow: "0 24px 56px rgba(11, 83, 135, 0.08)",
              }}
            >
              <div className="row align-items-center g-4">
                <div className="col-lg-7">
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 18px",
                      borderRadius: 999,
                      background: "#fff",
                      border: `1px solid ${colors.lightGray}`,
                      color: colors.blue,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      marginBottom: 18,
                    }}
                  >
                    Sur mesure
                  </div>
                  <h2
                    style={{
                      fontSize: "clamp(30px, 5vw, 44px)",
                      fontWeight: 600,
                      color: colors.blue,
                      lineHeight: 1.15,
                      marginBottom: 20,
                    }}
                  >
                    Co-construisons votre calendrier privilégié EnnéaMaroc
                  </h2>
                  <p
                    style={{
                      fontSize: 17,
                      lineHeight: 1.7,
                      color: colors.gray,
                      marginBottom: 24,
                      textAlign: "justify",
                    }}
                  >
                    Privatisation de panels, modules in situ, formats hybrides :
                    nous réglons chaque étape pour vos équipes.
                  </p>
                  <div
                    style={{ display: "grid", gap: 12, color: colors.slate }}
                  >
                    {[
                      "Sélection de dates adaptées à vos contraintes",
                      "Animations co-brandées avec vos directions internes",
                      "Support logistique et coaching de vos intervenants",
                    ].map((item) => (
                      <div
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "#fff",
                            border: `1px solid ${colors.lightGray}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaCheck style={{ color: colors.blue }} />
                        </span>
                        <span
                          style={{
                            fontSize: 15,
                            lineHeight: 1.5,
                            textAlign: "justify",
                          }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-lg-5">
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 20,
                      padding: "36px 32px",
                      boxShadow: "0 30px 60px rgba(6, 52, 92, 0.25)",
                      color: colors.slate,
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 16px",
                        borderRadius: 999,
                        background: colors.softBlue,
                        color: colors.blue,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        marginBottom: 18,
                      }}
                    >
                      Exemple d'accompagnement
                    </div>
                    <h3
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        marginBottom: 14,
                      }}
                    >
                      Programme corporate clé en main
                    </h3>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "grid",
                        gap: 12,
                        color: colors.gray,
                        fontSize: 14,
                      }}
                    >
                      {[
                        "Audition des enjeux et cadrage des objectifs",
                        "Design des séquences Découvrir / Approfondir / Transmettre",
                        "Pilotage des invitations et reporting post-session",
                      ].map((step) => (
                        <li key={step} style={{ display: "flex", gap: 10 }}>
                          <span style={{ color: colors.blue }}>•</span>
                          <span
                            style={{ lineHeight: 1.6, textAlign: "justify" }}
                          >
                            {step}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/contact"
                      style={{
                        marginTop: 28,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "14px 28px",
                        borderRadius: 10,
                        background: colors.blue,
                        color: "#fff",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Planifier un échange
                      <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Agenda;
