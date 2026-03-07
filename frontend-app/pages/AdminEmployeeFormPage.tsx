import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "../store";
import {
  createUserAsync,
  updateUserAsync,
  fetchUsersAsync,
  CreateUserData,
} from "../store/slices/userSlice";
import { showSuccess, showError } from "../store/slices/uiSlice";
import AdminLayout from "../components/admin/AdminLayout";
import InputField from "../components/InputField";
import BackArrowIcon from "../components/icons/BackArrowIcon";
import { SecurityUtils } from "../utils/SecurityUtils";

const AdminEmployeeFormPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.user);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [employee, setEmployee] = useState<Partial<CreateUserData>>({
    role: "employee",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null
  );
  const [canEdit, setCanEdit] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (
    name: string,
    value: string,
    context: Partial<CreateUserData>
  ): string => {
    if (name === "firstName") {
      if (!value || value.trim().length < 2)
        return "First name must be at least 2 characters";
      if (/\d/.test(value)) return "First name must not contain numbers";
    }
    if (name === "lastName") {
      if (!value || value.trim().length < 2)
        return "Last name must be at least 2 characters";
      if (/\d/.test(value)) return "Last name must not contain numbers";
    }
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value || !emailRegex.test(value)) return "Invalid email address";
    }
    if (name === "password") {
      if (!isEditing && !value) return "Password required";
      if (value) {
        if (value.length < 8) return "Min 8 characters";
        if (!/[A-Z]/.test(value)) return "Need uppercase letter";
        if (!/[a-z]/.test(value)) return "Need lowercase letter";
        if (!/\d/.test(value)) return "Need a number";
      }
    }
    if (name === "phone" && value) {
      const clean = value.replace(/[\s\-().]/g, "");
      if (
        !(
          /^\+[1-9]\d{7,14}$/.test(clean) ||
          /^0[1-9]\d{7,11}$/.test(clean) ||
          /^[1-9]\d{7,14}$/.test(clean)
        )
      ) {
        return "Invalid phone format";
      }
    }
    return "";
  };

  const validateAll = (data: Partial<CreateUserData>) => {
    const newErrors: Record<string, string> = {};
    ["firstName", "lastName", "email", "password", "phone"].forEach((field) => {
      const val = (data as any)[field] || "";
      const err = validateField(field, val, data);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("/edit/")) {
      const id = hash.split("/edit/").pop();
      if (id) {
        // Try to get employee data from sessionStorage first (avoid refetch)
        const storedEmployee = sessionStorage.getItem("editingEmployee");
        if (storedEmployee) {
          try {
            const employeeData = JSON.parse(storedEmployee);
            if (
              employeeData.id === parseInt(id) &&
              employeeData.role === "employee"
            ) {
              // Vérifier si un employé essaie de modifier un autre employé
              if (
                currentUser?.role === "employee" &&
                employeeData.id !== currentUser.id
              ) {
                setCanEdit(false);
                dispatch(
                  showError({
                    title: "Access Denied",
                    message: "Employees cannot modify other employees.",
                  })
                );
                return;
              }

              setEmployee({
                firstName: employeeData.firstName || "",
                lastName: employeeData.lastName || "",
                email: employeeData.email,
                phone: employeeData.phone || "",
                role: "employee",
              });
              setIsEditing(true);
              setEditingEmployeeId(employeeData.id);
              // Clear stored data after use
              sessionStorage.removeItem("editingEmployee");
              return;
            }
          } catch {}
        }

        // Fallback: search in Redux if no stored data
        const foundEmployee = users.find(
          (u) => u.id === parseInt(id) && u.role === "employee"
        );
        if (foundEmployee) {
          // Vérifier si un employé essaie de modifier un autre employé
          if (
            currentUser?.role === "employee" &&
            foundEmployee.id !== currentUser.id
          ) {
            setCanEdit(false);
            dispatch(
              showError({
                title: "Access Denied",
                message: "Employees cannot modify other employees.",
              })
            );
            return;
          }

          setEmployee({
            firstName: foundEmployee.firstName || "",
            lastName: foundEmployee.lastName || "",
            email: foundEmployee.email,
            phone: foundEmployee.phone || "",
            role: "employee",
          });
          setIsEditing(true);
          setEditingEmployeeId(foundEmployee.id);
        } else if (users.length === 0) {
          // Only fetch if Redux store is empty
          dispatch(fetchUsersAsync());
        }
      }
    }
  }, [dispatch, users, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
    // Real-time validation
    const err = validateField(name, value, { ...employee, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const err = validateField(name, value, employee);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier les permissions
    if (!canEdit) {
      dispatch(
        showError({
          title: "Access Denied",
          message: "You do not have permission to perform this action.",
        })
      );
      return;
    }

    // Re-validation complète
    const ok = validateAll(employee);
    if (!ok) return;

    // Sanitiser les données
    const sanitizedData = SecurityUtils.sanitizeUserData(employee);

    // Valider les données
    const validation = SecurityUtils.validateUserData(sanitizedData, isEditing);
    if (!validation.valid) {
      dispatch(
        showError({
          title: "Validation Error",
          message: validation.errors.join("\n"),
        })
      );
      return;
    }

    try {
      if (isEditing && editingEmployeeId) {
        // Mise à jour employé existant
        const { profilePicture, ...updateData } = sanitizedData;

        // Si le mot de passe est vide, ne pas l'inclure dans la mise à jour
        if (!updateData.password || updateData.password.trim() === "") {
          delete updateData.password;
        }

        // Mettre à jour les données (y compris email et mot de passe si fourni)
        await dispatch(
          updateUserAsync({
            id: editingEmployeeId,
            userData: updateData,
          })
        ).unwrap();

        dispatch(
          showSuccess({
            title: "Employee Updated",
            message: "Employee information has been successfully updated.",
          })
        );
      } else {
        // Création nouvel employé
        if (!sanitizedData.password) {
          dispatch(
            showError({
              title: "Password Required",
              message: "Password is required for new employees.",
            })
          );
          return;
        }

        // Pour un nouvel utilisateur, ne pas inclure profilePicture
        const { profilePicture, ...createData } = sanitizedData;

        await dispatch(createUserAsync(createData as CreateUserData)).unwrap();

        dispatch(
          showSuccess({
            title: "Employee Created",
            message: "New employee has been successfully created.",
          })
        );
      }

      // Redirection vers la liste des employés
      window.history.back();
    } catch (error: any) {
      dispatch(
        showError({
          title: "Error",
          message: error || "An error occurred while saving the employee.",
        })
      );
    }
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  return (
    <AdminLayout>
      <a
        href="#/admin/employees"
        onClick={(e) => handleNav(e, "#/admin/employees")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
      >
        <BackArrowIcon className="w-5 h-5" />
        Back to All Employees
      </a>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {isEditing ? "Edit Employee" : "Add New Employee"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <InputField
              id="firstName"
              label="Prénom"
              type="text"
              value={employee.firstName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.firstName}
            />
            <InputField
              id="lastName"
              label="Nom de Famille"
              type="text"
              value={employee.lastName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.lastName}
            />
          </div>
          <InputField
            id="phone"
            label="Numéro de Téléphone"
            type="tel"
            value={employee.phone || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            pattern="[+]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{2,4}[-\s.]?[0-9]{2,6}"
            title="Format: +33123456789 ou 0123456789 ou +33 1 23 45 67 89"
            placeholder="Ex: +33123456789 ou 0123456789"
            error={errors.phone}
          />
          <InputField
            id="email"
            label="E-mail"
            type="email"
            value={employee.email || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={errors.email}
          />
          <InputField
            id="password"
            label={
              isEditing
                ? "Nouveau Mot de Passe (laisser vide pour conserver l'actuel)"
                : "Mot de Passe"
            }
            type="password"
            value={employee.password || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            required={!isEditing}
            error={errors.password}
          />

          <div className="flex justify-end gap-2 pt-4 w-full">
            <a
              href="#/admin/employees"
              onClick={(e) => handleNav(e, "#/admin/employees")}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={Object.values(errors).some((e) => e)}
              className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? "Save Changes" : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminEmployeeFormPage;