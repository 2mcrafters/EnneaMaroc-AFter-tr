import React, { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { selectAllEnrollments } from "../store/enrollmentsSlice";
import { deleteUserAsync } from "../store/slices/userSlice";
import { showSuccess, showError } from "../store/slices/uiSlice";
import { getProfileImageUrl } from "../services/baseApi";
import AdminLayout from "../components/admin/AdminLayout";
import StudentDetailModal from "../components/admin/StudentDetailModal";
import { useReduxDataReadOnly } from "../hooks/useReduxData";
import ConfirmationModal from "../components/ConfirmationModal";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";

const AdminEmployeesListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const enrollments = useAppSelector(selectAllEnrollments);
  // Utiliser le hook Redux read-only (pas de fetch automatique)
  const { usersState, isDataAvailable } = useReduxDataReadOnly();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterParcours, setFilterParcours] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Filtrer seulement les employés
  const employees = usersState.filter((user) => user.role === "employee");

  const uniqueParcours = useMemo(() => {
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
    employeeData?: any
  ) => {
    e.preventDefault();
    if (employeeData) {
      // Store employee data for edit form to avoid refetch
      sessionStorage.setItem("editingEmployee", JSON.stringify(employeeData));
    }
    window.location.hash = path;
  };

  const handleDeleteClick = (employeeId: number, employeeName: string) => {
    setEmployeeToDelete({ id: employeeId, name: employeeName });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await dispatch(deleteUserAsync(employeeToDelete.id)).unwrap();
      dispatch(
        showSuccess({
          title: "Employee Deleted",
          message: `${employeeToDelete.name} has been successfully deleted.`,
        })
      );
    } catch (error: any) {
      dispatch(
        showError({
          title: "Delete Failed",
          message: error || "Failed to delete employee. Please try again.",
        })
      );
    }
    setDeleteConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Search
      const matchesSearch =
        `${emp.firstName} ${emp.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Parcours
      let matchesParcours = true;
      if (filterParcours) {
        const userEnrollments = enrollments.filter(
          (en) => en.user_id === emp.id
        );
        matchesParcours = userEnrollments.some((en) => {
          const title =
            en.session?.module?.title ||
            en.course?.title ||
            (en as any).course_title;
          return title === filterParcours;
        });
      }

      // 3. Date
      let matchesDate = true;
      if (filterDate) {
        const empDate = new Date(emp.created_at).toISOString().split("T")[0];
        matchesDate = empDate === filterDate;
      }

      return matchesSearch && matchesParcours && matchesDate;
    });
  }, [employees, searchQuery, filterParcours, filterDate, enrollments]);

  const handleExportExcel = () => {
    const dataToExport = filteredEmployees.map((emp) => ({
      ID: emp.id,
      Prénom: emp.firstName,
      Nom: emp.lastName,
      Email: emp.email,
      Téléphone: emp.phone || "",
      Ville: emp.city || "",
      "Date Inscription": new Date(emp.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employés");
    XLSX.writeFile(wb, "employes_export.xlsx");
  };

  return (
    <AdminLayout>
      <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
            >
              <FaFileExcel /> Export Excel
            </button>
            <a
              href="#/admin/employees/new"
              onClick={(e) => handleNav(e, "#/admin/employees/new")}
              className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
            >
              + Add Employee
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
              placeholder="Rechercher des employés par nom ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent transition-shadow"
              aria-label="Search employees"
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

        {filteredEmployees.length > 0 ? (
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
                      Modules
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="bg-white border-b hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProfileImageUrl(emp.profilePicture)}
                            alt={`${emp.firstName} ${emp.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span>
                            {emp.firstName} {emp.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{emp.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {enrollments
                            .filter((e) => e.user_id === emp.id)
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
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-4 justify-end">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setIsModalOpen(true);
                            }}
                            className="font-medium text-pistachio-dark hover:underline"
                          >
                            Voir
                          </button>
                          <a
                            href={`#/admin/employees/edit/${emp.id}`}
                            onClick={(e) =>
                              handleNav(
                                e,
                                `#/admin/employees/edit/${emp.id}`,
                                emp
                              )
                            }
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Modifier
                          </a>
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                emp.id,
                                `${emp.firstName} ${emp.lastName}`
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
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={getProfileImageUrl(emp.profilePicture)}
                      alt={`${emp.firstName} ${emp.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p className="text-sm text-slate-500">{emp.email}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <strong className="text-xs text-slate-500 uppercase">
                      Modules:
                    </strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {enrollments
                        .filter((e) => e.user_id === emp.id)
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

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 text-xs font-semibold text-pistachio-dark bg-pistachio-light rounded-full"
                    >
                      Voir
                    </button>
                    <a
                      href={`#/admin/employees/edit/${emp.id}`}
                      onClick={(e) =>
                        handleNav(e, `#/admin/employees/edit/${emp.id}`, emp)
                      }
                      className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full"
                    >
                      Modifier
                    </a>
                    <button
                      onClick={() =>
                        handleDeleteClick(
                          emp.id,
                          `${emp.firstName} ${emp.lastName}`
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
                ? `Aucun employé trouvé pour "${searchQuery}".`
                : "Aucun employé trouvé."}
            </p>
            {!searchQuery && (
              <a
                href="#/admin/employees/new"
                onClick={(e) => handleNav(e, "#/admin/employees/new")}
                className="mt-4 inline-block px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900"
              >
                Add Your First Employee
              </a>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {selectedEmployee && (
        <StudentDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEmployee(null);
          }}
          student={selectedEmployee}
        />
      )}
    </AdminLayout>
  );
};

export default AdminEmployeesListPage;
