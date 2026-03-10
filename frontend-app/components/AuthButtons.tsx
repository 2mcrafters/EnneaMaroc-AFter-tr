import React from "react";
import { useAppDispatch } from "../store";
import { logoutAsync } from "../store/slices/simpleAuthSlice";

const AuthButtons: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [userRole, setUserRole] = React.useState(
    localStorage.getItem("userRole")
  );
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
      setUserRole(localStorage.getItem("userRole"));
    };

    window.addEventListener("storage_change", handleStorageChange);
    window.addEventListener("hashchange", handleStorageChange); // Also check on navigation

    return () => {
      window.removeEventListener("storage_change", handleStorageChange);
      window.removeEventListener("hashchange", handleStorageChange);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      setShowLogoutConfirm(false);
      // Utiliser l'action Redux pour gérer la déconnexion correctement
      await dispatch(logoutAsync()).unwrap();
      // Naviguer après que Redux ait traité avec succès la déconnexion
      window.location.hash = "#/login";
    } catch (error) {
      console.error("Échec de la déconnexion:", error);
      // Solution de secours en cas d'échec de l'appel API
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      setIsAuthenticated(false);
      setUserRole(null);
      window.dispatchEvent(new Event("storage_change"));
      window.location.hash = "#/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    console.log(
      "AuthButtons - Navigating from",
      window.location.hash,
      "to:",
      path
    );

    // Si on est déjà sur la même route, ne pas naviguer
    if (window.location.hash === path) {
      console.log("Déjà sur cette route, navigation ignorée");
      return;
    }

    // Changer le hash avec une approche robuste
    try {
      window.location.hash = path;

      // Force un re-render en cas de problème
      setTimeout(() => {
        if (window.location.hash !== path) {
          console.log("Échec de navigation, forçage du changement de hash");
          window.location.hash = path;
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
      }, 100);
    } catch (error) {
      console.error("Erreur de navigation:", error);
      // Fallback: navigation directe
      window.location.href = path;
    }
  };

  // Bouton de déconnexion commun avec état de chargement
  const logoutButton = (
    <button
      onClick={handleLogoutClick}
      disabled={isLoggingOut}
      className="px-5 py-2 text-sm font-semibold text-white bg-[#ff7d2d] rounded-full hover:bg-[#e06520] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );

  if (isAuthenticated) {
    if (userRole === "admin") {
      return (
        <>
          <div className="flex items-center gap-4">
            <a
              href="#/admin/dashboard"
              onClick={(e) => handleNav(e, "#/admin/dashboard")}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-full hover:bg-slate-50 hover:text-slate-800 hover:border-slate-400 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Tableau de bord
            </a>
            {logoutButton}
          </div>

          {/* Modal de Confirmation de Déconnexion */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Confirmer la déconnexion
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleLogoutCancel}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleLogoutConfirm}
                    disabled={isLoggingOut}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-[#ff7d2d] hover:bg-[#e06520] text-white disabled:opacity-70"
                  >
                    {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
    if (userRole === "employee") {
      return (
        <>
          <div className="flex items-center gap-4">
            <a
              href="#/admin/dashboard"
              onClick={(e) => handleNav(e, "#/admin/dashboard")}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-full hover:bg-slate-50 hover:text-slate-800 hover:border-slate-400 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Tableau de bord
            </a>
            <a
              href="#/employee/profile"
              onClick={(e) => handleNav(e, "#/employee/profile")}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300"
            >
              Profil
            </a>
            {logoutButton}
          </div>

          {/* Modal de Confirmation de Déconnexion */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Confirmer la déconnexion
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleLogoutCancel}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleLogoutConfirm}
                    disabled={isLoggingOut}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-[#ff7d2d] hover:bg-[#e06520] text-white disabled:opacity-70"
                  >
                    {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
    if (userRole === "prof") {
      return (
        <>
          <div className="flex items-center gap-4">
            <a
              href="#/prof/dashboard"
              onClick={(e) => handleNav(e, "#/prof/dashboard")}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-full hover:bg-slate-50 hover:text-slate-800 hover:border-slate-400 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Tableau de bord
            </a>
            <a
              href="#/prof/profile"
              onClick={(e) => handleNav(e, "#/prof/profile")}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300"
            >
              Profil
            </a>
            {logoutButton}
          </div>

          {/* Modal de Confirmation de Déconnexion */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Confirmer la déconnexion
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleLogoutCancel}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleLogoutConfirm}
                    disabled={isLoggingOut}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-[#ff7d2d] hover:bg-[#e06520] text-white disabled:opacity-70"
                  >
                    {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
    return (
      <>
        <div className="flex items-center gap-4">
          <a
            href="#/dashboard"
            onClick={(e) => handleNav(e, "#/dashboard")}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-full hover:bg-slate-50 hover:text-slate-800 hover:border-slate-400 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Tableau de bord
          </a>
          {logoutButton}
        </div>

        {/* Modal de Confirmation de Déconnexion */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Confirmer la déconnexion
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 text-sm font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Annuler
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm font-medium rounded-full bg-[#ff7d2d] hover:bg-[#e06520] text-white disabled:opacity-70"
                >
                  {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <a
        href="#/login"
        onClick={(e) => handleNav(e, "#/login")}
        className="text-sm font-semibold text-[#2790d0] hover:text-[#ff7d2d] transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-[#ff7d2d] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
      >
        Connexion
      </a>
      <a
        href="#/signup"
        onClick={(e) => handleNav(e, "#/signup")}
        className="px-5 py-2 text-sm font-semibold text-white bg-[#0a83ca] rounded-full hover:bg-[#0870b3] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
      >
        Inscription
      </a>
    </div>
  );
};

export default AuthButtons;
