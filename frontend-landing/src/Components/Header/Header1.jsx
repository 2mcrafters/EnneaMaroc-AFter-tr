// src/components/Header1.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../services/auth";

export default function Header1({ variant = "" }) {
  // ---- UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSticky, setIsSticky] = useState("");
  const prevScrollPosRef = useRef(0);

  // ---- Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // ---- Router
  const navigate = useNavigate();
  const location = useLocation();

  // ---- Dropdown
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const navListId = "main-nav-list";

  // ---- NAV ITEMS (URLs sans accents)
  const navItems = [
    {
      type: "hash",
      label: "Enneagram",
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
      if (y > prev) setIsSticky("cs-gescout_sticky");
      else if (y !== 0) setIsSticky("cs-gescout_show cs-gescout_sticky");
      else setIsSticky("");
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
          style={{ display: "inline-flex", alignItems: "center", height: 44 }}
        >
          {item.label}
        </a>
      );
    }

    if (item.type === "link") {
      return (
        <Link
          to={item.to}
          className="cs_nav_link"
          role="menuitem"
          onClick={closeMobileAll}
          style={{ display: "inline-flex", alignItems: "center", height: 44 }}
        >
          {item.label}
        </Link>
      );
    }

    if (item.type === "select") {
      const isOpen = openDropdown === item.label;
      const normalizedPath = location.pathname.toLowerCase();
      const selectedOption = item.options.find(
        (opt) => normalizedPath === opt.to.toLowerCase()
      );
      const dropdownId = `nav-dropdown-${item.label}`;

      return (
        <div
          ref={registerDropdownRef(item.label)}
          className={`nav-dropdown ${isOpen ? "is-open" : ""}`}
        >
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
                const firstLink =
                  dropdownRefs.current?.[item.label]?.querySelector(
                    ".nav-dropdown-link"
                  );
                if (firstLink) firstLink.focus();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setOpenDropdown(null);
              }
            }}
          >
            <span className="nav-dropdown-label">{item.label}</span>
            {selectedOption ? (
              <span className="nav-dropdown-active-pill">
                {selectedOption.label}
              </span>
            ) : null}
            <svg
              aria-hidden="true"
              className={`nav-dropdown-caret ${isOpen ? "is-open" : ""}`}
              viewBox="0 0 12 8"
              fill="none"
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

          <div id={dropdownId} className="nav-dropdown-menu" role="menu">
            <div className="nav-dropdown-surface" role="none">
              {item.options.map((opt) => {
                const isActive = normalizedPath === opt.to.toLowerCase();
                return (
                  <Link
                    key={opt.to}
                    to={opt.to}
                    className={`nav-dropdown-link ${
                      isActive ? "is-active" : ""
                    }`}
                    role="menuitem"
                    onClick={closeMobileAll}
                  >
                    <span>{opt.label}</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 14 12"
                      className="nav-dropdown-link-icon"
                    >
                      <path
                        d="M1 6h10M7 1l5 5-5 5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                      />
                    </svg>
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
      } ${isSticky}`}
      style={{ position: "relative", zIndex: 60 }}
    >
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
                onClick={closeMobileAll}
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
            <div className="cs_main_header_center nav-center">
              <div className="cs_nav cs_primary_font fw-medium">
                <nav className="cs_navbar" role="navigation" aria-label="Main">
                  <ul
                    id={navListId}
                    className={`cs_nav_list ${mobileOpen ? "is-open" : ""}`}
                    role="menubar"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 28,
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
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
                      href={isLoggedIn ? "/app/#/profile" : "/app/#/login"}
                      aria-label={
                        isLoggedIn ? "Profil" : "Accéder à la page Se connecter"
                      }
                      onClick={closeMobileAll}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#1c8bce",
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
                  display: "inline-flex",
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
                    background: "#0a83ca",
                    display: "block",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                  }}
                />
                <span
                  style={{
                    width: 24,
                    height: 3,
                    background: "#0a83ca",
                    display: "block",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                  }}
                />
                <span
                  style={{
                    width: 24,
                    height: 3,
                    background: "#0a83ca",
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
