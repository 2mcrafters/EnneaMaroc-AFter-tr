import React, { useState, useEffect, useRef } from "react";
import { HomeIcon } from "./icons/HomeIcon";
import { BookOpenIcon } from "./icons/BookOpenIcon";
import { ClipboardListIcon } from "./icons/ClipboardListIcon";
import { CreditCardIcon } from "./icons/CreditCardIcon";
import { UserCircleIcon } from "./icons/UserCircleIcon";
import { LayoutGridIcon } from "./icons/LayoutGridIcon";
import { UsersIcon } from "./icons/UsersIcon";
import { CalendarDaysIcon } from "./icons/CalendarDaysIcon";

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  activePaths: string[];
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  label,
  icon,
  activePaths,
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkActive = () => {
      const currentPath = window.location.hash || "#/";
      const active = activePaths.some((path) => {
        if (path.endsWith("/")) {
          return currentPath.startsWith(path);
        }
        return currentPath === path;
      });
      setIsActive(active);
    };
    checkActive();
    window.addEventListener("hashchange", checkActive);
    return () => window.removeEventListener("hashchange", checkActive);
  }, [activePaths]);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>) => {
    console.log("BottomNav navigating to:", href);
    // Ne pas empêcher le comportement par défaut
    // e.preventDefault();

    // Mettre à jour le hash directement
    setTimeout(() => {
      window.location.hash = href;
    }, 0);
  };

  return (
    <a
      href={href}
      onClick={handleNav}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-center transition-colors duration-300 ${
        isActive ? "text-[#ff7d2d]" : "text-slate-500 hover:text-[#ff7d2d]"
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </a>
  );
};

const BottomNav: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateAuthState = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
      setUserRole(localStorage.getItem("userRole"));
    };

    updateAuthState();
    window.addEventListener("storage_change", updateAuthState);
    return () => window.removeEventListener("storage_change", updateAuthState);
  }, []);

  useEffect(() => {
    const handleInteraction = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleNav = () => setOpenMenu(null);

    document.addEventListener("mousedown", handleInteraction);
    window.addEventListener("hashchange", handleNav);
    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("hashchange", handleNav);
    };
  }, []);

  if (!isAuthenticated) return null;

  const handleMenuToggle = (menuName: string) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const AdminMenuGroup: React.FC<{
    label: string;
    icon: React.ReactNode;
    links: Array<{ href: string; label: string; activePaths: string[] }>;
    menuKey: string;
  }> = ({ label, icon, links, menuKey }) => {
    const isOpen = openMenu === menuKey;
    const [isActive, setIsActive] = useState(false);
    const allActivePaths = links.flatMap((l) => l.activePaths);

    useEffect(() => {
      const checkActive = () => {
        const currentPath = window.location.hash || "#/";
        const active = allActivePaths.some((path) => {
          if (path.endsWith("/")) return currentPath.startsWith(path);
          return currentPath === path;
        });
        setIsActive(active);
      };
      checkActive();
      window.addEventListener("hashchange", checkActive);
      return () => window.removeEventListener("hashchange", checkActive);
    }, [allActivePaths]);

    const handleLinkClick = (
      e: React.MouseEvent<HTMLAnchorElement>,
      href: string
    ) => {
      e.preventDefault();
      window.location.hash = href;
    };

    return (
      <div className="relative flex flex-col items-center justify-center w-full">
        {isOpen && (
          <div
            className="absolute bottom-full mb-3 w-44 bg-white rounded-lg shadow-2xl border border-slate-200 p-2 z-50"
            style={{ animationDuration: "0.3s" }}
          >
            <div className="space-y-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-[#ff7d2d] hover:text-white font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => handleMenuToggle(menuKey)}
          className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-center transition-colors duration-300 ${
            isActive || isOpen
              ? "text-[#ff7d2d]"
              : "text-slate-500 hover:text-[#ff7d2d]"
          }`}
        >
          {icon}
          <span className="text-xs mt-1">{label}</span>
        </button>
      </div>
    );
  };

  // For students show direct access to the main Courses listing
  // and keep Dashboard / Payments. Remove Profile from bottom nav (profile is in header).
  const studentLinks = [
    {
      href: "#/dashboard",
      label: "Tableau de bord",
      icon: <HomeIcon className="w-6 h-6" />,
      activePaths: ["#/dashboard"],
    },
    {
      href: "#/courses",
      label: "Parcours",
      icon: <BookOpenIcon className="w-6 h-6" />,
      activePaths: ["#/courses", "#/courses/"],
    },
    {
      href: "#/monthly-payments",
      label: "Paiements",
      icon: <CreditCardIcon className="w-6 h-6" />,
      activePaths: ["#/monthly-payments"],
    },
  ];

  const profLinks = [
    {
      href: "#/prof/dashboard",
      label: "Tableau de bord",
      icon: <LayoutGridIcon className="w-6 h-6" />,
      activePaths: ["#/prof/dashboard"],
    },
    // Profile link removed from bottom nav; shown in header on mobile
  ];

  const renderAdminNav = () => (
    <>
      <NavLink
        href="#/admin/dashboard"
        label="Tableau de bord"
        icon={<LayoutGridIcon className="w-6 h-6" />}
        activePaths={["#/admin/dashboard"]}
      />
      <AdminMenuGroup
        menuKey="people"
        label="Personnes"
        icon={<UsersIcon className="w-6 h-6" />}
        links={[
          {
            href: "#/admin/students",
            label: "Étudiants",
            activePaths: ["#/admin/students", "#/admin/students?"],
          },
          {
            href: "#/admin/employees",
            label: "Employés",
            activePaths: ["#/admin/employees", "#/admin/employees/"],
          },
        ]}
      />
      <AdminMenuGroup
        menuKey="content"
        label="Contenu"
        icon={<BookOpenIcon className="w-6 h-6" />}
        links={[
          {
            href: "#/admin/courses",
            label: "Parcours",
            activePaths: ["#/admin/courses", "#/admin/courses/"],
          },
          {
            href: "#/admin/agenda",
            label: "Agenda",
            activePaths: ["#/admin/agenda"],
          },
        ]}
      />
      <AdminMenuGroup
        menuKey="finance"
        label="Finance"
        icon={<CreditCardIcon className="w-6 h-6" />}
        links={[
          {
            href: "#/admin/dashboard",
            label: "Approbations",
            activePaths: ["#/admin/dashboard"],
          },
          {
            href: "#/admin/payments",
            label: "Paiements",
            activePaths: ["#/admin/payments"],
          },
        ]}
      />
      {/* Profile link removed from bottom nav; shown in header on mobile */}
    </>
  );

  const renderEmployeeNav = () => (
    <>
      <NavLink
        href="#/admin/dashboard"
        label="Tableau de bord"
        icon={<LayoutGridIcon className="w-6 h-6" />}
        activePaths={["#/admin/dashboard"]}
      />
      <AdminMenuGroup
        menuKey="people"
        label="Personnes"
        icon={<UsersIcon className="w-6 h-6" />}
        links={[
          {
            href: "#/admin/students",
            label: "Étudiants",
            activePaths: ["#/admin/students", "#/admin/students?"],
          },
        ]}
      />
      <AdminMenuGroup
        menuKey="content"
        label="Contenu"
        icon={<BookOpenIcon className="w-6 h-6" />}
        links={[
          {
            href: "#/admin/courses",
            label: "Parcours",
            activePaths: ["#/admin/courses", "#/admin/courses/"],
          },
        ]}
      />
      <AdminMenuGroup
        menuKey="finance"
        label="Finance"
        icon={<CreditCardIcon className="w-6 h-6" />}
        links={[
          {
            href: "#/admin/dashboard",
            label: "Approbations",
            activePaths: ["#/admin/dashboard"],
          },
          {
            href: "#/admin/payments",
            label: "Paiements",
            activePaths: ["#/admin/payments"],
          },
        ]}
      />
      {/* Profile link removed from bottom nav; shown in header on mobile */}
    </>
  );

  const renderNavContent = () => {
    if (userRole === "admin") {
      return renderAdminNav();
    }
    if (userRole === "employee") {
      return renderEmployeeNav();
    }
    const linksToShow = userRole === "prof" ? profLinks : studentLinks;
    return linksToShow.map((link) => <NavLink key={link.href} {...link} />);
  };

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.05)] lg:hidden bottom-nav-safe"
    >
      <div className="flex justify-around items-center h-16">
        {renderNavContent()}
      </div>
      {openMenu && (
        <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
      )}
    </nav>
  );
};

export default BottomNav;
