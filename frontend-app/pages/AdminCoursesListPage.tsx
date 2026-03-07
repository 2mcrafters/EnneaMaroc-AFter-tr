import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchAllParcours } from "../store/slices/parcoursSlice";
import { FaEdit } from "react-icons/fa";

const AdminCoursesListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: courses,
    loading: isLoading,
    error,
  } = useAppSelector((state) => state.parcours);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch initial courses
  useEffect(() => {
    dispatch(fetchAllParcours());
  }, [dispatch]);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  return (
    <AdminLayout>
      <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Modules</h2>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Filters removed as they are not implemented in parcoursSlice yet */}
          </div>
        </div>

        <div className="mb-6">
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
              placeholder="Rechercher des modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent transition-shadow"
              aria-label="Search courses"
            />
          </div>
        </div>

        {isLoading && (
          <div className="py-12 text-center text-slate-500">
            Chargement des modules...
          </div>
        )}

        {error && !isLoading && (
          <div className="py-4 mb-4 text-center text-red-600 text-sm">
            Échec du chargement des modules: {error}
          </div>
        )}

        {!isLoading && !error && filteredCourses.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            Aucun module trouvé.
          </div>
        )}

        {!isLoading && !error && filteredCourses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Titre
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="bg-white border-b hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {course.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="line-clamp-2">{course.description}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            (window.location.hash = `#/admin/parcours/${course.slug}`)
                          }
                          className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FaEdit /> Modifier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoursesListPage;
