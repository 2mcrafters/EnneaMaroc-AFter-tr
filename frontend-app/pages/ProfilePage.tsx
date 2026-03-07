import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "../store";
import {
  updateProfileAsync,
  selectCurrentUserProfile,
  selectProfileLoading,
  selectProfileError,
} from "../store/slices/userSlice";
import { logoutAsync } from "../store/slices/simpleAuthSlice";
import { getProfileImageUrl } from "../services/baseApi";
import InputField from "../components/InputField";
import { ClipboardListIcon } from "../components/icons/ClipboardListIcon";
import { CheckCircleIcon } from "../components/icons/CheckCircleIcon";
import { ClockIcon } from "../components/icons/ClockIcon";
import { CreditCardIcon } from "../components/icons/CreditCardIcon";
import { LogoutIcon } from "../components/icons/LogoutIcon";

interface UserData {
  firstName: string;
  lastName: string;
  dob: string;
  nationalId: string;
  city: string;
  email: string;
  phone: string;
  profilePicture: string;
}

interface Course {
  id: string;
  title: string;
}

interface Revision {
  id: string;
  title: string;
}

interface Payment {
  date: string;
  amount: number;
  proof: string | null;
  status: "Confirmed" | "Pending Confirmation";
  month: number;
}

interface Enrollment {
  id: string;
  itemId: string;
  itemType: "course" | "revision";
  group: { price: number };
  status: "Pending Payment" | "Pending Confirmation" | "Active" | "Cancelled";
  enrolledDate: string;
  paymentProof: string | null;
  userId: string;
  userName: string;
  payments?: Payment[];
  durationMonths: number;
}

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { isUpdatingProfile, error: userError } = useAppSelector(
    (state) => state.user
  );

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [formData, setFormData] = useState<UserData>({
    firstName: "",
    lastName: "",
    dob: "",
    nationalId: "",
    city: "",
    email: "",
    phone: "",
    profilePicture: "",
  });

  // Fonction pour formater la date de naissance (enlever l'heure)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    // Si la date contient 'T', on prend seulement la partie avant 'T'
    return dateString.split("T")[0];
  };

  useEffect(() => {
    // Rediriger si pas connecté
    if (!isAuthenticated || !user) {
      window.location.hash = "#/login";
      return;
    }

    // Initialiser les données du formulaire avec les données utilisateur
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      dob: user.dob || "",
      nationalId: user.nationalId || "",
      city: user.city || "",
      email: user.email || "",
      phone: user.phone || "",
      profilePicture: user.profilePicture || "",
    });

    const storedEnrollments = JSON.parse(
      localStorage.getItem("enrollments") || "[]"
    );
    const userEnrollments = storedEnrollments.filter(
      (e: Enrollment) => e.userId === user.email
    );
    setEnrollments(userEnrollments);

    setCourses(JSON.parse(localStorage.getItem("courses") || "[]"));
    setRevisions(JSON.parse(localStorage.getItem("revisions") || "[]"));
  }, [isAuthenticated, user, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSuccessMessage(""); // Clear previous messages
      await dispatch(updateProfileAsync(formData)).unwrap();
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      window.location.hash = "#/login";
    } catch (error) {
      // Force logout même en cas d'erreur
      window.location.hash = "#/login";
    }
  };

  const getItemDetails = (itemId: string, itemType: "course" | "revision") => {
    if (itemType === "course") {
      return courses.find((c) => c.id === itemId);
    }
    return revisions.find((r) => r.id === itemId);
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  if (!isAuthenticated || !user) {
    return <div className="text-center py-20">Loading profile...</div>;
  }

  const activeEnrollments = enrollments.filter((e) => e.status === "Active");
  const pendingEnrollments = enrollments.filter(
    (e) => e.status === "Pending Payment" || e.status === "Pending Confirmation"
  );

  const allConfirmedPayments = enrollments.flatMap(
    (e) =>
      e.payments
        ?.filter((p) => p.status === "Confirmed")
        .map((p) => ({ ...p, enrollment: e })) || []
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8 mb-12 max-w-5xl mx-auto">
        <img
          src={getProfileImageUrl(user.profilePicture)}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover mb-4 sm:mb-0 border-4 border-pistachio-light shadow-md"
        />
        <div className="text-center sm:text-left flex-grow">
          <h1 className="text-4xl font-bold text-slate-900">
            Bienvenue, {user.firstName || user.name} !
          </h1>
          <p className="text-slate-600 mt-1">
            Voici votre tableau de bord personnel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Informations Personnelles
              </h2>
              {!isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setSuccessMessage(""); // Clear success message when editing
                  }}
                  className="text-sm font-semibold text-pistachio-dark hover:text-lime-800"
                >
                  Modifier
                </button>
              )}
            </div>
            {userError && (
              <div className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded border">
                {userError}
              </div>
            )}
            {successMessage && (
              <div className="text-green-600 text-sm mt-2 bg-green-50 p-3 rounded border">
                {successMessage}
              </div>
            )}
            <div className="space-y-4 flex-grow">
              <InputField
                id="firstName"
                label="Prénom"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />
              <InputField
                id="lastName"
                label="Nom de Famille"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />
              <InputField
                id="dob"
                label="Date de Naissance"
                type="date"
                value={formatDateForInput(formData.dob)}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />
              <InputField
                id="nationalId"
                label="CIN"
                type="text"
                value={formData.nationalId}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />
              <InputField
                id="city"
                label="Ville"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />
              <InputField
                id="phone"
                label="Téléphone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />
              <InputField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isUpdatingProfile}
                    className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200">
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

        {/* Right Column: Dashboard Widgets */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enrollment Summary */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Résumé des Inscriptions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
                <ClipboardListIcon className="w-8 h-8 text-slate-500" />
                <div>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                  <p className="text-sm text-slate-600">Total</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex items-center gap-4">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {activeEnrollments.length}
                  </p>
                  <p className="text-sm text-slate-600">Actives</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-4">
                <ClockIcon className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {pendingEnrollments.length}
                  </p>
                  <p className="text-sm text-slate-600">En Attente</p>
                </div>
              </div>
            </div>
            <a
              href="#/my-courses"
              onClick={(e) => handleNav(e, "#/my-courses")}
              className="w-full block text-center px-5 py-3 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors"
            >
              Voir Toutes les Inscriptions
            </a>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCardIcon className="w-6 h-6 text-slate-500" />
              <h2 className="text-2xl font-bold text-slate-800">
                Historique des Paiements
              </h2>
            </div>
            {allConfirmedPayments.length > 0 ? (
              <div className="space-y-4">
                {allConfirmedPayments
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((payment) => {
                    const item = getItemDetails(
                      payment.enrollment.itemId,
                      payment.enrollment.itemType
                    );
                    return (
                      <div
                        key={`${payment.enrollment.id}-${payment.month}`}
                        className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {item?.title} (Mois {payment.month})
                          </p>
                          <p className="text-sm text-slate-500">
                            Payé le :{" "}
                            {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-green-600">
                          {payment.amount.toLocaleString("de-DE")} MAD
                        </p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">
                Aucun paiement complété trouvé.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;