import React from 'react';
import { Parcours } from "../services/parcoursService";
import { getCourseImageUrl } from "../services/baseApi";

interface CourseCardProps {
  course: Parcours;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  // Special mapping for vitrine pages
  const getLink = () => {
    const slug = (course.slug || '').toLowerCase();
    if (slug.includes('decouvrir')) return '/découvrir';
    if (slug.includes('approfondir')) return '/approfondir';
    if (slug.includes('transmettre')) return '/transmettre';
    return `#/course/${course.slug || course.id}`;
  };

  const link = getLink();
  const isExternal = link.startsWith('/');

  return (
    <a
      href={link}
      onClick={(e) => {
        if (isExternal) {
            // Force full page reload for external links to ensure we switch from App to Vitrine
            e.preventDefault();
            window.location.href = link;
        } else {
            handleNav(e, link);
        }
      }}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-xl border border-transparent hover:border-[#e13734]/50 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
    >
      <div className="aspect-video overflow-hidden bg-slate-200 flex items-center justify-center">
        {course.photo ? (
          <img
            src={getCourseImageUrl(course.photo, course.slug)}
            alt={course.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getCourseImageUrl(
                null,
                course.slug
              );
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-slate-400 text-center">
            <svg
              className="w-20 h-20 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium">Aucune image disponible</p>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">
          {course.title}
        </h3>
        <p className="text-slate-600 leading-relaxed mb-4 text-sm h-20 overflow-hidden line-clamp-3">
          {course.description || "Aucune description disponible."}
        </p>
        <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
          <div className="flex items-center">
            <span className="font-medium text-slate-700">
              {course.modules?.length || 0} Modules
            </span>
          </div>
          <div className="text-[#e13734] font-semibold">En savoir plus →</div>
        </div>
      </div>
    </a>
  );
};

export default CourseCard;