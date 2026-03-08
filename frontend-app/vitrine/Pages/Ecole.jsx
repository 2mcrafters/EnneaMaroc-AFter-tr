import React, { useState } from "react";
import Seo from "../Components/Seo/Seo";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaBullseye,
  FaCheck,
  FaCompass,
  FaEye,
  FaEnvelope,
  FaGem,
  FaGraduationCap,
  FaHeart,
  FaStar,
  FaUsers,
} from "react-icons/fa";

export default function Ecole() {
  const C = {
    white: "#fff",
    black: "#1d1c1a",
    red: "#e13734",
    blue: "#0a83ca",
  };
  const [heroOk, setHeroOk] = useState(true);
  const [expandedTrainer, setExpandedTrainer] = useState(null);
  const toggleTrainer = (idx) => setExpandedTrainer(expandedTrainer === idx ? null : idx);

  const trainers = [
    {
      name: "Dr. Amina El Fassi",
      role: "Fondatrice & Formatrice Principale",
      photo: "/assets/imgss001/coaching (23).jpg",
      short: "Psychologue clinicienne et coach certifiée IEA, Dr. Amina accompagne depuis plus de 18 ans individus et organisations.",
      full: "Psychologue clinicienne et coach certifiée IEA, Dr. Amina accompagne depuis plus de 18 ans individus et organisations au Maroc et à l'international. Elle est l'une des pionnières de l'enseignement de l'Ennéagramme en langue arabe et française, et a formé plus de 500 coachs et praticiens certifiés. Sa pédagogie allie rigueur académique, expérience vécue et profonde humanité.",
    },
    {
      name: "Youssef Benali",
      role: "Formateur Senior — Ennéagramme & Leadership",
      photo: "/assets/imgss001/coaching (16).jpg",
      short: "Consultant en développement organisationnel et coach exécutif, Youssef intervient auprès de grandes entreprises marocaines et africaines.",
      full: "Consultant en développement organisationnel et coach exécutif, Youssef intervient auprès de grandes entreprises marocaines et africaines. Certifié IEA et formé à l'école Narrative, il spécialise ses formations sur les dynamiques d'équipe, la communication non violente et la transformation du leadership. Il anime régulièrement des ateliers en entreprise et en open public.",
    },
    {
      name: "Samira Ouazzani",
      role: "Formatrice — Ennéagramme & Bien-être",
      photo: "/assets/imgss001/coaching (47).jpg",
      short: "Praticienne certifiée en sophrologie et Ennéagramme, Samira intègre les approches corps-esprit dans ses programmes de développement personnel.",
      full: "Praticienne certifiée en sophrologie et Ennéagramme, Samira intègre les approches corps-esprit dans ses programmes de développement personnel. Elle accompagne particulièrement les femmes en transition professionnelle et personnelle, et co-dirige le module bien-être de l'École EnnéaMaroc. Son approche douce et rigoureuse crée un espace de confiance et de transformation profonde.",
    },
    {
      name: "Karim Tahiri",
      role: "Formateur — Ennéagramme & Éducation",
      photo: "/assets/imgss001/coaching (54).jpg",
      short: "Enseignant-chercheur et formateur en sciences de l'éducation, Karim développe des programmes d'intégration de l'Ennéagramme dans le milieu scolaire et universitaire.",
      full: "Enseignant-chercheur et formateur en sciences de l'éducation, Karim développe des programmes d'intégration de l'Ennéagramme dans le milieu scolaire et universitaire. Docteur en sciences de l'éducation, il a publié plusieurs articles sur l'Ennéagramme comme outil pédagogique et accompagne des établissements publics et privés dans la mise en place de dispositifs de connaissance de soi pour élèves et enseignants.",
    },
  ];

  const heroImg = `/assets/imgss001/` + encodeURIComponent("coaching (47).jpg");
  const OVERLAY_ALPHA = 0.82;
  const IMAGE_OPACITY = 0.7;

  // Section 2: Pédagogie (4 axes)
  const features = [
    {
      icon: FaBookOpen,
      title: "Approche narrative",
      description:
        "Comprendre l'ennéagramme à travers les récits authentiques et l'expérience vécue des personnes.",
    },
    {
      icon: FaHeart,
      title: "Expérience vivante",
      description:
        "Intégrer l'ennéagramme en le vivant directement, par des exercices et ressentis profonds.",
    },
    {
      icon: FaUsers,
      title: "Panel",
      description:
        "Écouter un groupe de personnes d'un même type partager leur réalité intérieure pour illustrer la dynamique du type.",
    },
    {
      icon: FaEye,
      title: "Auto-observation",
      description:
        "Développer la capacité à se voir fonctionner en temps réel pour repérer ses mécanismes.",
    },
  ];

  // Section 3: Vision / Mission / Valeurs
  const values = [
    {
      title: "Vision",
      icon: FaEye,
      description:
        "Être un espace de référence au Maroc et dans le monde arabe pour la transmission de l'Ennéagramme comme outil de connaissance de soi, de transformation et de développement collectif.",
    },
    {
      title: "Mission",
      icon: FaCompass,
      description:
        "Offrir des programmes certifiants et accessibles qui permettent à chacun de découvrir, approfondir et transmettre l'Ennéagramme selon les standards internationaux et adaptés à notre culture.",
    },
    {
      title: "Valeurs",
      icon: FaStar,
      description:
        "Humanité : mettre la personne au centre.\nOuverture : croiser traditions et modernité, culture locale et internationale.\nExcellence : conjuguer rigueur scientifique et pratique vécue.\nPartage : transmettre pour inspirer et faire grandir.",
    },
  ];

  // Styles helpers
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

  return (
    <main role="main">
      <Seo page="ecole" path="/ecole" />
      <div style={{ fontFamily: "system-ui, sans-serif", color: C.black }}>
        {/* HERO */}
        <section
          style={{
            position: "relative",
            minHeight: 550,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {heroOk && (
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
              <img
                src={heroImg}
                alt="École EnnéaMaroc"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: IMAGE_OPACITY,
                }}
                onError={() => setHeroOk(false)}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, rgba(10,131,202,${OVERLAY_ALPHA}) 0%, rgba(10,131,202,${
                    OVERLAY_ALPHA * 0.7
                  }) 100%)`,
                }}
              />
            </div>
          )}
          {!heroOk && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, ${C.blue} 0%, #0c6ea0 100%)`,
              }}
            />
          )}
          <div
            className="container"
            style={{
              position: "relative",
              zIndex: 1,
              padding:
                "clamp(200px, 25vh, 320px) 20px clamp(80px, 12vh, 120px)",
            }}
          >
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <h1
                  style={{
                    fontSize: "max(2.1vw, 32px)",
                    fontWeight: 600,
                    color: C.white,
                    marginBottom: 20,
                    lineHeight: 1.2,
                  }}
                >
                  L'École EnnéaMaroc
                </h1>
                <p
                  style={{
                    fontSize: 20,
                    color: "rgba(255,255,255,0.95)",
                    maxWidth: 900,
                    margin: "0 auto",
                    lineHeight: 1.6,
                  }}
                >
                  Formateurs certifiés, chercheurs universitaires, coachs et
                  praticiens <br /> unis pour une transmission vivante,
                  rigoureuse et humaine de l'Ennéagramme.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 1) ÉQUIPE */}
        <section style={{ padding: "60px 20px", background: C.white }}>
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-6">
                <h2
                  style={{
                    fontSize: "max(2.1vw, 32px)",
                    fontWeight: 600,
                    color: C.blue,
                    marginBottom: 20,
                  }}
                >
                  Une équipe pluridisciplinaire
                </h2>
                <p
                  style={{
                    fontSize: 17,
                    color: "#6c757d",
                    lineHeight: 1.8,
                    marginBottom: 20,
                    textAlign: "justify",
                  }}
                >
                  L'École EnnéaMaroc réunit une équipe pluridisciplinaire
                  composée de formateurs certifiés, de chercheurs
                  universitaires, de coachs professionnels et de praticiens de
                  terrain. Chacun apporte sa singularité, son expertise et son
                  expérience humaine, afin de créer une dynamique
                  d'apprentissage vivante et riche.
                </p>
                <Link
                  to="/#pourquoi-ennea-maroc"
                  style={{
                    ...btn(C.blue, C.white),
                    fontSize: 16,
                    padding: "12px 24px",
                    fontWeight: 600,
                  }}
                >
                  Découvrir l'équipe
                  <FaArrowRight
                    style={{ marginLeft: 8, verticalAlign: "middle" }}
                    aria-hidden="true"
                  />
                </Link>
              </div>

              <div className="col-lg-6">
                <div
                  style={{
                    position: "relative",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  }}
                >
                  <img
                    src="/assets/imgss001/coaching%20(54).jpg"
                    alt="Équipe EnnéaMaroc"
                    style={{ width: "100%", height: "auto", display: "block" }}
                    onError={(e) => {
                      e.target.src = "/assets/imgss001/coaching (16).jpg";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 24,
                      left: 24,
                      right: 24,
                      background: "rgba(255,255,255,0.92)",
                      backdropFilter: "blur(10px)",
                      padding: "18px 22px",
                      borderRadius: 16,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
                      borderLeft: `4px solid ${C.blue}`,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.blue, marginBottom: 4 }}>
                      Notre approche
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.black, marginBottom: 10 }}>
                      Humaine • Rigoureuse • Ancrée
                    </div>
                    <div style={{ height: 1, background: "rgba(10,131,202,0.15)", marginBottom: 10 }} />
                    <p style={{ fontSize: 14, color: "#555", lineHeight: 1.65, margin: 0 }}>
                      Notre force : l'union de compétences locales et internationales pour garantir une pédagogie adaptée au contexte marocain et ouverte sur le monde.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2) PÉDAGOGIE */}
        <section style={{ padding: "60px 20px", background: C.blue }}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h2
                  style={{
                    fontSize: "max(2.1vw, 32px)",
                    fontWeight: 600,
                    color: C.white,
                    marginBottom: 15,
                  }}
                >
                  Une pédagogie en 4 axes
                </h2>
                <p
                  style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.7,
                  }}
                >
                  Une pédagogie vivante qui conjugue expérience, pratique,
                  adaptation et accompagnement.
                </p>
              </div>
            </div>

            <div className="row g-4">
              {features.map((ft, idx) => (
                <div key={idx} className="col-lg-6">
                  <div
                    style={{
                      ...card,
                      transition: "all 0.3s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.04)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: "50%",
                          background: `${C.red}10`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {(() => {
                          const Icon = ft.icon;
                          return (
                            <Icon size={28} color={C.red} aria-hidden="true" />
                          );
                        })()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: C.black,
                            marginBottom: 10,
                          }}
                        >
                          {ft.title}
                        </h3>
                        <p
                          style={{
                            whiteSpace: "pre-line",
                            fontSize: 16,
                            color: "#6c757d",
                            margin: 0,
                            lineHeight: 1.7,
                            textAlign: "justify",
                          }}
                        >
                          {ft.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3) VISION • MISSION • VALEURS */}
        <section style={{ padding: "60px 20px", background: "#f8f9fa" }}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h2
                  style={{
                    fontSize: "max(2.1vw, 32px)",
                    fontWeight: 600,
                    color: C.blue,
                    marginBottom: 15,
                  }}
                >
                  Cap, raison d'être et principes
                </h2>
              </div>
            </div>

            <div className="row g-4">
              {values.map((val, idx) => (
                <div key={idx} className="col-lg-4">
                  <div
                    style={{
                      ...card,
                      borderTop: `4px solid ${C.blue}`,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.04)";
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: `${C.blue}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                        }}
                      >
                        {(() => {
                          const Icon = val.icon;
                          return (
                            <Icon size={32} color={C.blue} aria-hidden="true" />
                          );
                        })()}
                      </div>
                      <h3
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: C.black,
                          marginBottom: 12,
                        }}
                      >
                        {val.title}
                      </h3>
                      <p
                        style={{
                          whiteSpace: "pre-line",
                          fontSize: 16,
                          color: "#6c757d",
                          margin: 0,
                          lineHeight: 1.8,
                          textAlign: "justify",
                        }}
                      >
                        {val.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4) NOTRE APPROCHE À L'ENNÉA-MAROC */}
        <section style={{ padding: "60px 20px", background: C.blue }}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-10 text-center">
                <h2
                  style={{
                    fontSize: "max(2.1vw, 32px)",
                    fontWeight: 600,
                    color: C.white,
                    marginBottom: 20,
                  }}
                >
                  Une approche enracinée et universelle
                </h2>
              </div>
            </div>

            <div className="row g-4">
              {/* Left Card - Notre Vocation */}
              <div className="col-lg-6">
                <div
                  style={{
                    background: C.white,
                    borderRadius: 20,
                    padding: 35,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    height: "100%",
                  }}
                >
                  <div style={{ marginBottom: 30 }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 50,
                        height: 50,
                        borderRadius: 12,
                        background: `${C.blue}15`,
                        marginBottom: 20,
                      }}
                    >
                      <FaBullseye size={24} color={C.blue} aria-hidden="true" />
                    </div>
                    <h3
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: C.black,
                        marginBottom: 15,
                      }}
                    >
                      Notre Vocation
                    </h3>
                    <p
                      style={{
                        fontSize: 16,
                        color: "#6c757d",
                        lineHeight: 1.7,
                        marginBottom: 25,
                        textAlign: "justify",
                        hyphens: "auto",
                      }}
                    >
                      En tant que première école de l'Ennéagramme au Maroc, nous
                      avons pour vocation de :
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                    }}
                  >
                    {[
                      "Accompagner chacun vers une reconnexion à son essence.",
                      "Valoriser une pédagogie expérientielle : exercices pratiques, panels, méditations guidées, partage d'expériences.",
                      "Favoriser une culture de l'intégration et de l'équilibre dans la vie personnelle comme professionnelle.",
                    ].map((text, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "start",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: C.blue,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          <FaCheck
                            size={12}
                            color={C.white}
                            aria-hidden="true"
                          />
                        </div>
                        <p
                          style={{
                            fontSize: 15,
                            color: "#6c757d",
                            margin: 0,
                            lineHeight: 1.7,
                            textAlign: "justify",
                            hyphens: "auto",
                          }}
                        >
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Card - Ce Qui Nous Distingue */}
              <div className="col-lg-6">
                <div
                  style={{
                    background: C.white,
                    borderRadius: 20,
                    padding: 35,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    height: "100%",
                  }}
                >
                  <div style={{ marginBottom: 30 }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 50,
                        height: 50,
                        borderRadius: 12,
                        background: `${C.red}15`,
                        marginBottom: 20,
                      }}
                    >
                      <FaGem size={24} color={C.red} aria-hidden="true" />
                    </div>
                    <h3
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: C.black,
                        marginBottom: 15,
                      }}
                    >
                      Ce Qui Nous Distingue
                    </h3>
                    <p
                      style={{
                        fontSize: 16,
                        color: "#6c757d",
                        lineHeight: 1.7,
                        marginBottom: 25,
                        textAlign: "justify",
                        hyphens: "auto",
                      }}
                    >
                      EnnéaMaroc se distingue par :
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                    }}
                  >
                    {[
                      {
                        title: "Ouverture",
                        text: "à la fois enracinée dans le contexte marocain et connectée aux courants internationaux.",
                      },
                      {
                        title: "Diversité",
                        text: "nos formations s'adressent aussi bien aux étudiants, professionnels, coachs, enseignants, managers, psychologues, qu'à toute personne en quête de sens et de transformation.",
                      },
                      {
                        title: "Ancrage",
                        text: "nous valorisons la richesse culturelle et humaine du Maroc, en l'intégrant dans l'enseignement de l'Ennéagramme.",
                      },
                      {
                        title: "Engagement",
                        text: "contribuer à l'émergence d'une nouvelle génération de leaders humains, responsables et alignés.",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "start",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: C.red,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          <FaStar
                            size={11}
                            color={C.white}
                            aria-hidden="true"
                          />
                        </div>
                        <p
                          style={{
                            fontSize: 15,
                            color: "#6c757d",
                            margin: 0,
                            lineHeight: 1.7,
                            textAlign: "justify",
                            hyphens: "auto",
                          }}
                        >
                          <strong style={{ color: C.black }}>
                            {item.title}
                          </strong>{" "}
                          : {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NOTRE ÉQUIPE DE FORMATEURS */}
        <section style={{ padding: "70px 20px", background: C.white }}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h2 style={{ fontSize: "max(2.1vw, 32px)", fontWeight: 600, color: C.blue, marginBottom: 10 }}>
                  Notre équipe de formateurs
                </h2>
                <p style={{ fontSize: 17, color: "#6c757d", lineHeight: 1.7 }}>
                  Des experts passionnés, engagés à transmettre l'Ennéagramme avec rigueur et humanité.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {trainers.map((t, idx) => (
                <React.Fragment key={idx}>
                  {idx === 2 && (
                    <div style={{ position: "relative", margin: "8px 0", height: 3, borderRadius: 99, overflow: "hidden", background: "rgba(10,131,202,0.12)" }}>
                      <div style={{
                        position: "absolute",
                        top: 0, left: 0,
                        height: "100%",
                        width: "100%",
                        background: "linear-gradient(90deg, transparent, #0a83ca, #e13734, #0a83ca, transparent)",
                        backgroundSize: "200% 100%",
                        animation: "trainerDivider 5s ease-in-out infinite",
                      }} />
                      <style>{`@keyframes trainerDivider { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 28,
                      background: "#f8f9fa",
                      borderRadius: 20,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      alignItems: "stretch",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Photo */}
                    <div style={{ flexShrink: 0, width: "clamp(120px, 22%, 220px)", minHeight: 200 }}>
                      <img
                        src={t.photo}
                        alt={t.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => { e.target.src = "/assets/imgss001/coaching (16).jpg"; }}
                      />
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, padding: "28px 28px 22px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 220 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.blue, marginBottom: 6 }}>
                        {t.role}
                      </div>
                      <h3 style={{ fontSize: "clamp(18px, 1.6vw, 22px)", fontWeight: 700, color: C.black, marginBottom: 12 }}>
                        {t.name}
                      </h3>
                      <p style={{ fontSize: 15, color: "#6c757d", lineHeight: 1.75, margin: "0 0 14px", textAlign: "justify" }}>
                        {expandedTrainer === idx ? t.full : t.short}
                      </p>
                      <button
                        onClick={() => toggleTrainer(idx)}
                        style={{
                          alignSelf: "flex-start",
                          background: "none",
                          border: `1.5px solid ${C.blue}`,
                          color: C.blue,
                          borderRadius: 50,
                          padding: "6px 18px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C.blue; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.blue; }}
                      >
                        {expandedTrainer === idx ? "Lire moins ▲" : "Lire tout ▼"}
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "60px 20px", background: "#eef2f6" }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2
                  style={{
                    fontSize: "max(2.1vw, 32px)",
                    fontWeight: 600,
                    color: C.blue,
                    marginBottom: 20,
                  }}
                >
                  Rejoindre une communauté d'apprentissage vivante
                </h2>
                <p
                  style={{
                    fontSize: 18,
                    color: "#6c757d",
                    marginBottom: 35,
                    lineHeight: 1.7,
                  }}
                >
                  Découvrez nos parcours certifiants et entrez dans une
                  dynamique de transformation personnelle et collective.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 15,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to="/découvrir"
                    style={{
                      ...btn(C.blue, C.white),
                      fontSize: 16,
                      padding: "14px 28px",
                      fontWeight: 600,
                    }}
                  >
                    Parcours & Modules{" "}
                    <FaGraduationCap
                      style={{ marginLeft: 8, verticalAlign: "middle" }}
                      aria-hidden="true"
                    />
                  </Link>
                  <Link
                    to="/contact"
                    className="btn btn--red-white"
                    style={{
                      ...btn(C.red, C.white),
                      fontSize: 16,
                      padding: "14px 28px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      textDecoration: "none",
                    }}
                  >
                    Demander des informations{" "}
                    <FaEnvelope
                      style={{ marginLeft: 8, verticalAlign: "middle" }}
                      aria-hidden="true"
                    />
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
