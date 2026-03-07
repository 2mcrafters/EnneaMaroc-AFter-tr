"use client";

import { useMemo, useState } from "react";
import data from "../../Data/testimonial1.json";

/* ---------- Decorative inline icons ---------- */
const Icon = ({ i = 0, strokeColor = "rgba(255,255,255,0.92)" }) => {
  const which = i % 3;

  if (which === 0) {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 3l1.7 4.1 4.3 1.7-4.3 1.7L12 15l-1.7-4.5-4.3-1.7 4.3-1.7L12 3z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 4l.8 2 .8 2-2-.8-2-.8 2-.8 2-.8zM5 14l.8 2 .8 2-2-.8-2-.8 2-.8 2-.8z"
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (which === 1) {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="7.5"
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        <circle
          cx="12"
          cy="12"
          r="3.5"
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        <path
          d="M12 2v3M12 19v3M2 12h3M19 12h3"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4H20v13.5A2.5 2.5 0 0 1 17.5 20H7.5A2.5 2.5 0 0 0 5 22V6.5z"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h.5V18"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const baseConfig = [
  {
    label: "Définition",
    order: "01",
    tag: "Racines spirituelles et transmissions modernes",
    accent: "#e13734",
    fallbackTitle: "Une sagesse ancienne aux racines multiples",
    fallbackDesc: "",
  },
  {
    label: "Philosophie",
    order: "02",
    tag: "Accueillir nos différences, honorer notre essence",
    accent: "#ff9f1c",
    fallbackTitle: "Connaissance de soi et découverte des autres",
    fallbackDesc: "",
  },
  {
    label: "Croissance",
    order: "03",
    tag: "Aligner corps, cœur et esprit pour se transformer",
    accent: "#0a83ca",
    fallbackTitle: "Un chemin de croissance personnelle",
    fallbackDesc: "",
  },
  {
    label: "Relations",
    order: "04",
    tag: "Co-créer des liens conscients et responsables",
    accent: "#5f4dee",
    fallbackTitle: "Un art de relation et de leadership",
    fallbackDesc: "",
  },
];

const TestimonialComponent = () => {
  const items = useMemo(
    () =>
      baseConfig.map((cfg, index) => {
        const entry = data[index] ?? {};
        return {
          ...cfg,
          title: entry.title ?? cfg.fallbackTitle,
          desc: entry.desc ?? cfg.fallbackDesc,
        };
      }),
    [data]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];
  const totalItems = items.length;

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalItems);
  };

  const getWrapperStyle = (variant = "desktop") => {
    if (variant === "mobile") {
      return {
        display: "none",
        flexDirection: "column",
        gap: "10px",
        justifyContent: "center",
        alignItems: "stretch",
        width: "100%",
        padding: "0 18px 18px",
        marginBottom: "28px",
      };
    }

    return {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      justifyContent: "center",
      marginBottom: "48px",
    };
  };

  const getButtonStyle = (isActive, variant, accent) => {
    const isMobile = variant === "mobile";
    return {
      cursor: "pointer",
      padding: isMobile ? "12px 18px" : "16px 30px",
      borderRadius: "999px",
      border: `1px solid ${isActive ? "#ffffff" : "rgba(255, 255, 255, 0.35)"}`,
      background: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.14)",
      color: isActive ? accent : "rgba(255, 255, 255, 0.92)",
      fontWeight: 800,
      letterSpacing: isMobile ? "0.08em" : "1.4px",
      textTransform: "uppercase",
      fontSize: isMobile ? "11px" : "13px",
      transition: "all 0.25s ease",
      backdropFilter: "blur(10px)",
      boxShadow: isActive
        ? "0 8px 24px rgba(255, 255, 255, 0.25)"
        : "0 6px 18px rgba(0, 0, 0, 0.18)",
      width: isMobile ? "100%" : "auto",
      textAlign: "center",
    };
  };

  const renderTabs = (variant = "desktop") => (
    <div
      role="tablist"
      className={`ennea-tabs-wrapper ennea-tabs-wrapper-${variant}`}
      style={getWrapperStyle(variant)}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const buttonStyle = getButtonStyle(isActive, variant, item.accent);
        return (
          <button
            key={`${variant}-${item.label}`}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveIndex(index)}
            className="ennea-tab-button"
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e13734";
              e.currentTarget.style.borderColor = "#e13734";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.boxShadow =
                "0 10px 28px rgba(225, 55, 52, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isActive
                ? "#ffffff"
                : "rgba(255, 255, 255, 0.14)";
              e.currentTarget.style.borderColor = isActive
                ? "#ffffff"
                : "rgba(255, 255, 255, 0.35)";
              e.currentTarget.style.color = isActive
                ? item.accent
                : "rgba(255, 255, 255, 0.92)";
              e.currentTarget.style.boxShadow = isActive
                ? "0 8px 24px rgba(255, 255, 255, 0.25)"
                : "0 6px 18px rgba(0, 0, 0, 0.18)";
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );

  const renderDescription = (
    desc,
    {
      paragraphColor = "rgba(14, 27, 37, 0.88)",
      bulletColor = "rgba(14, 27, 37, 0.76)",
    } = {}
  ) => {
    if (!desc) {
      return null;
    }

    const lines = desc.split("\n");
    const elements = [];
    let bullets = [];

    const flushBullets = (keyPrefix) => {
      if (!bullets.length) {
        return;
      }
      elements.push(
        <ul
          key={`ul-${keyPrefix}`}
          style={{
            margin: "0 0 16px 18px",
            color: bulletColor,
            fontSize: "16px",
            lineHeight: "1.7",
          }}
        >
          {bullets.map((b, idx) => (
            <li key={`li-${keyPrefix}-${idx}`}>{b}</li>
          ))}
        </ul>
      );
      bullets = [];
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushBullets(`gap-${idx}`);
        return;
      }

      const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-");
      if (isBullet) {
        bullets.push(trimmed.replace(/^[-•]\s*/, ""));
        if (idx === lines.length - 1) {
          flushBullets(`tail-${idx}`);
        }
        return;
      }

      flushBullets(`pre-${idx}`);

      elements.push(
        <p
          key={`p-${idx}`}
          style={{
            margin: "0 0 18px",
            color: paragraphColor,
            fontSize: "17px",
            lineHeight: "1.75",
          }}
        >
          {trimmed}
        </p>
      );
    });

    flushBullets("end");

    return elements;
  };

  if (!active) {
    return null;
  }

  return (
    <>
      <section
        id="enneagramme-section"
        style={{
          position: "relative",
          background: "linear-gradient(135deg, #0a83ca 0%, #073c86 100%)",
          padding: "64px 0 72px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            background:
              "radial-gradient(circle at 20% 20%, #e13734 0%, transparent 60%), radial-gradient(circle at 80% 30%, #ff9f1c 0%, transparent 55%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1340px",
            margin: "0 auto",
            padding: "0 40px",
          }}
        >
          {/* Hero text */}
          <div
            className="ennea-hero-wrapper"
            style={{
              width: "100%",
              maxWidth: "960px",
              margin: "0 auto 44px",
              color: "#ffffff",
              display: "grid",
              gap: "12px",
              textAlign: "left",
              justifyItems: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <h1
              className="ennea-hero-heading"
              style={{
                margin: 0,
                padding: "0 8px",
                fontSize: "clamp(20px, 2.7vw, 36px)",
                lineHeight: 1.18,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "#ffffff",
              }}
            >
              L’ENNÉAGRAMME : UNE CARTE VIVANTE DE L’ÊTRE HUMAIN
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
              }}
            >
              <img
                src="/assets/images/logo/enneamaroc-logo.png"
                alt="EnnéaMaroc"
                style={{
                  width: 72,
                  height: "auto",
                  filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
                }}
              />
            </div>
            <p
              className="ennea-hero-subtitle"
              style={{
                margin: 0,
                fontSize: "16px",
                color: "rgba(255, 255, 255, 0.86)",
                fontWeight: 600,
                lineHeight: 1.4,
                padding: "0 8px",
              }}
            >
              Plus qu’un outil, une voie de transformation
            </p>
            <div
              className="ennea-hero-body"
              style={{
                display: "grid",
                gap: "12px",
                width: "100%",
                color: "rgba(255, 255, 255, 0.78)",
                fontSize: "15px",
                lineHeight: "1.5",
                padding: "0 8px",
              }}
            >
              <p style={{ margin: 0 }}>
                L’Ennéagramme n’est pas seulement un modèle de personnalité.
              </p>
              <p style={{ margin: 0 }}>
                C’est une carte vivante des dynamiques humaines, un miroir qui
                révèle nos forces, nos fragilités, et les chemins d’évolution
                possibles.
              </p>
              <p style={{ margin: 0 }}>
                Il nous aide à passer de la survie automatique à la présence
                consciente, en ouvrant un espace de liberté intérieure.
              </p>
            </div>
          </div>
          {/* Responsive overrides for small screens */}
          <style>
            {`
              .ennea-tabs-wrapper-mobile {
                display: none;
              }

              @media (max-width: 640px) {
                .ennea-tabs-wrapper-desktop {
                  display: none !important;
                }

                .ennea-tabs-wrapper-mobile {
                  display: flex !important;
                }

                .ennea-hero-wrapper {
                  padding: 0 18px;
                  gap: 14px !important;
                  margin-bottom: 32px !important;
                }

                .ennea-hero-heading {
                  font-size: 22px !important;
                  line-height: 1.18 !important;
                  white-space: normal !important;
                  letter-spacing: 0.04em !important;
                }

                .ennea-hero-label {
                  font-size: 10px !important;
                  letter-spacing: 0.18em !important;
                  padding: 10px 18px !important;
                }

                .ennea-hero-subtitle {
                  font-size: 12px !important;
                  letter-spacing: 0.16em !important;
                  line-height: 1.25 !important;
                }

                .ennea-hero-body {
                  font-size: 13px !important;
                  line-height: 1.55 !important;
                  gap: 8px !important;
                }

                .ennea-hero-body p {
                  white-space: normal !important;
                }
              }

              @media (max-width: 420px) {
                .ennea-tabs-wrapper-mobile {
                  padding: 0 14px 16px !important;
                  gap: 8px !important;
                }

                .ennea-tab-button {
                  font-size: 10px !important;
                  padding: 10px 16px !important;
                  letter-spacing: 0.06em !important;
                }
              }

              @media (max-width: 360px) {
                .ennea-tabs-wrapper-mobile {
                  padding: 0 12px 14px !important;
                }

                .ennea-tab-button {
                  font-size: 9px !important;
                  padding: 9px 14px !important;
                  letter-spacing: 0.05em !important;
                }
              }

              @media (min-width: 641px) and (max-width: 768px) {
                .ennea-tab-button {
                  padding: 12px 20px !important;
                  font-size: 11px !important;
                  letter-spacing: 1px !important;
                }
              }

              @media (max-width: 768px) {
                .ennea-main-grid {
                  grid-template-columns: 1fr !important;
                }

                .ennea-side-grid {
                  display: none !important;
                }
              }
            `}
          </style>
          {/* Tabs */}
          {renderTabs("desktop")}
          {renderTabs("mobile")}
          {/* Active panel styled like Philosophie section */}
          <div
            style={{
              maxWidth: "980px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.7), rgba(255,255,255,0.2))",
                padding: "2px",
                borderRadius: "28px",
                boxShadow: "0 28px 70px rgba(5, 28, 50, 0.28)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 34px 90px rgba(5, 28, 50, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 28px 70px rgba(5, 28, 50, 0.28)";
              }}
            >
              <article
                style={{
                  background: "#ffffff",
                  borderRadius: "26px",
                  padding: "40px 48px",
                  color: "#0e1b25",
                  display: "grid",
                  gap: "32px",
                  boxShadow: "0 20px 60px rgba(5, 28, 50, 0.1)",
                }}
              >
                <div
                  className="ennea-main-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) 240px",
                    gap: "32px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: "18px",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "18px",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          placeItems: "center",
                          width: "64px",
                          height: "64px",
                          borderRadius: "20px",
                          background: `linear-gradient(135deg, ${active.accent} 0%, rgba(14, 27, 37, 0.08) 100%)`,
                          boxShadow: "0 18px 32px rgba(10,131,202,0.18)",
                        }}
                      >
                        <Icon i={activeIndex} strokeColor="#ffffff" />
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: active.accent,
                          }}
                        >
                          {active.label}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#0e1b25",
                            maxWidth: "360px",
                          }}
                        >
                          {active.title}
                        </p>
                      </div>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        color: "rgba(14, 27, 37, 0.8)",
                        lineHeight: "1.6",
                      }}
                    >
                      {active.tag}
                    </p>
                    <div>
                      {renderDescription(active.desc, {
                        paragraphColor: "rgba(14, 27, 37, 0.88)",
                        bulletColor: "rgba(14, 27, 37, 0.75)",
                      })}
                    </div>
                  </div>
                  <div
                    className="ennea-side-grid"
                    style={{
                      display: "grid",
                      gap: "20px",
                      justifyContent: "center",
                      alignItems: "start",
                    }}
                  >
                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "22px",
                        border: `1px solid rgba(14, 27, 37, 0.08)`,
                        background: "rgba(255,255,255,0.8)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src="/assets/images/logo/enneamaroc-logo.png"
                        alt="EnnéaMaroc logo"
                        style={{ width: "95px", height: "auto" }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "36px",
            }}
          >
            <button
              type="button"
              onClick={goToNext}
              style={{
                padding: "14px 28px",
                borderRadius: "999px",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                background: "rgba(255, 255, 255, 0.18)",
                color: "#ffffff",
                letterSpacing: "0.18em",
                fontSize: "12px",
                textTransform: "uppercase",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.2s ease, transform 0.2s ease",
                minWidth: "180px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(10, 131, 202, 0.9)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              aria-label="Onglet suivant"
            >
              Suivant
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default TestimonialComponent;
