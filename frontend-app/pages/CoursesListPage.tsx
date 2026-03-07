import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CourseCard from "../components/CourseCard";
import { fetchAllParcours } from "../store/slices/parcoursSlice";
import { AppDispatch, RootState } from "../store";
import BackArrowIcon from "../components/icons/BackArrowIcon";

const CoursesListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    items: allParcours,
    loading: isLoading,
    error,
  } = useSelector((state: RootState) => state.parcours);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAllParcours());
  }, [dispatch]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  // Filter active parcours and by search query
  const filteredParcours = allParcours.filter((p) => {
    if (!p.is_active) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pistachio-dark"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Erreur lors du chargement des modules: {error}
            </p>
            <p className="text-slate-600">Veuillez actualiser la page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pt-32 pb-12">
      <div className="relative mb-8 flex justify-center items-center">
        <a
          href="#/"
          onClick={(e) => handleNav(e, "#/")}
          className="absolute left-0 text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100"
          aria-label="Back to home"
        >
          <BackArrowIcon className="w-6 h-6" />
        </a>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 text-center">
          Nos Modules
        </h1>
      </div>

      <div className="mb-10 max-w-lg mx-auto">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="w-5 h-5 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Rechercher un module..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent transition-shadow"
            aria-label="Rechercher des modules"
          />
        </div>
      </div>

      {filteredParcours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredParcours.map((parcours) => (
            <CourseCard key={parcours.id} course={parcours} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-600">
          {searchQuery
            ? `Aucun module trouvé pour "${searchQuery}".`
            : "Aucun module disponible pour le moment."}
        </p>
      )}
    </div>
  );
};

export default CoursesListPage;
