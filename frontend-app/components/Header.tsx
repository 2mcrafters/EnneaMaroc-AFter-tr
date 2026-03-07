import React, { useState } from "react";
import Logo from "./Logo";
import AuthButtons from "./AuthButtons";
import { UserCircleIcon } from "./icons/UserCircleIcon";

const navLinkClass =
  "text-[#2790d0] hover:text-[#e13734] transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-[#e13734] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
    setIsMobileMenuOpen(false);
  };

  const goToVitrine = (target: string) => {
    window.location.href = `${window.location.origin}${target}`;
    setIsMobileMenuOpen(false);
  };

  const getProfilePath = () => {
    const role = localStorage.getItem("userRole");
    if (role === "admin") return "#/admin/dashboard";
    if (role === "employee") return "#/admin/dashboard";
    if (role === "prof") return "#/prof/dashboard";
    if (role === "student") return "#/dashboard";
    return "#/login";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-4 z-50 mx-auto w-[95%] max-w-7xl bg-white shadow-xl rounded-full transition-all duration-300">
      <div className="px-6 py-1 md:px-10 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <a href="/" aria-label="Aller à l'accueil">
            <Logo className="h-12 md:h-16 w-auto" />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => goToVitrine("/")}
            className={navLinkClass}
          >
            Accueil
          </button>
          <button
            type="button"
            onClick={() => goToVitrine("/#enneagramme-section")}
            className={navLinkClass}
          >
            Ennéagramme
          </button>
          <button
            type="button"
            onClick={() => goToVitrine("/ecole")}
            className={navLinkClass}
          >
            École
          </button>

          <a
            href="/agenda"
            onClick={(e) => {
              e.preventDefault();
              goToVitrine("/agenda");
            }}
            className={navLinkClass}
          >
            Agenda
          </a>
          <a
            href="#/courses"
            onClick={(e) => handleNav(e, "#/courses")}
            className={navLinkClass}
          >
            Parcours
          </a>
          <button
            type="button"
            onClick={() => goToVitrine("/contact")}
            className={navLinkClass}
          >
            Contact
          </button>
        </nav>

        {/* Right: Auth Buttons & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Profile Icon */}
          <a
            href={getProfilePath()}
            onClick={(e) => handleNav(e, getProfilePath())}
            className="lg:hidden inline-flex items-center justify-center text-slate-600 hover:text-[#e13734] transition-colors"
            aria-label="Aller au profil"
          >
            <UserCircleIcon className="w-7 h-7" />
          </a>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:block">
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-slate-700 hover:text-[#e13734] transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl py-6 px-6 flex flex-col gap-4 z-40 animate-in slide-in-from-top-5 duration-200 border border-slate-100">
          <button
            type="button"
            onClick={() => goToVitrine("/")}
            className="text-left text-slate-700 hover:text-[#e13734] font-semibold"
          >
            Accueil
          </button>
          <button
            type="button"
            onClick={() => goToVitrine("/#enneagramme-section")}
            className="text-left text-slate-700 hover:text-[#e13734] font-semibold"
          >
            Ennéagramme
          </button>
          <button
            type="button"
            onClick={() => goToVitrine("/ecole")}
            className="text-left text-slate-700 hover:text-[#e13734] font-semibold"
          >
            École
          </button>

          <button
            type="button"
            onClick={() => goToVitrine("/agenda")}
            className="text-left text-slate-700 hover:text-[#e13734] font-semibold"
          >
            Agenda
          </button>
          <a
            href="#/courses"
            onClick={(e) => handleNav(e, "#/courses")}
            className="text-left text-slate-700 hover:text-[#e13734] font-semibold"
          >
            Parcours
          </a>
          <button
            type="button"
            onClick={() => goToVitrine("/contact")}
            className="text-left text-slate-700 hover:text-[#e13734] font-semibold"
          >
            Contact
          </button>

          <div className="pt-4 border-t border-slate-100">
            <AuthButtons />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
