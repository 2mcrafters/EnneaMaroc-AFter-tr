import React from "react";
import CourseTypeCard from "../components/CourseTypeCard";
import { InPersonCourseIcon } from "../components/icons/InPersonCourseIcon";

const LandingPage: React.FC = () => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  return (
    <div className="container mx-auto px-6 pt-32 pb-8">
      <div className="mt-12 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 landing-hero-title">
          Développez Vos Compétences
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-8 landing-hero-subtitle">
          Découvrez nos parcours de formation et commencez votre voyage dès
          aujourd'hui.
        </p>

        <div className="max-w-md mx-auto landing-card-grid">
          <a
            href="#/courses"
            onClick={(e) => handleNav(e, "#/courses")}
            className="block"
            title="Nos Parcours"
          >
            <CourseTypeCard
              icon={
                <InPersonCourseIcon className="h-12 w-12 mb-4 text-pistachio-dark" />
              }
              title="Nos Parcours"
              description="Explorez notre catalogue complet de formations et trouvez celle qui vous correspond."
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
