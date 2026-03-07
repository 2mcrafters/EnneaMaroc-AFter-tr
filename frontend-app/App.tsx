import React, { useState, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "./store";
import { AppDispatch } from "./store";
import { restoreAuthState, resetAuth } from "./store/slices/simpleAuthSlice";
import { setupPageRefreshHandler } from "./utils/pageRefreshHandler";
import { fetchInitialData } from "./utils/initialDataFetch";
import { checkAppVersion } from "./utils/cacheUtils";
import Logo from "./components/Logo";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePageNew from "./pages/ProfilePageNew";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursesListPage from "./pages/CoursesListPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminStudentsListPage from "./pages/AdminStudentsListPage";
import AdminProfFormPage from "./pages/AdminProfFormPage";
import AdminCoursesListPage from "./pages/AdminCoursesListPage";
import AdminCourseFormPage from "./pages/AdminCourseFormPage";
import AdminCourseDetailsPage from "./pages/AdminCourseDetailsPage";
import AdminParcoursListPage from "./pages/AdminParcoursListPage";
import AdminParcoursEditPage from "./pages/AdminParcoursEditPage";
import AdminParcoursCreatePage from "./pages/AdminParcoursCreatePage";
import AdminAgendaPage from "./pages/AdminAgendaPage";
import FronteneaAgenda from "./pages/frontenea/FronteneaAgenda";

import MonthlyPaymentsPage from "./pages/MonthlyPaymentsPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import BottomNav from "./components/BottomNav";
import AdminStudentFormPage from "./pages/AdminStudentFormPage";
import AdminProfsListPage from "./pages/AdminProfsListPage";
import ProfDashboardPage from "./pages/ProfDashboardPage";
import ProfProfilePage from "./pages/ProfProfilePage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import AdminEmployeesListPage from "./pages/AdminEmployeesListPage";
import AdminEmployeeFormPage from "./pages/AdminEmployeeFormPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import EmployeeProfilePage from "./pages/EmployeeProfilePage";
import AdminDepartmentsPage from "./pages/AdminDepartmentsPage";
import ConfirmationPage from "./pages/ConfirmationPage";

// Composant pour initialiser l'application et restaurer l'état d'authentification
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshHandlerRef = useRef<any>(null);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleAuthLogout = () => {
      console.log("🔒 Received auth:logout event, clearing Redux state");
      dispatch(resetAuth());
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [dispatch]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Restaurer l'état d'authentification depuis localStorage
        const token =
          localStorage.getItem("auth_token") || localStorage.getItem("token");
        const userJson = localStorage.getItem("user");
        let currentUser = null;
        let currentIsAuthenticated = false;

        if (token && userJson) {
          try {
            currentUser = JSON.parse(userJson);
            dispatch(restoreAuthState({ user: currentUser, token }));
            currentIsAuthenticated = true;

            // Setup page refresh handler to reload data on page refresh
            refreshHandlerRef.current = setupPageRefreshHandler(dispatch);
            console.log("📱 Page refresh handler initialized");
          } catch (error) {
            console.error("Error restoring authentication state:", error);
            // Nettoyer localStorage en cas d'erreur
            localStorage.removeItem("auth_token");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("userRole");
          }
        }

        // Fetch les données initiales selon l'état d'authentification
        console.log("🚀 Starting initial data fetch...");
        await fetchInitialData(dispatch, {
          isAuthenticated: currentIsAuthenticated,
          userId: currentUser?.id,
          force: false,
        });
      } catch (error) {
        console.error("❌ App initialization failed:", error);
        // Continue anyway - l'app peut fonctionner avec des données en cache
      } finally {
        // Check app version for cache busting
        checkAppVersion();
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Afficher un écran de chargement pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-50">
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-pistachio-light/20 blur-3xl rounded-full animate-pulse"></div>

          {/* Logo Container */}
          <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 mb-10">
            <img
              src="/assets/images/logo/logo.png"
              alt="Loading..."
              className="h-20 w-auto object-contain animate-[pulse_3s_ease-in-out_infinite]"
            />
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-56 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-pistachio-dark via-pistachio-DEFAULT to-pistachio-dark rounded-full animate-loading-bar"></div>
          </div>
          <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">
            Chargement de l'expérience...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// A simple hash-based router
const useHashNavigation = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || "#/");

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || "#/");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return currentPath;
};

