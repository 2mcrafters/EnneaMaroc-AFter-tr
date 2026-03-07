import React, { useState } from "react";
import { useAppDispatch } from "../store";
import { deleteUserAsync } from "../store/slices/userSlice";
import { showSuccess, showError } from "../store/slices/uiSlice";
import { getProfileImageUrl } from "../services/baseApi";
import AdminLayout from "../components/admin/AdminLayout";
import { useReduxDataReadOnly } from "../hooks/useReduxData";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";

const AdminProfsListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  // Utiliser le hook Redux read-only (pas de fetch automatique)
  const { usersState, isDataAvailable } = useReduxDataReadOnly();

  const [searchQuery, setSearchQuery] = useState("");

  // Filtrer seulement les professeurs
  const profs = usersState.filter((user) => user.role === "prof");

  const handleNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    profData?: any
  ) => {
    e.preventDefault();
    if (profData) {
      // Store prof data for edit form to avoid refetch
      sessionStorage.setItem("editingProf", JSON.stringify(profData));
    }
    window.location.hash = path;
  };

  const handleDelete = async (profId: number, profName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${profName}? This action cannot be undone.`
      )
    ) {
      try {
        await dispatch(deleteUserAsync(profId)).unwrap();
        dispatch(
          showSuccess({
            title: "Instructor Deleted",
            message: `${profName} has been successfully deleted.`,
          })
        );
      } catch (error: any) {
        dispatch(
          showError({
            title: "Delete Failed",
            message: error || "Failed to delete instructor. Please try again.",
          })
        );
      }
    }
  };

  const filteredProfs = profs.filter(
    (prof) =>
      `${prof.firstName} ${prof.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      prof.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    const dataToExport = filteredProfs.map((prof) => ({
      ID: prof.id,
      Prénom: prof.firstName,
      Nom: prof.lastName,
      Email: prof.email,
      Téléphone: prof.phone || "",
      Ville: prof.city || "",
      "Date Inscription": new Date(prof.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Instructeurs");
    XLSX.writeFile(wb, "instructeurs_export.xlsx");
  };

  return (
    <AdminLayout>
      <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Instructors</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
            >
              <FaFileExcel /> Export Excel
            </button>
            <a
              href="#/admin/profs/new"
              onClick={(e) => handleNav(e, "#/admin/profs/new")}
              className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
            >
              + Add Instructor
            </a>
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
              placeholder="Rechercher des instructeurs par nom ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent transition-shadow"
              aria-label="Search instructors"
            />
          </div>
        </div>

        {filteredProfs.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfs.map((prof) => (
                    <tr
                      key={prof.id}
                      className="bg-white border-b hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProfileImageUrl(prof.profilePicture)}
                            alt={`${prof.firstName} ${prof.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span>
                            {prof.firstName} {prof.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{prof.email}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-4 justify-end">
                          <a
                            href={`#/admin/profs/edit/${prof.id}`}
                            onClick={(e) =>
                              handleNav(
                                e,
                                `#/admin/profs/edit/${prof.id}`,
                                prof
                              )
                            }
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Modifier
                          </a>
                          <button
                            onClick={() =>
                              handleDelete(
                                prof.id,
                                `${prof.firstName} ${prof.lastName}`
                              )
                            }
                            className="font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredProfs.map((prof) => (
                <div
                  key={prof.id}
                  className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={getProfileImageUrl(prof.profilePicture)}
                      alt={`${prof.firstName} ${prof.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {prof.firstName} {prof.lastName}
                      </h3>
                      <p className="text-sm text-slate-500">{prof.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                    <a
                      href={`#/admin/profs/edit/${prof.id}`}
                      onClick={(e) =>
                        handleNav(e, `#/admin/profs/edit/${prof.id}`, prof)
                      }
                      className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full"
                    >
                      Modifier
                    </a>
                    <button
                      onClick={() =>
                        handleDelete(
                          prof.id,
                          `${prof.firstName} ${prof.lastName}`
                        )
                      }
                      className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500">
              {searchQuery
                ? `Aucun instructeur trouvé pour "${searchQuery}".`
                : "Aucun instructeur trouvé."}
            </p>
            {!searchQuery && (
              <a
                href="#/admin/profs/new"
                onClick={(e) => handleNav(e, "#/admin/profs/new")}
                className="mt-4 inline-block px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
              >
                Add Your First Instructor
              </a>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfsListPage;
