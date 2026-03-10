import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/index";
import { loginAsync, clearError } from "../store/slices/simpleAuthSlice";
import { forceRefreshAllData } from "../utils/dataPreloader";
import InputField from "../components/InputField";
import AlertManager from "../utils/AlertManager";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isPreloading, setIsPreloading] = useState(false);
  const [isEnrollmentFlow, setIsEnrollmentFlow] = useState(false);
  const [enrollmentInfo, setEnrollmentInfo] = useState<{
    courseName: string;
    groupDay: string;
    groupTime: string;
  } | null>(null);

  // Handle error display with SweetAlert2
  useEffect(() => {
    if (error) {
      let errorMessage = getErrorMessage(error);

      // Utiliser la nouvelle fonction spécifique à l'authentification
      AlertManager.auth.loginFailed(errorMessage);

      // Log pour le debugging (à supprimer en production)
      console.log("Erreur originale:", error);

      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Check for enrollment flow
  useEffect(() => {
    const isLegacyFlow = sessionStorage.getItem("enrollmentFlow") === "true";
    const isVitrineFlow = !!sessionStorage.getItem("registrationData");

    if (isLegacyFlow || isVitrineFlow) {
      setIsEnrollmentFlow(true);

      // Load enrollment info to display to user
      try {
        if (isVitrineFlow) {
          const regData = JSON.parse(
            sessionStorage.getItem("registrationData") || "{}"
          );
          setEnrollmentInfo({
            courseName: regData.moduleTitle || "Module Sélectionné",
            groupDay: regData.sessionDate || "Date à confirmer",
            groupTime: regData.place || "Lieu à confirmer",
          });
        } else {
          const enrollmentType = sessionStorage.getItem("enrollmentType");
          const enrollmentGroup = sessionStorage.getItem("enrollmentGroup");
          const courseName = sessionStorage.getItem("enrollmentCourseName");

          if (enrollmentType === "course" && enrollmentGroup) {
            const group = JSON.parse(enrollmentGroup);
            setEnrollmentInfo({
              courseName: courseName || "Selected Course",
              groupDay: group.day || "Not specified",
              groupTime: group.time || "Not specified",
            });
          }
        }
      } catch (error) {
        console.log("Could not parse enrollment info:", error);
      }
    }
  }, []);

  // Function to translate error messages to user-friendly messages
  const getErrorMessage = (errorMessage: string): string => {
    // Message d'erreur pour identifiants incorrects - cas le plus courant
    if (
      errorMessage.toLowerCase().includes("incorrect") ||
      errorMessage.toLowerCase().includes("invalid credentials") ||
      errorMessage.toLowerCase().includes("identifiants") ||
      errorMessage.toLowerCase().includes("the provided credentials")
    ) {
      return "Informations de connexion incorrectes. Veuillez vérifier votre email et mot de passe.";
    }
    // Message pour compte non trouvé
    else if (
      errorMessage.toLowerCase().includes("user not found") ||
      errorMessage.toLowerCase().includes("utilisateur non trouvé")
    ) {
      return "Aucun compte n'existe avec cette adresse email.";
    }
    // Message spécifique pour problème de mot de passe
    else if (
      errorMessage.toLowerCase().includes("password") ||
      errorMessage.toLowerCase().includes("mot de passe")
    ) {
      return "Le mot de passe que vous avez saisi est incorrect.";
    }
    // Message pour problèmes de connexion réseau
    else if (
      errorMessage.toLowerCase().includes("network") ||
      errorMessage.toLowerCase().includes("réseau")
    ) {
      return "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.";
    }
    // Message par défaut plus convivial
    return "Impossible de se connecter. Veuillez vérifier vos informations et réessayer.";
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(clearError());

    // Validate form
    if (!email || !password) {
      AlertManager.showError({
        title: "Champs Obligatoires",
        message: "Veuillez remplir tous les champs",
        details: "L'email et le mot de passe sont requis",
      });
      return;
    }

    try {
      const result = await dispatch(loginAsync({ email, password })).unwrap();
      const userRole = result.user.role;
      const userId = result.user.id;
      console.log("🔑 Login successful, preloading data silently...");

      // Start inline preloading indicator (no popup)
      setIsPreloading(true);

      // Forcer le chargement de toutes les données à chaque connexion
      const dataLoaded = await forceRefreshAllData(dispatch, userRole, userId);

      // Stop inline preloading indicator
      setIsPreloading(false);

      if (!dataLoaded) {
        console.warn(
          "⚠️ Some data failed to preload, but continuing with navigation"
        );
      } else {
        console.log("✅ Data preloaded successfully");

        // Attendre un court délai pour que Redux traite les données
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Check if user was trying to enroll before login
      const wasEnrolling =
        sessionStorage.getItem("enrollmentFlow") === "true" ||
        !!sessionStorage.getItem("registrationData");

      if (wasEnrolling && userRole === "student") {
        // Redirect to enrollment confirmation page instead of cleaning up data
        window.location.hash = "#/confirmation";
      } else {
        // Normal redirection based on role
        switch (userRole) {
          case "admin":
            window.location.hash = "#/admin/dashboard";
            break;
          case "employee":
            window.location.hash = "#/admin/dashboard";
            break;
          case "prof":
            window.location.hash = "#/prof/dashboard";
            break;
          default:
            window.location.hash = "#/dashboard";
        }
      }
    } catch (err) {
      // Error is handled by the useEffect watching the error state
    }
  }

  function handleNav(e: React.MouseEvent<HTMLAnchorElement>, path: string) {
    e.preventDefault();
    window.location.hash = path;
  }

  async function handlePasswordResetRequest(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!resetEmail) {
      AlertManager.showError({
        title: "Champ Obligatoire",
        message: "Veuillez saisir votre adresse email",
        confirmText: "OK",
      });
      return;
    }

    try {
      // Show loading indicator
      AlertManager.showLoading("Traitement de votre demande...");

      // TODO: appelle ton endpoint de reset mot de passe ici
      // Simulation d'un appel API pour l'exemple
      await new Promise((resolve) => setTimeout(resolve, 1500));

      AlertManager.close();

      // Fermer le modal
      setIsForgotPasswordModalOpen(false);
      setResetEmail("");

      // Afficher un message de succès
      AlertManager.showInfo({
        title: "Instructions Envoyées",
        message: `Si un compte existe avec l'email ${resetEmail}, vous recevrez un email avec des instructions pour réinitialiser votre mot de passe.`,
        details: "Veuillez vérifier votre boîte de réception et vos spams",
        autoClose: true,
        duration: 5000,
      });
    } catch (error) {
      AlertManager.showError({
        title: "Envoi Échoué",
        message:
          "Nous n'avons pas pu envoyer les instructions de réinitialisation",
        details: "Veuillez réessayer plus tard",
        confirmText: "OK",
      });
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-md p-5 sm:p-8 space-y-5 sm:space-y-6 bg-white rounded-2xl shadow-xl border border-slate-100">
        {isEnrollmentFlow && (
          <div className="text-center p-4 bg-pistachio-light rounded-lg border border-pistachio-dark/20">
            <h3 className="font-semibold text-slate-800 mb-2">
              Connectez-vous pour commencer
            </h3>
            {enrollmentInfo && (
              <div className="text-sm text-slate-700 mb-2">
                <strong>Cours Sélectionné:</strong> {enrollmentInfo.courseName}
                <br />
                <strong>Horaire:</strong> {enrollmentInfo.groupDay} à{" "}
                {enrollmentInfo.groupTime}
              </div>
            )}
            <p className="text-sm text-slate-600">
              Vous n'avez pas de compte?{" "}
              <a
                href="#/signup"
                onClick={(e) => handleNav(e, "#/signup")}
                className="font-medium text-pistachio-dark hover:text-pistachio-dark/90"
              >
                Créez-en un ici
              </a>
            </p>
          </div>
        )}
        <h2 className="text-3xl font-bold text-center text-slate-900">
          Se Connecter
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Mot de passe
              </label>
              {/* <button
                type="button"
                onClick={() => setIsForgotPasswordModalOpen(true)}
                className="text-sm font-medium text-pistachio-dark hover:text-blue-600"
              >
                Forgot password?
              </button> */}
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              aria-live="polite"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-pistachio-dark hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pistachio-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se Connecter"}
            </button>
            {loading && (
              <p className="text-xs text-center mt-2 text-slate-500">
                Veuillez patienter pendant que nous vérifions vos
                identifiants...
              </p>
            )}
            {isPreloading && (
              <p className="text-xs text-center mt-2 text-slate-500">
                Chargement des données en cours...
              </p>
            )}
          </div>
        </form>

        <p className="text-sm text-center text-slate-600">
          Vous n'avez pas de compte?{" "}
          <a
            href="#/signup"
            onClick={(e) => handleNav(e, "#/signup")}
            className="font-medium text-[#2790d0] hover:text-blue-600"
          >
            S'inscrire
          </a>
        </p>
      </div>

      {isForgotPasswordModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ animationDuration: "0.3s" }}
        >
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md m-4">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Réinitialiser le Mot de Passe
            </h3>
            {modalMessage ? (
              <p className="text-center text-slate-600">{modalMessage}</p>
            ) : (
              <form onSubmit={handlePasswordResetRequest}>
                <p className="text-slate-600 mb-6">
                  Saisissez votre adresse email et nous vous enverrons des
                  instructions pour réinitialiser votre mot de passe.
                </p>
                <InputField
                  id="reset-email"
                  label="Email"
                  type="email"
                  value={resetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setResetEmail(e.target.value)
                  }
                  required
                  placeholder="vous@exemple.com"
                />
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-blue-700"
                  >
                    Envoyer Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
