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
  blue: "#0a83ca",
  deepBlue: "#0776bb",
  red: "#e13734",
  softBlue: "#e8f4fd",
  softWhite: "#f5fbff",
  slate: "#1d1c1a",
  gray: "#5b6a75",
  lightGray: "#dde7f1",
};

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

// Static data moved to backend
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
      try {
        const data = await parcoursService.getAll();

        // Calculate dynamic months range from data
        let minDate = new Date();
        let maxDate = new Date();
        let hasDates = false;

        const allSessions = [];
        data.forEach((p) => {
          p.modules.forEach((m) => {
            if (m.sessions) {
              m.sessions.forEach((s) => {
                allSessions.push(new Date(s.start_date));
              });
            }
          });
        });

        if (allSessions.length > 0) {
          minDate = new Date(
            Math.min.apply(
              null,
              allSessions.map((d) => d.getTime())
            )
          );
          maxDate = new Date(
            Math.max.apply(
              null,
              allSessions.map((d) => d.getTime())
            )
          );

          // Adjust to start of month
          minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        } else {
          // Default to current date + 14 months if no data
          minDate = new Date();
          maxDate = new Date(new Date().setMonth(new Date().getMonth() + 14));
        }

        // Generate month headers from minDate to maxDate (or fixed 14 months window starting from min)
        const startMonth = allSessions.length > 0 ? minDate : new Date();
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
            startMonth.getFullYear(),
            startMonth.getMonth() + i,
            1
          );
          monthsList.push(
            `${monthNames[d.getMonth()]}-${d.getFullYear().toString().slice(2)}`
          );
        }
        setAgendaMonths(monthsList);
        setViewStartDate(startMonth);

        const formatted = data.map((p) => {
          // Calculate total days and cost
          const totalDays = p.modules.reduce(
            (acc, m) => acc + (Number.parseInt(m.duration, 10) || 0),
            0
          );
          const totalCost = p.modules.reduce(
            (acc, m) => acc + toNumber(m.price),
            0
          );

          return {
            id: p.slug,
            title: p.title,
            route: `/${p.slug === "decouvrir" ? "découvrir" : p.slug}`,
            codePrefix:
              p.slug === "decouvrir"
                ? "D"
                : p.slug === "approfondir"
                ? "V"
                : "M", // Infer prefix
            totalDays: totalDays,
            totalCost: formatPrice(totalCost, "-"),
            modules: p.modules.map((m) => ({
              code: m.reference || m.subtitle,
              reference: m.reference,
              name: m.title,
              days: parseInt(m.duration) || 0,
              hours: m.horaires,
              prereq: m.prerequis,
              price: formatPrice(m.price, "-"),
              sessions: m.sessions
                ? m.sessions.map((s) => {
                    const d = new Date(s.start_date);
                    const months = [
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
                    const monthLabel = `${months[d.getMonth()]}-${d
                      .getFullYear()
                      .toString()
                      .slice(2)}`;

                    // Return full object instead of just string
                    return {
                      ...s,
                      monthLabel,
                      monthKey: `${d.getFullYear()}-${String(
                        d.getMonth() + 1
                      ).padStart(2, "0")}`,
                    };
                  })
                : [],
            })),
          };
        });
        // Sort by level (Découvrir, Approfondir, Transmettre)
        const order = ["decouvrir", "approfondir", "transmettre"];
        formatted.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

        setScheduleLevels(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0a83ca]"></div>
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
            background-image: linear-gradient(rgba(7, 118, 187, 0.88), rgba(10, 131, 202, 0.9)), url('/assets/imgss001/freid (2).jpg');
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
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 22px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.16)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Agenda EnnéaMaroc
                </div>
                <h1
                  className="hero-title"
                  style={{
                    margin: "26px 0 20px",
                    fontSize: "clamp(28px, 6vw, 56px)",
                    fontWeight: 800,
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
              {highlights.map((item) => (
                <div key={item.title} className="col-lg-4 col-md-6">
                  <div
                    className="highlight-cards"
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: "36px 30px",
                      height: "100%",
                      boxShadow: "0 18px 45px rgba(8, 68, 120, 0.08)",
                      borderTop: `3px solid ${colors.blue}`,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 14,
                        background: colors.softBlue,
                        color: colors.blue,
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
                    color: colors.slate,
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
                  return (
                    <React.Fragment key={level.id}>
                      <button
                        onClick={() => setActiveTab(index)}
                        className="tab-button"
                        style={{
                          padding: "16px 32px",
                          background:
                            activeTab === index
                              ? "linear-gradient(135deg, #0a83ca 0%, #09538f 100%)"
                              : "#fff",
                          border:
                            activeTab === index
                              ? "2px solid rgba(10, 131, 202, 0.3)"
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
                              ? "0 4px 16px rgba(10, 131, 202, 0.25)"
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
                      background:
                        "linear-gradient(135deg, #e13734 0%, #c92a27 100%)",
                      borderRadius: 14,
                      border: "1px solid rgba(225, 55, 52, 0.3)",
                      boxShadow: "0 6px 20px rgba(225, 55, 52, 0.2)",
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
                                    idx === 0 ? colors.blue : colors.softBlue,
                                  color: idx === 0 ? "#fff" : colors.blue,
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
                                    className="cursor-pointer hover:text-[#0a83ca] hover:underline block w-full h-full"
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
                                  color: colors.blue,
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
                                      ? "rgba(10, 131, 202, 0.2)"
                                      : "#fff",
                                    color: hasSession ? colors.blue : "#ddd",
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
                                background: colors.softBlue,
                                borderRadius: 12,
                                border: `1px solid ${colors.lightGray}`,
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
                                  <strong style={{ color: colors.blue }}>
                                    Parcours complet
                                  </strong>
                                  &nbsp;: {level.totalDays} jours –{" "}
                                  <span style={{ color: "#e13734" }}>
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
                        border: `2px solid ${colors.blue}`,
                        background:
                          index === 0 ? "rgba(10, 131, 202, 0.08)" : "#fff",
                        color:
                          index === 0 ? "rgba(10, 131, 202, 0.4)" : colors.blue,
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
                            : "0 8px 20px rgba(10, 131, 202, 0.15)",
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
                            ? "2px solid rgba(10, 131, 202, 0.2)"
                            : "2px solid transparent",
                        background:
                          index === scheduleLevels.length - 1
                            ? "rgba(10, 131, 202, 0.15)"
                            : "linear-gradient(135deg, #0a83ca 0%, #09538f 100%)",
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
                            : "0 10px 24px rgba(9, 83, 143, 0.3)",
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
              background: #e13734;
              border-radius: 8px;
              border: 3px solid rgba(255, 255, 255, 0.4);
            }
            
            .table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
              background: #c92a27;
            }
            
            /* Firefox */
            .table-scroll-wrapper {
              scrollbar-width: auto;
              scrollbar-color: #e13734 rgba(225, 55, 52, 0.15);
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
            background: "linear-gradient(135deg, #0a83ca 0%, #09538f 100%)",
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
              {thematicTracks.map((track) => (
                <div key={track.title} className="col-lg-4 col-md-6">
                  <div
                    className="thematic-card"
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: "32px 28px",
                      boxShadow: "0 24px 46px rgba(5, 46, 82, 0.18)",
                      borderTop: `3px solid ${colors.deepBlue}`,
                      height: "100%",
                    }}
                  >
                    <h3
                      className="thematic-title"
                      style={{
                        fontSize: "clamp(18px, 4vw, 20px)",
                        fontWeight: 800,
                        color: colors.slate,
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
                              color: colors.blue,
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
                        color: colors.blue,
                        textDecoration: "none",
                      }}
                    >
                      Consulter la page programme
                      <FaArrowRight />
                    </Link>
                  </div>
                </div>
              ))}
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
                      fontWeight: 800,
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
                        fontWeight: 800,
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
