import React, { useEffect } from "react";
import { CheckCircleIcon } from "../components/icons/CheckCircleIcon";
// Remove static data usage; leverage Redux slice
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchParcoursBySlug } from "../store/slices/parcoursSlice";
import BackArrowIcon from "../components/icons/BackArrowIcon";
import { getCourseImageUrl } from "../services/baseApi";
import { formatPrice } from "../utils/formatPrice";
// Placeholder instructor mapping (replace with real API join later)
interface SimpleInstructor {
  id: number;
  name: string;
  imageUrl?: string | null;
}

const normalizeSlug = (value: string) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

// Enrollment/payment interfaces removed pending future API integration.

const CourseDetailPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentItem: courseData,
    loading: isLoading,
    error: loadError,
  } = useSelector((state: RootState) => state.parcours);

  useEffect(() => {
    const courseIdRaw = window.location.hash.split("/").pop();
    if (!courseIdRaw) return;
    dispatch(fetchParcoursBySlug(courseIdRaw));
  }, [dispatch, window.location.hash]);

  const courseSlugFromHash = React.useMemo(() => {
    const raw = window.location.hash.split("/").pop() || "";
    return normalizeSlug(decodeURIComponent(raw));
  }, [window.location.hash]);

  // On these 3 course pages, module cards should be minimal (no extra details/descriptions)
  const hideModuleCardDetails =
    courseSlugFromHash === "approfondir" ||
    courseSlugFromHash === "decouvrir" ||
    courseSlugFromHash === "transmettre";

  // NOTE: Instructor aggregation removed; will reintroduce once backend provides dedicated instructors endpoint.

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  const handleEnroll = async (module: any) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (isAuthenticated) {
      // Store enrollment info and redirect to confirmation page
      sessionStorage.setItem("enrollmentType", "course");
      if (courseData) {
        sessionStorage.setItem("enrollmentItemId", String(courseData.id));
        sessionStorage.setItem("enrollmentCourseName", courseData.title);
      }
      sessionStorage.setItem("enrollmentGroup", JSON.stringify(module));
      sessionStorage.setItem("enrollmentFlow", "true");
      window.location.hash = "#/confirmation";
    } else {
      // Store enrollment info for after signup/login
      sessionStorage.setItem("enrollmentType", "course");
      if (courseData) {
        sessionStorage.setItem("enrollmentItemId", String(courseData.id));
        // Store course name for better UX during signup
        sessionStorage.setItem("enrollmentCourseName", courseData.title);
      }
      sessionStorage.setItem("enrollmentGroup", JSON.stringify(module));
      sessionStorage.setItem("enrollmentFlow", "true");
      window.location.hash = "#/signup";
    }
  };

  const formatPriceOrQuote = (price: string | undefined) =>
    formatPrice(price, "Sur devis");

  // Payment status UI removed until enrollment is migrated to API.

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Chargement du module...
        </h1>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Erreur</h1>
        <p className="text-slate-600 mt-4">{loadError}</p>
        <a
          href="#/courses"
          onClick={(e) => handleNav(e, "#/courses")}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
        >
          <BackArrowIcon className="w-5 h-5" />
          <span>Retour aux Modules</span>
        </a>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Module Introuvable
        </h1>
        <p className="text-slate-600 mt-4">
          Désolé, nous n'avons pas pu trouver le module que vous recherchez.
        </p>
        <a
          href="#/courses"
          onClick={(e) => handleNav(e, "#/courses")}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
        >
          <BackArrowIcon className="w-5 h-5" />
          <span>Retour aux Modules</span>
        </a>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <a
            href={`#/courses`}
            onClick={(e) => handleNav(e, `#/courses`)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2790d0] hover:text-[#2790d0]/80 mb-8 transition-colors"
          >
            <BackArrowIcon className="w-5 h-5" />
            Retour à Tous les Modules
          </a>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {courseData.title}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            {courseData.description}
          </p>

          <div className="flex flex-wrap gap-4 text-center my-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-1 min-w-[120px]">
              <p className="text-xl font-bold text-pistachio-dark">
                {courseData.lieu || "En ligne"}
              </p>
              <p className="text-sm text-slate-600">Lieu</p>
            </div>
            <div className="flex-1 min-w-[120px]">
              <p className="text-xl font-bold text-pistachio-dark">
                {courseData.horaires || "À définir"}
              </p>
              <p className="text-sm text-slate-600">Horaires</p>
            </div>
            <div className="flex-[1.5] min-w-[180px]">
              <p className="text-xl font-bold text-pistachio-dark">
                {formatPriceOrQuote(courseData.price)}
              </p>
              <p className="text-sm text-slate-600">Tarif</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Sessions du Module
            </h2>
            <div className="space-y-4">
              {courseData.modules?.map((module: any, index: number) => {
                return (
                  <div
                    key={module.id}
                    className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-slate-200 gap-4"
                  >
                    <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
                      <CheckCircleIcon className="w-8 h-8 text-pistachio-dark mr-4" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {`Module ${index + 1}: ${module.title}`}
                        </p>
                        {!hideModuleCardDetails && module.subtitle && (
                          <p className="text-sm text-slate-600">
                            {module.subtitle}
                          </p>
                        )}
                        {!hideModuleCardDetails && module.prerequis && (
                          <p className="text-sm text-slate-500 mt-1">
                            <span className="font-bold text-slate-700">
                              PRÉREQUIS:
                            </span>{" "}
                            {module.prerequis}
                          </p>
                        )}
                        {!hideModuleCardDetails && module.details && (
                          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4 text-pistachio-dark" />
                            <span className="font-bold text-slate-700">
                              DATE:
                            </span>{" "}
                            {module.details}
                          </p>
                        )}
                        <p className="font-semibold text-slate-800 mt-1">
                          {module.duration}
                        </p>
                        {!hideModuleCardDetails && (
                          <p className="text-sm text-slate-600">
                            {module.horaires}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-xl font-bold text-slate-800">
                        {formatPrice(module.price) || "Inclus"}
                      </div>
                      <button
                        onClick={() => handleEnroll(module)}
                        className="px-6 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        S'inscrire
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
