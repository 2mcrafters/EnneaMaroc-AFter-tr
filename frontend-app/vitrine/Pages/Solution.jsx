import React from "react";
import Seo from "../Components/Seo/Seo";
import { Link } from "react-router-dom";
import { FaUserTie, FaBrain, FaChartLine, FaArrowRight, FaBuilding, FaHome, FaGraduationCap, FaComments } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";

export default function Solution() {
  const C = {
    white: "#fff",
    black: "#1d1c1a",
    red: "#e13734",
    blue: "#0a83ca",
    gray: "#6c757d",
    light: "#f8f9fa",
    lightBlue: "#e8f4fd",
    lightRed: "#fef0f0",
    green: "#28a745",
    lightGreen: "#e8f5e9",
  };

  const managerModules = {
    niveau1: [
      {
        title: "Module 1 – Découvrir sa personnalité comme un manager",
        duration: "4 JOURS",
        points: [
          "Identifier son type Ennéagramme.",
          "Reconnaître ses forces, talents et zones d'ombre.",
          "Comprendre ses réactions en situation de stress et ses leviers de motivation.",
        ],
        result: "Une meilleure conscience de soi et de son impact managérial.",
        icon: <FaUserTie />,
      },
      {
        title: "Module 2 – Manager avec les trois centres",
        duration: "4 JOURS",
        points: [
          "Développer la clarté et le discernement (centre tête).",
          "Cultiver l'intelligence émotionnelle et relationnelle (centre cœur).",
          "Renforcer la présence et l'ancrage dans l'action (centre corps).",
        ],
        result:
          "Un manager équilibré, capable de décisions justes, d'écoute authentique et d'actions alignées.",
        icon: <FaBrain />,
      },
    ],
    niveau2: [
      {
        title: "Module 3 – Manager et motiver une équipe diversifiée",
        duration: "4 JOURS",
        points: [
          "Comprendre la dynamique des 9 profils dans une équipe.",
          "Adapter son style de management selon les types.",
          "Identifier les sources de tensions et transformer les différences en complémentarités.",
        ],
        result:
          "Une équipe plus soudée, où chacun trouve sa place et contribue pleinement.",
        icon: <FaPeopleGroup />,
      },
      {
        title:
          "Module 4 – Vers une exploration pratique de leadership par Enneagramme",
        duration: "2 JOURS",
        points: [
          "Pratique concrète des enseignements de l'enneagramme dans les dynamiques de groupe - teambuilding.",
          "Construire son plan de développement personnel et professionnel.",
        ],
        result:
          "Un manager agile, capable d'accompagner les transformations et de donner du sens à ses équipes.",
        icon: <FaChartLine />,
      },
    ],
  };

  return (
    <main role="main">
      <Seo page="solution" path="/solution" />
      <div style={{ fontFamily: "system-ui, sans-serif", color: C.black }}>
        {/* HERO */}
        <section
          style={{
            backgroundImage:
              "linear-gradient(rgba(10, 131, 202, 0.92), rgba(10, 131, 202, 0.92)), url('/assets/imgss001/coaching (23).jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            padding: "clamp(200px, 25vh, 320px) 20px clamp(80px, 12vh, 120px)",
            borderBottom: `1px solid #0776bb`,
          }}
        >
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div
                  style={{
                    display: "inline-block",
                    color: C.white,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    marginBottom: 20,
                    textTransform: "uppercase",
                  }}
                >
                  Solution • Extension
                </div>
                <h1
                  style={{
                    fontSize: 52,
                    fontWeight: 700,
                    margin: "0 0 24px",
                    lineHeight: 1.15,
                    color: C.white,
                  }}
                >
                  EnnéaMaroc{" "}
                  <span style={{ color: C.white, fontWeight: 800 }}>PRO</span>
                </h1>
                <p
                  style={{
                    fontSize: 22,
                    lineHeight: 1.7,
                    maxWidth: 700,
                    margin: "0 0 40px",
                    color: C.white,
                    fontWeight: 400,
                  }}
                >
                  Programmes sur mesure pour entreprises, équipes et jeunes
                  talents. Panels, leadership, cohésion, transformation.
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <a
                    href="#entreprises"
                    style={{
                      background: C.white,
                      color: C.blue,
                      padding: "16px 32px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      transition: "all 0.3s",
                    }}
                  >
                    Entreprises <FaArrowRight style={{ fontSize: 14 }} />
                  </a>
                  <a
                    href="#jeunes"
                    style={{
                      background: "transparent",
                      color: C.white,
                      padding: "16px 32px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      border: `2px solid ${C.white}`,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    Jeunes Talents <FaArrowRight style={{ fontSize: 14 }} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CARDS SECTION - OVERVIEW */}
        <section style={{ padding: "80px 20px", background: C.white }}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-10 text-center">
                <h2
                  style={{
                    fontSize: 42,
                    fontWeight: 700,
                    color: C.black,
                    marginBottom: 20,
                    lineHeight: 1.2,
                  }}
                >
                  Nos Solutions
                </h2>
                <p
                  style={{
                    fontSize: 18,
                    color: C.gray,
                    lineHeight: 1.7,
                    maxWidth: 700,
                    margin: "0 auto",
                  }}
                >
                  Découvrez nos programmes adaptés à vos besoins
                </p>
              </div>
            </div>

            <div className="row g-4">
              {/* Card 1: Entreprises */}
              <div className="col-lg-4 col-md-6">
                <div
                  style={{
                    background: C.white,
                    borderRadius: 16,
                    padding: 40,
                    height: "100%",
                    border: `1px solid ${C.lightBlue}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 30px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0,0,0,0.08)";
                  }}
                >
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${C.blue} 0%, #0c6ea0 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}
                  >
                    <FaBuilding style={{ fontSize: 32, color: C.white }} />
                  </div>
                  <h3
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: C.black,
                      marginBottom: 12,
                    }}
                  >
                    EnnéaMaroc pour Entreprise
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      color: C.blue,
                      fontWeight: 600,
                      marginBottom: 20,
                    }}
                  >
                    Renforcer la cohésion, manager humainement
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      color: C.gray,
                      lineHeight: 1.7,
                      marginBottom: 30,
                      flexGrow: 1,
                      textAlign: "justify",
                      hyphens: "auto",
                    }}
                  >
                    Programme de formation pour managers et équipes, développer
                    un leadership conscient et aligné.
                  </p>
                  <a
                    href="#entreprises"
                    style={{
                      background: C.blue,
                      color: C.white,
                      padding: "14px 28px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 15,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#0c6ea0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.blue;
                    }}
                  >
                    En savoir plus
                    <i
                      className="fas fa-arrow-right"
                      style={{ fontSize: 14 }}
                    />
                  </a>
                </div>
              </div>

              {/* Card 2: Jeunes */}
              <div className="col-lg-4 col-md-6">
                <div
                  style={{
                    background: C.white,
                    borderRadius: 16,
                    padding: 40,
                    height: "100%",
                    border: `1px solid ${C.lightRed}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 30px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0,0,0,0.08)";
                  }}
                >
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${C.red} 0%, #c12d2a 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}
                  >
                    <FaGraduationCap style={{ fontSize: 32, color: C.white }} />
                  </div>
                  <h3
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: C.black,
                      marginBottom: 12,
                    }}
                  >
                    EnnéaMaroc pour Jeunes
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      color: C.red,
                      fontWeight: 600,
                      marginBottom: 20,
                    }}
                  >
                    Programme Jeunes talents & Hauts potentiels
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      color: C.gray,
                      lineHeight: 1.7,
                      marginBottom: 30,
                      flexGrow: 1,
                      textAlign: "justify",
                      hyphens: "auto",
                    }}
                  >
                    Accompagner les jeunes talents à révéler leur potentiel et
                    préparer leur avenir avec confiance.
                  </p>
                  <a
                    href="#jeunes"
                    style={{
                      background: C.red,
                      color: C.white,
                      padding: "14px 28px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 15,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#c12d2a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.red;
                    }}
                  >
                    En savoir plus
                    <FaArrowRight style={{ fontSize: 14 }} />
                  </a>
                </div>
              </div>

              {/* Card 3: Espace Dialogue */}
              <div className="col-lg-4 col-md-6">
                <div
                  style={{
                    background: C.white,
                    borderRadius: 16,
                    padding: 40,
                    height: "100%",
                    border: `1px solid ${C.lightGreen}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 30px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0,0,0,0.08)";
                  }}
                >
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${C.green} 0%, #1e8e3e 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}
                  >
                    <FaComments style={{ fontSize: 32, color: C.white }} />
                  </div>
                  <h3
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: C.black,
                      marginBottom: 12,
                    }}
                  >
                    Espace Dialogue – EnnéaMaroc
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      color: C.green,
                      fontWeight: 600,
                      marginBottom: 20,
                    }}
                  >
                    Mensuel
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      color: C.gray,
                      lineHeight: 1.7,
                      marginBottom: 30,
                      flexGrow: 1,
                      textAlign: "justify",
                      hyphens: "auto",
                    }}
                  >
                    Laboratoire d'échanges humains : panels, ateliers et
                    co-construction autour de l'Ennéagramme.
                  </p>
                  <a
                    href="#dialogue"
                    style={{
                      background: C.green,
                      color: C.white,
                      padding: "14px 28px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 15,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#1e8e3e";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.green;
                    }}
                  >
                    En savoir plus
                    <FaArrowRight style={{ fontSize: 14 }} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ENTREPRISES */}
        <section
          id="entreprises"
          style={{ padding: "80px 20px", background: C.lightBlue }}
        >
          <div className="container">
            <div className="row align-items-center mb-5">
              <div className="col-lg-8">
                <div
                  style={{
                    color: C.blue,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    marginBottom: 16,
                    textTransform: "uppercase",
                  }}
                >
                  Entreprises — EnnéaMaroc Pro
                </div>
                <h2
                  style={{
                    fontSize: 42,
                    fontWeight: 700,
                    color: C.black,
                    margin: "0 0 20px",
                    lineHeight: 1.2,
                  }}
                >
                  Programme EnnéaMaroc PRO – Managers en évolution
                </h2>
                <p style={{ fontSize: 18, color: C.gray, lineHeight: 1.7 }}>
                  De la posture de gestion à un leadership conscient et aligné
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <div
                  style={{
                    display: "inline-block",
                    background: C.blue,
                    color: C.white,
                    padding: "24px 32px",
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
                    8
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>
                    JOURS / Niveau
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: C.white,
                borderRadius: 16,
                padding: 50,
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  borderLeft: `4px solid ${C.blue}`,
                  paddingLeft: 28,
                  marginBottom: 50,
                }}
              >
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 12,
                    color: C.black,
                  }}
                >
                  Objectif général
                </h3>
                <p
                  style={{
                    fontSize: 17,
                    lineHeight: 1.8,
                    margin: 0,
                    color: C.gray,
                    textAlign: "justify",
                    hyphens: "auto",
                  }}
                >
                  Ce programme de formation dédié aux entreprises, aide à
                  accompagner les managers pour mieux se connaître, comprendre
                  ses équipes et développer une posture de leadership équilibrée
                  et inspirante, en s'appuyant sur l'Ennéagramme et l'alignement
                  Pensée – Émotion – Action.
                </p>
              </div>

              <h3
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 32,
                  color: C.black,
                }}
              >
                Parcours de deux niveaux
              </h3>

              {/* Niveau 1 */}
              <div style={{ marginBottom: 48 }}>
                <h4
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 24,
                    color: C.blue,
                  }}
                >
                  Niveau 1
                </h4>
                <div className="row g-4">
                  {managerModules.niveau1.map((mod, idx) => (
                    <div key={idx} className="col-lg-6">
                      <div
                        style={{
                          background: C.lightBlue,
                          borderRadius: 12,
                          padding: 32,
                          height: "100%",
                          borderTop: `3px solid ${C.blue}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "start",
                            gap: 16,
                            marginBottom: 20,
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              background: C.blue,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                              color: C.white,
                              flexShrink: 0,
                            }}
                          >
                            {mod.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4
                              style={{
                                fontSize: 19,
                                fontWeight: 700,
                                margin: "0 0 8px",
                                color: C.black,
                              }}
                            >
                              {mod.title}
                            </h4>
                            <span
                              style={{
                                display: "inline-block",
                                color: C.blue,
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {mod.duration}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                          {mod.points.map((pt, i) => (
                            <div
                              key={i}
                              style={{
                                marginBottom: 12,
                                display: "flex",
                                gap: 10,
                                alignItems: "start",
                              }}
                            >
                              <span
                                style={{
                                  color: C.blue,
                                  fontSize: 18,
                                  marginTop: 2,
                                }}
                              >
                                •
                              </span>
                              <span
                                style={{
                                  flex: 1,
                                  fontSize: 15,
                                  color: C.gray,
                                  lineHeight: 1.6,
                                  textAlign: "justify",
                                  hyphens: "auto",
                                }}
                              >
                                {pt}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div
                          style={{
                            background: C.white,
                            padding: 16,
                            borderRadius: 8,
                            borderLeft: `3px solid ${C.blue}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 15,
                              color: C.black,
                              fontWeight: 600,
                              margin: 0,
                              lineHeight: 1.6,
                              textAlign: "justify",
                              hyphens: "auto",
                            }}
                          >
                            → {mod.result}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Niveau 2 */}
              <div style={{ marginBottom: 48 }}>
                <h4
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 24,
                    color: C.blue,
                  }}
                >
                  Niveau 2
                </h4>
                <div className="row g-4">
                  {managerModules.niveau2.map((mod, idx) => (
                    <div key={idx} className="col-lg-6">
                      <div
                        style={{
                          background: C.lightBlue,
                          borderRadius: 12,
                          padding: 32,
                          height: "100%",
                          borderTop: `3px solid ${C.blue}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "start",
                            gap: 16,
                            marginBottom: 20,
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              background: C.blue,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                              color: C.white,
                              flexShrink: 0,
                            }}
                          >
                            {mod.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4
                              style={{
                                fontSize: 19,
                                fontWeight: 700,
                                margin: "0 0 8px",
                                color: C.black,
                              }}
                            >
                              {mod.title}
                            </h4>
                            <span
                              style={{
                                display: "inline-block",
                                color: C.blue,
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {mod.duration}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                          {mod.points.map((pt, i) => (
                            <div
                              key={i}
                              style={{
                                marginBottom: 12,
                                display: "flex",
                                gap: 10,
                                alignItems: "start",
                              }}
                            >
                              <span
                                style={{
                                  color: C.blue,
                                  fontSize: 18,
                                  marginTop: 2,
                                }}
                              >
                                •
                              </span>
                              <span
                                style={{
                                  flex: 1,
                                  fontSize: 15,
                                  color: C.gray,
                                  lineHeight: 1.6,
                                  textAlign: "justify",
                                  hyphens: "auto",
                                }}
                              >
                                {pt}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div
                          style={{
                            background: C.white,
                            padding: 16,
                            borderRadius: 8,
                            borderLeft: `3px solid ${C.blue}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 15,
                              color: C.black,
                              fontWeight: 600,
                              margin: 0,
                              lineHeight: 1.6,
                              textAlign: "justify",
                              hyphens: "auto",
                            }}
                          >
                            → {mod.result}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: C.lightGreen,
                  padding: 36,
                  borderRadius: 12,
                  marginTop: 40,
                  borderTop: `3px solid ${C.green}`,
                }}
              >
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 20,
                    color: C.black,
                  }}
                >
                  Bénéfices pour l'entreprise
                </h3>
                <div style={{ display: "grid", gap: 14 }}>
                  {[
                    "Des managers plus conscients, alignés et efficaces.",
                    "Une meilleure communication et gestion des équipes.",
                    "Un leadership capable d'accompagner le changement et d'inspirer la performance collective.",
                  ].map((benefit, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 12, alignItems: "start" }}
                    >
                      <span
                        style={{
                          color: C.green,
                          fontSize: 20,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                      <p
                        style={{
                          fontSize: 16,
                          color: C.black,
                          margin: 0,
                          paddingTop: 2,
                          lineHeight: 1.6,
                        }}
                      >
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 40, textAlign: "center" }}>
                <Link
                  to="/contact"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    background: C.blue,
                    color: C.white,
                    padding: "16px 36px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  Demander une étude personnalisée
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* EQUIPES */}
        <section
          id="equipes"
          style={{ padding: "80px 20px", background: C.white }}
        >
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-4">
                <div
                  style={{
                    color: C.red,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    marginBottom: 16,
                    textTransform: "uppercase",
                  }}
                >
                  Équipes opérationnelles
                </div>
                <h2
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: C.black,
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  Programme Ennéagramme Équipes opérationnelles
                </h2>
                <div
                  style={{
                    background: C.blue,
                    padding: "24px 28px",
                    borderRadius: 12,
                    marginTop: 24,
                    borderTop: `3px solid ${C.blue}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 800,
                      lineHeight: 1,
                      color: C.white,
                    }}
                  >
                    8
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginTop: 6,
                      color: C.white,
                    }}
                  >
                    JOURS
                  </div>
                  <p
                    style={{
                      fontSize: 15,
                      marginTop: 10,
                      marginBottom: 0,
                      color: C.white,
                      lineHeight: 1.5,
                    }}
                  >
                    D'un opérateur exécutant à un opérateur impliqué et acteur
                  </p>
                </div>
              </div>

              <div className="col-lg-8">
                <div
                  style={{
                    background: C.lightBlue,
                    borderRadius: 12,
                    padding: 40,
                    borderTop: `3px solid ${C.blue}`,
                    marginBottom: 24,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      marginBottom: 16,
                      color: C.black,
                    }}
                  >
                    Objectif
                  </h3>
                  <p style={{ fontSize: 16, color: C.gray, lineHeight: 1.7 }}>
                    Renforcer la cohésion, la collaboration et la gestion des
                    conflits dans les équipes.
                  </p>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      margin: "28px 0 16px",
                      color: C.black,
                    }}
                  >
                    Modules
                  </h3>
                  {[
                    "Découvrir les 9 profils : comprendre les dynamiques individuelles",
                    "Travailler ensemble : reconnaître les forces complémentaires de chaque type",
                    "Communication efficace : transformer les incompréhensions en leviers",
                    "Gestion des tensions : comprendre le stress et apaiser les conflits",
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 12,
                        alignItems: "start",
                      }}
                    >
                      <span style={{ color: C.blue, fontSize: 18 }}>•</span>
                      <p
                        style={{
                          fontSize: 15,
                          color: C.gray,
                          margin: 0,
                          paddingTop: 2,
                          lineHeight: 1.6,
                        }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: C.lightGreen,
                    borderRadius: 12,
                    padding: 40,
                    borderTop: `3px solid ${C.green}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      marginBottom: 20,
                      color: C.black,
                    }}
                  >
                    Valeur ajoutée
                  </h3>
                  {[
                    "Équipes plus soudées et conscientes des différences",
                    "Réduction des tensions relationnelles",
                    "Meilleure performance collective par la coopération",
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 14,
                        alignItems: "start",
                      }}
                    >
                      <span
                        style={{
                          color: C.green,
                          fontSize: 18,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                      <p
                        style={{
                          fontSize: 15,
                          color: C.black,
                          margin: 0,
                          paddingTop: 2,
                          lineHeight: 1.6,
                        }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JEUNES TALENTS */}
        <section
          id="jeunes"
          style={{
            padding: "80px 20px",
            backgroundImage:
              "linear-gradient(rgba(10, 131, 202, 0.92), rgba(10, 131, 202, 0.92)), url('/assets/imgss001/coaching (23).jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="container">
            <div className="row justify-content-center mb-4">
              <div className="col-lg-10">
                <div
                  style={{
                    color: C.white,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    marginBottom: 16,
                    textTransform: "uppercase",
                  }}
                >
                  EnnéaMaroc PRO — Jeunes Étudiants et Universitaires
                </div>
                <h2
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: C.white,
                    margin: "0 0 20px",
                    lineHeight: 1.2,
                  }}
                >
                  Programme EnnéaMaroc – Jeunes talents & Hauts potentiels
                </h2>
                <p
                  style={{
                    fontSize: 18,
                    color: C.white,
                    lineHeight: 1.7,
                    maxWidth: 800,
                  }}
                >
                  Révéler le potentiel caché des jeunes talents
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: C.white,
                    lineHeight: 1.7,
                    maxWidth: 800,
                    marginTop: 16,
                    opacity: 0.95,
                    textAlign: "justify",
                  }}
                >
                  Conçu pour accompagner les jeunes talents dans leur
                  cheminement personnel et orientation professionnelle, ce
                  parcours conjugue ancrage culturel marocain et ouverture
                  internationale. Il prépare non seulement à relever les défis
                  d'un monde complexe, mais aussi à devenir des femmes et des
                  hommes inspirants, équilibrés et responsables, capables
                  d'avoir un impact positif dans leur vie, leurs relations et
                  leurs communautés.
                </p>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-6">
                <div
                  style={{
                    background: C.white,
                    borderRadius: 12,
                    padding: 40,
                    height: "100%",
                    borderTop: `3px solid ${C.red}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      marginBottom: 20,
                      color: C.black,
                    }}
                  >
                    Objectif
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      color: C.gray,
                      lineHeight: 1.7,
                      marginBottom: 28,
                      textAlign: "justify",
                    }}
                  >
                    Accompagner les jeunes en intégration ou les futurs leaders
                    à trouver leur place, révéler leurs talents et préparer leur
                    avenir.
                  </p>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      marginBottom: 20,
                      color: C.black,
                    }}
                  >
                    Modules
                  </h3>
                  {[
                    "Se connaître : découverte de son type, motivations et talents naturels.",
                    "Développer sa confiance : dépasser les peurs et blocages intérieurs.",
                    "Construire son alignement : équilibre tête – cœur – corps comme boussole de choix.",
                    "Préparer son avenir : tracer son plan de développement professionnel et personnel.",
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: 14,
                        display: "flex",
                        gap: 10,
                        alignItems: "start",
                      }}
                    >
                      <span style={{ color: C.red, fontSize: 18 }}>•</span>
                      <p
                        style={{
                          fontSize: 15,
                          color: C.gray,
                          margin: 0,
                          paddingTop: 2,
                          lineHeight: 1.6,
                          textAlign: "justify",
                        }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-lg-6">
                <div
                  style={{
                    background: C.white,
                    borderRadius: 12,
                    padding: 40,
                    height: "100%",
                    borderTop: `3px solid ${C.blue}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      marginBottom: 20,
                      color: C.black,
                    }}
                  >
                    Valeur ajoutée
                  </h3>
                  {[
                    "Jeunes mieux préparés à assumer des responsabilités.",
                    "Réduction des incertitudes et des erreurs d'orientation.",
                    "Émergence d'une nouvelle génération de leaders conscients.",
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: 16,
                        display: "flex",
                        gap: 10,
                        alignItems: "start",
                      }}
                    >
                      <span
                        style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}
                      >
                        ✓
                      </span>
                      <p
                        style={{
                          fontSize: 15,
                          color: C.black,
                          margin: 0,
                          paddingTop: 2,
                          lineHeight: 1.6,
                          textAlign: "justify",
                        }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}

                  <div
                    style={{
                      marginTop: 32,
                      paddingTop: 32,
                      borderTop: `1px solid ${C.light}`,
                    }}
                  >
                    <h4
                      style={{
                        fontSize: 19,
                        fontWeight: 700,
                        marginBottom: 16,
                        color: C.black,
                      }}
                    >
                      Formats complémentaires
                    </h4>
                    {[
                      "Jeunes en intégration : découvrir ses talents, trouver sa place, préparer son avenir avec confiance.",
                      "Panels et conférences : sensibiliser un large public aux clés de l'Ennéagramme dans des formats interactifs et inspirants.",
                      "Ateliers d'initiation : une première immersion concrète pour expérimenter l'Ennéagramme et découvrir son type.",
                    ].map((item, i) => (
                      <p
                        key={i}
                        style={{
                          fontSize: 15,
                          color: C.gray,
                          marginBottom: 12,
                          lineHeight: 1.6,
                          paddingLeft: 18,
                          position: "relative",
                          textAlign: "justify",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            color: C.gray,
                          }}
                        >
                          •
                        </span>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ESPACE DIALOGUE */}
        <section
          id="dialogue"
          style={{ padding: "80px 20px", background: C.white }}
        >
          <div className="container">
            <div className="row justify-content-center mb-4">
              <div className="col-lg-10">
                <div
                  style={{
                    color: C.gray,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    marginBottom: 16,
                    textTransform: "uppercase",
                  }}
                >
                  Espace Dialogue
                </div>
                <h2
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    margin: "0 0 16px",
                    lineHeight: 1.2,
                    color: C.black,
                  }}
                >
                  Espace Dialogue – EnnéaMaroc
                </h2>

                <p
                  style={{
                    fontSize: 17,
                    lineHeight: 1.8,
                    maxWidth: 900,
                    color: C.gray,
                    marginBottom: 0,
                    textAlign: "justify",
                  }}
                >
                  L'Espace Dialogue est conçu comme un laboratoire d'échanges
                  humains où chacun peut questionner, partager, écouter et
                  construire du sens collectivement. C'est un complément
                  essentiel aux parcours de formation, car il place
                  l'Ennéagramme dans une dynamique vivante et communautaire.
                </p>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-4">
                <div
                  style={{
                    background: C.light,
                    borderRadius: 12,
                    padding: 36,
                    height: "100%",
                    borderTop: `3px solid ${C.blue}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 24,
                      color: C.black,
                    }}
                  >
                    Principes fondateurs
                  </h3>
                  <div style={{ fontSize: 15, lineHeight: 1.6 }}>
                    <p
                      style={{
                        marginBottom: 14,
                        paddingLeft: 18,
                        position: "relative",
                        color: "#43403c",
                        textAlign: "justify",
                      }}
                    >
                      <span
                        style={{ position: "absolute", left: 0, fontSize: 16 }}
                      >
                        •
                      </span>
                      <strong style={{ color: "#0a83ca" }}>Ouverture :</strong>{" "}
                      croiser traditions et modernité, culture locale et
                      internationale.
                    </p>
                    <p
                      style={{
                        marginBottom: 14,
                        paddingLeft: 18,
                        position: "relative",
                        color: "#43403c",
                        textAlign: "justify",
                      }}
                    >
                      <span
                        style={{ position: "absolute", left: 0, fontSize: 16 }}
                      >
                        •
                      </span>
                      <strong style={{ color: "#0a83ca" }}>Pluralité :</strong>{" "}
                      diversité des points de vue et des expériences.
                    </p>
                    <p
                      style={{
                        marginBottom: 14,
                        paddingLeft: 18,
                        position: "relative",
                        color: "#43403c",
                        textAlign: "justify",
                      }}
                    >
                      <span
                        style={{ position: "absolute", left: 0, fontSize: 16 }}
                      >
                        •
                      </span>
                      <strong style={{ color: "#0a83ca" }}>
                        Co-construction :
                      </strong>{" "}
                      la richesse naît du dialogue, pas uniquement du savoir
                      transmis.
                    </p>
                    <p
                      style={{
                        marginBottom: 0,
                        paddingLeft: 18,
                        position: "relative",
                        color: "#43403c",
                        textAlign: "justify",
                      }}
                    >
                      <span
                        style={{ position: "absolute", left: 0, fontSize: 16 }}
                      >
                        •
                      </span>
                      <strong style={{ color: "#0a83ca" }}>
                        Application vivante :
                      </strong>{" "}
                      passer de la théorie à des échanges concrets, ancrés dans
                      le réel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div
                  style={{
                    background: C.light,
                    borderRadius: 12,
                    padding: 36,
                    height: "100%",
                    borderTop: `3px solid ${C.red}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 24,
                      color: C.black,
                    }}
                  >
                    Deux formats principaux
                  </h3>
                  <div style={{ fontSize: 15, lineHeight: 1.6 }}>
                    <div style={{ marginBottom: 24 }}>
                      <p
                        style={{
                          marginBottom: 8,
                          color: "#0a83ca",
                          fontWeight: 700,
                        }}
                      >
                        1. Panels
                      </p>
                      <p
                        style={{
                          marginBottom: 0,
                          paddingLeft: 18,
                          position: "relative",
                          color: "#43403c",
                          textAlign: "justify",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            fontSize: 16,
                          }}
                        >
                          •
                        </span>
                        Tables rondes réunissant experts, praticiens et
                        participants autour des profils Ennéagramme
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          marginBottom: 8,
                          color: "#0a83ca",
                          fontWeight: 700,
                        }}
                      >
                        2. Ateliers d'échanges
                      </p>
                      <p
                        style={{
                          marginBottom: 10,
                          paddingLeft: 18,
                          position: "relative",
                          color: "#43403c",
                          textAlign: "justify",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            fontSize: 16,
                          }}
                        >
                          •
                        </span>
                        Espaces plus intimistes et interactifs, centrés sur le
                        partage d'expériences vécues.
                      </p>
                      <p
                        style={{
                          marginBottom: 10,
                          paddingLeft: 18,
                          position: "relative",
                          color: "#43403c",
                          textAlign: "justify",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            fontSize: 16,
                          }}
                        >
                          •
                        </span>
                        <strong style={{ color: "#0a83ca" }}>Objectif :</strong>{" "}
                        favoriser l'apprentissage collaboratif en donnant la
                        parole aux participants et en valorisant leurs vécus.
                      </p>
                      <p
                        style={{
                          marginBottom: 0,
                          paddingLeft: 18,
                          position: "relative",
                          color: "#43403c",
                          textAlign: "justify",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            fontSize: 16,
                          }}
                        >
                          •
                        </span>
                        <strong style={{ color: "#0a83ca" }}>Format :</strong>{" "}
                        petits groupes, animations interactives, exercices de
                        co-développement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div
                  style={{
                    background: C.light,
                    borderRadius: 12,
                    padding: 36,
                    height: "100%",
                    borderTop: `3px solid ${C.blue}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 24,
                      color: C.black,
                    }}
                  >
                    Bénéfices pour les participants
                  </h3>
                  <div style={{ fontSize: 15, lineHeight: 1.6 }}>
                    <p
                      style={{
                        marginBottom: 14,
                        paddingLeft: 18,
                        position: "relative",
                        color: "#43403c",
                        textAlign: "justify",
                      }}
                    >
                      <span
                        style={{ position: "absolute", left: 0, fontSize: 16 }}
                      >
                        •
                      </span>
                      Développer une écoute active et une communication
                      authentique.
                    </p>
                    <p
                      style={{
                        marginBottom: 14,
                        paddingLeft: 18,
                        position: "relative",
                        color: "#43403c",
                        textAlign: "justify",
                      }}
                    >
                      <span
                        style={{ position: "absolute", left: 0, fontSize: 16 }}
                      >
                        •
                      </span>
                      S'enrichir de la diversité des expériences et des regards.
                    </p>
                    <p
                      style={{
                        marginBottom: 14,
                        paddingLeft: 18,
                        position: "relative",
                        color: "#43403c",
                        textAlign: "justify",
                      }}
                    >
                      <span
                        style={{ position: "absolute", left: 0, fontSize: 16 }}
                      >
                        •
                      </span>
                      Relier l'Ennéagramme aux réalités du quotidien
                      (personnelles, professionnelles, sociales).
                    </p>
                    <p
                      style={{
                        marginBottom: 0,
                        paddingLeft: 18,
                        position: "relative",
                        color: "#43403c",
                        textAlign: "justify",
                      }}
                    >
                      <span
                        style={{ position: "absolute", left: 0, fontSize: 16 }}
                      >
                        •
                      </span>
                      Créer une communauté vivante autour de l'Ennéagramme au
                      Maroc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            padding: "80px 20px",
            backgroundImage:
              "linear-gradient(rgba(232, 244, 253, 0.95), rgba(232, 244, 253, 0.95)), url('/assets/imgss001/coaching (23).jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderTop: `1px solid #e0e0e0`,
          }}
        >
          <style>{`
            @media (max-width: 767px) {
              .cta-pro-row { padding-left: 16px; padding-right: 16px; }
              .cta-pro-actions { flex-direction: column; gap: 12px; align-items: stretch; }
              .cta-pro-actions a { width: 100%; justify-content: center; text-align: center; }
            }
          `}</style>
          <div className="container">
            <div className="row justify-content-center cta-pro-row">
              <div className="col-lg-9 text-center">
                <h2
                  style={{
                    fontSize: 38,
                    fontWeight: 700,
                    marginBottom: 20,
                    lineHeight: 1.3,
                    color: C.black,
                  }}
                >
                  Co-créons votre programme EnnéaMaroc PRO
                </h2>
                <p
                  style={{
                    fontSize: 18,
                    lineHeight: 1.7,
                    marginBottom: 40,
                    color: C.gray,
                  }}
                >
                  Parlons de vos enjeux : cohésion, leadership, talents
                  émergents ou culture de dialogue.
                  <br />
                  Nous imaginons un parcours sur mesure pour vos équipes.
                </p>
                <div
                  className="cta-pro-actions"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to="/contact"
                    style={{
                      background: C.blue,
                      color: C.white,
                      padding: "16px 36px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Prendre un rendez-vous
                    <FaArrowRight />
                  </Link>
                  <Link
                    to="/"
                    style={{
                      border: `2px solid ${C.blue}`,
                      color: C.blue,
                      padding: "16px 36px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Retour à l'accueil
                    <FaHome />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
