import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  FaChevronDown,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTag,
  FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AccordionItem = ({ module, isOpen, onToggle, index, color = "#0a83ca" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const styles = {
    card: {
      width: "100%",
      background: "#ffffff",
      borderRadius: "16px",
      overflow: "visible",
      marginBottom: "16px",
      position: "relative",
      borderStyle: "solid",
      borderColor: color,
      // Border width is handled by motion
    },
    header: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 20px",
      background: isHovered ? `${color}08` : "transparent",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      outline: "none",
      transition: "background 0.2s ease",
    },
    headerContent: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "16px",
      flex: "1",
      minWidth: 0,
    },
    iconBox: {
      width: "40px",
      height: "40px",
      minWidth: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: color,
      fontSize: "20px",
    },
    textGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      alignItems: "flex-start",
    },
    title: {
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      fontSize: "20px",
      fontWeight: "700",
      color: isOpen ? color : "#334155",
      margin: "0",
      lineHeight: "1.2",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      textAlign: "left",
      transition: "color 0.2s ease",
    },
    duration: {
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "#854d0e",
      background: "#fef9c3",
      padding: "2px 8px",
      borderRadius: "4px",
      display: "inline-block",
    },
    chevronBox: {
      color: color,
      marginLeft: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginLeft: 12,
      flexShrink: 0,
      minWidth: 0,
    },
    headerBadge: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#854d0e",
      background: "#fef9c3",
      padding: "6px 10px",
      borderRadius: "6px",
      display: "inline-block",
      whiteSpace: "nowrap",
    },
    prereqBadge: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#7f1d1d",
      background: "#fee2e2",
      padding: "8px 10px",
      borderRadius: "8px",
      display: "inline-block",
      whiteSpace: "nowrap",
      marginRight: "6px",
      transform: "translateX(8px)",
      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      maxWidth: "160px",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    contentInner: {
      padding: "6px 20px 12px 80px",
      borderTop: `1px solid ${color}14`,
      textAlign: "left",
    },
    subtitle: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#334155",
      marginBottom: "8px",
      display: "block",
    },
    description: {
      fontSize: isMobile ? "14px" : "17px",
      lineHeight: "1.6",
      color: "#475569",
      marginBottom: "16px",
      margin: "0 0 16px 0",
    },
    metaGrid: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      marginTop: "24px",
      paddingTop: "24px",
      borderTop: "1px dashed #cbd5e1",
    },
    metaRow: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: "24px",
      alignItems: "flex-start",
    },
    metaItem: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      flex: "1",
      minWidth: "200px",
    },
    metaLabel: {
      fontSize: "17px",
      fontWeight: "700",
      textTransform: "uppercase",
      color: "#e13734",
      letterSpacing: "0.05em",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    metaValue: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#334155",
    },
    metaValueHighlight: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#334155",
    },
    inlinePrereq: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#7f1d1d",
      background: "#fee2e2",
      padding: "4px 8px",
      borderRadius: "6px",
      whiteSpace: "nowrap",
      display: "inline-block",
    },
    dateBadge: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#0284c7",
      background: "#e0f2fe",
      padding: "4px 10px",
      borderRadius: "6px",
      display: "inline-block",
      whiteSpace: "nowrap",
    },
    datesContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
    },
    actionButton: {
      display: "block",
      width: "100%",
      marginTop: "24px",
      padding: "12px 24px",
      background: color,
      color: "#ffffff",
      fontWeight: "700",
      fontSize: "14px",
      borderRadius: "8px",
      textDecoration: "none",
      textAlign: "center",
      border: "none",
      cursor: "pointer",
      transition: "background 0.2s ease",
    },
  };

  const getDayBadge = () => {
    // Prefer an explicit duration string if provided (e.g. "2 JOURS")
    if (module.duration) return module.duration;
    if (module.dates && module.dates.length > 0) return module.dates[0];
    if (module.sessions && module.sessions.length > 0) {
      try {
        const d = new Date(module.sessions[0].start_date);
        return `${d.getDate()} ${d.toLocaleDateString("fr-FR", {
          month: "short",
        })}`;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const isLongTitle = (t) => {
    if (!t) return false;
    return t.trim().split(/\s+/).length > 5;
  };

  // Helper to clean up potential double currency units (e.g. "3000 MAD MAD")
  const formatPrice = (p) => {
    if (!p) return "";
    return p.toString().replace(/MAD\s*MAD/i, "MAD");
  };

  const formatSessionDate = (start, end) => {
    if (!start) return "";
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : null;

    const options = { day: "numeric", month: "long", year: "numeric" };
    const dateStr = d1.toLocaleDateString("fr-FR", options);

    if (d2) {
      const day1 = d1.getDate();
      const day2 = d2.getDate();
      const month1 = d1.toLocaleDateString("fr-FR", { month: "long" });
      const month2 = d2.toLocaleDateString("fr-FR", { month: "long" });
      const year1 = d1.getFullYear();
      const year2 = d2.getFullYear();

      if (year1 === year2 && month1 === month2) {
        return `${day1} - ${day2} ${month1} ${year1}`;
      }
    }
    return dateStr;
  };

  const handleSubscribe = (session) => {
    const enrollmentData = {
      type: "vitrine_module",
      module: {
        id: module.id,
        title: module.title,
        price: module.price_ttc || module.price_ht,
        place: module.place,
        image: module.image, // Note: this might be a component or null. ConfirmationPage needs to handle it.
        // Ideally we pass a string URL if available, or just the title.
      },
      session: {
        id: session.id,
        date: formatSessionDate(session.start_date, session.end_date),
      },
    };

    localStorage.setItem("pending_enrollment", JSON.stringify(enrollmentData));
    sessionStorage.setItem("enrollmentFlow", "true"); // Signal to SignUpPage

    const token = localStorage.getItem("auth_token");
    if (token) {
      window.location.href = "/app/#/confirmation";
    } else {
      // Redirect to signup
      window.location.href = "/app/#/signup";
    }
  };

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Responsive rules for module cards and badges */}
      <style>{`
      /* Default: keep compact header layout */
      .vitrine-accordion .module-title { display: block; }
      .vitrine-accordion .header-content { display: flex; align-items: center; gap: 16px; }
      .vitrine-accordion .header-badge, .vitrine-accordion .prereq-badge { white-space: nowrap; }

      /* Tablet / small laptop */
      @media (max-width: 992px) {
        .vitrine-accordion .module-title { font-size: 18px !important; }
        .vitrine-accordion .header-badge, .vitrine-accordion .prereq-badge { padding: 5px 8px !important; font-size: 11px !important; }
        .vitrine-accordion .icon-box { width: 36px !important; height: 36px !important; min-width: 36px !important; }
      }

      /* Mobile — everything centered, stacked column */
      @media (max-width: 600px) {
        /* button itself: column, centered */
        button.vitrine-accordion {
          flex-direction: column !important;
          align-items: center !important;
          padding: 14px 12px !important;
          gap: 8px !important;
          text-align: center !important;
        }
        /* icon + title block: column, centered */
        .vitrine-accordion .header-content {
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          width: 100% !important;
          flex: unset !important;
        }
        .vitrine-accordion .text-group { align-items: center !important; }
        /* title: centered, wraps freely */
        .vitrine-accordion .module-title {
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: unset !important;
          font-size: 15px !important;
          line-height: 1.3 !important;
          text-align: center !important;
        }
        /* icon size */
        .vitrine-accordion .icon-box { width: 36px !important; height: 36px !important; min-width: 36px !important; font-size: 18px !important; }
        /* badges row: centered, wraps */
        .vitrine-accordion .header-right-wrap {
          width: 100% !important;
          justify-content: center !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
          margin-left: 0 !important;
          flex-shrink: unset !important;
        }
        /* show prereq badge, auto width */
        .vitrine-accordion .prereq-badge {
          display: inline-flex !important;
          width: auto !important;
          max-width: 220px !important;
          transform: none !important;
        }
        .vitrine-accordion .header-badge { padding: 4px 8px !important; font-size: 11px !important; }
        /* remove the 80px left indent */
        .vitrine-accordion .content-inner { padding: 10px 14px 16px 14px !important; }
        /* stack practical-info rows and items vertically */
        .vitrine-accordion .meta-row { flex-direction: column !important; gap: 14px !important; }
        .vitrine-accordion .meta-item { min-width: 0 !important; width: 100% !important; }
        /* allow horaires + prereq row to wrap */
        .vitrine-accordion .horaires-wrap { flex-wrap: wrap !important; white-space: normal !important; gap: 8px !important; }
        .vitrine-accordion .inline-prereq { white-space: normal !important; max-width: 100% !important; }
        .vitrine-accordion .action-button { width: 100% !important; margin: 16px 0 0 !important; display: block !important; }
      }
    `}</style>
      <motion.div
        initial={false}
        animate={{
          borderWidth: isOpen ? "2px" : "1px",
          boxShadow: isOpen ? `0 4px 12px ${color}1a` : "none",
        }}
        style={styles.card}
        transition={{ duration: 0.2 }}
      >
        <button
          className="vitrine-accordion header"
          style={styles.header}
          onClick={onToggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-expanded={isOpen}
          type="button"
        >
          <div className="header-content" style={styles.headerContent}>
            <div style={styles.iconBox}>
              {/* Clone element to enforce size if it's an icon component */}
              {React.isValidElement(module.icon)
                ? React.cloneElement(module.icon, {
                    size: 20,
                    style: { fill: "currentColor" },
                  })
                : module.icon}
            </div>
            <div className="text-group" style={styles.textGroup}>
              <h3
                className="module-title"
                style={
                  isLongTitle(module.title)
                    ? {
                        ...styles.title,
                        whiteSpace: "normal",
                        overflow: "visible",
                      }
                    : styles.title
                }
              >
                {module.reference
                  ? `${module.reference} : `
                  : typeof index === "number"
                  ? `Module ${index + 1} : `
                  : ""}
                {module.title}
              </h3>
              {/* duration pill removed from under-title; badge kept on header right */}
            </div>
          </div>

          <div
            className="header-right-wrap"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {module.prerequis && (
              <span
                className="prereq-badge"
                style={styles.prereqBadge}
                title={module.prerequis}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#7f1d1d",
                      lineHeight: 1,
                    }}
                  >
                    Prérequis :
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#7f1d1d",
                      display: "inline-block",
                      maxWidth: 90,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}
                  >
                    {module.prerequis}
                  </span>
                </span>
              </span>
            )}
            {getDayBadge() && (
              <span className="header-badge" style={styles.headerBadge}>
                {getDayBadge()}
              </span>
            )}
            <motion.div
              style={styles.chevronBox}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "circOut" }}
            >
              <FaChevronDown size={14} />
            </motion.div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden", background: "#ffffff" }}
            >
              <div className="content-inner" style={styles.contentInner}>
                {module.subtitle && (
                  <span style={styles.subtitle}>{module.subtitle}</span>
                )}
                {module.description && (
                  <p style={styles.description}>{module.description}</p>
                )}
                {module.details && (
                  <p style={styles.description}>{module.details}</p>
                )}

                {/* Practical Info Section */}
                {(module.price_ht ||
                  module.price_ttc ||
                  module.place ||
                  module.date ||
                  module.horaires) && (
                  <div style={styles.metaGrid} className="meta-grid">
                    {/* Row 1: Tarif & Lieu */}
                    <div style={styles.metaRow} className="meta-row">
                      {(module.price_ht || module.price_ttc) && (
                        <div style={styles.metaItem} className="meta-item">
                          <span style={styles.metaLabel} className="meta-label">
                            <FaTag size={14} /> Tarif
                          </span>
                          <span
                            style={styles.metaValueHighlight}
                            className="meta-value-highlight"
                          >
                            {module.price_ht &&
                              `${formatPrice(module.price_ht)} HT`}
                            {module.price_ht && module.price_ttc && " / "}
                            {module.price_ttc &&
                              `${formatPrice(module.price_ttc)} TTC`}
                          </span>
                        </div>
                      )}

                      {module.place && (
                        <div style={styles.metaItem} className="meta-item">
                          <span style={styles.metaLabel} className="meta-label">
                            <FaMapMarkerAlt size={14} /> Lieu
                          </span>
                          <span
                            style={styles.metaValueHighlight}
                            className="meta-value-highlight"
                          >
                            {module.place}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Row 2: Date & Horaires */}
                    <div style={styles.metaRow} className="meta-row">
                      {(module.date ||
                        (module.dates && module.dates.length > 0)) && (
                        <div style={styles.metaItem} className="meta-item">
                          <span style={styles.metaLabel} className="meta-label">
                            <FaCalendarAlt size={14} /> Date
                          </span>
                          <div style={styles.metaValue} className="meta-value">
                            {module.dates && module.dates.length > 0 ? (
                              <div style={styles.datesContainer}>
                                {module.dates.map((d, i) => (
                                  <span key={i} style={styles.dateBadge}>
                                    {d}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={styles.dateBadge}>
                                {module.date || "À définir"}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {(module.horaires || module.prerequis) && (
                        <div style={styles.metaItem} className="meta-item">
                          <span style={styles.metaLabel} className="meta-label">
                            <FaClock size={14} /> Horaires
                          </span>
                          <div
                            className="horaires-wrap"
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {module.horaires && (
                              <div
                                style={styles.metaValue}
                                className="meta-value"
                              >
                                {module.horaires}
                              </div>
                            )}
                            {module.prerequis && (
                              <div
                                style={{
                                  display: "inline-flex",
                                  gap: 8,
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <FaTag size={12} style={{ color: "#7f1d1d" }} />
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#7f1d1d",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  PRÉREQUIS
                                </span>
                                <span
                                  style={styles.inlinePrereq}
                                  className="inline-prereq"
                                >
                                  {module.prerequis}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "24px" }}>
                  <button
                    onClick={() => setShowModal(true)}
                    style={styles.actionButton}
                    className="action-button"
                  >
                    DATES INSCRIPTIONS
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showModal &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 2147483647,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                padding: "32px",
                width: "100%",
                maxWidth: "500px",
                position: "relative",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                &times;
              </button>

              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "8px",
                }}
              >
                Prochaines sessions
              </h3>
              <p
                style={{
                  fontSize: "16px",
                  color: "#64748b",
                  marginBottom: "24px",
                }}
              >
                {module.title}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {module.sessions && module.sessions.length > 0 ? (
                  module.sessions
                    .sort(
                      (a, b) => new Date(a.start_date) - new Date(b.start_date)
                    )
                    .map((session, idx) => (
                      <div
                        key={idx}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#0f172a",
                              marginBottom: "4px",
                            }}
                          >
                            {formatSessionDate(
                              session.start_date,
                              session.end_date
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#64748b",
                            }}
                          >
                            {module.place || "Ferme J'nan Lemonie"}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const sessionData = {
                              moduleId: module.id,
                              moduleTitle: module.title,
                              parcoursTitle: "Approfondir", // Or pass this as prop
                              sessionId: session.id,
                              sessionDate: formatSessionDate(
                                session.start_date,
                                session.end_date
                              ),
                              price: module.price_ttc || module.price_ht,
                              place: module.place,
                            };
                            // Store in session storage for the registration flow
                            sessionStorage.setItem(
                              "registrationData",
                              JSON.stringify(sessionData)
                            );

                            // Check if user is already logged in
                            const token =
                              localStorage.getItem("auth_token") ||
                              localStorage.getItem("token");
                            if (token) {
                              // Redirect directly to confirmation
                              window.location.href = "/app/#/confirmation";
                            } else {
                              // Redirect to app registration
                              window.location.href =
                                "/app/#/register?from=vitrine";
                            }
                          }}
                          style={{
                            backgroundColor: "#e13734",
                            color: "#fff",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          S'inscrire
                        </button>
                      </div>
                    ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#64748b",
                      background: "#f8fafc",
                      borderRadius: "12px",
                    }}
                  >
                    Aucune session programmée pour le moment.
                    <br />
                    <a
                      href="/app/#/contact"
                      style={{
                        color: "#e13734",
                        fontWeight: "600",
                        marginTop: "8px",
                        display: "inline-block",
                      }}
                    >
                      Contactez-nous pour plus d'infos
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default AccordionItem;
