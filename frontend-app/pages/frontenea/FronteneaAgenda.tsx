import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchSessions } from '../../store/slices/agendaSlice';
import { fetchAllParcours } from '../../store/slices/parcoursSlice';
import { Link } from 'react-router-dom';
import { FaLayerGroup, FaArrowRight, FaCheck } from 'react-icons/fa';
import { FaCalendarDays, FaPeopleArrows } from 'react-icons/fa6';

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

const highlights = [
  {
    icon: <FaLayerGroup />,
    title: "3 niveaux certifiants",
    text: "Retrouvez les parcours Découvrir, Approfondir et Transmettre, tels que détaillés sur nos pages dédiées, avec leurs modules cumulés.",
  },
  {
    icon: <FaCalendarDays />,
    title: "Calendrier continu",
    text: "Un planning couvrant chaque module pour les prochains mois, directement relié aux données des tableaux ci-dessous.",
  },
  {
    icon: <FaPeopleArrows />,
    title: "Accompagnement sur mesure",
    text: "Construisez des parcours intra-entreprise en combinant les modules des niveaux et les formats décrits sur les pages Solution et École.",
  },
];

const FronteneaAgenda: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sessions, loading: sessionsLoading } = useAppSelector((state) => state.agenda);
  const { items: parcoursList, loading: parcoursLoading } = useAppSelector((state) => state.parcours);
  const [activeTab, setActiveTab] = useState(0);

  // Generate next 14 months for columns
  const [monthHeaders, setMonthHeaders] = useState<{key: string, label: string}[]>([]);

  const formatPrice = (price: string | undefined) => {
    if (!price) return "-";
    let p = price.toString()
      .replace(/€/g, "")
      .replace(/EUR/g, "")
      .replace(/Ôé¼/g, "")
      .trim();
    const numStr = p.replace(/\s/g, "").replace(",", ".");
    if (!p.includes("MAD") && !isNaN(parseFloat(numStr))) {
      return `${p} MAD`;
    }
    return p;
  };

  useEffect(() => {
    const start = new Date();
    const headers = [];
    const months = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const monthName = months[d.getMonth()];
      const yearShort = d.getFullYear().toString().slice(2);
      headers.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${monthName}-${yearShort}`
      });
    }
    setMonthHeaders(headers);

    // Fetch data
    const end = new Date(start.getFullYear(), start.getMonth() + 14, 1);
    dispatch(fetchSessions({ 
      startDate: start.toISOString().split('T')[0], 
      endDate: end.toISOString().split('T')[0] 
    }));
    dispatch(fetchAllParcours());
  }, [dispatch]);

  // Helper to check if a session exists for a module in a specific month
  const hasSession = (moduleId: number, monthKey: string) => {
    return sessions.some(session => {
      if (session.parcours_module_id !== moduleId) return false;
      const sessionDate = new Date(session.start_date);
      const sessionKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
      return sessionKey === monthKey;
    });
  };

  if (sessionsLoading || parcoursLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0a83ca]"></div>
      </div>
    );
  }

  return (
    <main role="main">
      <div style={{ fontFamily: "system-ui, sans-serif", color: colors.slate }}>
        <style>
          {`
          @media (max-width: 768px) {
            .hero-section { padding: 100px 15px 60px !important; }
            .hero-title { font-size: 32px !important; line-height: 1.2 !important; }
            .hero-description { font-size: 16px !important; }
            .hero-buttons { flex-direction: column !important; width: 100%; }
            .hero-buttons a { width: 100% !important; justify-content: center !important; }
            .section-title { font-size: 28px !important; }
            .highlight-cards { padding: 24px 20px !important; }
            .level-header { padding: 16px 20px !important; }
            .level-title { font-size: 18px !important; flex: 1 1 100% !important; }
            .level-info { flex: 1 1 100% !important; justify-content: flex-start !important; }
            .tab-button { padding: 12px 20px !important; font-size: 12px !important; }
            .tab-button-text { font-size: 12px !important; }
            .nav-button { min-width: 140px !important; padding: 12px 20px !important; font-size: 12px !important; }
            .nav-text-full { display: none !important; }
            .nav-text-short { display: inline !important; }
            .thematic-card { padding: 24px 20px !important; }
            .thematic-title { font-size: 18px !important; }
          }
          @media (min-width: 769px) {
            .nav-text-full { display: inline !important; }
            .nav-text-short { display: none !important; }
          }
          @media (max-width: 480px) {
            .hero-section { padding: 80px 10px 40px !important; }
            .hero-title { font-size: 28px !important; }
            .tab-separator { display: none !important; }
            .level-header { padding: 12px 16px !important; }
            .level-title { font-size: 16px !important; }
            .nav-button { min-width: 120px !important; padding: 10px 16px !important; }
          }
          .table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin-bottom: 2rem;
            border-radius: 0 0 16px 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1000px;
            background: #fff;
          }
          th, td {
            padding: 16px;
            text-align: center;
            border: 1px solid ${colors.lightGray};
            font-size: 14px;
          }
          th {
            background: ${colors.softWhite};
            font-weight: 700;
            color: ${colors.deepBlue};
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
          }
          .module-cell {
            text-align: left;
            font-weight: 600;
            color: ${colors.deepBlue};
            min-width: 200px;
          }
          .check-cell {
            background: ${colors.softBlue};
            color: ${colors.blue};
          }
          `}
        </style>

        {/* Hero Section */}
        <section
          className="hero-section"
          style={{
            padding: "clamp(100px, 15vh, 160px) 20px clamp(50px, 10vh, 100px)",
            backgroundImage: "linear-gradient(rgba(7, 118, 187, 0.88), rgba(10, 131, 202, 0.9)), url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: "#fff",
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <div className="max-w-4xl">
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
                    maxWidth: 720,
                    fontSize: "clamp(16px, 3vw, 20px)",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  Explorez en un coup d'oeil les dates confirmées pour nos
                  parcours certifiants.
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section style={{ padding: "80px 20px", background: colors.softWhite }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {highlights.map((item) => (
                <div key={item.title}>
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
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 15, color: colors.gray, lineHeight: 1.7 }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agenda Tables Section */}
        <section style={{ padding: "80px 20px", background: "#fff" }}>
          <div className="container mx-auto px-4">
            
            {/* Tabs */}
            <div className="flex justify-center mb-12 overflow-x-auto">
              <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                {parcoursList.map((parcours, index) => (
                  <button
                    key={parcours.id}
                    onClick={() => setActiveTab(index)}
                    className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                      activeTab === index
                        ? 'bg-white text-[#0a83ca] shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {parcours.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {parcoursList.map((parcours, index) => (
              <div
                key={parcours.id}
                style={{ display: activeTab === index ? "block" : "none" }}
                className="animate-fadeIn"
              >
                {/* Header Card */}
                <div
                  className="level-header"
                  style={{
                    background: colors.blue,
                    borderRadius: "16px 16px 0 0",
                    padding: "24px 32px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20,
                    color: "#fff",
                  }}
                >
                  <h2 className="level-title" style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
                    {parcours.title}
                  </h2>
                  <div className="level-info" style={{ display: "flex", gap: 24, fontSize: 14, fontWeight: 500, opacity: 0.9 }}>
                    <span className="flex items-center gap-2">
                      <FaCalendarDays /> {parcours.modules?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", paddingLeft: 32, minWidth: 250, background: colors.blue, color: '#fff' }}>MODULE</th>
                        <th style={{ background: colors.softBlue, color: colors.deepBlue }}>JOURS</th>
                        <th style={{ background: colors.softBlue, color: colors.deepBlue }}>HORAIRES</th>
                        <th style={{ background: colors.softBlue, color: colors.deepBlue }}>PRÉREQUIS</th>
                        <th style={{ background: colors.softBlue, color: colors.deepBlue, minWidth: 150 }}>TARIF</th>
                        {monthHeaders.map((header) => (
                          <th key={header.key} style={{ minWidth: 80 }}>{header.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parcours.modules?.map((module, idx) => (
                        <tr key={module.id}>
                          <td className="module-cell" style={{ paddingLeft: 32 }}>
                            <div style={{ fontSize: 13, color: colors.blue, fontWeight: 700, marginBottom: 4 }}>
                              {`Module ${idx + 1}`} {module.subtitle ? ` • ${module.subtitle}` : ''}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: colors.slate }}>
                              {module.title}
                            </div>
                          </td>
                          <td>{module.duration || '-'}</td>
                          <td>{module.horaires || '-'}</td>
                          <td>{module.prerequis || '-'}</td>
                          <td style={{ fontWeight: 700, color: colors.slate }}>
                            {formatPrice(module.price)}
                          </td>
                          {monthHeaders.map((header) => {
                            const active = hasSession(module.id!, header.key);
                            return (
                              <td
                                key={header.key}
                                className={active ? "check-cell" : ""}
                                style={{ background: active ? colors.softBlue : "transparent" }}
                              >
                                {active && (
                                  <div style={{ display: "flex", justifyContent: "center" }}>
                                    <FaCheck style={{ color: colors.blue }} />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default FronteneaAgenda;
