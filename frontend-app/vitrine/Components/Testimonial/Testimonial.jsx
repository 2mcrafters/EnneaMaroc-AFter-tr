"use client";

import { useMemo, useState } from "react";
import data from "../../Data/testimonial1.json";

const HERO_TITLE = "L'ENNÉAGRAMME : UNE CARTE VIVANTE DE L'ÊTRE HUMAIN";

function AnimatedHeading() {
  return (
    <h1
      style={{
        margin: "0 0 4px",
        padding: "0",
        fontSize: "max(2.1vw, 22px)",
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: "0.04em",
        color: "#ffffff",
        whiteSpace: "normal",
        textAlign: "center",
        width: "100%",
      }}
    >
      {HERO_TITLE}
    </h1>
  );
}

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
    accent: "#64508d",
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
    accent: "#ff7d2d",
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
        flexDirection: "row",
        flexWrap: "nowrap",
        gap: "4px",
        justifyContent: "center",
        alignItems: "flex-end",
        width: "100%",
        padding: "0 12px",
        marginBottom: "0",
        position: "relative",
        zIndex: 2,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      };
    }

    return {
      display: "flex",
      flexWrap: "nowrap",
      gap: "4px",
      justifyContent: "center",
      marginBottom: "0",
      paddingLeft: "0",
      position: "relative",
      zIndex: 2,
    };
  };

  const getButtonStyle = (isActive, variant, accent) => {
    const isMobile = variant === "mobile";
    // Both mobile and desktop use folder-tab style
    return {
      cursor: "pointer",
      padding: isActive ? (isMobile ? "10px 16px 12px" : "12px 28px 14px") : (isMobile ? "8px 14px 10px" : "10px 26px 12px"),
      borderRadius: "12px 12px 0 0",
      border: "1.5px solid rgba(255,255,255,0.35)",
      borderBottom: isActive ? "2px solid #ffffff" : "1.5px solid rgba(255,255,255,0.35)",
      background: isActive ? "#ffffff" : "rgba(255,255,255,0.1)",
      color: isActive ? accent : "rgba(255,255,255,0.88)",
      fontWeight: 800,
      letterSpacing: isMobile ? "1px" : "1.4px",
      textTransform: "uppercase",
      fontSize: isMobile ? "10px" : "12px",
      transition: "all 0.22s ease",
      backdropFilter: "blur(10px)",
      position: "relative",
      zIndex: isActive ? 3 : 1,
      marginBottom: isActive ? "-2px" : "0",
      outline: "none",
      whiteSpace: "nowrap",
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
              if (isActive) return;
              if (variant === "desktop") {
                e.currentTarget.style.background = "rgba(255,255,255,0.22)";
                e.currentTarget.style.color = "#ffffff";
              } else {
                e.currentTarget.style.background = "#64508d";
                e.currentTarget.style.borderColor = "#64508d";
                e.currentTarget.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              if (isActive) return;
              if (variant === "desktop") {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.88)";
              } else {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.92)";
              }
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
            margin: "0 0 10px 18px",
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
            margin: "0 0 10px",
            color: paragraphColor,
            fontSize: "17px",
            lineHeight: "1.6",
            textAlign: "justify",
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
          background: "linear-gradient(135deg, #ff7d2d 0%, #ff7d2d 100%)",
          padding: "24px 0 24px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            background:
              "radial-gradient(circle at 20% 20%, #64508d 0%, transparent 60%), radial-gradient(circle at 80% 30%, #ff9f1c 0%, transparent 55%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 40px",
          }}
        >
          {/* Hero text */}
          <div
            className="ennea-hero-wrapper"
            style={{
              width: "100%",
              maxWidth: "100%",
              margin: "0 auto 20px",
              color: "#ffffff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0",
              textAlign: "center",
            }}
          >
            <AnimatedHeading />
            <div style={{
              width: "48px",
              height: "2px",
              background: "rgba(255,255,255,0.4)",
              borderRadius: "99px",
              margin: "14px auto",
            }} />
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "16px",
                padding: "20px 40px",
                marginTop: "0",
                maxWidth: "86%",
                width: "100%",
                boxSizing: "border-box",
                textAlign: "center",
                backgroundColor: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                className="ennea-hero-subtitle"
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "12px",
                  color: "#ffffff",
                  fontWeight: 700,
                  lineHeight: 1.4,
                  textTransform: "uppercase",
                  letterSpacing: "2.5px",
                  textAlign: "center",
                }}
              >
                Plus qu’un outil, une voie de transformation
              </p>
              <div
                className="ennea-hero-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  color: "#ffffff",
                  fontSize: "15px",
                  lineHeight: "1.75",
                  textAlign: "justify",
                  textAlignLast: "center",
                  width: "100%",
                  margin: "0 auto",
                }}
              >
                <p style={{ margin: 0, color: "#ffffff" }}>C'est une carte vivante des dynamiques humaines, un miroir qui révèle nos forces, nos fragilités, et les chemins d'évolution possibles.</p>
                <p style={{ margin: 0, color: "#ffffff" }}>L'Ennéagramme nous aide à passer de la survie automatique à la présence consciente, en ouvrant un espace de liberté intérieure.</p>
              </div>
            </div>
          </div>
          {/* Responsive overrides for small screens */}
          <style>
            {`
              .ennea-tabs-wrapper-mobile {
                display: none;
              }
              .ennea-tabs-wrapper-mobile::-webkit-scrollbar {
                display: none;
              }

              @media (max-width: 640px) {
                .ennea-tabs-wrapper-desktop {
                  display: none !important;
                }

                .ennea-tabs-wrapper-mobile {
                  display: flex !important;
                }

                .ennea-tab-button {
                  font-size: 9px !important;
                  padding: 7px 10px 9px !important;
                  letter-spacing: 0.8px !important;
                }

                .ennea-hero-wrapper {
                  padding: 0;
                  gap: 10px !important;
                  margin-bottom: 20px !important;
                }

                .ennea-hero-heading {
                  font-size: clamp(16px, 5vw, 26px) !important;
                  line-height: 1.2 !important;
                  white-space: normal !important;
                  letter-spacing: 0.03em !important;
                  word-break: break-word !important;
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
                  line-height: 1.5 !important;
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

              @media (max-width: 991px) {
                .ennea-main-grid {
                  grid-template-columns: 1fr !important;
                  gap: 40px !important;
                }
                
                .ennea-side-grid {
                  width: 100% !important;
                  justify-content: center !important;
                  margin-top: 20px !important;
                }

              @media (max-width: 640px) {
                .ennea-side-grid {
                  display: none !important;
                }
                .ennea-main-grid {
                  grid-template-columns: 1fr !important;
                  gap: 0 !important;
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
              maxWidth: "100%",
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
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
                  borderRadius: "24px",
                  padding: "24px 36px",
                  color: "#0e1b25",
                  display: "grid",
                  gap: "0",
                  boxShadow: "0 20px 60px rgba(5, 28, 50, 0.1)",
                }}
              >
                <div
                  className="ennea-main-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.8fr",
                    gap: "36px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      textAlign: "left",
                    }}
                  >
                    <div>
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            fontSize: "13px",
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            fontWeight: 700,
                            color: active.accent,
                          }}
                        >
                          {active.label}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "clamp(20px, 2vw, 28px)",
                            fontWeight: 700,
                            color: "#0e1b25",
                            lineHeight: 1.2,
                          }}
                        >
                          {active.title}
                        </p>
                    </div>
                    <div style={{ margin: "4px 0 6px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 16px",
                          border: `1.5px solid ${active.accent}`,
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: active.accent,
                          letterSpacing: "0.04em",
                          background: "transparent",
                        }}
                      >
                        {active.tag}
                      </span>
                    </div>
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
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <img
                      src="icons/logo enn1.jpg"
                      alt="Ennéagramme Illustration"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "24px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        objectFit: "cover",
                      }}
                    />
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
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            {activeIndex !== 0 && (
              <button
                type="button"
                onClick={goToPrev}
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
                  e.currentTarget.style.background = "rgba(255, 125, 45, 0.9)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.18)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                aria-label="Onglet précédent"
              >
                Précédent
              </button>
            )}
            {activeIndex !== totalItems - 1 && (
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
                  e.currentTarget.style.background = "rgba(255, 125, 45, 0.9)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.18)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                aria-label="Onglet suivant"
              >
                Suivant
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default TestimonialComponent;
