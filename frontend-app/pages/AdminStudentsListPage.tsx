import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { deleteUserAsync } from "../store/slices/userSlice";
import { selectAllEnrollments } from "../store/enrollmentsSlice";
import { showSuccess, showError } from "../store/slices/uiSlice";
import { getProfileImageUrl } from "../services/baseApi";
import AdminLayout from "../components/admin/AdminLayout";
import ProfileImage from "../components/ProfileImage";
import StudentDetailModal from "../components/admin/StudentDetailModal";
import { useReduxDataReadOnly } from "../hooks/useReduxData";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";

const AdminStudentsListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const enrollments = useAppSelector(selectAllEnrollments);
  // Utiliser le hook Redux read-only (pas de fetch automatique)
  const { usersState, isDataAvailable } = useReduxDataReadOnly();

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [filterParcours, setFilterParcours] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrer seulement les étudiants
  const students = usersState.filter((user) => user.role === "student");

  // Check for studentId in URL on mount
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("?studentId=")) {
      const id = hash.split("?studentId=")[1];
      if (id && usersState.length > 0) {
        const student = usersState.find(
          (u) => u.id === parseInt(id) || u.id.toString() === id
        );
        if (student) {
          setSelectedStudent(student);
          setIsModalOpen(true);
        }
      }
    }
  }, [usersState]);

  const uniqueParcours = React.useMemo(() => {
    const titles = new Set<string>();
    enrollments.forEach((e) => {
      const title =
        e.session?.module?.title || e.course?.title || (e as any).course_title;
      if (title) titles.add(title);
    });
    return Array.from(titles);
  }, [enrollments]);

  const handleNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    studentData?: any
  ) => {
    e.preventDefault();
    if (studentData) {
      // Store student data for edit form to avoid refetch
      sessionStorage.setItem("editingStudent", JSON.stringify(studentData));
    }
    window.location.hash = path;
  };

  const handleDelete = async (userId: number, studentName: string) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer ${studentName} ? Cela supprimera également toutes leurs inscriptions et ne peut pas être annulé.`
      )
    ) {
      try {
        await dispatch(deleteUserAsync(userId)).unwrap();
        dispatch(
          showSuccess({
            title: "Étudiant Supprimé",
            message: `${studentName} a été supprimé avec succès.`,
          })
        );
      } catch (error: any) {
        dispatch(
          showError({
            title: "Suppression Échouée",
            message:
              error ||
              "Échec de la suppression de l'étudiant. Veuillez réessayer.",
          })
        );
      }
    }
  };

  // Filtrer les étudiants en temps réel
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !localSearchQuery ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(localSearchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(localSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterParcours) {
      const hasParcours = enrollments.some((e) => {
        const title =
          e.session?.module?.title ||
          e.course?.title ||
          (e as any).course_title;
        return e.user_id === student.id && title === filterParcours;
      });
      if (!hasParcours) return false;
    }

    if (filterDate) {
      if (!student.created_at.startsWith(filterDate)) return false;
    }

    return true;
  });

  const handleExportExcel = () => {
    const dataToExport = filteredStudents.map((student) => ({
      ID: student.id,
      Prénom: student.firstName,
      Nom: student.lastName,
      Email: student.email,
      Téléphone: student.phone || "",
      Ville: student.city || "",
      "Date Inscription": new Date(student.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Etudiants");
    XLSX.writeFile(wb, "etudiants_export.xlsx");
  };

  return (
    <AdminLayout>
      <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Étudiants</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
            >
              <FaFileExcel /> Exporter Excel
            </button>
            <a
              href="#/admin/students/new"
              onClick={(e) => handleNav(e, "#/admin/students/new")}
              className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
            >
              + Ajouter Étudiant
            </a>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          {/* Search Bar */}
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
              placeholder="Rechercher des étudiants par nom ou e-mail..."
              value={localSearchQuery}
              onChange={(e) => {
                setLocalSearchQuery(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent transition-shadow"
              aria-label="Search students"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Filtrer par Module
              </label>
              <select
                value={filterParcours}
                onChange={(e) => setFilterParcours(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent"
                aria-label="Filtrer par Module"
              >
                <option value="">Tous les modules</option>
                {uniqueParcours.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date d'inscription
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent"
                aria-label="Date d'inscription"
              />
            </div>
          </div>
        </div>

        {filteredStudents.length > 0 ? (
          <div>
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
                      Ville
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Modules
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Téléphone
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.email}
                      className="bg-white border-b hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <ProfileImage
                            profilePicture={student.profilePicture}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                            fallbackName={`${student.firstName} ${student.lastName}`}
                            size={32}
                          />
                          <span>
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.email}</td>
                      <td className="px-6 py-4">{student.city}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {enrollments
                            .filter((e) => e.user_id === student.id)
                            .map((e) => {
                              const title =
                                e.session?.module?.title ||
                                e.course?.title ||
                                "Unknown";
                              return (
                                <span
                                  key={e.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {title}
                                </span>
                              );
                            })}
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-4 justify-end">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsModalOpen(true);
                            }}
                            className="font-medium text-pistachio-dark hover:underline"
                          >
                            Voir
                          </button>
                          <a
                            href={`#/admin/students/edit/${student.email}`}
                            onClick={(e) =>
                              handleNav(
                                e,
                                `#/admin/students/edit/${student.email}`,
                                student
                              )
                            }
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Modifier
                          </a>
                          <button
                            onClick={() =>
                              handleDelete(
                                student.id,
                                `${student.firstName} ${student.lastName}`
                              )
                            }
                            className="font-medium text-red-600 hover:underline"
                          >
                            Supprimer
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
              {filteredStudents.map((student) => (
                <div
                  key={student.email}
                  className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <ProfileImage
                      profilePicture={student.profilePicture}
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                      fallbackName={`${student.firstName} ${student.lastName}`}
                      size={48}
                    />
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-1 mb-4">
                    <p>
                      <strong>City:</strong> {student.city}
                    </p>
                    <p>
                      <strong>Phone:</strong> {student.phone}
                    </p>
                    <div className="mt-2">
                      <strong>Modules:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {enrollments
                          .filter((e) => e.user_id === student.id)
                          .map((e) => {
                            const title =
                              e.session?.module?.title ||
                              e.course?.title ||
                              "Unknown";
                            return (
                              <span
                                key={e.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {title}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 text-xs font-semibold text-pistachio-dark bg-pistachio-light rounded-full"
                    >
                      Voir
                    </button>
                    <a
                      href={`#/admin/students/edit/${student.email}`}
                      onClick={(e) =>
                        handleNav(
                          e,
                          `#/admin/students/edit/${student.email}`,
                          student
                        )
                      }
                      className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full"
                    >
                      Modifier
                    </a>
                    <button
                      onClick={() =>
                        handleDelete(
                          student.id,
                          `${student.firstName} ${student.lastName}`
                        )
                      }
                      className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500">
              {localSearchQuery
                ? `Aucun étudiant trouvé pour "${localSearchQuery}".`
                : "Aucun étudiant trouvé."}
            </p>
            {!localSearchQuery && (
              <a
                href="#/admin/students/new"
                onClick={(e) => handleNav(e, "#/admin/students/new")}
                className="mt-4 inline-block px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
              >
                Ajouter Votre Premier Étudiant
              </a>
            )}
          </div>
        )}
      </div>
      <StudentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
      />
    </AdminLayout>
  );
};

export default AdminStudentsListPage;
