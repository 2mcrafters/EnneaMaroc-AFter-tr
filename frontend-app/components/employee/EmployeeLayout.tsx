import React from 'react';
import Logo from '../Logo';

const EmployeeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const currentPath = window.location.hash;
    const employeeUser = JSON.parse(localStorage.getItem('user') || '{}');

    const handleNav = (
      e: React.MouseEvent<HTMLAnchorElement>,
      path: string
    ) => {
      e.preventDefault();
      console.log(
        "EmployeeLayout - Navigating from",
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
          className={`flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
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
      <div className="min-h-screen bg-slate-50">
        {/* Compact sticky top bar */}
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between h-14 px-4 md:px-6">
            <a href="/" aria-label="Aller à l'accueil">
              <Logo className="h-9 w-auto" />
            </a>
            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-[#e13734] bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="hidden sm:inline">Accueil</span>
            </a>
          </div>
        </div>

        <div className="px-4 md:px-6 pt-4 pb-12">
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">
              Tableau de Bord Employé
            </h1>
            <p className="text-slate-600">
              Bienvenue, {employeeUser.firstName || employeeUser.name}.
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:flex lg:w-64 flex-shrink-0">
              <div className="bg-white p-4 rounded-xl shadow-lg h-full w-full">
                {/* Home button at top of sidebar */}
                <div className="mb-4 pb-3 border-b border-slate-200">
                  <a
                    href="/"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#e13734] transition-colors"
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span>Accueil</span>
                  </a>
                </div>
                <nav className="space-y-1">
                  <NavLink path="#/employee/dashboard">
                    <span>Approbations</span>
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
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">
                      Contenu
                    </p>
                    <NavLink path="#/admin/courses" isPrefix={true}>
                      <span>Cours</span>
                    </NavLink>
                  </div>
                </nav>
              </div>
            </aside>
            <main className="flex-grow min-w-0 w-full">{children}</main>
          </div>
        </div>
      </div>
    );
};

export default EmployeeLayout;