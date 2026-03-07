

import React, { useState, useEffect } from "react";

type AdminLayoutProps = {
  children: React.ReactNode;
  /** Optional page title shown above the admin content */
  title?: string;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const currentPath = window.location.hash;
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Initialize sidebar state from localStorage or default to true
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("adminSidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("adminSidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    console.log(
      "AdminLayout - Navigating from",
      window.location.hash,
      "to:",
      path
    );

    // Si on est déjà sur la même route, ne pas naviguer
    if (window.location.hash === path) {
      console.log("Already on this route, skipping navigation");
      return;
    }

    // Changer le hash avec une approche robuste
    try {
      window.location.hash = path;

      // Force un re-render en cas de problème
      setTimeout(() => {
        if (window.location.hash !== path) {
          console.log("Navigation failed, forcing hash change");
          window.location.hash = path;
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
      }, 100);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback: navigation directe
      window.location.href = path;
    }
  };

  const NavLink: React.FC<{
    path: string;
    children: React.ReactNode;
    isPrefix?: boolean;
  }> = ({ path, children, isPrefix = false }) => {
    const isActive = isPrefix
      ? currentPath.startsWith(path)
      : currentPath === path;
    return (
      <a
        href={path}
        onClick={(e) => handleNav(e, path)}
        className={`flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer block ${
          isActive
            ? "bg-[#e13734] text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-[#e13734]"
        }`}
      >
        {children}
      </a>
    );
  };

  return (
    <div className="px-4 md:px-6 pt-32 pb-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
          {title || "Administration"}
        </h1>
        <p className="text-slate-600">Bienvenue, {adminUser.firstName}.</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Toggle Button - Only shown when sidebar is closed */}
        {!isSidebarOpen && (
          <div className="hidden lg:block sticky top-32 z-30">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-[#e13734] p-2 rounded-lg shadow-lg border border-[#e13734] hover:bg-[#c42e2b] transition-colors text-white"
              aria-label="Open Sidebar"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        <aside
          className={`
            hidden
            ${isSidebarOpen ? "lg:flex lg:w-64" : "lg:hidden"}
            lg:relative lg:flex-col lg:h-auto lg:min-h-screen
            transition-all duration-300 ease-in-out
            flex-shrink-0
            z-40
          `}
        >
          <div className="bg-white p-4 rounded-xl shadow-lg h-full relative z-40 w-full">
            {/* Sidebar Header with Hide Button */}
            <div className="flex items-center justify-end mb-4 pb-3 border-b border-slate-200">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg bg-[#e13734] text-white hover:bg-[#c42e2b] transition-colors"
                aria-label="Hide Sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
            <nav className="space-y-1">
              <NavLink path="#/admin/dashboard">
                <span>Approbations</span>
              </NavLink>
              <NavLink path="#/profile">
                <span>Mon Profil</span>
              </NavLink>
              <NavLink path="#/admin/payments" isPrefix={true}>
                <span>Paiements</span>
              </NavLink>

              <div className="pt-2 mt-2 border-t border-slate-200">
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">
                  Personnes
                </p>
                <NavLink path="#/admin/students" isPrefix={true}>
                  <span>Étudiants</span>
                </NavLink>
                {adminUser.role !== "employee" && (
                  <NavLink path="#/admin/employees" isPrefix={true}>
                    <span>Employés</span>
                  </NavLink>
                )}
              </div>
              <div className="pt-2 mt-2 border-t border-slate-200">
                <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">
                  Contenu
                </p>
                <NavLink path="#/admin/courses" isPrefix={true}>
                  <span>Parcours</span>
                </NavLink>
                <NavLink path="#/admin/agenda" isPrefix={true}>
                  <span>Agenda</span>
                </NavLink>
              </div>
            </nav>
          </div>
        </aside>
        <main
          className={`
            flex-grow min-w-0 w-full transition-all duration-300
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;