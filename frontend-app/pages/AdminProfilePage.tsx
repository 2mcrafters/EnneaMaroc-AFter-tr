import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../store";
import { logoutAsync } from "../store/slices/authSlice";
import { LogoutIcon } from "../components/icons/LogoutIcon";
import InputField from "../components/InputField";
import { userService } from "../services/userService";
import { getProfileImageUrl } from "../services/baseApi";
import PencilIcon from "../components/icons/PencilIcon";
import AdminLayout from "../components/admin/AdminLayout";

const AdminProfilePage: React.FC = () => {
  const [admin, setAdmin] = useState<any | null>(null);
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setAdmin(u);
      const f = u.firstName || (u.name ? String(u.name).split(" ")[0] : "");
      const l =
        u.lastName ||
        (u.name ? String(u.name).split(" ").slice(1).join(" ") : "");
      setFirstName(f);
      setLastName(l);
      setEmail(u.email || "");
    } else {
      window.location.hash = "#/login";
    }
  }, []);

  const updateLocalUser = (partial: any) => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const u = { ...JSON.parse(stored), ...partial };
    if (partial.firstName || partial.lastName) {
      const fn = partial.firstName ?? u.firstName ?? "";
      const ln = partial.lastName ?? u.lastName ?? "";
      u.name = `${fn} ${ln}`.trim();
    }
    localStorage.setItem("user", JSON.stringify(u));
    window.dispatchEvent(new Event("storage_change"));
    setAdmin(u);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setMessage(null);
    setUploading(true);
    try {
      const res = await userService.updateProfilePicture(file);
      updateLocalUser({ profilePicture: res.user.profilePicture });
      setMessage("Photo de profil mise à jour avec succès.");
    } catch (err: any) {
      setError(err?.message || "Échec de la mise à jour de la photo de profil");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAll = async () => {
    setError(null);
    setMessage(null);
    const hasNameChange =
      (firstName || "") !==
        (admin.firstName ||
          (admin.name ? String(admin.name).split(" ")[0] : "")) ||
      (lastName || "") !==
        (admin.lastName ||
          (admin.name ? String(admin.name).split(" ").slice(1).join(" ") : ""));
    const emailTrim = (email || "").trim();
    const hasEmailChange = emailTrim !== (admin.email || "");
    const wantsPasswordChange =
      (pwdNew || "").length > 0 || (pwdConfirm || "").length > 0;

    if (!hasNameChange && !hasEmailChange && !wantsPasswordChange) {
      setMessage("Aucun changement à enregistrer.");
      return;
    }

    if (hasEmailChange && !pwdCurrent) {
      setError("Le mot de passe actuel est requis pour changer l'email.");
      return;
    }
    if (wantsPasswordChange) {
      if (!pwdCurrent) {
        setError(
          "Le mot de passe actuel est requis pour changer le mot de passe."
        );
        return;
      }
      if (!pwdNew || !pwdConfirm) {
        setError("Veuillez saisir et confirmer le nouveau mot de passe.");
        return;
      }
      if (pwdNew !== pwdConfirm) {
        setError(
          "Le nouveau mot de passe et sa confirmation ne correspondent pas."
        );
        return;
      }
    }

    setSavingProfile(true);
    const changed: string[] = [];
    try {
      if (hasNameChange) {
        await userService.updateProfile({ firstName, lastName });
        updateLocalUser({ firstName, lastName });
        changed.push("name");
      }
      if (hasEmailChange) {
        const res = await userService.updateEmail(pwdCurrent, emailTrim);
        updateLocalUser({ email: res.user.email });
        setEmail(res.user.email);
        changed.push("email");
      }
      if (wantsPasswordChange) {
        await userService.updatePassword(pwdCurrent, pwdNew, pwdConfirm);
        setPwdNew("");
        setPwdConfirm("");
        setPwdCurrent("");
        changed.push("password");
      }
      if (changed.length > 0) setMessage(`Enregistré: ${changed.join(", ")}.`);
    } catch (err: any) {
      setError(err?.message || "Échec de l'enregistrement des modifications");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      window.location.hash = "#/login";
    } catch (error) {
      window.location.hash = "#/login";
    }
  };

  if (!admin) {
    return <div className="text-center py-20">Chargement du profil...</div>;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="w-full">
          <div className="flex flex-col items-center mb-8">
            <h1 className="mt-4 text-3xl font-bold text-slate-900 text-center">
              {admin.name}
            </h1>
          </div>

          {message && (
            <div className="mb-4 p-3 rounded bg-green-50 text-green-700 border border-green-200">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div>
              <div className="text-sm text-slate-500">Nom</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <InputField
                  id="firstName"
                  label="Prénom"
                  type="text"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName((e.target as HTMLInputElement).value)
                  }
                />
                <InputField
                  id="lastName"
                  label="Nom de Famille"
                  type="text"
                  value={lastName}
                  onChange={(e) =>
                    setLastName((e.target as HTMLInputElement).value)
                  }
                />
              </div>
            </div>
            <div className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mt-2">
                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail((e.target as HTMLInputElement).value)
                  }
                />
              </div>
            </div>
            <div className="mt-6">
              <div className="text-sm text-slate-500">Mot de Passe</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <InputField
                  id="newPassword"
                  label="Nouveau Mot de Passe (optionnel)"
                  type="password"
                  value={pwdNew}
                  onChange={(e) =>
                    setPwdNew((e.target as HTMLInputElement).value)
                  }
                />
                <InputField
                  id="confirmPassword"
                  label="Confirmer le Nouveau Mot de Passe"
                  type="password"
                  value={pwdConfirm}
                  onChange={(e) =>
                    setPwdConfirm((e.target as HTMLInputElement).value)
                  }
                />
              </div>
            </div>
            <div className="mt-6">
              <InputField
                id="currentPassword"
                label="Mot de Passe Actuel (requis pour les changements d'email/mot de passe)"
                type="password"
                value={pwdCurrent}
                onChange={(e) =>
                  setPwdCurrent((e.target as HTMLInputElement).value)
                }
              />
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const u = admin;
                  const f =
                    u.firstName || (u.name ? String(u.name).split(" ")[0] : "");
                  const l =
                    u.lastName ||
                    (u.name
                      ? String(u.name).split(" ").slice(1).join(" ")
                      : "");
                  setFirstName(f);
                  setLastName(l);
                  setEmail(admin.email || "");
                  setPwdCurrent("");
                  setPwdNew("");
                  setPwdConfirm("");
                  setMessage(null);
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleSaveAll}
                disabled={savingProfile}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#ff7d2d] rounded-full hover:bg-[#e06520] disabled:opacity-60"
              >
                {savingProfile
                  ? "Enregistrement…"
                  : "Enregistrer les Modifications"}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Se Déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;