const App: React.FC = () => {
  console.log("App component mounting...");
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const userRole = user?.role;
  const currentPath = useHashNavigation();

  // Safety guard: if the user is already authenticated and opened the app at root,
  // prevent any immediate automatic redirect to dashboards triggered by other code during startup.
  // This listener is short-lived (2s) and will revert dashboard redirects back to root.
  React.useEffect(() => {
    if (!isAuthenticated) return;
    const initialHashes = ["", "#/"];
    const startHash = window.location.hash || "#/";
    if (!initialHashes.includes(startHash)) return;

    const onHashChange = () => {
      // Respect user-initiated navigations (set transiently by link handlers)
      const wn: any = window as any;
      if (wn.__manualNav) {
        return;
      }
      const h = window.location.hash || "#/";
      // If some code tried to send the user to a dashboard immediately, revert to root
      if (
        h !== "#/" &&
        (h === "#/dashboard" ||
          h.startsWith("#/admin") ||
          h.startsWith("#/prof"))
      ) {
        window.location.hash = "#/";
      }
    };

    window.addEventListener("hashchange", onHashChange);
    const timer = window.setTimeout(() => {
      window.removeEventListener("hashchange", onHashChange);
    }, 2000);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      clearTimeout(timer);
    };
  }, [isAuthenticated]);

  // Guard navigation centrally
  useEffect(() => {
    // If user is NOT authenticated and tries to access a protected route -> redirect login
    const protectedPrefixes = [
      "#/dashboard",
      "#/profile",
      "#/my-courses",
      "#/monthly-payments",
      "#/prof/",
      "#/employee/",
      "#/admin/",
    ];
    const isProtected = protectedPrefixes.some((p) =>
      currentPath.startsWith(p)
    );
    if (!isAuthenticated && isProtected && currentPath !== "#/login") {
      window.location.hash = "#/login";
      return;
    }

    // If authenticated and on login or signup, redirect to dashboard
    if (
      isAuthenticated &&
      (currentPath === "#/login" || currentPath === "#/signup")
    ) {
      if (userRole === "admin" || userRole === "employee") {
        window.location.hash = "#/admin/dashboard";
      } else if (userRole === "prof") {
        window.location.hash = "#/prof/dashboard";
      } else {
        window.location.hash = "#/dashboard";
      }
    }

    // Redirect #/profile to role-specific profile pages
    if (isAuthenticated && currentPath === "#/profile") {
      if (userRole === "admin") {
        window.location.hash = "#/admin/profile";
        return;
      }
      if (userRole === "employee") {
        window.location.hash = "#/employee/profile";
        return;
      }
      if (userRole === "prof") {
        window.location.hash = "#/prof/profile";
        return;
      }
    }
  }, [isAuthenticated, currentPath, userRole]);

  useEffect(() => {
    // Cleanup previously seeded fake users if they still exist
    try {
      const raw = localStorage.getItem("users");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const blacklist = new Set(["test@example.com", "jane@example.com"]);
          const filtered = parsed.filter((u) => !blacklist.has(u.email));
          if (filtered.length !== parsed.length) {
            localStorage.setItem("users", JSON.stringify(filtered));
          }
        }
      }
    } catch {
      /* ignore JSON errors */
    }
  }, []);

  const renderPage = () => {
    const canManageContent =
      isAuthenticated && (userRole === "admin" || userRole === "employee");
    const canManagePeople =
      isAuthenticated && (userRole === "admin" || userRole === "employee");

    // Courses listing page: accept '#/courses', '#/courses/', '#/courses/in-person', '#/courses/online'
    if (
      currentPath === "#/courses" ||
      currentPath === "#/courses/" ||
      currentPath.startsWith("#/courses/")
    ) {
      return <CoursesListPage />;
    }
    if (currentPath.startsWith("#/course/")) {
      return <CourseDetailPage key={currentPath} />; // Use path as key to force re-render
    }

    if (currentPath.startsWith("#/register")) {
      return <SignUpPage />;
    }

    // Admin routes first (more specific)
    if (currentPath.startsWith("#/admin/students")) {
      if (currentPath === "#/admin/students/new") {
        return canManagePeople ? <AdminStudentFormPage /> : <LoginPage />;
      }
      if (currentPath.startsWith("#/admin/students/edit/")) {
        return canManagePeople ? (
          <AdminStudentFormPage key={currentPath} />
        ) : (
          <LoginPage />
        );
      }
      // Handles #/admin/students and #/admin/students?studentId=...
      return canManagePeople ? <AdminStudentsListPage /> : <LoginPage />;
    }
    if (currentPath.startsWith("#/admin/profs/edit/")) {
      // Instructor management is hidden/disabled
      window.location.hash = "#/admin/dashboard";
      return <></>;
    }
    if (currentPath.startsWith("#/admin/employees/edit/")) {
      return isAuthenticated && userRole === "admin" ? (
        <AdminEmployeeFormPage key={currentPath} />
      ) : (
        <LoginPage />
      );
    }
    if (currentPath.startsWith("#/admin/courses/edit/")) {
      return canManageContent ? (
        <AdminCourseFormPage key={currentPath} />
      ) : (
        <LoginPage />
      );
    }

    if (currentPath.startsWith("#/admin/courses/details/")) {
      return canManageContent ? (
        <AdminCourseDetailsPage key={currentPath} />
      ) : (
        <LoginPage />
      );
    }

    if (currentPath.startsWith("#/admin/parcours/")) {
      // Check if it's the create page
      if (currentPath === "#/admin/parcours/create") {
        return isAuthenticated && userRole === "admin" ? (
          <AdminParcoursCreatePage key={currentPath} />
        ) : (
          <LoginPage />
        );
      }
      // Otherwise it's an edit page
      return isAuthenticated && userRole === "admin" ? (
        <AdminParcoursEditPage key={currentPath} />
      ) : (
        <LoginPage />
      );
    }

    switch (currentPath) {
      case "#/login":
        return isAuthenticated ? <></> : <LoginPage />;
      case "#/signup":
        return isAuthenticated ? <></> : <SignUpPage />;
      case "#/dashboard":
        return isAuthenticated && userRole === "student" ? (
          <StudentDashboardPage />
        ) : (
          <LoginPage />
        );
      case "#/profile":
        return isAuthenticated && userRole === "student" ? (
          <ProfilePageNew />
        ) : (
          <LoginPage />
        );
      case "#/my-courses":
        return isAuthenticated && userRole === "student" ? (
          <MyCoursesPage />
        ) : (
          <LoginPage />
        );
      case "#/monthly-payments":
        return isAuthenticated && userRole === "student" ? (
          <MonthlyPaymentsPage />
        ) : (
          <LoginPage />
        );
      case "#/confirmation":
        return isAuthenticated ? <ConfirmationPage /> : <LoginPage />;
      case "#/prof/dashboard":
        // Instructor role UI disabled
        window.location.hash = "#/";
        return <></>;
      case "#/prof/profile":
        // Instructor role UI disabled
        window.location.hash = "#/";
        return <></>;
      case "#/employee/profile":
        return isAuthenticated && userRole === "employee" ? (
          <EmployeeProfilePage />
        ) : (
          <LoginPage />
        );
      case "#/admin/dashboard":
        return isAuthenticated &&
          (userRole === "admin" || userRole === "employee") ? (
          <AdminDashboardPage />
        ) : (
          <LoginPage />
        );
      case "#/employee/dashboard":
        return isAuthenticated && userRole === "employee" ? (
          <AdminDashboardPage />
        ) : (
          <LoginPage />
        );
      case "#/admin/profile":
        return isAuthenticated && userRole === "admin" ? (
          <AdminProfilePage />
        ) : (
          <LoginPage />
        );
      case "#/admin/profs":
        // Instructor management is hidden/disabled
        window.location.hash = "#/admin/dashboard";
        return <></>;
      case "#/admin/profs/new":
        // Instructor management is hidden/disabled
        window.location.hash = "#/admin/dashboard";
        return <></>;
      case "#/admin/employees":
        return isAuthenticated && userRole === "admin" ? (
          <AdminEmployeesListPage />
        ) : (
          <LoginPage />
        );
      case "#/admin/employees/new":
        return isAuthenticated && userRole === "admin" ? (
          <AdminEmployeeFormPage />
        ) : (
          <LoginPage />
        );
      case "#/admin/courses":
        return canManageContent ? <AdminCoursesListPage /> : <LoginPage />;
      case "#/admin/parcours":
        return isAuthenticated && userRole === "admin" ? (
          <AdminParcoursListPage />
        ) : (
          <LoginPage />
        );
      case "#/admin/agenda":
        return isAuthenticated && userRole === "admin" ? (
          <AdminAgendaPage />
        ) : (
          <LoginPage />
        );
      case "#/agenda":
        return <FronteneaAgenda />;
      case "#/admin/courses/new":
        return canManageContent ? <AdminCourseFormPage /> : <LoginPage />;
      case "#/admin/payments":
        return canManageContent ? <AdminPaymentsPage /> : <LoginPage />;
      case "#/admin/departments":
        return canManageContent ? <AdminDepartmentsPage /> : <LoginPage />;
      case "#/":
        window.location.hash = "#/login";
        return <></>;
      default:
        return <LandingPage />;
    }
  };

  const isAuthPage = currentPath === "#/login" || currentPath === "#/signup";

  return (
    <div
      className={`min-h-screen ${
        isAuthPage
          ? "bg-gradient-to-br from-[#2790d0] to-[#3f96ca]"
          : "bg-white"
      } text-slate-800 font-sans relative`}
    >
      {isAuthPage && (
        <div
          className="absolute inset-0 z-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/imgss001/coaching (1).jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        />
      )}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className="pb-24 lg:pb-0 flex-grow">{renderPage()}</main>
        <BottomNav />
      </div>
    </div>
  );
};

// Wrapper App avec Redux Provider
const AppWithRedux: React.FC = () => {
  return (
    <Provider store={store}>
      <AppInitializer>
        <App />
      </AppInitializer>
    </Provider>
  );
};

export default AppWithRedux;
