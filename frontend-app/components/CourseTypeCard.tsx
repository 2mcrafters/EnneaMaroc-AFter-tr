
import React from 'react';

interface CourseTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  courseLinks?: { label: string; path: string }[];
}

const CourseTypeCard: React.FC<CourseTypeCardProps> = ({
  icon,
  title,
  description,
  courseLinks,
}) => {
  return (
    <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl border border-transparent hover:border-pistachio-DEFAULT transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center h-full">
      {icon}
      <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed flex-grow">{description}</p>
      {courseLinks && courseLinks.length > 0 && (
        <ul className="mt-4 text-left space-y-2 w-full">
          {courseLinks.map((link) => (
            <li key={link.path}>
              <a
                href={link.path}
                className="text-[#2790d0] underline hover:text-[#2790d0]/80 text-sm"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 text-sm font-semibold text-[#2790d0] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Explorer les Parcours &rarr;
      </div>
    </div>
  );
};

export default CourseTypeCard;
