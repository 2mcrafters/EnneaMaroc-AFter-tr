
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchAllParcours } from "../store/slices/parcoursSlice";
import { fetchUsersAsync, selectUserLoading } from "../store/slices/userSlice";
import {
  selectEnrollmentsLoading,
  fetchUserEnrollments,
  selectUserEnrollments,
  updateEnrollment,
} from "../store/enrollmentsSlice";
import { Enrollment } from "../services/enrollmentService";
import {
  fetchUserPayments,
  selectUserPayments,
  updatePayment,
} from "../store/slices/paymentsSlice";
import paymentService from "../services/paymentService";
import { refreshUserData } from "../utils/dataPreloader";

import { PaperclipIcon } from "../components/icons/PaperclipIcon";
import RefreshButton from "../components/RefreshButton";
import { getCourseImageUrl } from "../services/baseApi";

interface Payment {
  date: string;
  amount: number;
  proof: string | null;
  status: "Confirmed" | "Pending Confirmation";
  month: number;
}

type BackendEnrollment = Enrollment & { group_data?: any };

interface User {
  email: string;
  hasPaidRegistrationFee?: boolean;
}

type ActiveTab = "in-person" | "online";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const baseClasses =
    "px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0";
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const displayStatus = {
    pending: "En Attente",
    active: "Actif",
    cancelled: "Annulé",
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>
      {displayStatus[status]}
    </span>
  );
};

const MyCoursesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<ActiveTab>("in-person");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<
    string | null
  >(null);

  // État pour le popup de notification
  const [popup, setPopup] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Redux selectors
  const courses = useAppSelector((state) => state.parcours.items);
  const coursesLoading = useAppSelector((state) => state.parcours.loading);
  const enrollmentsLoading = useAppSelector(selectEnrollmentsLoading);
  const userEnrollments = useAppSelector((state) =>
    authUser ? selectUserEnrollments(state as any, authUser.id) : []
  );
  const userPayments = useAppSelector((state) =>
    authUser ? selectUserPayments(state as any, authUser.id) : []
  );

  // Toutes les données (courses, enrollments, payments) sont
  // déjà préchargées lors du login - pas besoin de fetch supplémentaires
  console.log("📚 MyCoursesPage: Using preloaded data from login");

  const getItemDetails = (itemId: number) => {
    return courses.find((c) => c.id === itemId);
  };

  // Helper function to determine item info from enrollment
  const getEnrollmentItemInfo = (enrollment: BackendEnrollment) => {
    if (enrollment.course_id) {
      return {
        itemId: enrollment.course_id,
        itemType: "course" as const,
        item: courses.find((c) => c.id === enrollment.course_id),
      };
    }
    return null;
  };

  // Fonction pour afficher un popup de notification
  const showPopup = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setPopup({
      show: true,
      type,
      title,
      message,
    });

    // Auto-close après 4 secondes
    setTimeout(() => {
      setPopup((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleCancelEnrollment = (enrollmentId: number) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this enrollment? This action cannot be undone."
      )
    ) {
      dispatch(
        updateEnrollment({ id: enrollmentId, data: { status: "cancelled" } })
      );
    }
  };

  const handleUploadClick = (enrollmentId: number) => {
    setSelectedEnrollmentId(enrollmentId.toString());
    fileInputRef.current?.click();
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files &&
      e.target.files[0] &&
      selectedEnrollmentId &&
      authUser
    ) {
      const file = e.target.files[0];
      const enrollmentId = Number(selectedEnrollmentId);

      try {
        // Find the pending payment for this enrollment (month 1)
        const pendingPayment = userPayments.find(
          (p) =>
            p.enrollment_id === enrollmentId &&
            p.month === 1 &&
            p.status === "pending"
        );

        if (!pendingPayment) {
          showPopup(
            "error",
            "Échec du Téléchargement",
            "No pending payment found for this enrollment."
          );
          setSelectedEnrollmentId(null);
          return;
        }

        // Upload proof using the payment service
        const updatedPayment = await paymentService.uploadPaymentProof(
          pendingPayment.id,
          file
        );

        // Update the payment in Redux store
        dispatch(
          updatePayment({
            id: pendingPayment.id,
            data: { payment_proof: updatedPayment.payment_proof },
          })
        );

        // Refresh user data to get latest payments/enrollments
        await refreshUserData(dispatch, authUser.id);

        showPopup(
          "success",
          "Téléchargement Réussi",
          `Payment proof "${file.name}" uploaded successfully! Your payment is now pending confirmation.`
        );
      } catch (error) {
        console.error("Error uploading payment proof:", error);
        showPopup(
          "error",
          "Upload Failed",
          "Failed to upload payment proof. Please try again."
        );
      } finally {
        setSelectedEnrollmentId(null);
      }
    }
  };

  const getEnrollmentsForType = (type: ActiveTab) => {
    return userEnrollments.filter((enrollment: BackendEnrollment) => {
      // Only show active or pending enrollments
      if (
        enrollment.status !== "active" &&
        enrollment.status !== "pending_payment" &&
        enrollment.status !== "pending_confirmation"
      ) {
        return false;
      }

      const itemInfo = getEnrollmentItemInfo(enrollment);
      if (!itemInfo) return false;

      switch (type) {
        case "in-person":
          return (
            itemInfo.itemType === "course" &&
            (itemInfo.item as any)?.type === "in-person"
          );
        case "online":
          return (
            itemInfo.itemType === "course" &&
            (itemInfo.item as any)?.type === "online"
          );
        default:
          return false;
      }
    });
  };

  const inPersonEnrollments = getEnrollmentsForType("in-person");
  const onlineEnrollments = getEnrollmentsForType("online");

  // Determine which tabs should be visible
  const availableTabs = useMemo(() => {
    const tabs = [];
    if (inPersonEnrollments.length > 0)
      tabs.push({
        key: "in-person" as ActiveTab,
        label: "Modules en Présentiel",
      });
    if (onlineEnrollments.length > 0)
      tabs.push({ key: "online" as ActiveTab, label: "Modules en Ligne" });
    return tabs;
  }, [inPersonEnrollments.length, onlineEnrollments.length]);

  // Auto-select first available tab if current tab has no enrollments
  useEffect(() => {
    if (
      availableTabs.length > 0 &&
      !availableTabs.some((tab) => tab.key === activeTab)
    ) {
      setActiveTab(availableTabs[0].key);
    }
  }, [availableTabs, activeTab]);

  const EnrollmentList: React.FC<{ enrollments: BackendEnrollment[] }> = ({
    enrollments,
  }) => {
    if (enrollments.length === 0) {
      return (
        <p className="text-center text-slate-600 mt-8">
          Vous n'avez aucune inscription dans cette catégorie.
        </p>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {enrollments.map((enrollment) => {
          const itemInfo = getEnrollmentItemInfo(enrollment);
          if (!itemInfo) return null;

          const enrollmentPayments = userPayments.filter(
            (p) => p.enrollment_id === enrollment.id
          );
          const confirmedPaymentsCount = enrollmentPayments.filter(
            (p) => p.status === "confirmed"
          ).length;
          const totalMonths = enrollment.group_data?.durationMonths || 0;
          const progressPercentage =
            totalMonths > 0 ? (confirmedPaymentsCount / totalMonths) * 100 : 0;
          const hasPaidRegistration = userPayments.some(
            (p) => p.status === "confirmed" && p.month === 1
          );
          const showFeeNotice =
            enrollment.status === "pending_payment" && !hasPaidRegistration;

          return (
            <div
              key={enrollment.id}
              className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col transition-shadow hover:shadow-xl"
            >
              <a
                href={`#/${itemInfo.itemType}/${itemInfo.itemId}`}
                onClick={(e) =>
                  handleNav(e, `#/${itemInfo.itemType}/${itemInfo.itemId}`)
                }
                className="block p-4 flex-grow hover:bg-slate-50/50 transition-colors rounded-t-xl"
              >
                <div className="flex flex-row gap-4 items-start">
                  <img
                    src={getCourseImageUrl(
                      (itemInfo.item as any)?.image_url,
                      (itemInfo.item as any)?.slug
                    )}
                    alt={itemInfo.item?.title}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                        {itemInfo.item?.title}
                      </h2>
                      <StatusBadge status={enrollment.status} />
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Enrolled:{" "}
                      {new Date(
                        enrollment.created_at || enrollment.updated_at
                      ).toLocaleDateString()}
                    </p>

                    {(enrollment.status === "active" ||
                      (enrollment.status === "cancelled" &&
                        confirmedPaymentsCount > 0)) &&
                      totalMonths > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-slate-600 mb-1">
                            <span>Progression</span>
                            <span>
                              {confirmedPaymentsCount}/{totalMonths} Payé
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div
                              className={`bg-green-500 h-2.5 rounded-full transition-all duration-500 ${
                                progressPercentage >= 100
                                  ? "w-full"
                                  : progressPercentage >= 75
                                  ? "w-3/4"
                                  : progressPercentage >= 50
                                  ? "w-1/2"
                                  : progressPercentage >= 25
                                  ? "w-1/4"
                                  : progressPercentage > 0
                                  ? "w-1/12"
                                  : "w-0"
                              }`}
                            ></div>
                          </div>
                        </div>
                      )}

                    {enrollment.status === "pending_confirmation" && (
                      <p className="mt-4 text-sm text-blue-600">
                        L'inscription est en attente de confirmation de
                        paiement.
                      </p>
                    )}
                    {enrollment.status === "pending_payment" && (
                      <p className="mt-4 text-sm text-yellow-600">
                        L'inscription est en attente du paiement du premier
                        mois.{" "}
                        {showFeeNotice && (
                          <span className="text-xs italic">
                            (Inclut les frais d'inscription de 250 DH)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </a>

              {enrollment.status !== "cancelled" && (
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3 rounded-b-xl">
                  {enrollment.status === "pending_payment" && (
                    <button
                      onClick={() => handleUploadClick(enrollment.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors"
                    >
                      <PaperclipIcon className="w-4 h-4" />
                      Télécharger Preuve (Mois 1)
                    </button>
                  )}

                  {enrollment.status === "active" && (
                    <a
                      href="#/monthly-payments"
                      onClick={(e) => handleNav(e, "#/monthly-payments")}
                      className="px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors"
                    >
                      Gérer les Paiements Mensuels
                    </a>
                  )}

                  {enrollment.status !== "pending_payment" &&
                    enrollment.status !== "pending_confirmation" && (
                      <button
                        onClick={() => handleCancelEnrollment(enrollment.id)}
                        className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                      >
                        Annuler l'Inscription
                      </button>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const TabButton: React.FC<{ tab: ActiveTab; label: string }> = ({
    tab,
    label,
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 sm:px-6 py-3 text-sm font-semibold transition-colors duration-300 focus:outline-none ${
        activeTab === tab
          ? "border-b-2 border-pistachio-dark text-pistachio-dark"
          : "border-b-2 border-transparent text-slate-500 hover:text-slate-800"
      }`}
      role="tab"
      aria-selected={activeTab === tab}
    >
      {label}
    </button>
  );

  const isLoading = coursesLoading || enrollmentsLoading;

  return (
    <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-12">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 flex-grow">
          Mes Inscriptions
        </h1>
        <RefreshButton
          onRefreshComplete={() => {
            if (authUser) {
              refreshUserData(dispatch, authUser.id);
            }
          }}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pistachio-dark"></div>
          <span className="ml-2 text-slate-600">
            Chargement des données d'inscription...
          </span>
        </div>
      )}

      {!isLoading && availableTabs.length > 0 && (
        <>
          {/* Desktop Tabs - Only show if there are available tabs */}
          <div
            className="mb-10 hidden md:flex justify-center border-b border-slate-200"
            role="tablist"
          >
            {availableTabs.map((tab) => (
              <TabButton key={tab.key} tab={tab.key} label={tab.label} />
            ))}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf"
          />

          {/* Mobile Stacked Layout - Only show sections with enrollments */}
          <div className="md:hidden space-y-12">
            {inPersonEnrollments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center border-b pb-4">
                  Modules en Présentiel
                </h2>
                <EnrollmentList enrollments={inPersonEnrollments} />
              </div>
            )}
            {onlineEnrollments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center border-b pb-4">
                  Modules en Ligne
                </h2>
                <EnrollmentList enrollments={onlineEnrollments} />
              </div>
            )}
          </div>

          {/* Desktop Tab Content */}
          <div className="hidden md:block">
            {activeTab === "in-person" && (
              <EnrollmentList enrollments={inPersonEnrollments} />
            )}
            {activeTab === "online" && (
              <EnrollmentList enrollments={onlineEnrollments} />
            )}
          </div>
        </>
      )}

      {!isLoading && availableTabs.length === 0 && (
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-slate-50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">
              Aucune inscription active
            </h2>
            <p className="text-slate-600 mb-6">
              Vous n'avez aucune inscription active ou en attente pour le
              moment.
            </p>
            <a
              href="#/courses"
              onClick={(e) => handleNav(e, "#/courses")}
              className="inline-block px-6 py-3 bg-pistachio-dark text-white font-semibold rounded-lg hover:bg-lime-900 transition-colors"
            >
              Parcourir les Modules
            </a>
          </div>
        </div>
      )}

      {/* Popup de notification */}
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div
              className={`p-6 rounded-t-xl ${
                popup.type === "success" ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {popup.type === "success" ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                )}
                <h3
                  className={`text-lg font-semibold ${
                    popup.type === "success" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {popup.title}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">{popup.message}</p>
              <button
                onClick={() => setPopup((prev) => ({ ...prev, show: false }))}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  popup.type === "success"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
