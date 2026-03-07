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

const AdminProfFormPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.user);

  const [prof, setProf] = useState<Partial<CreateUserData>>({
    role: "prof",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfId, setEditingProfId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (
    name: string,
    value: string,
    ctx: Partial<CreateUserData>
  ): string => {
    if (name === "firstName") {
      if (!value || value.trim().length < 2) return "First name min 2 chars";
      if (/\d/.test(value)) return "No numbers allowed";
    }
    if (name === "lastName") {
      if (!value || value.trim().length < 2) return "Last name min 2 chars";
      if (/\d/.test(value)) return "No numbers allowed";
    }
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value || !emailRegex.test(value)) return "Invalid email";
    }
    if (name === "password") {
      if (!isEditing && !value) return "Password required";
      if (value) {
        if (value.length < 8) return "Min 8 chars";
        if (!/[A-Z]/.test(value)) return "Need uppercase";
        if (!/[a-z]/.test(value)) return "Need lowercase";
        if (!/\d/.test(value)) return "Need number";
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
        return "Invalid phone";
      }
    }
    return "";
  };

  const validateAll = (data: Partial<CreateUserData>) => {
    const fields = ["firstName", "lastName", "email", "password", "phone"];
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      const err = validateField(f, (data as any)[f] || "", data);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("/edit/")) {
      const id = hash.split("/edit/").pop();
      if (id) {
        // Try to get prof data from sessionStorage first (avoid refetch)
        const storedProf = sessionStorage.getItem("editingProf");
        if (storedProf) {
          try {
            const profData = JSON.parse(storedProf);
            if (profData.id === parseInt(id) && profData.role === "prof") {
              setProf({
                firstName: profData.firstName || "",
                lastName: profData.lastName || "",
                email: profData.email,
                phone: profData.phone || "",
                role: "prof",
              });
              setIsEditing(true);
              setEditingProfId(profData.id);
              // Clear stored data after use
              sessionStorage.removeItem("editingProf");
              return;
            }
          } catch {}
        }

        // Fallback: search in Redux if no stored data
        const foundProf = users.find(
          (u) => u.id === parseInt(id) && u.role === "prof"
        );
        if (foundProf) {
          setProf({
            firstName: foundProf.firstName || "",
            lastName: foundProf.lastName || "",
            email: foundProf.email,
            phone: foundProf.phone || "",
            role: "prof",
          });
          setIsEditing(true);
          setEditingProfId(foundProf.id);
        } else if (users.length === 0) {
          // Only fetch if Redux store is empty
          dispatch(fetchUsersAsync());
        }
      }
    }
  }, [dispatch, users]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProf((prev) => ({ ...prev, [name]: value }));
    const err = validateField(name, value, { ...prof, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const err = validateField(name, value, prof);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ok = validateAll(prof);
    if (!ok) return;

    // Sanitiser les données
    const sanitizedData = SecurityUtils.sanitizeUserData(prof);

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
      if (isEditing && editingProfId) {
        // Mise à jour professeur existant
        const { profilePicture, ...updateData } = sanitizedData;

        // Si le mot de passe est vide, ne pas l'inclure dans la mise à jour
        if (!updateData.password || updateData.password.trim() === "") {
          delete updateData.password;
        }

        // Mettre à jour les données (y compris email et mot de passe si fourni)
        await dispatch(
          updateUserAsync({
            id: editingProfId,
            userData: updateData,
          })
        ).unwrap();

        dispatch(
          showSuccess({
            title: "Instructor Updated",
            message: "Instructor information has been successfully updated.",
          })
        );
      } else {
        // Création nouveau professeur
        if (!sanitizedData.password) {
          dispatch(
            showError({
              title: "Password Required",
              message: "Password is required for new instructors.",
            })
          );
          return;
        }

        await dispatch(
          createUserAsync(sanitizedData as CreateUserData)
        ).unwrap();

        dispatch(
          showSuccess({
            title: "Instructor Created",
            message: "New instructor has been successfully created.",
          })
        );
      }

      // Redirection vers la liste des professeurs
      window.history.back();
    } catch (error: any) {
      dispatch(
        showError({
          title: "Error",
          message: error || "An error occurred while saving the instructor.",
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
        href="#/admin/profs"
        onClick={(e) => handleNav(e, "#/admin/profs")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
      >
        <BackArrowIcon className="w-5 h-5" />
        Back to All Instructors
      </a>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {isEditing ? "Edit Instructor" : "Add New Instructor"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <InputField
              id="firstName"
              label="First Name"
              type="text"
              value={prof.firstName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.firstName}
            />
            <InputField
              id="lastName"
              label="Last Name"
              type="text"
              value={prof.lastName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.lastName}
            />
          </div>
          <InputField
            id="phone"
            label="Phone Number"
            type="tel"
            value={prof.phone || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            pattern="[+]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{2,4}[-\s.]?[0-9]{2,6}"
            title="Format: +33123456789 ou 0123456789 ou +33 1 23 45 67 89"
            placeholder="Ex: +33123456789 ou 0123456789"
            error={errors.phone}
          />
          <InputField
            id="email"
            label="Email"
            type="email"
            value={prof.email || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={errors.email}
          />
          <InputField
            id="password"
            label={
              isEditing
                ? "New Password (leave empty to keep current)"
                : "Password"
            }
            type="password"
            value={prof.password || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            required={!isEditing}
            error={errors.password}
          />

          <div className="flex justify-end gap-2 pt-4 w-full">
            <a
              href="#/admin/profs"
              onClick={(e) => handleNav(e, "#/admin/profs")}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={Object.values(errors).some((e) => e)}
              className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? "Save Changes" : "Create Instructor"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProfFormPage;