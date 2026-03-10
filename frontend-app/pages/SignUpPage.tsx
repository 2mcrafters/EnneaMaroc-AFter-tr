import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "../store/index";
import { signupAsync, clearError } from "../store/slices/simpleAuthSlice";
import InputField from "../components/InputField";
import { userService, fileService } from "../services";

interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  city: string;
  email: string;
  phone: string;
  password: string;
}

const SignUpPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dob: "",
    city: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isEnrollmentFlow, setIsEnrollmentFlow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enrollmentInfo, setEnrollmentInfo] = useState<{
    courseName: string;
    groupDay: string;
    groupTime: string;
  } | null>(null);

  const validateField = (
    name: string,
    value: string,
    ctx: FormData
  ): string => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value || value.trim().length < 2) return "Minimum 2 caractères";
        if (/\d/.test(value)) return "Aucun chiffre autorisé";
        return "";
      case "dob":
        if (!value) return "Requis";
        const d = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - d.getFullYear();
        if (age < 13 || age > 120) return "Âge doit être 13–120";
        return "";
      case "city":
        if (!value || value.trim().length < 2) return "Ville trop courte";
        return "";
      case "email":
        if (!value) return "Requis";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email invalide";
        return "";
      case "phone":
        if (!value) return "Required";
        const clean = value.replace(/[\s\-().]/g, "");
        if (
          !(
            /^\+[1-9]\d{7,14}$/.test(clean) ||
            /^0[1-9]\d{7,11}$/.test(clean) ||
            /^[1-9]\d{7,14}$/.test(clean)
          )
        )
          return "Téléphone invalide";
        return "";
      case "password":
        if (!value) return "Requis";
        if (value.length < 8) return "Min 8 caractères";
        if (!/[A-Z]/.test(value)) return "Majuscule requise";
        if (!/[a-z]/.test(value)) return "Minuscule requise";
        if (!/\d/.test(value)) return "Chiffre requis";
        return "";
      default:
        return "";
    }
  };

  const validateAll = (data: FormData) => {
    const newErrors: Record<string, string> = {};
    (Object.keys(data) as (keyof FormData)[]).forEach((k) => {
      const err = validateField(k, data[k], data);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // Check for legacy enrollment flow OR new vitrine registration flow
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
              courseName: courseName || "Cours Sélectionné",
              groupDay: group.day || "Non spécifié",
              groupTime: group.time || "Non spécifié",
            });
          }
        }
      } catch (error) {
        console.log("Could not parse enrollment info:", error);
      }
    }
    // Clear error when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const err = validateField(name as keyof FormData, value, {
      ...formData,
      [name]: value,
    });
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const err = validateField(name as keyof FormData, value, formData);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      // Full validation before submit
      if (!validateAll(formData)) return;

      // Générer un avatar par défaut
      const profilePictureUrl = userService.generateDefaultAvatar(
        formData.firstName,
        formData.lastName
      );

      // Utiliser Redux pour l'inscription
      const result = await dispatch(
        signupAsync({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          dob: formData.dob,
          city: formData.city,
          phone: formData.phone,
          profilePicture: profilePictureUrl,
        })
      );

      if (signupAsync.fulfilled.match(result)) {
        // Inscription réussie - redirect directly to dashboard/profile
        if (isEnrollmentFlow) {
          // Redirect to enrollment confirmation page instead of cleaning up data
          window.location.hash = "#/confirmation";
        } else {
          // Normal signup - redirect to dashboard
          window.location.hash = "#/dashboard";
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);
    }
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 bg-white rounded-2xl shadow-xl border border-slate-100">
        {isEnrollmentFlow && (
          <div className="text-center p-4 bg-pistachio-light rounded-lg border border-pistachio-dark/20">
            <h3 className="font-semibold text-slate-800 mb-2">
              Créez votre compte pour commencer
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
              Vous avez déjà un compte?{" "}
              <a
                href="#/login"
                onClick={(e) => handleNav(e, "#/login")}
                className="font-medium text-[#2790d0] hover:text-[#ff7d2d]"
              >
                Connectez-vous ici
              </a>
            </p>
          </div>
        )}
        <h2 className="text-3xl font-bold text-center text-slate-900">
          Créez Votre Compte
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="firstName"
              label="Prénom"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.firstName}
            />
            <InputField
              id="lastName"
              label="Nom de Famille"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.lastName}
            />
            <InputField
              id="dob"
              label="Date de Naissance"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.dob}
            />
            <InputField
              id="city"
              label="Ville"
              type="text"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.city}
            />
          </div>
          <div className="w-full">
            <InputField
              id="phone"
              label="Numéro de Téléphone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.phone}
            />
          </div>
          <div className="space-y-6">
            <InputField
              id="email"
              label="Adresse E-mail"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.email}
            />
            <InputField
              id="password"
              label="Mot de Passe"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.password}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading || Object.values(errors).some((e) => e)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-brand-dark hover:bg-[#ff7d2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Création du compte..." : "Créer un Compte"}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-slate-600">
          Vous avez déjà un compte?{" "}
          <a
            href="#/login"
            onClick={(e) => handleNav(e, "#/login")}
            className="font-medium text-[#2790d0] hover:text-[#ff7d2d]"
          >
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;