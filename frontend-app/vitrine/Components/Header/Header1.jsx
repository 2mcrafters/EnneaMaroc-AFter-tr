// src/components/Header1.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../services/auth";

const stripDiacritics = (value) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeRouteSegment = (value) => {
  const safeValue = value || "";
  try {
    return stripDiacritics(decodeURIComponent(safeValue).toLowerCase());
  } catch (error) {
    return stripDiacritics(safeValue.toLowerCase());
  }
};

export default function Header1({ variant = "" }) {
  // ---- UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSticky, setIsSticky] = useState("");
  const prevScrollPosRef = useRef(0);

  const [isMobileView, setIsMobileView] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.matchMedia("(max-width: 991px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ---- Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // ---- Router
  const navigate = useNavigate();
  const location = useLocation();

  // Check for accidental redirects
  useEffect(() => {
    console.log('Vitrine Header Mounted. Location:', location);
  }, [location]);

  // ---- Dropdown
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const navListId = "main-nav-list";

  // ---- NAV ITEMS (URLs sans accents)
  const navItems = [
    {
      type: "hash",
      label: "Ennéagramme",
      hashTo: "enneagramme-section",
      mobileHidden: true,
    },
    { type: "link", label: "École", to: "/ecole" },
    {
      type: "select",
      label: "Parcours",
      options: [
        { label: "Découvrir", to: "/découvrir" },
        { label: "Approfondir", to: "/approfondir" },
        { label: "Transmettre", to: "/transmettre" },
      ],
    },
    { type: "link", label: "Solution", to: "/solution" },
    { type: "link", label: "Agenda", to: "/agenda" },
    { type: "link", label: "Contact", to: "/contact" },
  ];

  // ---- Helpers
  const isMobile = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 991px)").matches;

  const closeMobileAll = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
    document.body.classList.remove("mobile-menu-open");
  };

  const toggleMobileMenu = () => {
    const next = !mobileOpen;
    setMobileOpen(next);
    setOpenDropdown(null);
    if (next) document.body.classList.add("mobile-menu-open");
    else document.body.classList.remove("mobile-menu-open");
  };

  const goToHash = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else navigate(`/#${id}`);
  };

  // ---- Effects

  // Sticky header on scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const prev = prevScrollPosRef.current;
      // Always sticky, just toggle visibility or style if needed
      // For simple sticky behavior:
      if (y > 100) {
        setIsSticky("cs-gescout_sticky cs-gescout_show");
      } else {
        setIsSticky("");
      }
      prevScrollPosRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll when mobile menu open (iOS safe)
  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevPaddingRight = root.style.paddingRight;
    const comp = window.innerWidth - document.documentElement.clientWidth;
    root.style.overflow = "hidden";
    if (comp > 0) root.style.paddingRight = `${comp}px`;
    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPaddingRight;
    };
  }, [mobileOpen]);

  // Close menu & dropdown on route change
  useEffect(() => {
    closeMobileAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Smooth scroll when hash changes
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
    return () => clearTimeout(t);
  }, [location.hash]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeMobileAll();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset state when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (!isMobile() && mobileOpen) closeMobileAll();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDropdown) return;
    const handlePointer = (event) => {
      const currentRef = dropdownRefs.current?.[openDropdown];
      if (currentRef && !currentRef.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
    };
  }, [openDropdown]);

  const registerDropdownRef = (label) => (node) => {
    if (!dropdownRefs.current) dropdownRefs.current = {};
    if (node) dropdownRefs.current[label] = node;
    else delete dropdownRefs.current[label];
  };

  // Auth status
  useEffect(() => {
    (async () => {
      try {
        const loggedIn = auth?.isAuthenticated?.() ?? false;
        setIsLoggedIn(loggedIn);
        setIsAdmin(loggedIn ? !!(await auth?.isAdmin?.()) : false);
      } catch (e) {
        console.error("Auth check error:", e);
      }
    })();
  }, []);

  // ---- Renderers

  const renderItem = (item) => {
    if (item.type === "hash") {
      const isHomePage = location.pathname === '/';
      return (
        <a
          href={`/#${item.hashTo}`}
          className="cs_nav_link"
          role="menuitem"
          onClick={(e) => {
            e.preventDefault();
            closeMobileAll();
            goToHash(item.hashTo);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 44,
            padding: "0 16px",
            borderRadius: "9999px",
            fontSize: "17px",
            fontWeight: isHomePage ? 700 : 600,
            transition: "all 0.2s",
            textDecoration: "none",
            color: isHomePage ? "#ff7d2d" : "inherit",
          }}
        >
          <span style={{ position: "relative", paddingBottom: "3px" }}>
            {item.label}
            {isHomePage && (
              <span style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                height: "2.5px",
                background: "#ff7d2d",
                borderRadius: "99px",
                display: "block",
              }} />
            )}
          </span>
        </a>
      );
    }

    if (item.type === "link") {
      const normalizedPath = normalizeRouteSegment(location.pathname);
      const isActive = normalizedPath === normalizeRouteSegment(item.to);

      return (
        <Link
          to={item.to}
          className="cs_nav_link"
          role="menuitem"
          onClick={closeMobileAll}
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 44,
            padding: "0 16px",
            borderRadius: "9999px",
            fontWeight: isActive ? 700 : 600,
            fontSize: "17px",
            transition: "all 0.2s",
            textDecoration: "none",
            color: isActive ? "#ff7d2d" : "inherit",
          }}
        >
          <span style={{
            position: "relative",
            paddingBottom: "3px",
          }}>
            {item.label}
            {isActive && (
              <span style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                height: "2.5px",
                background: "#ff7d2d",
                borderRadius: "99px",
                display: "block",
              }} />
            )}
          </span>
        </Link>
      );
    }

    if (item.type === "select") {
      const isOpen = openDropdown === item.label;
      const normalizedPath = normalizeRouteSegment(location.pathname);
      const selectedOption = item.options.find(
        (opt) => normalizedPath === normalizeRouteSegment(opt.to)
      );
      const isParcoursActive = !!selectedOption;
      const dropdownId = `nav-dropdown-${item.label}`;

      return (
        <div
          ref={registerDropdownRef(item.label)}
          className={`nav-dropdown ${isOpen ? "is-open" : ""}`}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: isMobileView ? "column" : "row",
            alignItems: isMobileView ? "flex-start" : "center",
            gap: isMobileView ? "6px" : "8px",
            width: isMobileView ? "100%" : "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: isMobileView ? "flex-start" : "center",
              gap: "8px",
              width: "100%",
              justifyContent: isMobileView ? "flex-start" : "flex-start",
              flexDirection: isMobileView ? "column" : "row",
            }}
          >
            {selectedOption ? (
              <>
                <span
                  style={{
                    color: "#ff7d2d",
                    fontWeight: 600,
                    fontSize: "17px",
                    marginLeft: isMobileView ? "16px" : "0",
                    display: isMobileView ? "block" : "none",
                  }}
                >
                  {item.label}
                </span>
                <button
                  type="button"
                  className="nav-dropdown-button"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  aria-controls={dropdownId}
                  onClick={() =>
                    setOpenDropdown((prev) =>
                      prev === item.label ? null : item.label
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setOpenDropdown(item.label);
                    }
                    if (event.key === "Escape") {
                      event.preventDefault();
                      setOpenDropdown(null);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: isMobileView
                      ? "transparent"
                      : isParcoursActive
                      ? "#ff7d2d"
                      : "#F0F9FA",
                    color: isParcoursActive ? "#ff7d2d" : "#007A80",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    fontSize: "17px",
                    fontWeight: 600,
                    border: isMobileView
                      ? "1px solid #B2EBF2"
                      : isParcoursActive
                      ? "1px solid #ff7d2d"
                      : "1px solid #B2EBF2",
                    cursor: "pointer",
                    width: isMobileView ? "100%" : "auto",
                    justifyContent: isMobileView ? "space-between" : "center",
                  }}
                >
                  {selectedOption.label}
                  <svg
                    aria-hidden="true"
                    className={`nav-dropdown-caret ${isOpen ? "is-open" : ""}`}
                    viewBox="0 0 12 8"
                    fill="none"
                    style={{
                      width: "10px",
                      height: "6px",
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <path
                      d="M1 1L6 6L11 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="nav-dropdown-button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-controls={dropdownId}
                onClick={() =>
                  setOpenDropdown((prev) =>
                    prev === item.label ? null : item.label
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setOpenDropdown(item.label);
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setOpenDropdown(null);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: isOpen ? "#64508d" : "inherit",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "17px",
                  fontWeight: 600,
                  padding: 0,
                  width: isMobileView ? "100%" : "auto",
                  justifyContent: isMobileView ? "space-between" : "flex-start",
                }}
              >
                <span className="nav-dropdown-label">{item.label}</span>
                <svg
                  aria-hidden="true"
                  className={`nav-dropdown-caret ${isOpen ? "is-open" : ""}`}
                  viewBox="0 0 12 8"
                  fill="none"
                  style={{
                    width: "10px",
                    height: "6px",
                    transition: "transform 0.2s",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <div
            id={dropdownId}
            className="nav-dropdown-menu"
            role="menu"
            style={{
              display: isOpen ? "block" : "none",
              position: isMobileView ? "relative" : "absolute",
              top: isMobileView ? "0" : "100%",
              left: isMobileView ? "0" : selectedOption ? "auto" : 0,
              right: isMobileView ? "0" : selectedOption ? 0 : "auto",
              marginTop: isMobileView ? "4px" : "12px",
              width: isMobileView ? "100%" : "auto",
              minWidth: isMobileView ? "0" : "180px",
              backgroundColor: isMobileView ? "transparent" : "white",
              padding: isMobileView ? "0" : "8px",
              borderRadius: isMobileView ? "0" : "12px",
              boxShadow: isMobileView
                ? "none"
                : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: isMobileView ? "none" : "1px solid #f1f5f9",
              zIndex: 100,
              paddingLeft: isMobileView ? "16px" : "0",
            }}
          >
            <div
              className="nav-dropdown-surface"
              role="none"
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {item.options.map((opt) => {
                const isActive =
                  normalizedPath === normalizeRouteSegment(opt.to);
                return (
                  <Link
                    key={opt.to}
                    to={opt.to}
                    className={`nav-dropdown-link ${
                      isActive ? "is-active" : ""
                    }`}
                    role="menuitem"
                    onClick={closeMobileAll}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      color: isActive ? "#ffffff" : "#334155",
                      backgroundColor: isActive ? "#ff7d2d" : "transparent",
                      fontWeight: isActive ? "bold" : "normal",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                        e.currentTarget.style.color = "#64508d";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#334155";
                      }
                    }}
                  >
                    <span>{opt.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <header
      className={`cs_site_header header_style_2 cs_style_1 ${variant} cs_sticky_header cs_site_header_full_width ${
        mobileOpen ? "cs_mobile_toggle_active" : ""
      } ${isSticky} !fixed !top-0 !w-full !z-[999]`}
      style={{ position: "fixed", zIndex: 999, width: "100%", top: 0 }}
    >
      <style>{`
        /* ── scale hover for all nav links ── */
        .cs_nav_link {
          transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.4s ease !important;
          display: inline-flex;
          align-items: center;
          text-decoration: none !important;
        }
        .cs_nav_link:hover {
          transform: scale(1.12) !important;
          text-decoration: none !important;
          color: #ff7d2d !important;
        }
        .cs_nav_link:hover::after,
        .cs_nav_link:focus::after {
          display: none !important;
        }

        @media (max-width: 991px) {
          /* Hide nav list by default on mobile, show when is-open */
          .cs_nav .cs_nav_list {
            display: none !important;
          }
          .cs_nav .cs_nav_list.is-open {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            position: fixed !important;
            top: 80px !important;
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            max-height: calc(100vh - 80px) !important;
            overflow-y: auto !important;
            background: #ffffff !important;
            z-index: 998 !important;
            padding: 16px 0 24px !important;
            box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
            border-top: 2px solid rgba(10,131,202,0.1) !important;
          }
          .cs_nav .cs_nav_list > li {
            width: 100% !important;
          }
          .cs_nav .cs_nav_list > li > a,
          .cs_nav .cs_nav_list .cs_nav_link {
            padding: 12px 20px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            background: transparent !important;
            color: #1a1a2e !important;
            font-size: 16px !important;
          }
          .cs_nav .cs_nav_list .cs_nav_link:hover {
            background: rgba(10,131,202,0.06) !important;
            transform: none !important;
            color: #ff7d2d !important;
          }
        }
      `}</style>
      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? "is-open" : ""}`}
        onClick={closeMobileAll}
        aria-hidden={!mobileOpen}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.35)",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity .2s ease",
        }}
      />

      <div className="cs_main_header">
        <div className="container">
          <div className="cs_main_header_in hdr-in">
            {/* Left: brand only */}
            <div className="cs_main_header_left">
              <Link
                to="/"
                className="cs_site_branding"
                onClick={() => { closeMobileAll(); window.scrollTo({ top: 0, behavior: "instant" }); }}
              >
                <img
                  className="cs-logo"
                  src="/assets/images/logo/logo.png"
                  alt="EnnéaMaroc Logo"
                  title="EnnéaMaroc"
                  style={{ height: "100%" }}
                />
              </Link>
            </div>

            {/* Center: nav */}
            <div
              className="cs_main_header_center nav-center"
              style={{ display: isMobileView ? "none" : undefined }}
            >
              <div className="cs_nav cs_primary_font fw-bold">
                <nav className="cs_navbar" role="navigation" aria-label="Main">
                  <ul
                    id={navListId}
                    className={`cs_nav_list ${mobileOpen ? "is-open" : ""}`}
                    role="menubar"
                    style={{
                      alignItems: "center",
                      gap: 15,
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      flexWrap: "nowrap",
                    }}
                  >
                    {navItems.map((item) => (
                      <li
                        key={item.label}
                        className={`menu-item ${
                          item.mobileHidden ? "mobile-hidden" : ""
                        }`}
                        role="none"
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        {renderItem(item)}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Right: profile + mobile burger */}
            <div className="cs_main_header_right">
              <div className="header-btn header-right-wrapper">
                <div className="header-right">
                  <div className="profile-icon">
                    <a
                      href={isLoggedIn ? "/app/#/admin/dashboard" : "/app/#/login"}
                      aria-label={
                        isLoggedIn ? "Tableau de bord" : "Accéder à la page Se connecter"
                      }
                      onClick={closeMobileAll}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#ff8f42",
                        color: "#fff",
                        border: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>

                      <span
                        className="mobile-profile-label"
                        style={{
                          marginLeft: 10,
                          fontSize: 12,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          color: "#ffffff",
                          display: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isLoggedIn ? "Dashboard" : "S'inscrire"}
                      </span>
                    </a>
                    {/* {isAdmin && <Link to="/admin" className="admin-link">Admin</Link>} */}
                  </div>
                </div>
              </div>

              {/* Mobile hamburger button - right side */}
              <button
                type="button"
                className="hambtn mobile-menu-btn"
                aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-controls={navListId}
                aria-expanded={mobileOpen}
                onClick={toggleMobileMenu}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  border: "2px solid rgba(10, 131, 202, 0.2)",
                  background: "#fff",
                  display: isMobileView ? "inline-flex" : "none",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 4,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  marginRight: 8,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 3,
                    background: "#ff7d2d",
                    display: "block",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                  }}
                />
                <span
                  style={{
                    width: 24,
                    height: 3,
                    background: "#ff7d2d",
                    display: "block",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                  }}
                />
                <span
                  style={{
                    width: 24,
                    height: 3,
                    background: "#ff7d2d",
                    display: "block",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                  }}
                />
              </button>
            </div>
            {/* /Right */}
          </div>
        </div>
      </div>
    </header>
  );
}
