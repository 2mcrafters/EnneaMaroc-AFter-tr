import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const target = sessionStorage.getItem("scrollTo");
    if (target) {
      sessionStorage.removeItem("scrollTo");
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, []);

  const trainers = [
    {
      name: "Chafik MEKRAI HARTI",
      role: "Co-Fondateur & Formateur Principale",
      photo: "/assets/imgss001/chafik.jpg",
      short: "Je suis coach d'organisations, formateur senior et chercheur en Ennéagramme, engagé depuis plus de deux décennies dans l'exploration des mécanismes de la personnalité, des dynamiques relationnelles et des leviers de transformation humaine.",
      full: "Je suis coach d'organisations, formateur senior et chercheur en Ennéagramme, engagé depuis plus de deux décennies dans l'exploration des mécanismes de la personnalité, des dynamiques relationnelles et des leviers de transformation humaine. Directeur Général du cabinet Horizon Ressources Humaines depuis 2007 et co-créateur de l'école EnneaMaroc, j'accompagne dirigeants, équipes, coachs et particuliers dans un chemin de conscience qui relie performance, humanité et sens.\n\nMon approche s'appuie sur l'Ennéagramme comme cartographie vivante de la conscience, enrichie par la PNL, l'intelligence émotionnelle, l'approche systémique et l'intelligence collective. Je conçois des parcours d'apprentissage progressifs, expérientiels et profondément transformateurs, visant non seulement le développement des compétences, mais aussi l'évolution de la posture intérieure.\n\nMa philosophie d'accompagnement repose sur trois piliers : se comprendre pour mettre de la lumière sur ses fonctionnements, se libérer de ses automatismes et conditionnements, puis devenir autonome dans ses décisions, afin d'agir avec discernement, responsabilité et alignement, au service de soi, des autres et de la société.",
    },
    {
      name: "Yousra Andalib",
      role: "Co-Fondatrice — Formatrice, Coach & Thérapeute",
      photo: "/assets/imgss001/youssra andalib.png",
      short: "Je suis Dr Yousra Andalib, experte en accompagnement de l'humain. J'interviens en tant que formatrice, Coach et Thérapeute en psycho-énergie, et j'accompagne toute personne dans son chemin de connaissance de soi, de conscience et de transformation.",
      full: "Je suis Dr Yousra Andalib, experte en accompagnement de l'humain. J'interviens en tant que formatrice, Coach et Thérapeute en psycho-énergie, et j'accompagne toute personne dans son chemin de connaissance de soi, de conscience et de transformation.\n\nPassionnée par la complexité de l'être humain, je suis convaincue que chacun porte en lui une richesse singulière et une empreinte unique à offrir au monde. Ma philosophie s'inspire du colibri : chacun, à sa mesure, peut contribuer à un changement plus conscient, plus aligné et plus humain.\n\nÀ travers l'Ennéagramme, je crée des espaces d'exploration intérieure, de sens et d'évolution durable. Au sein d'EnnéaMaroc, première école de l'Ennéagramme au Maroc, je m'engage en tant que co-fondatrice à incarner cette philosophie, en plaçant la connaissance de soi, la responsabilité et la conscience au cœur de toute transformation humaine.",
    },
    {
      name: "Philippe Halin",
      role: "Formateur — Psychologue & Psychothérapeute",
      photo: "/assets/imgss001/Philippe Halin.avif",
      short: "Je suis Philippe Halin, psychologue et psychothérapeute. Mon parcours s'est d'abord ancré dans l'accompagnement de publics en grande précarité : j'ai travaillé pendant 12 ans auprès de personnes sans-abri, une expérience profondément humaine.",
      full: "Je suis Philippe Halin, psychologue et psychothérapeute. Mon parcours s'est d'abord ancré dans l'accompagnement de publics en grande précarité : j'ai travaillé pendant 12 ans auprès de personnes sans-abri, une expérience profondément humaine qui a nourri ma compréhension de la vulnérabilité, de la résilience et de la dignité de chacun.\n\nJ'ai ensuite consacré plus de 25 ans à la formation d'adultes, en accompagnant des professionnels, des équipes et des organisations dans leurs processus d'évolution personnelle et collective. Mon approche relie la psychologie, la pédagogie expérientielle et la connaissance de soi, avec une attention particulière portée aux dynamiques relationnelles et aux potentiels de transformation.\n\nÀ travers l'Ennéagramme et les espaces d'accompagnement que je coanime, je m'engage à soutenir des chemins de conscience, d'authenticité et de croissance intérieure, avec la conviction que chaque être humain porte en lui des ressources essentielles pour évoluer et contribuer au monde.",
    },
    {
      name: "Isabelle Arimont",
      role: "Formatrice — Criminologue & Pédagogue",
      photo: "/assets/imgss001/Isabelle Arimont.avif",
      short: "Je suis Isabelle Arimont, criminologue de formation. Mon parcours m'a menée vers la recherche, l'enseignement de la psychologie dans le secondaire, la didactique à l'UCL, ainsi que vers la danse contemporaine.",
      full: "Je suis Isabelle Arimont, criminologue de formation. Mon parcours m'a menée vers la recherche, l'enseignement de la psychologie dans le secondaire, la didactique à l'UCL, ainsi que vers la danse contemporaine, autant de voies qui nourrissent ma compréhension du mouvement humain, intérieur comme extérieur.\n\nJ'aime mettre les personnes en mouvement, au sens propre comme au sens symbolique, et créer des passerelles vivantes vers l'univers des jeunes et des générations en devenir. Mon approche relie le corps, la pédagogie et la conscience de soi pour favoriser l'expression, la créativité et la transformation.\n\nÀ travers mes interventions et les espaces que je coanime, je m'engage à éveiller chacun à sa beauté essentielle, à inviter à un regard plus doux et plus bienveillant sur soi, et à accompagner l'émergence d'une présence plus libre, plus consciente et plus vivante au monde.",
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
                  to="/ecole"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("equipe-formateurs");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
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
        <section id="equipe-formateurs" style={{ padding: "clamp(40px,6vw,70px) 16px", background: C.white }}>
          <style>{`
            @keyframes trainerDivider { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

            /* === DESKTOP CARD === */
            .trainer-card { display:flex; flex-direction:row; gap:0; background:#f8f9fa; border-radius:20px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,0.07); align-items:stretch; }
            .trainer-photo { flex-shrink:0; width:clamp(140px,26%,260px); min-height:220px; position:relative; }
            .trainer-photo img { width:100%; height:100%; object-fit:cover; display:block; }
            .trainer-content { flex:1; padding:24px 24px 20px; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:1; min-width:0; }
            .trainer-role { font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#0a83ca; margin-bottom:5px; }
            .trainer-name { font-size:clamp(16px,1.6vw,21px); font-weight:700; color:#0e1b25; margin-bottom:10px; line-height:1.3; }
            .trainer-desc { font-size:14px; line-height:1.75; margin:0 0 12px; text-align:justify; }
            .trainer-desc p { color:#1f2937 !important; margin:0; }
            .trainer-desc p + p { margin-top:10px; }
            .trainer-btn { align-self:flex-start; background:none; border:1.5px solid #0a83ca; color:#0a83ca; border-radius:50px; padding:7px 20px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; }
            .trainer-btn:hover { background:#0a83ca; color:#fff; }

            /* === MOBILE CARD === */
            @media (max-width: 600px) {
              .trainer-card {
                flex-direction: row;
                align-items: flex-start;
                border-radius: 16px;
                gap: 0;
                background: #fff;
                box-shadow: 0 3px 18px rgba(0,0,0,0.09);
              }
              /* Left: square photo with name/role badge underneath */
              .trainer-photo {
                width: 110px;
                min-width: 110px;
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                background: #0a83ca;
                min-height: 100%;
              }
              .trainer-photo img {
                width: 110px;
                height: 130px;
                object-fit: cover;
                object-position: top center;
                display: block;
              }
              .trainer-photo-badge {
                padding: 8px 8px 10px;
                background: #0a83ca;
                text-align: center;
              }
              .trainer-photo-badge .badge-name {
                font-size: 11px;
                font-weight: 700;
                color: #fff;
                line-height: 1.3;
                word-break: break-word;
              }
              .trainer-photo-badge .badge-role {
                font-size: 9px;
                font-weight: 600;
                color: rgba(255,255,255,0.82);
                margin-top: 3px;
                letter-spacing: 0.04em;
                line-height: 1.3;
              }
              /* Right: content */
              .trainer-content {
                flex: 1;
                padding: 14px 14px 14px;
                min-width: 0;
                justify-content: flex-start;
              }
              .trainer-role { display: none; }
              .trainer-name { display: none; }
              .trainer-desc { font-size: 12.5px; line-height: 1.7; margin-bottom: 10px; }
              .trainer-btn {
                width: 100%;
                display: block;
                text-align: center;
                padding: 9px 16px;
                font-size: 13px;
                border-radius: 10px;
              }
            }
          `}</style>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h2 style={{ fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 600, color: C.blue, marginBottom: 10 }}>
                  Notre équipe de formateurs
                </h2>
                <p style={{ fontSize: "clamp(14px,1.5vw,17px)", color: "#6c757d", lineHeight: 1.7, margin: 0 }}>
                  Des experts passionnés, engagés à transmettre l'Ennéagramme avec rigueur et humanité.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px,2vw,28px)" }}>
              {trainers.map((t, idx) => (
                <React.Fragment key={idx}>
                  {idx === 2 && (
                    <div style={{ position: "relative", margin: "4px 0", height: 3, borderRadius: 99, overflow: "hidden", background: "rgba(10,131,202,0.12)" }}>
                      <div style={{
                        position: "absolute", top: 0, left: 0, height: "100%", width: "100%",
                        background: "linear-gradient(90deg, transparent, #0a83ca, #e13734, #0a83ca, transparent)",
                        backgroundSize: "200% 100%", animation: "trainerDivider 5s ease-in-out infinite",
                      }} />
                    </div>
                  )}
                  <div className="trainer-card">
                    <div className="trainer-photo">
                      <img
                        src={t.photo}
                        alt={t.name}
                        onError={(e) => { e.target.src = "/assets/imgss001/coaching (16).jpg"; }}
                      />
                      <div className="trainer-photo-badge">
                        <div className="badge-name">{t.name}</div>
                        <div className="badge-role">{t.role}</div>
                      </div>
                    </div>
                    <div className="trainer-content">
                      <div className="trainer-role">{t.role}</div>
                      <h3 className="trainer-name">{t.name}</h3>
                      <div className="trainer-desc">
                        {(expandedTrainer === idx ? t.full : t.short)
                          .split("\n\n")
                          .map((para, i) => (
                            <p key={i} style={{ color: "#1f2937" }}>{para}</p>
                          ))}
                      </div>
                      <button
                        className="trainer-btn"
                        onClick={() => toggleTrainer(idx)}
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
